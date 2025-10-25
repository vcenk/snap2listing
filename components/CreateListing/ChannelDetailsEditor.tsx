'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  TextField,
  Typography,
  Paper,
  Chip,
  Stack,
  Alert,
  Button,
  Divider,
  Badge,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import {
  ListingBase,
  ChannelOverride,
  Channel,
} from '@/lib/types/channels';

interface ChannelDetailsEditorProps {
  productImageUrl: string;
  initialData: {
    title: string;
    description: string;
    price: number;
    category: string;
    quantity: number;
  };
  channels: Channel[];
  overrides: ChannelOverride[];
  onDataChange: (data: {
    baseData: ListingBase;
    channelOverrides: ChannelOverride[];
  }) => void;
  onNext: () => void;
  onBack: () => void;
}

const CATEGORIES = [
  'Accessories',
  'Art & Collectibles',
  'Home & Living',
  'Jewelry',
  'Clothing',
  'Health & Beauty',
  'Electronics',
  'Craft Supplies',
];

export default function ChannelDetailsEditor({
  productImageUrl,
  initialData,
  channels,
  overrides,
  onDataChange,
  onNext,
  onBack,
}: ChannelDetailsEditorProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Local state for channel-specific data
  const [channelData, setChannelData] = useState<Record<string, ChannelOverride>>({});

  // Initialize channel data with overrides or defaults
  useEffect(() => {
    const initialChannelData: Record<string, ChannelOverride> = {};
    channels.forEach((channel) => {
      const existingOverride = overrides.find((o) => o.channelId === channel.id);
      
      if (existingOverride) {
        // Use existing override and ensure all fields are present
        const tags = existingOverride.tags || existingOverride.keywords || [];
        const bullets = existingOverride.bullets || existingOverride.bullet_points || [];
        const materials = existingOverride.materials || [];
        
        initialChannelData[channel.id] = {
          channelId: channel.id,
          channelSlug: channel.slug,
          title: existingOverride.title || initialData.title,
          description: existingOverride.description || initialData.description,
          price: existingOverride.price || initialData.price,
          tags: Array.isArray(tags) ? tags : [],
          bullets: Array.isArray(bullets) ? bullets : [],
          materials: Array.isArray(materials) ? materials : [],
        };
      } else {
        // Create default entry
        initialChannelData[channel.id] = {
          channelId: channel.id,
          channelSlug: channel.slug,
          title: initialData.title,
          description: initialData.description,
          price: initialData.price,
          tags: [],
          bullets: [],
        };
      }
    });
    setChannelData(initialChannelData);
  }, [channels, overrides, initialData]);

  const activeChannel = channels[activeTab];
  const currentChannelData = channelData[activeChannel?.id] || {};

  const handleFieldChange = (field: keyof ChannelOverride, value: any) => {
    if (!activeChannel) return;

    const updated = {
      ...channelData,
      [activeChannel.id]: {
        ...currentChannelData,
        [field]: value,
      },
    };

    setChannelData(updated);

    // Propagate changes to parent
    const baseData: ListingBase = {
      title: initialData.title,
      description: initialData.description,
      price: initialData.price,
      category: initialData.category,
      quantity: initialData.quantity,
      images: [productImageUrl],
      originalImage: productImageUrl,
    };

    onDataChange({
      baseData,
      channelOverrides: Object.values(updated),
    });
  };

  const handleAutoOptimize = async () => {
    setIsOptimizing(true);
    try {
      const response = await fetch('/api/generate-listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: productImageUrl,
          description: initialData.description,
          selectedChannels: channels.map(c => c.slug),
          attributes: {
            category: initialData.category,
            price: initialData.price,
          },
        }),
      });

      const result = await response.json();

      if (result.success && result.listings) {
        const optimizedData: Record<string, ChannelOverride> = {};

        result.listings.forEach((listing: any) => {
          const channel = channels.find(c => c.slug === listing.channel);
          if (channel && listing.ai_generated) {
            const aiData = listing.ai_generated;
            
            // Extract tags/keywords properly
            let tags = [];
            
            // For Amazon, prioritize keywords field, for others use tags
            if (listing.channel === 'amazon') {
              // Amazon: Use keywords array if available, fall back to tags
              if (Array.isArray(aiData.keywords)) {
                tags = aiData.keywords;
              } else if (typeof aiData.keywords === 'string') {
                tags = aiData.keywords.split(',').map((t: string) => t.trim()).filter((t: string) => t);
              } else if (Array.isArray(aiData.tags)) {
                tags = aiData.tags;
              } else if (typeof aiData.tags === 'string') {
                tags = aiData.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t);
              }
            } else {
              // Other channels: Use tags field
              if (Array.isArray(aiData.tags)) {
                tags = aiData.tags;
              } else if (typeof aiData.tags === 'string') {
                tags = aiData.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t);
              } else if (Array.isArray(aiData.keywords)) {
                tags = aiData.keywords;
              } else if (typeof aiData.keywords === 'string') {
                tags = aiData.keywords.split(',').map((t: string) => t.trim()).filter((t: string) => t);
              }
            }
            
            // Extract bullets properly
            let bullets = [];
            if (Array.isArray(aiData.bullet_points)) {
              bullets = aiData.bullet_points;
            } else if (Array.isArray(aiData.bullets)) {
              bullets = aiData.bullets;
            } else if (Array.isArray(aiData.features)) {
              bullets = aiData.features;
            }
            
            // Extract materials
            let materials = [];
            if (Array.isArray(aiData.materials)) {
              materials = aiData.materials;
            }
            
            optimizedData[channel.id] = {
              channelId: channel.id,
              channelSlug: channel.slug,
              title: aiData.title || aiData.product_title || initialData.title,
              description: aiData.description || aiData.short_description || initialData.description,
              tags: tags,
              bullets: bullets,
              price: initialData.price,
              materials: materials.length > 0 ? materials : undefined,
            };
          }
        });

        // Fill in any missing channels with defaults
        channels.forEach((channel) => {
          if (!optimizedData[channel.id]) {
            optimizedData[channel.id] = {
              channelId: channel.id,
              channelSlug: channel.slug,
              title: initialData.title,
              description: initialData.description,
              tags: [],
              bullets: [],
              price: initialData.price,
            };
          }
        });

        setChannelData(optimizedData);

        const baseData: ListingBase = {
          title: initialData.title,
          description: initialData.description,
          price: initialData.price,
          category: initialData.category,
          quantity: initialData.quantity,
          images: [productImageUrl],
          originalImage: productImageUrl,
        };

        onDataChange({
          baseData,
          channelOverrides: Object.values(optimizedData),
        });
        
        // Show success message
        alert(`✅ Successfully optimized content for ${channels.length} channels!\n\n` +
              `Generated:\n` +
              `• Titles\n` +
              `• Descriptions\n` +
              `• Tags/Keywords\n` +
              `• Bullet Points\n` +
              `• Materials (Etsy)`);
      }
    } catch (error) {
      console.error('Auto-optimize failed:', error);
      alert('❌ Failed to optimize listings. Please try again.\n\nError: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsOptimizing(false);
    }
  };

  const addTag = (tag: string) => {
    if (!tag.trim() || !activeChannel) return;
    const tags = Array.isArray(currentChannelData.tags) ? currentChannelData.tags : [];
    if (!tags.includes(tag.trim())) {
      handleFieldChange('tags', [...tags, tag.trim()]);
    }
  };

  const removeTag = (index: number) => {
    const tags = Array.isArray(currentChannelData.tags) ? currentChannelData.tags : [];
    handleFieldChange('tags', tags.filter((_, i) => i !== index));
  };

  const addBullet = () => {
    const bullets = Array.isArray(currentChannelData.bullets) ? currentChannelData.bullets : [];
    handleFieldChange('bullets', [...bullets, '']);
  };

  const updateBullet = (index: number, value: string) => {
    const bullets = Array.isArray(currentChannelData.bullets) ? [...currentChannelData.bullets] : [];
    bullets[index] = value;
    handleFieldChange('bullets', bullets);
  };

  const removeBullet = (index: number) => {
    const bullets = Array.isArray(currentChannelData.bullets) ? currentChannelData.bullets : [];
    handleFieldChange('bullets', bullets.filter((_, i) => i !== index));
  };

  return (
    <Box>
      <Stack spacing={3}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Channel-Specific Content
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Customize your listing for each sales channel
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AutoFixHighIcon />}
            onClick={handleAutoOptimize}
            disabled={isOptimizing}
          >
            {isOptimizing ? 'Optimizing...' : 'Auto-Optimize All'}
          </Button>
        </Box>

        {/* Product Image Preview */}
        <Paper sx={{ p: 2 }}>
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: 2,
              overflow: 'hidden',
              mx: 'auto',
            }}
          >
            <img
              src={productImageUrl}
              alt="Product"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </Box>
        </Paper>

        {/* Channel Tabs */}
        <Paper>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
          >
            {channels.map((channel, index) => (
              <Tab
                key={channel.id}
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography fontWeight={activeTab === index ? 700 : 400}>
                      {channel.name}
                    </Typography>
                  </Box>
                }
              />
            ))}
          </Tabs>
        </Paper>

        {/* Channel Content Editor */}
        <Paper sx={{ p: 3 }}>
          <Stack spacing={3}>
            {/* Title */}
            <TextField
              label="Title"
              value={currentChannelData.title || ''}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              fullWidth
              required
              helperText={`Optimized for ${activeChannel?.name}`}
            />

            {/* Description */}
            <TextField
              label="Description"
              value={currentChannelData.description || ''}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              fullWidth
              required
              multiline
              rows={6}
              helperText={`Channel-specific description for ${activeChannel?.name}`}
            />

            <Divider />

            {/* Tags */}
            <Box>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Tags / Keywords
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" mb={2}>
                {(Array.isArray(currentChannelData.tags) ? currentChannelData.tags : []).map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    onDelete={() => removeTag(index)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Stack>
              <TextField
                size="small"
                placeholder="Add a tag and press Enter"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
                fullWidth
              />
            </Box>

            {/* Bullet Points */}
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle2" fontWeight={600}>
                  Key Features / Bullet Points
                </Typography>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={addBullet}
                  variant="outlined"
                >
                  Add Bullet
                </Button>
              </Box>
              <Stack spacing={2}>
                {(Array.isArray(currentChannelData.bullets) ? currentChannelData.bullets : []).map((bullet, index) => (
                  <Box key={index} display="flex" gap={1} alignItems="center">
                    <TextField
                      size="small"
                      value={bullet}
                      onChange={(e) => updateBullet(index, e.target.value)}
                      fullWidth
                      placeholder={`Feature ${index + 1}`}
                    />
                    <IconButton size="small" onClick={() => removeBullet(index)}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Stack>
            </Box>

            {/* Materials Section (Etsy specific) */}
            {activeChannel?.slug === 'etsy' && (
              <Box>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Materials
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                  List the materials used in your product (e.g., wood, cotton, metal)
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" mb={2}>
                  {(Array.isArray(currentChannelData.materials) ? currentChannelData.materials : []).map((material, index) => (
                    <Chip
                      key={index}
                      label={material}
                      onDelete={() => {
                        const materials = Array.isArray(currentChannelData.materials) ? currentChannelData.materials : [];
                        handleFieldChange('materials', materials.filter((_, i) => i !== index));
                      }}
                      color="secondary"
                      variant="outlined"
                    />
                  ))}
                </Stack>
                <TextField
                  size="small"
                  placeholder="Add a material and press Enter"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const value = (e.target as HTMLInputElement).value.trim();
                      if (value) {
                        const materials = Array.isArray(currentChannelData.materials) ? currentChannelData.materials : [];
                        if (!materials.includes(value)) {
                          handleFieldChange('materials', [...materials, value]);
                        }
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                  fullWidth
                />
              </Box>
            )}
          </Stack>
        </Paper>

        {/* Action Buttons */}
        <Stack direction="row" justifyContent="space-between">
          <Button variant="outlined" onClick={onBack}>
            Back
          </Button>
          <Button variant="contained" onClick={onNext}>
            Continue to Images
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
