-- ============================================================================
-- POPULATE CHANNELS TABLE
-- Purpose: Insert marketplace/channel data for listing creation
-- ============================================================================

-- First, check if channels already exist to avoid duplicates
DO $$
BEGIN
  -- Only insert if table is empty
  IF NOT EXISTS (SELECT 1 FROM channels LIMIT 1) THEN

    INSERT INTO channels (name, slug, config, export_format, validation_rules) VALUES

    -- Shopify
    ('Shopify', 'shopify',
      '{"requiredFields": ["title", "description", "price", "images"], "maxTitleLength": 255, "maxDescriptionLength": 65535, "description": "Perfect for your own online store"}'::jsonb,
      'csv',
      '{"title": {"required": true, "maxLength": 255}, "description": {"required": true, "maxLength": 65535}, "price": {"required": true, "min": 0}, "images": {"required": true, "min": 1, "max": 250}}'::jsonb
    ),

    -- eBay
    ('eBay', 'ebay',
      '{"requiredFields": ["title", "description", "price", "category"], "maxTitleLength": 80, "maxDescriptionLength": 500000, "description": "Auction and fixed-price marketplace"}'::jsonb,
      'csv',
      '{"title": {"required": true, "maxLength": 80}, "description": {"required": true, "maxLength": 500000}, "price": {"required": true, "min": 0}, "category": {"required": true}, "images": {"required": true, "min": 1, "max": 24}}'::jsonb
    ),

    -- Amazon
    ('Amazon', 'amazon',
      '{"requiredFields": ["title", "description", "price", "bullets"], "maxTitleLength": 200, "maxBullets": 5, "description": "Worlds largest marketplace"}'::jsonb,
      'csv',
      '{"title": {"required": true, "maxLength": 200}, "description": {"required": true, "maxLength": 2000}, "bullets": {"required": true, "max": 5}, "price": {"required": true, "min": 0}, "images": {"required": true, "min": 1, "max": 9}}'::jsonb
    ),

    -- Etsy
    ('Etsy', 'etsy',
      '{"requiredFields": ["title", "description", "price", "tags"], "maxTitleLength": 140, "maxTags": 13, "description": "Handmade and vintage marketplace"}'::jsonb,
      'csv',
      '{"title": {"required": true, "maxLength": 140}, "description": {"required": true, "maxLength": 5000}, "tags": {"required": true, "max": 13}, "price": {"required": true, "min": 0.20}, "images": {"required": true, "min": 1, "max": 10}, "materials": {"max": 13}}'::jsonb
    ),

    -- Facebook & Instagram
    ('Facebook & Instagram', 'facebook-ig',
      '{"requiredFields": ["title", "description", "price", "images"], "maxTitleLength": 100, "description": "Social commerce platform"}'::jsonb,
      'csv',
      '{"title": {"required": true, "maxLength": 100}, "description": {"required": true, "maxLength": 5000}, "price": {"required": true, "min": 0}, "images": {"required": true, "min": 1, "max": 20}}'::jsonb
    ),

    -- TikTok Shop
    ('TikTok Shop', 'tiktok',
      '{"requiredFields": ["title", "description", "price", "video"], "maxTitleLength": 255, "description": "Social shopping platform"}'::jsonb,
      'csv',
      '{"title": {"required": true, "maxLength": 255}, "description": {"required": true, "maxLength": 5000}, "price": {"required": true, "min": 0}, "images": {"required": true, "min": 1, "max": 9}, "video": {"recommended": true}}'::jsonb
    );

    RAISE NOTICE 'Successfully inserted 6 channels (Shopify, eBay, Amazon, Etsy, Facebook/Instagram, TikTok)';
  ELSE
    RAISE NOTICE 'Channels table already has data. Skipping insert.';
  END IF;
END $$;

-- Verify the channels were inserted
SELECT
  name,
  slug,
  export_format,
  config->>'description' as description,
  created_at
FROM channels
ORDER BY name;
