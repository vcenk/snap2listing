'use client';

import { Box, Container, Typography, Stack, Paper, Grid, Card, CardContent, Stepper, Step, StepLabel, StepContent, Chip } from '@mui/material';
import Link from 'next/link';

const steps = [
  {
    label: 'Choose Product Type',
    description: 'Select whether you\'re creating a physical product, digital download, or print-on-demand listing.',
    details: [
      'Physical products: Upload images of your existing products',
      'Digital products: Upload file previews or mockups',
      'Print-on-Demand: Create product mockups with your artwork'
    ]
  },
  {
    label: 'Select Marketplaces',
    description: 'Choose which platforms you want to create listings for (Etsy, Shopify, Amazon, eBay, TikTok Shop, Facebook).',
    details: [
      'Select one or multiple channels',
      'Each channel gets optimized content',
      'Platform-specific SEO and formatting'
    ]
  },
  {
    label: 'Generate Mockups/Images',
    description: 'For POD: Upload your artwork and select product templates. For others: Upload product photos.',
    details: [
      'POD: Choose from 1000+ mockup templates',
      'Physical/Digital: Upload your product images',
      'AI can enhance and optimize images',
      'Optional: Generate lifestyle photos'
    ]
  },
  {
    label: 'AI Content Generation',
    description: 'Our AI analyzes your images and generates SEO-optimized titles, descriptions, tags, features, and materials.',
    details: [
      'Detects product type from images',
      'Analyzes artwork and design themes',
      'Generates channel-specific content',
      'Populates all required fields automatically'
    ]
  },
  {
    label: 'Review & Customize',
    description: 'Review the AI-generated content and make any desired edits. Navigation tabs let you easily jump between sections.',
    details: [
      'View all generated content',
      'Edit titles, descriptions, tags',
      'Customize for each channel',
      'See SEO scores and validation'
    ]
  },
  {
    label: 'Export & Publish',
    description: 'Download professional export packages or publish directly to your connected marketplaces.',
    details: [
      'ZIP packages with Word docs + CSVs',
      'All images in high quality',
      'Copy-paste ready content',
      'Bulk upload compatible formats'
    ]
  }
];

const productTypeWorkflows = [
  {
    type: 'Print-on-Demand (POD)',
    icon: '👕',
    steps: 'Mockups → Details → Video → Review',
    description: 'Perfect for sellers creating custom t-shirts, mugs, posters, blankets, and other POD items'
  },
  {
    type: 'Physical Products',
    icon: '📦',
    steps: 'Upload → Details → Images → Video → Review',
    description: 'For sellers with inventory-based products that they ship themselves'
  },
  {
    type: 'Digital Downloads',
    icon: '💾',
    steps: 'Upload → Images → Video → Details → Review',
    description: 'For sellers offering printables, templates, graphics, or digital files'
  }
];

export default function HowItWorksPage() {
  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          bgcolor: 'white',
          borderBottom: '1px solid',
          borderColor: 'divider',
          py: 2,
        }}
      >
        <Container maxWidth="lg">
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
              Snap2Listing
            </Typography>
          </Link>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        {/* Hero Section */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h1" gutterBottom sx={{ fontSize: { xs: '2.5rem', md: '3.5rem' }, fontWeight: 800 }}>
            How It Works
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
            Create professional multi-channel listings in 6 simple steps
          </Typography>
        </Box>

        {/* Product Type Workflows */}
        <Paper sx={{ p: 4, mb: 6, bgcolor: 'info.50' }}>
          <Typography variant="h4" gutterBottom fontWeight={700} textAlign="center" sx={{ mb: 4 }}>
            Workflows for Different Product Types
          </Typography>
          <Grid container spacing={3}>
            {productTypeWorkflows.map((workflow, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h3" textAlign="center" sx={{ mb: 1 }}>
                      {workflow.icon}
                    </Typography>
                    <Typography variant="h6" fontWeight={700} textAlign="center" gutterBottom>
                      {workflow.type}
                    </Typography>
                    <Chip
                      label={workflow.steps}
                      size="small"
                      sx={{ width: '100%', mb: 2 }}
                      color="primary"
                      variant="outlined"
                    />
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                      {workflow.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Main Steps */}
        <Typography variant="h4" gutterBottom fontWeight={700} sx={{ mb: 4 }}>
          Step-by-Step Process
        </Typography>
        <Stepper orientation="vertical">
          {steps.map((step, index) => (
            <Step key={index} active>
              <StepLabel
                StepIconProps={{
                  sx: {
                    '&.Mui-active': { color: 'primary.main' },
                    fontSize: '2rem'
                  }
                }}
              >
                <Typography variant="h5" fontWeight={700}>
                  {step.label}
                </Typography>
              </StepLabel>
              <StepContent>
                <Typography variant="body1" paragraph>
                  {step.description}
                </Typography>
                <Box component="ul" sx={{ pl: 3, m: 0 }}>
                  {step.details.map((detail, idx) => (
                    <Typography component="li" variant="body2" color="text.secondary" key={idx} sx={{ mb: 0.5 }}>
                      {detail}
                    </Typography>
                  ))}
                </Box>
                <Box sx={{ mb: 2 }} />
              </StepContent>
            </Step>
          ))}
        </Stepper>

        {/* Key Benefits */}
        <Paper sx={{ p: 4, mt: 6, bgcolor: 'success.50' }}>
          <Typography variant="h4" gutterBottom fontWeight={700}>
            Why Snap2Listing?
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    ⚡ Save Time
                  </Typography>
                  <Typography variant="body2">
                    What used to take hours now takes minutes. Create complete listings with all fields populated automatically.
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    🎯 Better SEO
                  </Typography>
                  <Typography variant="body2">
                    AI-optimized content for each marketplace platform means better search rankings and more visibility.
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    🌐 Multi-Channel
                  </Typography>
                  <Typography variant="body2">
                    Create once, export everywhere. Support for 6+ major marketplace platforms with channel-specific formatting.
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    🎨 Professional Quality
                  </Typography>
                  <Typography variant="body2">
                    Generate professional mockups and images without any design skills. 1000+ templates available.
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    📦 Complete Packages
                  </Typography>
                  <Typography variant="body2">
                    Download ZIP files with formatted Word docs, CSV files, images, and copy-paste content—everything you need.
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    🤖 Smart AI
                  </Typography>
                  <Typography variant="body2">
                    Our AI analyzes your product images to generate accurate, relevant content specific to your product type.
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {/* CTA */}
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Ready to streamline your listing process?
          </Typography>
          <Link href="/signup" style={{ textDecoration: 'none' }}>
            <Box
              component="button"
              sx={{
                px: 6,
                py: 2,
                mt: 2,
                bgcolor: 'primary.main',
                color: 'white',
                border: 'none',
                borderRadius: 2,
                fontSize: '1.1rem',
                fontWeight: 600,
                cursor: 'pointer',
                '&:hover': { bgcolor: 'primary.dark' }
              }}
            >
              Get Started Now
            </Box>
          </Link>
        </Box>
      </Container>
    </Box>
  );
}
