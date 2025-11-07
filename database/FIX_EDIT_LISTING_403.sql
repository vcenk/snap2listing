-- ============================================
-- FIX: Edit Listing 403 Forbidden Error
-- ============================================
-- This script fixes RLS policies that prevent editing saved listings
-- The issue: Service role (admin) should bypass RLS but policies are blocking it
--
-- Run this in Supabase SQL Editor
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'FIX: Edit Listing 403 Error';
  RAISE NOTICE '========================================';
END $$;

-- ============================================
-- Step 1: Update Service Role Policy for Listings
-- ============================================

DROP POLICY IF EXISTS "Service role full access to listings" ON public.listings;

CREATE POLICY "Service role full access to listings"
  ON public.listings FOR ALL
  TO service_role
  USING (true)  -- Service role can access all rows
  WITH CHECK (true);  -- Service role can modify all rows

-- ============================================
-- Step 2: Ensure User Policies Allow Edit Access
-- ============================================

-- Drop and recreate user policies with correct permissions

DROP POLICY IF EXISTS "Users can view own listings" ON public.listings;
DROP POLICY IF EXISTS "Users can create own listings" ON public.listings;
DROP POLICY IF EXISTS "Users can update own listings" ON public.listings;
DROP POLICY IF EXISTS "Users can delete own listings" ON public.listings;

-- Users can view their own listings
CREATE POLICY "Users can view own listings"
  ON public.listings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can create listings for themselves
CREATE POLICY "Users can create own listings"
  ON public.listings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own listings
CREATE POLICY "Users can update own listings"
  ON public.listings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own listings
CREATE POLICY "Users can delete own listings"
  ON public.listings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- Step 3: Update Service Role Policy for Related Tables
-- ============================================

-- Listing Images
DROP POLICY IF EXISTS "Service role full access to listing_images" ON public.listing_images;

CREATE POLICY "Service role full access to listing_images"
  ON public.listing_images FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Listing Channels
DROP POLICY IF EXISTS "Service role full access to listing_channels" ON public.listing_channels;

CREATE POLICY "Service role full access to listing_channels"
  ON public.listing_channels FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- Step 4: Grant Necessary Permissions
-- ============================================

-- Ensure service_role has all necessary grants
GRANT ALL ON public.listings TO service_role;
GRANT ALL ON public.listing_images TO service_role;
GRANT ALL ON public.listing_channels TO service_role;
GRANT USAGE ON SCHEMA public TO service_role;

-- ============================================
-- Step 5: Verify Policies
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'VERIFICATION';
  RAISE NOTICE '========================================';
END $$;

-- Count policies on listings table
SELECT
  'Listings Table Policies' as check_name,
  COUNT(*)::text || ' policies configured' as status
FROM pg_policies
WHERE tablename = 'listings';

-- Show all policies on listings table
SELECT
  policyname as "Policy Name",
  cmd as "Command",
  roles::text[] as "Roles",
  CASE
    WHEN policyname LIKE '%service_role%' THEN '✅ Service Role'
    WHEN policyname LIKE '%own%' THEN '✅ User Access'
    ELSE '⚠️ Other'
  END as "Type"
FROM pg_policies
WHERE tablename = 'listings'
ORDER BY policyname;

-- ============================================
-- Step 6: Test Query (Diagnostic)
-- ============================================

-- This simulates what the API does
-- Replace 'YOUR_USER_ID' with an actual user ID to test

SELECT
  '🧪 Test Query' as check_name,
  'Run the following to test access:' as instruction;

-- Example test (commented out - replace USER_ID with real value):
-- SELECT id, user_id, status, base_data->>'title' as title
-- FROM public.listings
-- WHERE user_id = 'YOUR_USER_ID'
-- LIMIT 5;

-- ============================================
-- Success Message
-- ============================================

SELECT '✅ RLS policies updated! Edit listing 403 error should be fixed.' as message;
SELECT '👉 Test by trying to edit a saved listing in your app.' as next_step;
SELECT '📊 If 403 persists, check that supabaseAdmin is using SUPABASE_SERVICE_ROLE_KEY.' as troubleshooting;
