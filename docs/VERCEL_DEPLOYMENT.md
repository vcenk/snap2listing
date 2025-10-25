# 🚀 Deploying Snap2Listing to Vercel

This guide will help you deploy your app to production on Vercel.

---

## ✅ Pre-Deployment Checklist

Before deploying, make sure you have:

### **1. Database is Ready**
- [ ] All SQL functions created in Supabase
- [ ] `users` table has all required columns
- [ ] Test user exists with valid data
- [ ] RPC functions tested (`can_generate_image`, `can_generate_video`)

### **2. All API Keys Configured**
- [ ] Supabase keys (URL, Anon Key, Service Role Key)
- [ ] FAL.ai API key
- [ ] OpenAI API key
- [ ] Cloudflare R2 or AWS S3 credentials
- [ ] Stripe keys (use TEST mode first!)
- [ ] Etsy OAuth credentials

### **3. Stripe Products Created**
- [ ] Created all subscription products in Stripe
- [ ] Have all Price IDs ready
- [ ] Tested checkout locally with Stripe CLI
- [ ] Webhook endpoint ready

### **4. Local Testing Passed**
- [ ] App runs locally without errors (`npm run dev`)
- [ ] Can sign up as new user
- [ ] Can create a listing
- [ ] Can generate images
- [ ] Can generate videos
- [ ] Overview dashboard shows correct stats
- [ ] Stripe checkout works
- [ ] Upgrade modal appears at limits

---

## 📦 Step 1: Prepare Your Repository

### 1.1 Create GitHub Repository (if not already done)

```bash
# Initialize git if needed
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - ready for deployment"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/snap2listing.git
git branch -M main
git push -u origin main
```

### 1.2 Verify .gitignore

Make sure `.gitignore` includes:
```
# Env files
.env
.env.local
.env.*.local

# Next.js
.next/
out/
build/
dist/

# Dependencies
node_modules/

# Debug logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local development
.DS_Store
*.pem

# Vercel
.vercel
```

---

## 🚀 Step 2: Deploy to Vercel

### 2.1 Sign Up / Login to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up or login (use GitHub account for easy integration)

### 2.2 Import Your Project

1. Click **"Add New Project"**
2. Select **"Import Git Repository"**
3. Choose your GitHub repository
4. Click **"Import"**

### 2.3 Configure Build Settings

Vercel should auto-detect Next.js. Verify:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 2.4 Add Environment Variables

Click **"Environment Variables"** and add ALL of these:

#### **Supabase**
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key
```

#### **Database** (if using direct connection)
```
DATABASE_URL=postgresql://postgres:...@db.your-project.supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:...@db.your-project.supabase.co:5432/postgres
```

#### **AI Services**
```
FAL_KEY=your_fal_api_key
OPENAI_API_KEY=sk-...your-openai-key
```

#### **Storage (Cloudflare R2)**
```
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
R2_BUCKET_NAME=snap2listing
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_PUBLIC_URL=https://your-bucket.r2.dev
```

#### **Stripe (TEST MODE FIRST!)**
```
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs
STRIPE_PRICE_STARTER_MONTHLY=price_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_...
STRIPE_PRICE_STARTER_YEARLY=price_...
STRIPE_PRICE_PRO_YEARLY=price_...
STRIPE_PRICE_ENTERPRISE_YEARLY=price_...
STRIPE_PRICE_ADDON_IMAGES=price_...
STRIPE_PRICE_ADDON_VIDEOS=price_...
```

#### **Etsy OAuth**
```
ETSY_CLIENT_ID=your_etsy_client_id
ETSY_CLIENT_SECRET=your_etsy_client_secret
ETSY_REDIRECT_URI=https://your-domain.vercel.app/api/etsy/callback
```

#### **App URLs**
```
NEXT_PUBLIC_URL=https://your-domain.vercel.app
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NODE_ENV=production
```

### 2.5 Deploy!

Click **"Deploy"** and wait 2-3 minutes.

---

## 🔧 Step 3: Post-Deployment Configuration

### 3.1 Set Up Custom Domain (Optional but Recommended)

1. Go to Project Settings → Domains
2. Add your custom domain (e.g., `snap2listing.com`)
3. Follow DNS configuration instructions
4. Update environment variables:
   ```
   NEXT_PUBLIC_URL=https://snap2listing.com
   ETSY_REDIRECT_URI=https://snap2listing.com/api/etsy/callback
   ```

### 3.2 Configure Stripe Webhook

**Important**: You need a production webhook endpoint!

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **"Add endpoint"**
3. Enter URL: `https://your-domain.vercel.app/api/stripe/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click **"Add endpoint"**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Update Vercel environment variable:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_your_new_production_secret
   ```
8. Redeploy to apply changes

### 3.3 Update Etsy App Settings

1. Go to [Etsy Developers](https://www.etsy.com/developers/your-apps)
2. Edit your app
3. Update **Redirect URI**: `https://your-domain.vercel.app/api/etsy/callback`
4. Save changes

---

## ✅ Step 4: Verify Deployment

### 4.1 Test Basic Functionality

1. Visit your production URL
2. Check landing page loads
3. Check pricing page
4. Try signing up
5. Try logging in

### 4.2 Test Full Flow

1. **Sign up** as a new user
2. **Create** a listing
3. **Generate** images (test limits!)
4. **Generate** video
5. Check **Overview** dashboard shows correct stats
6. Try to **upgrade** (Stripe checkout)
7. **Connect** Etsy shop (OAuth)
8. **Publish** listing to Etsy

### 4.3 Monitor Logs

Check Vercel logs for errors:
1. Go to your project in Vercel
2. Click **"Logs"** tab
3. Watch for errors during testing

### 4.4 Test Stripe Webhooks

1. Make a test purchase
2. Go to Stripe Dashboard → Webhooks
3. Check events are being delivered
4. Verify database is updated (user plan, subscription status)

---

## 🐛 Troubleshooting Common Issues

### Issue: "Environment variable not defined"

**Solution**:
- Go to Vercel → Settings → Environment Variables
- Add the missing variable
- Redeploy (Deployments → Click ⋮ → Redeploy)

### Issue: "Database connection failed"

**Solution**:
- Check `DATABASE_URL` and `DIRECT_URL` are correct
- Verify Supabase service role key is correct
- Check IP allowlist in Supabase (should allow all for Vercel)

### Issue: "Stripe webhook not working"

**Solution**:
- Verify webhook endpoint URL is correct
- Check `STRIPE_WEBHOOK_SECRET` is from production endpoint (not CLI)
- Ensure events are selected in Stripe Dashboard
- Check Vercel logs for webhook errors

### Issue: "Images/videos not generating"

**Solution**:
- Check FAL_KEY is set correctly
- Check R2/S3 credentials are correct
- Verify database functions exist (`can_generate_image`)
- Check Vercel logs for API errors

### Issue: "Etsy OAuth failing"

**Solution**:
- Verify `ETSY_REDIRECT_URI` matches exactly in both:
  - Vercel environment variables
  - Etsy App settings
- Check Etsy app is in "Production" mode (not Development)
- Ensure app has all required scopes

---

## 🔄 Making Updates After Deployment

### Update Code

```bash
# Make your changes
git add .
git commit -m "Description of changes"
git push origin main
```

Vercel will automatically deploy the new version!

### Update Environment Variables

1. Go to Vercel → Settings → Environment Variables
2. Edit the variable
3. Choose which environments to update (Production, Preview, Development)
4. Click **"Save"**
5. **Important**: Redeploy to apply changes
   - Go to Deployments
   - Click ⋮ on latest deployment
   - Click "Redeploy"

### Rollback if Needed

1. Go to Deployments
2. Find the last working deployment
3. Click ⋮ → Promote to Production

---

## 📊 Production Monitoring

### Set Up Alerts

1. Go to Project Settings → Integrations
2. Add Slack/Discord/Email notifications for:
   - Deployment failures
   - Runtime errors
   - High error rates

### Monitor Performance

- Check Vercel Analytics (automatically included)
- Monitor API response times
- Track error rates

### Set Up Uptime Monitoring

Use services like:
- [UptimeRobot](https://uptimerobot.com) (free)
- [Pingdom](https://www.pingdom.com)
- [Better Uptime](https://betteruptime.com)

---

## 🎉 You're Live!

Congratulations! Your app is now live on Vercel.

### Next Steps

1. **Test everything thoroughly**
2. **Set up analytics** (PostHog, Google Analytics)
3. **Configure error tracking** (Sentry)
4. **Prepare marketing materials**
5. **Start acquiring users!**

### Going to Stripe Live Mode

When ready for real payments:

1. Switch Stripe to **Live mode**
2. Create products again (test data doesn't transfer)
3. Update all `STRIPE_PRICE_*` IDs with live IDs
4. Update `STRIPE_SECRET_KEY` with live key (starts with `sk_live_`)
5. Create new production webhook
6. Update `STRIPE_WEBHOOK_SECRET`
7. Redeploy

---

## 📱 Share Your Success!

Your app is live! Share it:
- Twitter/X
- Product Hunt
- Reddit (r/SideProject, r/Etsy)
- Indie Hackers
- Your network

**You built this! 🎉**
