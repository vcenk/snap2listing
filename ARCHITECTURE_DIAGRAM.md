# Snap2Listing Architecture Diagram

## 🎯 Core Workflow (Single Page)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    /app/create (ListingWizard)                      │
│                                                                     │
│  Step 1          Step 2         Step 3          Step 4      Step 5 │
│  ┌─────┐        ┌─────┐        ┌─────┐        ┌─────┐    ┌─────┐ │
│  │     │        │     │        │     │        │     │    │     │ │
│  │ 📸  │───────▶│ 📝  │───────▶│ 🎨  │───────▶│ 🎬  │───▶│ 👁️  │ │
│  │     │        │     │        │     │        │     │    │     │ │
│  └─────┘        └─────┘        └─────┘        └─────┘    └─────┘ │
│  Upload         AI Text        Images         Video      Review   │
│  Photo          Generate       (one-by-one)   Generate   & Save   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## 🗂️ File Structure

```
snap2listing/
│
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Root layout with ThemeRegistry
│   │   ├── page.tsx                      # Landing page
│   │   │
│   │   ├── (marketing)/                  # Public pages
│   │   │   ├── pricing/page.tsx          # Plan comparison table
│   │   │   ├── features/page.tsx         # Feature highlights
│   │   │   └── how-it-works/page.tsx     # 5-step process
│   │   │
│   │   ├── (auth)/                       # Authentication
│   │   │   ├── login/page.tsx            # Login form (mocked)
│   │   │   └── signup/page.tsx           # Signup form (mocked)
│   │   │
│   │   ├── (dashboard)/                  # Protected routes
│   │   │   ├── layout.tsx                # AppLayout (sidebar + topbar)
│   │   │   ├── overview/page.tsx         # KPIs, usage stats
│   │   │   ├── listings/page.tsx         # All saved listings
│   │   │   ├── create/page.tsx           # ⭐ MAIN WORKFLOW
│   │   │   ├── shops/page.tsx            # Etsy connections
│   │   │   ├── templates/page.tsx        # Saved prompt templates
│   │   │   └── settings/page.tsx         # Profile & billing
│   │   │
│   │   └── api/                          # Backend routes
│   │       ├── generate-text/route.ts    # OpenAI text generation
│   │       ├── generate-image/route.ts   # FAL.ai image generation
│   │       ├── generate-video/route.ts   # FAL.ai video generation
│   │       ├── generate-video-status/    # Video status polling
│   │       └── etsy/                     # Etsy OAuth & publishing
│   │
│   ├── components/
│   │   ├── ThemeRegistry.tsx             # MUI theme provider
│   │   │
│   │   ├── AppLayout/                    # Dashboard layout
│   │   │   ├── AppLayout.tsx             # Main layout component
│   │   │   ├── Sidebar.tsx               # Left navigation
│   │   │   └── Topbar.tsx                # Header with avatar
│   │   │
│   │   ├── CreateListing/                # ⭐ Core workflow components
│   │   │   ├── ListingWizard.tsx         # Main stepper logic
│   │   │   ├── UploadStep.tsx            # Step 1: Photo upload
│   │   │   ├── DetailsStep.tsx           # Step 2: AI text
│   │   │   ├── ImagesStep.tsx            # Step 3: Image generation
│   │   │   ├── VideoStep.tsx             # Step 4: Video generation
│   │   │   └── ReviewStep.tsx            # Step 5: Preview & save
│   │   │
│   │   ├── Listings/
│   │   │   ├── ListingCard.tsx           # Card view
│   │   │   └── ListingTable.tsx          # Table view
│   │   │
│   │   ├── Pricing/
│   │   │   └── PricingTable.tsx          # Plan comparison
│   │   │
│   │   └── common/
│   │       ├── LoadingSpinner.tsx
│   │       ├── EmptyState.tsx
│   │       └── ConfirmDialog.tsx
│   │
│   ├── lib/
│   │   ├── types.ts                      # TypeScript interfaces
│   │   ├── utils.ts                      # Helper functions
│   │   │
│   │   └── api/                          # API client libraries
│   │       ├── fal.ts                    # FAL.ai SDK wrapper
│   │       ├── openai.ts                 # OpenAI SDK wrapper
│   │       ├── etsy.ts                   # Etsy API client
│   │       └── storage.ts                # R2/S3 upload helper
│   │
│   └── config/
│       ├── pricing.ts                    # ⭐ All pricing logic
│       └── theme.ts                      # MUI theme config
│
├── package.json
├── tsconfig.json
├── next.config.js
└── .env.local
```

## 💰 Pricing Flow

```
User generates content ──▶ Track usage ──▶ Compare to plan limits
                                │
                                ▼
                        ┌───────────────┐
                        │ Within limits?│
                        └───────┬───────┘
                                │
                    ┌───────────┴───────────┐
                    ▼                       ▼
                  YES                      NO
                    │                       │
                    ▼                       ▼
            Free generation         Charge overage
            (included in plan)      ($0.06/image
                                    $0.60/video)
```

### Example: Starter Plan ($29/mo)

```
Plan includes:
├── 200 images
├── 5 videos
└── 2 Etsy shops

Platform cost:
├── 200 × $0.04 = $8.00
├── 5 × $0.25   = $1.25
└── Total       = $9.25

Profit: $29 - $9.25 = $19.75 (68% margin) ✅

User generates 210 images + 6 videos:
├── Base: $29/mo
├── Overage: (10 × $0.06) + (1 × $0.60) = $1.20
└── Total bill: $30.20
```

## 🔄 Image Generation Flow (Step 3)

```
┌──────────────────────────────────────────────────────────┐
│  ImagesStep Component                                    │
│                                                          │
│  State:                                                  │
│  ├── currentIndex: 0 (which image slot we're on)       │
│  ├── images: Array(9) [null, null, null, ...]          │
│  └── prompt: "pre-filled suggestion"                    │
│                                                          │
│  User actions:                                          │
│  1. Edit prompt                                         │
│  2. Click "Generate Image #1"                           │
│     │                                                    │
│     ├──▶ Call /api/generate-image                      │
│     │                                                    │
│     ├──▶ Show loading (4-6 seconds)                    │
│     │                                                    │
│     └──▶ Image appears in slot #1                      │
│                                                          │
│  3. Auto-advance to Image #2                            │
│     └──▶ Pre-fill with next suggestion                 │
│                                                          │
│  4. Repeat for images 2-9                               │
│                                                          │
│  User can:                                              │
│  ├── Regenerate any image (click 🔄)                   │
│  ├── Delete any image (click 🗑️)                      │
│  ├── Skip to video after 3 images                      │
│  └── Generate all 9 before continuing                   │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## 🎬 Video Generation Flow (Step 4)

```
┌────────────────────────────────────────────────┐
│  VideoStep Component                           │
│                                                │
│  1. Select base image:                         │
│     ○ Original uploaded photo                  │
│     ○ One of 9 generated images                │
│                                                │
│  2. Enter video prompt:                        │
│     "Rotate 360° with soft lighting"           │
│                                                │
│  3. Click "Generate Video"                     │
│     │                                          │
│     ├──▶ POST /api/generate-video             │
│     │     Returns: { requestId, status }      │
│     │                                          │
│     ├──▶ Poll /api/video-status?id=xxx        │
│     │     Every 5 seconds                     │
│     │                                          │
│     └──▶ After 30-60 seconds:                 │
│           { status: "completed", url: "..." } │
│                                                │
│  4. Video appears (can regenerate)             │
│                                                │
│  5. OR click "Skip Video" (optional)           │
│                                                │
└────────────────────────────────────────────────┘
```

## 🎨 Theme Structure

```
Light Mode Only
├── Colors
│   ├── Primary: #5B7CFA (indigo)
│   ├── Secondary: #FF8A5C (coral)
│   └── Background: #F7F9FC (airy light)
│
├── Typography
│   ├── Body: 18px (readable!)
│   ├── H1: 44px/600
│   └── Font: Inter
│
├── Spacing
│   ├── Sections: 32-64px
│   ├── Border radius: 14px
│   └── Touch targets: 44px min
│
└── Accessibility
    ├── WCAG AA contrast
    ├── Focus rings: 3px
    └── Keyboard nav
```

## 📊 Dashboard Routes

```
Dashboard (AppLayout)
│
├── /app/overview
│   └── KPIs + usage charts
│
├── /app/listings
│   ├── Table/Card view
│   ├── Filter by status
│   └── Actions: Edit, Publish, Delete
│
├── /app/create ⭐
│   └── 5-step wizard (main feature)
│
├── /app/shops
│   ├── Connected Etsy shops
│   └── Add/remove connections
│
├── /app/templates
│   └── Saved prompt templates
│
└── /app/settings
    ├── Profile
    ├── Plan & usage
    └── Billing
```

## 🚀 Build Order

```
1. Config & Types
   ├── pricing.ts (30 min)
   ├── theme.ts (20 min)
   └── types.ts (15 min)

2. Foundation
   ├── ThemeRegistry (10 min)
   ├── Root layout (10 min)
   └── Landing page (20 min)

3. Marketing Pages
   ├── Pricing page (30 min)
   ├── Features page (20 min)
   └── Auth pages (20 min)

4. Dashboard Shell
   ├── AppLayout (30 min)
   ├── Overview page (25 min)
   ├── Listings page (25 min)
   └── Shops/Settings (20 min)

5. Core Workflow ⭐
   ├── ListingWizard (20 min)
   ├── UploadStep (15 min)
   ├── DetailsStep (20 min)
   ├── ImagesStep (45 min) ← Most complex
   ├── VideoStep (30 min)
   └── ReviewStep (20 min)

6. API Mocks
   ├── generate-text (10 min)
   ├── generate-image (10 min)
   └── generate-video (15 min)

Total: ~6-8 hours for MVP
```

## ✅ Success Checklist

After build:

- [ ] App starts without errors: `npm run dev`
- [ ] Landing page loads at `/`
- [ ] Pricing page shows all 5 plans
- [ ] Can navigate to `/app/create`
- [ ] Step 1: Upload works (fake image)
- [ ] Step 2: AI text appears (mocked)
- [ ] Step 3: Can generate 9 images one-by-one
- [ ] Step 4: Video generation works (or skip)
- [ ] Step 5: Review shows all content
- [ ] Save redirects to `/app/listings`
- [ ] Listings page shows saved listing
- [ ] Theme is light mode, 18px body text
- [ ] All touch targets are 44px+
- [ ] Keyboard navigation works
- [ ] Mobile responsive

## 🔌 API Integration Points

When ready to connect real APIs:

```typescript
// Before (MVP):
const result = await mockGenerateImage({ prompt });

// After (Production):
import * as fal from "@fal-ai/serverless-client";
const result = await fal.subscribe("fal-ai/flux-schnell", {
  input: { prompt }
});
```

Replace in these files:
1. `src/app/api/generate-text/route.ts`
2. `src/app/api/generate-image/route.ts`
3. `src/app/api/generate-video/route.ts`
4. Add Etsy OAuth to `src/app/api/etsy/*`
5. Connect Supabase in `src/lib/db/*`
6. Add Stripe in `src/app/api/billing/*`
