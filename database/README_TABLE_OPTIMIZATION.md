# 📊 Supabase Table Optimization Guide

You have 18 tables and want to optimize. This guide helps you safely identify and remove unused tables.

## 🎯 Quick Summary

**Tables Actually Used (11):**
- ✅ `users` - User accounts
- ✅ `listings` - Product listings
- ✅ `listing_images` - Listing images
- ✅ `listing_channels` - Channel overrides
- ✅ `channels` - Marketplace channels
- ✅ `export_logs` - Export history
- ✅ `shops` - Connected shops
- ✅ `credit_costs` - Credit pricing
- ✅ `subscription_plans` - Plan definitions
- ✅ `credit_usage_log` - Usage audit trail
- ✅ `auth.*` tables - Managed by Supabase

**Potentially Unused (7):**
- ⚠️ `usage_logs` - Check if replaced by credit_usage_log
- ⚠️ `keywords` - Check if SEO feature is used
- ⚠️ `listing_versions` - Check if versioning is used
- ⚠️ Any `*_old_*` or `*_backup_*` tables
- ⚠️ Any empty tables with 0 rows

---

## 📋 Step-by-Step Process

### Step 1: Analyze Your Tables (5 minutes)

1. **Open Supabase Dashboard** → SQL Editor
2. **Run**: `database/analyze_tables.sql`
3. **Review the output** which shows:
   - All tables with row counts
   - Table sizes
   - Activity levels (inserts/updates/deletes)
   - Empty/unused tables
   - Backup tables

### Step 2: Review the Results (5 minutes)

Look for these patterns:

**🗑️ Safe to Remove:**
```
tablename: listings_old_backup_20241015
rows: 100
recommendation: 🗑️ REMOVE - Backup table
```

**⚠️ Needs Investigation:**
```
tablename: usage_logs
rows: 0
total_inserts: 0
recommendation: ⚠️ REVIEW - Empty, never used
```

**✅ Keep These:**
```
tablename: users
rows: 5
recommendation: ✅ KEEP - Active in codebase
```

### Step 3: Safe Cleanup - Backup Tables (2 minutes)

**ONLY if you have backup tables** (like `*_old_backup_*`):

1. **Open**: `database/cleanup_unused_tables.sql`
2. **Find Step 3** (around line 95)
3. **Uncomment the code** by removing `/*` and `*/`
4. **Run the script**

This will:
- Archive backup tables to `archive` schema
- Drop the old backup tables
- Free up space

### Step 4: Manual Cleanup - Other Tables (10 minutes)

For each potentially unused table:

#### Check: `usage_logs`
```sql
-- Is it empty?
SELECT COUNT(*) FROM public.usage_logs;

-- Is it replaced by credit_usage_log?
SELECT COUNT(*) FROM public.credit_usage_log;

-- If credit_usage_log has data and usage_logs is empty:
SELECT archive_table('usage_logs');
DROP TABLE IF EXISTS public.usage_logs CASCADE;
```

#### Check: `keywords`
```sql
-- Is it being used?
SELECT COUNT(*) FROM public.keywords;

-- If 0 rows and you're not using SEO keywords feature:
SELECT archive_table('keywords');
DROP TABLE IF EXISTS public.keywords CASCADE;
```

#### Check: `listing_versions`
```sql
-- Is versioning enabled?
SELECT COUNT(*) FROM public.listing_versions;

-- If 0 rows and you don't need version history:
SELECT archive_table('listing_versions');
DROP TABLE IF EXISTS public.listing_versions CASCADE;
```

### Step 5: Optimize Remaining Tables (1 minute)

After cleanup, optimize performance:

```sql
-- Reclaim space and update statistics
VACUUM ANALYZE;

-- Rebuild indexes
REINDEX SCHEMA public;
```

### Step 6: Verify Results (1 minute)

Run this to see your optimized database:

```sql
SELECT
  tablename,
  pg_size_pretty(pg_total_relation_size('public.'||tablename)) as size,
  n_live_tup as rows
FROM pg_tables
LEFT JOIN pg_stat_user_tables ON pg_tables.tablename = pg_stat_user_tables.relname
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size('public.'||tablename) DESC;
```

---

## 🛡️ Safety Features

### Automatic Archiving
Before dropping any table, the script archives it to `archive` schema:

```sql
-- This happens automatically:
archive.usage_logs_archive_20250101  -- Your data is safe here for 30+ days
```

### Restore if Needed
If you accidentally remove something:

```sql
-- List archived tables
SELECT tablename FROM pg_tables WHERE schemaname = 'archive';

-- Restore a table
CREATE TABLE public.usage_logs AS
SELECT * FROM archive.usage_logs_archive_20250101;
```

---

## 📈 Expected Results

**Before Cleanup (18 tables):**
```
Total Tables: 18
Total Size: ~50 MB (varies)
Active Tables: 11
Backup Tables: 3-4
Empty Tables: 3-4
```

**After Cleanup (11-12 tables):**
```
Total Tables: 11-12
Total Size: ~30-40 MB (20-30% smaller)
Active Tables: 11
Backup Tables: 0
Empty Tables: 0
```

---

## ⚙️ Monthly Maintenance

Run this monthly for optimal performance:

```sql
-- Reclaim space
VACUUM ANALYZE;

-- Update statistics
ANALYZE;

-- Check largest tables
SELECT
  tablename,
  pg_size_pretty(pg_total_relation_size('public.'||tablename)) as size,
  n_live_tup as rows
FROM pg_tables
LEFT JOIN pg_stat_user_tables ON pg_tables.tablename = pg_stat_user_tables.relname
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size('public.'||tablename) DESC
LIMIT 5;
```

---

## 🚨 Important Warnings

### ⚠️ DO NOT REMOVE:
- `users` - Your user accounts
- `listings` - Your product listings
- `listing_images` - Your images
- `listing_channels` - Channel configurations
- `channels` - Marketplace definitions
- `auth.users` - Supabase authentication (managed)
- `storage.buckets` - File storage (managed)

### ⚠️ Always Backup First:
1. Run analysis script first
2. Review results carefully
3. Archive before dropping
4. Test your app after cleanup

### ⚠️ Check Foreign Keys:
Some tables may have dependencies. The script shows these automatically.

---

## 📞 Support

If you're unsure about a table:

1. **Check the code** - Search for the table name in your codebase
2. **Check row count** - If 0 rows and 0 activity, likely unused
3. **Archive first** - Always use `archive_table()` before dropping
4. **Test after** - Verify your app works after cleanup

---

## ✅ Files Created

- `analyze_tables.sql` - Analyze what you have
- `cleanup_unused_tables.sql` - Safe cleanup script
- `TABLE_USAGE_REPORT.md` - Detailed analysis report
- `README_TABLE_OPTIMIZATION.md` - This guide

**Start with Step 1: Run `analyze_tables.sql` in Supabase SQL Editor**
