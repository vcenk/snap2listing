// Stripe API client for server-side operations
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  // Use SDK default API version to match installed typings
  typescript: true,
});

// Price IDs from Stripe Dashboard
export const STRIPE_PRICE_IDS = {
  starter: {
    monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY!,
    yearly: process.env.STRIPE_PRICE_STARTER_YEARLY!,
  },
  pro: {
    monthly: process.env.STRIPE_PRICE_PRO_MONTHLY!,
    yearly: process.env.STRIPE_PRICE_PRO_YEARLY!,
  },
  enterprise: {
    monthly: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY!,
    yearly: process.env.STRIPE_PRICE_ENTERPRISE_YEARLY!,
  },
} as const;

// Add-on product IDs
export const STRIPE_ADDON_PRICE_IDS = {
  images_20: process.env.STRIPE_PRICE_ADDON_IMAGES!,
  videos_2: process.env.STRIPE_PRICE_ADDON_VIDEOS!,
} as const;

/**
 * Get Stripe price ID for a plan
 */
export function getStripePriceId(planId: string, billing: 'monthly' | 'yearly'): string {
  if (planId === 'free') {
    throw new Error('Free plan does not have a Stripe price ID');
  }

  const priceIds = STRIPE_PRICE_IDS[planId as keyof typeof STRIPE_PRICE_IDS];
  if (!priceIds) {
    throw new Error(`Invalid plan ID: ${planId}`);
  }

  return priceIds[billing];
}

/**
 * Create or retrieve a Stripe customer
 */
export async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
  name?: string
): Promise<string> {
  // First check if user already has a customer ID in database
  // This would be retrieved from the database in a real app

  // Create new customer
  const customer = await stripe.customers.create({
    email,
    name: name || undefined,
    metadata: {
      userId,
    },
  });

  return customer.id;
}

/**
 * Create a checkout session for subscription
 */
export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  metadata: Record<string, string>
): Promise<string> {
  // Get base URL with proper fallback
  let baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_URL;

  // If no environment variable is set, try to construct from Vercel environment
  if (!baseUrl && process.env.VERCEL_URL) {
    baseUrl = `https://${process.env.VERCEL_URL}`;
  }

  // Final fallback
  if (!baseUrl) {
    baseUrl = 'https://snap2listing.vercel.app';
  }

  // Ensure URL has protocol
  if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
    baseUrl = `https://${baseUrl}`;
  }

  console.log('🔗 Stripe Checkout Base URL:', baseUrl);

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${baseUrl}/app/billing?success=true`,
    cancel_url: `${baseUrl}/pricing?canceled=true`,
    metadata,
    subscription_data: {
      metadata,
    },
  });

  return session.url!;
}

/**
 * Create a checkout session for one-time add-on purchase
 */
export async function createAddonCheckoutSession(
  customerId: string,
  priceId: string,
  metadata: Record<string, string>
): Promise<string> {
  // Get base URL with proper fallback
  let baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_URL;

  // If no environment variable is set, try to construct from Vercel environment
  if (!baseUrl && process.env.VERCEL_URL) {
    baseUrl = `https://${process.env.VERCEL_URL}`;
  }

  // Final fallback
  if (!baseUrl) {
    baseUrl = 'https://snap2listing.vercel.app';
  }

  // Ensure URL has protocol
  if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
    baseUrl = `https://${baseUrl}`;
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${baseUrl}/app/billing?addon_success=true`,
    cancel_url: `${baseUrl}/app/billing?canceled=true`,
    metadata,
  });

  return session.url!;
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId: string): Promise<void> {
  await stripe.subscriptions.cancel(subscriptionId);
}

/**
 * Create billing portal session
 */
export async function createBillingPortalSession(customerId: string): Promise<string> {
  // Get base URL with proper fallback
  let baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_URL;

  // If no environment variable is set, try to construct from Vercel environment
  if (!baseUrl && process.env.VERCEL_URL) {
    baseUrl = `https://${process.env.VERCEL_URL}`;
  }

  // Final fallback
  if (!baseUrl) {
    baseUrl = 'https://snap2listing.vercel.app';
  }

  // Ensure URL has protocol
  if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
    baseUrl = `https://${baseUrl}`;
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${baseUrl}/app/billing`,
  });

  return session.url;
}

/**
 * Get subscription details
 */
export async function getSubscription(subscriptionId: string) {
  return await stripe.subscriptions.retrieve(subscriptionId);
}

/**
 * Update subscription (for upgrades/downgrades)
 */
export async function updateSubscription(
  subscriptionId: string,
  newPriceId: string
): Promise<Stripe.Subscription> {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  return await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: newPriceId,
      },
    ],
    proration_behavior: 'create_prorations',
  });
}
