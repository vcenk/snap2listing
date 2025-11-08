# Fresh Database Setup Guide - Snap2Listing

## 📋 Overview

This guide walks you through completely rebuilding your Supabase database from scratch with an optimized schema based on comprehensive codebase analysis.

### What This Does:
- ✅ Removes ALL existing tables and policies
- ✅ Creates 10 optimized core tables
- ✅ Sets up proper RLS (Row Level Security) policies
- ✅ Creates necessary database functions (RPC)
- ✅ Seeds reference data (channels, plans, costs)
- ✅ Removes unused/duplicate tables
- ✅ Optimizes indexes for performance

### What Gets REMOVED:
- ❌ Unused tables: keywords, listing_versions, brand_kits, insight_reports, export_kits, export_items, listings_exports, ai_generation_history, usage_logs
- ❌ Legacy RPC functions
- ❌ Duplicate/conflicting policies
- ❌ Performance bottlenecks

---

## 🚨 IMPORTANT: Backup Your Data First!

### Before running the migration:

**1. Export existing user data (if you have production users):**
```sql
-- Run this in Supabase SQL Editor to backup users
COPY (SELECT * FROM users) TO '/tmp/users_backup.csv' WITH CSV HEADER;
```

**2. Export existing listings (if you have production data):**
```sql
-- Run this to backup listings
COPY (SELECT * FROM listings) TO '/tmp/listings_backup.csv' WITH CSV HEADER;
```

**3. Alternative: Use Supabase Dashboard Export:**
- Go to Table Editor
- Select each table
- Click "..." menu → Export to CSV
- Save all exports to a backup folder

**Note:** If this is a fresh install or dev environment with no production data, you can skip backups.

---

## 📊 Database Analysis Summary

Based on comprehensive codebase analysis:

### **Tables Being Used (10 Core Tables):**

| Table | Frequency | Purpose |
|-------|-----------|---------|
| `users` | VERY HIGH (20+ queries) | User accounts, billing, credits |
| `listings` | VERY HIGH (15+ queries) | Product listings (physical/digital/POD) |
| `listing_channels` | MEDIUM (5 queries) | Channel-specific overrides |
| `listing_images` | MEDIUM (3-5 queries) | Listing image storage |
| `channels` | MEDIUM (5 queries) | Marketplace configurations |
| `credit_usage_log` | MEDIUM (every action) | Credit consumption audit trail |
| `export_logs` | LOW (1 per export) | Export history |
| `shops` | LOW (1 query) | Connected marketplace accounts |
| `subscription_plans` | LOW (reference) | Plan configurations |
| `credit_costs` | LOW (reference) | Credit pricing |

### **RPC Functions (6 Functions):**
1. `deduct_credits` - Main credit deduction with validation
2. `is_trial_expired` - Check 7-day free trial expiration
3. `get_trial_days_remaining` - Days left in trial
4. `add_image_quota` - Stripe add-on quota
5. `add_video_quota` - Stripe add-on quota
6. `handle_new_user` - Auto-create user on signup (trigger)

### **Unused Tables (Will Be Removed):**
- keywords
- listing_versions
- brand_kits
- insight_reports
- export_kits
- export_items
- listings_exports
- ai_generation_history
- usage_logs

---

## 🛠️ Step-by-Step Setup Instructions

### **Step 1: Access Supabase SQL Editor**

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your `snap2listing` project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

---

### **Step 2: Run the Fresh Schema Script**

1. Open the file: `database/FRESH_DATABASE_SCHEMA.sql`
2. Copy the ENTIRE contents (all ~800 lines)
3. Paste into Supabase SQL Editor
4. Click **Run** button (or press `Ctrl+Enter` / `Cmd+Enter`)

**Expected Output:**
```
Success. No rows returned
```

**Processing Time:** ~5-10 seconds

---

### **Step 3: Verify Tables Were Created**

Run this verification query:

```sql
-- List all tables
SELECT
  tablename,
  schemaname
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

**Expected Result (10 tables):**
```
channels
credit_costs
credit_usage_log
export_logs
listing_channels
listing_images
listings
shops
subscription_plans
users
```

---

### **Step 4: Verify Seed Data**

Check that reference data was seeded:

```sql
-- Check channels (should be 6)
SELECT name, slug FROM channels ORDER BY name;

-- Check subscription plans (should be 5)
SELECT plan_name, monthly_price_usd, credits_per_month FROM subscription_plans ORDER BY plan_name;

-- Check credit costs (should be 8)
SELECT action_type, credit_cost FROM credit_costs ORDER BY action_type;
```

**Expected Results:**

**Channels (6):**
- Amazon (amazon)
- eBay (ebay)
- Etsy (etsy)
- Facebook & Instagram (facebook-ig)
- Shopify (shopify)
- TikTok Shop (tiktok)

**Plans (5):**
- free: $0, 15 credits/month
- starter: $19, 300 credits/month
- pro: $39, 750 credits/month
- growth: $49, 900 credits/month
- business: $79, 1800 credits/month

**Credit Costs (8):**
- image_generation: 3 credits
- video_generation: 3 credits
- mockup_download: 3 credits
- seo_content: 0 credits (unlimited)
- ai_prompt_suggestion: 0 credits
- title_generation: 0 credits
- description_generation: 0 credits
- tags_generation: 0 credits

---

### **Step 5: Verify RPC Functions**

Check that all functions were created:

```sql
-- List all custom functions
SELECT
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'deduct_credits',
    'is_trial_expired',
    'get_trial_days_remaining',
    'add_image_quota',
    'add_video_quota',
    'handle_new_user'
  )
ORDER BY routine_name;
```

**Expected Result (6 functions):**
```
add_image_quota
add_video_quota
deduct_credits
get_trial_days_remaining
handle_new_user
is_trial_expired
```

---

### **Step 6: Verify RLS Policies**

Check that RLS is enabled and policies are created:

```sql
-- Check RLS is enabled
SELECT
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

**All tables should show `rowsecurity = true`**

Check policy count:

```sql
-- Count policies per table
SELECT
  schemaname,
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY tablename;
```

**Expected Policy Counts:**
- users: 3 policies
- listings: 5 policies
- listing_images: 4 policies
- listing_channels: 5 policies
- channels: 2 policies
- export_logs: 3 policies
- shops: 5 policies
- credit_usage_log: 3 policies
- subscription_plans: 2 policies
- credit_costs: 2 policies

---

### **Step 7: Test the Auto-Signup Trigger**

The `handle_new_user` trigger should automatically create a user record when someone signs up.

**Test it:**

1. Sign out of your app
2. Create a new test account via Google Sign-In or email/password
3. Check if user was created:

```sql
-- Check if user was auto-created
SELECT
  id,
  email,
  name,
  plan_id,
  subscription_status,
  credits_used,
  credits_limit,
  account_created_at
FROM users
ORDER BY created_at DESC
LIMIT 5;
```

**Expected:**
- User record should exist
- `plan_id = 'free'`
- `subscription_status = 'active'`
- `credits_used = 0`
- `credits_limit = 15`
- `account_created_at` should be recent

---

### **Step 8: Test Credit System**

Test the credit deduction function:

```sql
-- Get your user ID
SELECT id, email, credits_used, credits_limit FROM users WHERE email = 'your-email@example.com';

-- Test credit deduction (replace USER_ID with actual ID)
SELECT * FROM deduct_credits(
  'USER_ID'::UUID,
  3,
  'image_generation',
  NULL,
  '{"test": true}'::JSONB
);
```

**Expected Output:**
```
success | credits_remaining | message
--------+-------------------+------------------------------------------
true    | 12                | Successfully deducted 3 credits. 12 remaining.
```

Check credit usage log:

```sql
-- Verify log entry
SELECT
  action_type,
  credits_used,
  credits_remaining,
  metadata,
  created_at
FROM credit_usage_log
WHERE user_id = 'USER_ID'::UUID
ORDER BY created_at DESC
LIMIT 5;
```

---

### **Step 9: Test Trial Expiration**

Test the trial expiration logic:

```sql
-- Check trial status for free plan user
SELECT is_trial_expired('USER_ID'::UUID);

-- Check days remaining
SELECT get_trial_days_remaining('USER_ID'::UUID);
```

**Expected:**
- For new accounts: `is_trial_expired = FALSE`
- Days remaining should be close to 7

**To test expiration (don't run in production!):**
```sql
-- Manually set account to 8 days ago
UPDATE users
SET account_created_at = NOW() - INTERVAL '8 days'
WHERE id = 'USER_ID'::UUID;

-- Check again
SELECT is_trial_expired('USER_ID'::UUID); -- Should return TRUE
```

---

### **Step 10: Test Your App**

1. **Sign in to your app**
   - Test Google Sign-In
   - Test email/password sign-in
   - Verify user appears in dashboard

2. **Create a listing**
   - Create physical product listing
   - Create digital product listing
   - Create POD listing
   - Verify listings save correctly

3. **Test credits**
   - Generate an AI image (should deduct 3 credits)
   - Generate a video (should deduct 3 credits)
   - Generate mockups (should deduct 3 credits)
   - Check billing page shows correct usage

4. **Test exports**
   - Export a listing to CSV
   - Export a listing to ZIP package
   - Verify export logs are created

5. **Test subscription**
   - Try upgrading to a paid plan
   - Verify plan updates
   - Verify credits limit changes

---

## 🎯 Performance Optimizations Included

### **Indexes Created:**

**Users table:**
- `idx_users_email` - Fast email lookups
- `idx_users_stripe_customer` - Fast Stripe customer lookups
- `idx_users_plan` - Fast plan-based queries
- `idx_users_created_at` - Fast date-based sorting

**Listings table:**
- `idx_listings_user_id` - Fast user listing queries
- `idx_listings_status` - Filter by status
- `idx_listings_product_type` - Filter by product type
- `idx_listings_created_at` - Sort by date (DESC)
- `idx_listings_base_data` - JSONB GIN index for fast JSONB queries

**Listing_images table:**
- `idx_listing_images_listing_id` - Fast image lookups by listing
- `idx_listing_images_is_main` - Fast main image queries

**Listing_channels table:**
- `idx_listing_channels_listing_id` - Fast channel data lookups
- `idx_listing_channels_channel_id` - Reverse lookups
- `idx_listing_channels_is_ready` - Filter ready listings

**Export_logs table:**
- `idx_export_logs_listing_id` - Fast export history lookups
- `idx_export_logs_created_at` - Sort by date (DESC)

**Credit_usage_log table:**
- `idx_credit_usage_log_user_id` - Fast user usage queries
- `idx_credit_usage_log_created_at` - Date-based queries
- `idx_credit_usage_log_action_type` - Filter by action type

**Shops table:**
- `idx_shops_user_id` - Fast user shop lookups
- `idx_shops_status` - Filter by connection status

**Channels table:**
- `idx_channels_slug` - Fast slug-based lookups

### **Query Optimization:**

1. **RLS Policies Use Indexes:**
   - All policies use indexed columns (user_id, listing_id, etc.)
   - Subqueries are optimized

2. **JSONB Indexing:**
   - GIN index on `listings.base_data` for fast JSONB queries
   - Use `base_data->>'field'` for fast extractions

3. **Foreign Keys:**
   - Proper foreign keys with ON DELETE CASCADE
   - Automatic cleanup of related records

4. **Unique Constraints:**
   - Prevent duplicate data
   - Improve query performance

---

## 🔒 Security Features

### **Row Level Security (RLS):**

**Principle:** Users can only access their own data.

**Key Policies:**

1. **Users can only see their own profile:**
   ```sql
   USING (auth.uid() = id)
   ```

2. **Users can only see their own listings:**
   ```sql
   USING (auth.uid() = user_id)
   ```

3. **Users can only see images/channels of their own listings:**
   ```sql
   USING (
     EXISTS (
       SELECT 1 FROM listings
       WHERE listings.id = listing_images.listing_id
       AND listings.user_id = auth.uid()
     )
   )
   ```

4. **Service role has full access:**
   - Needed for Stripe webhooks
   - Needed for admin operations
   - Needed for triggers

5. **Reference data is public:**
   - Anyone can read channels, plans, credit costs
   - Only service role can modify

### **Function Security:**

All RPC functions use `SECURITY DEFINER`:
- Execute with elevated privileges
- Bypass RLS for internal operations
- Properly validate inputs
- Log all actions

---

## 📊 Database Schema Diagram

```
┌─────────────────┐
│  auth.users     │ (Supabase managed)
└────────┬────────┘
         │
         │ (trigger on insert)
         ↓
┌─────────────────┐
│     users       │ ← Main user table
│─────────────────│
│ • billing       │
│ • credits       │
│ • subscription  │
└────────┬────────┘
         │
         │ (user_id FK)
         ↓
┌─────────────────┐        ┌──────────────────┐
│   listings      │───────→│ listing_images   │
│─────────────────│        │──────────────────│
│ • base_data     │        │ • url            │
│ • product_type  │        │ • position       │
│ • POD fields    │        └──────────────────┘
└────────┬────────┘
         │
         │ (listing_id FK)
         ↓
┌─────────────────┐        ┌──────────────────┐
│listing_channels │───────→│    channels      │
│─────────────────│        │──────────────────│
│ • override_data │        │ • config         │
│ • readiness     │        │ • validation     │
└─────────────────┘        └──────────────────┘
         │
         │ (listing_id FK)
         ↓
┌─────────────────┐
│  export_logs    │
│─────────────────│
│ • format        │
│ • exported_data │
└─────────────────┘

┌─────────────────┐        ┌──────────────────┐
│     shops       │───────→│    channels      │
│─────────────────│        └──────────────────┘
│ • access_token  │
│ • shop_id       │
└─────────────────┘

┌──────────────────┐
│ credit_usage_log │
│──────────────────│
│ • user_id        │
│ • action_type    │
│ • credits_used   │
│ • listing_id     │
└──────────────────┘

Reference Tables (Read-only):
┌──────────────────┐   ┌──────────────────┐
│subscription_plans│   │  credit_costs    │
└──────────────────┘   └──────────────────┘
```

---

## 🐛 Troubleshooting

### **Problem: "Permission denied" when running script**

**Solution:**
- Make sure you're logged in as the project owner
- Try running sections separately
- Check that service_role key is configured

### **Problem: "Relation already exists"**

**Solution:**
- The DROP TABLE statements should handle this
- If it persists, manually drop tables in Supabase Table Editor first
- Then run the script again

### **Problem: Trigger not creating users**

**Solution:**
```sql
-- Check if trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- If missing, recreate it
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### **Problem: RLS blocking service role operations**

**Solution:**
- Service role should bypass RLS automatically
- Check that you're using `supabaseAdmin` client in API routes
- Verify environment variable `SUPABASE_SERVICE_ROLE_KEY` is set

### **Problem: Users can't see their data**

**Solution:**
```sql
-- Check if user is authenticated correctly
SELECT auth.uid();

-- Check RLS policies
SELECT * FROM pg_policies WHERE schemaname = 'public';

-- Temporarily disable RLS for testing (DON'T DO IN PRODUCTION!)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```

### **Problem: Credit deduction fails**

**Solution:**
```sql
-- Check user credits
SELECT credits_used, credits_limit FROM users WHERE id = auth.uid();

-- Check trial expiration
SELECT is_trial_expired(auth.uid());

-- Manually reset credits for testing
UPDATE users SET credits_used = 0 WHERE id = auth.uid();
```

---

## 📈 Monitoring & Maintenance

### **Regular Queries to Run:**

**1. Check user growth:**
```sql
SELECT
  DATE(created_at) as signup_date,
  COUNT(*) as signups
FROM users
GROUP BY DATE(created_at)
ORDER BY signup_date DESC
LIMIT 30;
```

**2. Check credit usage:**
```sql
SELECT
  action_type,
  COUNT(*) as usage_count,
  SUM(credits_used) as total_credits
FROM credit_usage_log
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY action_type
ORDER BY total_credits DESC;
```

**3. Check listing stats:**
```sql
SELECT
  product_type,
  status,
  COUNT(*) as count
FROM listings
GROUP BY product_type, status
ORDER BY product_type, status;
```

**4. Check export activity:**
```sql
SELECT
  format,
  COUNT(*) as export_count
FROM export_logs
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY format
ORDER BY export_count DESC;
```

**5. Check subscription distribution:**
```sql
SELECT
  plan_id,
  subscription_status,
  COUNT(*) as user_count
FROM users
GROUP BY plan_id, subscription_status
ORDER BY plan_id, subscription_status;
```

### **Performance Monitoring:**

```sql
-- Check table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check index usage
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

---

## ✅ Post-Setup Checklist

After running the migration, verify:

- [ ] All 10 tables created successfully
- [ ] All 6 RPC functions exist
- [ ] Trigger `on_auth_user_created` is active
- [ ] RLS is enabled on all tables
- [ ] Seed data exists (6 channels, 5 plans, 8 credit costs)
- [ ] Test user signup works (creates user record)
- [ ] Test listing creation works
- [ ] Test credit deduction works
- [ ] Test export works
- [ ] Test subscription upgrade works
- [ ] App loads without database errors
- [ ] All existing features still work

---

## 🚀 Next Steps After Setup

1. **Test thoroughly in development**
   - Create test accounts
   - Create test listings
   - Test all product types (physical, digital, POD)
   - Test all exports
   - Test subscription flow

2. **Deploy to production**
   - Run script in production Supabase project
   - Monitor for errors
   - Have rollback plan ready

3. **Monitor performance**
   - Check query times
   - Monitor index usage
   - Watch for slow queries

4. **Set up backups**
   - Enable Point-in-Time Recovery in Supabase
   - Schedule regular backups
   - Test restore process

---

## 📝 Summary

This fresh database schema:

- ✅ **10 optimized tables** (removed 8+ unused tables)
- ✅ **6 essential RPC functions** (removed legacy functions)
- ✅ **Complete RLS policies** (secure and performant)
- ✅ **Proper indexes** (optimized for your query patterns)
- ✅ **Seed data** (channels, plans, credit costs)
- ✅ **Auto-signup trigger** (seamless user onboarding)
- ✅ **Credit system** (trial + subscription support)
- ✅ **Audit trails** (credit usage, exports)

**Database is now production-ready!** 🎉
