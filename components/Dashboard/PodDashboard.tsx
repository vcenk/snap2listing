'use client';

import { Box, Grid, Paper, Typography } from '@mui/material';
import { StatCard } from './StatCard';
import { QuickActions } from './QuickActions';
import { listyboxGradients } from '@/lib/theme/podTheme';

interface PodDashboardProps {
  onCreateProduct?: () => void;
  onImportDesigns?: () => void;
  onViewAnalytics?: () => void;
  stats?: {
    totalProducts: number;
    designs: number;
    published: number;
    revenue: string;
  };
}

export function PodDashboard({
  onCreateProduct,
  onImportDesigns,
  onViewAnalytics,
  stats = {
    totalProducts: 0,
    designs: 0,
    published: 0,
    revenue: '$0',
  },
}: PodDashboardProps) {
  return (
    <Box sx={{ p: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #4facfe15 0%, #00f2fe15 100%)',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="h3" fontWeight={800} gutterBottom>
          Welcome back! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your POD business today
        </Typography>
      </Paper>

      {/* Quick Actions */}
      <QuickActions
        onCreateProduct={onCreateProduct}
        onImportDesigns={onImportDesigns}
        onViewAnalytics={onViewAnalytics}
      />

      {/* Stats Grid */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Total Products"
            value={stats.totalProducts}
            icon="📦"
            gradient={listyboxGradients.blue}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Designs"
            value={stats.designs}
            icon="🎨"
            gradient={listyboxGradients.purple}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Published"
            value={stats.published}
            icon="✅"
            gradient={listyboxGradients.green}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Revenue"
            value={stats.revenue}
            icon="💰"
            gradient={listyboxGradients.orange}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
