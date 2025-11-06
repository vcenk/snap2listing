-- ============================================
-- FIX: Duplicate Email Issue After Re-signup
-- ============================================
-- Problem: Old user record exists with the same email
-- but new auth user was created with different ID
--
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Find the old user record with your email
SELECT
  id,
  email,
  name,
  plan_id,
  created_at
FROM public.users
WHERE email IN (
  SELECT email
  FROM auth.users
  WHERE id = 'b1268f57-7765-434d-8a16-5a63111575ff'
);

-- Step 2: Delete the old user record
-- This will also cascade delete any listings, shops, etc. associated with the old account
-- If you want to keep old data, use the UPDATE approach instead (see Step 3)
DELETE FROM public.users
WHERE email IN (
  SELECT email
  FROM auth.users
  WHERE id = 'b1268f57-7765-434d-8a16-5a63111575ff'
)
AND id != 'b1268f57-7765-434d-8a16-5a63111575ff';

-- Step 3: Create the new user record
INSERT INTO public.users (
  id,
  email,
  name,
  plan_id,
  subscription_status,
  credits_used,
  credits_limit,
  account_created_at
)
SELECT
  id,
  email,
  COALESCE(raw_user_meta_data->>'name', email) as name,
  'free' as plan_id,
  'active' as subscription_status,
  0 as credits_used,
  15 as credits_limit,
  created_at as account_created_at
FROM auth.users
WHERE id = 'b1268f57-7765-434d-8a16-5a63111575ff'
ON CONFLICT (id) DO NOTHING;

-- Step 4: Verify the fix
SELECT
  id,
  email,
  name,
  plan_id,
  credits_used,
  credits_limit,
  account_created_at,
  created_at
FROM public.users
WHERE id = 'b1268f57-7765-434d-8a16-5a63111575ff';

SELECT 'Fix complete! Refresh your dashboard.' as status;
