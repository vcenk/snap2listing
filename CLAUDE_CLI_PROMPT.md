# Snap2Listing - Complete Rebuild Prompt for Claude CLI

## Project Overview
Build a production-ready Next.js 14 web app for generating AI-powered Etsy listings. Users upload one product photo and get 9 professional images, 1 video, AI-generated titles/tags/descriptions, and can publish directly to Etsy.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **UI Library**: Material UI v6 (light mode only)
- **Language**: TypeScript (strict mode)
- **Styling**: MUI theme system + sx props
- **APIs**: FAL.ai (images/videos), OpenAI (text), Etsy OAuth
- **Storage**: Cloudflare R2 or AWS S3
- **Database**: Supabase (PostgreSQL)
- **Auth**: NextAuth.js with Etsy OAuth
- **Payments**: Stripe

## Critical Design Requirements

### 1. Light Mode Only Theme
```typescript
COLORS:
- Primary: #5B7CFA (muted indigo)
- Secondary: #FF8A5C (soft coral)
- Success: #66C2A5
- Warning: #F6C85F
- Error: #E57373
- Background: #F7F9FC
- Paper: #FFFFFF
- Text Primary: #111827
- Text Secondary: #4B5563

TYPOGRAPHY:
- Font: Inter (fallback to system)
- Body1: 18px (1.125rem), line-height 1.65
- Body2: 16px (1rem), line-height 1.65
- H1: 44px/600, line-height 1.25
- H2: 32px/600, line-height 1.3
- H3: 24px/600, line-height 1.3
- H4: 20px/600, line-height 1.4

SPACING:
- Border radius: 14px (buttons 12px)
- Section padding: 32-64px
- Grid gaps: 16-24px
- Min touch target: 44x44px

ACCESSIBILITY:
- WCAG 2.1 AA contrast ratios
- Visible focus rings (3px solid primary)
- Keyboard navigation throughout
- ARIA labels on all interactive elements
```

### 2. Pricing Strategy (Images/Videos Based)
```typescript
// config/pricing.ts
UNIT COSTS (our platform):
- Image: $0.04 (FAL.ai)
- Video: $0.25 (FAL.ai)
- Text: $0.01 (OpenAI)

OVERAGE PRICING (what we charge):
- Extra image: $0.06 (50% margin)
- Extra video: $0.60 (58% margin)

PLANS:
Free: 
  - $0/mo
  - 30 images, 0 videos
  - 1 shop
  - ~3 listings
  
Starter: 
  - $29/mo
  - 200 images, 5 videos
  - 2 shops
  - ~22 listings
  - 68% profit margin
  
Pro: 
  - $69/mo
  - 600 images, 20 videos
  - 5 shops
  - ~66 listings
  - 58% profit margin
  
Growth: 
  - $129/mo
  - 1,350 images, 50 videos
  - 10 shops
  - ~150 listings
  - 48% profit margin
  
Studio: 
  - $249/mo
  - 2,700 images, 120 videos
  - Unlimited shops
  - 3 team seats
  - ~300 listings
  - 45% profit margin
```

## Core Workflow (CRITICAL)

### Single Page: /app/create (5-Step Wizard)

```
┌─────────────────────────────────────────────────────────┐
│  Create Listing  [Step X of 5]    [Save Draft] [Exit]  │
├─────────────────────────────────────────────────────────┤
│  ○─────○─────○─────○─────○                              │
│  1     2     3     4     5                              │
│  Upload Details Images Video Review                     │
│                                                          │
│  [Active Step Content]                                   │
│                                                          │
│                           [← Back] [Continue →]         │
└─────────────────────────────────────────────────────────┘
```

### Step 1: Upload Product Photo
```typescript
// User uploads image + optional short description
<Box>
  <DragDropZone accept="image/*" />
  <TextField 
    label="Quick Description (optional)"
    placeholder="Handmade ceramic mug..."
  />
  <Select label="Category" options={ETSY_CATEGORIES} />
  <TextField label="Price" type="number" startAdornment="$" />
</Box>

// Backend: Upload to temp storage, extract metadata
```

### Step 2: AI Product Details
```typescript
// Auto-generated after ~3 seconds, editable

<Alert severity="success">✨ AI Generated Details</Alert>

<TextField 
  label="Title (140 chars max)"
  value={aiTitle}
  helperText={`${title.length}/140`}
/>
<Button startIcon={<RefreshIcon />}>Regenerate Title</Button>

<Box>
  {aiTags.map(tag => (
    <Chip label={tag} onDelete={handleDelete} />
  ))}
  <TextField label="Add custom tag" />
</Box>

<TextField 
  label="Description"
  multiline
  rows={6}
  value={aiDescription}
/>
<Button>Regenerate Description</Button>

// Backend: Call OpenAI with uploaded image + context
```

### Step 3: Generate Images (ONE BY ONE)
```typescript
// User writes individual prompts for each image

<Typography>Generate Product Images (0/9 completed)</Typography>

<Box>
  <Typography variant="h6">Image #{currentIndex + 1}</Typography>
  
  <TextField
    multiline
    rows={3}
    label="Image Prompt"
    placeholder="professional product photo, front view, white background, studio lighting..."
    value={prompt}
  />
  
  <TextField
    label="Negative Prompt (optional)"
    placeholder="blurry, watermark, text, low quality"
    value={negativePrompt}
  />
  
  <Stack direction="row" spacing={2}>
    <FormControlLabel 
      control={<Checkbox />} 
      label="2x Upscale (+$0.02)" 
    />
    <Select label="Aspect Ratio" value="1:1" />
  </Stack>
  
  <Box>
    💡 Quick add:
    <Chip label="white background" onClick={addToPrompt} />
    <Chip label="studio lighting" onClick={addToPrompt} />
    <Chip label="4k quality" onClick={addToPrompt} />
  </Box>
  
  <Button 
    variant="contained" 
    onClick={generateCurrentImage}
    disabled={isGenerating}
  >
    {isGenerating ? 'Generating...' : `Generate Image #${currentIndex + 1}`}
  </Button>
</Box>

{/* Generated images preview grid */}
<Grid container spacing={2}>
  {images.map((img, idx) => (
    <Grid item xs={4} key={idx}>
      {img ? (
        <Card>
          <CardMedia component="img" image={img.url} />
          <CardActions>
            <IconButton onClick={() => regenerate(idx)}>
              <RefreshIcon />
            </IconButton>
            <IconButton onClick={() => deleteImage(idx)}>
              <DeleteIcon />
            </IconButton>
          </CardActions>
        </Card>
      ) : (
        <Paper sx={{ height: 200, display: 'flex', alignItems: 'center' }}>
          <Typography>Slot #{idx + 1}</Typography>
        </Paper>
      )}
    </Grid>
  ))}
</Grid>

{completedCount >= 3 && (
  <Alert severity="success">
    ✓ Minimum 3 images completed. You can continue or add more (up to 9).
  </Alert>
)}

// SUGGESTED PROMPTS (auto-fill when user moves to next image):
const PROMPTS = [
  "professional product photo of [PRODUCT], front view, white background, studio lighting, high quality, 4k",
  "[PRODUCT] at 45 degree angle, showing details, white background, natural lighting",
  "top-down flat lay of [PRODUCT], overhead view, white background, clean composition",
  "extreme close-up of [PRODUCT] texture and details, macro photography",
  "[PRODUCT] in lifestyle setting, being used naturally, warm lighting",
  "[PRODUCT] with size reference, scale comparison, white background",
  "[PRODUCT] packaged for gift, elegant presentation",
  "artistic angle of [PRODUCT], creative composition",
  "[PRODUCT] in styled scene with props, instagram aesthetic"
];

// Backend: 
// - Call FAL.ai for each image individually
// - User can regenerate any image with new prompt
// - Minimum 3 images required, max 9
```

### Step 4: Generate Video
```typescript
<Typography variant="h5">Create Product Video (5 seconds)</Typography>

<FormControl>
  <FormLabel>Base Image for Video:</FormLabel>
  <RadioGroup>
    <FormControlLabel 
      value="original" 
      control={<Radio />} 
      label="Use original uploaded photo" 
    />
    <FormControlLabel 
      value="generated" 
      control={<Radio />} 
      label="Use generated image:" 
    />
  </RadioGroup>
  
  {selectedBaseType === 'generated' && (
    <ImageList cols={3}>
      {images.map(img => (
        <ImageListItem 
          key={img.id}
          selected={selectedImage === img.id}
          onClick={() => setSelectedImage(img.id)}
        >
          <img src={img.url} />
        </ImageListItem>
      ))}
    </ImageList>
  )}
</FormControl>

<TextField
  label="Video Prompt"
  multiline
  rows={3}
  placeholder="Rotate 360 degrees with soft lighting..."
  value={videoPrompt}
/>

<Stack direction="row" spacing={2}>
  <Chip label="360° Rotation" onClick={setPreset} />
  <Chip label="Slow Zoom" onClick={setPreset} />
  <Chip label="Lifestyle Scene" onClick={setPreset} />
</Stack>

<Button 
  variant="contained" 
  onClick={generateVideo}
  disabled={isGenerating}
>
  🎬 Generate Video
</Button>

<Button variant="outlined" onClick={skipVideo}>
  ⏩ Skip Video
</Button>

{isGenerating && (
  <Box>
    <LinearProgress variant="determinate" value={progress} />
    <Typography>Generating video... ~{estimatedTime}s remaining</Typography>
  </Box>
)}

{video && (
  <Box>
    <video src={video.url} controls width="100%" />
    <Button startIcon={<RefreshIcon />}>Regenerate Video</Button>
  </Box>
)}

// Backend:
// - User selects base image (original OR one of generated)
// - Call FAL.ai Pixverse/Veo API
// - Poll for completion (30-60 seconds)
// - Video is optional (can skip)
```

### Step 5: Review & Save
```typescript
<Typography variant="h5">Preview Your Listing</Typography>

<Paper elevation={2} sx={{ p: 3 }}>
  <Box>
    <img src={images[0].url} width="100%" />
    <ImageList cols={8}>
      {images.slice(1).map(img => (
        <ImageListItem key={img.id}>
          <img src={img.url} />
        </ImageListItem>
      ))}
    </ImageList>
  </Box>
  
  {video && (
    <Box>
      <Typography variant="h6">🎬 Video</Typography>
      <video src={video.url} controls width="100%" />
    </Box>
  )}
  
  <Divider sx={{ my: 3 }} />
  
  <Typography variant="h6">{title}</Typography>
  <Typography variant="body2" color="text.secondary">
    ${price}
  </Typography>
  
  <Box sx={{ my: 2 }}>
    {tags.map(tag => <Chip key={tag} label={tag} size="small" />)}
  </Box>
  
  <Typography variant="body1">{description}</Typography>
</Paper>

<Stack direction="row" spacing={2} justifyContent="center">
  <Button onClick={goToStep(3)}>← Edit</Button>
  <Button 
    variant="contained" 
    size="large" 
    onClick={saveListing}
    startIcon={<SaveIcon />}
  >
    💾 Save to Listings
  </Button>
</Stack>

// Backend:
// - Save complete listing to database
// - Store all media URLs
// - Redirect to /app/listings
// - Show success toast
```

## File Structure
```
snap2listing/
├── package.json
├── tsconfig.json
├── next.config.js
├── .env.local (template)
├── README.md
│
├── src/
│   ├── app/
│   │   ├── layout.tsx (root layout with ThemeRegistry)
│   │   ├── page.tsx (landing page)
│   │   │
│   │   ├── (marketing)/
│   │   │   ├── pricing/page.tsx
│   │   │   ├── features/page.tsx
│   │   │   └── how-it-works/page.tsx
│   │   │
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   │
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx (AppLayout with sidebar)
│   │   │   ├── overview/page.tsx
│   │   │   ├── listings/page.tsx
│   │   │   ├── create/page.tsx (THE MAIN WORKFLOW)
│   │   │   ├── shops/page.tsx
│   │   │   ├── templates/page.tsx
│   │   │   └── settings/page.tsx
│   │   │
│   │   └── api/
│   │       ├── generate-text/route.ts
│   │       ├── generate-image/route.ts
│   │       ├── generate-video/route.ts
│   │       ├── generate-video-status/route.ts
│   │       └── etsy/
│   │           ├── connect/route.ts
│   │           ├── callback/route.ts
│   │           └── publish/route.ts
│   │
│   ├── components/
│   │   ├── ThemeRegistry.tsx
│   │   ├── AppLayout/
│   │   │   ├── AppLayout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Topbar.tsx
│   │   ├── CreateListing/
│   │   │   ├── ListingWizard.tsx (main component)
│   │   │   ├── UploadStep.tsx
│   │   │   ├── DetailsStep.tsx
│   │   │   ├── ImagesStep.tsx (one-by-one generation)
│   │   │   ├── VideoStep.tsx
│   │   │   └── ReviewStep.tsx
│   │   ├── Listings/
│   │   │   ├── ListingCard.tsx
│   │   │   └── ListingTable.tsx
│   │   ├── Pricing/
│   │   │   └── PricingTable.tsx
│   │   └── common/
│   │       ├── LoadingSpinner.tsx
│   │       ├── EmptyState.tsx
│   │       └── ConfirmDialog.tsx
│   │
│   ├── lib/
│   │   ├── types.ts
│   │   ├── utils.ts
│   │   └── api/
│   │       ├── fal.ts (image/video generation)
│   │       ├── openai.ts (text generation)
│   │       ├── etsy.ts (OAuth + publishing)
│   │       └── storage.ts (R2/S3 uploads)
│   │
│   └── config/
│       ├── pricing.ts (PLANS, costs, calculations)
│       └── theme.ts (MUI theme)
│
└── public/
    └── logo.svg
```

## API Implementation (MOCKED for now)

### 1. Text Generation
```typescript
// src/app/api/generate-text/route.ts
export async function POST(request: Request) {
  const { productImageUrl, productName, category, shortDescription } = await request.json();
  
  // TODO: Replace with real OpenAI call
  // const response = await openai.chat.completions.create({...});
  
  // MOCK for now:
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return Response.json({
    title: `Handmade ${productName} - Unique Artisan Crafted ${category}`,
    tags: [
      'handmade', 'artisan', 'unique', 'craft', 'gift', 
      'custom', 'vintage', 'rustic', 'boho', 'modern',
      'sustainable', 'eco friendly', 'one of a kind'
    ],
    description: `Beautiful ${productName} crafted with care...\n\n${shortDescription}\n\nPerfect for gifts or personal use. Each piece is unique.`
  });
}
```

### 2. Image Generation
```typescript
// src/app/api/generate-image/route.ts
export async function POST(request: Request) {
  const { prompt, negativePrompt, upscale } = await request.json();
  
  // TODO: Replace with real FAL.ai call
  // const result = await fal.subscribe("fal-ai/flux-schnell", {...});
  
  // MOCK for now:
  await new Promise(resolve => setTimeout(resolve, 4000));
  
  return Response.json({
    id: `img_${Date.now()}`,
    url: `https://picsum.photos/seed/${Date.now()}/1000/1000`,
    prompt,
    status: 'completed',
    createdAt: new Date().toISOString()
  });
}
```

### 3. Video Generation
```typescript
// src/app/api/generate-video/route.ts
export async function POST(request: Request) {
  const { baseImageUrl, prompt } = await request.json();
  
  // TODO: Replace with real FAL.ai call
  // const result = await fal.subscribe("fal-ai/pixverse", {...});
  
  // MOCK for now:
  const requestId = `vid_${Date.now()}`;
  
  return Response.json({
    id: requestId,
    requestId,
    status: 'queued',
    estimatedTime: 45
  });
}

// Polling endpoint
// src/app/api/generate-video-status/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestId = searchParams.get('requestId');
  
  // TODO: Check actual status from FAL.ai
  
  // MOCK for now:
  return Response.json({
    id: requestId,
    status: 'completed',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    progress: 100
  });
}
```

## Dashboard Routes

### Overview (/app/overview)
```typescript
<Grid container spacing={3}>
  {/* KPI Cards */}
  <Grid item xs={12} md={3}>
    <StatCard 
      title="Images Generated"
      value={156}
      limit={200}
      icon={<ImageIcon />}
    />
  </Grid>
  <Grid item xs={12} md={3}>
    <StatCard 
      title="Videos Created"
      value={3}
      limit={5}
      icon={<VideoIcon />}
    />
  </Grid>
  <Grid item xs={12} md={3}>
    <StatCard 
      title="Listings"
      value={12}
      subtitle="8 published"
    />
  </Grid>
  <Grid item xs={12} md={3}>
    <StatCard 
      title="This Month"
      value="$29"
      subtitle="Starter plan"
    />
  </Grid>
  
  {/* Usage chart */}
  <Grid item xs={12} md={8}>
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6">Usage This Month</Typography>
      {/* Mini line chart with dummy data */}
    </Paper>
  </Grid>
  
  {/* Quick actions */}
  <Grid item xs={12} md={4}>
    <Paper sx={{ p: 3 }}>
      <Button fullWidth variant="contained" href="/app/create">
        + Create New Listing
      </Button>
    </Paper>
  </Grid>
</Grid>
```

### Listings (/app/listings)
```typescript
<Box>
  <Stack direction="row" justifyContent="space-between" mb={3}>
    <Typography variant="h4">My Listings</Typography>
    <Button variant="contained" href="/app/create">
      + Create New
    </Button>
  </Stack>
  
  <Stack direction="row" spacing={2} mb={3}>
    <TextField placeholder="Search..." />
    <Select value="all" label="Status">
      <MenuItem value="all">All</MenuItem>
      <MenuItem value="draft">Drafts</MenuItem>
      <MenuItem value="published">Published</MenuItem>
    </Select>
  </Stack>
  
  <Grid container spacing={2}>
    {listings.map(listing => (
      <Grid item xs={12} sm={6} md={4} key={listing.id}>
        <ListingCard 
          listing={listing}
          onEdit={handleEdit}
          onPublish={handlePublish}
          onDelete={handleDelete}
        />
      </Grid>
    ))}
  </Grid>
</Box>
```

### Shops (/app/shops)
```typescript
<Box>
  <Typography variant="h4" gutterBottom>Etsy Shops</Typography>
  
  <Button variant="contained" onClick={connectNewShop}>
    + Connect Etsy Shop
  </Button>
  
  <Grid container spacing={2} mt={2}>
    {shops.map(shop => (
      <Grid item xs={12} md={6} key={shop.id}>
        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between">
              <Box>
                <Typography variant="h6">{shop.shopName}</Typography>
                <Chip 
                  label={shop.status} 
                  color={shop.status === 'connected' ? 'success' : 'error'} 
                  size="small" 
                />
              </Box>
              <IconButton onClick={() => disconnect(shop.id)}>
                <DeleteIcon />
              </IconButton>
            </Stack>
            <Typography variant="caption" color="text.secondary">
              Connected: {formatDate(shop.connectedAt)}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    ))}
  </Grid>
</Box>
```

## Environment Variables
```bash
# .env.local
# FAL.ai
FAL_KEY=your_fal_key_here

# OpenAI
OPENAI_API_KEY=your_openai_key_here

# Etsy OAuth
ETSY_CLIENT_ID=your_etsy_client_id
ETSY_CLIENT_SECRET=your_etsy_secret
ETSY_REDIRECT_URI=http://localhost:3000/api/etsy/callback

# Storage (Cloudflare R2 or AWS S3)
R2_ACCESS_KEY_ID=your_r2_key
R2_SECRET_ACCESS_KEY=your_r2_secret
R2_BUCKET_NAME=snap2listing
R2_ACCOUNT_ID=your_account_id

# Database
DATABASE_URL=postgresql://user:pass@host:5432/snap2listing

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# NextAuth
NEXTAUTH_SECRET=random_secret_here
NEXTAUTH_URL=http://localhost:3000
```

## Step-by-Step Build Instructions

1. **Initialize Project**
```bash
npx create-next-app@latest snap2listing --typescript --app --no-src
cd snap2listing
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled @mui/material-nextjs
```

2. **Create Directory Structure**
```bash
mkdir -p src/{app,components,lib,config}
mkdir -p src/app/{api,\(marketing\),\(auth\),\(dashboard\)}
mkdir -p src/components/{AppLayout,CreateListing,Listings,Pricing,common}
mkdir -p src/lib/api
```

3. **Build in This Order**:
   - ✅ Config files (pricing.ts, theme.ts)
   - ✅ Types (lib/types.ts)
   - ✅ Theme & Layout (ThemeRegistry, root layout)
   - ✅ Landing page
   - ✅ Pricing page
   - ✅ Auth pages (login/signup - mocked)
   - ✅ Dashboard layout (AppLayout with sidebar)
   - ✅ Dashboard routes (overview, listings, shops, settings)
   - ✅ **CREATE WORKFLOW** (the main feature - /app/create)
   - ✅ API routes (mocked for now)
   - ✅ README.md

4. **Test Workflow**
```bash
npm run dev
# Navigate to http://localhost:3000/app/create
# Complete entire flow with mocks
```

## Success Criteria
- ✅ App builds without errors
- ✅ Light mode theme with 18px body text
- ✅ Complete 5-step create workflow works
- ✅ One-by-one image generation with prompts
- ✅ Video generation with base image selection
- ✅ Listings save to in-memory store
- ✅ All pricing calculations correct (68% margin on Starter)
- ✅ Responsive on mobile/tablet/desktop
- ✅ Keyboard accessible
- ✅ WCAG AA contrast ratios

## Post-MVP: Connect Real APIs
1. Replace mock API routes with:
   - FAL.ai SDK for images/videos
   - OpenAI SDK for text generation
   - Etsy OAuth flow
   - R2/S3 for storage
   - Supabase for database
   - Stripe for billing

2. Add authentication with NextAuth
3. Implement usage tracking
4. Add billing webhooks

## README Template
```markdown
# Snap2Listing

AI-powered Etsy listing generator. Upload one photo, get 9 images + video + SEO.

## Quick Start
npm install
npm run dev

## Environment
Copy `.env.example` to `.env.local` and fill in API keys

## Key Features
- 5-step listing creation workflow
- One-by-one image generation with custom prompts
- Video generation from uploaded or generated images
- Usage-based pricing (images/videos, not listings)
- 68% profit margin on Starter tier

## Tech Stack
- Next.js 14, TypeScript, MUI v6
- FAL.ai (images/videos), OpenAI (text)
- Supabase, Stripe, Etsy API

## Project Structure
- `/app/create` - Main workflow
- `/app/listings` - Saved listings
- `/config/pricing.ts` - All pricing logic
- `/components/CreateListing/*` - Wizard steps
```

---

## Execute This Prompt
Copy this entire prompt to Claude CLI (claude code) and run:
```bash
claude code build
```

The assistant will build the entire application systematically, file by file, following the exact specifications above.
