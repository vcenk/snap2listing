-- ============================================
-- SUPABASE TABLE ANALYSIS
-- ============================================
-- This script helps you understand which tables exist
-- and provides information to decide what to keep/remove
--
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- STEP 1: List All Tables
-- ============================================
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  pg_stat_user_tables.n_tup_ins AS inserts,
  pg_stat_user_tables.n_tup_upd AS updates,
  pg_stat_user_tables.n_tup_del AS deletes,
  pg_stat_user_tables.seq_scan AS sequential_scans,
  pg_stat_user_tables.idx_scan AS index_scans,
  pg_stat_user_tables.n_live_tup AS live_rows
FROM pg_tables
LEFT JOIN pg_stat_user_tables ON pg_tables.tablename = pg_stat_user_tables.relname
WHERE schemaname = 'public'
ORDER BY tablename;

-- ============================================
-- STEP 2: Check Row Counts for Each Table
-- ============================================
SELECT 'users' as table_name, COUNT(*) as row_count FROM public.users
UNION ALL
SELECT 'listings', COUNT(*) FROM public.listings
UNION ALL
SELECT 'listing_images', COUNT(*) FROM public.listing_images
UNION ALL
SELECT 'listing_channels', COUNT(*) FROM public.listing_channels
UNION ALL
SELECT 'channels', COUNT(*) FROM public.channels
UNION ALL
SELECT 'shops', COUNT(*) FROM public.shops
UNION ALL
SELECT 'usage_logs', COUNT(*) FROM public.usage_logs
UNION ALL
SELECT 'keywords', COUNT(*) FROM public.keywords
UNION ALL
SELECT 'export_logs', COUNT(*) FROM public.export_logs
UNION ALL
SELECT 'listing_versions', COUNT(*) FROM public.listing_versions
UNION ALL
SELECT 'credit_costs', COUNT(*) FROM public.credit_costs
UNION ALL
SELECT 'subscription_plans', COUNT(*) FROM public.subscription_plans
UNION ALL
SELECT 'credit_usage_log', COUNT(*) FROM public.credit_usage_log
ORDER BY row_count DESC;

-- ============================================
-- STEP 3: Identify Potentially Unused Tables
-- ============================================
-- Tables with 0 inserts/updates/deletes are likely unused
SELECT
  tablename,
  COALESCE(n_tup_ins, 0) as total_inserts,
  COALESCE(n_tup_upd, 0) as total_updates,
  COALESCE(n_tup_del, 0) as total_deletes,
  COALESCE(n_live_tup, 0) as current_rows,
  CASE
    WHEN COALESCE(n_tup_ins, 0) = 0 AND COALESCE(n_tup_upd, 0) = 0 AND COALESCE(n_tup_del, 0) = 0
    THEN '⚠️ POTENTIALLY UNUSED - No activity detected'
    WHEN COALESCE(n_live_tup, 0) = 0
    THEN '⚠️ EMPTY TABLE - No rows'
    ELSE '✅ ACTIVE - Has data or activity'
  END as status
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_tup_ins DESC NULLS LAST;

-- ============================================
-- STEP 4: Check for Old/Backup Tables
-- ============================================
SELECT
  tablename,
  pg_size_pretty(pg_total_relation_size('public.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
  AND (
    tablename LIKE '%_old%'
    OR tablename LIKE '%_backup%'
    OR tablename LIKE '%_archive%'
    OR tablename LIKE '%_deprecated%'
  )
ORDER BY pg_total_relation_size('public.'||tablename) DESC;

-- ============================================
-- STEP 5: Foreign Key Relationships
-- ============================================
-- Shows which tables depend on other tables
SELECT
  tc.table_name as child_table,
  kcu.column_name as child_column,
  ccu.table_name AS parent_table,
  ccu.column_name AS parent_column
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY parent_table, child_table;

-- ============================================
-- STEP 6: Summary Report
-- ============================================
SELECT
  '📊 TOTAL TABLES' as metric,
  COUNT(*)::text as value
FROM pg_tables
WHERE schemaname = 'public'
UNION ALL
SELECT
  '📦 TOTAL SIZE',
  pg_size_pretty(SUM(pg_total_relation_size(schemaname||'.'||tablename)))
FROM pg_tables
WHERE schemaname = 'public'
UNION ALL
SELECT
  '⚠️ EMPTY TABLES',
  COUNT(*)::text
FROM pg_stat_user_tables
WHERE schemaname = 'public' AND COALESCE(n_live_tup, 0) = 0
UNION ALL
SELECT
  '🗑️ BACKUP TABLES',
  COUNT(*)::text
FROM pg_tables
WHERE schemaname = 'public'
  AND (tablename LIKE '%_old%' OR tablename LIKE '%_backup%');
