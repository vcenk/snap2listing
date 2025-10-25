-- Migration: Add Print-on-Demand (PoD) Product Type Support
-- Created: 2024-10-22
-- Description: Adds product_type column and PoD-specific fields to listings table

-- Step 1: Add product_type column to listings table
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS product_type TEXT
CHECK (product_type IN ('physical', 'digital', 'pod'))
DEFAULT 'physical';

-- Step 2: Add PoD-specific fields
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS pod_provider TEXT,          -- 'printful', 'printify', 'dynamicmockups', etc.
ADD COLUMN IF NOT EXISTS mockup_template_id TEXT,    -- External mockup template ID
ADD COLUMN IF NOT EXISTS base_product_sku TEXT;       -- Base product SKU (e.g., 't-shirt-white-m')

-- Step 3: Create index for efficient filtering by product type
CREATE INDEX IF NOT EXISTS idx_listings_product_type
ON listings(product_type);

-- Step 4: Create index for filtering PoD listings by provider
CREATE INDEX IF NOT EXISTS idx_listings_pod_provider
ON listings(pod_provider)
WHERE pod_provider IS NOT NULL;

-- Step 5: Add comment for documentation
COMMENT ON COLUMN listings.product_type IS 'Type of product: physical (tangible items), digital (downloadable), or pod (print-on-demand)';
COMMENT ON COLUMN listings.pod_provider IS 'PoD service provider (e.g., printful, printify, dynamicmockups)';
COMMENT ON COLUMN listings.mockup_template_id IS 'External mockup template identifier for PoD products';
COMMENT ON COLUMN listings.base_product_sku IS 'Base product SKU for PoD items (e.g., t-shirt, mug, poster)';

-- Step 6: Migration verification query
-- SELECT COUNT(*) as total_listings,
--        COUNT(CASE WHEN product_type = 'physical' THEN 1 END) as physical_count,
--        COUNT(CASE WHEN product_type = 'digital' THEN 1 END) as digital_count,
--        COUNT(CASE WHEN product_type = 'pod' THEN 1 END) as pod_count
-- FROM listings;
