-- =====================================================
-- SECURITY FIX: Enable Row Level Security (RLS)
-- =====================================================
-- This migration enables RLS on all public tables and creates
-- appropriate policies to ensure users can only access their own data
--
-- Date: October 23, 2024
-- Issue: Supabase Security Advisor - RLS disabled warnings
-- =====================================================

-- =====================================================
-- TABLE 1: brand_kits
-- =====================================================
-- Purpose: User brand kits for consistent styling
-- Security: Users can only access their own brand kits
-- =====================================================

-- Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.brand_kits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,

  -- Brand colors
  primary_color TEXT,
  secondary_color TEXT,
  accent_color TEXT,

  -- Brand assets
  logo_url TEXT,
  font_family TEXT,

  -- Metadata
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, name)
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_brand_kits_user_id ON public.brand_kits(user_id);

-- Enable RLS
ALTER TABLE public.brand_kits ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own brand kits" ON public.brand_kits;
DROP POLICY IF EXISTS "Users can create own brand kits" ON public.brand_kits;
DROP POLICY IF EXISTS "Users can update own brand kits" ON public.brand_kits;
DROP POLICY IF EXISTS "Users can delete own brand kits" ON public.brand_kits;

-- RLS Policies
CREATE POLICY "Users can view own brand kits"
  ON public.brand_kits
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own brand kits"
  ON public.brand_kits
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own brand kits"
  ON public.brand_kits
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own brand kits"
  ON public.brand_kits
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- TABLE 2: insight_reports
-- =====================================================
-- Purpose: AI-generated insights and reports
-- Security: Users can only access their own reports
-- =====================================================

-- Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.insight_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL, -- 'performance', 'optimization', 'trends'
  title TEXT NOT NULL,

  -- Report data
  data JSONB,
  insights TEXT[],
  recommendations TEXT[],

  -- Metadata
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  viewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_insight_reports_user_id ON public.insight_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_insight_reports_type ON public.insight_reports(user_id, report_type);

-- Enable RLS
ALTER TABLE public.insight_reports ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own insight reports" ON public.insight_reports;
DROP POLICY IF EXISTS "Users can create insight reports" ON public.insight_reports;
DROP POLICY IF EXISTS "Users can update own insight reports" ON public.insight_reports;
DROP POLICY IF EXISTS "Users can delete own insight reports" ON public.insight_reports;

-- RLS Policies
CREATE POLICY "Users can view own insight reports"
  ON public.insight_reports
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create insight reports"
  ON public.insight_reports
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own insight reports"
  ON public.insight_reports
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own insight reports"
  ON public.insight_reports
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- TABLE 3: export_kits
-- =====================================================
-- Purpose: Bulk export configurations for listings
-- Security: Users can only access their own export kits
-- =====================================================

-- Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.export_kits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,

  -- Export configuration
  marketplaces TEXT[], -- ['etsy', 'shopify', 'ebay']
  format TEXT, -- 'csv', 'json', 'xml'
  include_images BOOLEAN DEFAULT true,

  -- Status
  status TEXT DEFAULT 'draft', -- 'draft', 'ready', 'exported'
  exported_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, name)
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_export_kits_user_id ON public.export_kits(user_id);

-- Enable RLS
ALTER TABLE public.export_kits ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own export kits" ON public.export_kits;
DROP POLICY IF EXISTS "Users can create export kits" ON public.export_kits;
DROP POLICY IF EXISTS "Users can update own export kits" ON public.export_kits;
DROP POLICY IF EXISTS "Users can delete own export kits" ON public.export_kits;

-- RLS Policies
CREATE POLICY "Users can view own export kits"
  ON public.export_kits
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create export kits"
  ON public.export_kits
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own export kits"
  ON public.export_kits
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own export kits"
  ON public.export_kits
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- TABLE 4: export_items
-- =====================================================
-- Purpose: Individual items within an export kit
-- Security: Users can only access items from their own export kits
-- =====================================================

-- Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.export_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  export_kit_id UUID NOT NULL REFERENCES public.export_kits(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,

  -- Item data
  title TEXT,
  description TEXT,
  price NUMERIC,
  images TEXT[],

  -- Export status
  exported BOOLEAN DEFAULT false,
  exported_to TEXT[], -- ['etsy', 'shopify']

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_export_items_export_kit ON public.export_items(export_kit_id);
CREATE INDEX IF NOT EXISTS idx_export_items_listing ON public.export_items(listing_id);

-- Enable RLS
ALTER TABLE public.export_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own export items" ON public.export_items;
DROP POLICY IF EXISTS "Users can create export items" ON public.export_items;
DROP POLICY IF EXISTS "Users can update own export items" ON public.export_items;
DROP POLICY IF EXISTS "Users can delete own export items" ON public.export_items;

-- RLS Policies (more complex - check via export_kits ownership)
CREATE POLICY "Users can view own export items"
  ON public.export_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.export_kits
      WHERE export_kits.id = export_items.export_kit_id
        AND export_kits.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create export items"
  ON public.export_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.export_kits
      WHERE export_kits.id = export_items.export_kit_id
        AND export_kits.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own export items"
  ON public.export_items
  FOR UPDATE
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
  ON public.export_items
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.export_kits
      WHERE export_kits.id = export_items.export_kit_id
        AND export_kits.user_id = auth.uid()
    )
  );

-- =====================================================
-- ENSURE templates TABLE HAS RLS (if not already)
-- =====================================================
-- This should already exist from ADD_TEMPLATES_TABLE.sql
-- but we'll ensure it's enabled

ALTER TABLE IF EXISTS public.templates ENABLE ROW LEVEL SECURITY;

-- Verify templates policies exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'templates'
      AND policyname = 'Users can view own templates'
  ) THEN
    CREATE POLICY "Users can view own templates"
      ON public.templates
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'templates'
      AND policyname = 'Users can create own templates'
  ) THEN
    CREATE POLICY "Users can create own templates"
      ON public.templates
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'templates'
      AND policyname = 'Users can update own templates'
  ) THEN
    CREATE POLICY "Users can update own templates"
      ON public.templates
      FOR UPDATE
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
      ON public.templates
      FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- =====================================================
-- TRIGGER: Auto-update updated_at timestamps
-- =====================================================
-- Apply update trigger to new tables

CREATE TRIGGER update_brand_kits_updated_at
  BEFORE UPDATE ON public.brand_kits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_export_kits_updated_at
  BEFORE UPDATE ON public.export_kits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- VERIFICATION
-- =====================================================
-- Check all tables have RLS enabled

DO $$
DECLARE
  v_table TEXT;
  v_rls_enabled BOOLEAN;
  v_policy_count INTEGER;
BEGIN
  RAISE NOTICE '=== RLS SECURITY VERIFICATION ===';

  FOR v_table IN SELECT unnest(ARRAY['brand_kits', 'templates', 'insight_reports', 'export_kits', 'export_items'])
  LOOP
    -- Check if table exists
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = v_table) THEN
      -- Check if RLS is enabled
      SELECT relrowsecurity INTO v_rls_enabled
      FROM pg_class c
      JOIN pg_namespace n ON c.relnamespace = n.oid
      WHERE n.nspname = 'public' AND c.relname = v_table;

      -- Count policies
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
