# Apply Security Fixes - Step-by-Step Guide

**Estimated Time:** 5 minutes

---

## Instructions

Follow these steps to apply all security fixes:

### Step 1: Open Supabase Dashboard

1. Go to: **https://supabase.com/dashboard**
2. Select your project: **snap2listing**
3. Click: **SQL Editor** (in left sidebar)
4. Click: **New Query** button

---

### Step 2: Apply RLS Security Migration

**Copy ALL the SQL below** and paste into the SQL Editor, then click **RUN**:

```sql
-- =====================================================
-- MIGRATION 1: Enable RLS on All Tables
-- =====================================================

-- This file is located at:
-- database/migrations/20241023_enable_rls_security.sql
```

**Action:**
1. Open file: `database/migrations/20241023_enable_rls_security.sql`
2. Copy **ALL** contents (407 lines)
3. Paste into Supabase SQL Editor
4. Click **RUN**
5. Wait for "Success" message
6. Check the output - should see verification notices

---

### Step 3: Apply Function Security Migration

**Click "New Query" again**, then copy/paste this SQL and click **RUN**:

```sql
-- =====================================================
-- MIGRATION 2: Fix Function Search Path
-- =====================================================

-- This file is located at:
-- database/migrations/20241023_fix_function_search_path_security.sql
```

**Action:**
1. Click: **New Query** in SQL Editor
2. Open file: `database/migrations/20241023_fix_function_search_path_security.sql`
3. Copy **ALL** contents
4. Paste into Supabase SQL Editor
5. Click **RUN**
6. Wait for "Success" message

---

### Step 4: Verify Security Warnings Are Gone

1. In Supabase Dashboard, click: **Advisors** (in left sidebar)
2. Look at **Security Advisor** section
3. You should now see:
   - ✅ 0 ERRORS (was 5)
   - ⚠️ 1 WARNING (leaked password protection - manual step)

---

### Step 5: Enable Leaked Password Protection (Manual Step)

1. In Supabase Dashboard, click: **Authentication** (in left sidebar)
2. Click: **Policies** tab
3. Scroll to **"Password Protection"** section
4. Enable these settings:
   - ✅ **Leaked password protection**
   - ✅ **Password strength requirements**
     - Minimum length: 8
     - Require uppercase: ✓
     - Require lowercase: ✓
     - Require numbers: ✓
     - Require symbols: ✓
5. Click: **Save**

---

### Step 6: Final Verification

Go back to **Advisors** → **Security Advisor**

Expected result:
- ✅ **0 ERRORS**
- ✅ **0 WARNINGS**

---

## Troubleshooting

### If you get errors running the migrations:

**Error: "relation already exists"**
- This is OK - the migration uses `CREATE TABLE IF NOT EXISTS`
- The migration will skip creating tables that already exist

**Error: "policy already exists"**
- This is OK - the migration drops existing policies first
- Just means you ran the migration twice

**Error: "function does not exist"**
- The function migration creates/replaces all functions
- If you see this, make sure you ran the function migration (Step 3)

### If Security Advisor still shows warnings after Step 4:

1. **Refresh the page** - Supabase Dashboard caches results
2. Wait 30 seconds and refresh again
3. Check each migration ran successfully (look for "Success" in SQL Editor)

---

## What Gets Fixed

### Migration 1 (RLS):
- Creates 4 new tables: `brand_kits`, `insight_reports`, `export_kits`, `export_items`
- Enables RLS on all 5 tables (including `templates`)
- Creates 20 security policies
- Adds auto-update triggers

### Migration 2 (Functions):
- Secures 12 database functions with immutable `search_path`
- Adds authentication checks to query functions
- Prevents SQL injection attacks

### Manual Step (Password Protection):
- Enables leaked password checking (HaveIBeenPwned API)
- Enforces strong password requirements
- Protects against compromised passwords

---

## Files to Copy

1. **`database/migrations/20241023_enable_rls_security.sql`** - Copy to SQL Editor Step 2
2. **`database/migrations/20241023_fix_function_search_path_security.sql`** - Copy to SQL Editor Step 3

---

## Expected Timeline

| Step | Time |
|------|------|
| Step 1: Open Dashboard | 30 seconds |
| Step 2: Run RLS migration | 1 minute |
| Step 3: Run Function migration | 1 minute |
| Step 4: Check warnings | 30 seconds |
| Step 5: Enable password protection | 2 minutes |
| Step 6: Final verification | 30 seconds |
| **TOTAL** | **~5 minutes** |

---

## Success Checklist

After completing all steps:

- [ ] RLS migration ran successfully (no errors in SQL Editor)
- [ ] Function migration ran successfully (no errors in SQL Editor)
- [ ] Security Advisor shows 0 errors
- [ ] Security Advisor shows 0 warnings (after enabling password protection)
- [ ] Password protection is enabled in Authentication settings
- [ ] All tables have RLS enabled (check in Database → Tables)

---

## Need Help?

If you encounter issues:

1. Check: `docs/SECURITY.md` for detailed documentation
2. Check: `SECURITY_FIX_COMPLETION_REPORT.md` for verification queries
3. Contact: support or open an issue

---

**Ready to start?** Open Supabase Dashboard and go to SQL Editor!

---

*Last Updated: October 23, 2024*
