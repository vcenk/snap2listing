-- =====================================================
-- SECURITY FIX: Enable RLS on export_items table (SAFE)
-- =====================================================
-- This migration safely enables RLS on export_items
-- by first checking what columns actually exist
--
-- Date: October 23, 2024
-- =====================================================

-- =====================================================
-- Step 1: Check if export_items table exists
-- =====================================================
DO $$
DECLARE
  v_table_exists BOOLEAN;
  v_has_export_kit_id BOOLEAN;
  v_has_kit_id BOOLEAN;
  v_has_user_id BOOLEAN;
  v_column_list TEXT;
BEGIN
  -- Check if table exists
  SELECT EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'export_items'
  ) INTO v_table_exists;

  IF NOT v_table_exists THEN
    RAISE NOTICE 'Table export_items does not exist - skipping';
    RETURN;
  END IF;

  -- Get list of columns
  SELECT string_agg(column_name, ', ' ORDER BY ordinal_position)
  INTO v_column_list
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'export_items';

  RAISE NOTICE 'export_items table found with columns: %', v_column_list;

  -- Check which foreign key column exists
  SELECT
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'export_items' AND column_name = 'export_kit_id'),
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'export_items' AND column_name = 'kit_id'),
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'export_items' AND column_name = 'user_id')
  INTO v_has_export_kit_id, v_has_kit_id, v_has_user_id;

  -- Report findings
  RAISE NOTICE 'has export_kit_id: %', v_has_export_kit_id;
  RAISE NOTICE 'has kit_id: %', v_has_kit_id;
  RAISE NOTICE 'has user_id: %', v_has_user_id;
END $$;

-- =====================================================
-- Step 2: Enable RLS on export_items
-- =====================================================
ALTER TABLE public.export_items ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Step 3: Drop existing policies if any
-- =====================================================
DROP POLICY IF EXISTS "Users can view own export items" ON public.export_items;
DROP POLICY IF EXISTS "Users can create own export items" ON public.export_items;
DROP POLICY IF EXISTS "Users can update own export items" ON public.export_items;
DROP POLICY IF EXISTS "Users can delete own export items" ON public.export_items;

-- =====================================================
-- Step 4: Create RLS policies based on table structure
-- =====================================================
DO $$
DECLARE
  v_has_export_kit_id BOOLEAN;
  v_has_kit_id BOOLEAN;
  v_has_user_id BOOLEAN;
  v_fk_column TEXT;
BEGIN
  -- Check which columns exist
  SELECT
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'export_items' AND column_name = 'export_kit_id'),
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'export_items' AND column_name = 'kit_id'),
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'export_items' AND column_name = 'user_id')
  INTO v_has_export_kit_id, v_has_kit_id, v_has_user_id;

  -- Determine which approach to use
  IF v_has_user_id THEN
    -- Simple case: table has user_id directly
    RAISE NOTICE 'Creating policies using user_id column';

    CREATE POLICY "Users can view own export items"
    ON public.export_items FOR SELECT
    USING (auth.uid() = user_id);

    CREATE POLICY "Users can create own export items"
    ON public.export_items FOR INSERT
    WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update own export items"
    ON public.export_items FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can delete own export items"
    ON public.export_items FOR DELETE
    USING (auth.uid() = user_id);

  ELSIF v_has_export_kit_id THEN
    -- Table has export_kit_id - check through export_kits
    RAISE NOTICE 'Creating policies using export_kit_id column';

    CREATE POLICY "Users can view own export items"
    ON public.export_items FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.export_kits
        WHERE export_kits.id = export_items.export_kit_id
          AND export_kits.user_id = auth.uid()
      )
    );

    CREATE POLICY "Users can create own export items"
    ON public.export_items FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.export_kits
        WHERE export_kits.id = export_items.export_kit_id
          AND export_kits.user_id = auth.uid()
      )
    );

    CREATE POLICY "Users can update own export items"
    ON public.export_items FOR UPDATE
    USING (
      EXISTS (
        SELECT 1 FROM public.export_kits
        WHERE export_kits.id = export_items.export_kit_id
          AND export_kits.user_id = auth.uid()
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.export_kits
        WHERE export_kits.id = export_items.export_kit_id
          AND export_kits.user_id = auth.uid()
      )
    );

    CREATE POLICY "Users can delete own export items"
    ON public.export_items FOR DELETE
    USING (
      EXISTS (
        SELECT 1 FROM public.export_kits
        WHERE export_kits.id = export_items.export_kit_id
          AND export_kits.user_id = auth.uid()
      )
    );

  ELSIF v_has_kit_id THEN
    -- Table has kit_id instead of export_kit_id
    RAISE NOTICE 'Creating policies using kit_id column';

    CREATE POLICY "Users can view own export items"
    ON public.export_items FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.export_kits
        WHERE export_kits.id = export_items.kit_id
          AND export_kits.user_id = auth.uid()
      )
    );

    CREATE POLICY "Users can create own export items"
    ON public.export_items FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.export_kits
        WHERE export_kits.id = export_items.kit_id
          AND export_kits.user_id = auth.uid()
      )
    );

    CREATE POLICY "Users can update own export items"
    ON public.export_items FOR UPDATE
    USING (
      EXISTS (
        SELECT 1 FROM public.export_kits
        WHERE export_kits.id = export_items.kit_id
          AND export_kits.user_id = auth.uid()
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.export_kits
        WHERE export_kits.id = export_items.kit_id
          AND export_kits.user_id = auth.uid()
      )
    );

    CREATE POLICY "Users can delete own export items"
    ON public.export_items FOR DELETE
    USING (
      EXISTS (
        SELECT 1 FROM public.export_kits
        WHERE export_kits.id = export_items.kit_id
          AND export_kits.user_id = auth.uid()
      )
    );

  ELSE
    RAISE EXCEPTION 'Cannot determine ownership column for export_items table';
  END IF;

  RAISE NOTICE 'Policies created successfully';
END $$;

-- =====================================================
-- Step 5: Verify RLS is enabled
-- =====================================================
DO $$
DECLARE
  v_rls_enabled BOOLEAN;
  v_policy_count INTEGER;
  v_columns TEXT;
BEGIN
  -- Check if RLS is enabled
  SELECT c.relrowsecurity INTO v_rls_enabled
  FROM pg_class c
  JOIN pg_namespace n ON c.relnamespace = n.oid
  WHERE n.nspname = 'public'
    AND c.relname = 'export_items';

  -- Count policies
  SELECT COUNT(*) INTO v_policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename = 'export_items';

  -- Get column list
  SELECT string_agg(column_name, ', ' ORDER BY ordinal_position)
  INTO v_columns
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'export_items';

  RAISE NOTICE '=== export_items RLS VERIFICATION ===';
  RAISE NOTICE 'Table columns: %', v_columns;
  RAISE NOTICE 'RLS Enabled: %', CASE WHEN v_rls_enabled THEN 'YES' ELSE 'NO' END;
  RAISE NOTICE 'Number of Policies: %', v_policy_count;
  RAISE NOTICE '';

  IF v_rls_enabled AND v_policy_count >= 4 THEN
    RAISE NOTICE 'SUCCESS: export_items table is properly secured!';
  ELSE
    RAISE NOTICE 'WARNING: RLS might not be fully configured';
    RAISE NOTICE 'RLS enabled: %, Policies: %', v_rls_enabled, v_policy_count;
  END IF;

  RAISE NOTICE '=== END VERIFICATION ===';
END $$;
