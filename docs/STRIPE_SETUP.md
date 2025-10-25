# Stripe Setup Guide for Snap2Listing

This guide will walk you through setting up Stripe for subscription billing and one-time add-on purchases.

## Prerequisites

- A Stripe account (sign up at https://stripe.com)
- Access to your Stripe Dashboard

## Step 1: Get Your API Keys

1. Go to https://dashboard.stripe.com/apikeys
2. Copy your **Publishable key** (starts with `pk_test_`)
3. Click "Reveal test key" for your **Secret key** (starts with `sk_test_`)
4. Add these to your `.env.local` file:
   ```env
   STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
   ```

## Step 2: Create Products and Prices

### Monthly Subscription Plans

#### Starter Plan ($19/month)
1. Go to https://dashboard.stripe.com/products
2. Click "Add product"
3. Fill in:
   - **Name**: Starter Plan
   - **Description**: Perfect for getting started
   - **Pricing**: $19 / month, recurring
   - **Price ID**: Copy this after creation → `STRIPE_PRICE_STARTER_MONTHLY`

#### Pro Plan ($49/month)
1. Click "Add product"
2. Fill in:
   - **Name**: Pro Plan
   - **Description**: For growing Etsy sellers
   - **Pricing**: $49 / month, recurring
   - **Price ID**: Copy this → `STRIPE_PRICE_PRO_MONTHLY`

#### Enterprise Plan ($129/month)
1. Click "Add product"
2. Fill in:
   - **Name**: Enterprise Plan
   - **Description**: For high-volume sellers
   - **Pricing**: $129 / month, recurring
   - **Price ID**: Copy this → `STRIPE_PRICE_ENTERPRISE_MONTHLY`

### Yearly Subscription Plans (20% Discount)

For each plan above, add a **yearly pricing option**:

#### Starter Plan ($182/year - was $228)
1. Go to the Starter Plan product
2. Click "Add another price"
3. Fill in:
   - **Pricing**: $182 / year, recurring
   - **Price ID**: Copy this → `STRIPE_PRICE_STARTER_YEARLY`

#### Pro Plan ($470/year - was $588)
1. Go to the Pro Plan product
2. Click "Add another price"
3. Fill in:
   - **Pricing**: $470 / year, recurring
   - **Price ID**: Copy this → `STRIPE_PRICE_PRO_YEARLY`

#### Enterprise Plan ($1238/year - was $1548)
1. Go to the Enterprise Plan product
2. Click "Add another price"
3. Fill in:
   - **Pricing**: $1238 / year, recurring
   - **Price ID**: Copy this → `STRIPE_PRICE_ENTERPRISE_YEARLY`

### Add-on Products (One-time Purchases)

#### 20 Extra Images ($10)
1. Click "Add product"
2. Fill in:
   - **Name**: 20 Extra AI Images
   - **Description**: Top up your image quota
   - **Pricing**: $10, one time
   - **Price ID**: Copy this → `STRIPE_PRICE_ADDON_IMAGES`

#### 2 Extra Videos ($10)
1. Click "Add product"
2. Fill in:
   - **Name**: 2 Extra AI Videos
   - **Description**: Top up your video quota
   - **Pricing**: $10, one time
   - **Price ID**: Copy this → `STRIPE_PRICE_ADDON_VIDEOS`

## Step 3: Configure Your `.env.local`

Add all the Price IDs you copied:

```env
# Stripe Price IDs for each plan (Monthly)
STRIPE_PRICE_STARTER_MONTHLY=price_1xxxxxxxxxx
STRIPE_PRICE_PRO_MONTHLY=price_1xxxxxxxxxx
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_1xxxxxxxxxx

# Stripe Price IDs for each plan (Yearly)
STRIPE_PRICE_STARTER_YEARLY=price_1xxxxxxxxxx
STRIPE_PRICE_PRO_YEARLY=price_1xxxxxxxxxx
STRIPE_PRICE_ENTERPRISE_YEARLY=price_1xxxxxxxxxx

# Stripe Add-on Price IDs
STRIPE_PRICE_ADDON_IMAGES=price_1xxxxxxxxxx
STRIPE_PRICE_ADDON_VIDEOS=price_1xxxxxxxxxx
```

## Step 4: Set Up Webhooks

Webhooks notify your app when subscription events happen (e.g., payment succeeded, subscription canceled).

### Option A: Local Development with Stripe CLI (Recommended)

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login to Stripe CLI:
   ```bash
   stripe login
   ```
3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
4. Copy the webhook signing secret (starts with `whsec_`) from the output
5. Add to `.env.local`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE
   ```
6. Keep this terminal running while testing

### Option B: Production Webhooks (After Deployment)

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter your webhook URL: `https://yourdomain.com/api/stripe/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click "Add endpoint"
6. Copy the **Signing secret** (starts with `whsec_`)
7. Add to your production environment variables:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE
   ```

## Step 5: Enable Customer Portal (Optional but Recommended)

The Customer Portal allows users to manage their subscription, update payment methods, and view invoices.

1. Go to https://dashboard.stripe.com/settings/billing/portal
2. Click "Activate"
3. Configure settings:
   - ✅ Allow customers to update their payment methods
   - ✅ Allow customers to update their subscriptions
   - ✅ Allow customers to cancel their subscriptions
   - ✅ Show billing history

## Step 6: Test Your Integration

### Test Card Numbers

Stripe provides test card numbers for testing:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires 3D Secure**: `4000 0027 6000 3184`

Use any future expiration date and any 3-digit CVC.

### Test the Flow

1. Start your local server: `npm run dev`
2. Go to http://localhost:3000/pricing
3. Click on a plan (e.g., Starter Plan)
4. Fill in test card details
5. Complete checkout
6. Verify subscription in Stripe Dashboard
7. Check that your database was updated with:
   - `stripe_customer_id`
   - `stripe_subscription_id`
   - `plan_id`
   - `subscription_status`

### Monitor Webhook Events

In the Stripe CLI terminal, you should see:
```
✓ checkout.session.completed
✓ customer.subscription.created
✓ invoice.paid
```

## Step 7: Configure Supabase Database

Ensure your `users` table has these columns:

```sql
-- Stripe-related columns
stripe_customer_id TEXT,
stripe_subscription_id TEXT,
plan_id TEXT DEFAULT 'free',
subscription_status TEXT DEFAULT 'inactive',
current_period_end TIMESTAMP,

-- Usage tracking
images_used INTEGER DEFAULT 0,
videos_used INTEGER DEFAULT 0,
addon_images_quota INTEGER DEFAULT 0,
addon_videos_quota INTEGER DEFAULT 0
```

Also ensure you have these RPC functions for add-ons:

```sql
CREATE OR REPLACE FUNCTION add_image_quota(p_user_id UUID, p_amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET addon_images_quota = addon_images_quota + p_amount
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION add_video_quota(p_user_id UUID, p_amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET addon_videos_quota = addon_videos_quota + p_amount
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;
```

## Step 8: Going to Production

When you're ready to launch:

1. Switch to **Live mode** in Stripe Dashboard (toggle in top-left)
2. Get your **live API keys** (starts with `sk_live_` and `pk_live_`)
3. Update production environment variables with live keys
4. Create products and prices again in live mode (test mode data doesn't transfer)
5. Set up production webhook endpoint
6. **Important**: Enable production mode in Stripe Dashboard settings

## Troubleshooting

### Webhook not receiving events
- Ensure Stripe CLI is running (`stripe listen`)
- Check webhook signing secret is correct
- Verify webhook URL is accessible
- Check server logs for errors

### Customer not created
- Verify user exists in database
- Check user has valid email
- Ensure Stripe API key is correct

### Subscription not activating
- Check webhook received `checkout.session.completed` event
- Verify database columns exist
- Check server logs for SQL errors
- Ensure Supabase service role key has write permissions

### Payment failing
- Use test card numbers from Stripe docs
- Check webhook logs for error messages
- Verify Price IDs are correct

## Next Steps

- Set up email notifications for failed payments
- Add promotional codes/discounts
- Configure tax collection (if required)
- Set up revenue analytics
- Implement dunning management for failed payments

## Resources

- Stripe Testing: https://stripe.com/docs/testing
- Webhooks Guide: https://stripe.com/docs/webhooks
- Customer Portal: https://stripe.com/docs/billing/subscriptions/customer-portal
- Stripe API Reference: https://stripe.com/docs/api
