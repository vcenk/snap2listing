-- ============================================
-- UNIVERSAL FIX: Save to Listings Button
-- ============================================
-- This script works for ANY user (not hardcoded)
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- DIAGNOSTIC: Check Current State
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'DIAGNOSTIC REPORT';
  RAISE NOTICE '========================================';
END $$;

-- Check if listings table exists
SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'listings')
    THEN '✓ listings table exists'
    ELSE '✗ listings table MISSING'
  END as "Listings Table Status";

-- Check if listing_images table exists
SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'listing_images')
    THEN '✓ listing_images table exists'
    ELSE '✗ listing_images table MISSING'
  END as "Listing Images Table Status";

-- Check if listing_channels table exists
SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'listing_channels')
    THEN '✓ listing_channels table exists'
    ELSE '✗ listing_channels table MISSING'
  END as "Listing Channels Table Status";

-- Check users table sync
SELECT
  'Auth Users: ' || COUNT(*)::text as "Total Auth Users"
FROM auth.users;

SELECT
  'Public Users: ' || COUNT(*)::text as "Total Public Users"
FROM public.users;

-- Check for users in auth but not in public
SELECT
  'Missing Users: ' || COUNT(*)::text as "Users Not Synced"
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- ============================================
-- FIX STEP 1: Create Missing Tables
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'STEP 1: Creating Missing Tables';
  RAISE NOTICE '========================================';
END $$;

-- Create listings table if not exists
CREATE TABLE IF NOT EXISTS public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'draft',
  base_data JSONB NOT NULL DEFAULT '{}',
  seo_score INTEGER DEFAULT 0,
  last_step TEXT DEFAULT 'upload',
  last_channel_tab TEXT,
  scroll_position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create listing_images table if not exists
CREATE TABLE IF NOT EXISTS public.listing_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  position INTEGER NOT NULL,
  is_main BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create listing_channels table if not exists
CREATE TABLE IF NOT EXISTS public.listing_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  override_data JSONB NOT NULL DEFAULT '{}',
  validation_state JSONB NOT NULL DEFAULT '{}',
  readiness_score INTEGER DEFAULT 0,
  is_ready BOOLEAN DEFAULT FALSE,
  exported_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(listing_id, channel_id)
);

-- ============================================
-- FIX STEP 2: Sync All Auth Users to Public Users
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'STEP 2: Syncing Auth Users to Public Users';
  RAISE NOTICE '========================================';
END $$;

-- Insert all auth users into public users (if they don't exist)
INSERT INTO public.users (
  id,
  email,
  name,
  plan_id,
  subscription_status,
  credits_used,
  credits_limit,
  account_created_at
)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'name', au.email) as name,
  'free' as plan_id,
  'active' as subscription_status,
  0 as credits_used,
  15 as credits_limit,
  au.created_at as account_created_at
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  updated_at = NOW();

-- ============================================
-- FIX STEP 3: Enable RLS and Create Policies
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'STEP 3: Setting Up Row Level Security';
  RAISE NOTICE '========================================';
END $$;

-- Enable RLS on all tables
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_channels ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies (clean slate)
DROP POLICY IF EXISTS "Users can view own listings" ON public.listings;
DROP POLICY IF EXISTS "Users can create own listings" ON public.listings;
DROP POLICY IF EXISTS "Users can update own listings" ON public.listings;
DROP POLICY IF EXISTS "Users can delete own listings" ON public.listings;
DROP POLICY IF EXISTS "Service role full access to listings" ON public.listings;

DROP POLICY IF EXISTS "listing_images_select_own" ON public.listing_images;
DROP POLICY IF EXISTS "listing_images_insert_own" ON public.listing_images;
DROP POLICY IF EXISTS "listing_images_delete_own" ON public.listing_images;
DROP POLICY IF EXISTS "Service role full access to listing_images" ON public.listing_images;

DROP POLICY IF EXISTS "listing_channels_select_own" ON public.listing_channels;
DROP POLICY IF EXISTS "listing_channels_insert_own" ON public.listing_channels;
DROP POLICY IF EXISTS "listing_channels_update_own" ON public.listing_channels;
DROP POLICY IF EXISTS "listing_channels_delete_own" ON public.listing_channels;
DROP POLICY IF EXISTS "Service role full access to listing_channels" ON public.listing_channels;

-- Create policies for listings table
CREATE POLICY "Users can view own listings"
  ON public.listings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own listings"
  ON public.listings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own listings"
  ON public.listings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own listings"
  ON public.listings FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to listings"
  ON public.listings FOR ALL
  USING (auth.role() = 'service_role');

-- Create policies for listing_images table
CREATE POLICY "listing_images_select_own" ON public.listing_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE listings.id = listing_images.listing_id
      AND listings.user_id = auth.uid()
    )
  );

CREATE POLICY "listing_images_insert_own" ON public.listing_images
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE listings.id = listing_images.listing_id
      AND listings.user_id = auth.uid()
    )
  );

CREATE POLICY "listing_images_delete_own" ON public.listing_images
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE listings.id = listing_images.listing_id
      AND listings.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role full access to listing_images"
  ON public.listing_images FOR ALL
  USING (auth.role() = 'service_role');

-- Create policies for listing_channels table
CREATE POLICY "listing_channels_select_own" ON public.listing_channels
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE listings.id = listing_channels.listing_id
      AND listings.user_id = auth.uid()
    )
  );

CREATE POLICY "listing_channels_insert_own" ON public.listing_channels
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE listings.id = listing_channels.listing_id
      AND listings.user_id = auth.uid()
    )
  );

CREATE POLICY "listing_channels_update_own" ON public.listing_channels
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE listings.id = listing_channels.listing_id
      AND listings.user_id = auth.uid()
    )
  );

CREATE POLICY "listing_channels_delete_own" ON public.listing_channels
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE listings.id = listing_channels.listing_id
      AND listings.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role full access to listing_channels"
  ON public.listing_channels FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- FIX STEP 4: Create Performance Indexes
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'STEP 4: Creating Performance Indexes';
  RAISE NOTICE '========================================';
END $$;

CREATE INDEX IF NOT EXISTS idx_listings_user_id ON public.listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON public.listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listing_images_listing_id ON public.listing_images(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_channels_listing_id ON public.listing_channels(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_channels_channel_id ON public.listing_channels(channel_id);

-- ============================================
-- VERIFICATION: Confirm Everything is Fixed
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'VERIFICATION REPORT';
  RAISE NOTICE '========================================';
END $$;

-- Verify tables exist
SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'listings')
      AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'listing_images')
      AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'listing_channels')
    THEN '✅ All tables created successfully'
    ELSE '❌ Some tables are still missing'
  END as "Tables Status";

-- Verify user sync
SELECT
  CASE
    WHEN NOT EXISTS (
      SELECT 1 FROM auth.users au
      LEFT JOIN public.users pu ON au.id = pu.id
      WHERE pu.id IS NULL
    )
    THEN '✅ All auth users synced to public users'
    ELSE '❌ Some users still not synced'
  END as "User Sync Status";

-- Count RLS policies
SELECT
  tablename as "Table",
  COUNT(*) as "Policy Count"
FROM pg_policies
WHERE tablename IN ('listings', 'listing_images', 'listing_channels')
GROUP BY tablename
ORDER BY tablename;

-- Final success message
SELECT '🎉 DATABASE FIX COMPLETE! Your "Save to Listing" button should now work.' as "Status";
SELECT '👉 Please refresh your application and try saving a listing.' as "Next Step";
