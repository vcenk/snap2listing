-- ============================================================================
-- FIX CHANNELS RLS - Allow Public Read Access
-- Purpose: Channels should be readable by everyone (they're reference data)
-- Issue: RLS is blocking SELECT queries on channels table
-- ============================================================================

-- Check current policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'channels'
ORDER BY policyname;

-- Drop existing restrictive policies if any
DROP POLICY IF EXISTS "Channels are viewable by authenticated users" ON channels;
DROP POLICY IF EXISTS "Service role has full access to channels" ON channels;

-- Add public read access to channels (reference data should be public)
CREATE POLICY "Anyone can view channels"
  ON channels FOR SELECT
  USING (true);

-- Service role needs full access for admin operations
CREATE POLICY "Service role has full access to channels"
  ON channels FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Verify channels exist
SELECT COUNT(*) as channel_count FROM channels;

-- Show all channels
SELECT id, name, slug, config->>'description' as description FROM channels ORDER BY name;

-- Verify policies were created
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'channels'
ORDER BY policyname;
