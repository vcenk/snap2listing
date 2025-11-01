'use client';

import { Box, Container, Typography, Stack, Paper, Grid, TextField, Button, Card, CardContent } from '@mui/material';
import Link from 'next/link';
import { Mail, MessageCircle, HelpCircle } from 'lucide-react';

export default function ContactPage() {
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
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h1" gutterBottom sx={{ fontSize: { xs: '2.5rem', md: '3.5rem' }, fontWeight: 800 }}>
            Contact Us
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
            Have questions? We're here to help!
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Contact Options */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Mail size={28} color="#1976d2" />
                    <Typography variant="h6" fontWeight={700} sx={{ ml: 2 }}>
                      Email Support
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    For general inquiries, support questions, or feedback:
                  </Typography>
                  <Typography variant="body1" fontWeight={600} color="primary.main">
                    snap2listing@gmail.com
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                    We typically respond within 24-48 hours
                  </Typography>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <HelpCircle size={28} color="#9c27b0" />
                    <Typography variant="h6" fontWeight={700} sx={{ ml: 2 }}>
                      Help Center
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Browse our documentation and guides
                  </Typography>
                  <Button
                    component={Link}
                    href="/help"
                    variant="outlined"
                    fullWidth
                  >
                    Visit Help Center
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <MessageCircle size={28} color="#2e7d32" />
                    <Typography variant="h6" fontWeight={700} sx={{ ml: 2 }}>
                      FAQ
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Find quick answers to common questions
                  </Typography>
                  <Button
                    component={Link}
                    href="/faq"
                    variant="outlined"
                    fullWidth
                  >
                    View FAQ
                  </Button>
                </CardContent>
              </Card>
            </Stack>
          </Grid>

          {/* Contact Form */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: { xs: 3, md: 4 } }}>
              <Typography variant="h4" gutterBottom fontWeight={700}>
                Send us a message
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Fill out the form below and we'll get back to you as soon as possible.
              </Typography>

              <Box component="form" sx={{ mt: 3 }}>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Name"
                    required
                    variant="outlined"
                  />
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    required
                    variant="outlined"
                  />
                  <TextField
                    fullWidth
                    label="Subject"
                    required
                    variant="outlined"
                  />
                  <TextField
                    fullWidth
                    label="Message"
                    required
                    multiline
                    rows={6}
                    variant="outlined"
                  />
                  <Box sx={{ textAlign: 'center' }}>
                    <Button
                      variant="contained"
                      size="large"
                      sx={{ px: 6, py: 1.5, textTransform: 'none', fontWeight: 600 }}
                      onClick={() => {
                        const email = 'snap2listing@gmail.com';
                        window.location.href = `mailto:${email}`;
                      }}
                    >
                      Send via Email
                    </Button>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 2 }}>
                      This will open your default email client
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Additional Info */}
        <Paper sx={{ p: { xs: 3, md: 4 }, mt: 6, bgcolor: 'info.50' }}>
          <Typography variant="h5" gutterBottom fontWeight={700}>
            What to include in your message
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" component="ul" sx={{ pl: 3 }}>
                <li>Your account email (if applicable)</li>
                <li>Detailed description of your issue or question</li>
                <li>Steps you've already tried (for support issues)</li>
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" component="ul" sx={{ pl: 3 }}>
                <li>Screenshots (if relevant)</li>
                <li>Error messages you encountered</li>
                <li>Your browser and operating system</li>
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
}
