'use client';

import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Stack,
  LinearProgress,
  Chip,
  Grid,
  Alert,
  Divider,
  Skeleton,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/context';
import { supabase } from '@/lib/supabase/client';
import { PLANS, getPlanById } from '@/config/pricing';
import Link from 'next/link';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CreditCardIcon from '@mui/icons-material/CreditCard';

interface UserData {
  id: string;
  email: string;
  name: string;
  plan_id: string;
  images_used: number;
  videos_used: number;
  addon_images_quota: number;
  addon_videos_quota: number;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: string;
  current_period_end: string | null;
}

export default function BillingPage() {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    // FIXED: Refresh session when returning from Stripe Checkout
    // This ensures the session is still valid after third-party redirect
    const refreshSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Session refresh error:', error);
      } else if (data.session) {
        console.log('✅ Session refreshed successfully');
      }
    };

    refreshSession();

    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setUserData(data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId: string, billing: 'monthly' | 'yearly') => {
    if (!user) return;

    setUpgrading(true);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          planId,
          billing,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout');
      }
    } catch (error: any) {
      console.error('Upgrade error:', error);
      alert('Failed to start checkout: ' + error.message);
    } finally {
      setUpgrading(false);
    }
  };

  const handleBuyAddon = async (addonType: 'images' | 'videos') => {
    if (!user) return;

    setUpgrading(true);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          addonType,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout');
      }
    } catch (error: any) {
      console.error('Addon purchase error:', error);
      alert('Failed to start checkout: ' + error.message);
    } finally {
      setUpgrading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!userData?.stripe_customer_id) return;

    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: userData.stripe_customer_id,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error opening portal:', error);
      alert('Failed to open billing portal');
    }
  };

  const handleSyncSubscription = async () => {
    if (!user) return;

    setSyncing(true);

    try {
      const response = await fetch('/api/stripe/sync-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('✅ Subscription synced successfully! Refreshing...');
        await fetchUserData();
      } else {
        throw new Error(data.error || 'Failed to sync subscription');
      }
    } catch (error: any) {
      console.error('Sync error:', error);
      alert('Failed to sync subscription: ' + error.message);
    } finally {
      setSyncing(false);
    }
  };

  if (loading || !userData) {
    return (
      <Box>
        <Skeleton variant="text" width={250} height={50} sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Stack spacing={3}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Skeleton variant="circular" width={60} height={60} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Skeleton variant="text" width="40%" height={35} />
                      <Skeleton variant="text" width="60%" />
                    </Box>
                  </Stack>
                  <Divider />
                  <Box>
                    <Skeleton variant="text" width={150} height={30} />
                    <Skeleton variant="rectangular" height={8} sx={{ mt: 2, mb: 3, borderRadius: 4 }} />
                    <Skeleton variant="rectangular" height={8} sx={{ borderRadius: 4 }} />
                  </Box>
                  <Divider />
                  <Stack direction="row" spacing={2}>
                    <Skeleton variant="rectangular" width={180} height={40} sx={{ borderRadius: 1 }} />
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Skeleton variant="text" width="60%" height={30} />
                <Skeleton variant="text" width="80%" sx={{ mb: 3 }} />
                <Stack spacing={2}>
                  {Array.from({ length: 2 }).map((_, idx) => (
                    <Card key={idx} variant="outlined">
                      <CardContent>
                        <Skeleton variant="text" width="50%" height={25} />
                        <Skeleton variant="text" width="30%" height={35} />
                        <Skeleton variant="text" width="70%" />
                        <Skeleton variant="rectangular" height={32} sx={{ mt: 1, borderRadius: 1 }} />
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  }

  const currentPlan = getPlanById(userData.plan_id) || PLANS[0];
  const imagesLimit = currentPlan.images;
  const videosLimit = currentPlan.videos;
  const imagesUsed = userData.images_used;
  const videosUsed = userData.videos_used;
  const imagesRemaining = Math.max(0, imagesLimit - imagesUsed) + userData.addon_images_quota;
  const videosRemaining = Math.max(0, videosLimit - videosUsed) + userData.addon_videos_quota;
  const imagesPercent = Math.min(100, (imagesUsed / imagesLimit) * 100);
  const videosPercent = Math.min(100, (videosUsed / videosLimit) * 100);

  return (
    <Box>
      <Typography variant="h2" gutterBottom>
        Billing & Usage
      </Typography>

      {/* Success Message */}
      {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('success') && (
        <Alert severity="success" sx={{ mb: 3 }}>
          ✅ Subscription activated successfully! Welcome to {currentPlan.name}
        </Alert>
      )}

      {/* Current Plan */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Stack spacing={3}>
                <Box>
                  <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                    <Typography variant="h2" sx={{ fontSize: '2rem' }}>
                      {currentPlan.icon}
                    </Typography>
                    <Box>
                      <Typography variant="h4">Current Plan: {currentPlan.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {currentPlan.tagline}
                      </Typography>
                    </Box>
                  </Stack>

                  {userData.subscription_status === 'active' && userData.current_period_end && (
                    <Chip
                      label={`Renews on ${new Date(userData.current_period_end).toLocaleDateString()}`}
                      size="small"
                      color="success"
                      icon={<CheckCircleIcon />}
                    />
                  )}
                </Box>

                <Divider />

                {/* Usage Stats */}
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Usage This Month
                  </Typography>

                  {/* Images */}
                  <Box mb={3}>
                    <Stack direction="row" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">
                        AI Images
                        {userData.addon_images_quota > 0 && (
                          <Chip
                            label={`+${userData.addon_images_quota} add-on`}
                            size="small"
                            color="primary"
                            sx={{ ml: 1, height: 20 }}
                          />
                        )}
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {imagesUsed} / {imagesLimit} used • {imagesRemaining} remaining
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={imagesPercent}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: 'action.hover',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: imagesPercent > 90 ? 'error.main' : 'primary.main',
                        },
                      }}
                    />
                  </Box>

                  {/* Videos */}
                  <Box>
                    <Stack direction="row" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">
                        AI Videos
                        {userData.addon_videos_quota > 0 && (
                          <Chip
                            label={`+${userData.addon_videos_quota} add-on`}
                            size="small"
                            color="primary"
                            sx={{ ml: 1, height: 20 }}
                          />
                        )}
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {videosUsed} / {videosLimit} used • {videosRemaining} remaining
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={videosPercent}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: 'action.hover',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: videosPercent > 90 ? 'error.main' : 'primary.main',
                        },
                      }}
                    />
                  </Box>
                </Box>

                <Divider />

                {/* Actions */}
                <Stack direction="row" spacing={2} flexWrap="wrap">
                  {userData.stripe_customer_id && (
                    <>
                      <Button
                        variant="outlined"
                        startIcon={<CreditCardIcon />}
                        onClick={handleManageSubscription}
                      >
                        Manage Subscription
                      </Button>
                      <Button
                        variant="outlined"
                        color="secondary"
                        disabled={syncing}
                        onClick={handleSyncSubscription}
                      >
                        {syncing ? 'Syncing...' : 'Sync from Stripe'}
                      </Button>
                    </>
                  )}

                  {userData.plan_id === 'free' && (
                    <Button
                      component={Link}
                      href="/pricing"
                      variant="contained"
                      startIcon={<TrendingUpIcon />}
                    >
                      Upgrade Plan
                    </Button>
                  )}
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          {/* Add-Ons */}
          {imagesRemaining < 10 || videosRemaining < 2 && (
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Need More? Top Up Anytime
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Purchase add-ons without upgrading your plan
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          20 Extra Images
                        </Typography>
                        <Typography variant="h4" color="primary" gutterBottom>
                          $10
                        </Typography>
                        <Button
                          variant="contained"
                          fullWidth
                          disabled={upgrading}
                          onClick={() => handleBuyAddon('images')}
                        >
                          Purchase Now
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          2 Extra Videos
                        </Typography>
                        <Typography variant="h4" color="primary" gutterBottom>
                          $10
                        </Typography>
                        <Button
                          variant="contained"
                          fullWidth
                          disabled={upgrading}
                          onClick={() => handleBuyAddon('videos')}
                        >
                          Purchase Now
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Upgrade Options */}
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'background.default' }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Upgrade Your Plan
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Get more images, videos, and features
              </Typography>

              <Stack spacing={2}>
                {PLANS.filter((plan) => {
                  // Only show plans that are upgrades (higher price than current plan)
                  const currentPlanPrice = getPlanById(userData.plan_id)?.price || 0;
                  return plan.id !== 'free' && plan.price > currentPlanPrice;
                }).map((plan) => (
                    <Card key={plan.id} variant="outlined">
                      <CardContent>
                        <Stack spacing={1}>
                          <Typography variant="h6">{plan.name}</Typography>
                          <Typography variant="h5" color={plan.color}>
                            ${plan.price}/mo
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            • {plan.images} images/mo
                            <br />• {plan.videos} videos/mo
                          </Typography>
                          <Button
                            variant={plan.popular ? 'contained' : 'outlined'}
                            size="small"
                            disabled={upgrading}
                            onClick={() => handleUpgrade(plan.id, 'monthly')}
                            sx={{
                              ...(plan.popular && {
                                bgcolor: plan.color,
                                '&:hover': { bgcolor: plan.color, opacity: 0.9 },
                              }),
                            }}
                          >
                            Upgrade
                          </Button>
                        </Stack>
                      </CardContent>
                    </Card>
                  )
                )}

                <Button component={Link} href="/pricing" variant="text" size="small">
                  View All Plans →
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
