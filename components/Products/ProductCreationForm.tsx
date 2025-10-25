'use client';

import { useState } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Paper,
  Typography,
  Stack,
  TextField,
  Grid,
  Chip,
  Card,
  CardContent,
  CardMedia,
  Alert,
  CircularProgress,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { ProductCatalog } from './ProductCatalog';
import { DesignLibrary } from '../Designs/DesignLibrary';
import { listyboxGradients } from '@/lib/theme/podTheme';
import { Design } from '@/lib/types/design';
import { ProductType } from '@/lib/types/product';
import { PRODUCT_CATALOG } from '@/lib/data/productCatalog';

interface ProductCreationFormProps {
  onComplete?: (productId: string) => void;
  onCancel?: () => void;
}

interface ProductFormData {
  productType: ProductType | null;
  design: Design | null;
  name: string;
  description: string;
  basePrice: number;
  selectedVariants: {
    colors: string[];
    sizes: string[];
  };
  mockupUrls: string[];
}

const STEPS = [
  'Select Product Type',
  'Choose Design',
  'Product Details',
  'Configure Variants',
  'Generate Mockups',
  'Review & Save',
];

export function ProductCreationForm({ onComplete, onCancel }: ProductCreationFormProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<ProductFormData>({
    productType: null,
    design: null,
    name: '',
    description: '',
    basePrice: 0,
    selectedVariants: {
      colors: [],
      sizes: [],
    },
    mockupUrls: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNext = () => {
    setError(null);
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError(null);
    setActiveStep((prev) => prev - 1);
  };

  const handleProductTypeSelect = (productType: ProductType) => {
    setFormData({
      ...formData,
      productType,
      basePrice: 0,
      name: `Custom ${productType.name}`,
      selectedVariants: {
        colors: productType.variants?.colors?.slice(0, 3) || [],
        sizes: productType.variants?.sizes?.slice(0, 4) || [],
      },
    });
    handleNext();
  };

  const handleDesignSelect = (designs: Design[]) => {
    if (designs.length > 0) {
      setFormData({
        ...formData,
        design: designs[0],
      });
      handleNext();
    }
  };

  const handleDetailsSubmit = () => {
    if (!formData.name.trim()) {
      setError('Product name is required');
      return;
    }
    handleNext();
  };

  const handleVariantToggle = (type: 'colors' | 'sizes', value: string) => {
    const current = formData.selectedVariants[type];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];

    setFormData({
      ...formData,
      selectedVariants: {
        ...formData.selectedVariants,
        [type]: updated,
      },
    });
  };

  const handleVariantsSubmit = () => {
    if (formData.selectedVariants.colors.length === 0 && formData.selectedVariants.sizes.length === 0) {
      setError('Select at least one color or size variant');
      return;
    }
    handleNext();
  };

  const handleGenerateMockups = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🎨 Generating mockups for:', {
        design: formData.design?.name,
        productType: formData.productType?.name,
        variants: formData.selectedVariants,
      });

      // Generate mockups using Dynamic Mockups API
      const response = await fetch('/api/mockups/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          designUrl: formData.design?.imageUrl,
          productType: formData.productType?.id,
          variants: formData.selectedVariants,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Mockup API error:', response.status, errorText);
        throw new Error('Failed to generate mockups');
      }

      const data = await response.json();
      console.log('✅ Mockup generation response:', data);
      console.log('📸 Mockup URLs:', data.mockupUrls);

      const newFormData = {
        ...formData,
        mockupUrls: data.mockupUrls || [],
      };

      setFormData(newFormData);
      console.log('✅ Updated form data with mockups:', newFormData.mockupUrls);

      // Don't auto-navigate - let user review mockups first
      // User will click "Continue to Review" button to proceed
    } catch (err) {
      console.error('❌ Mockup generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate mockups');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProduct = async () => {
    setLoading(true);
    setError(null);

    try {
      // Create product via API
      const response = await fetch('/api/products/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          productType: formData.productType?.id,
          designId: formData.design?.id,
          basePrice: formData.basePrice,
          variants: formData.selectedVariants,
          mockupUrls: formData.mockupUrls,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create product');
      }

      const data = await response.json();
      onComplete?.(data.product.id);
    } catch (err) {
      console.error('Product creation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0: // Select Product Type
        return (
          <Box>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Choose a Product Type
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Select the type of product you want to create
            </Typography>
            <ProductCatalog onSelectProduct={handleProductTypeSelect} />
          </Box>
        );

      case 1: // Choose Design
        return (
          <Box>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Select Your Design
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Choose a design from your library to apply to the {formData.productType?.name}
            </Typography>
            <DesignLibrary selectionMode onSelectDesigns={handleDesignSelect} />
          </Box>
        );

      case 2: // Product Details
        return (
          <Box>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Product Details
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Enter information about your product
            </Typography>

            <Stack spacing={3}>
              {/* Preview */}
              {formData.design && (
                <Paper elevation={2} sx={{ p: 2, borderRadius: 3 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4}>
                      <img
                        src={formData.design.imageUrl}
                        alt={formData.design.name}
                        style={{
                          width: '100%',
                          borderRadius: 12,
                          aspectRatio: '1',
                          objectFit: 'cover',
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={8}>
                      <Typography variant="body2" color="text.secondary">
                        Product Type
                      </Typography>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        {formData.productType?.icon} {formData.productType?.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Design
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {formData.design.name}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              )}

              {/* Form Fields */}
              <TextField
                fullWidth
                label="Product Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={`My Awesome ${formData.productType?.name}`}
                helperText="Give your product a catchy name"
              />

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your product..."
                helperText="Optional: Add a description for your product"
              />

              {error && <Alert severity="error">{error}</Alert>}

              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button onClick={handleBack} startIcon={<ArrowBackIcon />}>
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleDetailsSubmit}
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    background: listyboxGradients.purple,
                    fontWeight: 700,
                  }}
                >
                  Continue
                </Button>
              </Stack>
            </Stack>
          </Box>
        );

      case 3: // Configure Variants
        return (
          <Box>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Configure Variants
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Select the colors and sizes you want to offer
            </Typography>

            <Stack spacing={4}>
              {/* Colors */}
              {formData.productType?.variants?.colors && formData.productType.variants.colors.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Colors ({formData.selectedVariants.colors.length} selected)
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                    {formData.productType.variants.colors.map((color) => (
                      <Chip
                        key={color}
                        label={color}
                        onClick={() => handleVariantToggle('colors', color)}
                        color={formData.selectedVariants.colors.includes(color) ? 'primary' : 'default'}
                        sx={{ fontWeight: 600 }}
                      />
                    ))}
                  </Stack>
                </Box>
              )}

              {/* Sizes */}
              {formData.productType?.variants?.sizes && formData.productType.variants.sizes.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Sizes ({formData.selectedVariants.sizes.length} selected)
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                    {formData.productType.variants.sizes.map((size) => (
                      <Chip
                        key={size}
                        label={size}
                        onClick={() => handleVariantToggle('sizes', size)}
                        color={formData.selectedVariants.sizes.includes(size) ? 'primary' : 'default'}
                        sx={{ fontWeight: 600 }}
                      />
                    ))}
                  </Stack>
                </Box>
              )}

              <Divider />

              {/* Summary */}
              <Paper elevation={1} sx={{ p: 2, borderRadius: 3, bgcolor: 'action.hover' }}>
                <Typography variant="body2" fontWeight={600} gutterBottom>
                  Variant Summary
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total variants:{' '}
                  {formData.selectedVariants.colors.length * formData.selectedVariants.sizes.length ||
                   formData.selectedVariants.colors.length ||
                   formData.selectedVariants.sizes.length || 0}
                </Typography>
              </Paper>

              {error && <Alert severity="error">{error}</Alert>}

              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button onClick={handleBack} startIcon={<ArrowBackIcon />}>
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleVariantsSubmit}
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    background: listyboxGradients.blue,
                    fontWeight: 700,
                  }}
                >
                  Continue
                </Button>
              </Stack>
            </Stack>
          </Box>
        );

      case 4: // Generate Mockups
        return (
          <Box>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Generate Mockups
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Create realistic product mockups for your variants
            </Typography>

            <Stack spacing={3}>
              <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Preview Configuration
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Product
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {formData.productType?.icon} {formData.productType?.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Design
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {formData.design?.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Colors
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {formData.selectedVariants.colors.length} selected
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Sizes
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {formData.selectedVariants.sizes.length} selected
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              {error && <Alert severity="error">{error}</Alert>}

              {formData.mockupUrls.length > 0 ? (
                <Alert severity="success">
                  Successfully generated {formData.mockupUrls.length} mockup images! Click Continue to review.
                </Alert>
              ) : (
                <Alert severity="info">
                  Click Generate Mockups to create {formData.productType?.mockupTemplateCount || 6} preview images for your product.
                </Alert>
              )}

              {/* Show mockup preview after generation */}
              {formData.mockupUrls.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Generated Mockups Preview
                  </Typography>
                  <Grid container spacing={2}>
                    {formData.mockupUrls.slice(0, 3).map((url, index) => (
                      <Grid item xs={4} key={index}>
                        <Paper
                          elevation={2}
                          sx={{
                            borderRadius: 2,
                            overflow: 'hidden',
                            aspectRatio: '1',
                          }}
                        >
                          <img
                            src={url}
                            alt={`Mockup ${index + 1}`}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                  {formData.mockupUrls.length > 3 && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      + {formData.mockupUrls.length - 3} more mockups
                    </Typography>
                  )}
                </Box>
              )}

              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button onClick={handleBack} startIcon={<ArrowBackIcon />} disabled={loading}>
                  Back
                </Button>
                {formData.mockupUrls.length > 0 ? (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      background: listyboxGradients.blue,
                      fontWeight: 700,
                    }}
                  >
                    Continue to Review
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleGenerateMockups}
                    disabled={loading}
                    sx={{
                      background: listyboxGradients.green,
                      fontWeight: 700,
                    }}
                  >
                    {loading ? (
                      <>
                        <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                        Generating...
                      </>
                    ) : (
                      'Generate Mockups'
                    )}
                  </Button>
                )}
              </Stack>
            </Stack>
          </Box>
        );

      case 5: // Review & Save
        return (
          <Box>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Review & Save
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Review your product before saving
            </Typography>

            <Stack spacing={3}>
              {/* Product Summary */}
              <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    {formData.design && (
                      <img
                        src={formData.design.imageUrl}
                        alt={formData.design.name}
                        style={{
                          width: '100%',
                          borderRadius: 12,
                          aspectRatio: '1',
                          objectFit: 'cover',
                        }}
                      />
                    )}
                  </Grid>
                  <Grid item xs={12} md={8}>
                    <Typography variant="h5" fontWeight={700} gutterBottom>
                      {formData.name}
                    </Typography>
                    {formData.description && (
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {formData.description}
                      </Typography>
                    )}
                    <Stack spacing={1}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Product Type
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {formData.productType?.icon} {formData.productType?.name}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Variants
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5}>
                          {formData.selectedVariants.colors.map((color) => (
                            <Chip key={color} label={color} size="small" />
                          ))}
                          {formData.selectedVariants.sizes.map((size) => (
                            <Chip key={size} label={size} size="small" variant="outlined" />
                          ))}
                        </Stack>
                      </Box>
                    </Stack>
                  </Grid>
                </Grid>
              </Paper>

              {/* Mockup Preview */}
              {formData.mockupUrls.length > 0 ? (
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Generated Mockups ({formData.mockupUrls.length})
                  </Typography>
                  <Grid container spacing={2}>
                    {formData.mockupUrls.slice(0, 6).map((url, index) => (
                      <Grid item xs={6} sm={4} md={2} key={index}>
                        <Paper
                          elevation={2}
                          sx={{
                            borderRadius: 2,
                            overflow: 'hidden',
                            aspectRatio: '1',
                          }}
                        >
                          <img
                            src={url}
                            alt={`Mockup ${index + 1}`}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                            onError={(e) => {
                              console.error('Failed to load mockup image:', url);
                              e.currentTarget.src = 'https://via.placeholder.com/600x600/cccccc/666666?text=Failed+to+Load';
                            }}
                          />
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              ) : (
                <Alert severity="warning">
                  No mockups generated. You may need to go back to Step 5 and generate mockups.
                </Alert>
              )}

              {error && <Alert severity="error">{error}</Alert>}

              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button onClick={onCancel} disabled={loading}>
                  Cancel
                </Button>
                <Button onClick={handleBack} startIcon={<ArrowBackIcon />} disabled={loading}>
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSaveProduct}
                  disabled={loading}
                  startIcon={<CheckCircleIcon />}
                  sx={{
                    background: listyboxGradients.pink,
                    fontWeight: 700,
                  }}
                >
                  {loading ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Saving...
                    </>
                  ) : (
                    'Save Product'
                  )}
                </Button>
              </Stack>
            </Stack>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      {/* Stepper */}
      <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Step Content */}
      <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
        {renderStepContent()}
      </Paper>
    </Box>
  );
}
