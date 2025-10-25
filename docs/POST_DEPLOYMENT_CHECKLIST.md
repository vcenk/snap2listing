# Post-Deployment Checklist

## ✅ After Vercel Deployment Succeeds

### 1. Get Your Vercel URL
Your app will be deployed at:
- **Temporary URL**: `https://snap2listing-vcenk.vercel.app` (or similar)
- **Custom Domain** (after DNS): `https://www.snap2listing.com`

### 2. Update Etsy OAuth Redirect URI

1. Go to https://www.etsy.com/developers/your-apps
2. Click "snap2listing"
3. Update **OAuth Callback URLs** to include:
   - `https://www.snap2listing.com/api/etsy/callback`
   - Also keep: `http://localhost:3000/api/etsy/callback` (for local dev)
4. Click "Save"

### 3. Update Stripe Webhook

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter URL: `https://www.snap2listing.com/api/stripe/webhook`
4. Select these events:
   - `checkout.session.completed`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click "Add endpoint"
6. **Copy the new Webhook Signing Secret**
7. Go to Vercel → Settings → Environment Variables
8. Update `STRIPE_WEBHOOK_SECRET` with the new value
9. Click "Redeploy" in Vercel

### 4. Configure Custom Domain (www.snap2listing.com)

#### In Vercel:
1. Go to Project Settings → Domains
2. Add domain: `www.snap2listing.com`
3. Add domain: `snap2listing.com` (will redirect to www)
4. Vercel will provide DNS instructions

#### In Your Domain Registrar (Namecheap/GoDaddy/etc):

**For www.snap2listing.com:**
```
Type: CNAME
Host: www
Value: cname.vercel-dns.com
TTL: 3600 (or automatic)
```

**For snap2listing.com (apex/root):**
```
Type: A
Host: @
Value: 76.76.21.21
TTL: 3600
```

**DNS propagation takes 10-60 minutes.** Check status at: https://dnschecker.org

### 5. Test Production Deployment

Visit https://www.snap2listing.com and test:

- [ ] Landing page loads
- [ ] Can sign up (check email for verification)
- [ ] Can log in
- [ ] Dashboard shows correctly
- [ ] Can upload image
- [ ] Can generate AI images
- [ ] Can generate video
- [ ] Can save listing
- [ ] Listings page shows saved drafts
- [ ] Pricing page loads
- [ ] Stripe checkout works (test mode)
- [ ] Can connect Etsy shop
- [ ] Can publish listing to Etsy

### 6. Environment Variables to Update

After deployment, update these in Vercel:

```
NEXT_PUBLIC_APP_URL=https://www.snap2listing.com
ETSY_REDIRECT_URI=https://www.snap2listing.com/api/etsy/callback
NODE_ENV=production
```

Then click "Redeploy" to apply changes.

### 7. Switch Stripe to Live Mode (When Ready for Real Payments)

**Do this ONLY when you're ready to accept real money:**

1. Go to Stripe Dashboard → Switch to Live Mode
2. Create all products again (Starter, Pro, Enterprise)
3. Create add-ons again (20 images, 2 videos)
4. Get all new Price IDs
5. Update all `STRIPE_PRICE_*` env vars in Vercel with LIVE Price IDs
6. Update `STRIPE_SECRET_KEY` with live key (starts with `sk_live_`)
7. Update `STRIPE_PUBLISHABLE_KEY` with live key (starts with `pk_live_`)
8. Create new LIVE webhook endpoint
9. Update `STRIPE_WEBHOOK_SECRET` with live webhook secret
10. Redeploy

### 8. Submit Etsy App for Review (For Public Access)

**Current**: Your app is in Development mode (only YOU can connect)

**To allow others to connect their Etsy shops:**

1. Go to https://www.etsy.com/developers/your-apps
2. Click "snap2listing"
3. Click "Submit for Review"
4. Fill in:
   - App description
   - Screenshots
   - Privacy policy URL: https://www.snap2listing.com/privacy
   - Terms of service URL: https://www.snap2listing.com/terms
5. Submit

**Review takes 1-2 weeks.** During this time, test with your own shop.

### 9. Set Up Monitoring

#### Vercel Analytics (Free)
- Automatically included
- View at: Vercel Dashboard → Analytics

#### Error Tracking (Optional - Sentry)
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

#### Uptime Monitoring (Optional - UptimeRobot)
1. Sign up at https://uptimerobot.com
2. Add monitor: https://www.snap2listing.com
3. Get alerts if site goes down

### 10. Database Backup (Recommended)

In Supabase:
1. Go to Database → Backups
2. Enable automatic backups
3. Set retention period (7-30 days)

### 11. Monthly Usage Reset

Set up a cron job to reset usage on the 1st of each month:

**Option A: Vercel Cron (Recommended)**
Create `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/reset-usage",
    "schedule": "0 0 1 * *"
  }]
}
```

Then create `/api/cron/reset-usage/route.ts` that calls `reset_monthly_usage()` SQL function.

**Option B: Supabase pg_cron**
Run in Supabase SQL Editor:
```sql
SELECT cron.schedule(
  'reset-monthly-usage',
  '0 0 1 * *', -- First day of month at midnight
  'SELECT reset_monthly_usage();'
);
```

## 🚨 Common Issues

### Build fails with "Module not found"
- Check all imports use correct paths
- Run `npm install` locally to verify dependencies

### Environment variables not working
- Check variable names match exactly (case-sensitive)
- Redeploy after changing env vars

### Stripe webhook not receiving events
- Verify webhook URL is correct
- Check webhook secret matches
- View webhook logs in Stripe Dashboard

### Etsy OAuth fails
- Verify callback URL matches exactly
- Check app status in Etsy Developer Portal
- Ensure scopes are enabled

### Images not loading
- Check R2/S3 CORS settings
- Verify R2_PUBLIC_URL is correct
- Check bucket is public

## 📊 Costs (Monthly Estimates)

| Service | Free Tier | Expected Cost |
|---------|-----------|---------------|
| Vercel | Hobby (free) | $0 |
| Supabase | 500MB DB | $0 |
| Cloudflare R2 | 10GB storage | ~$5 |
| FAL.ai | Pay-per-use | ~$50-100 |
| OpenAI | Pay-per-use | ~$10-20 |
| Stripe | 2.9% + $0.30 | Per transaction |
| **Total** | | **~$65-125/mo** |

## 🎉 Launch Complete!

Once all checklist items are complete, you're ready to:
1. ✅ Announce on social media
2. ✅ Share with Etsy seller communities
3. ✅ Post on Product Hunt
4. ✅ Start getting users!

**Congratulations! You've deployed a full-stack SaaS app! 🚀**
