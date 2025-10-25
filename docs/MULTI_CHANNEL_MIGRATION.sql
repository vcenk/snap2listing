-- ============================================
-- MULTI-CHANNEL LISTINGS MIGRATION
-- ============================================
-- This migration updates the listings table to support
-- multiple sales channels (Amazon, Etsy, TikTok, Shopify, Facebook)
-- Run this in your Supabase SQL Editor

-- ============================================
-- 1. ADD NEW COLUMNS TO LISTINGS TABLE
-- ============================================

-- Add multi-channel support columns
ALTER TABLE public.listings
ADD COLUMN IF NOT EXISTS base JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS channels JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS selected_channels TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS detected_product_type TEXT,
ADD COLUMN IF NOT EXISTS taxonomy_mappings JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS seo_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ai_generated_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS validation_status JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS export_history JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS last_step TEXT,
ADD COLUMN IF NOT EXISTS last_channel_tab TEXT,
ADD COLUMN IF NOT EXISTS scroll_position INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS original_image TEXT;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_listings_selected_channels ON public.listings USING GIN(selected_channels);
CREATE INDEX IF NOT EXISTS idx_listings_detected_product_type ON public.listings(detected_product_type);
CREATE INDEX IF NOT EXISTS idx_listings_seo_score ON public.listings(seo_score);

-- ============================================
-- 2. MIGRATE EXISTING DATA (BACKWARD COMPATIBLE)
-- ============================================

-- Check if legacy columns exist before migration
DO $$
BEGIN
  -- Only migrate if legacy 'title' column exists and base is empty
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'listings' 
    AND column_name = 'title'
  ) THEN
    -- Migrate existing single-channel listings to multi-channel format
    UPDATE public.listings
    SET
      base = jsonb_build_object(
        'title', COALESCE(title, ''),
        'description', COALESCE(description, ''),
        'price', COALESCE(price, 0),
        'category', COALESCE(category, ''),
        'images', COALESCE(images, '[]'::jsonb),
        'quantity', COALESCE(quantity, 1),
        'video', video
      ),
      selected_channels = CASE 
        WHEN etsy_listing_id IS NOT NULL THEN ARRAY['etsy']::TEXT[]
        ELSE ARRAY[]::TEXT[]
      END,
      detected_product_type = 'General Merchandise',
      original_image = COALESCE(original_image, (images->0->>'url'))
    WHERE (base IS NULL OR base = '{}'::jsonb)
      AND title IS NOT NULL;
    
    RAISE NOTICE 'Migrated % existing listings', (SELECT COUNT(*) FROM public.listings WHERE base IS NOT NULL);
  ELSE
    RAISE NOTICE 'No legacy columns found - table already uses new schema or is empty';
  END IF;
END $$;

-- ============================================
-- 3. CREATE CHANNELS TABLE (OPTIONAL - FOR DYNAMIC CHANNEL MANAGEMENT)
-- ============================================

CREATE TABLE IF NOT EXISTS public.channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL, -- amazon, etsy, tiktok, shopify, facebook
  name TEXT NOT NULL,
  export_format TEXT NOT NULL, -- csv, api
  config JSONB DEFAULT '{}',
  validation_rules JSONB DEFAULT '{}',
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default channels
INSERT INTO public.channels (slug, name, export_format, config, validation_rules) VALUES
(
  'amazon',
  'Amazon',
  'csv',
  '{"description": "World''s largest marketplace", "logo": "/channels/amazon.svg"}',
  '{
    "title": {"maxLength": 200, "recommended": 80},
    "description": {"maxLength": 2000},
    "images": {"min": 1, "minSize": 1000, "formats": ["JPG", "PNG"]}
  }'
),
(
  'etsy',
  'Etsy',
  'csv',
  '{"description": "Handmade and vintage marketplace", "logo": "/channels/etsy.svg"}',
  '{
    "title": {"maxLength": 140},
    "description": {"maxLength": 5000},
    "tags": {"max": 13, "maxLength": 20},
    "images": {"max": 10, "minSize": 2000}
  }'
),
(
  'tiktok',
  'TikTok Shop',
  'api',
  '{"description": "Social shopping platform", "logo": "/channels/tiktok.svg"}',
  '{
    "title": {"maxLength": 100},
    "description": {"maxLength": 500},
    "images": {"minSize": 600, "ratio": "square"}
  }'
),
(
  'shopify',
  'Shopify',
  'api',
  '{"description": "Create your own online store", "logo": "/channels/shopify.svg"}',
  '{
    "title": {"maxLength": 255},
    "seo_meta_title": {"maxLength": 70},
    "seo_meta_description": {"maxLength": 160},
    "images": {"max": 250, "minSize": 1000}
  }'
),
(
  'facebook',
  'Facebook Shop',
  'csv',
  '{"description": "Social commerce platform", "logo": "/channels/facebook.svg"}',
  '{
    "title": {"maxLength": 150},
    "description": {"maxLength": 5000},
    "images": {"minSize": 500, "maxSizeMB": 8}
  }'
)
ON CONFLICT (slug) DO NOTHING;

-- Enable RLS on channels (read-only for all users)
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view channels"
  ON public.channels FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- 4. CREATE LISTING_EXPORTS TABLE (TRACK EXPORTS)
-- ============================================

CREATE TABLE IF NOT EXISTS public.listing_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  channel TEXT NOT NULL,
  export_format TEXT NOT NULL, -- csv, json, api
  export_data JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending', -- pending, success, failed
  error_message TEXT,
  external_id TEXT, -- ID from external platform (e.g., Etsy listing ID)
  exported_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.listing_exports ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own exports"
  ON public.listing_exports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own exports"
  ON public.listing_exports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can do anything on exports"
  ON public.listing_exports FOR ALL
  USING (auth.role() = 'service_role');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_listing_exports_listing_id ON public.listing_exports(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_exports_user_id ON public.listing_exports(user_id);
CREATE INDEX IF NOT EXISTS idx_listing_exports_channel ON public.listing_exports(channel);
CREATE INDEX IF NOT EXISTS idx_listing_exports_status ON public.listing_exports(status);

-- ============================================
-- 5. CREATE AI_GENERATION_HISTORY TABLE (TRACK AI USAGE)
-- ============================================

CREATE TABLE IF NOT EXISTS public.ai_generation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  generation_type TEXT NOT NULL, -- listing_content, image, video, seo_optimize
  input_data JSONB DEFAULT '{}',
  output_data JSONB DEFAULT '{}',
  channels TEXT[] DEFAULT '{}',
  detected_product_type TEXT,
  tokens_used INTEGER,
  cost_usd DECIMAL(10,4),
  status TEXT DEFAULT 'success', -- success, failed, partial
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.ai_generation_history ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own AI history"
  ON public.ai_generation_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can do anything on AI history"
  ON public.ai_generation_history FOR ALL
  USING (auth.role() = 'service_role');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_history_user_id ON public.ai_generation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_history_listing_id ON public.ai_generation_history(listing_id);
CREATE INDEX IF NOT EXISTS idx_ai_history_type ON public.ai_generation_history(generation_type);
CREATE INDEX IF NOT EXISTS idx_ai_history_created_at ON public.ai_generation_history(created_at);

-- ============================================
-- 6. UPDATE EXISTING FUNCTIONS/TRIGGERS
-- ============================================

-- Update the updated_at timestamp on listings
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_listings_updated_at ON public.listings;
CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. HELPER FUNCTIONS FOR MULTI-CHANNEL
-- ============================================

-- Get all listings for a specific channel
CREATE OR REPLACE FUNCTION get_listings_by_channel(p_user_id UUID, p_channel TEXT)
RETURNS TABLE (
  id UUID,
  title TEXT,
  status TEXT,
  seo_score INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.id,
    l.base->>'title' AS title,
    l.status,
    l.seo_score,
    l.created_at,
    l.updated_at
  FROM public.listings l
  WHERE l.user_id = p_user_id
  AND p_channel = ANY(l.selected_channels);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get channel-specific data from listing
CREATE OR REPLACE FUNCTION get_channel_data(p_listing_id UUID, p_channel TEXT)
RETURNS JSONB AS $$
DECLARE
  v_channel_data JSONB;
BEGIN
  SELECT
    jsonb_array_elements(channels) INTO v_channel_data
  FROM public.listings
  WHERE id = p_listing_id
  AND jsonb_array_elements(channels)->>'channelSlug' = p_channel;
  
  RETURN COALESCE(v_channel_data, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 8. ANALYTICS VIEWS (OPTIONAL)
-- ============================================

-- View: Listing stats by channel
CREATE OR REPLACE VIEW listing_stats_by_channel AS
SELECT
  user_id,
  unnest(selected_channels) AS channel,
  COUNT(*) AS total_listings,
  COUNT(*) FILTER (WHERE status = 'published') AS published_count,
  COUNT(*) FILTER (WHERE status = 'draft') AS draft_count,
  AVG(seo_score) AS avg_seo_score
FROM public.listings
GROUP BY user_id, channel;

-- View: AI generation usage
CREATE OR REPLACE VIEW ai_generation_stats AS
SELECT
  user_id,
  generation_type,
  COUNT(*) AS generation_count,
  SUM(tokens_used) AS total_tokens,
  SUM(cost_usd) AS total_cost_usd,
  DATE(created_at) AS date
FROM public.ai_generation_history
GROUP BY user_id, generation_type, DATE(created_at);

-- ============================================
-- DONE!
-- ============================================

-- Verify migration
SELECT 'Multi-channel migration complete!' AS status;
SELECT COUNT(*) AS total_channels FROM public.channels;
SELECT COUNT(*) AS migrated_listings FROM public.listings WHERE base IS NOT NULL;

-- Show sample migrated listing
SELECT
  id,
  base->>'title' AS title,
  selected_channels,
  detected_product_type,
  seo_score,
  created_at
FROM public.listings
LIMIT 1;
