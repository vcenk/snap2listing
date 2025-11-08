# Quick Fix for "function name not unique" Error

## 🚨 Error You're Seeing

```
ERROR: 42725: function name "increment_usage" is not unique
HINT: Specify the argument list to select the function unambiguously.
```

## ✅ Solution: Run Scripts in Correct Order

You have duplicate functions in your database. Follow these steps:

---

## Step 1: Run PRE_CLEANUP.sql FIRST

This script safely drops all existing functions (including duplicates) and tables.

1. **Open Supabase SQL Editor**
   - Go to https://supabase.com/dashboard
   - Select your project
   - Click **SQL Editor** → **New Query**

2. **Copy and Run PRE_CLEANUP.sql**
   - Open `database/PRE_CLEANUP.sql`
   - Copy the ENTIRE contents
   - Paste into SQL Editor
   - Click **Run** (or press `Ctrl+Enter`)

**Expected Output:**
```
NOTICE: Dropped trigger: users.on_auth_user_created
NOTICE: Dropped function: public.increment_usage(uuid, integer, integer)
NOTICE: Dropped function: public.increment_usage(uuid)
NOTICE: Dropped function: public.deduct_credits(...)
... (more functions)

Remaining tables: (empty or only system tables)
Remaining functions: (empty)
```

**Duration:** ~2-3 seconds

---

## Step 2: Run FRESH_DATABASE_SCHEMA.sql

Now create the new optimized schema.

1. **Same SQL Editor** (keep it open)

2. **Copy and Run FRESH_DATABASE_SCHEMA.sql**
   - Open `database/FRESH_DATABASE_SCHEMA.sql`
   - Copy the ENTIRE contents (850+ lines)
   - Paste into SQL Editor
   - Click **Run**

**Expected Output:**
```
Success. No rows returned
```

**Duration:** ~5-10 seconds

---

## Step 3: Verify Tables Were Created

Run this verification query:

```sql
-- Should show 10 tables
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Should show 6 functions
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
  'deduct_credits', 'is_trial_expired', 'get_trial_days_remaining',
  'add_image_quota', 'add_video_quota', 'handle_new_user'
);

-- Should show 6 channels
SELECT name FROM channels ORDER BY name;

-- Should show 5 plans
SELECT plan_name, credits_per_month FROM subscription_plans ORDER BY plan_name;
```

**Expected Results:**
- ✅ 10 tables
- ✅ 6 functions
- ✅ 6 channels
- ✅ 5 subscription plans

---

## 🎯 Why This Works

**The Problem:**
- Your database has multiple versions of `increment_usage` with different parameters
- Simple `DROP FUNCTION increment_usage` doesn't know which one to drop
- This causes the "not unique" error

**The Solution:**
- `PRE_CLEANUP.sql` uses dynamic SQL to find ALL function signatures
- Drops each function with its exact parameter types
- Handles duplicates automatically
- Then `FRESH_DATABASE_SCHEMA.sql` creates clean new functions

---

## 🔄 Complete Process (2 Scripts)

```
1. PRE_CLEANUP.sql        ← Run this FIRST (drops everything safely)
   ↓
2. FRESH_DATABASE_SCHEMA.sql  ← Run this SECOND (creates new schema)
   ↓
3. Verify (run verification queries)
   ↓
4. Test your app
```

---

## ⚠️ If You Still Get Errors

If you encounter other errors after running PRE_CLEANUP.sql, it means there are even more edge cases. Here's the nuclear option:

### Nuclear Option: Manual Cleanup

Run this in Supabase SQL Editor:

```sql
-- Drop ALL functions in public schema (be careful!)
DO $$
DECLARE
    func_record RECORD;
BEGIN
    FOR func_record IN
        SELECT
            n.nspname as schema_name,
            p.proname as function_name,
            pg_get_function_identity_arguments(p.oid) as args
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
    LOOP
        EXECUTE format('DROP FUNCTION IF EXISTS %I.%I(%s) CASCADE',
                      func_record.schema_name,
                      func_record.function_name,
                      func_record.args);
    END LOOP;
END $$;

-- Drop ALL triggers
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    FOR trigger_record IN
        SELECT tgname, relname
        FROM pg_trigger
        JOIN pg_class ON pg_trigger.tgrelid = pg_class.oid
        JOIN pg_namespace ON pg_class.relnamespace = pg_namespace.oid
        WHERE pg_namespace.nspname = 'public'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I CASCADE',
                      trigger_record.tgname,
                      trigger_record.relname);
    END LOOP;
END $$;

-- Drop ALL tables
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

Then run `FRESH_DATABASE_SCHEMA.sql`.

---

## ✅ Summary

**DO THIS:**
1. ✅ Run `PRE_CLEANUP.sql` first
2. ✅ Run `FRESH_DATABASE_SCHEMA.sql` second
3. ✅ Verify with queries above
4. ✅ Test your app

**DON'T DO THIS:**
- ❌ Don't run just `FRESH_DATABASE_SCHEMA.sql` alone
- ❌ Don't skip the pre-cleanup step

---

**The PRE_CLEANUP.sql script is now in your database folder. Use it!**
