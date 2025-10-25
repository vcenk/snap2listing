-- ============================================
-- SNAP2LISTING DATABASE SETUP
-- ============================================
-- Run this SQL in your Supabase SQL Editor

-- ============================================
-- 1. CREATE USERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  plan_id TEXT DEFAULT 'free',
  subscription_status TEXT DEFAULT 'active',

  -- Usage tracking
  images_used INTEGER DEFAULT 0,
  videos_used INTEGER DEFAULT 0,
  addon_images_quota INTEGER DEFAULT 0,
  addon_videos_quota INTEGER DEFAULT 0,

  -- Stripe info
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  current_period_end TIMESTAMP,

  -- Metadata
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own data
CREATE POLICY "Users can view own data"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Allow users to update their own data
CREATE POLICY "Users can update own data"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- Allow service role to do anything (for server-side operations)
CREATE POLICY "Service role can do anything"
  ON public.users
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- 2. AUTO-CREATE USER ON SIGNUP (TRIGGER)
-- ============================================

-- Function to create user record when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, plan_id, subscription_status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    'free',
    'active'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create user record on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 3. USAGE LIMIT CHECK FUNCTIONS
-- ============================================

-- Check if user can generate an image
CREATE OR REPLACE FUNCTION can_generate_image(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_plan_id TEXT;
  v_images_limit INTEGER;
  v_images_used INTEGER;
  v_addon_quota INTEGER;
BEGIN
  -- Get user's plan and usage
  SELECT plan_id, images_used, addon_images_quota
  INTO v_plan_id, v_images_used, v_addon_quota
  FROM users
  WHERE id = p_user_id;

  -- Get plan's image limit
  CASE v_plan_id
    WHEN 'free' THEN v_images_limit := 15;
    WHEN 'starter' THEN v_images_limit := 100;
    WHEN 'pro' THEN v_images_limit := 300;
    WHEN 'enterprise' THEN v_images_limit := 1000;
    ELSE v_images_limit := 15; -- Default to free
  END CASE;

  -- Check if under limit (including add-on quota)
  RETURN (v_images_used < v_images_limit + COALESCE(v_addon_quota, 0));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user can generate a video
CREATE OR REPLACE FUNCTION can_generate_video(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_plan_id TEXT;
  v_videos_limit INTEGER;
  v_videos_used INTEGER;
  v_addon_quota INTEGER;
BEGIN
  -- Get user's plan and usage
  SELECT plan_id, videos_used, addon_videos_quota
  INTO v_plan_id, v_videos_used, v_addon_quota
  FROM users
  WHERE id = p_user_id;

  -- Get plan's video limit
  CASE v_plan_id
    WHEN 'free' THEN v_videos_limit := 1;
    WHEN 'starter' THEN v_videos_limit := 5;
    WHEN 'pro' THEN v_videos_limit := 15;
    WHEN 'enterprise' THEN v_videos_limit := 50;
    ELSE v_videos_limit := 1; -- Default to free
  END CASE;

  -- Check if under limit (including add-on quota)
  RETURN (v_videos_used < v_videos_limit + COALESCE(v_addon_quota, 0));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 4. INCREMENT USAGE COUNTERS
-- ============================================

CREATE OR REPLACE FUNCTION increment_image_usage(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Increment images_used
  UPDATE users
  SET images_used = images_used + 1
  WHERE id = p_user_id;

  -- Deduct from addon quota first if available
  UPDATE users
  SET addon_images_quota = GREATEST(0, addon_images_quota - 1)
  WHERE id = p_user_id
  AND addon_images_quota > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_video_usage(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Increment videos_used
  UPDATE users
  SET videos_used = videos_used + 1
  WHERE id = p_user_id;

  -- Deduct from addon quota first if available
  UPDATE users
  SET addon_videos_quota = GREATEST(0, addon_videos_quota - 1)
  WHERE id = p_user_id
  AND addon_videos_quota > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. ADD-ON QUOTA FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION add_image_quota(p_user_id UUID, p_amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET addon_images_quota = COALESCE(addon_images_quota, 0) + p_amount
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION add_video_quota(p_user_id UUID, p_amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET addon_videos_quota = COALESCE(addon_videos_quota, 0) + p_amount
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. MONTHLY USAGE RESET
-- ============================================

CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET
    images_used = 0,
    videos_used = 0;
  -- Note: addon quotas don't reset, they persist until used
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. CREATE OTHER TABLES
-- ============================================

-- Listings table
CREATE TABLE IF NOT EXISTS public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  category TEXT,
  tags TEXT[],
  materials TEXT[],
  status TEXT DEFAULT 'draft', -- draft, published
  images JSONB DEFAULT '[]',
  video JSONB,
  images_count INTEGER DEFAULT 0,
  videos_count INTEGER DEFAULT 0,
  etsy_listing_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Policies
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

CREATE POLICY "Service role can do anything on listings"
  ON public.listings FOR ALL
  USING (auth.role() = 'service_role');

-- Shops table
CREATE TABLE IF NOT EXISTS public.shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  shop_id TEXT NOT NULL,
  shop_name TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  status TEXT DEFAULT 'connected', -- connected, disconnected, error
  connected_at TIMESTAMP DEFAULT NOW(),
  last_sync TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, shop_id)
);

-- Enable RLS
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own shops"
  ON public.shops FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own shops"
  ON public.shops FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shops"
  ON public.shops FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own shops"
  ON public.shops FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can do anything on shops"
  ON public.shops FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- 8. INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON public.users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_listings_user_id ON public.listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings(status);
CREATE INDEX IF NOT EXISTS idx_shops_user_id ON public.shops(user_id);

-- ============================================
-- DONE!
-- ============================================

-- Verify setup
SELECT 'Database setup complete!' AS status;
SELECT 'Users table ready' FROM public.users LIMIT 0;
SELECT 'Listings table ready' FROM public.listings LIMIT 0;
SELECT 'Shops table ready' FROM public.shops LIMIT 0;
