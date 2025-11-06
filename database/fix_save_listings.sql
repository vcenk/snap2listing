-- ============================================
-- FIX: Save to Listings Button Not Working
-- ============================================
-- This script fixes all issues preventing save from working:
-- 1. Creates missing user record
-- 2. Ensures all necessary tables exist
-- 3. Sets up proper RLS policies
--
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- STEP 1: Fix Missing User Record
-- ============================================

-- Delete old user record with same email but different ID
DELETE FROM public.users
WHERE email IN (
  SELECT email
  FROM auth.users
  WHERE id = 'b1268f57-7765-434d-8a16-5a63111575ff'
)
AND id != 'b1268f57-7765-434d-8a16-5a63111575ff';

-- Create the user record for current auth user
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
  id,
  email,
  COALESCE(raw_user_meta_data->>'name', email) as name,
  'free' as plan_id,
  'active' as subscription_status,
  0 as credits_used,
  15 as credits_limit,
  created_at as account_created_at
FROM auth.users
WHERE id = 'b1268f57-7765-434d-8a16-5a63111575ff'
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  updated_at = NOW();

-- ============================================
-- STEP 2: Ensure Listings Table Exists
-- ============================================

CREATE TABLE IF NOT EXISTS public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'draft', -- draft, optimized, completed
  base_data JSONB NOT NULL DEFAULT '{}',
  seo_score INTEGER DEFAULT 0,
  last_step TEXT DEFAULT 'upload',
  last_channel_tab TEXT,
  scroll_position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own listings" ON public.listings;
DROP POLICY IF EXISTS "Users can create own listings" ON public.listings;
DROP POLICY IF EXISTS "Users can update own listings" ON public.listings;
DROP POLICY IF EXISTS "Users can delete own listings" ON public.listings;
DROP POLICY IF EXISTS "Service role full access to listings" ON public.listings;

-- Create RLS policies
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

-- Service role policy (for server-side operations)
CREATE POLICY "Service role full access to listings"
  ON public.listings FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- STEP 3: Ensure Listing Images Table Exists
-- ============================================

CREATE TABLE IF NOT EXISTS public.listing_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  position INTEGER NOT NULL,
  is_main BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.listing_images ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "listing_images_select_own" ON public.listing_images;
DROP POLICY IF EXISTS "listing_images_insert_own" ON public.listing_images;
DROP POLICY IF EXISTS "listing_images_delete_own" ON public.listing_images;
DROP POLICY IF EXISTS "Service role full access to listing_images" ON public.listing_images;

-- Create RLS policies
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

-- ============================================
-- STEP 4: Ensure Listing Channels Table Exists
-- ============================================

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

-- Enable RLS
ALTER TABLE public.listing_channels ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "listing_channels_select_own" ON public.listing_channels;
DROP POLICY IF EXISTS "listing_channels_insert_own" ON public.listing_channels;
DROP POLICY IF EXISTS "listing_channels_update_own" ON public.listing_channels;
DROP POLICY IF EXISTS "listing_channels_delete_own" ON public.listing_channels;
DROP POLICY IF EXISTS "Service role full access to listing_channels" ON public.listing_channels;

-- Create RLS policies
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
-- STEP 5: Create Indexes for Performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_listings_user_id ON public.listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON public.listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listing_images_listing_id ON public.listing_images(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_channels_listing_id ON public.listing_channels(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_channels_channel_id ON public.listing_channels(channel_id);

-- ============================================
-- STEP 6: Verify Setup
-- ============================================

-- Check user exists
SELECT
  'User Record' as check_name,
  CASE
    WHEN EXISTS (SELECT 1 FROM public.users WHERE id = 'b1268f57-7765-434d-8a16-5a63111575ff')
    THEN '✓ User record exists'
    ELSE '✗ User record missing!'
  END as status;

-- Check tables exist
SELECT
  'Tables' as check_name,
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'listings')
      AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'listing_images')
      AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'listing_channels')
    THEN '✓ All tables exist'
    ELSE '✗ Some tables missing!'
  END as status;

-- Check RLS is enabled
SELECT
  'RLS Policies' as check_name,
  COUNT(*)::text || ' policies created' as status
FROM pg_policies
WHERE tablename IN ('listings', 'listing_images', 'listing_channels');

SELECT '✅ Fix complete! Try saving your listing now.' as message;
