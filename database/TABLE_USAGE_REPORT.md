# Supabase Table Usage Analysis

## Tables Actually Used in Codebase ✅

Based on code analysis, these tables are **actively used**:

### Core Tables (DO NOT DELETE)
1. **`users`** - User accounts, authentication, billing
   - Used in: Auth, Settings, Billing, Stats API
   - References: 20+ locations

2. **`listings`** - Product listings (multi-channel schema)
   - Used in: Create Listing, Listings Page, Export, Save API
   - References: 15+ locations

3. **`listing_images`** - Images for listings
   - Used in: Save Listing API
   - References: 3 locations

4. **`listing_channels`** - Channel-specific data for listings
   - Used in: Save Listing API, Export API
   - References: 5 locations

5. **`channels`** - Available marketplace channels
   - Used in: Channels API, Export API, Listings API
   - References: 5 locations

6. **`export_logs`** - Track export history
   - Used in: Export API
   - References: 1 location

7. **`shops`** - Connected shop accounts (Etsy, etc.)
   - Used in: Supabase API utilities
   - References: 1 location

### Supporting Tables (Configuration/Reference Data)
8. **`credit_costs`** - Credit pricing for actions
   - Likely used by pricing system

9. **`subscription_plans`** - Plan definitions
   - Likely used by billing system

10. **`credit_usage_log`** - Audit trail for credit usage
    - Created by migration, likely used for analytics

## Tables to Investigate ⚠️

These tables might be unused or deprecated:

1. **`usage_logs`** - May be replaced by `credit_usage_log`
2. **`keywords`** - SEO keywords table (check if used)
3. **`listing_versions`** - Version history (check if used)
4. **`*_old_backup_*`** - Any backup tables from migrations
5. **`*_archive_*`** - Archived tables

## Common Unused Tables in Supabase Projects

- `buckets` - Storage buckets (managed by Supabase)
- `objects` - Storage objects (managed by Supabase)
- `migrations` - Schema migrations (managed by Supabase)
- `schema_migrations` - Migration tracking

## Recommendations

### Keep (11 tables)
- ✅ `users`
- ✅ `listings`
- ✅ `listing_images`
- ✅ `listing_channels`
- ✅ `channels`
- ✅ `export_logs`
- ✅ `shops`
- ✅ `credit_costs`
- ✅ `subscription_plans`
- ✅ `credit_usage_log`
- ✅ `auth.*` (Supabase managed)

### Investigate Before Removing
Run the analysis script first to check:
- Row counts
- Last activity
- Foreign key dependencies

### Safe to Archive/Remove
- Tables with `_old`, `_backup`, `_archive` suffixes
- Empty tables with 0 rows and 0 activity
- Tables not referenced anywhere in code

## Next Steps

1. **Run Analysis Script**
   ```sql
   -- Run database/analyze_tables.sql in Supabase SQL Editor
   ```

2. **Review Results**
   - Check which tables have 0 rows
   - Check which tables have no activity
   - Identify backup tables

3. **Backup Before Cleanup**
   ```sql
   -- Always backup data before dropping tables
   -- Use the provided cleanup script
   ```

4. **Remove Unused Tables**
   - Only after confirming they're not needed
   - Keep backups for 30 days minimum
