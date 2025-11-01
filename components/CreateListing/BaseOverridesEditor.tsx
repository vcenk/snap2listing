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
  IconButton,
  Tooltip,
  LinearProgress,
  Divider,
  Badge,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import {
  ListingBase,
  ChannelOverride,
  Channel,
  ValidationResult,
} from '@/lib/types/channels';
import {createValidatorForChannel } from '@/lib/validators/channel-validators';
import KeywordPanel from '@/components/CreateListing/KeywordPanel';

interface BaseOverridesEditorProps {
  baseData: ListingBase;
  channels: Channel[];
  overrides: ChannelOverride[];
  onBaseChange: (base: ListingBase) => void;
  onOverrideChange: (channelId: string, override: Partial<ChannelOverride>) => void;
  activeChannelId?: string; // for restoring last selected channel
  onActiveChannelChange?: (channelId: string | null) => void;
}

export default function BaseOverridesEditor({
  baseData,
  channels,
  overrides,
  onBaseChange,
  onOverrideChange,
  activeChannelId,
  onActiveChannelChange,
}: BaseOverridesEditorProps) {
  const initialTab = activeChannelId ? Math.max(0, 1 + channels.findIndex(c => c.id === activeChannelId)) : 0;
  const [activeTab, setActiveTab] = useState(initialTab);
  const [validationResults, setValidationResults] = useState<Record<string, ValidationResult>>({});

  const isBaseTab = activeTab === 0;
  const activeChannel = isBaseTab ? null : channels[activeTab - 1];

  // Validate all channels whenever base or overrides change
  useEffect(() => {
    const results: Record<string, ValidationResult> = {};

    channels.forEach((channel) => {
      const validator = createValidatorForChannel(channel);
      const override = overrides.find((o) => o.channelId === channel.id);
      results[channel.id] = validator.validate(baseData, override);
    });

    setValidationResults(results);
  }, [baseData, overrides, channels]);

  const handleBaseChange = (field: keyof ListingBase, value: any) => {
    onBaseChange({ ...baseData, [field]: value });
  };

  const handleOverrideChange = (field: string, value: any) => {
    if (!activeChannel) return;

    const existingOverride = overrides.find((o) => o.channelId === activeChannel.id) || {
      channelId: activeChannel.id,
      channelSlug: activeChannel.slug,
    };

    onOverrideChange(activeChannel.id, {
      ...existingOverride,
      [field]: value,
    });
  };

  const getActiveOverride = (): ChannelOverride | undefined => {
    if (!activeChannel) return undefined;
    return overrides.find((o) => o.channelId === activeChannel.id);
  };

  const getValidationBadge = (channelId: string) => {
    const result = validationResults[channelId];
    if (!result) return null;

    if (result.isReady) {
      return {
        color: 'success' as const,
        icon: <CheckCircleIcon fontSize="small" />,
        count: 0,
      };
    }

    if (result.errors.length > 0) {
      return {
        color: 'error' as const,
        icon: <ErrorIcon fontSize="small" />,
        count: result.errors.length,
      };
    }

    if (result.warnings.length > 0) {
      return {
        color: 'warning' as const,
        icon: <WarningIcon fontSize="small" />,
        count: result.warnings.length,
      };
    }

    return null;
  };

  const renderValidationAlert = () => {
    if (isBaseTab) return null;

    const result = validationResults[activeChannel!.id];
    if (!result) return null;

    if (result.isReady) {
      return (
        <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 3 }}>
          <Typography variant="body2" fontWeight={600}>
            Ready to export! (Score: {result.score}/100)
          </Typography>
        </Alert>
      );
    }

    return (
      <Box sx={{ mb: 3 }}>
        {result.errors.length > 0 && (
          <Alert severity="error" icon={<ErrorIcon />} sx={{ mb: 1 }}>
            <Typography variant="body2" fontWeight={600} gutterBottom>
              {result.errors.length} Error{result.errors.length > 1 ? 's' : ''}
            </Typography>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {result.errors.map((error, index) => (
                <li key={index}>
                  <Typography variant="caption">{error}</Typography>
                </li>
              ))}
            </ul>
          </Alert>
        )}

        {result.warnings.length > 0 && (
          <Alert severity="warning" icon={<WarningIcon />}>
            <Typography variant="body2" fontWeight={600} gutterBottom>
              {result.warnings.length} Warning{result.warnings.length > 1 ? 's' : ''}
            </Typography>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {result.warnings.map((warning, index) => (
                <li key={index}>
                  <Typography variant="caption">{warning}</Typography>
                </li>
              ))}
            </ul>
          </Alert>
        )}

        {result.score !== undefined && (
          <Box sx={{ mt: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="caption" color="text.secondary">
                Readiness Score
              </Typography>
              <Typography variant="caption" fontWeight={600}>
                {result.score}/100
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={result.score}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: 'rgba(0,0,0,0.1)',
                '& .MuiLinearProgress-bar': {
                  bgcolor:
                    result.score >= 80
                      ? 'success.main'
                      : result.score >= 60
                      ? 'warning.main'
                      : 'error.main',
                },
              }}
            />
          </Box>
        )}
      </Box>
    );
  };

  const activeOverride = getActiveOverride();

  // Channel-specific category lists
  const CATEGORY_MAP: Record<string, string[]> = {
    shopify: ['Accessories', 'Art & Collectibles', 'Home & Living', 'Jewelry', 'Clothing'],
    ebay: ['Electronics', 'Home & Garden', 'Fashion', 'Toys & Hobbies'],
    'facebook-ig': ['Apparel & Accessories', 'Jewelry & Watches', 'Beauty & Personal Care'],
    amazon: ['Home & Kitchen', 'Arts, Crafts & Sewing', 'Toys & Games'],
    etsy: ['Jewelry', 'Home & Living', 'Art & Collectibles', 'Clothing'],
    tiktok: ['Accessories', 'Beauty', 'Gadgets'],
  };

  const handleTabChange = (e: React.SyntheticEvent, v: number) => {
    setActiveTab(v);
    const ch = v > 0 ? channels[v - 1] : null;
    onActiveChannelChange?.(ch ? ch.id : null);
  };

  return (
    <Box>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
      >
        <Tab
          label="Base Content"
          icon={<InfoIcon />}
          iconPosition="start"
          sx={{ textTransform: 'none', fontWeight: 600 }}
        />
        {channels.map((channel) => {
          const badge = getValidationBadge(channel.id);
          return (
            <Tab
              key={channel.id}
              label={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <span>{channel.name}</span>
                  {badge && (
                    <Badge badgeContent={badge.count > 0 ? badge.count : null} color={badge.color}>
                      {badge.icon}
                    </Badge>
                  )}
                </Stack>
              }
              sx={{ textTransform: 'none', fontWeight: 600 }}
            />
          );
        })}
      </Tabs>

      <Paper sx={{ p: 3, minHeight: 400 }}>
        {isBaseTab ? (
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} mb={3}>
              <Typography variant="h6" fontWeight={700}>
                Base Content
              </Typography>
              <Tooltip title="Base content is shared across all channels. You can override specific fields per channel.">
                <IconButton size="small">
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>

            <Alert severity="info" sx={{ mb: 3 }}>
              This content will be used as the default for all channels. Override specific fields in
              each channel tab for platform-specific optimization.
            </Alert>

            <Stack spacing={3}>
              <TextField
                label="Title"
                fullWidth
                value={baseData.title}
                onChange={(e) => handleBaseChange('title', e.target.value)}
                helperText={`${baseData.title.length} characters`}
                required
              />

              <TextField
                label="Description"
                fullWidth
                multiline
                rows={8}
                value={baseData.description}
                onChange={(e) => handleBaseChange('description', e.target.value)}
                helperText={`${baseData.description.length} characters`}
                required
              />

              <Stack direction="row" spacing={2}>
                <TextField
                  label="Quantity"
                  type="number"
                  value={baseData.quantity || 1}
                  onChange={(e) => handleBaseChange('quantity', parseInt(e.target.value))}
                  sx={{ maxWidth: 150 }}
                />

                <TextField
                  label="SKU (Optional)"
                  value={baseData.sku || ''}
                  onChange={(e) => handleBaseChange('sku', e.target.value)}
                  sx={{ flex: 1 }}
                />
              </Stack>
            </Stack>

            <Divider sx={{ my: 3 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip label="SEO Brain" />
                <Chip label="✨ FREE (Unlimited)" size="small" color="success" />
              </Stack>
            </Divider>
            <KeywordPanel
              title={baseData.title}
              description={baseData.description}
              category={baseData.category}
              onInsertTitle={(kw) => handleBaseChange('title', `${baseData.title} ${kw}`.trim())}
              onInsertDescription={(kw) => handleBaseChange('description', `${baseData.description}\n${kw}`.trim())}
            />
          </Box>
        ) : (
          <Box>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="h6" fontWeight={700}>
                  {activeChannel?.name} Overrides
                </Typography>
                <Tooltip title="Override base content for this channel. Leave blank to use base content.">
                  <IconButton size="small">
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>

              <Stack direction="row" spacing={1}>
                {activeChannel?.validationRules.title?.maxLength && (
                  <Chip
                    label={`Max title: ${activeChannel.validationRules.title.maxLength} chars`}
                    size="small"
                    variant="outlined"
                  />
                )}
                {activeChannel?.validationRules.tags && (
                  <Chip
                    label={`Tags: ${activeChannel.validationRules.tags.min || 0}-${activeChannel.validationRules.tags.max || '∞'}`}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Stack>
            </Stack>

              {renderValidationAlert()}

              <Stack spacing={3}>
                {/* Channel Category (optional) */}
                <Box>
                  <TextField
                    label="Channel Category (optional)"
                    value={(activeOverride?.customFields as any)?.category || ''}
                    onChange={(e) => handleOverrideChange('customFields', { ...(activeOverride?.customFields || {}), category: e.target.value })}
                    placeholder={(CATEGORY_MAP as any)[activeChannel?.slug || '']?.[0] || ''}
                    fullWidth
                    helperText={`Examples: ${(CATEGORY_MAP as any)[activeChannel?.slug || '']?.join(', ') || 'General'}`}
                  />
                </Box>

                <Box>
                  <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Title Override (FREE ✨)
                    </Typography>
                  </Stack>
                  <TextField
                  label={`Title Override (${activeChannel?.validationRules.title?.maxLength ? `max ${activeChannel.validationRules.title.maxLength}` : 'unlimited'})`}
                  fullWidth
                  value={activeOverride?.title || ''}
                  onChange={(e) => handleOverrideChange('title', e.target.value)}
                  placeholder={baseData.title}
                  helperText={
                    activeOverride?.title
                      ? `${activeOverride.title.length} characters (override active) • No credits used`
                      : 'Using base title • No credits used'
                  }
                />
              </Box>

              <Box>
                  <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Description Override (FREE ✨)
                    </Typography>
                  </Stack>
                <TextField
                  label="Description Override"
                  fullWidth
                  multiline
                  rows={8}
                  value={activeOverride?.description || ''}
                  onChange={(e) => handleOverrideChange('description', e.target.value)}
                  placeholder={baseData.description}
                  helperText={
                    activeOverride?.description
                      ? `${activeOverride.description.length} characters (override active) • No credits used`
                      : 'Using base description • No credits used'
                  }
                />
              </Box>

              {activeChannel?.validationRules.tags && (
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Tags (FREE ✨)
                    </Typography>
                  </Stack>
                  <TextField
                    label={`Tags (${activeChannel.validationRules.tags.min || 0}-${activeChannel.validationRules.tags.max || '∞'} tags)`}
                    fullWidth
                    value={(activeOverride?.tags || []).join(', ')}
                    onChange={(e) =>
                      handleOverrideChange(
                        'tags',
                        e.target.value.split(',').map((t) => t.trim()).filter(Boolean)
                      )
                    }
                    placeholder="tag1, tag2, tag3"
                    helperText={`${(activeOverride?.tags || []).length} tags entered • No credits used`}
                  />
                </Box>
              )}

              {activeChannel?.validationRules.bullets && (
                <Box>
                  <Divider sx={{ my: 2 }}>
                    <Chip label="Bullet Points" />
                  </Divider>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    {activeChannel.validationRules.bullets.count
                      ? `${activeChannel.name} requires exactly ${activeChannel.validationRules.bullets.count} bullet points`
                      : `Add bullet points for ${activeChannel.name}`}
                  </Alert>
                  <Stack spacing={2}>
                    {[0, 1, 2, 3, 4].map((index) => (
                      <TextField
                        key={index}
                        label={`Bullet ${index + 1}`}
                        fullWidth
                        value={(activeOverride?.bullets || [])[index] || ''}
                        onChange={(e) => {
                          const newBullets = [...(activeOverride?.bullets || [])];
                          newBullets[index] = e.target.value;
                          handleOverrideChange('bullets', newBullets.filter(Boolean));
                        }}
                        helperText={
                          (activeOverride?.bullets || [])[index]
                            ? `${(activeOverride?.bullets || [])[index].length} characters`
                            : undefined
                        }
                      />
                    ))}
                  </Stack>
                </Box>
              )}
            </Stack>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
