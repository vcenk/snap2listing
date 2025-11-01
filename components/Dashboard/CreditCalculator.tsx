'use client';

import { Box, Typography, Paper, Stack, Divider } from '@mui/material';
import { CREDIT_COSTS } from '@/config/pricing';
import ImageIcon from '@mui/icons-material/Image';
import VideocamIcon from '@mui/icons-material/Videocam';
import GridOnIcon from '@mui/icons-material/GridOn';
import ListAltIcon from '@mui/icons-material/ListAlt';

interface CreditBreakdown {
  images: number;
  mockups: number;
  videos: number;
  completeListings: number;
}

interface CreditCalculatorProps {
  creditsRemaining: number;
  breakdown: CreditBreakdown;
}

export default function CreditCalculator({ creditsRemaining, breakdown }: CreditCalculatorProps) {
  const items = [
    {
      label: 'Images',
      count: breakdown.images,
      cost: CREDIT_COSTS.imageGeneration,
      icon: <ImageIcon />,
      color: '#2196F3'
    },
    {
      label: 'Mockups',
      count: breakdown.mockups,
      cost: CREDIT_COSTS.mockupDownload,
      icon: <GridOnIcon />,
      color: '#9C27B0'
    },
    {
      label: 'Videos',
      count: breakdown.videos,
      cost: CREDIT_COSTS.videoGeneration,
      icon: <VideocamIcon />,
      color: '#F44336'
    },
    {
      label: 'Complete Listings',
      count: breakdown.completeListings,
      cost: 9, // 3 (image) + 3 (mockup) + 3 (video) + 0 (SEO unlimited)
      icon: <ListAltIcon />,
      color: '#4CAF50'
    },
  ];

  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Typography variant="h6" gutterBottom fontWeight={600}>
        What You Can Create
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        With your {creditsRemaining} remaining credits:
      </Typography>

      <Stack spacing={2} divider={<Divider />}>
        {items.map((item) => (
          <Stack key={item.label} direction="row" alignItems="center" spacing={2}>
            <Box sx={{ color: item.color, fontSize: 32, flexShrink: 0 }}>
              {item.icon}
            </Box>
            <Box flexGrow={1}>
              <Typography variant="h5" fontWeight={700}>
                {item.count}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {item.label}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
              {item.cost} {item.cost === 1 ? 'credit' : 'credits'}
            </Typography>
          </Stack>
        ))}
      </Stack>

      <Box sx={{ mt: 3, p: 2, bgcolor: 'success.light', borderRadius: 2 }}>
        <Typography variant="caption" fontWeight={600} color="success.dark">
          ✨ SEO content for all marketplaces: FREE (unlimited)
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          * Complete listing: 1 image + 1 mockup + 1 video + unlimited SEO = 9 credits
        </Typography>
      </Box>
    </Paper>
  );
}
