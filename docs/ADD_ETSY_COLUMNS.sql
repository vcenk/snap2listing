-- ============================================
-- ADD ETSY-SPECIFIC COLUMNS TO LISTINGS TABLE
-- ============================================
-- Run this in your Supabase SQL Editor

-- Add original image reference
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS original_image TEXT;

-- Add inventory fields
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1;

-- Add Etsy taxonomy fields
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS category_id BIGINT;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS occasion TEXT[];
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS holiday TEXT[];
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS recipient TEXT[];
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS style TEXT[];

-- Add Etsy listing metadata
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS who_made TEXT;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS when_made TEXT;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS renewal_option TEXT DEFAULT 'auto';

-- Add personalization fields
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS personalization_enabled BOOLEAN DEFAULT false;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS personalization_instructions TEXT;

-- Verify columns were added
SELECT
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'listings'
ORDER BY ordinal_position;

SELECT 'Etsy columns added successfully!' AS status;
