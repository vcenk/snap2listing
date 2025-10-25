-- =====================================================
-- SECURITY FIX: Enable RLS on Existing Tables ONLY
-- =====================================================
-- This migration ONLY enables RLS on tables that already exist
-- It does NOT create new tables or modify existing structures
--
-- Date: October 23, 2024
-- Use this if your tables already exist with different structures
-- =====================================================

-- =====================================================
-- Enable RLS on ALL existing public tables
-- =====================================================

DO $$
DECLARE
  v_table TEXT;
BEGIN
  -- Get all tables that have a user_id column (indicating user-owned data)
  FOR v_table IN
    SELECT tablename
    FROM pg_tables t
    WHERE schemaname = 'public'
      AND EXISTS (
        SELECT 1
        FROM information_schema.columns c
        WHERE c.table_schema = 'public'
          AND c.table_name = t.tablename
          AND c.column_name = 'user_id'
      )
  LOOP
    -- Enable RLS
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', v_table);
    RAISE NOTICE 'Enabled RLS on table: %', v_table;
  END LOOP;
END $$;

-- =====================================================
-- Create RLS policies for common tables
-- =====================================================
-- These policies will work if the table has a user_id column

-- Helper function to create standard policies
CREATE OR REPLACE FUNCTION create_standard_rls_policies(table_name TEXT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  -- Drop existing policies
  EXECUTE format('DROP POLICY IF EXISTS "Users can view own %s" ON public.%I', table_name, table_name);
  EXECUTE format('DROP POLICY IF EXISTS "Users can create own %s" ON public.%I', table_name, table_name);
  EXECUTE format('DROP POLICY IF EXISTS "Users can update own %s" ON public.%I', table_name, table_name);
  EXECUTE format('DROP POLICY IF EXISTS "Users can delete own %s" ON public.%I', table_name, table_name);

  -- Create SELECT policy
  EXECUTE format('
    CREATE POLICY "Users can view own %s"
    ON public.%I FOR SELECT
    USING (auth.uid() = user_id)
  ', table_name, table_name);

  -- Create INSERT policy
  EXECUTE format('
    CREATE POLICY "Users can create own %s"
    ON public.%I FOR INSERT
    WITH CHECK (auth.uid() = user_id)
  ', table_name, table_name);

  -- Create UPDATE policy
  EXECUTE format('
    CREATE POLICY "Users can update own %s"
    ON public.%I FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id)
  ', table_name, table_name);

  -- Create DELETE policy
  EXECUTE format('
    CREATE POLICY "Users can delete own %s"
    ON public.%I FOR DELETE
    USING (auth.uid() = user_id)
  ', table_name, table_name);

  RAISE NOTICE 'Created policies for table: %', table_name;
END;
$$;

-- =====================================================
-- Apply policies to known tables (if they exist)
-- =====================================================

DO $$
DECLARE
  v_table TEXT;
  v_tables TEXT[] := ARRAY[
    'users',
    'listings',
    'templates',
    'brand_kits',
    'insight_reports',
    'export_kits',
    'export_items'
  ];
BEGIN
  FOREACH v_table IN ARRAY v_tables
  LOOP
    -- Check if table exists and has user_id column
    IF EXISTS (
      SELECT 1
      FROM information_schema.tables t
      JOIN information_schema.columns c
        ON t.table_name = c.table_name
        AND t.table_schema = c.table_schema
      WHERE t.table_schema = 'public'
        AND t.table_name = v_table
        AND c.column_name = 'user_id'
    ) THEN
      PERFORM create_standard_rls_policies(v_table);
    ELSE
      RAISE NOTICE 'Skipping table (does not exist or has no user_id): %', v_table;
    END IF;
  END LOOP;
END $$;

-- =====================================================
-- Special case: export_items (if it exists)
-- =====================================================
-- This table might reference export_kits, so needs special handling

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'export_items'
  ) THEN
    -- Check if it has export_kit_id or kit_id or similar
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'export_items'
        AND column_name LIKE '%kit%'
    ) THEN
      -- Has a kit reference column, skip for now
      RAISE NOTICE 'Table export_items exists but has complex structure - skipping custom policies';
    ELSIF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'export_items'
        AND column_name = 'user_id'
    ) THEN
      -- Has user_id directly, use standard policies
      PERFORM create_standard_rls_policies('export_items');
    END IF;
  END IF;
END $$;

-- =====================================================
-- Clean up helper function
-- =====================================================
DROP FUNCTION IF EXISTS create_standard_rls_policies(TEXT);

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
DECLARE
  v_table RECORD;
BEGIN
  RAISE NOTICE '=== RLS SECURITY VERIFICATION ===';
  RAISE NOTICE '';

  FOR v_table IN
    SELECT
      t.tablename,
      c.relrowsecurity AS rls_enabled,
      COUNT(p.policyname) AS policy_count
    FROM pg_tables t
    JOIN pg_class c ON c.relname = t.tablename
    JOIN pg_namespace n ON c.relnamespace = n.oid AND n.nspname = t.schemaname
    LEFT JOIN pg_policies p ON p.schemaname = t.schemaname AND p.tablename = t.tablename
    WHERE t.schemaname = 'public'
      AND EXISTS (
        SELECT 1 FROM information_schema.columns col
        WHERE col.table_schema = 'public'
          AND col.table_name = t.tablename
          AND col.column_name = 'user_id'
      )
    GROUP BY t.tablename, c.relrowsecurity
    ORDER BY t.tablename
  LOOP
    RAISE NOTICE 'Table: % | RLS: % | Policies: %',
      v_table.tablename,
      CASE WHEN v_table.rls_enabled THEN '✓ ENABLED' ELSE '✗ DISABLED' END,
      v_table.policy_count;
  END LOOP;

  RAISE NOTICE '';
  RAISE NOTICE '=== END VERIFICATION ===';
END $$;
