-- ============================================
-- MULTI-CHANNEL LISTINGS MIGRATION (SIMPLIFIED)
-- ============================================
-- Use this for fresh installations or if your listings table
-- already uses the new JSONB-based schema
-- Run this in your Supabase SQL Editor

-- ============================================
-- 1. ADD NEW COLUMNS TO LISTINGS TABLE
-- ============================================

-- Add multi-channel support columns (skip if already exist)
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
ADD COLUMN IF NOT EXISTS scroll_position INTEGER DEFAULT 0;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_listings_selected_channels ON public.listings USING GIN(selected_channels);
CREATE INDEX IF NOT EXISTS idx_listings_detected_product_type ON public.listings(detected_product_type);
CREATE INDEX IF NOT EXISTS idx_listings_seo_score ON public.listings(seo_score);

-- ============================================
-- 2. CREATE CHANNELS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  export_format TEXT NOT NULL,
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

-- Enable RLS
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view channels"
  ON public.channels FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- 3. CREATE LISTING_EXPORTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.listing_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  channel TEXT NOT NULL,
  export_format TEXT NOT NULL,
  export_data JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending',
  error_message TEXT,
  external_id TEXT,
  exported_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.listing_exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own exports"
  ON public.listing_exports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own exports"
  ON public.listing_exports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can do anything on exports"
  ON public.listing_exports FOR ALL
  USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_listing_exports_listing_id ON public.listing_exports(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_exports_user_id ON public.listing_exports(user_id);
CREATE INDEX IF NOT EXISTS idx_listing_exports_channel ON public.listing_exports(channel);
CREATE INDEX IF NOT EXISTS idx_listing_exports_status ON public.listing_exports(status);

-- ============================================
-- 4. CREATE AI_GENERATION_HISTORY TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.ai_generation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  generation_type TEXT NOT NULL,
  input_data JSONB DEFAULT '{}',
  output_data JSONB DEFAULT '{}',
  channels TEXT[] DEFAULT '{}',
  detected_product_type TEXT,
  tokens_used INTEGER,
  cost_usd DECIMAL(10,4),
  status TEXT DEFAULT 'success',
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.ai_generation_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own AI history"
  ON public.ai_generation_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can do anything on AI history"
  ON public.ai_generation_history FOR ALL
  USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_ai_history_user_id ON public.ai_generation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_history_listing_id ON public.ai_generation_history(listing_id);
CREATE INDEX IF NOT EXISTS idx_ai_history_type ON public.ai_generation_history(generation_type);
CREATE INDEX IF NOT EXISTS idx_ai_history_created_at ON public.ai_generation_history(created_at);

-- ============================================
-- 5. HELPER FUNCTIONS
-- ============================================

-- Get listings by channel
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

-- Update trigger for listings
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
-- DONE!
-- ============================================

SELECT 'Multi-channel migration complete!' AS status;
SELECT COUNT(*) AS total_channels FROM public.channels;
SELECT 
  COUNT(*) as total_listings,
  COUNT(*) FILTER (WHERE base IS NOT NULL AND base != '{}'::jsonb) as listings_with_base
FROM public.listings;
