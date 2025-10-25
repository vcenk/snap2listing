import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/client';
import { supabaseAdmin } from '@/lib/supabase/server';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;

  if (!userId) {
    console.error('No userId in session metadata');
    return;
  }

  // Handle subscription checkout
  if (session.mode === 'subscription') {
    const subscriptionId = session.subscription as string;
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const planId = session.metadata?.planId || 'free';

    await supabaseAdmin
      .from('users')
      .update({
        stripe_subscription_id: subscriptionId,
        stripe_customer_id: session.customer as string,
        plan_id: planId,
        subscription_status: 'active',
        current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
      })
      .eq('id', userId);

    console.log(`Subscription activated for user ${userId}, plan: ${planId}`);
  }

  // Handle add-on purchase
  if (session.mode === 'payment') {
    const addonType = session.metadata?.addonType;

    if (addonType === 'images') {
      // Add 20 images to user's quota
      await supabaseAdmin.rpc('add_image_quota', {
        p_user_id: userId,
        p_amount: 20,
      });
      console.log(`Added 20 images to user ${userId}`);
    } else if (addonType === 'videos') {
      // Add 2 videos to user's quota
      await supabaseAdmin.rpc('add_video_quota', {
        p_user_id: userId,
        p_amount: 2,
      });
      console.log(`Added 2 videos to user ${userId}`);
    }
  }
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const subscriptionId = (invoice as any).subscription as string;

  if (!subscriptionId) return;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error('No userId in subscription metadata');
    return;
  }

  // Renew subscription
  await supabaseAdmin
    .from('users')
    .update({
      subscription_status: 'active',
      current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
    })
    .eq('id', userId);

  console.log(`Subscription renewed for user ${userId}`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = (invoice as any).subscription as string;

  if (!subscriptionId) return;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error('No userId in subscription metadata');
    return;
  }

  // Mark subscription as past_due
  await supabaseAdmin
    .from('users')
    .update({
      subscription_status: 'past_due',
    })
    .eq('id', userId);

  console.log(`Payment failed for user ${userId}`);
  // TODO: Send email notification
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error('No userId in subscription metadata');
    return;
  }

  // Get the new plan from the subscription items
  const planId = subscription.metadata?.planId || 'free';

  await supabaseAdmin
    .from('users')
    .update({
      plan_id: planId,
      subscription_status: subscription.status,
      current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
    })
    .eq('id', userId);

  console.log(`Subscription updated for user ${userId}, new plan: ${planId}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error('No userId in subscription metadata');
    return;
  }

  // Downgrade to free plan
  await supabaseAdmin
    .from('users')
    .update({
      plan_id: 'free',
      subscription_status: 'canceled',
      stripe_subscription_id: null,
    })
    .eq('id', userId);

  console.log(`Subscription canceled for user ${userId}, downgraded to free`);
}
