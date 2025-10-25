'use client';

import { Box, Container, Typography, CircularProgress } from '@mui/material';
import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const plan = searchParams.get('plan');
  const billing = searchParams.get('billing');

  useEffect(() => {
    if (!user) {
      // Redirect to login with return URL
      router.push(`/login?redirect=/checkout?plan=${plan}&billing=${billing}`);
      return;
    }

    if (!plan || !billing) {
      router.push('/pricing');
      return;
    }

    // Create Stripe checkout session
    createCheckoutSession();
  }, [user, plan, billing]);

  const createCheckoutSession = async () => {
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          planId: plan,
          billing: billing,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error: any) {
      console.error('Checkout error:', error);
      alert(`Failed to start checkout: ${error.message}`);
      router.push('/pricing');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <CircularProgress size={60} sx={{ mb: 3 }} />
        <Typography variant="h4" gutterBottom>
          Redirecting to checkout...
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Please wait while we prepare your checkout session.
        </Typography>
      </Box>
    </Container>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <Container maxWidth="sm">
          <Box
            sx={{
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            <CircularProgress size={60} sx={{ mb: 3 }} />
            <Typography variant="h4" gutterBottom>
              Loading...
            </Typography>
          </Box>
        </Container>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
