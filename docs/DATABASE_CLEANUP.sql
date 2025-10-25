-- ============================================
-- DATABASE CLEANUP - Remove Redundant Tables
-- ============================================
-- This script removes old/redundant tables that have been replaced
-- by the new multi-channel schema
-- 
-- ⚠️ BACKUP FIRST! Run this only after verifying data migration
-- Run this in your Supabase SQL Editor

-- ============================================
-- STEP 1: VERIFY BEFORE CLEANUP
-- ============================================

-- Check if old tables have any data
SELECT 'listing_channels' as table_name, COUNT(*) as row_count FROM listing_channels
UNION ALL
SELECT 'listing_images', COUNT(*) FROM listing_images
UNION ALL
SELECT 'listing_versions', COUNT(*) FROM listing_versions
UNION ALL
SELECT 'export_logs', COUNT(*) FROM export_logs
UNION ALL
SELECT 'export_kits', COUNT(*) FROM export_kits
UNION ALL
SELECT 'export_items', COUNT(*) FROM export_items;

-- ============================================
-- STEP 2: SAFE REMOVAL (Comment out what you want to keep)
-- ============================================

-- Drop old backup table (SAFE - it's a backup)
DROP TABLE IF EXISTS public.listings_old_backup_20251015 CASCADE;

-- Drop redundant listing-related tables (replaced by new schema)
-- Uncomment these after verifying data is in new listings.base and listings.channels

-- DROP TABLE IF EXISTS public.listing_channels CASCADE;
-- DROP TABLE IF EXISTS public.listing_images CASCADE;
-- DROP TABLE IF EXISTS public.listing_versions CASCADE;

-- ============================================
-- STEP 3: CONSOLIDATE EXPORT TABLES
-- ============================================

-- You have multiple export tables. Decide which to keep:
-- Option A: Keep listing_exports (NEW), drop old ones
-- Option B: Migrate data from old tables to listing_exports

-- Check if export_logs has data you need
SELECT 
  'export_logs has data' as note,
  COUNT(*) as records,
  MIN(created_at) as oldest,
  MAX(created_at) as newest
FROM export_logs;

-- If export_logs is empty or old, drop it:
-- DROP TABLE IF EXISTS public.export_logs CASCADE;

-- Same for export_kits and export_items (if not used):
-- DROP TABLE IF EXISTS public.export_kits CASCADE;
-- DROP TABLE IF EXISTS public.export_items CASCADE;

-- ============================================
-- STEP 4: REMOVE UNUSED FEATURE TABLES
-- ============================================

-- If you're not using these features, remove them:

-- Brand kits (if not using brand management)
-- DROP TABLE IF EXISTS public.brand_kits CASCADE;

-- Insight reports (if not using analytics)
-- DROP TABLE IF EXISTS public.insight_reports CASCADE;

-- ============================================
-- STEP 5: KEEP USEFUL TABLES (DO NOT DROP)
-- ============================================

-- ✅ KEEP these - they're useful:
-- - templates: Listing templates
-- - keywords: SEO keywords library  
-- - usage_logs: Activity tracking
-- - shops: Connected shop accounts

-- ============================================
-- RECOMMENDED: MINIMAL SCHEMA
-- ============================================

-- For a clean multi-channel setup, you only need:
/*
CORE TABLES:
✅ users
✅ listings (with base + channels JSONB)
✅ channels
✅ listing_exports
✅ ai_generation_history

OPTIONAL USEFUL TABLES:
✅ templates
✅ keywords
✅ usage_logs
✅ shops (if using OAuth connections)

EVERYTHING ELSE: Can likely be removed
*/

-- ============================================
-- STEP 6: CLEAN RUN (Conservative)
-- ============================================

-- This is the SAFE version - only removes obvious redundancy
-- Uncomment to execute:

/*
-- Remove backup
DROP TABLE IF EXISTS public.listings_old_backup_20251015 CASCADE;

-- Remove truly redundant tables
DROP TABLE IF EXISTS public.listing_channels CASCADE;
DROP TABLE IF EXISTS public.listing_images CASCADE;

-- Remove old export tables if empty
DO $$
BEGIN
  IF (SELECT COUNT(*) FROM export_logs) = 0 THEN
    DROP TABLE IF EXISTS public.export_logs CASCADE;
    RAISE NOTICE 'Dropped empty export_logs table';
  END IF;
  
  IF (SELECT COUNT(*) FROM export_kits) = 0 THEN
    DROP TABLE IF EXISTS public.export_kits CASCADE;
    RAISE NOTICE 'Dropped empty export_kits table';
  END IF;
  
  IF (SELECT COUNT(*) FROM export_items) = 0 THEN
    DROP TABLE IF EXISTS public.export_items CASCADE;
    RAISE NOTICE 'Dropped empty export_items table';
  END IF;
END $$;
*/

-- ============================================
-- VERIFICATION
-- ============================================

-- After cleanup, verify your core tables:
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns 
   WHERE table_name = t.table_name AND table_schema = 'public') as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

SELECT '✅ Cleanup script ready - review and uncomment sections to execute' AS status;
