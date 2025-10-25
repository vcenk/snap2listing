-- =====================================================
-- SECURITY FIX: Add search_path to existing functions
-- =====================================================
-- This migration adds SET search_path to all versions
-- of increment_usage and get_listings_by_channel
--
-- Date: October 23, 2024
-- =====================================================

-- =====================================================
-- FUNCTION 1: increment_usage (old signature with p_images, p_videos)
-- =====================================================
-- Check if this version exists and fix it
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
      AND p.proname = 'increment_usage'
      AND pg_get_function_arguments(p.oid) LIKE '%p_images%'
  ) THEN
    EXECUTE $$func$
      CREATE OR REPLACE FUNCTION public.increment_usage(
        p_user_id UUID,
        p_images INTEGER,
        p_videos INTEGER
      )
      RETURNS VOID
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = public, pg_temp
      AS $body$
      BEGIN
        UPDATE public.users
        SET
          images_used = COALESCE(images_used, 0) + p_images,
          videos_used = COALESCE(videos_used, 0) + p_videos
        WHERE id = p_user_id;

        IF p_images > 0 THEN
          UPDATE public.users
          SET addon_images_quota = GREATEST(0, COALESCE(addon_images_quota, 0) - p_images)
          WHERE id = p_user_id
            AND COALESCE(addon_images_quota, 0) > 0;
        END IF;

        IF p_videos > 0 THEN
          UPDATE public.users
          SET addon_videos_quota = GREATEST(0, COALESCE(addon_videos_quota, 0) - p_videos)
          WHERE id = p_user_id
            AND COALESCE(addon_videos_quota, 0) > 0;
        END IF;
      END;
      $body$;
    $$func$;
    RAISE NOTICE 'Fixed increment_usage(p_user_id, p_images, p_videos)';
  END IF;
END $$;

-- =====================================================
-- FUNCTION 2: increment_usage (new signature with p_type, p_amount)
-- =====================================================
-- Check if this version exists and fix it
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
      AND p.proname = 'increment_usage'
      AND pg_get_function_arguments(p.oid) LIKE '%p_type%'
  ) THEN
    EXECUTE $$func$
      CREATE OR REPLACE FUNCTION public.increment_usage(
        p_user_id UUID,
        p_type TEXT,
        p_amount INTEGER DEFAULT 1
      )
      RETURNS VOID
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = public, pg_temp
      AS $body$
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
      $body$;
    $$func$;
    RAISE NOTICE 'Fixed increment_usage(p_user_id, p_type, p_amount)';
  END IF;
END $$;

-- =====================================================
-- FUNCTION 3: get_listings_by_channel
-- =====================================================
-- Drop all versions and recreate with search_path
DO $$
BEGIN
  -- Drop all possible versions
  DROP FUNCTION IF EXISTS public.get_listings_by_channel(TEXT);

  -- Check if listings table exists before creating function
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'listings') THEN
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
      AS $body$
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
      $body$;
    $$func$;
    RAISE NOTICE 'Fixed get_listings_by_channel(p_channel_name)';
  ELSE
    RAISE NOTICE 'Skipped get_listings_by_channel - listings table does not exist';
  END IF;
END $$;

-- =====================================================
-- VERIFICATION
-- =====================================================
DO $$
DECLARE
  v_function RECORD;
  v_total INTEGER := 0;
  v_secured INTEGER := 0;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== FUNCTION SECURITY VERIFICATION ===';
  RAISE NOTICE '';

  FOR v_function IN
    SELECT
      p.proname AS name,
      pg_get_function_arguments(p.oid) AS args,
      EXISTS (
        SELECT 1
        FROM unnest(p.proconfig) AS config
        WHERE config LIKE 'search_path=%'
      ) AS has_search_path
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
      AND p.proname IN ('increment_usage', 'get_listings_by_channel')
    ORDER BY p.proname, p.oid
  LOOP
    v_total := v_total + 1;

    RAISE NOTICE 'Function: %(%)', v_function.name, v_function.args;
    RAISE NOTICE '  search_path: %',
      CASE WHEN v_function.has_search_path THEN '✓ SECURED' ELSE '✗ MISSING' END;

    IF v_function.has_search_path THEN
      v_secured := v_secured + 1;
    END IF;
  END LOOP;

  RAISE NOTICE '';
  RAISE NOTICE '---';
  RAISE NOTICE 'Total functions: %', v_total;
  RAISE NOTICE 'Secured: %', v_secured;
  RAISE NOTICE 'Insecure: %', v_total - v_secured;

  IF v_total = v_secured AND v_total > 0 THEN
    RAISE NOTICE 'SUCCESS: All functions secured!';
  ELSIF v_total = 0 THEN
    RAISE NOTICE 'WARNING: No matching functions found';
  ELSE
    RAISE NOTICE 'WARNING: Some functions still need fixing';
  END IF;

  RAISE NOTICE '=== END VERIFICATION ===';
  RAISE NOTICE '';
END $$;
