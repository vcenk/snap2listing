import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/client';
import { supabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * Manual sync endpoint to update user subscription from Stripe
 * Use this if webhook didn't fire or to fix subscription data
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

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

    if (!user.stripe_customer_id) {
      return NextResponse.json(
        { error: 'User has no Stripe customer ID' },
        { status: 400 }
      );
    }

    // Fetch subscriptions from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripe_customer_id,
      status: 'all',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return NextResponse.json(
        { error: 'No subscriptions found for this customer' },
        { status: 404 }
      );
    }

    const subscription = subscriptions.data[0];

    // Determine plan ID from subscription metadata or price
    let planId = subscription.metadata?.planId || 'free';

    // If no metadata, try to determine from price ID
    if (!subscription.metadata?.planId && subscription.items.data[0]) {
      const priceId = subscription.items.data[0].price.id;

      // Map price IDs to plan IDs
      if (priceId === process.env.STRIPE_PRICE_STARTER_MONTHLY ||
          priceId === process.env.STRIPE_PRICE_STARTER_YEARLY) {
        planId = 'starter';
      } else if (priceId === process.env.STRIPE_PRICE_PRO_MONTHLY ||
                 priceId === process.env.STRIPE_PRICE_PRO_YEARLY) {
        planId = 'pro';
      } else if (priceId === process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY ||
                 priceId === process.env.STRIPE_PRICE_ENTERPRISE_YEARLY) {
        planId = 'enterprise';
      }
    }

    // Update user in database
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        stripe_subscription_id: subscription.id,
        plan_id: planId,
        subscription_status: subscription.status,
        current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
      })
      .eq('id', userId);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription synced successfully',
      subscription: {
        id: subscription.id,
        status: subscription.status,
        planId: planId,
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000).toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Sync subscription error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync subscription' },
      { status: 500 }
    );
  }
}
