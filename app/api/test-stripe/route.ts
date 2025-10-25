import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Check environment variables
    const hasStripeKey = !!process.env.STRIPE_SECRET_KEY;
    const hasPublishableKey = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    const hasAppUrl = !!process.env.NEXT_PUBLIC_APP_URL;
    const hasVercelUrl = !!process.env.VERCEL_URL;

    // Try to get base URL
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_URL;
    if (!baseUrl && process.env.VERCEL_URL) {
      baseUrl = `https://${process.env.VERCEL_URL}`;
    }
    if (!baseUrl) {
      baseUrl = 'https://snap2listing.vercel.app';
    }
    if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
      baseUrl = `https://${baseUrl}`;
    }

    // Try to initialize Stripe
    let stripeInitialized = false;
    let stripeError = null;
    try {
      const { stripe } = await import('@/lib/stripe/client');
      stripeInitialized = !!stripe;
    } catch (error: any) {
      stripeError = error.message;
    }

    return NextResponse.json({
      status: 'ok',
      environment: {
        hasStripeSecretKey: hasStripeKey,
        hasStripePublishableKey: hasPublishableKey,
        hasNextPublicAppUrl: hasAppUrl,
        hasVercelUrl: hasVercelUrl,
        constructedBaseUrl: baseUrl,
        actualAppUrl: process.env.NEXT_PUBLIC_APP_URL || 'not set',
        actualVercelUrl: process.env.VERCEL_URL || 'not set',
      },
      stripe: {
        initialized: stripeInitialized,
        error: stripeError,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
