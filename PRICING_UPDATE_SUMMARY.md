# Pricing & Credit System Update - Implementation Summary

## ✅ COMPLETED TASKS

### 1. Updated Pricing Configuration (`config/pricing.ts`)
**Status:** ✅ Complete

**Changes Made:**
- Migrated from image/video model to credit-based system
- Added `CREDIT_COSTS` constant with per-action costs:
  - Image Generation: 3 credits
  - AI Prompt Suggestions: 1 credit
  - SEO Content per Marketplace: 2 credits
  - Video Generation: 5 credits
  - Mockup Download: 10 credits
- Updated all 5 plans with new credit allocations:
  - Free: 10 credits, 7-day trial
  - Starter: $19/mo, 300 credits
  - Pro: $29/mo, 580 credits (MOST POPULAR)
  - Growth: $49/mo, 900 credits (NEW PLAN)
  - Business: $89/mo, 1,600 credits
- Added helper functions:
  - `checkCreditLimits()` - Check usage against limits
  - `calculateCreditBreakdown()` - Show what user can do with remaining credits
  - `isTrialExpired()` - Check if 7-day trial has ended
  - `getTrialDaysRemaining()` - Get countdown for trial users

**File Location:** `config/pricing.ts`

---

### 2. Updated Pricing Page (`app/(marketing)/pricing/page.tsx`)
**Status:** ✅ Complete

**Changes Made:**
- Updated header subtitle to mention all 6 marketplaces
- Changed overage add-ons from images/videos to credits:
  - 300 credits for $10
  - 900 credits for $25
- Rewrote "Why Snap2Listing?" value propositions:
  - **10x Faster:** Multi-marketplace simultaneous generation
  - **Save Thousands:** Mockup and video cost comparison
  - **Stand Out:** Algorithm-specific optimization
- Added comprehensive FAQ section with 8 questions:
  - Credit rollover policy
  - What to do when out of credits
  - Plan switching
  - Complete listing breakdown
  - Content ownership
  - Trial extension process
  - Credit cost details
  - Marketplace support
- Updated CTA to "Start Free 7-Day Trial" with 10 credits

**File Location:** `app/(marketing)/pricing/page.tsx`

---

### 3. Updated Type Definitions (`lib/types.ts`)
**Status:** ✅ Complete

**Changes Made:**
- Updated `User` interface:
  - Added `creditsUsed` and `creditsLimit` as primary tracking
  - Kept `imagesUsed`/`videosUsed` for backwards compatibility
- Updated `UsageStats` interface:
  - Added credit-based fields: `creditsUsed`, `creditsLimit`, `creditsRemaining`, `percentageUsed`
  - Added trial tracking: `trialDaysRemaining`, `trialExpired`, `accountCreatedAt`
  - Kept legacy image/video fields for backwards compatibility

**File Location:** `lib/types.ts`

---

### 4. Created Database Migration
**Status:** ✅ Complete (SQL ready, not yet applied)

**What Was Created:**
1. **Migration SQL File:** `database/migrations/20241030_credit_system_migration.sql`
   - Adds `credits_used`, `credits_limit`, `account_created_at` columns
   - Migrates existing usage: `credits = (images * 3) + (videos * 5)`
   - Sets credit limits based on plan_id
   - Creates indexes for performance
   - Adds 3 helper functions:
     - `is_trial_expired(user_id)` - Returns boolean
     - `get_trial_days_remaining(user_id)` - Returns integer
     - `deduct_credits(user_id, amount, action_type)` - Returns boolean

2. **Migration Guide:** `database/migrations/README_CREDIT_MIGRATION.md`
   - Step-by-step instructions for applying migration
   - 3 methods: Supabase Dashboard, CLI, or psql
   - Post-migration testing queries
   - Rollback procedure
   - Success criteria checklist

**Files Created:**
- `database/migrations/20241030_credit_system_migration.sql`
- `database/migrations/README_CREDIT_MIGRATION.md`

**Action Required:**
- User must manually run the SQL migration in Supabase dashboard
- Follow README instructions to verify success

---

## 🚧 PENDING TASKS

### 5. Update Dashboard to Show Credit Costs
**Status:** ⏳ Pending

**What Needs to Be Done:**
1. Update `app/(dashboard)/app/overview/page.tsx`:
   - Replace "Images Generated" and "Videos Created" cards with:
     - **Primary Card:** "Credits Used" (show creditsUsed / creditsLimit)
     - **Secondary Card:** "Trial Days Remaining" (free users only)
   - Update the bar chart to show credits instead of images/videos
   - Add credit breakdown widget showing:
     - "You have X credits left. That's enough for:"
     - X images OR X mockups OR X videos OR X complete listings
   - Keep backwards compatibility: if `creditsUsed` is null, show old image/video stats

2. Update `/api/users/stats` endpoint to return credit-based stats:
   - Calculate `creditsUsed`, `creditsLimit`, `creditsRemaining`, `percentageUsed`
   - Call `getTrialDaysRemaining()` for free users
   - Return both credit and legacy stats for compatibility

**Files to Modify:**
- `app/(dashboard)/app/overview/page.tsx` (lines 262-298 - stat cards)
- `app/api/users/stats/route.ts` (or wherever stats API is)

**Design Requirements:**
```tsx
// Example of what the primary stat card should look like:
<StatCard
  title="Credits"
  value={stats.creditsUsed}
  limit={stats.creditsLimit}
  subtitle={`${stats.creditsRemaining} remaining`}
  icon={<CreditCardIcon />}
  color="primary"
/>

// For free users, add this card:
{stats.currentPlan === 'Free' && (
  <StatCard
    title="Trial Days Remaining"
    value={stats.trialDaysRemaining}
    subtitle={stats.trialExpired ? "Trial expired - upgrade to continue" : "days left"}
    icon={<AccessTimeIcon />}
    color={stats.trialDaysRemaining <= 2 ? "error" : "warning"}
  />
)}

// Credit breakdown widget:
<Paper sx={{ p: 3 }}>
  <Typography variant="h6">What you can do with {stats.creditsRemaining} credits:</Typography>
  <List>
    <ListItem>
      <ListItemText
        primary={`${breakdown.images} Images`}
        secondary="3 credits each"
      />
    </ListItem>
    <ListItem>
      <ListItemText
        primary={`${breakdown.mockups} Mockups`}
        secondary="10 credits each"
      />
    </ListItem>
    <ListItem>
      <ListItemText
        primary={`${breakdown.videos} Videos`}
        secondary="5 credits each"
      />
    </ListItem>
    <ListItem>
      <ListItemText
        primary={`${breakdown.completeListings} Complete Listings`}
        secondary="≈30 credits each (image + mockup + video + SEO for 6 channels)"
      />
    </ListItem>
  </List>
</Paper>
```

---

### 6. Show Credit Costs Before Actions
**Status:** ⏳ Pending

**What Needs to Be Done:**
Update all action buttons/forms to show credit cost BEFORE user clicks:

**Locations to Update:**

1. **Create Listing Wizard** (`components/CreateListing/ListingWizard.tsx`):
   ```tsx
   <Button onClick={handleGenerateImages}>
     Generate Images (3 credits each)
   </Button>

   <Button onClick={handleGenerateVideo}>
     Generate Video (5 credits)
   </Button>

   <Button onClick={handleDownloadMockup}>
     Download Mockup (10 credits)
   </Button>

   <Button onClick={handleGenerateSEO}>
     Generate SEO for {selectedMarketplaces.length} marketplaces
     ({selectedMarketplaces.length * 2} credits)
   </Button>
   ```

2. **Add Credit Check Before Action:**
   ```tsx
   const handleAction = async (creditCost: number, actionType: string) => {
     // Check if user has enough credits
     if (user.creditsUsed + creditCost > user.creditsLimit) {
       showError(`Insufficient credits. You need ${creditCost} but only have ${user.creditsLimit - user.creditsUsed} remaining.`);
       return;
     }

     // Check if trial has expired
     if (user.planId === 'free' && isTrialExpired(user.accountCreatedAt)) {
       showError('Your free trial has expired. Please upgrade to continue.');
       return;
     }

     // Proceed with action
     await performAction();
   };
   ```

3. **Show Confirmation Dialog with Credit Cost:**
   ```tsx
   <Dialog>
     <DialogTitle>Confirm Action</DialogTitle>
     <DialogContent>
       <Typography>
         This will use {creditCost} credits.
       </Typography>
       <Typography variant="body2" color="text.secondary">
         You will have {user.creditsLimit - user.creditsUsed - creditCost} credits remaining.
       </Typography>
     </DialogContent>
     <DialogActions>
       <Button onClick={onCancel}>Cancel</Button>
       <Button onClick={onConfirm} variant="contained">
         Confirm ({creditCost} credits)
       </Button>
     </DialogActions>
   </Dialog>
   ```

**Files to Modify:**
- `components/CreateListing/ListingWizard.tsx` (all action buttons)
- Any other components that trigger credit-consuming actions

---

### 7. Add Trial Countdown Timer to Dashboard
**Status:** ⏳ Pending

**What Needs to Be Done:**
Add a prominent banner/alert at the top of the dashboard for free users showing trial status:

**Implementation:**
```tsx
// In app/(dashboard)/app/overview/page.tsx or a layout component

{user.planId === 'free' && (
  <Alert
    severity={stats.trialDaysRemaining <= 2 ? "error" : "warning"}
    sx={{ mb: 3 }}
    action={
      <Button component={Link} href="/app/billing" size="small" variant="contained">
        Upgrade Now
      </Button>
    }
  >
    {stats.trialExpired ? (
      <Typography fontWeight={600}>
        Your free trial has ended. Upgrade to continue creating listings.
      </Typography>
    ) : (
      <Typography>
        <strong>{stats.trialDaysRemaining} days left</strong> in your free trial.
        You have {stats.creditsRemaining} credits remaining.
      </Typography>
    )}
  </Alert>
)}
```

**Where to Add:**
- Top of `app/(dashboard)/app/overview/page.tsx` (line 229, before "Dashboard Overview" title)
- Or in a shared dashboard layout component that appears on all dashboard pages

---

### 8. Create Credit Calculator Widget
**Status:** ⏳ Pending

**What Needs to Be Done:**
Create a reusable component that shows what users can do with their remaining credits.

**Component to Create:**
```tsx
// components/Dashboard/CreditCalculator.tsx

'use client';

import { Box, Typography, Paper, Stack, Divider } from '@mui/material';
import { calculateCreditBreakdown, CREDIT_COSTS } from '@/config/pricing';
import ImageIcon from '@mui/icons-material/Image';
import VideocamIcon from '@mui/icons-material/Videocam';
import GridOnIcon from '@mui/icons-material/GridOn';
import ListAltIcon from '@mui/icons-material/ListAlt';

interface CreditCalculatorProps {
  creditsRemaining: number;
}

export default function CreditCalculator({ creditsRemaining }: CreditCalculatorProps) {
  const breakdown = calculateCreditBreakdown(creditsRemaining);

  const items = [
    {
      label: 'Images',
      count: breakdown.images,
      cost: CREDIT_COSTS.imageGeneration,
      icon: <ImageIcon />,
      color: '#2196F3'
    },
    {
      label: 'Mockups',
      count: breakdown.mockups,
      cost: CREDIT_COSTS.mockupDownload,
      icon: <GridOnIcon />,
      color: '#9C27B0'
    },
    {
      label: 'Videos',
      count: breakdown.videos,
      cost: CREDIT_COSTS.videoGeneration,
      icon: <VideocamIcon />,
      color: '#F44336'
    },
    {
      label: 'Complete Listings',
      count: breakdown.completeListings,
      cost: 30, // Approximate cost
      icon: <ListAltIcon />,
      color: '#4CAF50'
    },
  ];

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom fontWeight={600}>
        What You Can Create
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        With your {creditsRemaining} remaining credits:
      </Typography>

      <Stack spacing={2} divider={<Divider />}>
        {items.map((item) => (
          <Stack key={item.label} direction="row" alignItems="center" spacing={2}>
            <Box sx={{ color: item.color, fontSize: 32 }}>
              {item.icon}
            </Box>
            <Box flexGrow={1}>
              <Typography variant="h5" fontWeight={700}>
                {item.count}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {item.label}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              {item.cost} credits each
            </Typography>
          </Stack>
        ))}
      </Stack>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
        * Complete listing includes: 1 image + 1 mockup + 1 video + SEO for 6 marketplaces
      </Typography>
    </Paper>
  );
}
```

**Where to Use:**
- Add to dashboard overview page (line 368-410 area, in the right sidebar)
- Could also show in billing page or when user is low on credits

**File to Create:**
- `components/Dashboard/CreditCalculator.tsx`

---

### 9. Update Subscription/Credit Logic
**Status:** ⏳ Pending

**What Needs to Be Done:**
Update all API endpoints that consume credits to use the new system:

**Key Endpoints to Update:**

1. **Image Generation API:**
   ```tsx
   // app/api/generate-image/route.ts (or similar)

   // Before generating image:
   await deductCredits(userId, CREDIT_COSTS.imageGeneration, 'image_generation');

   // If error, rollback credits
   // If success, update user stats
   ```

2. **Video Generation API:**
   ```tsx
   await deductCredits(userId, CREDIT_COSTS.videoGeneration, 'video_generation');
   ```

3. **SEO Content API:**
   ```tsx
   const totalCost = selectedMarketplaces.length * CREDIT_COSTS.seoContentPerChannel;
   await deductCredits(userId, totalCost, 'seo_generation');
   ```

4. **Mockup Download API:**
   ```tsx
   await deductCredits(userId, CREDIT_COSTS.mockupDownload, 'mockup_download');
   ```

5. **Create Helper Function:**
   ```tsx
   // lib/api/credits.ts

   export async function deductCredits(
     userId: string,
     amount: number,
     actionType: string
   ): Promise<boolean> {
     // Call Supabase function
     const { data, error } = await supabase.rpc('deduct_credits', {
       user_id: userId,
       credits_to_deduct: amount,
       action_type: actionType
     });

     if (error) {
       throw new Error(error.message);
     }

     return true;
   }
   ```

**Files to Create/Modify:**
- `lib/api/credits.ts` (NEW - centralized credit management)
- `app/api/generate-image/route.ts` (or wherever image generation happens)
- `app/api/generate-video/route.ts`
- `app/api/generate-listings/route.ts` (for SEO)
- Any other APIs that consume credits

---

### 10. Hide/Disable Incomplete Features
**Status:** ⏳ Pending

**What Needs to Be Done:**
As requested in the original requirements, hide or mark incomplete features:

**Features to Update:**

1. **CSV Download Button:**
   ```tsx
   <Button
     variant="outlined"
     disabled={true}
     endIcon={<Chip label="Coming Soon" size="small" />}
   >
     Download CSV
   </Button>
   ```

2. **Bulk Download:**
   - If there's a bulk download feature that isn't working, remove it from UI
   - Or add "Coming Soon" badge

**Where to Check:**
- Listings page export functionality
- Any bulk operations in the dashboard

**Files to Modify:**
- `app/(dashboard)/app/listings/page.tsx` (export functionality)
- Check for any bulk operation components

---

## 📋 QUICK REFERENCE

### Credit Costs
| Action | Credits | Notes |
|--------|---------|-------|
| Image Generation | 3 | Per image |
| AI Prompt Suggestions | 1 | Per suggestion set |
| SEO Content | 2 | Per marketplace |
| Video Generation | 5 | Per 5-second video |
| Mockup Download | 10 | Per template |
| **Complete Listing** | **≈30** | 1 image + 1 mockup + 1 video + SEO for 6 channels |

### Plan Allocations
| Plan | Price | Credits | Trial | Best For |
|------|-------|---------|-------|----------|
| Free | $0 | 10 | 7 days | Testing |
| Starter | $19/mo | 300 | - | Solo sellers (15-20 listings/mo) |
| Pro | $29/mo | 580 | - | Growing brands (30-40 listings/mo) ⭐ |
| Growth | $49/mo | 900 | - | Scaling brands (50-70 listings/mo) |
| Business | $89/mo | 1,600 | - | Agencies (100+ listings/mo) |

### Overage Packs
- **Small Pack:** 300 credits for $10
- **Large Pack:** 900 credits for $25

### Important Database Functions
```sql
-- Check if trial expired
SELECT public.is_trial_expired('user-uuid-here');

-- Get days remaining
SELECT public.get_trial_days_remaining('user-uuid-here');

-- Deduct credits (use in API)
SELECT public.deduct_credits('user-uuid-here', 5, 'video_generation');
```

---

## 🎯 NEXT STEPS

1. **Apply Database Migration** (High Priority)
   - Follow `database/migrations/README_CREDIT_MIGRATION.md`
   - Run SQL in Supabase dashboard
   - Verify with test queries

2. **Update Dashboard Overview** (High Priority)
   - Show credit stats instead of images/videos
   - Add trial countdown banner
   - Add credit calculator widget

3. **Update Create Listing Wizard** (High Priority)
   - Show credit costs on all action buttons
   - Add credit check before actions
   - Show confirmation dialog with credit cost

4. **Update API Endpoints** (Medium Priority)
   - Integrate `deduct_credits()` function
   - Add trial expiration checks
   - Update error messages

5. **Hide Incomplete Features** (Low Priority)
   - Add "Coming Soon" to CSV download
   - Remove or disable bulk operations

6. **Testing** (Critical)
   - Test free trial expiration
   - Test credit deduction for all actions
   - Test upgrade flow
   - Test insufficient credits error handling

---

## 📞 SUPPORT

If you have questions about implementing any of these changes:
- Email: snap2listing@gmail.com
- Reference this document and specify which section number
- Include error messages or screenshots if applicable

---

**Document Version:** 1.0
**Last Updated:** October 30, 2024
**Migration Status:** Database schema ready, frontend updates pending
