'use client';

import { Box, Card, Chip, Stack, Typography, alpha } from '@mui/material';
import { Channel } from '@/lib/types/channels';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

interface ChannelRulesSummaryProps {
  channels: Channel[];
}

const CHANNEL_COLORS: Record<string, string> = {
  shopify: '#96BF48',
  ebay: '#E53238',
  'facebook-ig': '#1877F2',
  amazon: '#FF9900',
  etsy: '#F16521',
  tiktok: '#000000',
};

export default function ChannelRulesSummary({ channels }: ChannelRulesSummaryProps) {
  if (channels.length === 0) return null;

  return (
    <Card
      sx={{
        mb: 3,
        background: alpha('#2196F3', 0.05),
        border: `1px solid ${alpha('#2196F3', 0.2)}`,
        borderRadius: 2,
      }}
    >
      <Box sx={{ p: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1} mb={2}>
          <InfoOutlinedIcon sx={{ color: 'primary.main', fontSize: 20 }} />
          <Typography variant="subtitle2" fontWeight={700} color="primary">
            Listing for {channels.length} {channels.length === 1 ? 'channel' : 'channels'}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={2} flexWrap="wrap" gap={1}>
          {channels.map((channel) => {
            const color = CHANNEL_COLORS[channel.slug] || '#666';
            const titleMax = channel.validationRules.title?.maxLength;
            const descMax = channel.validationRules.description?.maxLength;
            const imagesMin = channel.validationRules.images?.min;

            return (
              <Card
                key={channel.id}
                sx={{
                  bgcolor: 'background.paper',
                  border: `2px solid ${alpha(color, 0.3)}`,
                  borderRadius: 2,
                  px: 2,
                  py: 1.5,
                  minWidth: 200,
                }}
              >
                <Typography variant="body2" fontWeight={700} sx={{ color, mb: 1 }}>
                  {channel.name}
                </Typography>
                <Stack spacing={0.5}>
                  {titleMax && (
                    <Typography variant="caption" color="text.secondary">
                      Title: {titleMax} char max
                    </Typography>
                  )}
                  {descMax && (
                    <Typography variant="caption" color="text.secondary">
                      Description: {descMax} char max
                    </Typography>
                  )}
                  {imagesMin && (
                    <Typography variant="caption" color="text.secondary">
                      Images: {imagesMin}+ required
                    </Typography>
                  )}
                </Stack>
              </Card>
            );
          })}
        </Stack>
      </Box>
    </Card>
  );
}
