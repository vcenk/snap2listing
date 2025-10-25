import Stripe from 'stripe';

// Initialize Stripe on server-side only
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // Use SDK default API version to match installed typings
  typescript: true,
});

// Stripe Price IDs (you'll need to create these in Stripe Dashboard)
// After creating products in Stripe, replace these with actual price IDs
export const STRIPE_PRICE_IDS = {
  // Monthly plans
  starter_monthly: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID || 'price_starter_monthly',
  pro_monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || 'price_pro_monthly',
  business_monthly: process.env.STRIPE_BUSINESS_MONTHLY_PRICE_ID || 'price_business_monthly',

  // Yearly plans (20% discount)
  starter_yearly: process.env.STRIPE_STARTER_YEARLY_PRICE_ID || 'price_starter_yearly',
  pro_yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID || 'price_pro_yearly',
  business_yearly: process.env.STRIPE_BUSINESS_YEARLY_PRICE_ID || 'price_business_yearly',

  // Add-ons
  addon_images_20: process.env.STRIPE_ADDON_IMAGES_PRICE_ID || 'price_addon_images',
  addon_videos_2: process.env.STRIPE_ADDON_VIDEOS_PRICE_ID || 'price_addon_videos',
};

// Map plan IDs to Stripe price IDs
export function getPriceId(planId: string, billingPeriod: 'monthly' | 'yearly' = 'monthly'): string {
  const key = `${planId}_${billingPeriod}` as keyof typeof STRIPE_PRICE_IDS;
  return STRIPE_PRICE_IDS[key] || '';
}

// Product metadata
export const STRIPE_PRODUCTS = {
  starter: {
    name: 'Starter Plan',
    description: 'Perfect for getting started with AI-powered listings',
    features: ['50 images/month', '5 videos/month', '1 Etsy shop'],
  },
  pro: {
    name: 'Pro Plan',
    description: 'For growing Etsy sellers',
    features: ['150 images/month', '15 videos/month', '3 Etsy shops', 'Priority support'],
  },
  business: {
    name: 'Business Plan',
    description: 'For high-volume sellers',
    features: ['500 images/month', '50 videos/month', '10 Etsy shops', 'Priority support', 'Custom branding'],
  },
};
