-- ============================================================================
-- UPDATE CHANNELS WITH VALIDATION RULES
-- Purpose: Add missing validation_rules to existing channels
-- ============================================================================

-- Update Shopify
UPDATE channels
SET validation_rules = '{
  "title": {"required": true, "maxLength": 255},
  "description": {"required": true, "maxLength": 65535},
  "price": {"required": true, "min": 0},
  "images": {"required": true, "min": 1, "max": 250}
}'::jsonb,
config = config || '{"description": "Perfect for your own online store"}'::jsonb
WHERE slug = 'shopify';

-- Update eBay
UPDATE channels
SET validation_rules = '{
  "title": {"required": true, "maxLength": 80},
  "description": {"required": true, "maxLength": 500000},
  "price": {"required": true, "min": 0},
  "category": {"required": true},
  "images": {"required": true, "min": 1, "max": 24}
}'::jsonb,
config = config || '{"description": "Auction and fixed-price marketplace"}'::jsonb
WHERE slug = 'ebay';

-- Update Amazon
UPDATE channels
SET validation_rules = '{
  "title": {"required": true, "maxLength": 200},
  "description": {"required": true, "maxLength": 2000},
  "bullets": {"required": true, "max": 5},
  "price": {"required": true, "min": 0},
  "images": {"required": true, "min": 1, "max": 9}
}'::jsonb,
config = config || '{"description": "Worlds largest marketplace"}'::jsonb
WHERE slug = 'amazon';

-- Update Etsy
UPDATE channels
SET validation_rules = '{
  "title": {"required": true, "maxLength": 140},
  "description": {"required": true, "maxLength": 5000},
  "tags": {"required": true, "max": 13},
  "price": {"required": true, "min": 0.20},
  "images": {"required": true, "min": 1, "max": 10},
  "materials": {"max": 13}
}'::jsonb,
config = config || '{"description": "Handmade and vintage marketplace"}'::jsonb
WHERE slug = 'etsy';

-- Update Facebook & Instagram
UPDATE channels
SET validation_rules = '{
  "title": {"required": true, "maxLength": 100},
  "description": {"required": true, "maxLength": 5000},
  "price": {"required": true, "min": 0},
  "images": {"required": true, "min": 1, "max": 20}
}'::jsonb,
config = config || '{"description": "Social commerce platform"}'::jsonb
WHERE slug = 'facebook-ig';

-- Update TikTok Shop
UPDATE channels
SET validation_rules = '{
  "title": {"required": true, "maxLength": 255},
  "description": {"required": true, "maxLength": 5000},
  "price": {"required": true, "min": 0},
  "images": {"required": true, "min": 1, "max": 9},
  "video": {"recommended": true}
}'::jsonb,
config = config || '{"description": "Social shopping platform"}'::jsonb
WHERE slug = 'tiktok';

-- Verify the updates
SELECT
  name,
  slug,
  config->>'description' as description,
  validation_rules->'title'->>'maxLength' as title_max_length,
  validation_rules->'images'->>'min' as min_images
FROM channels
ORDER BY name;
