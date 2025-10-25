# 🚀 Snap2Listing - Quick Start Guide

## How to Use This Prompt

### Option 1: Claude CLI (Recommended)
```bash
# Install Claude CLI if you haven't
npm install -g @anthropic-ai/claude-cli

# Navigate to your project directory
cd ~/C:\Users\User\Desktop\ClaudeCodeProjects\Snap2Listing

# Start Claude CLI in build mode
claude code build

# When prompted, paste the contents of CLAUDE_CLI_PROMPT.md
# OR point it to the file:
claude code build --prompt CLAUDE_CLI_PROMPT.md

# Claude will build everything step by step
# It will show progress and ask for confirmation at key steps
```

### Option 2: Replit
```
1. Go to replit.com
2. Click "Create Repl"
3. Choose "Next.js"
4. Click "Ask AI to build"
5. Paste the entire CLAUDE_CLI_PROMPT.md content
6. Let Replit AI build the app
```

### Option 3: v0.dev (Vercel)
```
1. Go to v0.dev
2. Start a new project
3. Paste the relevant sections (start with components)
4. Iterate and refine
```

### Option 4: Manual Build (Step by Step)
```
1. Follow the "Step-by-Step Build Instructions" section
2. Copy each code block in order
3. Build and test incrementally
```

## What Gets Built

### Phase 1: Foundation (15 min)
- ✅ Next.js project with TypeScript
- ✅ MUI v6 theme (light mode, large text)
- ✅ Pricing configuration (68% margins)
- ✅ Type definitions
- ✅ Landing page

### Phase 2: Marketing Pages (20 min)
- ✅ Pricing page with plan comparison
- ✅ Features page
- ✅ How It Works page
- ✅ Auth pages (login/signup mocked)

### Phase 3: Dashboard Shell (25 min)
- ✅ AppLayout (sidebar + topbar)
- ✅ Overview page (KPIs, usage stats)
- ✅ Listings page (table/cards)
- ✅ Shops page (Etsy connections)
- ✅ Settings page

### Phase 4: Core Workflow (45 min) ⭐
- ✅ /app/create - The 5-step wizard
  - Step 1: Upload + description
  - Step 2: AI details (title/tags/desc)
  - Step 3: Images (one-by-one with prompts)
  - Step 4: Video (select base + generate)
  - Step 5: Review + save
- ✅ Auto-save drafts
- ✅ Individual image regeneration
- ✅ Custom prompts per image

### Phase 5: API Mocks (15 min)
- ✅ /api/generate-text (OpenAI mock)
- ✅ /api/generate-image (FAL.ai mock)
- ✅ /api/generate-video (FAL.ai mock)
- ✅ /api/generate-video-status (polling)

**Total Build Time: ~2 hours**

## Key Files to Review

1. **src/config/pricing.ts** - All pricing logic
2. **src/config/theme.ts** - MUI theme customization
3. **src/app/(dashboard)/create/page.tsx** - Main workflow
4. **src/components/CreateListing/ListingWizard.tsx** - Core component

## Testing the Workflow

```bash
npm run dev
# Navigate to: http://localhost:3000/app/create

# Test complete flow:
1. Upload image → Continue
2. See AI-generated title/tags → Continue  
3. Generate 3-9 images one by one → Continue
4. Generate video (or skip) → Continue
5. Review and save → Redirects to /app/listings
```

## Connecting Real APIs (After MVP)

### 1. FAL.ai for Images
```typescript
// lib/api/fal.ts
import * as fal from "@fal-ai/serverless-client";

fal.config({ credentials: process.env.FAL_KEY });

export async function generateImage({ prompt, negativePrompt }) {
  const result = await fal.subscribe("fal-ai/flux-schnell", {
    input: {
      prompt,
      negative_prompt: negativePrompt,
      image_size: "square",
      num_inference_steps: 4,
    },
  });
  return result.data.images[0];
}
```

### 2. OpenAI for Text
```typescript
// lib/api/openai.ts
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateListingText({ imageUrl, productName }) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "Generate Etsy title, 13 tags, description..." },
          { type: "image_url", image_url: { url: imageUrl } },
        ],
      },
    ],
  });
  return JSON.parse(response.choices[0].message.content);
}
```

### 3. Etsy OAuth
```typescript
// Follow: https://developers.etsy.com/documentation/essentials/authentication
```

## Pricing Verification

Run these checks after building:

```typescript
// In browser console or Node:
import { PLANS, estimatePlatformCost } from './src/config/pricing';

// Starter Plan Check:
const starterPlan = PLANS[1]; // Starter
const cost = estimatePlatformCost({
  images: 200,
  videos: 5,
});
console.log('Starter Cost:', cost.total); // $9.25
console.log('Starter Revenue:', starterPlan.priceMonthly); // $29
console.log('Profit:', starterPlan.priceMonthly - cost.total); // $19.75
console.log('Margin:', ((starterPlan.priceMonthly - cost.total) / starterPlan.priceMonthly * 100).toFixed(0) + '%'); // 68%
```

Expected output:
- Free: -$1.20 (acquisition cost)
- Starter: $19.75 profit (68% margin) ✅
- Pro: $40 profit (58% margin) ✅
- Growth: $62.50 profit (48% margin) ✅
- Studio: $111 profit (45% margin) ✅

## Common Issues & Fixes

### Build Errors
```bash
# Clear cache and reinstall
rm -rf .next node_modules package-lock.json
npm install
npm run dev
```

### MUI Theme Issues
```bash
# Make sure these versions match:
npm install @mui/material@^6.1.1 @mui/icons-material@^6.1.1 @emotion/react@^11.11.4
```

### Type Errors
```bash
# Regenerate types
npx tsc --noEmit
```

## Next Steps After MVP

1. **Week 1-2: Connect Real APIs**
   - FAL.ai integration
   - OpenAI integration
   - Etsy OAuth flow
   - R2/S3 storage

2. **Week 3: Database & Auth**
   - Supabase setup
   - NextAuth with Etsy
   - User profiles
   - Usage tracking

3. **Week 4: Billing**
   - Stripe integration
   - Subscription management
   - Overage billing
   - Usage meters

4. **Week 5: Polish**
   - Error handling
   - Loading states
   - Empty states
   - Onboarding tour

5. **Week 6: Launch**
   - Beta testing
   - SEO optimization
   - Analytics
   - Deploy to Vercel

## Support

If Claude CLI gets stuck:
1. Check the current file it's working on
2. Review any error messages
3. You can manually fix and ask Claude to continue
4. Use "skip this file" if needed and come back later

## File Checklist

After build completes, verify these exist:

### Config
- [ ] src/config/pricing.ts
- [ ] src/config/theme.ts

### Core App
- [ ] src/app/layout.tsx
- [ ] src/app/page.tsx
- [ ] src/components/ThemeRegistry.tsx

### Marketing
- [ ] src/app/(marketing)/pricing/page.tsx
- [ ] src/app/(marketing)/features/page.tsx

### Dashboard
- [ ] src/app/(dashboard)/layout.tsx
- [ ] src/app/(dashboard)/overview/page.tsx
- [ ] src/app/(dashboard)/listings/page.tsx
- [ ] src/app/(dashboard)/create/page.tsx ⭐

### Components
- [ ] src/components/AppLayout/AppLayout.tsx
- [ ] src/components/CreateListing/ListingWizard.tsx ⭐
- [ ] src/components/CreateListing/ImagesStep.tsx ⭐

### API
- [ ] src/app/api/generate-text/route.ts
- [ ] src/app/api/generate-image/route.ts
- [ ] src/app/api/generate-video/route.ts

## Success! 🎉

Once built, you'll have:
✅ Production-ready UI
✅ Complete 5-step workflow
✅ Profitable pricing (68% margins)
✅ One-by-one image generation
✅ Video generation with base selection
✅ Light mode, large text, accessible
✅ Ready to connect real APIs

**Total investment to MVP: ~2-4 hours**
**Time to first customer: ~2 weeks** (with API connections)
