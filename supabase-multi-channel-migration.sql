-- ============================================
-- SNAP2LISTING MULTI-CHANNEL MIGRATION
-- ============================================
-- This script migrates from Etsy-only to multi-channel export platform
-- Run in Supabase SQL Editor
-- Author: Claude Code Migration Team
-- Date: 2025-10-15

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- STEP 1: CREATE NEW MULTI-CHANNEL TABLES
-- ============================================

-- Channels table: Store configuration for each sales channel
CREATE TABLE IF NOT EXISTS channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  config JSONB NOT NULL DEFAULT '{}',
  validation_rules JSONB NOT NULL DEFAULT '{}',
  export_format TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- New listings table with flexible schema
CREATE TABLE IF NOT EXISTS listings_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'draft', -- draft, optimized, completed
  base_data JSONB NOT NULL DEFAULT '{}',
  seo_score INTEGER DEFAULT 0,
  last_step TEXT DEFAULT 'upload',
  last_channel_tab TEXT,
  scroll_position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Listing-Channel relationship with overrides
CREATE TABLE IF NOT EXISTS listing_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings_new(id) ON DELETE CASCADE,
  channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  override_data JSONB NOT NULL DEFAULT '{}',
  validation_state JSONB NOT NULL DEFAULT '{}',
  readiness_score INTEGER DEFAULT 0,
  is_ready BOOLEAN DEFAULT FALSE,
  exported_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(listing_id, channel_id)
);

-- Separate images table for better management
CREATE TABLE IF NOT EXISTS listing_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings_new(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  position INTEGER NOT NULL,
  is_main BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Version history for listings
CREATE TABLE IF NOT EXISTS listing_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings_new(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  snapshot_data JSONB NOT NULL,
  seo_score INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Keywords tracking
CREATE TABLE IF NOT EXISTS keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings_new(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  type TEXT NOT NULL, -- longtail, autosuggest, manual
  source TEXT,
  category TEXT, -- material, style, audience, occasion, problem, modifier
  placements JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Export logs for tracking
CREATE TABLE IF NOT EXISTS export_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings_new(id) ON DELETE CASCADE,
  channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  format TEXT NOT NULL,
  file_name TEXT NOT NULL,
  exported_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STEP 2: CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_listings_new_user_id ON listings_new(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_new_status ON listings_new(status);
CREATE INDEX IF NOT EXISTS idx_listings_new_created_at ON listings_new(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_listing_channels_listing_id ON listing_channels(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_channels_channel_id ON listing_channels(channel_id);
CREATE INDEX IF NOT EXISTS idx_listing_channels_is_ready ON listing_channels(is_ready);

CREATE INDEX IF NOT EXISTS idx_listing_images_listing_id ON listing_images(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_images_position ON listing_images(listing_id, position);

CREATE INDEX IF NOT EXISTS idx_keywords_listing_id ON keywords(listing_id);
CREATE INDEX IF NOT EXISTS idx_keywords_type ON keywords(type);
CREATE INDEX IF NOT EXISTS idx_keywords_category ON keywords(category);

CREATE INDEX IF NOT EXISTS idx_export_logs_listing_id ON export_logs(listing_id);
CREATE INDEX IF NOT EXISTS idx_export_logs_channel_id ON export_logs(channel_id);
CREATE INDEX IF NOT EXISTS idx_export_logs_created_at ON export_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_listing_versions_listing_id ON listing_versions(listing_id);

-- ============================================
-- STEP 3: ADD TRIGGERS
-- ============================================

-- Trigger to update updated_at on listings_new
DROP TRIGGER IF EXISTS listings_new_updated_at ON listings_new;
CREATE TRIGGER listings_new_updated_at BEFORE UPDATE ON listings_new
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Trigger to update updated_at on listing_channels
DROP TRIGGER IF EXISTS listing_channels_updated_at ON listing_channels;
CREATE TRIGGER listing_channels_updated_at BEFORE UPDATE ON listing_channels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- STEP 4: SEED CHANNEL DATA
-- ============================================

INSERT INTO channels (name, slug, config, validation_rules, export_format) VALUES
('Shopify', 'shopify',
  '{"fields": ["title", "body_html", "tags", "handle", "image_src", "price", "sku", "quantity"], "description": "Export as Shopify CSV for bulk product upload"}',
  '{"title": {"required": true, "maxLength": 70}, "description": {"required": true, "minLength": 100}, "images": {"min": 1}, "price": {"required": true}}',
  'csv'),

('eBay', 'ebay',
  '{"fields": ["title", "price", "quantity", "condition", "images", "category"], "description": "Export for eBay File Exchange or Seller Hub"}',
  '{"title": {"required": true, "maxLength": 80}, "price": {"required": true}, "quantity": {"required": true}, "condition": {"required": true}, "images": {"min": 1}}',
  'csv'),

('Facebook/Instagram', 'facebook-ig',
  '{"fields": ["id", "title", "description", "availability", "condition", "price", "link", "image_link", "brand"], "description": "Facebook Product Catalog CSV format"}',
  '{"title": {"required": true, "maxLength": 150}, "price": {"required": true}, "image_link": {"required": true}, "availability": {"required": true}}',
  'csv'),

('Amazon', 'amazon',
  '{"fields": ["title", "bullets", "description", "price", "images"], "description": "Amazon listing readiness checker"}',
  '{"title": {"required": true, "maxLength": 200}, "bullets": {"required": true, "count": 5, "minLength": 10, "maxLength": 255}, "description": {"required": true, "minLength": 300}, "images": {"min": 5}}',
  'readiness'),

('Etsy', 'etsy',
  '{"fields": ["title", "tags", "description", "price", "materials", "images"], "description": "Etsy listing readiness checker"}',
  '{"title": {"required": true, "maxLength": 140}, "tags": {"required": true, "min": 8, "max": 13}, "description": {"required": true, "minLength": 200}, "images": {"min": 3}}',
  'readiness'),

('TikTok Shop', 'tiktok',
  '{"fields": ["title", "description", "price", "images", "category"], "description": "TikTok Shop product CSV export"}',
  '{"title": {"required": true, "maxLength": 100}, "price": {"required": true}, "images": {"min": 3}, "description": {"required": true}}',
  'csv')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- STEP 5: MIGRATE EXISTING DATA
-- ============================================

-- Migrate listings from old schema to new schema
INSERT INTO listings_new (id, user_id, status, base_data, created_at, updated_at)
SELECT
  id,
  user_id,
  CASE
    WHEN status = 'published' THEN 'completed'
    WHEN status = 'draft' THEN 'draft'
    ELSE status
  END as status,
  jsonb_build_object(
    'title', COALESCE(title, ''),
    'description', COALESCE(description, ''),
    'tags', COALESCE(tags, ARRAY[]::TEXT[]),
    'price', COALESCE(price, 0),
    'category', COALESCE(category, ''),
    'quantity', COALESCE(quantity, 1),
    'original_image', COALESCE(original_image, ''),
    'video', video
  ) as base_data,
  created_at,
  updated_at
FROM listings
ON CONFLICT (id) DO NOTHING;

-- Migrate images to listing_images table
INSERT INTO listing_images (listing_id, url, position, is_main)
SELECT
  l.id as listing_id,
  img_element->>'url' as url,
  (ROW_NUMBER() OVER (PARTITION BY l.id ORDER BY (img_element->>'position')::int)) - 1 as position,
  (ROW_NUMBER() OVER (PARTITION BY l.id ORDER BY (img_element->>'position')::int)) = 1 as is_main
FROM listings l
CROSS JOIN LATERAL jsonb_array_elements(
  CASE
    WHEN jsonb_typeof(l.images) = 'array' THEN l.images
    ELSE '[]'::jsonb
  END
) AS img_element
WHERE jsonb_typeof(l.images) = 'array' AND jsonb_array_length(l.images) > 0
ON CONFLICT DO NOTHING;

-- Create Etsy channel association for all migrated listings
-- (Assumes all existing listings were intended for Etsy)
INSERT INTO listing_channels (listing_id, channel_id, is_ready, override_data)
SELECT
  ln.id as listing_id,
  c.id as channel_id,
  (ln.status = 'completed') as is_ready,
  jsonb_build_object(
    'tags', ln.base_data->'tags',
    'materials', ln.base_data->'materials'
  ) as override_data
FROM listings_new ln
CROSS JOIN channels c
WHERE c.slug = 'etsy'
ON CONFLICT (listing_id, channel_id) DO NOTHING;

-- ============================================
-- STEP 6: SETUP ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings_new ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_logs ENABLE ROW LEVEL SECURITY;

-- Channels are public (read-only for all authenticated users)
DROP POLICY IF EXISTS channels_select_public ON channels;
CREATE POLICY channels_select_public ON channels
  FOR SELECT USING (true);

-- Listings policies (users can only access their own)
DROP POLICY IF EXISTS listings_new_select_own ON listings_new;
CREATE POLICY listings_new_select_own ON listings_new
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS listings_new_insert_own ON listings_new;
CREATE POLICY listings_new_insert_own ON listings_new
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS listings_new_update_own ON listings_new;
CREATE POLICY listings_new_update_own ON listings_new
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS listings_new_delete_own ON listings_new;
CREATE POLICY listings_new_delete_own ON listings_new
  FOR DELETE USING (auth.uid() = user_id);

-- Listing channels policies (inherit from parent listing)
DROP POLICY IF EXISTS listing_channels_select_own ON listing_channels;
CREATE POLICY listing_channels_select_own ON listing_channels
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM listings_new
      WHERE listings_new.id = listing_channels.listing_id
      AND listings_new.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS listing_channels_insert_own ON listing_channels;
CREATE POLICY listing_channels_insert_own ON listing_channels
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM listings_new
      WHERE listings_new.id = listing_channels.listing_id
      AND listings_new.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS listing_channels_update_own ON listing_channels;
CREATE POLICY listing_channels_update_own ON listing_channels
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM listings_new
      WHERE listings_new.id = listing_channels.listing_id
      AND listings_new.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS listing_channels_delete_own ON listing_channels;
CREATE POLICY listing_channels_delete_own ON listing_channels
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM listings_new
      WHERE listings_new.id = listing_channels.listing_id
      AND listings_new.user_id = auth.uid()
    )
  );

-- Listing images policies (inherit from parent listing)
DROP POLICY IF EXISTS listing_images_select_own ON listing_images;
CREATE POLICY listing_images_select_own ON listing_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM listings_new
      WHERE listings_new.id = listing_images.listing_id
      AND listings_new.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS listing_images_insert_own ON listing_images;
CREATE POLICY listing_images_insert_own ON listing_images
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM listings_new
      WHERE listings_new.id = listing_images.listing_id
      AND listings_new.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS listing_images_delete_own ON listing_images;
CREATE POLICY listing_images_delete_own ON listing_images
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM listings_new
      WHERE listings_new.id = listing_images.listing_id
      AND listings_new.user_id = auth.uid()
    )
  );

-- Keywords policies (inherit from parent listing)
DROP POLICY IF EXISTS keywords_select_own ON keywords;
CREATE POLICY keywords_select_own ON keywords
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM listings_new
      WHERE listings_new.id = keywords.listing_id
      AND listings_new.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS keywords_insert_own ON keywords;
CREATE POLICY keywords_insert_own ON keywords
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM listings_new
      WHERE listings_new.id = keywords.listing_id
      AND listings_new.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS keywords_delete_own ON keywords;
CREATE POLICY keywords_delete_own ON keywords
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM listings_new
      WHERE listings_new.id = keywords.listing_id
      AND listings_new.user_id = auth.uid()
    )
  );

-- Export logs policies (inherit from parent listing)
DROP POLICY IF EXISTS export_logs_select_own ON export_logs;
CREATE POLICY export_logs_select_own ON export_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM listings_new
      WHERE listings_new.id = export_logs.listing_id
      AND listings_new.user_id = auth.uid()
    )
  );

-- Listing versions policies (inherit from parent listing)
DROP POLICY IF EXISTS listing_versions_select_own ON listing_versions;
CREATE POLICY listing_versions_select_own ON listing_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM listings_new
      WHERE listings_new.id = listing_versions.listing_id
      AND listings_new.user_id = auth.uid()
    )
  );

-- ============================================
-- STEP 7: VERIFY MIGRATION
-- ============================================

-- Verification queries (comment out when running in production)
-- These are for manual verification in Supabase SQL Editor

-- Check channel data
-- SELECT * FROM channels ORDER BY name;

-- Check migrated listings count
-- SELECT
--   'Old listings' as source,
--   COUNT(*) as count
-- FROM listings
-- UNION ALL
-- SELECT
--   'New listings' as source,
--   COUNT(*) as count
-- FROM listings_new;

-- Check sample migrated data
-- SELECT
--   ln.id,
--   ln.base_data->>'title' as title,
--   ln.status,
--   COUNT(DISTINCT lc.channel_id) as channel_count,
--   COUNT(DISTINCT li.id) as image_count
-- FROM listings_new ln
-- LEFT JOIN listing_channels lc ON ln.id = lc.listing_id
-- LEFT JOIN listing_images li ON ln.id = li.listing_id
-- GROUP BY ln.id
-- LIMIT 10;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

SELECT '✅ Multi-channel migration completed successfully!' AS status,
       (SELECT COUNT(*) FROM channels) AS channels_created,
       (SELECT COUNT(*) FROM listings_new) AS listings_migrated,
       (SELECT COUNT(*) FROM listing_images) AS images_migrated,
       (SELECT COUNT(*) FROM listing_channels) AS channel_associations_created;

-- ============================================
-- NEXT STEPS
-- ============================================
-- 1. Verify migration results above
-- 2. Run supabase-migration-cleanup.sql to archive old tables
-- 3. Deploy new application code
-- 4. Test with existing users
-- ============================================
