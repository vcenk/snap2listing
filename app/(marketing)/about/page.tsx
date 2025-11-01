'use client';

import { Box, Container, Typography, Stack, Paper, Grid, Card, CardContent } from '@mui/material';
import Link from 'next/link';
import { Rocket, Zap, Target, Users } from 'lucide-react';

export default function AboutPage() {
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
            About Snap2Listing
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto', mb: 4 }}>
            AI-Powered Multi-Channel Listing Generator for E-Commerce Sellers
          </Typography>
        </Box>

        {/* Our Story */}
        <Paper sx={{ p: { xs: 3, md: 5 }, mb: 6 }}>
          <Typography variant="h3" gutterBottom fontWeight={700}>
            Our Mission
          </Typography>
          <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
            Snap2Listing was created to solve a problem faced by thousands of online sellers: creating high-quality product listings across multiple marketplace platforms is time-consuming, repetitive, and requires specialized knowledge of each platform's SEO requirements.
          </Typography>
          <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
            We believe that powerful AI tools should be accessible to everyone, not just large corporations. Our mission is to empower small businesses, entrepreneurs, and print-on-demand sellers with enterprise-level listing creation capabilities, enabling them to compete effectively across Etsy, Shopify, Amazon, eBay, TikTok Shop, and more.
          </Typography>
          <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
            By automating the tedious parts of listing creation—mockup generation, image creation, SEO optimization, and channel-specific formatting—we free sellers to focus on what matters most: building their business and serving their customers.
          </Typography>
        </Paper>

        {/* Core Values */}
        <Typography variant="h3" gutterBottom fontWeight={700} sx={{ mb: 4, textAlign: 'center' }}>
          What We Stand For
        </Typography>
        <Grid container spacing={4} sx={{ mb: 8 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', borderLeft: 4, borderColor: 'primary.main' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Rocket size={32} color="#1976d2" />
                  <Typography variant="h5" fontWeight={700} sx={{ ml: 2 }}>
                    Innovation
                  </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary">
                  We leverage cutting-edge AI technology (GPT-4, FAL AI, Dynamic Mockups) to provide sellers with tools that were previously available only to large enterprises.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', borderLeft: 4, borderColor: 'secondary.main' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Zap size={32} color="#9c27b0" />
                  <Typography variant="h5" fontWeight={700} sx={{ ml: 2 }}>
                    Efficiency
                  </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary">
                  What used to take hours per listing now takes minutes. We automate repetitive tasks so sellers can focus on growing their business.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', borderLeft: 4, borderColor: 'success.main' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Target size={32} color="#2e7d32" />
                  <Typography variant="h5" fontWeight={700} sx={{ ml: 2 }}>
                    Quality
                  </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary">
                  Every listing is SEO-optimized for the specific marketplace. Our AI analyzes product images to generate accurate, compelling content that converts.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', borderLeft: 4, borderColor: 'warning.main' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Users size={32} color="#ed6c02" />
                  <Typography variant="h5" fontWeight={700} sx={{ ml: 2 }}>
                    Accessibility
                  </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary">
                  Professional listing creation tools should be accessible to everyone. We provide enterprise features at affordable pricing for small businesses.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* What We Do */}
        <Paper sx={{ p: { xs: 3, md: 5 }, mb: 6, bgcolor: 'primary.50' }}>
          <Typography variant="h3" gutterBottom fontWeight={700}>
            What We Do
          </Typography>
          <Stack spacing={2}>
            <Box>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                🎨 Product Mockup Generation
              </Typography>
              <Typography variant="body1">
                Create professional product mockups for print-on-demand items (t-shirts, mugs, posters, etc.) using Dynamic Mockups technology—no design skills required.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                🖼️ AI-Powered Image Creation
              </Typography>
              <Typography variant="body1">
                Generate lifestyle photos, background removal, and image enhancements using state-of-the-art AI models.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                📝 SEO-Optimized Content
              </Typography>
              <Typography variant="body1">
                Our AI analyzes your product images and generates channel-specific titles, descriptions, tags, key features, and materials that rank higher in search results.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                🌐 Multi-Channel Support
              </Typography>
              <Typography variant="body1">
                Create once, export everywhere. Generate platform-optimized listings for Etsy, Shopify, Amazon, eBay, TikTok Shop, Facebook Marketplace, and more.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                📦 Professional Export Packages
              </Typography>
              <Typography variant="body1">
                Download comprehensive packages with formatted Word documents, CSV files for bulk upload, high-quality images, and copy-paste content.
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* Contact */}
        <Paper sx={{ p: { xs: 3, md: 5 }, textAlign: 'center' }}>
          <Typography variant="h3" gutterBottom fontWeight={700}>
            Get in Touch
          </Typography>
          <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', mb: 3 }}>
            Have questions or feedback? We'd love to hear from you!
          </Typography>
          <Typography variant="body1" sx={{ fontSize: '1.2rem', fontWeight: 600 }}>
            📧 snap2listing@gmail.com
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
