'use client';

import { useState } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Alert,
  Paper,
  Stack,
  Divider,
  Card,
  CardContent,
  Grid,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ImageIcon from '@mui/icons-material/Image';
import CreateIcon from '@mui/icons-material/Create';
import CategoryIcon from '@mui/icons-material/Category';
import { motion } from 'framer-motion';
import MockupEditor from './MockupEditor';
import MockupEditorFullPage from './MockupEditorFullPage';
import ProductTypeSelector from './ProductTypeSelector';
import { PodDashboard } from '@/components/Dashboard/PodDashboard';
import { ProductCatalog } from '@/components/Products/ProductCatalog';
import { ProductType } from '@/lib/data/productCatalog';
import { useAuth } from '@/lib/auth/context';

type WorkflowStep = 'dashboard' | 'product-type' | 'mockup' | 'listing';

interface Collection {
  uuid: string;
  name: string;
  mockup_count: number;
  created_at: string;
}

interface PodWorkflowProps {
  onBack?: () => void;
}

export default function PodWorkflow({ onBack }: PodWorkflowProps) {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState<WorkflowStep>('dashboard');
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [selectedProductType, setSelectedProductType] = useState<ProductType | null>(null);
  const [mockupUrls, setMockupUrls] = useState<string[]>([]);
  const [mockupEditorOpen, setMockupEditorOpen] = useState(false);
  const [listingId] = useState(() => `pod_${Date.now()}`);

  const steps = [
    {
      key: 'product-type' as const,
      label: 'Select Product',
      icon: <CategoryIcon />,
      description: 'Choose product type for mockups',
    },
    {
      key: 'mockup' as const,
      label: 'Generate Mockup',
      icon: <ImageIcon />,
      description: 'Create product mockups in the editor',
    },
    {
      key: 'listing' as const,
      label: 'Create Listing',
      icon: <CreateIcon />,
      description: 'Optimize for marketplaces',
    },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === activeStep);

  const handleProductTypeSelect = (collection: Collection) => {
    console.log('📦 Collection selected:', collection);
    setSelectedCollection(collection);
    setActiveStep('mockup');
  };

  const handleProductCatalogSelect = (productType: ProductType) => {
    console.log('🎨 Product type selected:', productType);
    setSelectedProductType(productType);
    setActiveStep('product-type');
  };

  const handleGenerateMockup = () => {
    setMockupEditorOpen(true);
  };

  const handleMockupsGenerated = (urls: string[]) => {
    setMockupUrls(urls);
    setActiveStep('listing');
  };

  const handleBackFromMockup = () => {
    setActiveStep('product-type');
    setSelectedCollection(null);
  };

  const handleBackStep = () => {
    if (activeStep === 'listing') {
      setActiveStep('mockup');
    } else if (activeStep === 'mockup') {
      setActiveStep('product-type');
      setSelectedCollection(null);
    } else if (activeStep === 'product-type') {
      setActiveStep('dashboard');
    }
  };

  const handleBackToDashboard = () => {
    setActiveStep('dashboard');
    setSelectedCollection(null);
    setSelectedProductType(null);
  };

  // If in dashboard step, show full dashboard
  if (activeStep === 'dashboard') {
    return (
      <PodDashboard
        onCreateProduct={() => setActiveStep('product-type')}
        onImportDesigns={() => console.log('Import designs clicked')}
        onViewAnalytics={() => console.log('View analytics clicked')}
        stats={{
          totalProducts: mockupUrls.length,
          designs: 0,
          published: 0,
          revenue: '$0',
        }}
      />
    );
  }

  // If in mockup step with selected collection, show full-page editor
  if (activeStep === 'mockup' && selectedCollection) {
    return (
      <MockupEditorFullPage
        collectionUUID={selectedCollection.uuid}
        collectionName={selectedCollection.name}
        onBack={handleBackFromMockup}
        onMockupsGenerated={handleMockupsGenerated}
        userId={user?.id || 'guest'}
        listingId={listingId}
      />
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', py: 4 }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #4facfe15 0%, #00f2fe15 100%)',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          {onBack && (
            <IconButton onClick={onBack} sx={{ bgcolor: 'background.paper' }}>
              <ArrowBackIcon />
            </IconButton>
          )}
          <Box flex={1}>
            <Typography variant="h4" fontWeight={800}>
              Create Print-on-Demand Listing
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {steps[currentStepIndex].description}
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Progress Stepper */}
      <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Stepper activeStep={currentStepIndex} alternativeLabel>
          {steps.map((step, index) => (
            <Step key={step.key}>
              <StepLabel
                StepIconComponent={() => (
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor:
                        index <= currentStepIndex
                          ? 'primary.main'
                          : 'background.default',
                      color: index <= currentStepIndex ? 'white' : 'text.secondary',
                      border: 2,
                      borderColor: index <= currentStepIndex ? 'primary.main' : 'divider',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {step.icon}
                  </Box>
                )}
              >
                <Typography variant="body2" fontWeight={600} sx={{ mt: 1 }}>
                  {step.label}
                </Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Step Content */}
      <Paper
        component={motion.div}
        key={activeStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        elevation={2}
        sx={{ p: 4, borderRadius: 3, minHeight: 500 }}
      >
        {/* Step 1: Product Type Selection */}
        {activeStep === 'product-type' && (
          <Box>
            <Typography
              variant="h4"
              fontWeight={800}
              gutterBottom
              sx={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Choose Product Type
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Select the type of product you want to create mockups for. Each product type has its own collection of templates.
            </Typography>

            <ProductTypeSelector onSelect={handleProductTypeSelect} />
          </Box>
        )}

        {/* Step 2: Mockup Generation (shown if no collection selected) */}
        {activeStep === 'mockup' && !selectedCollection && (
          <Box>
            <Typography
              variant="h4"
              fontWeight={800}
              gutterBottom
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Generate Product Mockups
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Create professional product mockups using the Dynamic Mockups editor.
              You can upload your artwork, select products, and customize everything directly in the editor.
            </Typography>

            <Card sx={{ mb: 3, borderRadius: 3, bgcolor: 'background.default' }}>
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <ImageIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  Ready to Create Mockups?
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
                  The Dynamic Mockups editor includes:
                </Typography>
                <Grid container spacing={2} sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ textAlign: 'left' }}>
                      ✓ Artwork upload & editor
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ textAlign: 'left' }}>
                      ✓ Product template library
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ textAlign: 'left' }}>
                      ✓ Color customization
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ textAlign: 'left' }}>
                      ✓ Transform controls
                    </Typography>
                  </Grid>
                </Grid>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleGenerateMockup}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    fontWeight: 700,
                    py: 1.5,
                    px: 4,
                  }}
                >
                  Open Mockup Editor
                </Button>
              </CardContent>
            </Card>

            {mockupUrls.length > 0 && (
              <Alert
                severity="success"
                sx={{ borderRadius: 2 }}
                action={
                  <Button
                    color="inherit"
                    size="small"
                    onClick={() => setActiveStep('listing')}
                  >
                    Continue →
                  </Button>
                }
              >
                <Typography variant="body2" fontWeight={600}>
                  {mockupUrls.length} mockup(s) generated successfully!
                </Typography>
                <Typography variant="caption">
                  Ready to create your marketplace listing
                </Typography>
              </Alert>
            )}
          </Box>
        )}

        {/* Step 3: Listing Creation */}
        {activeStep === 'listing' && (
          <Box>
            <Typography
              variant="h4"
              fontWeight={800}
              gutterBottom
              sx={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Create Marketplace Listing
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Your mockups are ready! Listing generation is coming soon.
            </Typography>

            <Card sx={{ mb: 3, borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Generated Mockups ({mockupUrls.length})
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  {mockupUrls.map((url, index) => (
                    <Grid item xs={6} sm={4} md={3} key={index}>
                      <Box
                        sx={{
                          position: 'relative',
                          width: '100%',
                          paddingBottom: '100%',
                          borderRadius: 2,
                          overflow: 'hidden',
                          border: '2px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <img
                          src={url}
                          alt={`Mockup ${index + 1}`}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>

            <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
              <Typography variant="body2" fontWeight={600} gutterBottom>
                Coming Soon: AI-Powered Listing Generation
              </Typography>
              <Typography variant="body2">
                Automatically create optimized titles, descriptions, and tags for each
                marketplace based on your mockups.
              </Typography>
            </Alert>

            <Button
              variant="contained"
              size="large"
              fullWidth
              disabled
              sx={{ py: 1.5 }}
            >
              Generate Listing (Coming Soon)
            </Button>
          </Box>
        )}

        {/* Navigation */}
        {activeStep === 'listing' && (
          <>
            <Divider sx={{ my: 3 }} />
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={handleBackStep}
              size="large"
            >
              Back to Mockups
            </Button>
          </>
        )}
      </Paper>

      {/* Mockup Editor Dialog */}
      <MockupEditor
        open={mockupEditorOpen}
        onClose={() => setMockupEditorOpen(false)}
        onMockupsGenerated={handleMockupsGenerated}
        userId={user?.id || 'guest'}
        listingId={listingId}
      />
    </Box>
  );
}
