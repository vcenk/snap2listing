'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Typography,
  Checkbox,
  Stack,
  Alert,
  CircularProgress,
  alpha,
  Tooltip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Channel } from '@/lib/types/channels';

interface ChannelSelectorProps {
  selectedChannels: string[];
  onSelectionChange: (channelIds: string[]) => void;
  onChannelsLoaded?: (channels: Channel[]) => void;
}

const CHANNEL_COLORS: Record<string, string> = {
  shopify: '#96BF48',
  ebay: '#E53238',
  'facebook-ig': '#1877F2',
  amazon: '#FF9900',
  etsy: '#F16521',
  tiktok: '#000000',
};

const CHANNEL_DESCRIPTIONS: Record<string, string> = {
  shopify: 'Perfect for your own online store',
  ebay: 'Auction and fixed-price marketplace',
  'facebook-ig': 'Social commerce platform',
  amazon: 'World\'s largest marketplace',
  etsy: 'Handmade and vintage marketplace',
  tiktok: 'Social shopping platform',
};

export default function ChannelSelector({
  selectedChannels,
  onSelectionChange,
  onChannelsLoaded,
}: ChannelSelectorProps) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load channels from API
  useEffect(() => {
    const fetchChannels = async () => {
      try {
        console.log('🔄 Fetching channels from API...');
        const response = await fetch('/api/channels');
        console.log('📡 Response status:', response.status);

        const data = await response.json();
        console.log('📦 Response data:', data);

        if (!data.success) {
          console.error('❌ API returned error:', data.error);
          throw new Error(data.error || 'Failed to fetch channels');
        }

        console.log('✅ Channels loaded:', data.channels?.length, 'channels');
        console.log('📋 Channel details:', data.channels);

        setChannels(data.channels);
        if (onChannelsLoaded) {
          onChannelsLoaded(data.channels);
        }
      } catch (err) {
        console.error('❌ Error fetching channels:', err);
        setError('Failed to load channels. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
  }, [onChannelsLoaded]);

  const handleToggle = (channelId: string) => {
    const updated = selectedChannels.includes(channelId)
      ? selectedChannels.filter((id) => id !== channelId)
      : [...selectedChannels, channelId];
    onSelectionChange(updated);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  // Debug: Log render state
  console.log('🎨 ChannelSelector render:', {
    loading,
    error,
    channelsCount: channels.length,
    channels: channels.map(c => c.name),
  });

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={2} mb={2}>
        <Typography variant="h4" fontWeight={700}>
          Select Your Sales Channels
        </Typography>
      </Stack>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Choose one or more platforms where you want to list this product. Each channel has unique requirements that we'll optimize for you.
      </Typography>

      {/* Debug info */}
      {!loading && !error && channels.length === 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          No channels found. Channels count: {channels.length}
        </Alert>
      )}

      <Grid container spacing={2}>
        {channels.map((channel) => {
          const isSelected = selectedChannels.includes(channel.id);
          const color = CHANNEL_COLORS[channel.slug] || '#666';
          const description = CHANNEL_DESCRIPTIONS[channel.slug] || channel.config.description;

          return (
            <Grid item xs={12} sm={6} md={4} key={channel.id}>
              <Tooltip title={description} arrow placement="top">
                <Card
                  sx={{
                    cursor: 'pointer',
                    border: '2px solid',
                    borderColor: isSelected ? color : alpha(color, 0.2),
                    bgcolor: isSelected ? alpha(color, 0.05) : 'background.paper',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      borderColor: color,
                      boxShadow: 4,
                      transform: 'translateY(-4px)',
                    },
                    height: '100%',
                    position: 'relative',
                  }}
                  onClick={() => handleToggle(channel.id)}
                >
                  {isSelected && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        zIndex: 1,
                      }}
                    >
                      <CheckCircleIcon sx={{ color, fontSize: 28 }} />
                    </Box>
                  )}

                  <CardContent>
                    <Stack spacing={2}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleToggle(channel.id)}
                          onClick={(e) => e.stopPropagation()}
                          sx={{
                            color: alpha(color, 0.5),
                            '&.Mui-checked': {
                              color,
                            },
                          }}
                        />
                        <Box flex={1}>
                          <Typography variant="h6" fontWeight={700}>
                            {channel.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {description}
                          </Typography>
                        </Box>
                      </Stack>

                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        <Chip
                          label={channel.exportFormat.toUpperCase()}
                          size="small"
                          sx={{
                            bgcolor: alpha(color, 0.1),
                            color,
                            fontWeight: 600,
                          }}
                        />
                        {channel.validationRules.title?.maxLength && (
                          <Chip
                            label={`Title: ${channel.validationRules.title.maxLength} chars`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                        {channel.validationRules.images?.min && (
                          <Chip
                            label={`${channel.validationRules.images.min}+ images`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Tooltip>
            </Grid>
          );
        })}
      </Grid>

      {selectedChannels.length > 0 && (
        <Box
          sx={{
            mt: 3,
            p: 3,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${alpha('#4CAF50', 0.1)} 0%, ${alpha('#2196F3', 0.1)} 100%)`,
            border: `2px solid ${alpha('#4CAF50', 0.3)}`,
          }}
        >
          <Typography variant="body1" fontWeight={700} color="success.main" gutterBottom>
            ✓ {selectedChannels.length} channel{selectedChannels.length > 1 ? 's' : ''} selected
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You'll be able to customize content for each channel in the optimization step
          </Typography>
        </Box>
      )}
    </Box>
  );
}
