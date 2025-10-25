'use client';

import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  LinearProgress,
  Paper,
  Skeleton,
  Chip,
  alpha,
} from '@mui/material';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/context';
import ImageIcon from '@mui/icons-material/Image';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import ListAltIcon from '@mui/icons-material/ListAlt';
import StorefrontIcon from '@mui/icons-material/Storefront';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

const COLORS = ['#2196F3', '#FF9800', '#4CAF50', '#F44336'];

function StatCard({ title, value, limit, icon, subtitle, color = 'primary' }: any) {
  const percentage = limit ? Math.min(100, (value / limit) * 100) : 0;
  const remaining = limit ? Math.max(0, limit - value) : 0;

  return (
    <Card
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom fontWeight={500}>
                {title}
              </Typography>
              <Typography variant="h3" sx={{ wordBreak: 'break-word', fontWeight: 700 }}>
                {value}
                {limit && (
                  <Typography component="span" variant="h5" color="text.secondary" fontWeight={400}>
                    {' '}/ {limit}
                  </Typography>
                )}
              </Typography>
              {subtitle && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {subtitle}
                </Typography>
              )}
              {limit && remaining > 0 && (
                <Chip
                  label={`${remaining} remaining`}
                  size="small"
                  color={percentage > 80 ? 'warning' : 'success'}
                  sx={{ mt: 1, fontWeight: 600 }}
                />
              )}
            </Box>
            <Box
              sx={{
                color: `${color}.main`,
                fontSize: 48,
                flexShrink: 0,
                ml: 2,
                opacity: 0.8,
              }}
            >
              {icon}
            </Box>
          </Stack>
          {limit && (
            <LinearProgress
              variant="determinate"
              value={percentage}
              sx={{
                height: 10,
                borderRadius: 5,
                bgcolor: alpha('#000', 0.05),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 5,
                  bgcolor: percentage > 80 ? 'warning.main' : percentage > 50 ? 'info.main' : 'success.main',
                },
              }}
            />
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function OverviewPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/users/stats?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
          <Skeleton variant="text" width={150} height={50} />
          <Skeleton variant="rectangular" width={220} height={48} sx={{ borderRadius: 2 }} />
        </Stack>

        <Grid container spacing={3} mb={4}>
          {Array.from({ length: 4 }).map((_, idx) => (
            <Grid item xs={12} sm={6} lg={3} key={idx}>
              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between">
                      <Box sx={{ flexGrow: 1 }}>
                        <Skeleton variant="text" width="60%" />
                        <Skeleton variant="text" width="80%" height={45} />
                      </Box>
                      <Skeleton variant="circular" width={48} height={48} />
                    </Stack>
                    <Skeleton variant="rectangular" height={10} sx={{ borderRadius: 5 }} />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 3 }}>
              <Skeleton variant="text" width={200} height={35} />
              <Skeleton variant="rectangular" height={320} sx={{ mt: 2, borderRadius: 2 }} />
            </Paper>
          </Grid>
          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Skeleton variant="text" width={150} height={35} />
              <Stack spacing={2} sx={{ mt: 3 }}>
                {Array.from({ length: 4 }).map((_, idx) => (
                  <Skeleton key={idx} variant="rectangular" height={48} sx={{ borderRadius: 2 }} />
                ))}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (!stats) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error">Failed to load stats</Typography>
      </Box>
    );
  }

  // Prepare chart data
  const usageData = [
    {
      name: 'Images',
      used: stats.imagesUsed,
      limit: stats.imagesLimit,
      remaining: Math.max(0, stats.imagesLimit - stats.imagesUsed),
    },
    {
      name: 'Videos',
      used: stats.videosUsed,
      limit: stats.videosLimit,
      remaining: Math.max(0, stats.videosLimit - stats.videosUsed),
    },
  ];

  const listingsPieData = [
    { name: 'Published', value: stats.publishedCount },
    { name: 'Draft', value: Math.max(0, stats.listingsCount - stats.publishedCount) },
  ];

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h2" gutterBottom>Dashboard Overview</Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back! Here&apos;s what&apos;s happening with your listings
          </Typography>
        </Box>
        <Button
          component={Link}
          href="/app/create"
          variant="contained"
          size="large"
          startIcon={<AddCircleIcon />}
          sx={{
            px: 3,
            py: 1.5,
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 600,
            boxShadow: 3,
            '&:hover': {
              boxShadow: 6,
            },
          }}
        >
          Create New Listing
        </Button>
      </Stack>

      {/* KPI Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Images Generated"
            value={stats.imagesUsed}
            limit={stats.imagesLimit}
            icon={<ImageIcon fontSize="inherit" />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Videos Created"
            value={stats.videosUsed}
            limit={stats.videosLimit}
            icon={<VideoLibraryIcon fontSize="inherit" />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Listings"
            value={stats.listingsCount}
            subtitle={`${stats.publishedCount} published`}
            icon={<ListAltIcon fontSize="inherit" />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Supported Channels"
            value={stats.channelsCount}
            subtitle={`${stats.currentPlan} plan`}
            icon={<StorefrontIcon fontSize="inherit" />}
            color="warning"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Usage Charts */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              Resource Usage This Month
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Track your images and videos generation
            </Typography>

            {/* Bar Chart */}
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend />
                <Bar dataKey="used" fill="#2196F3" name="Used" radius={[8, 8, 0, 0]} />
                <Bar dataKey="remaining" fill="#E3F2FD" name="Remaining" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Listings Pie Chart & Quick Actions */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={3} height="100%">
            {/* Listings Distribution */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Listings Status
              </Typography>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={listingsPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {listingsPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <Stack direction="row" spacing={2} justifyContent="center" mt={1}>
                {listingsPieData.map((entry, index) => (
                  <Stack key={entry.name} direction="row" alignItems="center" spacing={0.5}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: COLORS[index] }} />
                    <Typography variant="caption">
                      {entry.name}: {entry.value}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Paper>

            {/* Quick Actions */}
            <Paper sx={{ p: 3, flexGrow: 1 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Quick Actions
              </Typography>
              <Stack spacing={2} sx={{ mt: 2 }}>
                <Button
                  component={Link}
                  href="/app/listings"
                  variant="outlined"
                  fullWidth
                  size="large"
                  sx={{ textTransform: 'none', borderRadius: 2 }}
                >
                  View All Listings
                </Button>
                <Button
                  component={Link}
                  href="/app/channels"
                  variant="outlined"
                  fullWidth
                  size="large"
                  sx={{ textTransform: 'none', borderRadius: 2 }}
                >
                  Manage Channels
                </Button>
                <Button
                  component={Link}
                  href="/app/billing"
                  variant="outlined"
                  fullWidth
                  size="large"
                  startIcon={<TrendingUpIcon />}
                  sx={{ textTransform: 'none', borderRadius: 2 }}
                >
                  Upgrade Plan
                </Button>
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
