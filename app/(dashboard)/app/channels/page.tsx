'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Alert,
  Skeleton,
} from '@mui/material';

interface Channel {
  id: string;
  name: string;
  slug: string;
  exportFormat: string;
}

export default function ChannelsPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadChannels = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/channels');
        const data = await res.json();
        if (!res.ok || !data?.success) throw new Error(data?.error || 'Failed to load channels');
        setChannels(data.channels || []);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    loadChannels();
  }, []);

  if (loading) {
    return (
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
          <Skeleton variant="text" width={200} height={48} />
          <Skeleton variant="rectangular" width={180} height={40} sx={{ borderRadius: 1 }} />
        </Stack>
        <Grid container spacing={3}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Card><CardContent><Skeleton variant="text" width="60%" /><Skeleton variant="text" width="40%" /></CardContent></Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      <Stack spacing={1} mb={4}>
        <Typography variant="h2">Channels</Typography>
        <Typography variant="body1" color="text.secondary">
          Select channels per listing in the wizard. This page shows available platforms and their export formats.
        </Typography>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      )}

      <Grid container spacing={3}>
        {channels.map((ch) => (
          <Grid item xs={12} sm={6} md={4} key={ch.id}>
            <Card>
              <CardContent>
                <Stack spacing={1}>
                  <Typography variant="h5" fontWeight={700}>{ch.name}</Typography>
                  <Typography variant="body2" color="text.secondary">Slug: {ch.slug}</Typography>
                  <Chip label={`Export: ${ch.exportFormat}`} size="small" sx={{ alignSelf: 'flex-start' }} />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
