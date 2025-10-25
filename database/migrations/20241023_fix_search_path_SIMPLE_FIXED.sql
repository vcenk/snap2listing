-- =====================================================
-- SECURITY FIX: Function Search Path - SIMPLIFIED
-- =====================================================
-- This migration fixes the function_search_path_mutable warnings
-- for the three functions reported by Supabase linter
--
-- Date: October 23, 2024
-- =====================================================

-- =====================================================
-- FUNCTION 1: increment_usage
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
-- FUNCTION 2: get_listings_by_channel
-- =====================================================
DROP FUNCTION IF EXISTS public.get_listings_by_channel(TEXT);

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
SET search_path = public, pg_temp
AS $$
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
$$;

-- =====================================================
-- FUNCTION 3: get_channel_info
-- =====================================================
DROP FUNCTION IF EXISTS public.get_channel_info(TEXT);

CREATE OR REPLACE FUNCTION public.get_channel_info(p_channel_name TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
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
$$;

-- =====================================================
-- VERIFICATION - Check that all functions are secured
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
        'increment_usage',
        'get_listings_by_channel',
        'get_channel_info'
      )
    ORDER BY p.proname
  LOOP
    v_total_count := v_total_count + 1;

    RAISE NOTICE 'Function: % | Security: % | search_path: %',
      RPAD(v_function.function_name, 30),
      RPAD(v_function.security_type, 8),
      CASE WHEN v_function.has_search_path THEN 'SECURED' ELSE 'MISSING' END;

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
    RAISE NOTICE 'SUCCESS: All functions secured with immutable search_path!';
  ELSE
    RAISE NOTICE 'WARNING: % functions still need search_path', v_insecure_count;
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '=== END VERIFICATION ===';
END $$;
