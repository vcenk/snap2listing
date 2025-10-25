# Stripe Integration Setup Guide

## Prerequisites
- Stripe account (create at https://stripe.com)
- Supabase database migration completed (`supabase-stripe-migration.sql`)
- Environment variables configured (`.env.local`)

---

## Step 1: Create Stripe Account & Get API Keys

1. Go to https://dashboard.stripe.com
2. Navigate to **Developers → API Keys**
3. Copy your keys and add to `.env.local`:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

---

## Step 2: Create Products & Prices in Stripe

### Method A: Using Stripe Dashboard (Recommended)

1. Go to **Products** in Stripe Dashboard
2. Click **+ Add Product**

#### Create Product 1: "Starter Plan"
- **Name:** Snap2Listing Starter
- **Description:** 100 AI images & 5 AI videos per month
- **Pricing:**
  - Click "+ Add another price"
  - **Monthly:** $19.00 USD, Recurring, Monthly billing
  - **Yearly:** $190.00 USD, Recurring, Yearly billing
- Save the product
- Copy both price IDs and add to `.env.local`:
  ```
  STRIPE_PRICE_STARTER_MONTHLY=price_...
  STRIPE_PRICE_STARTER_YEARLY=price_...
  ```

#### Create Product 2: "Pro Plan"
- **Name:** Snap2Listing Pro
- **Description:** 300 AI images & 15 AI videos per month
- **Pricing:**
  - **Monthly:** $49.00 USD, Recurring, Monthly billing
  - **Yearly:** $490.00 USD, Recurring, Yearly billing
- Copy price IDs:
  ```
  STRIPE_PRICE_PRO_MONTHLY=price_...
  STRIPE_PRICE_PRO_YEARLY=price_...
  ```

#### Create Product 3: "Enterprise Plan"
- **Name:** Snap2Listing Enterprise
- **Description:** 1,000 AI images & 50 AI videos per month
- **Pricing:**
  - **Monthly:** $129.00 USD, Recurring, Monthly billing
  - **Yearly:** $1,290.00 USD, Recurring, Yearly billing
- Copy price IDs:
  ```
  STRIPE_PRICE_ENTERPRISE_MONTHLY=price_...
  STRIPE_PRICE_ENTERPRISE_YEARLY=price_...
  ```

#### Create Product 4: "20 Extra Images"
- **Name:** 20 Extra AI Images
- **Description:** One-time add-on purchase
- **Pricing:**
  - **One-time:** $10.00 USD, One-time payment
- Copy price ID:
  ```
  STRIPE_PRICE_ADDON_IMAGES=price_...
  ```

#### Create Product 5: "2 Extra Videos"
- **Name:** 2 Extra AI Videos
- **Description:** One-time add-on purchase
- **Pricing:**
  - **One-time:** $10.00 USD, One-time payment
- Copy price ID:
  ```
  STRIPE_PRICE_ADDON_VIDEOS=price_...
  ```

### Method B: Using Stripe CLI (Advanced)

```bash
# Install Stripe CLI
npm install -g stripe

# Login
stripe login

# Create products and prices
stripe products create --name "Snap2Listing Starter" --description "100 AI images & 5 AI videos per month"
stripe prices create --product prod_... --currency usd --unit-amount 1900 --recurring[interval]=month

# Repeat for all products...
```

---

## Step 3: Set Up Webhook

1. Go to **Developers → Webhooks** in Stripe Dashboard
2. Click **+ Add endpoint**
3. **Endpoint URL:**
   - For local testing: Use Stripe CLI (see below)
   - For production: `https://yourdomain.com/api/stripe/webhook`
4. **Events to listen to:**
   - `checkout.session.completed`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click **Add endpoint**
6. Copy the **Signing secret** and add to `.env.local`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

---

## Step 4: Test Webhook Locally (Development)

```bash
# Forward webhooks to your local server
stripe listen --forward-to localhost:3000/api/stripe/webhook

# You'll get a webhook signing secret like: whsec_...
# Add it to .env.local as STRIPE_WEBHOOK_SECRET

# In another terminal, test the webhook
stripe trigger checkout.session.completed
```

---

## Step 5: Run Database Migration

1. Go to your Supabase Dashboard → SQL Editor
2. Open `supabase-stripe-migration.sql`
3. Run the entire script
4. Verify tables and functions were created:
   ```sql
   -- Check for new columns
   SELECT column_name FROM information_schema.columns
   WHERE table_name = 'users' AND column_name LIKE 'stripe%';

   -- Test functions
   SELECT can_generate_image('your-user-id');
   ```

---

## Step 6: Test the Integration

### Test Subscription Flow

1. Start your dev server: `npm run dev`
2. Sign up for a new account
3. Go to `/pricing`
4. Click "Get Started" on any paid plan
5. Use Stripe test card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits
6. Complete checkout
7. Check your database:
   ```sql
   SELECT id, email, plan_id, subscription_status, stripe_customer_id
   FROM users
   WHERE email = 'test@example.com';
   ```

### Test Usage Limits

1. Go to `/app/create`
2. Try to generate images
3. Check that usage increments:
   ```sql
   SELECT images_used, videos_used, addon_images_quota, addon_videos_quota
   FROM users
   WHERE email = 'test@example.com';
   ```
4. Generate images until you hit the limit
5. Verify you get the "Image limit reached" error

### Test Add-On Purchase

1. Hit your image limit
2. Go to `/app/billing`
3. Click "Purchase Now" for 20 Extra Images
4. Complete checkout with test card
5. Verify `addon_images_quota` increased by 20
6. Generate more images (should use add-on quota first)

---

## Step 7: Configure Billing Portal

1. Go to **Settings → Billing → Customer portal** in Stripe Dashboard
2. Enable the customer portal
3. Configure settings:
   - ✅ Allow customers to update payment methods
   - ✅ Allow customers to view invoices
   - ✅ Allow customers to cancel subscriptions (optional)
4. Save settings

---

## Step 8: Production Deployment

### 1. Update Environment Variables

In your production environment (Vercel, etc.):
```bash
STRIPE_SECRET_KEY=sk_live_...  # Use LIVE keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...  # From production webhook
NEXT_PUBLIC_URL=https://yourdomain.com
```

### 2. Create Production Webhook

1. In Stripe Dashboard (switch to Live mode)
2. Go to **Developers → Webhooks**
3. Add endpoint: `https://yourdomain.com/api/stripe/webhook`
4. Select same events as test mode
5. Copy signing secret to production env vars

### 3. Test Production Flow

1. Create a test subscription in live mode
2. Monitor Stripe Dashboard logs
3. Check webhook events are being received
4. Verify database updates in production

---

## Troubleshooting

### Webhook not receiving events
```bash
# Check webhook logs in Stripe Dashboard
# Verify STRIPE_WEBHOOK_SECRET is correct
# Ensure endpoint URL is accessible from internet
# Check for CORS issues

# Test webhook manually:
curl -X POST http://localhost:3000/api/stripe/webhook \
  -H "Content-Type: application/json" \
  -H "Stripe-Signature: test" \
  -d '{}'
```

### Checkout session not creating
```javascript
// Check console for errors
// Verify price IDs are correct
// Ensure user has stripe_customer_id in database
// Check Stripe Dashboard logs
```

### Usage limits not working
```sql
-- Verify functions exist
SELECT proname FROM pg_proc WHERE proname LIKE '%generate%';

-- Test functions directly
SELECT can_generate_image('user-id');
SELECT can_generate_video('user-id');

-- Check user data
SELECT * FROM users WHERE id = 'user-id';
```

### Subscription not activating
```bash
# Check webhook logs in Stripe Dashboard
# Verify webhook signature is valid
# Check server logs for errors in webhook handler
# Ensure database has correct userId in metadata
```

---

## Stripe Test Cards

| Card Number | Description |
|-------------|-------------|
| `4242 4242 4242 4242` | Succeeds |
| `4000 0000 0000 0002` | Declined |
| `4000 0000 0000 9995` | Insufficient funds |
| `4000 0000 0000 0341` | Requires authentication (3D Secure) |

Use any future expiry date and any CVC.

---

## Monitoring & Analytics

### Key Metrics to Track

1. **Stripe Dashboard:**
   - MRR (Monthly Recurring Revenue)
   - Churn rate
   - Failed payments
   - Subscription lifecycle

2. **Database Queries:**
   ```sql
   -- Active subscribers by plan
   SELECT plan_id, COUNT(*)
   FROM users
   WHERE subscription_status = 'active'
   GROUP BY plan_id;

   -- Total MRR
   SELECT
     SUM(CASE
       WHEN plan_id = 'starter' THEN 19
       WHEN plan_id = 'pro' THEN 49
       WHEN plan_id = 'enterprise' THEN 129
       ELSE 0
     END) as mrr
   FROM users
   WHERE subscription_status = 'active';

   -- Average usage per plan
   SELECT
     plan_id,
     AVG(images_used) as avg_images,
     AVG(videos_used) as avg_videos
   FROM users
   GROUP BY plan_id;
   ```

---

## Next Steps

1. ✅ Set up Stripe account
2. ✅ Create products and prices
3. ✅ Configure webhook
4. ✅ Run database migration
5. ✅ Test locally
6. ⬜ Deploy to production
7. ⬜ Monitor and optimize

---

## Support

- **Stripe Documentation:** https://stripe.com/docs
- **Stripe Support:** https://support.stripe.com
- **Stripe Discord:** https://discord.gg/stripe
- **Test your integration:** https://stripe.com/docs/testing

---

**🎉 Congratulations!** Your Stripe integration is now complete. Users can subscribe to plans, purchase add-ons, and manage their subscriptions seamlessly.
