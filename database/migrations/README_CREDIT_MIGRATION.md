# Credit System Migration Guide

## Overview
This migration converts Snap2Listing from an image/video-based usage model to a credit-based system with 7-day trial support for free tier users.

## What Changes

### Database Schema
- **New Columns Added:**
  - `credits_used` - Total credits consumed in current billing period
  - `credits_limit` - Credit limit for user's current plan
  - `account_created_at` - Account creation timestamp for trial tracking

- **Credit Costs Per Action:**
  - Image Generation: 3 credits
  - AI Prompt Suggestions: 1 credit
  - SEO Content (per marketplace): 2 credits
  - Video Generation: 5 credits
  - Mockup Download: 10 credits

### Plan Credit Allocations
- **Free:** 10 credits • 7-day trial
- **Starter:** 300 credits/month ($19/mo)
- **Pro:** 580 credits/month ($29/mo)
- **Growth:** 900 credits/month ($49/mo) - NEW PLAN
- **Business:** 1,600 credits/month ($89/mo)

### New Features
- Trial expiration tracking for free users
- Credit deduction function with trial validation
- Helper functions for trial status checks
- Backward compatible with existing `images_used`/`videos_used` columns

## How to Apply Migration

### Option 1: Via Supabase Dashboard (Recommended)
1. Log into your Supabase project dashboard
2. Go to **SQL Editor**
3. Copy and paste the contents of `20241030_credit_system_migration.sql`
4. Click **Run** to execute the migration
5. Verify success by checking the **Database** > **user_profiles** table

### Option 2: Via Supabase CLI
```bash
# If you have Supabase CLI installed
supabase db push database/migrations/20241030_credit_system_migration.sql
```

### Option 3: Via psql (Advanced)
```bash
psql postgresql://[YOUR_SUPABASE_CONNECTION_STRING] -f database/migrations/20241030_credit_system_migration.sql
```

## Post-Migration Steps

### 1. Update Environment Variables (If Needed)
No environment variable changes required for this migration.

### 2. Deploy Updated Code
The following files have been updated and need to be deployed:
- `config/pricing.ts` - New credit-based pricing structure
- `lib/types.ts` - Updated User and UsageStats interfaces
- `app/(marketing)/pricing/page.tsx` - New pricing page with FAQ
- `components/Pricing/PricingTable.tsx` - Uses updated PLANS config

### 3. Test Migration Success
Run these queries in Supabase SQL Editor to verify:

```sql
-- Check that new columns exist
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN ('credits_used', 'credits_limit', 'account_created_at');

-- Check that credit limits were set correctly
SELECT plan_id, COUNT(*) as user_count, AVG(credits_limit) as avg_limit
FROM users
GROUP BY plan_id;

-- Test trial expiration function
SELECT id, email, plan_id,
       public.is_trial_expired(id) as trial_expired,
       public.get_trial_days_remaining(id) as days_remaining
FROM users
WHERE plan_id = 'free'
LIMIT 5;

-- Test credit deduction function (use a test user ID)
SELECT public.deduct_credits('YOUR-TEST-USER-UUID'::uuid, 5, 'test_action');
```

### 4. Monitor for Issues
- Check Supabase logs for any function errors
- Monitor user reports of "insufficient credits" errors
- Verify trial expiration notifications are working

## Rollback Procedure (If Needed)

If you need to rollback this migration:

```sql
-- Remove new columns
ALTER TABLE public.users
DROP COLUMN IF EXISTS credits_used,
DROP COLUMN IF EXISTS credits_limit,
DROP COLUMN IF EXISTS account_created_at;

-- Drop new functions
DROP FUNCTION IF EXISTS public.is_trial_expired(UUID);
DROP FUNCTION IF EXISTS public.get_trial_days_remaining(UUID);
DROP FUNCTION IF EXISTS public.deduct_credits(UUID, INTEGER, TEXT);

-- Drop indexes
DROP INDEX IF EXISTS idx_users_credits_used;
DROP INDEX IF EXISTS idx_users_account_created_at;
DROP INDEX IF EXISTS idx_users_plan_credits;
```

## Data Migration Notes

### Existing Users
- All existing usage is converted: `credits_used = (images_used * 3) + (videos_used * 5)`
- Free tier users get a new 7-day trial starting from their `account_created_at` date
- Paid users are unaffected by trial restrictions

### New Users
- Start with 0 credits used
- Free tier: 10 credits, 7-day trial period
- Trial countdown appears in dashboard

### Backward Compatibility
- The `images_used` and `videos_used` columns are kept for backward compatibility
- These can be removed in a future migration after all code references are updated
- The application now primarily uses `credits_used` for all tracking

## Questions or Issues?

If you encounter any issues during migration:
1. Check Supabase logs for detailed error messages
2. Verify you have proper database permissions
3. Contact support at snap2listing@gmail.com with:
   - Error messages
   - Number of affected users
   - Your Supabase project ID

## Files Modified in This Update

### Backend/Database:
- `database/migrations/20241030_credit_system_migration.sql` - **NEW**
- `lib/types.ts` - Updated User and UsageStats interfaces
- `config/pricing.ts` - New credit-based pricing config

### Frontend:
- `app/(marketing)/pricing/page.tsx` - Updated with FAQ and new copy
- `components/Pricing/PricingTable.tsx` - Uses new PLANS config

### Pending Updates (Next Tasks):
- Dashboard credit usage display
- Trial countdown timer component
- Credit calculator widget
- Credit deduction API integration
- Hide/disable incomplete features

## Migration Checklist

- [ ] Backup current database
- [ ] Run migration SQL script
- [ ] Verify new columns exist
- [ ] Test helper functions with sample user
- [ ] Deploy updated frontend code
- [ ] Test end-to-end credit deduction
- [ ] Monitor error logs for 24 hours
- [ ] Update user documentation
- [ ] Announce changes to users

## Success Criteria

Migration is successful when:
- ✅ All users have `credits_used`, `credits_limit`, and `account_created_at` columns
- ✅ Free tier users see trial countdown in dashboard
- ✅ Credit deduction works for all action types
- ✅ Trial expiration blocks free users after 7 days
- ✅ No errors in Supabase logs related to credit functions
- ✅ Existing paid users can continue using features normally
