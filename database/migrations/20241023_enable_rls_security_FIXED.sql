-- =====================================================
-- SECURITY FIX: Enable Row Level Security (RLS) - FIXED VERSION
-- =====================================================
-- This migration enables RLS on all public tables and creates
-- appropriate policies to ensure users can only access their own data
--
-- Date: October 23, 2024
-- Issue: Supabase Security Advisor - RLS disabled warnings
-- FIXED: Handles existing table structures correctly
-- =====================================================

-- =====================================================
-- TABLE 1: brand_kits
-- =====================================================

-- Only create table if it truly doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'brand_kits') THEN
    CREATE TABLE public.brand_kits (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT,
      primary_color TEXT,
      secondary_color TEXT,
      accent_color TEXT,
      logo_url TEXT,
      font_family TEXT,
      is_default BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, name)
    );

    CREATE INDEX idx_brand_kits_user_id ON public.brand_kits(user_id);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE public.brand_kits ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies
DROP POLICY IF EXISTS "Users can view own brand kits" ON public.brand_kits;
DROP POLICY IF EXISTS "Users can create own brand kits" ON public.brand_kits;
DROP POLICY IF EXISTS "Users can update own brand kits" ON public.brand_kits;
DROP POLICY IF EXISTS "Users can delete own brand kits" ON public.brand_kits;

CREATE POLICY "Users can view own brand kits"
  ON public.brand_kits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own brand kits"
  ON public.brand_kits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own brand kits"
  ON public.brand_kits FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own brand kits"
  ON public.brand_kits FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- TABLE 2: insight_reports
-- =====================================================

-- Only create if doesn't exist, and only enable RLS if it does exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'insight_reports') THEN
    CREATE TABLE public.insight_reports (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      data JSONB,
      insights TEXT[],
      recommendations TEXT[],
      generated_at TIMESTAMPTZ DEFAULT NOW(),
      viewed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX idx_insight_reports_user_id ON public.insight_reports(user_id);
  END IF;

  -- Enable RLS regardless (table might exist from elsewhere)
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'insight_reports') THEN
    ALTER TABLE public.insight_reports ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop and recreate policies (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'insight_reports') THEN
    DROP POLICY IF EXISTS "Users can view own insight reports" ON public.insight_reports;
    DROP POLICY IF EXISTS "Users can create insight reports" ON public.insight_reports;
    DROP POLICY IF EXISTS "Users can update own insight reports" ON public.insight_reports;
    DROP POLICY IF EXISTS "Users can delete own insight reports" ON public.insight_reports;

    CREATE POLICY "Users can view own insight reports"
      ON public.insight_reports FOR SELECT
      USING (auth.uid() = user_id);

    CREATE POLICY "Users can create insight reports"
      ON public.insight_reports FOR INSERT
      WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update own insight reports"
      ON public.insight_reports FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can delete own insight reports"
      ON public.insight_reports FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- =====================================================
-- TABLE 3: export_kits
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'export_kits') THEN
    CREATE TABLE public.export_kits (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT,
      marketplaces TEXT[],
      format TEXT,
      include_images BOOLEAN DEFAULT true,
      status TEXT DEFAULT 'draft',
      exported_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, name)
    );

    CREATE INDEX idx_export_kits_user_id ON public.export_kits(user_id);
  END IF;
END $$;

ALTER TABLE public.export_kits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own export kits" ON public.export_kits;
DROP POLICY IF EXISTS "Users can create export kits" ON public.export_kits;
DROP POLICY IF EXISTS "Users can update own export kits" ON public.export_kits;
DROP POLICY IF EXISTS "Users can delete own export kits" ON public.export_kits;

CREATE POLICY "Users can view own export kits"
  ON public.export_kits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create export kits"
  ON public.export_kits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own export kits"
  ON public.export_kits FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own export kits"
  ON public.export_kits FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- TABLE 4: export_items
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'export_items') THEN
    CREATE TABLE public.export_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      export_kit_id UUID NOT NULL REFERENCES public.export_kits(id) ON DELETE CASCADE,
      listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
      title TEXT,
      description TEXT,
      price NUMERIC,
      images TEXT[],
      exported BOOLEAN DEFAULT false,
      exported_to TEXT[],
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX idx_export_items_export_kit ON public.export_items(export_kit_id);
    CREATE INDEX idx_export_items_listing ON public.export_items(listing_id);
  END IF;
END $$;

ALTER TABLE public.export_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own export items" ON public.export_items;
DROP POLICY IF EXISTS "Users can create export items" ON public.export_items;
DROP POLICY IF EXISTS "Users can update own export items" ON public.export_items;
DROP POLICY IF EXISTS "Users can delete own export items" ON public.export_items;

CREATE POLICY "Users can view own export items"
  ON public.export_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.export_kits
      WHERE export_kits.id = export_items.export_kit_id
        AND export_kits.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create export items"
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

-- =====================================================
-- TABLE 5: templates (Ensure RLS is enabled)
-- =====================================================

-- Enable RLS if table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'templates') THEN
    ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

    -- Create policies if they don't exist
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'templates'
        AND policyname = 'Users can view own templates'
    ) THEN
      CREATE POLICY "Users can view own templates"
        ON public.templates FOR SELECT
        USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'templates'
        AND policyname = 'Users can create own templates'
    ) THEN
      CREATE POLICY "Users can create own templates"
        ON public.templates FOR INSERT
        WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'templates'
        AND policyname = 'Users can update own templates'
    ) THEN
      CREATE POLICY "Users can update own templates"
        ON public.templates FOR UPDATE
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'templates'
        AND policyname = 'Users can delete own templates'
    ) THEN
      CREATE POLICY "Users can delete own templates"
        ON public.templates FOR DELETE
        USING (auth.uid() = user_id);
    END IF;
  END IF;
END $$;

-- =====================================================
-- TRIGGERS: Auto-update updated_at timestamps
-- =====================================================

-- Only create triggers if tables exist and triggers don't exist
DO $$
BEGIN
  -- brand_kits trigger
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'brand_kits') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger
      WHERE tgname = 'update_brand_kits_updated_at'
    ) THEN
      CREATE TRIGGER update_brand_kits_updated_at
        BEFORE UPDATE ON public.brand_kits
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
  END IF;

  -- export_kits trigger
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'export_kits') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger
      WHERE tgname = 'update_export_kits_updated_at'
    ) THEN
      CREATE TRIGGER update_export_kits_updated_at
        BEFORE UPDATE ON public.export_kits
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
  END IF;
END $$;

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
DECLARE
  v_table TEXT;
  v_rls_enabled BOOLEAN;
  v_policy_count INTEGER;
BEGIN
  RAISE NOTICE '=== RLS SECURITY VERIFICATION ===';

  FOR v_table IN SELECT unnest(ARRAY['brand_kits', 'templates', 'insight_reports', 'export_kits', 'export_items'])
  LOOP
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = v_table) THEN
      SELECT relrowsecurity INTO v_rls_enabled
      FROM pg_class c
      JOIN pg_namespace n ON c.relnamespace = n.oid
      WHERE n.nspname = 'public' AND c.relname = v_table;

      SELECT COUNT(*) INTO v_policy_count
      FROM pg_policies
      WHERE schemaname = 'public' AND tablename = v_table;

      RAISE NOTICE 'Table: % | RLS: % | Policies: %',
        v_table,
        CASE WHEN v_rls_enabled THEN '✓ ENABLED' ELSE '✗ DISABLED' END,
        v_policy_count;
    ELSE
      RAISE NOTICE 'Table: % | Status: ⚠ NOT CREATED YET', v_table;
    END IF;
  END LOOP;

  RAISE NOTICE '=== END VERIFICATION ===';
END $$;
