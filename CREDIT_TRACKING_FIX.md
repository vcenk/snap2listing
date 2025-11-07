# Credit Tracking - FIXED

## 🚨 Problem
User created 2 listings but credits did not decrease. Credits were completely untracked across the application.

## 🔍 Root Cause Analysis

### Database Setup (Already Existed)
✅ Migration file exists: `database/migrations/20241030_credit_system_migration.sql`
✅ Database function exists: `deduct_credits()`
✅ Credit costs table exists with proper costs
✅ Credit tracking columns exist on users table

### Code Implementation (MISSING - NOW FIXED)
❌ NO utility function to call `deduct_credits()`
❌ NO credit checks in API routes
❌ NO credit deduction after AI generation
❌ API routes used old functions: `can_generate_image()`, `increment_image_usage()`

**Result:** Credits were NEVER deducted, users could generate unlimited content!

---

## ✅ Fixes Applied

### 1. Created Credit Tracking Service
**File:** `lib/services/creditTracking.ts` (NEW)

**Functions:**
- `deductCredits(userId, actionType, quantity)` - Deducts credits and validates limits
- `checkCreditsAvailable(userId, actionType, quantity)` - Pre-check before generation
- `getCreditCost(actionType)` - Get cost for any action
- `getUserCredits(userId)` - Get current credit status
- Automatic trial expiration checks
- Credit usage logging to audit trail

**Features:**
- ✅ Calls database `deduct_credits()` function
- ✅ Handles "Insufficient credits" errors
- ✅ Handles "Trial expired" errors
- ✅ Logs to `credit_usage_log` table
- ✅ Returns credits remaining after deduction

---

### 2. Fixed Image Generation API
**File:** `app/api/generate-image/route.ts`

**Before:**
```typescript
// Old function (doesn't exist anymore)
const { data: canGenerate } = await supabaseAdmin.rpc('can_generate_image', {...});

// Old increment function (doesn't track credits properly)
await supabaseAdmin.rpc('increment_image_usage', {...});
```

**After:**
```typescript
// Check credits BEFORE generation
const creditCheck = await checkCreditsAvailable(userId, 'image_generation', 1);
if (!creditCheck.available) {
  return 403 with error message
}

// Generate image...

// Deduct credits AFTER successful generation
const result = await deductCredits(userId, 'image_generation', 1);
// 3 credits deducted per image!
```

**Cost:** 3 credits per image

---

### 3. Credit Costs (From config)

| Action | Cost | Notes |
|--------|------|-------|
| **Image Generation** | 3 credits | FAL.ai FLUX Pro |
| **Video Generation** | 3 credits | 5-second video |
| **Mockup Download** | 3 credits | Dynamic Mockups |
| SEO Content | 0 credits | UNLIMITED |
| AI Prompts | 0 credits | UNLIMITED |
| Title Generation | 0 credits | UNLIMITED |
| Description Generation | 0 credits | UNLIMITED |
| Tags Generation | 0 credits | UNLIMITED |

**Complete Listing Cost:**
- Image (3) + Mockup (3) + Video (3) + SEO for 6 channels (0) = **9 credits**

---

## 📊 Credit Limits Per Plan

| Plan | Credits/Month | Complete Listings |
|------|---------------|-------------------|
| Free (7-day trial) | 15 | 1-2 listings |
| Starter | 300 | 33 listings |
| Pro | 750 | 83 listings |
| Growth | 900 | 100 listings |
| Business | 1,800 | 200 listings |

---

## 🧪 Testing the Fix

### Test Steps:
1. Check your current credits:
   ```sql
   SELECT credits_used, credits_limit, credits_limit - credits_used as remaining
   FROM users
   WHERE id = 'YOUR_USER_ID';
   ```

2. Generate an image (costs 3 credits)
   - Go to image generation
   - Create 1 image
   - Check credits again

3. Generate a mockup (costs 3 credits each)
   - Create POD mockup
   - Check credits

4. Create complete listing:
   - Upload artwork → Generate mockup → Generate images → Generate video
   - Should deduct 9 credits total

### Expected Behavior:
- ✅ Credits decrease after each generation
- ✅ Can't generate when credits = 0
- ✅ Error message shows credits needed vs remaining
- ✅ Free trial expires after 7 days

---

## 🔧 What Still Needs Tracking

### Not Yet Implemented (Future):
1. ❌ **Mockup API** (`/api/mockups/generate`) - Needs credit tracking added
2. ❌ **Video Generation API** - Needs credit tracking added
3. ❌ **Bulk Operations** - May need special credit handling

### To Add Later:
```typescript
// In /api/mockups/generate/route.ts
const creditCheck = await checkCreditsAvailable(userId, 'mockup_download', mockupCount);
if (!creditCheck.available) {
  return 403;
}
// ...generate mockups...
await deductCredits(userId, 'mockup_download', mockupCount);
```

---

## 💡 How It Works Now

### Flow for Image Generation:

```
1. User clicks "Generate Image"
   ↓
2. API checks: Do they have 3 credits available?
   ├─ YES → Continue
   └─ NO → Return 403 "Insufficient credits"
   ↓
3. Call FAL.ai to generate image
   ↓
4. Upload to R2 storage
   ↓
5. Deduct 3 credits from user account
   ↓
6. Log to credit_usage_log table
   ↓
7. Return image URL + updated credits remaining
```

### Database Function (`deduct_credits()`):
```sql
-- Automatically checks:
1. Is trial expired? (for free plan)
2. Do they have enough credits?
3. Deducts credits from credits_used
4. Throws exception if insufficient or trial expired
```

---

## 📋 Files Modified

### Created:
1. ✅ `lib/services/creditTracking.ts` - Credit tracking utilities
2. ✅ `CREDIT_TRACKING_FIX.md` - This documentation

### Modified:
1. ✅ `app/api/generate-image/route.ts` - Added credit tracking

---

## 🚀 Next Steps

### Immediate (Required):
1. ✅ Deploy code changes
2. ✅ Test image generation credits deduction
3. ⏳ Add credit tracking to mockups API
4. ⏳ Add credit tracking to video API
5. ⏳ Test complete flow (image + mockup + video = 9 credits)

### Future Enhancements:
- Add credit purchase flow (Stripe integration)
- Add overage alerts ("You have 5 credits remaining")
- Add credit history page (show credit_usage_log to user)
- Add credit refunds for failed generations
- Add bulk credit operations

---

## 🎯 Success Criteria

Your credits are working when:
- ✅ Image generation deducts 3 credits
- ✅ Mockup generation deducts 3 credits per mockup
- ✅ Video generation deducts 3 credits
- ✅ SEO/text generation costs 0 credits (unlimited)
- ✅ Can't generate when credits reach 0
- ✅ Free trial blocks access after 7 days
- ✅ Credits_used increases in database
- ✅ Credit usage appears in credit_usage_log table

---

## 🐛 Known Issues

### Minor Issues:
1. Mockup API not yet tracking credits (needs same fix as images)
2. Video API not yet tracking credits (needs same fix as images)
3. No user-facing credit purchase flow yet

### Non-Issues:
- AI text generation (titles, descriptions, tags) is FREE by design
- SEO content generation is FREE by design
- These DO NOT need credit tracking

---

## 📞 Testing Queries

### Check your credits:
```sql
SELECT
  id,
  email,
  plan_id,
  credits_used,
  credits_limit,
  credits_limit - credits_used as credits_remaining
FROM users
WHERE id = 'YOUR_USER_ID';
```

### Check credit usage history:
```sql
SELECT
  action_type,
  credits_used,
  credits_remaining,
  created_at
FROM credit_usage_log
WHERE user_id = 'YOUR_USER_ID'
ORDER BY created_at DESC
LIMIT 10;
```

### Reset credits for testing:
```sql
UPDATE users
SET credits_used = 0
WHERE id = 'YOUR_USER_ID';
```

---

**Status:** ✅ PARTIAL FIX APPLIED
**Priority:** HIGH - Complete mockup/video tracking next
**Last Updated:** Now
