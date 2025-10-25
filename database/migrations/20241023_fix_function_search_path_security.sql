-- =====================================================
-- SECURITY FIX: Function Search Path Vulnerabilities
-- =====================================================
-- This migration fixes all function_search_path_mutable warnings
-- by setting immutable search_path on all database functions
--
-- Date: October 23, 2024
-- Issue: Supabase Security Advisor - function_search_path_mutable warnings
-- =====================================================

-- =====================================================
-- FUNCTION 1: handle_new_user
-- =====================================================
-- Purpose: Auto-create user record when auth user is created
-- Security: DEFINER with immutable search_path
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp  -- FIX: Immutable search_path
AS $$
BEGIN
  INSERT INTO public.users (id, email, name, plan_id, subscription_status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    'free',
    'active'
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- User already exists, just return
    RETURN NEW;
END;
$$;

-- =====================================================
-- FUNCTION 2: can_generate_image
-- =====================================================
-- Purpose: Check if user can generate an image within quota
-- Security: DEFINER with immutable search_path
-- =====================================================
CREATE OR REPLACE FUNCTION public.can_generate_image(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp  -- FIX: Immutable search_path
AS $$
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
  FROM public.users
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
$$;

-- =====================================================
-- FUNCTION 3: can_generate_video
-- =====================================================
-- Purpose: Check if user can generate a video within quota
-- Security: DEFINER with immutable search_path
-- =====================================================
CREATE OR REPLACE FUNCTION public.can_generate_video(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp  -- FIX: Immutable search_path
AS $$
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
  FROM public.users
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
$$;

-- =====================================================
-- FUNCTION 4: increment_image_usage
-- =====================================================
-- Purpose: Increment user's image usage counter
-- Security: DEFINER with immutable search_path
-- =====================================================
CREATE OR REPLACE FUNCTION public.increment_image_usage(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp  -- FIX: Immutable search_path
AS $$
BEGIN
  -- Increment images_used
  UPDATE public.users
  SET images_used = COALESCE(images_used, 0) + 1,
      updated_at = NOW()
  WHERE id = p_user_id;

  -- Deduct from addon quota first if available
  UPDATE public.users
  SET addon_images_quota = GREATEST(0, COALESCE(addon_images_quota, 0) - 1)
  WHERE id = p_user_id
    AND COALESCE(addon_images_quota, 0) > 0;
END;
$$;

-- =====================================================
-- FUNCTION 5: increment_video_usage
-- =====================================================
-- Purpose: Increment user's video usage counter
-- Security: DEFINER with immutable search_path
-- =====================================================
CREATE OR REPLACE FUNCTION public.increment_video_usage(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp  -- FIX: Immutable search_path
AS $$
BEGIN
  -- Increment videos_used
  UPDATE public.users
  SET videos_used = COALESCE(videos_used, 0) + 1,
      updated_at = NOW()
  WHERE id = p_user_id;

  -- Deduct from addon quota first if available
  UPDATE public.users
  SET addon_videos_quota = GREATEST(0, COALESCE(addon_videos_quota, 0) - 1)
  WHERE id = p_user_id
    AND COALESCE(addon_videos_quota, 0) > 0;
END;
$$;

-- =====================================================
-- FUNCTION 6: add_image_quota
-- =====================================================
-- Purpose: Add bonus image quota (for add-on purchases)
-- Security: DEFINER with immutable search_path
-- =====================================================
CREATE OR REPLACE FUNCTION public.add_image_quota(p_user_id UUID, p_amount INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp  -- FIX: Immutable search_path
AS $$
BEGIN
  UPDATE public.users
  SET addon_images_quota = COALESCE(addon_images_quota, 0) + p_amount,
      updated_at = NOW()
  WHERE id = p_user_id;
END;
$$;

-- =====================================================
-- FUNCTION 7: add_video_quota
-- =====================================================
-- Purpose: Add bonus video quota (for add-on purchases)
-- Security: DEFINER with immutable search_path
-- =====================================================
CREATE OR REPLACE FUNCTION public.add_video_quota(p_user_id UUID, p_amount INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp  -- FIX: Immutable search_path
AS $$
BEGIN
  UPDATE public.users
  SET addon_videos_quota = COALESCE(addon_videos_quota, 0) + p_amount,
      updated_at = NOW()
  WHERE id = p_user_id;
END;
$$;

-- =====================================================
-- FUNCTION 8: reset_monthly_usage
-- =====================================================
-- Purpose: Reset monthly usage counters (run via cron)
-- Security: DEFINER with immutable search_path
-- =====================================================
CREATE OR REPLACE FUNCTION public.reset_monthly_usage()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp  -- FIX: Immutable search_path
AS $$
BEGIN
  UPDATE public.users
  SET
    images_used = 0,
    videos_used = 0,
    updated_at = NOW();
  -- Note: addon quotas don't reset, they persist until used
END;
$$;

-- =====================================================
-- FUNCTION 9: increment_usage (Generic)
-- =====================================================
-- Purpose: Generic usage increment function
-- Security: DEFINER with immutable search_path
-- =====================================================
CREATE OR REPLACE FUNCTION public.increment_usage(
  p_user_id UUID,
  p_type TEXT,
  p_amount INTEGER DEFAULT 1
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp  -- FIX: Immutable search_path
AS $$
BEGIN
  IF p_type = 'image' THEN
    UPDATE public.users
    SET images_used = COALESCE(images_used, 0) + p_amount,
        updated_at = NOW()
    WHERE id = p_user_id;
  ELSIF p_type = 'video' THEN
    UPDATE public.users
    SET videos_used = COALESCE(videos_used, 0) + p_amount,
        updated_at = NOW()
    WHERE id = p_user_id;
  END IF;
END;
$$;

-- =====================================================
-- FUNCTION 10: update_updated_at_column (Trigger)
-- =====================================================
-- Purpose: Auto-update updated_at timestamp
-- Security: Trigger function with immutable search_path
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp  -- FIX: Immutable search_path
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- =====================================================
-- FUNCTION 11: get_listings_by_channel
-- =====================================================
-- Purpose: Get user's listings filtered by marketplace channel
-- Security: DEFINER with immutable search_path + auth check
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_listings_by_channel(p_channel_name TEXT)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  price NUMERIC,
  marketplace TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp  -- FIX: Immutable search_path
AS $$
BEGIN
  -- Ensure user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  RETURN QUERY
  SELECT
    l.id,
    l.title,
    l.description,
    l.price,
    l.marketplace,
    l.created_at
  FROM public.listings l
  WHERE l.marketplace = p_channel_name
    AND l.user_id = auth.uid();
END;
$$;

-- =====================================================
-- FUNCTION 12: get_channel_info
-- =====================================================
-- Purpose: Get aggregated stats for a channel
-- Security: DEFINER with immutable search_path + auth check
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_channel_info(p_channel_name TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp  -- FIX: Immutable search_path
AS $$
DECLARE
  v_result JSON;
BEGIN
  -- Ensure user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT json_build_object(
    'name', marketplace,
    'count', COUNT(*),
    'total_value', COALESCE(SUM(price), 0)
  )
  INTO v_result
  FROM public.listings
  WHERE marketplace = p_channel_name
    AND user_id = auth.uid()
  GROUP BY marketplace;

  RETURN COALESCE(v_result, json_build_object(
    'name', p_channel_name,
    'count', 0,
    'total_value', 0
  ));
END;
$$;

-- =====================================================
-- VERIFICATION
-- =====================================================
-- Check that all functions now have immutable search_path
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Count functions without proper search_path
  SELECT COUNT(*)
  INTO v_count
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
    AND p.proname IN (
      'handle_new_user',
      'can_generate_image',
      'can_generate_video',
      'increment_image_usage',
      'increment_video_usage',
      'add_image_quota',
      'add_video_quota',
      'reset_monthly_usage',
      'increment_usage',
      'update_updated_at_column',
      'get_listings_by_channel',
      'get_channel_info'
    )
    AND (
      prosecdef = FALSE  -- Not SECURITY DEFINER when it should be
      OR NOT EXISTS (
        SELECT 1
        FROM unnest(proconfig) AS config
        WHERE config LIKE 'search_path=%'
      )
    );

  IF v_count > 0 THEN
    RAISE NOTICE 'WARNING: % functions still have security issues', v_count;
  ELSE
    RAISE NOTICE 'SUCCESS: All functions have been secured with immutable search_path';
  END IF;
END $$;
