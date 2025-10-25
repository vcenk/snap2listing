-- ============================================
-- SNAP2LISTING MIGRATION CLEANUP
-- ============================================
-- Run ONLY after verifying migration success
-- This archives old tables and renames new tables
-- Author: Claude Code Migration Team
-- Date: 2025-10-15

-- ============================================
-- IMPORTANT: PRE-FLIGHT CHECKS
-- ============================================
-- Run these queries first to verify migration:
--
-- 1. Check data integrity:
--    SELECT COUNT(*) FROM listings; -- old count
--    SELECT COUNT(*) FROM listings_new; -- should match or be close
--
-- 2. Check sample data:
--    SELECT * FROM listings_new LIMIT 5;
--    SELECT * FROM listing_images WHERE listing_id IN (SELECT id FROM listings_new LIMIT 5);
--
-- 3. Verify channel associations:
--    SELECT COUNT(*) FROM listing_channels;
--
-- If all looks good, proceed with cleanup below
-- ============================================

-- ============================================
-- STEP 1: ARCHIVE OLD TABLES
-- ============================================

-- Drop old indexes first to avoid conflicts
DROP INDEX IF EXISTS idx_listings_user_id CASCADE;
DROP INDEX IF EXISTS idx_listings_status CASCADE;
DROP INDEX IF EXISTS idx_listings_created_at CASCADE;

-- Rename old listings table for backup
ALTER TABLE listings RENAME TO listings_old_backup_20251015;

-- Drop old shops table (Etsy OAuth - no longer needed)
DROP TABLE IF EXISTS shops CASCADE;

-- ============================================
-- STEP 2: RENAME NEW TABLES TO PRIMARY NAMES
-- ============================================

-- Rename listings_new to listings
ALTER TABLE listings_new RENAME TO listings;

-- Update indexes to match new table name
ALTER INDEX IF EXISTS idx_listings_new_user_id RENAME TO idx_listings_user_id;
ALTER INDEX IF EXISTS idx_listings_new_status RENAME TO idx_listings_status;
ALTER INDEX IF EXISTS idx_listings_new_created_at RENAME TO idx_listings_created_at;

-- Update triggers to match new table name
DROP TRIGGER IF EXISTS listings_new_updated_at ON listings;
CREATE TRIGGER listings_updated_at BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- STEP 3: UPDATE RLS POLICIES
-- ============================================

-- Drop old policies referencing listings_new
DROP POLICY IF EXISTS listings_new_select_own ON listings;
DROP POLICY IF EXISTS listings_new_insert_own ON listings;
DROP POLICY IF EXISTS listings_new_update_own ON listings;
DROP POLICY IF EXISTS listings_new_delete_own ON listings;

-- Create policies with correct names
CREATE POLICY listings_select_own ON listings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY listings_insert_own ON listings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY listings_update_own ON listings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY listings_delete_own ON listings
  FOR DELETE USING (auth.uid() = user_id);

-- Update dependent policies (listing_channels, listing_images, etc.)
-- These reference listings table, so they need to be recreated

-- Listing channels policies
DROP POLICY IF EXISTS listing_channels_select_own ON listing_channels;
DROP POLICY IF EXISTS listing_channels_insert_own ON listing_channels;
DROP POLICY IF EXISTS listing_channels_update_own ON listing_channels;
DROP POLICY IF EXISTS listing_channels_delete_own ON listing_channels;

CREATE POLICY listing_channels_select_own ON listing_channels
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = listing_channels.listing_id
      AND listings.user_id = auth.uid()
    )
  );

CREATE POLICY listing_channels_insert_own ON listing_channels
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = listing_channels.listing_id
      AND listings.user_id = auth.uid()
    )
  );

CREATE POLICY listing_channels_update_own ON listing_channels
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = listing_channels.listing_id
      AND listings.user_id = auth.uid()
    )
  );

CREATE POLICY listing_channels_delete_own ON listing_channels
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = listing_channels.listing_id
      AND listings.user_id = auth.uid()
    )
  );

-- Listing images policies
DROP POLICY IF EXISTS listing_images_select_own ON listing_images;
DROP POLICY IF EXISTS listing_images_insert_own ON listing_images;
DROP POLICY IF EXISTS listing_images_delete_own ON listing_images;

CREATE POLICY listing_images_select_own ON listing_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = listing_images.listing_id
      AND listings.user_id = auth.uid()
    )
  );

CREATE POLICY listing_images_insert_own ON listing_images
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = listing_images.listing_id
      AND listings.user_id = auth.uid()
    )
  );

CREATE POLICY listing_images_delete_own ON listing_images
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = listing_images.listing_id
      AND listings.user_id = auth.uid()
    )
  );

-- Keywords policies
DROP POLICY IF EXISTS keywords_select_own ON keywords;
DROP POLICY IF EXISTS keywords_insert_own ON keywords;
DROP POLICY IF EXISTS keywords_delete_own ON keywords;

CREATE POLICY keywords_select_own ON keywords
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = keywords.listing_id
      AND listings.user_id = auth.uid()
    )
  );

CREATE POLICY keywords_insert_own ON keywords
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = keywords.listing_id
      AND listings.user_id = auth.uid()
    )
  );

CREATE POLICY keywords_delete_own ON keywords
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = keywords.listing_id
      AND listings.user_id = auth.uid()
    )
  );

-- Export logs policies
DROP POLICY IF EXISTS export_logs_select_own ON export_logs;

CREATE POLICY export_logs_select_own ON export_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = export_logs.listing_id
      AND listings.user_id = auth.uid()
    )
  );

-- Listing versions policies
DROP POLICY IF EXISTS listing_versions_select_own ON listing_versions;

CREATE POLICY listing_versions_select_own ON listing_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = listing_versions.listing_id
      AND listings.user_id = auth.uid()
    )
  );

-- ============================================
-- STEP 4: UPDATE FOREIGN KEY CONSTRAINTS
-- ============================================

-- The foreign keys were already created correctly during migration
-- Just verify they exist
SELECT
  conname AS constraint_name,
  conrelid::regclass AS table_name,
  confrelid::regclass AS referenced_table
FROM pg_constraint
WHERE confrelid = 'listings'::regclass
  AND contype = 'f';

-- ============================================
-- STEP 5: VERIFY CLEANUP
-- ============================================

-- Check table structure
SELECT
  'channels' as table_name,
  COUNT(*) as row_count
FROM channels
UNION ALL
SELECT
  'listings' as table_name,
  COUNT(*) as row_count
FROM listings
UNION ALL
SELECT
  'listing_channels' as table_name,
  COUNT(*) as row_count
FROM listing_channels
UNION ALL
SELECT
  'listing_images' as table_name,
  COUNT(*) as row_count
FROM listing_images
UNION ALL
SELECT
  'keywords' as table_name,
  COUNT(*) as row_count
FROM keywords
UNION ALL
SELECT
  'export_logs' as table_name,
  COUNT(*) as row_count
FROM export_logs
UNION ALL
SELECT
  'listing_versions' as table_name,
  COUNT(*) as row_count
FROM listing_versions;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

SELECT '✅ Cleanup completed successfully!' AS status,
       'Old tables archived as listings_old_backup_20251015' AS backup_note,
       'shops table removed' AS etsy_note,
       'Ready for new application deployment!' AS next_step;

-- ============================================
-- OPTIONAL: DROP OLD BACKUP AFTER 30 DAYS
-- ============================================
-- Run this ONLY after 30 days of successful operation:
-- DROP TABLE IF EXISTS listings_old_backup_20251015 CASCADE;
-- ============================================
