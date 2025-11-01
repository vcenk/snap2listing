'use client';

import { Box, Container, Typography, Grid, Card, CardContent, CardActionArea } from '@mui/material';
import Link from 'next/link';
import { Book, MessageCircle, FileText, Video, Zap, HelpCircle } from 'lucide-react';

const helpCategories = [
  {
    icon: <Zap size={40} />,
    title: 'Getting Started',
    description: 'New to Snap2Listing? Learn the basics and create your first listing',
    topics: [
      'Creating your first listing',
      'Understanding product types',
      'Selecting marketplaces',
      'Navigating the interface'
    ],
    color: '#1976d2'
  },
  {
    icon: <FileText size={40} />,
    title: 'Print-on-Demand Guide',
    description: 'Learn how to create POD listings with product mockups',
    topics: [
      'Uploading artwork',
      'Selecting mockup templates',
      'Understanding the POD workflow',
      'Product-specific features'
    ],
    color: '#9c27b0'
  },
  {
    icon: <Book size={40} />,
    title: 'AI Content Generation',
    description: 'Understand how our AI creates optimized listing content',
    topics: [
      'How AI analyzes images',
      'SEO optimization explained',
      'Editing AI-generated content',
      'Channel-specific content'
    ],
    color: '#2e7d32'
  },
  {
    icon: <Video size={40} />,
    title: 'Export & Publishing',
    description: 'Learn how to export and upload your listings',
    topics: [
      'Downloading ZIP packages',
      'Using CSV bulk upload',
      'Word document format',
      'Uploading to marketplaces'
    ],
    color: '#ed6c02'
  },
  {
    icon: <HelpCircle size={40} />,
    title: 'Troubleshooting',
    description: 'Common issues and how to resolve them',
    topics: [
      'Image upload problems',
      'AI generation errors',
      'Export issues',
      'Account & billing'
    ],
    color: '#d32f2f'
  },
  {
    icon: <MessageCircle size={40} />,
    title: 'FAQ',
    description: 'Quick answers to frequently asked questions',
    topics: [
      'Pricing & plans',
      'Feature limitations',
      'Marketplace support',
      'Technical requirements'
    ],
    color: '#0288d1'
  }
];

export default function HelpCenterPage() {
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
            Help Center
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
            Find guides, tutorials, and answers to help you get the most out of Snap2Listing
          </Typography>
        </Box>

        {/* Help Categories */}
        <Grid container spacing={4}>
          {helpCategories.map((category, index) => (
            <Grid item xs={12} md={6} key={index}>
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
                <CardActionArea sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ color: category.color }}>
                        {category.icon}
                      </Box>
                      <Typography variant="h5" fontWeight={700} sx={{ ml: 2 }}>
                        {category.title}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {category.description}
                    </Typography>
                    <Box component="ul" sx={{ pl: 3, mt: 2, mb: 0 }}>
                      {category.topics.map((topic, idx) => (
                        <Typography component="li" variant="body2" key={idx} sx={{ mb: 0.5 }}>
                          {topic}
                        </Typography>
                      ))}
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Quick Links */}
        <Box sx={{ mt: 8, p: 4, bgcolor: 'primary.50', borderRadius: 3 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom textAlign="center">
            Popular Resources
          </Typography>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardActionArea component={Link} href="/how-it-works">
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="h6" fontWeight={700}>
                      How It Works
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Step-by-step guide
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardActionArea component={Link} href="/faq">
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="h6" fontWeight={700}>
                      FAQ
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Common questions
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardActionArea component={Link} href="/features">
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="h6" fontWeight={700}>
                      Features
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      What we offer
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardActionArea component={Link} href="/contact">
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="h6" fontWeight={700}>
                      Contact Us
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Get support
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Contact Support */}
        <Box sx={{ mt: 6, p: 4, bgcolor: 'white', border: 1, borderColor: 'divider', borderRadius: 3, textAlign: 'center' }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Can't find what you're looking for?
          </Typography>
          <Typography variant="body1" paragraph>
            Our support team is here to help!
          </Typography>
          <Link href="/contact" style={{ textDecoration: 'none' }}>
            <Box
              component="button"
              sx={{
                px: 4,
                py: 1.5,
                mt: 1,
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
              Contact Support
            </Box>
          </Link>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            📧 snap2listing@gmail.com
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
