'use client';

import { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper, Alert, CircularProgress, Stack } from '@mui/material';
import { supabase } from '@/lib/supabase/client';

export default function DebugChannelsPage() {
  const [loading, setLoading] = useState(false);
  const [channels, setChannels] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const checkChannels = async () => {
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const { data, error: fetchError } = await supabase
        .from('channels')
        .select('*')
        .order('name');

      if (fetchError) throw fetchError;

      setChannels(data || []);
      setMessage(`Found ${data?.length || 0} channels`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fixChannels = async () => {
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const updates = [
        {
          slug: 'shopify',
          validation_rules: {
            title: { required: true, maxLength: 255 },
            description: { required: true, maxLength: 65535 },
            price: { required: true, min: 0 },
            images: { required: true, min: 1, max: 250 },
          },
          description: 'Perfect for your own online store',
        },
        {
          slug: 'ebay',
          validation_rules: {
            title: { required: true, maxLength: 80 },
            description: { required: true, maxLength: 500000 },
            price: { required: true, min: 0 },
            category: { required: true },
            images: { required: true, min: 1, max: 24 },
          },
          description: 'Auction and fixed-price marketplace',
        },
        {
          slug: 'amazon',
          validation_rules: {
            title: { required: true, maxLength: 200 },
            description: { required: true, maxLength: 2000 },
            bullets: { required: true, max: 5 },
            price: { required: true, min: 0 },
            images: { required: true, min: 1, max: 9 },
          },
          description: 'Worlds largest marketplace',
        },
        {
          slug: 'etsy',
          validation_rules: {
            title: { required: true, maxLength: 140 },
            description: { required: true, maxLength: 5000 },
            tags: { required: true, max: 13 },
            price: { required: true, min: 0.20 },
            images: { required: true, min: 1, max: 10 },
            materials: { max: 13 },
          },
          description: 'Handmade and vintage marketplace',
        },
        {
          slug: 'facebook-ig',
          validation_rules: {
            title: { required: true, maxLength: 100 },
            description: { required: true, maxLength: 5000 },
            price: { required: true, min: 0 },
            images: { required: true, min: 1, max: 20 },
          },
          description: 'Social commerce platform',
        },
        {
          slug: 'tiktok',
          validation_rules: {
            title: { required: true, maxLength: 255 },
            description: { required: true, maxLength: 5000 },
            price: { required: true, min: 0 },
            images: { required: true, min: 1, max: 9 },
            video: { recommended: true },
          },
          description: 'Social shopping platform',
        },
      ];

      for (const update of updates) {
        // Get current channel config
        const { data: currentChannel } = await supabase
          .from('channels')
          .select('config')
          .eq('slug', update.slug)
          .single();

        // Merge description into config
        const newConfig = {
          ...(currentChannel?.config || {}),
          description: update.description,
        };

        // Update channel
        const { error: updateError } = await supabase
          .from('channels')
          .update({
            validation_rules: update.validation_rules,
            config: newConfig,
          })
          .eq('slug', update.slug);

        if (updateError) throw updateError;
      }

      setMessage('✅ All channels updated successfully! Refresh the listing creation page.');
      await checkChannels(); // Reload to show updated data
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkChannels();
  }, []);

  return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Channel Diagnostics
      </Typography>

      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Button
          variant="outlined"
          onClick={checkChannels}
          disabled={loading}
        >
          Check Channels
        </Button>
        <Button
          variant="contained"
          onClick={fixChannels}
          disabled={loading}
        >
          Fix Channels
        </Button>
      </Stack>

      {loading && <CircularProgress />}

      {channels.map((channel) => (
        <Paper key={channel.id} sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6">{channel.name} ({channel.slug})</Typography>
          <Typography variant="body2" color="text.secondary">
            Description: {channel.config?.description || '❌ Missing'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Validation Rules: {
              channel.validation_rules && Object.keys(channel.validation_rules).length > 0
                ? `✅ ${Object.keys(channel.validation_rules).length} rules`
                : '❌ Empty'
            }
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
            {JSON.stringify(channel.validation_rules, null, 2)}
          </Typography>
        </Paper>
      ))}
    </Box>
  );
}
