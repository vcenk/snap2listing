-- ============================================
-- INCREMENT USAGE FUNCTION
-- ============================================
-- This function is called after creating a listing to update usage counters

DROP FUNCTION IF EXISTS increment_usage(UUID, INTEGER, INTEGER);

CREATE OR REPLACE FUNCTION increment_usage(
  p_user_id UUID,
  p_images INTEGER,
  p_videos INTEGER
)
RETURNS VOID AS $$
BEGIN
  -- Update images and videos used
  UPDATE users
  SET
    images_used = COALESCE(images_used, 0) + p_images,
    videos_used = COALESCE(videos_used, 0) + p_videos
  WHERE id = p_user_id;

  -- Deduct from addon quotas if available
  IF p_images > 0 THEN
    UPDATE users
    SET addon_images_quota = GREATEST(0, COALESCE(addon_images_quota, 0) - p_images)
    WHERE id = p_user_id
    AND COALESCE(addon_images_quota, 0) > 0;
  END IF;

  IF p_videos > 0 THEN
    UPDATE users
    SET addon_videos_quota = GREATEST(0, COALESCE(addon_videos_quota, 0) - p_videos)
    WHERE id = p_user_id
    AND COALESCE(addon_videos_quota, 0) > 0;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT 'increment_usage function created successfully!' AS status;
