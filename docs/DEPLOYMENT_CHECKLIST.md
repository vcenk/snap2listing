# 🚀 Snap2Listing Deployment Checklist

Use this checklist to ensure a smooth launch to production.

## Pre-Launch Checklist

### ✅ Phase 1: Core Setup (Complete!)
- [x] Database schema finalized
- [x] Authentication working
- [x] Etsy API integration complete
- [x] AI image/video generation working
- [x] Stripe payment integration
- [x] Upgrade modals implemented
- [x] Loading skeletons added
- [x] Privacy Policy & Terms of Service created
- [x] Landing page optimized

### 📋 Phase 2: Pre-Production Testing

#### Functionality Testing
- [ ] Test user registration flow
- [ ] Test login/logout
- [ ] Test password reset (if implemented)
- [ ] Test creating a listing end-to-end
- [ ] Test image generation (all 9 slots)
- [ ] Test video generation
- [ ] Test publishing to Etsy
- [ ] Test Etsy shop connection
- [ ] Test Etsy shop disconnection

#### Payment Testing
- [ ] Test Stripe checkout for Starter plan (monthly)
- [ ] Test Stripe checkout for Pro plan (monthly)
- [ ] Test Stripe checkout for Enterprise plan (monthly)
- [ ] Test yearly plan checkout
- [ ] Test add-on purchases (images & videos)
- [ ] Test billing portal access
- [ ] Test subscription cancellation
- [ ] Test failed payment handling
- [ ] Verify webhooks are receiving events
- [ ] Verify database updates after payments

#### Usage Limits Testing
- [ ] Test free plan limits (15 images, 1 video)
- [ ] Test upgrade modal appears at limit
- [ ] Test add-on quota addition
- [ ] Test monthly limit reset

#### UI/UX Testing
- [ ] Test on Chrome, Firefox, Safari
- [ ] Test on mobile (iOS Safari, Chrome)
- [ ] Test on tablet
- [ ] Test all loading states
- [ ] Test error states
- [ ] Test empty states
- [ ] Check all links work
- [ ] Verify navigation flows

### 🔧 Phase 3: Configuration

#### Environment Variables (Production)
- [ ] Set `NEXT_PUBLIC_URL` to production domain
- [ ] Set Supabase production keys
- [ ] Set **LIVE** Stripe keys (sk_live_, pk_live_)
- [ ] Set Stripe webhook secret (production)
- [ ] Set Stripe Price IDs (created in live mode)
- [ ] Set Etsy production app credentials
- [ ] Set Etsy redirect URI to production URL
- [ ] Set FAL.ai or Replicate API key
- [ ] Set OpenAI or Claude API key
- [ ] Set R2/S3 production credentials
- [ ] Set email service credentials (if using)

#### Stripe Live Mode Setup
- [ ] Switch Stripe dashboard to Live mode
- [ ] Create products in live mode (mirror test mode)
- [ ] Create all price IDs (monthly, yearly, add-ons)
- [ ] Configure Customer Portal in live mode
- [ ] Set up live webhook endpoint
- [ ] Enable 3D Secure
- [ ] Configure statement descriptor
- [ ] Set support email/phone

#### Database
- [ ] Run all migrations on production
- [ ] Verify indexes exist
- [ ] Set up automated backups
- [ ] Configure connection pooling
- [ ] Test RPC functions work

### 🔐 Phase 4: Security

#### Security Hardening
- [ ] Enable HTTPS only
- [ ] Configure CSP headers
- [ ] Enable rate limiting on API routes
- [ ] Set up CORS properly
- [ ] Validate all user inputs
- [ ] Sanitize database queries
- [ ] Enable Supabase RLS policies
- [ ] Secure all API keys (never commit to git)
- [ ] Set secure cookie flags
- [ ] Enable Stripe webhook signature verification

#### Compliance
- [ ] Privacy Policy is live at /privacy
- [ ] Terms of Service is live at /terms
- [ ] Cookie consent banner (if in EU)
- [ ] GDPR compliance (if applicable)
- [ ] Data retention policy
- [ ] User data export capability
- [ ] User data deletion capability

### 📊 Phase 5: Monitoring & Analytics

#### Error Tracking
- [ ] Set up Sentry or error logging
- [ ] Test error reporting works
- [ ] Set up error alerting (email/Slack)

#### Analytics
- [ ] Set up PostHog or Google Analytics
- [ ] Track key events:
  - [ ] Sign ups
  - [ ] Listings created
  - [ ] Images generated
  - [ ] Videos created
  - [ ] Checkouts started
  - [ ] Subscriptions activated
  - [ ] Etsy shops connected
  - [ ] Listings published to Etsy
- [ ] Set up conversion funnels
- [ ] Set up revenue tracking

#### Performance Monitoring
- [ ] Set up uptime monitoring
- [ ] Configure performance alerts
- [ ] Monitor API response times
- [ ] Track database query performance

### 🌐 Phase 6: Deployment

#### Hosting Setup (Vercel Recommended)
- [ ] Connect GitHub repository
- [ ] Configure build settings
- [ ] Set all environment variables
- [ ] Configure custom domain
- [ ] Enable automatic deployments
- [ ] Set up preview deployments

#### DNS Configuration
- [ ] Point domain to hosting provider
- [ ] Configure SSL certificate
- [ ] Set up www redirect (if applicable)
- [ ] Verify DNS propagation

#### Post-Deployment Verification
- [ ] Visit production URL - site loads
- [ ] Check homepage loads correctly
- [ ] Test signup flow
- [ ] Test creating a test listing
- [ ] Test Stripe checkout (with test mode first!)
- [ ] Verify emails are sending
- [ ] Check Etsy OAuth flow works
- [ ] Test analytics tracking
- [ ] Verify webhooks are hitting production

### 📧 Phase 7: Communication

#### Email Setup
- [ ] Welcome email template created
- [ ] Payment successful email
- [ ] Payment failed email
- [ ] Subscription ending email
- [ ] Limit reached notification
- [ ] Test all email templates

#### Marketing Prep
- [ ] Create social media accounts
- [ ] Prepare launch announcement
- [ ] Set up support email
- [ ] Create FAQ page
- [ ] Prepare demo video/screenshots
- [ ] Set up customer support system

### 🐛 Phase 8: Contingency Planning

#### Rollback Plan
- [ ] Document rollback procedure
- [ ] Keep previous deployment accessible
- [ ] Have database backup ready

#### Support Readiness
- [ ] Create troubleshooting guide
- [ ] Document common issues
- [ ] Set up support ticketing
- [ ] Prepare refund process
- [ ] Document emergency contacts

## Launch Day Checklist

### Morning of Launch
- [ ] Verify all systems operational
- [ ] Check Stripe is in live mode
- [ ] Verify webhook endpoints responding
- [ ] Check database backups are recent
- [ ] Test end-to-end user flow one more time
- [ ] Ensure support channels are monitored

### During Launch
- [ ] Monitor error rates
- [ ] Watch server metrics
- [ ] Check payment processing
- [ ] Monitor user signups
- [ ] Respond to support requests quickly

### Post-Launch (First 24 Hours)
- [ ] Review error logs
- [ ] Check conversion rates
- [ ] Monitor payment success rate
- [ ] Gather user feedback
- [ ] Address critical bugs immediately

## Week 1 Post-Launch

### Metrics to Track
- [ ] Daily signups
- [ ] Free → Paid conversion rate
- [ ] Payment success rate
- [ ] Listings created per user
- [ ] Etsy connections
- [ ] Server uptime %
- [ ] Average response time
- [ ] Error rate

### Optimization Tasks
- [ ] Review user feedback
- [ ] Fix reported bugs
- [ ] Optimize slow queries
- [ ] Improve error messages
- [ ] Update FAQ based on support questions

## Future Enhancements (Post-Launch)

- [ ] Email drip campaigns
- [ ] Referral program
- [ ] Usage analytics dashboard
- [ ] Bulk listing upload
- [ ] Template library
- [ ] Team collaboration features
- [ ] Mobile app (future)
- [ ] Additional marketplace integrations

## Emergency Contacts

```
Hosting: Vercel support
Database: Supabase support
Payments: Stripe support (support@stripe.com)
Domain: Your registrar support
Team Lead: [Your contact]
```

## Useful Commands

### Stripe CLI (for testing webhooks locally)
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### Database Backup
```bash
# Via Supabase dashboard or CLI
supabase db dump > backup.sql
```

### Deploy to Vercel
```bash
vercel --prod
```

### View Production Logs
```bash
vercel logs [deployment-url]
```

---

**Remember**: It's better to launch with a working MVP than to delay for perfection. You can iterate quickly based on real user feedback!

**Good luck with your launch! 🚀**
