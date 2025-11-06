-- ============================================
-- SUPABASE TABLE CLEANUP & OPTIMIZATION
-- ============================================
-- This script helps you safely remove unused tables
-- and optimize your database
--
-- ⚠️ IMPORTANT: Run analyze_tables.sql FIRST
-- ⚠️ IMPORTANT: Review results before running this
-- ⚠️ IMPORTANT: Backup your database before cleanup
--
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- STEP 1: BACKUP PHASE (Safety First!)
-- ============================================
-- Create a backup schema to store old data
CREATE SCHEMA IF NOT EXISTS archive;

-- Function to safely archive a table
CREATE OR REPLACE FUNCTION archive_table(table_name TEXT)
RETURNS TEXT AS $$
DECLARE
  archive_name TEXT;
  row_count INTEGER;
BEGIN
  archive_name := table_name || '_archive_' || TO_CHAR(NOW(), 'YYYYMMDD');

  -- Check if table exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = table_name) THEN
    RETURN 'Table does not exist: ' || table_name;
  END IF;

  -- Get row count
  EXECUTE format('SELECT COUNT(*) FROM public.%I', table_name) INTO row_count;

  -- Create archive
  EXECUTE format('CREATE TABLE archive.%I AS SELECT * FROM public.%I', archive_name, table_name);

  RETURN format('Archived %s rows from %s to archive.%s', row_count, table_name, archive_name);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STEP 2: IDENTIFY TABLES TO REVIEW
-- ============================================
-- This shows you which tables might be safe to remove
-- DO NOT automatically drop these - review first!

SELECT
  tablename,
  COALESCE(n_live_tup, 0) as rows,
  COALESCE(n_tup_ins, 0) as total_inserts,
  COALESCE(n_tup_upd, 0) as total_updates,
  pg_size_pretty(pg_total_relation_size('public.'||tablename)) as size,
  CASE
    -- Known active tables
    WHEN tablename IN (
      'users', 'listings', 'listing_images', 'listing_channels',
      'channels', 'export_logs', 'shops', 'credit_costs',
      'subscription_plans', 'credit_usage_log'
    ) THEN '✅ KEEP - Active in codebase'

    -- Backup tables
    WHEN tablename LIKE '%_old%'
      OR tablename LIKE '%_backup%'
      OR tablename LIKE '%_archive%'
    THEN '🗑️ REMOVE - Backup table'

    -- Empty and unused
    WHEN COALESCE(n_live_tup, 0) = 0
      AND COALESCE(n_tup_ins, 0) = 0
    THEN '⚠️ REVIEW - Empty, never used'

    -- Has data but no recent activity
    WHEN COALESCE(n_live_tup, 0) > 0
      AND COALESCE(n_tup_ins, 0) + COALESCE(n_tup_upd, 0) < 10
    THEN '⚠️ REVIEW - Has data, low activity'

    -- Unknown
    ELSE '❓ INVESTIGATE - Not in known tables list'
  END as recommendation
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY
  CASE
    WHEN tablename LIKE '%_old%' OR tablename LIKE '%_backup%' THEN 1
    WHEN COALESCE(n_live_tup, 0) = 0 AND COALESCE(n_tup_ins, 0) = 0 THEN 2
    ELSE 3
  END,
  tablename;

-- ============================================
-- STEP 3: SAFE CLEANUP - Backup Tables Only
-- ============================================
-- This ONLY removes obvious backup tables
-- Uncomment to execute (after reviewing above results)

/*
-- Archive old backup tables first (in case you need them)
DO $$
DECLARE
  tbl RECORD;
BEGIN
  FOR tbl IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND (tablename LIKE '%_old_%' OR tablename LIKE '%_backup_%')
  LOOP
    EXECUTE 'SELECT archive_table($1)' USING tbl.tablename;
    RAISE NOTICE 'Archived: %', tbl.tablename;
  END LOOP;
END $$;

-- Drop old backup tables (data is now in archive schema)
DO $$
DECLARE
  tbl RECORD;
BEGIN
  FOR tbl IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND (tablename LIKE '%_old_%' OR tablename LIKE '%_backup_%')
  LOOP
    EXECUTE format('DROP TABLE IF EXISTS public.%I CASCADE', tbl.tablename);
    RAISE NOTICE 'Dropped: %', tbl.tablename;
  END LOOP;
END $$;
*/

-- ============================================
-- STEP 4: MANUAL CLEANUP (Review Required)
-- ============================================
-- Only run these after confirming the table is truly unused
-- Replace 'table_name' with actual table name

-- Example: Remove usage_logs if replaced by credit_usage_log
/*
-- 1. Check if it has any data you need
SELECT COUNT(*) FROM public.usage_logs;
SELECT * FROM public.usage_logs LIMIT 10;

-- 2. Archive it
SELECT archive_table('usage_logs');

-- 3. Drop it
DROP TABLE IF EXISTS public.usage_logs CASCADE;
*/

-- Example: Remove keywords if not used
/*
SELECT COUNT(*) FROM public.keywords;
SELECT archive_table('keywords');
DROP TABLE IF EXISTS public.keywords CASCADE;
*/

-- Example: Remove listing_versions if not used
/*
SELECT COUNT(*) FROM public.listing_versions;
SELECT archive_table('listing_versions');
DROP TABLE IF EXISTS public.listing_versions CASCADE;
*/

-- ============================================
-- STEP 5: OPTIMIZE REMAINING TABLES
-- ============================================
-- This improves performance of tables you're keeping

-- Vacuum and analyze all tables (reclaim space, update stats)
VACUUM ANALYZE;

-- Reindex all tables (rebuild indexes for better performance)
REINDEX SCHEMA public;

-- Update table statistics
ANALYZE;

-- ============================================
-- STEP 6: VERIFY CLEANUP
-- ============================================
SELECT
  '📊 Tables Remaining' as metric,
  COUNT(*)::text as value
FROM pg_tables
WHERE schemaname = 'public'
UNION ALL
SELECT
  '📦 Total Database Size',
  pg_size_pretty(SUM(pg_total_relation_size('public.'||tablename)))
FROM pg_tables
WHERE schemaname = 'public'
UNION ALL
SELECT
  '🗄️ Archived Tables',
  COUNT(*)::text
FROM pg_tables
WHERE schemaname = 'archive'
UNION ALL
SELECT
  '📋 Active Tables (Used in Code)',
  COUNT(*)::text
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'users', 'listings', 'listing_images', 'listing_channels',
    'channels', 'export_logs', 'shops', 'credit_costs',
    'subscription_plans', 'credit_usage_log'
  );

-- List all remaining tables
SELECT
  'Remaining Tables' as section,
  tablename,
  pg_size_pretty(pg_total_relation_size('public.'||tablename)) as size,
  COALESCE(n_live_tup, 0) as rows
FROM pg_tables
LEFT JOIN pg_stat_user_tables ON pg_tables.tablename = pg_stat_user_tables.relname
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size('public.'||tablename) DESC;

-- ============================================
-- STEP 7: CHECK FOR FOREIGN KEY ISSUES
-- ============================================
-- Verify no broken foreign keys after cleanup
SELECT
  conrelid::regclass AS table_name,
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE contype = 'f'
  AND connamespace = 'public'::regnamespace
ORDER BY conrelid::regclass::text;

-- ============================================
-- STEP 8: RESTORE FROM ARCHIVE (If Needed)
-- ============================================
-- If you need to restore a table from archive:
/*
-- List archived tables
SELECT tablename
FROM pg_tables
WHERE schemaname = 'archive'
ORDER BY tablename;

-- Restore specific table (replace table_name_archive_YYYYMMDD)
CREATE TABLE public.table_name AS
SELECT * FROM archive.table_name_archive_YYYYMMDD;
*/

-- ============================================
-- MAINTENANCE RECOMMENDATIONS
-- ============================================
-- Run these monthly for optimal performance:
/*
-- 1. Vacuum to reclaim space
VACUUM ANALYZE;

-- 2. Update statistics
ANALYZE;

-- 3. Check for bloat
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS external_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 10;
*/

SELECT '✅ Cleanup script ready. Review results and uncomment sections to execute.' as status;
