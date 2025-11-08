-- ============================================================================
-- SNAP2LISTING - FRESH DATABASE SCHEMA
-- ============================================================================
-- This script creates a clean, optimized database from scratch
-- Based on comprehensive codebase analysis
--
-- USAGE:
-- 1. Backup your existing data if needed
-- 2. Drop all existing tables in Supabase SQL Editor
-- 3. Run this entire script
-- 4. Verify all tables and policies are created
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- SECTION 1: DROP ALL EXISTING TABLES (CLEAN SLATE)
-- ============================================================================

-- Drop tables in correct order (reverse of foreign key dependencies)
DROP TABLE IF EXISTS credit_usage_log CASCADE;
DROP TABLE IF EXISTS export_logs CASCADE;
DROP TABLE IF EXISTS listing_channels CASCADE;
DROP TABLE IF EXISTS listing_images CASCADE;
DROP TABLE IF EXISTS listings CASCADE;
DROP TABLE IF EXISTS shops CASCADE;
DROP TABLE IF EXISTS channels CASCADE;
DROP TABLE IF EXISTS subscription_plans CASCADE;
DROP TABLE IF EXISTS credit_costs CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop unused/legacy tables if they exist
DROP TABLE IF EXISTS keywords CASCADE;
DROP TABLE IF EXISTS listing_versions CASCADE;
DROP TABLE IF EXISTS brand_kits CASCADE;
DROP TABLE IF EXISTS insight_reports CASCADE;
DROP TABLE IF EXISTS export_kits CASCADE;
DROP TABLE IF EXISTS export_items CASCADE;
DROP TABLE IF EXISTS listings_exports CASCADE;
DROP TABLE IF EXISTS ai_generation_history CASCADE;
DROP TABLE IF EXISTS usage_logs CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS deduct_credits CASCADE;
DROP FUNCTION IF EXISTS is_trial_expired CASCADE;
DROP FUNCTION IF EXISTS get_trial_days_remaining CASCADE;
DROP FUNCTION IF EXISTS add_image_quota CASCADE;
DROP FUNCTION IF EXISTS add_video_quota CASCADE;
DROP FUNCTION IF EXISTS increment_usage CASCADE;
DROP FUNCTION IF EXISTS can_generate_video CASCADE;
DROP FUNCTION IF EXISTS increment_video_usage CASCADE;
DROP FUNCTION IF EXISTS handle_new_user CASCADE;

-- Drop triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- ============================================================================
-- SECTION 2: CORE TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- USERS TABLE
-- Purpose: User accounts, authentication, billing, and credit tracking
-- Frequency: VERY HIGH (20+ queries)
-- ----------------------------------------------------------------------------
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,

  -- Subscription & Billing
  plan_id TEXT NOT NULL DEFAULT 'free',
  subscription_status TEXT NOT NULL DEFAULT 'active',
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  billing_period_start TIMESTAMP WITH TIME ZONE,
  billing_period_end TIMESTAMP WITH TIME ZONE,

  -- Credit System (New unified system)
  credits_used INTEGER NOT NULL DEFAULT 0,
  credits_limit INTEGER NOT NULL DEFAULT 15, -- Free plan: 15 credits

  -- Legacy quota fields (for add-ons, being phased out)
  images_used INTEGER NOT NULL DEFAULT 0,
  videos_used INTEGER NOT NULL DEFAULT 0,
  addon_images_quota INTEGER NOT NULL DEFAULT 0,
  addon_videos_quota INTEGER NOT NULL DEFAULT 0,

  -- Trial tracking
  account_created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_plan CHECK (plan_id IN ('free', 'starter', 'pro', 'growth', 'business', 'enterprise')),
  CONSTRAINT valid_status CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete'))
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_stripe_customer ON users(stripe_customer_id);
CREATE INDEX idx_users_plan ON users(plan_id);
CREATE INDEX idx_users_created_at ON users(created_at);

COMMENT ON TABLE users IS 'User accounts with subscription and credit tracking';
COMMENT ON COLUMN users.credits_used IS 'Credits consumed in current billing period';
COMMENT ON COLUMN users.credits_limit IS 'Total credits allowed per billing period';
COMMENT ON COLUMN users.account_created_at IS 'Used for trial expiration calculation (7 days for free plan)';

-- ----------------------------------------------------------------------------
-- SUBSCRIPTION_PLANS TABLE
-- Purpose: Plan definitions with pricing and features
-- Frequency: LOW (reference data)
-- ----------------------------------------------------------------------------
CREATE TABLE subscription_plans (
  id SERIAL PRIMARY KEY,
  plan_name VARCHAR(50) NOT NULL UNIQUE,
  plan_display_name VARCHAR(100) NOT NULL,
  monthly_price_usd DECIMAL(10, 2) NOT NULL,
  annual_price_usd DECIMAL(10, 2) NOT NULL,
  credits_per_month INTEGER NOT NULL,
  max_brand_kits INTEGER DEFAULT 0,
  max_team_seats INTEGER DEFAULT 1,
  features JSONB DEFAULT '{}',
  trial_days INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE subscription_plans IS 'Subscription plan configurations';

-- Seed subscription plans
INSERT INTO subscription_plans (plan_name, plan_display_name, monthly_price_usd, annual_price_usd, credits_per_month, trial_days, features) VALUES
('free', 'Free', 0, 0, 15, 7, '{"listings": "unlimited", "channels": "all", "ai_content": true, "exports": true}'::jsonb),
('starter', 'Starter', 19, 190, 300, 0, '{"listings": "unlimited", "channels": "all", "ai_content": true, "exports": true, "priority_support": false}'::jsonb),
('pro', 'Pro', 39, 390, 750, 0, '{"listings": "unlimited", "channels": "all", "ai_content": true, "exports": true, "priority_support": true, "bulk_operations": true}'::jsonb),
('growth', 'Growth', 49, 490, 900, 0, '{"listings": "unlimited", "channels": "all", "ai_content": true, "exports": true, "priority_support": true, "bulk_operations": true, "analytics": true}'::jsonb),
('business', 'Business', 79, 790, 1800, 0, '{"listings": "unlimited", "channels": "all", "ai_content": true, "exports": true, "priority_support": true, "bulk_operations": true, "analytics": true, "api_access": true, "team_seats": 5}'::jsonb);

-- ----------------------------------------------------------------------------
-- CREDIT_COSTS TABLE
-- Purpose: Credit pricing for different actions
-- Frequency: LOW (reference data)
-- ----------------------------------------------------------------------------
CREATE TABLE credit_costs (
  id SERIAL PRIMARY KEY,
  action_type VARCHAR(50) NOT NULL UNIQUE,
  credit_cost INTEGER NOT NULL,
  description VARCHAR(255),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE credit_costs IS 'Credit costs for various actions';

-- Seed credit costs
INSERT INTO credit_costs (action_type, credit_cost, description) VALUES
('image_generation', 3, 'AI image generation or background removal'),
('video_generation', 3, 'AI video generation'),
('mockup_download', 3, 'POD mockup generation'),
('seo_content', 0, 'AI SEO content generation (unlimited)'),
('ai_prompt_suggestion', 0, 'AI prompt suggestions (unlimited)'),
('title_generation', 0, 'AI title generation (unlimited)'),
('description_generation', 0, 'AI description generation (unlimited)'),
('tags_generation', 0, 'AI tags generation (unlimited)');

-- ----------------------------------------------------------------------------
-- CHANNELS TABLE
-- Purpose: Marketplace channel configurations
-- Frequency: MEDIUM (5 queries)
-- ----------------------------------------------------------------------------
CREATE TABLE channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  config JSONB DEFAULT '{}',
  validation_rules JSONB DEFAULT '{}',
  export_format TEXT NOT NULL DEFAULT 'csv',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_export_format CHECK (export_format IN ('csv', 'json', 'api'))
);

CREATE INDEX idx_channels_slug ON channels(slug);

COMMENT ON TABLE channels IS 'Sales channel configurations (Shopify, eBay, Etsy, etc.)';

-- Seed channels
INSERT INTO channels (name, slug, config, export_format) VALUES
('Shopify', 'shopify', '{"requiredFields": ["title", "description", "price", "images"], "maxTitleLength": 255, "maxDescriptionLength": 65535}'::jsonb, 'csv'),
('eBay', 'ebay', '{"requiredFields": ["title", "description", "price", "category"], "maxTitleLength": 80, "maxDescriptionLength": 500000}'::jsonb, 'csv'),
('Amazon', 'amazon', '{"requiredFields": ["title", "description", "price", "bullets"], "maxTitleLength": 200, "maxBullets": 5}'::jsonb, 'csv'),
('Etsy', 'etsy', '{"requiredFields": ["title", "description", "price", "tags"], "maxTitleLength": 140, "maxTags": 13}'::jsonb, 'csv'),
('Facebook & Instagram', 'facebook-ig', '{"requiredFields": ["title", "description", "price", "images"], "maxTitleLength": 100}'::jsonb, 'csv'),
('TikTok Shop', 'tiktok', '{"requiredFields": ["title", "description", "price", "video"], "maxTitleLength": 255}'::jsonb, 'csv');

-- ----------------------------------------------------------------------------
-- LISTINGS TABLE
-- Purpose: Product listings with multi-channel support
-- Frequency: VERY HIGH (15+ queries)
-- ----------------------------------------------------------------------------
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Status & Type
  status TEXT NOT NULL DEFAULT 'draft',
  product_type TEXT NOT NULL DEFAULT 'physical',

  -- Core data (stored as JSONB for flexibility)
  base_data JSONB NOT NULL DEFAULT '{}',

  -- SEO
  seo_score INTEGER DEFAULT 0,

  -- UI State Persistence (for wizard)
  last_step TEXT,
  last_channel_tab TEXT,
  scroll_position INTEGER DEFAULT 0,

  -- POD-specific fields
  pod_provider TEXT,
  base_product_sku TEXT,
  mockup_urls TEXT[],
  base_design_url TEXT,
  mockup_template_ids TEXT[],
  selected_product_type TEXT,
  mockup_template_id TEXT, -- Deprecated, use mockup_template_ids

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('draft', 'optimized', 'completed', 'archived')),
  CONSTRAINT valid_product_type CHECK (product_type IN ('physical', 'digital', 'pod')),
  CONSTRAINT valid_pod_provider CHECK (pod_provider IS NULL OR pod_provider IN ('printful', 'printify', 'dynamicmockups'))
);

-- Indexes for performance
CREATE INDEX idx_listings_user_id ON listings(user_id);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_product_type ON listings(product_type);
CREATE INDEX idx_listings_created_at ON listings(created_at DESC);
CREATE INDEX idx_listings_base_data ON listings USING GIN (base_data);

COMMENT ON TABLE listings IS 'Product listings with support for physical, digital, and POD products';
COMMENT ON COLUMN listings.base_data IS 'JSONB: {title, description, price, category, images, quantity, video, originalImage, productType, imageMetadata}';

-- ----------------------------------------------------------------------------
-- LISTING_IMAGES TABLE
-- Purpose: Separate image storage for listings
-- Frequency: MEDIUM (3-5 queries)
-- ----------------------------------------------------------------------------
CREATE TABLE listing_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  is_main BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  UNIQUE(listing_id, position)
);

CREATE INDEX idx_listing_images_listing_id ON listing_images(listing_id);
CREATE INDEX idx_listing_images_is_main ON listing_images(is_main);

COMMENT ON TABLE listing_images IS 'Images associated with listings, ordered by position';

-- ----------------------------------------------------------------------------
-- LISTING_CHANNELS TABLE
-- Purpose: Channel-specific overrides for each listing
-- Frequency: MEDIUM (5 queries)
-- ----------------------------------------------------------------------------
CREATE TABLE listing_channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,

  -- Channel-specific overrides
  override_data JSONB NOT NULL DEFAULT '{}',

  -- Validation & Readiness
  validation_state JSONB DEFAULT '{}',
  readiness_score INTEGER DEFAULT 0,
  is_ready BOOLEAN NOT NULL DEFAULT false,

  -- Export tracking
  exported_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  UNIQUE(listing_id, channel_id)
);

CREATE INDEX idx_listing_channels_listing_id ON listing_channels(listing_id);
CREATE INDEX idx_listing_channels_channel_id ON listing_channels(channel_id);
CREATE INDEX idx_listing_channels_is_ready ON listing_channels(is_ready);

COMMENT ON TABLE listing_channels IS 'Channel-specific data overrides for each listing';
COMMENT ON COLUMN listing_channels.override_data IS 'JSONB: {title, description, tags, bullets, materials, customFields}';

-- ----------------------------------------------------------------------------
-- EXPORT_LOGS TABLE
-- Purpose: Track export history and audit trail
-- Frequency: LOW (1 per export)
-- ----------------------------------------------------------------------------
CREATE TABLE export_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  format TEXT NOT NULL,
  file_name TEXT,
  exported_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_format CHECK (format IN ('csv', 'json', 'zip', 'docx', 'pdf', 'html'))
);

CREATE INDEX idx_export_logs_listing_id ON export_logs(listing_id);
CREATE INDEX idx_export_logs_created_at ON export_logs(created_at DESC);

COMMENT ON TABLE export_logs IS 'Audit trail of all exports';

-- ----------------------------------------------------------------------------
-- SHOPS TABLE
-- Purpose: Connected marketplace shop accounts
-- Frequency: LOW (1 query)
-- ----------------------------------------------------------------------------
CREATE TABLE shops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  channel_id UUID REFERENCES channels(id) ON DELETE SET NULL,

  shop_id TEXT NOT NULL,
  shop_name TEXT,
  status TEXT NOT NULL DEFAULT 'connected',

  -- OAuth tokens (encrypted in production)
  access_token TEXT,
  refresh_token TEXT,

  -- Timestamps
  connected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  last_sync TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_shop_status CHECK (status IN ('connected', 'disconnected', 'error')),
  UNIQUE(user_id, shop_id)
);

CREATE INDEX idx_shops_user_id ON shops(user_id);
CREATE INDEX idx_shops_status ON shops(status);

COMMENT ON TABLE shops IS 'Connected marketplace accounts for direct publishing';

-- ----------------------------------------------------------------------------
-- CREDIT_USAGE_LOG TABLE
-- Purpose: Audit trail for all credit usage
-- Frequency: MEDIUM (every paid action)
-- ----------------------------------------------------------------------------
CREATE TABLE credit_usage_log (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL,
  credits_used INTEGER NOT NULL,
  credits_remaining INTEGER NOT NULL,
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_credit_usage_log_user_id ON credit_usage_log(user_id);
CREATE INDEX idx_credit_usage_log_created_at ON credit_usage_log(created_at DESC);
CREATE INDEX idx_credit_usage_log_action_type ON credit_usage_log(action_type);

COMMENT ON TABLE credit_usage_log IS 'Complete audit trail of credit consumption';

-- ============================================================================
-- SECTION 3: DATABASE FUNCTIONS (RPC)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- FUNCTION: is_trial_expired
-- Purpose: Check if free plan trial has expired (7 days)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION is_trial_expired(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_plan_id TEXT;
  v_account_created_at TIMESTAMP WITH TIME ZONE;
  v_trial_days INTEGER;
BEGIN
  -- Get user plan and account creation date
  SELECT plan_id, account_created_at
  INTO v_plan_id, v_account_created_at
  FROM users
  WHERE id = p_user_id;

  -- If not free plan, trial doesn't apply
  IF v_plan_id != 'free' THEN
    RETURN FALSE;
  END IF;

  -- Get trial days for free plan (should be 7)
  SELECT trial_days INTO v_trial_days
  FROM subscription_plans
  WHERE plan_name = 'free';

  -- Check if trial has expired
  RETURN (NOW() > v_account_created_at + (v_trial_days || ' days')::INTERVAL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION is_trial_expired IS 'Returns TRUE if free plan 7-day trial has expired';

-- ----------------------------------------------------------------------------
-- FUNCTION: get_trial_days_remaining
-- Purpose: Get number of trial days remaining for free plan users
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_trial_days_remaining(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_plan_id TEXT;
  v_account_created_at TIMESTAMP WITH TIME ZONE;
  v_trial_days INTEGER;
  v_days_remaining INTEGER;
BEGIN
  -- Get user plan and account creation date
  SELECT plan_id, account_created_at
  INTO v_plan_id, v_account_created_at
  FROM users
  WHERE id = p_user_id;

  -- If not free plan, no trial
  IF v_plan_id != 'free' THEN
    RETURN 0;
  END IF;

  -- Get trial days for free plan
  SELECT trial_days INTO v_trial_days
  FROM subscription_plans
  WHERE plan_name = 'free';

  -- Calculate days remaining
  v_days_remaining := v_trial_days - EXTRACT(DAY FROM (NOW() - v_account_created_at))::INTEGER;

  -- Return 0 if negative
  RETURN GREATEST(v_days_remaining, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_trial_days_remaining IS 'Returns number of trial days remaining for free plan';

-- ----------------------------------------------------------------------------
-- FUNCTION: deduct_credits
-- Purpose: Deduct credits from user account with validation
-- Used by: All paid actions (images, videos, mockups)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION deduct_credits(
  p_user_id UUID,
  p_credits_to_deduct INTEGER,
  p_action_type TEXT DEFAULT 'unknown',
  p_listing_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS TABLE (
  success BOOLEAN,
  credits_remaining INTEGER,
  message TEXT
) AS $$
DECLARE
  v_current_credits_used INTEGER;
  v_credits_limit INTEGER;
  v_plan_id TEXT;
  v_trial_expired BOOLEAN;
  v_new_credits_used INTEGER;
  v_credits_remaining INTEGER;
BEGIN
  -- Get current user credits and plan
  SELECT credits_used, credits_limit, plan_id
  INTO v_current_credits_used, v_credits_limit, v_plan_id
  FROM users
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 0, 'User not found';
    RETURN;
  END IF;

  -- Check trial expiration for free plan
  IF v_plan_id = 'free' THEN
    v_trial_expired := is_trial_expired(p_user_id);

    IF v_trial_expired THEN
      RETURN QUERY SELECT FALSE, 0, 'Free trial expired. Please upgrade your plan.';
      RETURN;
    END IF;
  END IF;

  -- Calculate new credits used
  v_new_credits_used := v_current_credits_used + p_credits_to_deduct;
  v_credits_remaining := v_credits_limit - v_new_credits_used;

  -- Check if user has enough credits
  IF v_credits_remaining < 0 THEN
    RETURN QUERY SELECT FALSE, v_credits_limit - v_current_credits_used, 'Insufficient credits. Please upgrade or purchase add-ons.';
    RETURN;
  END IF;

  -- Deduct credits
  UPDATE users
  SET credits_used = v_new_credits_used,
      updated_at = NOW()
  WHERE id = p_user_id;

  -- Log the credit usage
  INSERT INTO credit_usage_log (user_id, action_type, credits_used, credits_remaining, listing_id, metadata)
  VALUES (p_user_id, p_action_type, p_credits_to_deduct, v_credits_remaining, p_listing_id, p_metadata);

  -- Return success
  RETURN QUERY SELECT TRUE, v_credits_remaining, format('Successfully deducted %s credits. %s remaining.', p_credits_to_deduct, v_credits_remaining);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION deduct_credits IS 'Deducts credits with trial expiration check and logging';

-- ----------------------------------------------------------------------------
-- FUNCTION: add_image_quota (Stripe Add-ons)
-- Purpose: Add bonus image quota from add-on purchases
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION add_image_quota(p_user_id UUID, p_amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET addon_images_quota = addon_images_quota + p_amount,
      updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION add_image_quota IS 'Add bonus image quota from Stripe add-on purchases';

-- ----------------------------------------------------------------------------
-- FUNCTION: add_video_quota (Stripe Add-ons)
-- Purpose: Add bonus video quota from add-on purchases
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION add_video_quota(p_user_id UUID, p_amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET addon_videos_quota = addon_videos_quota + p_amount,
      updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION add_video_quota IS 'Add bonus video quota from Stripe add-on purchases';

-- ----------------------------------------------------------------------------
-- FUNCTION: handle_new_user (Trigger Function)
-- Purpose: Auto-create user record when new auth.user is created
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, plan_id, subscription_status, account_created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'free',
    'active',
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create user on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

COMMENT ON FUNCTION handle_new_user IS 'Automatically creates user record when auth.user is created';

-- ============================================================================
-- SECTION 4: ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_usage_log ENABLE ROW LEVEL SECURITY;

-- Reference tables (public read, admin write)
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_costs ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- USERS POLICIES
-- ----------------------------------------------------------------------------

-- Users can read their own data
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can update their own data (except credit fields)
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Service role can do anything (for admin operations and triggers)
CREATE POLICY "Service role has full access to users"
  ON users FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- LISTINGS POLICIES
-- ----------------------------------------------------------------------------

-- Users can view their own listings
CREATE POLICY "Users can view own listings"
  ON listings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can create listings
CREATE POLICY "Users can create listings"
  ON listings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own listings
CREATE POLICY "Users can update own listings"
  ON listings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own listings
CREATE POLICY "Users can delete own listings"
  ON listings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Service role has full access
CREATE POLICY "Service role has full access to listings"
  ON listings FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- LISTING_IMAGES POLICIES
-- ----------------------------------------------------------------------------

-- Users can view images of their own listings
CREATE POLICY "Users can view own listing images"
  ON listing_images FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = listing_images.listing_id
      AND listings.user_id = auth.uid()
    )
  );

-- Users can insert images for their own listings
CREATE POLICY "Users can insert own listing images"
  ON listing_images FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = listing_images.listing_id
      AND listings.user_id = auth.uid()
    )
  );

-- Users can delete images from their own listings
CREATE POLICY "Users can delete own listing images"
  ON listing_images FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = listing_images.listing_id
      AND listings.user_id = auth.uid()
    )
  );

-- Service role has full access
CREATE POLICY "Service role has full access to listing_images"
  ON listing_images FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- LISTING_CHANNELS POLICIES
-- ----------------------------------------------------------------------------

-- Users can view channel data for their own listings
CREATE POLICY "Users can view own listing channels"
  ON listing_channels FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = listing_channels.listing_id
      AND listings.user_id = auth.uid()
    )
  );

-- Users can insert channel data for their own listings
CREATE POLICY "Users can insert own listing channels"
  ON listing_channels FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = listing_channels.listing_id
      AND listings.user_id = auth.uid()
    )
  );

-- Users can update channel data for their own listings
CREATE POLICY "Users can update own listing channels"
  ON listing_channels FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = listing_channels.listing_id
      AND listings.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = listing_channels.listing_id
      AND listings.user_id = auth.uid()
    )
  );

-- Users can delete channel data for their own listings
CREATE POLICY "Users can delete own listing channels"
  ON listing_channels FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = listing_channels.listing_id
      AND listings.user_id = auth.uid()
    )
  );

-- Service role has full access
CREATE POLICY "Service role has full access to listing_channels"
  ON listing_channels FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- CHANNELS POLICIES (Reference Data)
-- ----------------------------------------------------------------------------

-- Everyone can read channels
CREATE POLICY "Anyone can view channels"
  ON channels FOR SELECT
  TO authenticated
  USING (true);

-- Service role can manage channels
CREATE POLICY "Service role can manage channels"
  ON channels FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- EXPORT_LOGS POLICIES
-- ----------------------------------------------------------------------------

-- Users can view their own export logs
CREATE POLICY "Users can view own export logs"
  ON export_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = export_logs.listing_id
      AND listings.user_id = auth.uid()
    )
  );

-- Users can create export logs for their own listings
CREATE POLICY "Users can create own export logs"
  ON export_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = export_logs.listing_id
      AND listings.user_id = auth.uid()
    )
  );

-- Service role has full access
CREATE POLICY "Service role has full access to export_logs"
  ON export_logs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- SHOPS POLICIES
-- ----------------------------------------------------------------------------

-- Users can view their own shops
CREATE POLICY "Users can view own shops"
  ON shops FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can create shops
CREATE POLICY "Users can create shops"
  ON shops FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own shops
CREATE POLICY "Users can update own shops"
  ON shops FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own shops
CREATE POLICY "Users can delete own shops"
  ON shops FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Service role has full access
CREATE POLICY "Service role has full access to shops"
  ON shops FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- CREDIT_USAGE_LOG POLICIES
-- ----------------------------------------------------------------------------

-- Users can view their own credit usage logs
CREATE POLICY "Users can view own credit usage"
  ON credit_usage_log FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Only service role can insert (via deduct_credits function)
CREATE POLICY "Service role can insert credit usage logs"
  ON credit_usage_log FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Service role has full access
CREATE POLICY "Service role has full access to credit_usage_log"
  ON credit_usage_log FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- REFERENCE DATA POLICIES (subscription_plans, credit_costs)
-- ----------------------------------------------------------------------------

-- Everyone can read reference data
CREATE POLICY "Anyone can view subscription plans"
  ON subscription_plans FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can view credit costs"
  ON credit_costs FOR SELECT
  TO authenticated
  USING (true);

-- Service role can manage reference data
CREATE POLICY "Service role can manage subscription_plans"
  ON subscription_plans FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage credit_costs"
  ON credit_costs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- SECTION 5: VERIFICATION & SUMMARY
-- ============================================================================

-- List all tables
SELECT
  schemaname,
  tablename
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Count rows in each table
SELECT
  'users' AS table_name, COUNT(*) AS row_count FROM users
UNION ALL
SELECT 'listings', COUNT(*) FROM listings
UNION ALL
SELECT 'listing_images', COUNT(*) FROM listing_images
UNION ALL
SELECT 'listing_channels', COUNT(*) FROM listing_channels
UNION ALL
SELECT 'channels', COUNT(*) FROM channels
UNION ALL
SELECT 'export_logs', COUNT(*) FROM export_logs
UNION ALL
SELECT 'shops', COUNT(*) FROM shops
UNION ALL
SELECT 'credit_usage_log', COUNT(*) FROM credit_usage_log
UNION ALL
SELECT 'subscription_plans', COUNT(*) FROM subscription_plans
UNION ALL
SELECT 'credit_costs', COUNT(*) FROM credit_costs;

-- ============================================================================
-- FRESH DATABASE SCHEMA COMPLETE!
-- ============================================================================
--
-- CREATED:
-- ✅ 10 core tables (users, listings, channels, etc.)
-- ✅ 6 RPC functions (deduct_credits, is_trial_expired, etc.)
-- ✅ 1 trigger (auto-create user on signup)
-- ✅ Complete RLS policies for all tables
-- ✅ Indexes for performance
-- ✅ Seed data for channels, plans, and credit costs
--
-- REMOVED:
-- ❌ Unused tables (keywords, listing_versions, brand_kits, etc.)
-- ❌ Legacy RPC functions
-- ❌ Duplicate/conflicting policies
--
-- NEXT STEPS:
-- 1. Run this script in Supabase SQL Editor
-- 2. Verify all tables are created
-- 3. Test the app functionality
-- 4. Monitor performance
-- ============================================================================
