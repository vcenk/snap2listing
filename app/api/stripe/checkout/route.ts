import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import {
  getStripePriceId,
  createCheckoutSession,
  createAddonCheckoutSession,
  STRIPE_ADDON_PRICE_IDS,
} from '@/lib/stripe/client';

// Mark this route as dynamic
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { userId, planId, billing, addonType } = await request.json();

    console.log('📋 Checkout Request:', { userId, planId, billing, addonType });
    console.log('🌍 Environment URLs:', {
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      VERCEL_URL: process.env.VERCEL_URL,
    });

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get user from database
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Handle add-on purchase
    if (addonType) {
      if (!user.stripe_customer_id) {
        return NextResponse.json(
          { error: 'No Stripe customer found. Please subscribe to a plan first.' },
          { status: 400 }
        );
      }

      const priceId =
        addonType === 'images'
          ? STRIPE_ADDON_PRICE_IDS.images_20
          : STRIPE_ADDON_PRICE_IDS.videos_2;

      const checkoutUrl = await createAddonCheckoutSession(
        user.stripe_customer_id,
        priceId,
        {
          userId,
          addonType,
        }
      );

      return NextResponse.json({ url: checkoutUrl });
    }

    // Handle subscription
    if (!planId || !billing) {
      return NextResponse.json(
        { error: 'Plan ID and billing type are required' },
        { status: 400 }
      );
    }

    if (planId === 'free') {
      return NextResponse.json(
        { error: 'Free plan does not require checkout' },
        { status: 400 }
      );
    }

    // Get Stripe price ID
    const priceId = getStripePriceId(planId, billing as 'monthly' | 'yearly');

    // Create or get Stripe customer
    let customerId = user.stripe_customer_id;

    if (!customerId) {
      // Import stripe client to create customer
      const { stripe } = await import('@/lib/stripe/client');
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: {
          userId: user.id,
        },
      });

      customerId = customer.id;

      // Save customer ID to database
      await supabaseAdmin
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId);
    }

    // Create checkout session
    console.log('🔐 Creating checkout session with customer:', customerId, 'and price:', priceId);
    const checkoutUrl = await createCheckoutSession(customerId, priceId, {
      userId,
      planId,
      billing,
    });

    console.log('✅ Checkout URL created:', checkoutUrl);
    return NextResponse.json({ url: checkoutUrl });
  } catch (error: any) {
    console.error('❌ Stripe checkout error:', error);
    console.error('Error details:', {
      message: error.message,
      type: error.type,
      code: error.code,
      param: error.param,
    });
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
