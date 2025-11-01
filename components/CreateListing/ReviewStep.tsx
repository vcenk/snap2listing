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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Tabs,
  Tab,
  Dialog,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import { useState } from 'react';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ImageIcon from '@mui/icons-material/Image';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import StoreIcon from '@mui/icons-material/Store';
import DownloadIcon from '@mui/icons-material/Download';
import CloseIcon from '@mui/icons-material/Close';
import { GeneratedImage, GeneratedVideo } from '@/lib/types';
import { ListingBase, ChannelOverride, Channel } from '@/lib/types/channels';

interface ReviewStepProps {
  // For backward compatibility
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

  // New: Full data display
  baseData?: ListingBase;
  channelOverrides?: ChannelOverride[];
  channels?: Channel[];
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
  baseData,
  channelOverrides = [],
  channels = [],
}: ReviewStepProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [selectedChannelTab, setSelectedChannelTab] = useState(0);
  const [previewImage, setPreviewImage] = useState<{ url: string; index: number } | null>(null);

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

  const downloadImage = (url: string, index: number) => {
    try {
      const downloadUrl = `/api/download-image?url=${encodeURIComponent(url)}`;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `product-image-${index + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading image:', error);
      alert('Failed to download image. Please try again.');
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
              Review & Save Your Listing
            </Typography>
          </Stack>
          <Typography variant="body1" color="text.secondary">
            Your product listing is ready! Review all details below and save to start selling across your selected channels.
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
                    <StoreIcon />
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight={700}>
                      {selectedChannelIds.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Sales Channels
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
                  position: 'relative',
                  mb: 3,
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: 2,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: 4,
                  },
                }}
                onClick={() => setPreviewImage({ url: images[0]?.url, index: 0 })}
              >
                <img
                  src={images[0]?.url}
                  alt="Main product"
                  style={{ width: '100%', maxHeight: 400, objectFit: 'cover' }}
                />
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadImage(images[0]?.url, 0);
                  }}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                    '&:hover': {
                      bgcolor: 'white',
                    },
                  }}
                >
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </Box>

              {/* Additional Images */}
              {images.length > 1 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" mb={1}>
                    Additional Images ({images.length - 1})
                  </Typography>
                  <ImageList cols={4} gap={8}>
                    {images.slice(1).map((img, idx) => (
                      <ImageListItem
                        key={img.id}
                        sx={{
                          position: 'relative',
                          cursor: 'pointer',
                          transition: 'transform 0.2s ease',
                          '&:hover': {
                            transform: 'scale(1.05)',
                          },
                        }}
                        onClick={() => setPreviewImage({ url: img.url, index: idx + 1 })}
                      >
                        <img
                          src={img.url}
                          alt="Product"
                          loading="lazy"
                          style={{ borderRadius: 8, aspectRatio: '1/1', objectFit: 'cover' }}
                        />
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadImage(img.url, idx + 1);
                          }}
                          sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            bgcolor: 'rgba(255, 255, 255, 0.9)',
                            '&:hover': {
                              bgcolor: 'white',
                            },
                            padding: '4px',
                          }}
                        >
                          <DownloadIcon sx={{ fontSize: 16 }} />
                        </IconButton>
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
              <Typography variant="h6" fontWeight={600} mb={3}>
                Product Listing Details
              </Typography>

              <Stack spacing={3}>
                {/* Title */}
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={1}>
                    TITLE
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {baseData?.title || title}
                  </Typography>
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
                      maxHeight: 300,
                      overflowY: 'auto',
                      pr: 1,
                      lineHeight: 1.6,
                    }}
                  >
                    {baseData?.description || description}
                  </Typography>
                </Box>

                {/* Show tags if any channel has them */}
                {channelOverrides && channelOverrides.some(o => o.tags && o.tags.length > 0) && (
                  <>
                    <Divider />
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={600} mb={1} display="block">
                        TAGS/KEYWORDS
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {/* Get tags from first channel override that has them */}
                        {channelOverrides.find(o => o.tags && o.tags.length > 0)?.tags.slice(0, 13).map((tag, idx) => (
                          <Chip
                            key={idx}
                            label={tag}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ fontWeight: 600 }}
                          />
                        ))}
                      </Box>
                    </Box>
                  </>
                )}

                {/* Show bullets if any channel has them */}
                {channelOverrides && channelOverrides.some(o => o.bullets && o.bullets.length > 0) && (
                  <>
                    <Divider />
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={600} mb={1} display="block">
                        KEY FEATURES
                      </Typography>
                      <List dense sx={{ pl: 0 }}>
                        {channelOverrides.find(o => o.bullets && o.bullets.length > 0)?.bullets.map((bullet, idx) => (
                          <ListItem key={idx} sx={{ pl: 0, py: 0.5 }}>
                            <ListItemText
                              primary={`• ${bullet}`}
                              primaryTypographyProps={{ variant: 'body2' }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  </>
                )}

                {/* Show materials if any channel has them */}
                {channelOverrides && channelOverrides.some(o => o.materials && o.materials.length > 0) && (
                  <>
                    <Divider />
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={600} mb={1} display="block">
                        MATERIALS
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {channelOverrides.find(o => o.materials && o.materials.length > 0)?.materials.map((material, idx) => (
                          <Chip
                            key={idx}
                            label={material}
                            size="small"
                            color="secondary"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Box>
                  </>
                )}
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        {/* Channel-Specific Details */}
        {channelOverrides.length > 0 && channels.length > 0 && (
          <Paper elevation={2} sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" spacing={2} mb={3}>
              <StoreIcon color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Channel-Specific Details
              </Typography>
            </Stack>

            <Alert severity="info" sx={{ mb: 3 }}>
              Each sales channel has optimized content tailored to its requirements and audience.
            </Alert>

            <Tabs
              value={selectedChannelTab}
              onChange={(e, newValue) => setSelectedChannelTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
            >
              {channelOverrides.map((override, index) => {
                const channel = channels.find(c => c.id === override.channelId || c.slug === override.channelSlug);
                return (
                  <Tab
                    key={override.channelId || index}
                    label={channel?.name || override.channelSlug}
                    icon={<StoreIcon />}
                    iconPosition="start"
                  />
                );
              })}
            </Tabs>

            {channelOverrides.map((override, index) => {
              const channel = channels.find(c => c.id === override.channelId || c.slug === override.channelSlug);

              if (selectedChannelTab !== index) return null;

              return (
                <Box key={override.channelId || index}>
                  <Grid container spacing={3}>
                    {/* Title */}
                    <Grid item xs={12} md={6}>
                      <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={600} mb={1} display="block">
                          TITLE
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {override.title || baseData?.title || title}
                        </Typography>
                      </Paper>
                    </Grid>

                    {/* Price - Hidden for POD products */}

                    {/* Description */}
                    <Grid item xs={12}>
                      <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={600} mb={1} display="block">
                          DESCRIPTION
                        </Typography>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                          {override.description || baseData?.description || description}
                        </Typography>
                      </Paper>
                    </Grid>

                    {/* Tags/Keywords */}
                    {override.tags && override.tags.length > 0 && (
                      <Grid item xs={12}>
                        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                          <Typography variant="caption" color="text.secondary" fontWeight={600} mb={1} display="block">
                            TAGS/KEYWORDS ({override.tags.length})
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {override.tags.map((tag, idx) => (
                              <Chip key={idx} label={tag} size="small" color="primary" variant="outlined" />
                            ))}
                          </Box>
                        </Paper>
                      </Grid>
                    )}

                    {/* Bullet Points/Features */}
                    {override.bullets && override.bullets.length > 0 && (
                      <Grid item xs={12}>
                        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                          <Typography variant="caption" color="text.secondary" fontWeight={600} mb={1} display="block">
                            KEY FEATURES ({override.bullets.length})
                          </Typography>
                          <List dense>
                            {override.bullets.map((bullet, idx) => (
                              <ListItem key={idx} sx={{ pl: 0 }}>
                                <ListItemText
                                  primary={`• ${bullet}`}
                                  primaryTypographyProps={{ variant: 'body2' }}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Paper>
                      </Grid>
                    )}

                    {/* Materials (Etsy) */}
                    {override.materials && override.materials.length > 0 && (
                      <Grid item xs={12}>
                        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                          <Typography variant="caption" color="text.secondary" fontWeight={600} mb={1} display="block">
                            MATERIALS
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {override.materials.map((material, idx) => (
                              <Chip key={idx} label={material} size="small" color="secondary" variant="outlined" />
                            ))}
                          </Box>
                        </Paper>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              );
            })}
          </Paper>
        )}

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

      {/* Image Preview Dialog */}
      <Dialog
        open={previewImage !== null}
        onClose={() => setPreviewImage(null)}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent sx={{ p: 0, position: 'relative', bgcolor: 'black' }}>
          <IconButton
            onClick={() => setPreviewImage(null)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'white',
              bgcolor: 'rgba(0,0,0,0.5)',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.7)',
              },
              zIndex: 1,
            }}
          >
            <CloseIcon />
          </IconButton>
          {previewImage && (
            <Box
              component="img"
              src={previewImage.url}
              alt={`Product image ${previewImage.index + 1}`}
              sx={{
                width: '100%',
                height: 'auto',
                maxHeight: '85vh',
                objectFit: 'contain',
              }}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ bgcolor: 'background.paper' }}>
          {previewImage && (
            <Button
              startIcon={<DownloadIcon />}
              onClick={() => downloadImage(previewImage.url, previewImage.index)}
            >
              Download
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
