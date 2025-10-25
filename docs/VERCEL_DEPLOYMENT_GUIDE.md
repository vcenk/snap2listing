# Vercel Deployment Guide for Snap2Listing

## Current Deployment Status
- ✅ Repository: https://github.com/vcenk/snap2listing
- ✅ Vercel Project: snap2listing.vercel.app
- ⏳ Custom Domain: www.snap2listing.com (pending configuration)

## Required Environment Variables

You need to configure these environment variables in your Vercel dashboard:

### 1. Application URL
Go to: https://vercel.com/vcenks-projects/snap2listing/settings/environment-variables

Add the following variables:

```env
# Application Base URL
NEXT_PUBLIC_APP_URL=https://snap2listing.vercel.app
# or when custom domain is set up:
# NEXT_PUBLIC_APP_URL=https://www.snap2listing.com
```

### 2. Supabase (Database & Auth)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key
```

**Where to find these:**
1. Go to https://app.supabase.com/project/YOUR_PROJECT/settings/api
2. Copy "Project URL" → `NEXT_PUBLIC_SUPABASE_URL`
3. Copy "anon public" key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Copy "service_role" key → `SUPABASE_SERVICE_KEY` (⚠️ Keep this secret!)

### 3. Stripe (Payment Processing)
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Plan Price IDs (Monthly)
STRIPE_PRICE_STARTER_MONTHLY=price_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_...

# Plan Price IDs (Yearly)
STRIPE_PRICE_STARTER_YEARLY=price_...
STRIPE_PRICE_PRO_YEARLY=price_...
STRIPE_PRICE_ENTERPRISE_YEARLY=price_...

# Add-on Price IDs
STRIPE_PRICE_ADDON_IMAGES=price_...
STRIPE_PRICE_ADDON_VIDEOS=price_...
```

**Where to find these:**
1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy "Publishable key" → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
3. Reveal and copy "Secret key" → `STRIPE_SECRET_KEY`
4. For webhook secret, see "Setting up Stripe Webhooks" section below

### 4. Etsy (Shop Integration)
```env
ETSY_CLIENT_ID=your_keystring
ETSY_CLIENT_SECRET=your_shared_secret
ETSY_REDIRECT_URI=https://snap2listing.vercel.app/api/etsy/callback
# or when custom domain is set up:
# ETSY_REDIRECT_URI=https://www.snap2listing.com/api/etsy/callback
```

**Where to find these:**
1. Go to https://www.etsy.com/developers/your-apps
2. Click on your app "snap2listing"
3. Copy "Keystring" → `ETSY_CLIENT_ID`
4. Copy "Shared Secret" → `ETSY_CLIENT_SECRET`

### 5. Cloudflare R2 (Image/Video Storage)
```env
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=snap2listing
NEXT_PUBLIC_R2_PUBLIC_URL=https://your-bucket.r2.dev
```

**Where to find these:**
1. Go to https://dash.cloudflare.com/
2. Navigate to R2 → Overview
3. Account ID is in the sidebar
4. Create API token under "Manage R2 API Tokens"
5. Get public URL from your bucket settings

### 6. AI Services
```env
# FAL.ai - Image & Video Generation
FAL_KEY=your_fal_api_key

# OpenAI - Text Generation
OPENAI_API_KEY=sk-...
```

**Where to find these:**
1. FAL.ai: https://fal.ai/dashboard
2. OpenAI: https://platform.openai.com/api-keys

---

## Post-Deployment Configuration

### 1. Setting up Stripe Webhooks

After your first successful deployment:

1. Go to https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. Enter endpoint URL: `https://snap2listing.vercel.app/api/stripe/webhook`
   (or `https://www.snap2listing.com/api/stripe/webhook` for custom domain)
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click "Add endpoint"
6. Copy the "Signing secret" (starts with `whsec_`)
7. Add it to Vercel as `STRIPE_WEBHOOK_SECRET`
8. Redeploy the application

### 2. Updating Etsy OAuth Redirect URI

1. Go to https://www.etsy.com/developers/your-apps
2. Click on your app "snap2listing"
3. Update the callback URL to: `https://snap2listing.vercel.app/api/etsy/callback`
   (or `https://www.snap2listing.com/api/etsy/callback` for custom domain)
4. Save changes

### 3. Setting up Custom Domain (www.snap2listing.com)

1. In Vercel dashboard, go to your project settings
2. Navigate to "Domains"
3. Add domain: `www.snap2listing.com`
4. Vercel will provide DNS records to add:
   - Type: `CNAME`
   - Name: `www`
   - Value: `cname.vercel-dns.com`
5. Add this record in your domain registrar's DNS settings
6. Wait for DNS propagation (5-60 minutes)
7. Once verified, update these environment variables:
   - `NEXT_PUBLIC_APP_URL=https://www.snap2listing.com`
   - `ETSY_REDIRECT_URI=https://www.snap2listing.com/api/etsy/callback`
8. Update Stripe webhook endpoint URL to use custom domain
9. Update Etsy app callback URL to use custom domain

---

## Deployment Checklist

- [ ] Add all environment variables to Vercel
- [ ] Deploy and verify build succeeds
- [ ] Test user signup/login
- [ ] Set up Stripe webhook endpoint
- [ ] Add `STRIPE_WEBHOOK_SECRET` to Vercel
- [ ] Update Etsy OAuth callback URL
- [ ] Test Etsy shop connection
- [ ] Test image generation
- [ ] Test listing creation
- [ ] Test Stripe checkout flow
- [ ] Configure custom domain (optional)
- [ ] Update all URLs to use custom domain
- [ ] Test complete user journey on production

---

## Troubleshooting

### "Invalid URL" error in Stripe checkout
- **Cause:** Missing `NEXT_PUBLIC_APP_URL` environment variable
- **Fix:** Add the variable in Vercel settings and redeploy

### Supabase connection errors
- **Cause:** Missing or incorrect Supabase credentials
- **Fix:** Verify all three Supabase variables are set correctly

### Etsy OAuth fails
- **Cause:** Redirect URI mismatch
- **Fix:** Ensure `ETSY_REDIRECT_URI` matches the callback URL in Etsy app settings

### Images not uploading to R2
- **Cause:** Missing or incorrect R2 credentials
- **Fix:** Verify all R2 variables are set and bucket has correct CORS settings

### Build fails on Vercel
- **Cause:** TypeScript or ESLint errors
- **Fix:** Errors are ignored in build via `next.config.js`, but check build logs for serious issues

---

## Support

- GitHub Issues: https://github.com/vcenk/snap2listing/issues
- Vercel Support: https://vercel.com/support
- Supabase Docs: https://supabase.com/docs
- Stripe Docs: https://stripe.com/docs
- Etsy API Docs: https://developers.etsy.com/documentation
