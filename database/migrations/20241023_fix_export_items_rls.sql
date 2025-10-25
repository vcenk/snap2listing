-- =====================================================
-- SECURITY FIX: Enable RLS on export_items table
-- =====================================================
-- This migration enables RLS on the export_items table
-- and creates policies that check ownership through export_kits
--
-- Date: October 23, 2024
-- =====================================================

-- =====================================================
-- Step 1: Enable RLS on export_items
-- =====================================================
ALTER TABLE public.export_items ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Step 2: Drop existing policies if any
-- =====================================================
DROP POLICY IF EXISTS "Users can view own export items" ON public.export_items;
DROP POLICY IF EXISTS "Users can create own export items" ON public.export_items;
DROP POLICY IF EXISTS "Users can update own export items" ON public.export_items;
DROP POLICY IF EXISTS "Users can delete own export items" ON public.export_items;

-- =====================================================
-- Step 3: Create RLS policies for export_items
-- =====================================================
-- These policies check ownership through the export_kits table

-- SELECT policy: Users can view export items from their own export kits
CREATE POLICY "Users can view own export items"
ON public.export_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.export_kits
    WHERE export_kits.id = export_items.export_kit_id
      AND export_kits.user_id = auth.uid()
  )
);

-- INSERT policy: Users can add items to their own export kits
CREATE POLICY "Users can create own export items"
ON public.export_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.export_kits
    WHERE export_kits.id = export_items.export_kit_id
      AND export_kits.user_id = auth.uid()
  )
);

-- UPDATE policy: Users can update items in their own export kits
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

-- DELETE policy: Users can delete items from their own export kits
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
-- Step 4: Verify RLS is enabled
-- =====================================================
DO $$
DECLARE
  v_rls_enabled BOOLEAN;
  v_policy_count INTEGER;
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

  RAISE NOTICE '=== export_items RLS VERIFICATION ===';
  RAISE NOTICE 'RLS Enabled: %', CASE WHEN v_rls_enabled THEN 'YES' ELSE 'NO' END;
  RAISE NOTICE 'Number of Policies: %', v_policy_count;
  RAISE NOTICE '';

  IF v_rls_enabled AND v_policy_count >= 4 THEN
    RAISE NOTICE 'SUCCESS: export_items table is properly secured!';
  ELSE
    RAISE NOTICE 'WARNING: RLS might not be fully configured';
  END IF;

  RAISE NOTICE '=== END VERIFICATION ===';
END $$;
