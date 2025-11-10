-- ============================================================================
-- FIX USER SIGNUP 403 ERROR
-- Purpose: Add missing INSERT policy for users table
-- Issue: Users can't sign up because RLS blocks INSERT into users table
-- ============================================================================

-- First, drop the policy if it exists (to avoid errors)
DROP POLICY IF EXISTS "Users can create own profile" ON users;

-- Add INSERT policy for authenticated users to create their own profile
CREATE POLICY "Users can create own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Verify policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;
