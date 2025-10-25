'use client';

import {
  Box,
  Typography,
  Stack,
  Button,
  Paper,
  Divider,
  Chip,
  ImageList,
  ImageListItem,
  Alert,
  Grid,
  Card,
  CardContent,
  alpha,
} from '@mui/material';
import { useState } from 'react';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ImageIcon from '@mui/icons-material/Image';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import { GeneratedImage, GeneratedVideo } from '@/lib/types';

interface ReviewStepProps {
  title: string;
  description: string;
  tags: string[];
  price: number;
  images: GeneratedImage[];
  video?: GeneratedVideo;
  onBack: () => void;
  onSave: () => void;
  onExport?: () => void;
  listingId?: string;
  selectedChannelIds?: string[];
}

export default function ReviewStep({
  title,
  description,
  tags,
  price,
  images,
  video,
  onBack,
  onSave,
  onExport,
  listingId,
  selectedChannelIds = [],
}: ReviewStepProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!listingId) {
      alert('Please save the listing first before exporting');
      return;
    }

    if (selectedChannelIds.length === 0) {
      alert('No channels selected for export');
      return;
    }

    try {
      setIsExporting(true);
      
      // Export for each selected channel
      for (const channelId of selectedChannelIds) {
        const response = await fetch('/api/export', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ listingId, channelId }),
        });

        if (!response.ok) {
          throw new Error('Export failed');
        }

        const result = await response.json();
        
        // Download the file
        const blob = new Blob(
          [Buffer.from(result.file.content, 'base64')],
          { type: result.file.contentType }
        );
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }

      alert(`Export completed successfully! Downloaded ${selectedChannelIds.length} file(s).`);
    } catch (error: any) {
      console.error('Export error:', error);
      const errorMessage = error.response?.data?.details?.message || error.message || 'Failed to export files';
      alert(`Export failed: ${errorMessage}`);
    } finally {
      setIsExporting(false);
    }

    if (onExport) {
      onExport();
    }
  };

  return (
    <Box>
      <Stack spacing={4}>
        {/* Header */}
        <Box>
          <Stack direction="row" alignItems="center" spacing={2} mb={1}>
            <CheckCircleIcon sx={{ fontSize: 32, color: 'success.main' }} />
            <Typography variant="h4" fontWeight={700}>
              Review Your Listing
            </Typography>
          </Stack>
          <Typography variant="body1" color="text.secondary">
            Everything looks great! Review your listing before saving.
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Card
              sx={{
                background: `linear-gradient(135deg, ${alpha('#2196F3', 0.1)} 0%, ${alpha('#2196F3', 0.05)} 100%)`,
                border: '1px solid',
                borderColor: alpha('#2196F3', 0.2),
              }}
            >
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      p: 1.5,
                      borderRadius: 2,
                      display: 'flex',
                    }}
                  >
                    <ImageIcon />
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight={700}>
                      {images.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Images Generated
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Card
              sx={{
                background: `linear-gradient(135deg, ${alpha('#9C27B0', 0.1)} 0%, ${alpha('#9C27B0', 0.05)} 100%)`,
                border: '1px solid',
                borderColor: alpha('#9C27B0', 0.2),
              }}
            >
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      bgcolor: 'secondary.main',
                      color: 'white',
                      p: 1.5,
                      borderRadius: 2,
                      display: 'flex',
                    }}
                  >
                    <VideoLibraryIcon />
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight={700}>
                      {video ? '1' : '0'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Video Created
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Card
              sx={{
                background: `linear-gradient(135deg, ${alpha('#4CAF50', 0.1)} 0%, ${alpha('#4CAF50', 0.05)} 100%)`,
                border: '1px solid',
                borderColor: alpha('#4CAF50', 0.2),
              }}
            >
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      bgcolor: 'success.main',
                      color: 'white',
                      p: 1.5,
                      borderRadius: 2,
                      display: 'flex',
                    }}
                  >
                    <LocalOfferIcon />
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight={700}>
                      {tags.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tags Added
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Main Preview */}
        <Grid container spacing={3}>
          {/* Left: Media */}
          <Grid item xs={12} lg={7}>
            <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Product Media
              </Typography>

              {/* Main Image */}
              <Box
                sx={{
                  mb: 3,
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: 2,
                }}
              >
                <img
                  src={images[0]?.url}
                  alt="Main product"
                  style={{ width: '100%', maxHeight: 400, objectFit: 'cover' }}
                />
              </Box>

              {/* Additional Images */}
              {images.length > 1 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" mb={1}>
                    Additional Images ({images.length - 1})
                  </Typography>
                  <ImageList cols={4} gap={8}>
                    {images.slice(1).map((img) => (
                      <ImageListItem key={img.id}>
                        <img
                          src={img.url}
                          alt="Product"
                          loading="lazy"
                          style={{ borderRadius: 8, aspectRatio: '1/1', objectFit: 'cover' }}
                        />
                      </ImageListItem>
                    ))}
                  </ImageList>
                </Box>
              )}

              {/* Video */}
              {video && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" mb={1}>
                    Product Video
                  </Typography>
                  <Box sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: 2 }}>
                    <video src={video.url} controls style={{ width: '100%', maxHeight: 300 }} />
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Right: Details */}
          <Grid item xs={12} lg={5}>
            <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Listing Details
              </Typography>

              <Stack spacing={3}>
                {/* Title */}
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    TITLE
                  </Typography>
                  <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5 }}>
                    {title}
                  </Typography>
                </Box>

                <Divider />

                {/* Tags */}
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} mb={1} display="block">
                    TAGS ({tags.length})
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    ))}
                  </Box>
                </Box>

                <Divider />

                {/* Description */}
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} mb={1} display="block">
                    DESCRIPTION
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      whiteSpace: 'pre-line',
                      maxHeight: 200,
                      overflowY: 'auto',
                      pr: 1,
                    }}
                  >
                    {description}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Stack direction="row" justifyContent="space-between" pt={2}>
          <Button
            onClick={onBack}
            size="large"
            variant="outlined"
            sx={{
              borderRadius: 2,
              px: 3,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            ← Back to Edit
          </Button>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button
              variant="outlined"
              size="large"
              onClick={handleExport}
              disabled={isExporting || !listingId}
              sx={{
                borderRadius: 2,
                px: 3,
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              {isExporting ? 'Exporting...' : 'Export Files'}
            </Button>
            <Button
              variant="contained"
              size="large"
              onClick={onSave}
              startIcon={<SaveIcon />}
              sx={{
                borderRadius: 2,
                px: 4,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: 3,
                '&:hover': {
                  boxShadow: 6,
                },
              }}
            >
              Save to Listings
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
}
