'use client';

import { Box, Container, Typography, Grid, Card, CardContent, Chip, Stack } from '@mui/material';
import Link from 'next/link';
import { Sparkles, Image, Video, FileText, Globe, Download, Zap, Target, TrendingUp } from 'lucide-react';

const features = [
  {
    icon: <Sparkles size={40} />,
    title: 'AI-Powered Mockup Generation',
    description: 'Create professional product mockups for print-on-demand items (t-shirts, mugs, posters, blankets) instantly using Dynamic Mockups technology.',
    benefits: ['No design skills required', 'Choose from 1000+ templates', 'Upload your artwork once', 'Generate multiple mockups'],
    color: '#1976d2'
  },
  {
    icon: <Image size={40} />,
    title: 'Smart Image Analysis',
    description: 'Our AI analyzes your product images to detect the product type and artwork theme, ensuring accurate, relevant content generation.',
    benefits: ['Auto-detects product type', 'Analyzes design themes', 'Suggests relevant materials', 'Product-specific features'],
    color: '#9c27b0'
  },
  {
    icon: <FileText size={40} />,
    title: 'SEO-Optimized Content',
    description: 'Generate compelling titles, descriptions, tags, key features, and materials optimized for each marketplace\'s search algorithm.',
    benefits: ['Platform-specific SEO', 'Keyword optimization', 'Compelling copy', 'Auto-populated fields'],
    color: '#2e7d32'
  },
  {
    icon: <Globe size={40} />,
    title: 'Multi-Channel Support',
    description: 'Create once, export everywhere. Support for Etsy, Shopify, Amazon, eBay, TikTok Shop, Facebook Marketplace, and more.',
    benefits: ['6+ marketplace platforms', 'Channel-specific formatting', 'Bulk export options', 'CSV generation'],
    color: '#ed6c02'
  },
  {
    icon: <Video size={40} />,
    title: 'Video Generation',
    description: 'Transform static product images into engaging videos that showcase your products from multiple angles.',
    benefits: ['Animated product videos', 'Multiple styles available', 'No video editing skills', 'Instant generation'],
    color: '#d32f2f'
  },
  {
    icon: <Download size={40} />,
    title: 'Professional Export Packages',
    description: 'Download comprehensive ZIP packages with formatted Word documents, CSV files, high-quality images, and copy-paste content.',
    benefits: ['Word document included', 'Ready-to-upload CSVs', 'All images included', 'Formatted content'],
    color: '#0288d1'
  },
  {
    icon: <Zap size={40} />,
    title: 'Instant Content Generation',
    description: 'What used to take hours now takes minutes. Generate complete listings with all required fields in seconds.',
    benefits: ['Save 90% of time', 'No manual writing', 'Batch processing', 'Fast AI models'],
    color: '#f57c00'
  },
  {
    icon: <Target size={40} />,
    title: 'Product-Specific Accuracy',
    description: 'AI generates materials and features specific to detected product types—cotton for shirts, ceramic for mugs, canvas for prints.',
    benefits: ['Accurate materials', 'Relevant features', 'Product-specific copy', 'Smart detection'],
    color: '#7b1fa2'
  },
  {
    icon: <TrendingUp size={40} />,
    title: 'SEO Score & Validation',
    description: 'Get real-time feedback on your listing quality with SEO scores and marketplace-specific validation.',
    benefits: ['SEO scoring', 'Readiness checks', 'Error detection', 'Optimization tips'],
    color: '#388e3c'
  }
];

export default function FeaturesPage() {
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
          <Chip label="AI-Powered" color="primary" sx={{ mb: 2, fontWeight: 600 }} />
          <Typography variant="h1" gutterBottom sx={{ fontSize: { xs: '2.5rem', md: '3.5rem' }, fontWeight: 800 }}>
            Powerful Features
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
            Everything you need to create professional product listings across multiple marketplaces
          </Typography>
        </Box>

        {/* Features Grid */}
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ color: feature.color }}>
                      {feature.icon}
                    </Box>
                  </Box>
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {feature.description}
                  </Typography>
                  <Stack spacing={1} sx={{ mt: 2 }}>
                    {feature.benefits.map((benefit, idx) => (
                      <Typography
                        key={idx}
                        variant="body2"
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          '&:before': {
                            content: '"✓"',
                            color: feature.color,
                            fontWeight: 700,
                            mr: 1
                          }
                        }}
                      >
                        {benefit}
                      </Typography>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* CTA Section */}
        <Box sx={{ textAlign: 'center', mt: 8, p: { xs: 3, md: 6 }, bgcolor: 'primary.50', borderRadius: 3 }}>
          <Typography variant="h3" fontWeight={700} gutterBottom>
            Ready to Get Started?
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 3 }}>
            Join thousands of sellers who are saving time and increasing sales with Snap2Listing
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Link href="/signup" style={{ textDecoration: 'none' }}>
              <Box
                component="button"
                sx={{
                  px: 4,
                  py: 1.5,
                  bgcolor: 'primary.main',
                  color: 'white',
                  border: 'none',
                  borderRadius: 2,
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'primary.dark' }
                }}
              >
                Start Free Trial
              </Box>
            </Link>
            <Link href="/pricing" style={{ textDecoration: 'none' }}>
              <Box
                component="button"
                sx={{
                  px: 4,
                  py: 1.5,
                  bgcolor: 'white',
                  color: 'primary.main',
                  border: '2px solid',
                  borderColor: 'primary.main',
                  borderRadius: 2,
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'primary.50' }
                }}
              >
                View Pricing
              </Box>
            </Link>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
