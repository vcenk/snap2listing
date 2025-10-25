-- =====================================================
-- SECURITY FIX: Function Search Path - FINAL VERSION
-- =====================================================
-- This migration fixes all function_search_path_mutable warnings
-- Handles triggers and dependencies correctly
--
-- Date: October 23, 2024
-- FINAL: Uses CREATE OR REPLACE to avoid dropping functions
-- =====================================================

-- =====================================================
-- FUNCTION 1: handle_new_user (has trigger dependency)
-- =====================================================
-- Use CREATE OR REPLACE instead of DROP to preserve trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp  -- FIX: Add immutable search_path
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
    RETURN NEW;
END;
$$;

-- =====================================================
-- FUNCTION 2: can_generate_image
-- =====================================================
CREATE OR REPLACE FUNCTION public.can_generate_image(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_plan_id TEXT;
  v_images_limit INTEGER;
  v_images_used INTEGER;
  v_addon_quota INTEGER;
BEGIN
  SELECT
    plan_id,
    COALESCE(images_used, 0),
    COALESCE(addon_images_quota, 0)
  INTO v_plan_id, v_images_used, v_addon_quota
  FROM public.users
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  CASE COALESCE(v_plan_id, 'free')
    WHEN 'free' THEN v_images_limit := 15;
    WHEN 'starter' THEN v_images_limit := 100;
    WHEN 'pro' THEN v_images_limit := 300;
    WHEN 'enterprise' THEN v_images_limit := 1000;
    ELSE v_images_limit := 15;
  END CASE;

  RETURN (v_images_used < v_images_limit + v_addon_quota);
END;
$$;

-- =====================================================
-- FUNCTION 3: can_generate_video
-- =====================================================
CREATE OR REPLACE FUNCTION public.can_generate_video(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_plan_id TEXT;
  v_videos_limit INTEGER;
  v_videos_used INTEGER;
  v_addon_quota INTEGER;
BEGIN
  SELECT
    plan_id,
    COALESCE(videos_used, 0),
    COALESCE(addon_videos_quota, 0)
  INTO v_plan_id, v_videos_used, v_addon_quota
  FROM public.users
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  CASE COALESCE(v_plan_id, 'free')
    WHEN 'free' THEN v_videos_limit := 1;
    WHEN 'starter' THEN v_videos_limit := 5;
    WHEN 'pro' THEN v_videos_limit := 15;
    WHEN 'enterprise' THEN v_videos_limit := 50;
    ELSE v_videos_limit := 1;
  END CASE;

  RETURN (v_videos_used < v_videos_limit + v_addon_quota);
END;
$$;

-- =====================================================
-- FUNCTION 4: increment_image_usage
-- =====================================================
CREATE OR REPLACE FUNCTION public.increment_image_usage(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.users
  SET images_used = COALESCE(images_used, 0) + 1,
      updated_at = NOW()
  WHERE id = p_user_id;

  UPDATE public.users
  SET addon_images_quota = GREATEST(0, COALESCE(addon_images_quota, 0) - 1)
  WHERE id = p_user_id
    AND COALESCE(addon_images_quota, 0) > 0;
END;
$$;

-- =====================================================
-- FUNCTION 5: increment_video_usage
-- =====================================================
CREATE OR REPLACE FUNCTION public.increment_video_usage(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.users
  SET videos_used = COALESCE(videos_used, 0) + 1,
      updated_at = NOW()
  WHERE id = p_user_id;

  UPDATE public.users
  SET addon_videos_quota = GREATEST(0, COALESCE(addon_videos_quota, 0) - 1)
  WHERE id = p_user_id
    AND COALESCE(addon_videos_quota, 0) > 0;
END;
$$;

-- =====================================================
-- FUNCTION 6: add_image_quota
-- =====================================================
CREATE OR REPLACE FUNCTION public.add_image_quota(p_user_id UUID, p_amount INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
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
CREATE OR REPLACE FUNCTION public.add_video_quota(p_user_id UUID, p_amount INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
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
CREATE OR REPLACE FUNCTION public.reset_monthly_usage()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.users
  SET images_used = 0,
      videos_used = 0,
      updated_at = NOW();
END;
$$;

-- =====================================================
-- FUNCTION 9: increment_usage
-- =====================================================
CREATE OR REPLACE FUNCTION public.increment_usage(
  p_user_id UUID,
  p_type TEXT,
  p_amount INTEGER DEFAULT 1
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
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
-- FUNCTION 10: update_updated_at_column (used by triggers)
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- =====================================================
-- FUNCTION 11: update_updated_at (alternative name)
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

-- =====================================================
-- FUNCTION 12: get_listings_by_channel
-- =====================================================
-- Only create if listings table exists
-- Drop and recreate to fix return type issues
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'listings') THEN
    -- Drop the old version first
    DROP FUNCTION IF EXISTS public.get_listings_by_channel(TEXT);

    -- Create with correct return type
    EXECUTE $$func$
      CREATE FUNCTION public.get_listings_by_channel(p_channel_name TEXT)
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
      SET search_path = public, pg_temp
      AS $inner$
      BEGIN
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
      $inner$;
    $$func$;
  END IF;
END $$;

-- =====================================================
-- FUNCTION 13: get_channel_info
-- =====================================================
-- Only create if listings table exists
-- Drop and recreate to fix return type issues
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'listings') THEN
    -- Drop the old version first
    DROP FUNCTION IF EXISTS public.get_channel_info(TEXT);

    -- Create with correct return type
    EXECUTE $$func$
      CREATE FUNCTION public.get_channel_info(p_channel_name TEXT)
      RETURNS JSON
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = public, pg_temp
      AS $inner$
      DECLARE
        v_result JSON;
      BEGIN
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
      $inner$;
    $$func$;
  END IF;
END $$;

-- =====================================================
-- VERIFICATION
-- =====================================================
DO $$
DECLARE
  v_function RECORD;
  v_insecure_count INTEGER := 0;
  v_total_count INTEGER := 0;
BEGIN
  RAISE NOTICE '=== FUNCTION SECURITY VERIFICATION ===';
  RAISE NOTICE '';

  FOR v_function IN
    SELECT
      p.proname AS function_name,
      CASE WHEN p.prosecdef THEN 'DEFINER' ELSE 'INVOKER' END AS security_type,
      EXISTS (
        SELECT 1
        FROM unnest(p.proconfig) AS config
        WHERE config LIKE 'search_path=%'
      ) AS has_search_path
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
        'update_updated_at',
        'get_listings_by_channel',
        'get_channel_info'
      )
    ORDER BY p.proname
  LOOP
    v_total_count := v_total_count + 1;

    RAISE NOTICE 'Function: % | Security: % | search_path: %',
      RPAD(v_function.function_name, 30),
      RPAD(v_function.security_type, 8),
      CASE WHEN v_function.has_search_path THEN '✓ SECURED' ELSE '✗ MISSING' END;

    IF NOT v_function.has_search_path THEN
      v_insecure_count := v_insecure_count + 1;
    END IF;
  END LOOP;

  RAISE NOTICE '';
  RAISE NOTICE '---';
  RAISE NOTICE 'Total functions checked: %', v_total_count;
  RAISE NOTICE 'Secured: %', v_total_count - v_insecure_count;
  RAISE NOTICE 'Insecure: %', v_insecure_count;
  RAISE NOTICE '---';

  IF v_insecure_count = 0 THEN
    RAISE NOTICE '✓✓✓ SUCCESS: All functions secured with immutable search_path! ✓✓✓';
  ELSE
    RAISE NOTICE '✗✗✗ WARNING: % functions still need search_path ✗✗✗', v_insecure_count;
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '=== END VERIFICATION ===';
END $$;
