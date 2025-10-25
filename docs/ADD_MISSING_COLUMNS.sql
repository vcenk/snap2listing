-- ============================================
-- ADD MISSING COLUMNS TO USERS TABLE
-- ============================================
-- Run this in your Supabase SQL Editor

-- Add addon quota columns
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS addon_images_quota INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS addon_videos_quota INTEGER DEFAULT 0;

-- Add Stripe columns (if missing)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMP;

-- Add metadata columns (if missing)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;

-- Verify all required columns exist
SELECT
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'users'
ORDER BY ordinal_position;

-- Update any existing users to have 0 for addon quotas (if they were NULL)
UPDATE public.users
SET
  addon_images_quota = COALESCE(addon_images_quota, 0),
  addon_videos_quota = COALESCE(addon_videos_quota, 0),
  images_used = COALESCE(images_used, 0),
  videos_used = COALESCE(videos_used, 0)
WHERE
  addon_images_quota IS NULL
  OR addon_videos_quota IS NULL
  OR images_used IS NULL
  OR videos_used IS NULL;

SELECT 'Missing columns added successfully!' AS status;
