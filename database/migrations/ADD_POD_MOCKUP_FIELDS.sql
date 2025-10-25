-- Migration: Add Mockup Fields for Print-on-Demand Support
-- Created: 2024-10-22
-- Description: Adds mockup-related fields to support Dynamic Mockups integration

-- Step 1: Add mockup-related fields to listings table
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS mockup_urls TEXT[],        -- Array of generated mockup image URLs
ADD COLUMN IF NOT EXISTS base_design_url TEXT,       -- Original design file URL
ADD COLUMN IF NOT EXISTS mockup_template_ids TEXT[], -- Template IDs used from Dynamic Mockups
ADD COLUMN IF NOT EXISTS selected_product_type TEXT; -- Selected PoD product type (t-shirt, mug, etc.)

-- Step 2: Create index for PoD listings with mockups
-- Note: This index requires product_type column (added in ADD_POD_SUPPORT.sql)
-- Only create if product_type column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'product_type'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_listings_pod_mockups
    ON listings(product_type, mockup_urls)
    WHERE product_type = 'pod' AND mockup_urls IS NOT NULL;
  END IF;
END $$;

-- Step 3: Create index for filtering by product type
CREATE INDEX IF NOT EXISTS idx_listings_selected_product
ON listings(selected_product_type)
WHERE selected_product_type IS NOT NULL;

-- Step 4: Add comments for documentation
COMMENT ON COLUMN listings.mockup_urls IS 'Generated mockup images from Dynamic Mockups API';
COMMENT ON COLUMN listings.base_design_url IS 'Original uploaded design/artwork URL';
COMMENT ON COLUMN listings.mockup_template_ids IS 'Array of Dynamic Mockups template IDs used';
COMMENT ON COLUMN listings.selected_product_type IS 'Specific PoD product type (e.g., t-shirt, hoodie, mug, poster)';

-- Step 5: Update existing PoD listings to have empty arrays (if any exist)
-- Note: This update requires product_type column (added in ADD_POD_SUPPORT.sql)
-- Only run if product_type column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'product_type'
  ) THEN
    UPDATE listings
    SET mockup_urls = ARRAY[]::TEXT[],
        mockup_template_ids = ARRAY[]::TEXT[]
    WHERE product_type = 'pod'
      AND mockup_urls IS NULL;
  END IF;
END $$;

-- Step 6: Migration verification query
-- Run this to verify the migration worked correctly:
/*
SELECT
  COUNT(*) as total_listings,
  COUNT(CASE WHEN product_type = 'pod' THEN 1 END) as pod_listings,
  COUNT(CASE WHEN mockup_urls IS NOT NULL AND array_length(mockup_urls, 1) > 0 THEN 1 END) as listings_with_mockups,
  COUNT(CASE WHEN selected_product_type IS NOT NULL THEN 1 END) as listings_with_product_type
FROM listings;
*/
