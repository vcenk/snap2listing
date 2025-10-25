-- ============================================
-- USAGE LIMIT CHECK FUNCTIONS (UPDATED)
-- ============================================
-- Run this AFTER adding missing columns

-- Drop old versions first
DROP FUNCTION IF EXISTS can_generate_image(UUID);
DROP FUNCTION IF EXISTS can_generate_video(UUID);
DROP FUNCTION IF EXISTS increment_image_usage(UUID);
DROP FUNCTION IF EXISTS increment_video_usage(UUID);
DROP FUNCTION IF EXISTS add_image_quota(UUID, INTEGER);
DROP FUNCTION IF EXISTS add_video_quota(UUID, INTEGER);

-- ============================================
-- CHECK IF USER CAN GENERATE IMAGE
-- ============================================
CREATE OR REPLACE FUNCTION can_generate_image(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_plan_id TEXT;
  v_images_limit INTEGER;
  v_images_used INTEGER;
  v_addon_quota INTEGER;
BEGIN
  -- Get user's plan and usage (with COALESCE for NULL safety)
  SELECT
    plan_id,
    COALESCE(images_used, 0),
    COALESCE(addon_images_quota, 0)
  INTO v_plan_id, v_images_used, v_addon_quota
  FROM users
  WHERE id = p_user_id;

  -- If user not found, return false
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Get plan's image limit
  CASE COALESCE(v_plan_id, 'free')
    WHEN 'free' THEN v_images_limit := 15;
    WHEN 'starter' THEN v_images_limit := 100;
    WHEN 'pro' THEN v_images_limit := 300;
    WHEN 'enterprise' THEN v_images_limit := 1000;
    ELSE v_images_limit := 15; -- Default to free
  END CASE;

  -- Check if under limit (including add-on quota)
  RETURN (v_images_used < v_images_limit + v_addon_quota);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- CHECK IF USER CAN GENERATE VIDEO
-- ============================================
CREATE OR REPLACE FUNCTION can_generate_video(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_plan_id TEXT;
  v_videos_limit INTEGER;
  v_videos_used INTEGER;
  v_addon_quota INTEGER;
BEGIN
  -- Get user's plan and usage (with COALESCE for NULL safety)
  SELECT
    plan_id,
    COALESCE(videos_used, 0),
    COALESCE(addon_videos_quota, 0)
  INTO v_plan_id, v_videos_used, v_addon_quota
  FROM users
  WHERE id = p_user_id;

  -- If user not found, return false
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Get plan's video limit
  CASE COALESCE(v_plan_id, 'free')
    WHEN 'free' THEN v_videos_limit := 1;
    WHEN 'starter' THEN v_videos_limit := 5;
    WHEN 'pro' THEN v_videos_limit := 15;
    WHEN 'enterprise' THEN v_videos_limit := 50;
    ELSE v_videos_limit := 1; -- Default to free
  END CASE;

  -- Check if under limit (including add-on quota)
  RETURN (v_videos_used < v_videos_limit + v_addon_quota);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- INCREMENT IMAGE USAGE
-- ============================================
CREATE OR REPLACE FUNCTION increment_image_usage(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Increment images_used
  UPDATE users
  SET images_used = COALESCE(images_used, 0) + 1
  WHERE id = p_user_id;

  -- Deduct from addon quota first if available
  UPDATE users
  SET addon_images_quota = GREATEST(0, COALESCE(addon_images_quota, 0) - 1)
  WHERE id = p_user_id
  AND COALESCE(addon_images_quota, 0) > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- INCREMENT VIDEO USAGE
-- ============================================
CREATE OR REPLACE FUNCTION increment_video_usage(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Increment videos_used
  UPDATE users
  SET videos_used = COALESCE(videos_used, 0) + 1
  WHERE id = p_user_id;

  -- Deduct from addon quota first if available
  UPDATE users
  SET addon_videos_quota = GREATEST(0, COALESCE(addon_videos_quota, 0) - 1)
  WHERE id = p_user_id
  AND COALESCE(addon_videos_quota, 0) > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ADD IMAGE QUOTA (for add-on purchases)
-- ============================================
CREATE OR REPLACE FUNCTION add_image_quota(p_user_id UUID, p_amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET addon_images_quota = COALESCE(addon_images_quota, 0) + p_amount
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ADD VIDEO QUOTA (for add-on purchases)
-- ============================================
CREATE OR REPLACE FUNCTION add_video_quota(p_user_id UUID, p_amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET addon_videos_quota = COALESCE(addon_videos_quota, 0) + p_amount
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- MONTHLY USAGE RESET (run via cron)
-- ============================================
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET
    images_used = 0,
    videos_used = 0;
  -- Note: addon quotas don't reset, they persist until used
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TEST THE FUNCTIONS
-- ============================================

-- Test can_generate_image (should return true for new free user)
SELECT can_generate_image('250d0da3-53c3-4e97-b8c0-8c65bbb57342') AS can_generate_image;

-- Test can_generate_video (should return true for new free user)
SELECT can_generate_video('250d0da3-53c3-4e97-b8c0-8c65bbb57342') AS can_generate_video;

-- Check current user stats
SELECT
  id,
  email,
  plan_id,
  COALESCE(images_used, 0) AS images_used,
  COALESCE(videos_used, 0) AS videos_used,
  COALESCE(addon_images_quota, 0) AS addon_images_quota,
  COALESCE(addon_videos_quota, 0) AS addon_videos_quota
FROM users
WHERE id = '250d0da3-53c3-4e97-b8c0-8c65bbb57342';

SELECT 'Usage limit functions updated successfully!' AS status;
