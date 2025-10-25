# Snap2Listing

AI-powered Etsy listing generator. Upload one photo, get 9 images + video + SEO-optimized content.

## Features

- **5-Step Listing Creation Workflow**: Streamlined process from upload to publish
- **AI-Generated Images**: One-by-one image generation with custom prompts (up to 9 images)
- **AI-Generated Videos**: 5-second product videos from uploaded or generated images
- **SEO-Optimized Content**: AI-generated titles, tags, and descriptions
- **Usage-Based Pricing**: Pay only for images and videos generated, not per listing
- **Direct Etsy Publishing**: Connect your Etsy shop and publish with one click
- **Multiple Shops**: Manage multiple Etsy shops (plan dependent)

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI Library**: Material UI v6 (light mode only)
- **Language**: TypeScript (strict mode)
- **Styling**: MUI theme system + sx props
- **APIs**: FAL.ai (images/videos), OpenAI (text), Etsy OAuth (coming soon)
- **Storage**: Cloudflare R2 or AWS S3 (coming soon)
- **Database**: Supabase PostgreSQL (coming soon)
- **Auth**: NextAuth.js with Etsy OAuth (coming soon)
- **Payments**: Stripe (coming soon)

## Quick Start

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

```bash
# Clone the repository
cd Snap2Listing

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
snap2listing/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth pages (login, signup)
│   ├── (dashboard)/              # Protected dashboard routes
│   │   └── app/                  # Dashboard pages
│   │       ├── overview/         # Usage stats and KPIs
│   │       ├── create/           # Main listing creation wizard
│   │       ├── listings/         # Saved listings management
│   │       ├── shops/            # Etsy shop connections
│   │       ├── templates/        # Saved templates (coming soon)
│   │       └── settings/         # User settings
│   ├── (marketing)/              # Public pages
│   │   └── pricing/              # Pricing page
│   ├── api/                      # API routes
│   │   ├── generate-text/        # AI text generation (mocked)
│   │   ├── generate-image/       # AI image generation (mocked)
│   │   └── generate-video/       # AI video generation (mocked)
│   ├── layout.tsx                # Root layout with theme
│   └── page.tsx                  # Landing page
├── components/
│   ├── AppLayout/                # Dashboard layout with sidebar
│   ├── CreateListing/            # Wizard step components
│   │   ├── ListingWizard.tsx    # Main wizard orchestrator
│   │   ├── UploadStep.tsx       # Step 1: Upload product photo
│   │   ├── DetailsStep.tsx      # Step 2: AI-generated details
│   │   ├── ImagesStep.tsx       # Step 3: Generate images one-by-one
│   │   ├── VideoStep.tsx        # Step 4: Generate video
│   │   └── ReviewStep.tsx       # Step 5: Review and save
│   ├── Listings/                 # Listing display components
│   ├── Pricing/                  # Pricing table component
│   ├── common/                   # Shared components
│   └── ThemeRegistry.tsx         # MUI theme provider
├── config/
│   ├── pricing.ts                # Pricing plans and calculations
│   └── theme.ts                  # MUI theme configuration
├── lib/
│   └── types.ts                  # TypeScript type definitions
└── public/
    └── logo.svg                   # Logo (coming soon)
```

## Key Features Explained

### Usage-Based Pricing

Unlike per-listing pricing models, Snap2Listing charges based on the resources you actually use:

- **Images**: $0.04 cost, $0.06 overage charge (50% margin)
- **Videos**: $0.25 cost, $0.60 overage charge (58% margin)
- **Text**: $0.01 per generation

Plans include monthly allocations with overage options. See [/pricing](http://localhost:3000/pricing) for details.

### 5-Step Creation Workflow

1. **Upload**: Upload product photo, add basic details (category, price)
2. **Details**: AI generates title, tags, and description (editable)
3. **Images**: Generate up to 9 images one-by-one with custom prompts
4. **Video**: Create 5-second product video (optional)
5. **Review**: Preview complete listing and save

### One-by-One Image Generation

Instead of generating all images at once, users create images individually:
- Custom prompt for each image
- Suggested prompts pre-filled
- Quick-add prompt snippets
- Regenerate or delete any image
- Minimum 3 images, maximum 9 images

## Environment Variables

The application is currently running with mocked API calls. To connect real services, create a `.env.local` file:

```bash
# FAL.ai (Images and Videos)
FAL_KEY=your_fal_key_here

# OpenAI (Text Generation)
OPENAI_API_KEY=your_openai_key_here

# Etsy OAuth (Coming Soon)
ETSY_CLIENT_ID=your_etsy_client_id
ETSY_CLIENT_SECRET=your_etsy_secret
ETSY_REDIRECT_URI=http://localhost:3000/api/etsy/callback

# Storage - Cloudflare R2 or AWS S3 (Coming Soon)
R2_ACCESS_KEY_ID=your_r2_key
R2_SECRET_ACCESS_KEY=your_r2_secret
R2_BUCKET_NAME=snap2listing
R2_ACCOUNT_ID=your_account_id

# Database (Coming Soon)
DATABASE_URL=postgresql://user:pass@host:5432/snap2listing

# Stripe (Coming Soon)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# NextAuth (Coming Soon)
NEXTAUTH_SECRET=random_secret_here
NEXTAUTH_URL=http://localhost:3000
```

## Current Status

### ✅ Completed (MVP)

- Complete UI/UX with Material UI v6
- Light mode theme with custom colors (18px body text, WCAG AA)
- Landing page with features and how-it-works
- Pricing page with 5 plans (Free, Starter, Pro, Growth, Studio)
- Auth pages (login/signup - mocked)
- Dashboard layout with sidebar navigation
- Overview dashboard with usage stats
- Listings page with card view
- Shops page (Etsy connection mocked)
- Settings page with profile and subscription management
- Complete 5-step listing creation wizard
- Mocked API routes for text, image, and video generation

### 🚧 Coming Soon (Post-MVP)

- Real API integrations:
  - FAL.ai for image/video generation
  - OpenAI for text generation
  - Etsy OAuth for shop connection and publishing
- Cloudflare R2 or AWS S3 for media storage
- Supabase database for data persistence
- NextAuth.js for authentication
- Stripe for subscription billing
- Usage tracking and billing webhooks
- Saved templates feature
- Team collaboration (Studio plan)

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Pricing Calculations

The pricing system ensures healthy profit margins:

- **Starter Plan**: $29/mo, 68% profit margin (~22 listings)
- **Pro Plan**: $69/mo, 58% profit margin (~66 listings)
- **Growth Plan**: $129/mo, 48% profit margin (~150 listings)
- **Studio Plan**: $249/mo, 45% profit margin (~300 listings)

All calculations in `config/pricing.ts`.

## Design Principles

- **Light mode only**: Consistent, professional appearance
- **18px body text**: Enhanced readability (WCAG 2.1 AA)
- **Accessible**: Keyboard navigation, focus rings, ARIA labels
- **Mobile-first**: Responsive on all devices
- **Usage-based**: Fair, transparent pricing

## Security

Snap2Listing implements enterprise-grade security measures to protect user data:

### Database Security

- **Row Level Security (RLS)**: All tables have RLS enabled - users can only access their own data
- **Secure Functions**: All database functions use immutable `search_path` to prevent SQL injection
- **Encrypted Storage**: Data encrypted at rest (AES-256) and in transit (TLS 1.2+)

### Authentication

- **Leaked Password Protection**: Passwords checked against HaveIBeenPwned database (800M+ leaked passwords)
- **Strong Password Requirements**: Minimum 8 characters with uppercase, lowercase, numbers, and symbols
- **Session Management**: Secure session handling with automatic expiration

### Compliance

- **GDPR Compliant**: Users can view, export, and delete their data
- **Data Retention**: Clear policies for data storage and deletion
- **Audit Logging**: Security events tracked for compliance

### For More Information

- See [docs/SECURITY.md](docs/SECURITY.md) for complete security documentation
- See [SECURITY_FIX_COMPLETION_REPORT.md](SECURITY_FIX_COMPLETION_REPORT.md) for security audit results
- Report security issues to: security@snap2listing.com

## License

Proprietary - All rights reserved

## Support

For issues or questions, please contact support or open an issue on GitHub.

---

Built with Next.js 14, Material UI v6, and TypeScript
