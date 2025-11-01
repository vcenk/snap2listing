'use client';

import { Box, Container, Typography, Paper } from '@mui/material';
import Link from 'next/link';

export default function BlogPage() {
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

      <Container maxWidth="md" sx={{ py: 12 }}>
        <Paper
          sx={{
            p: { xs: 4, md: 8 },
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(156, 39, 176, 0.05) 100%)'
          }}
        >
          <Typography variant="h1" gutterBottom sx={{ fontSize: { xs: '3rem', md: '4rem' }, fontWeight: 800 }}>
            Blog
          </Typography>
          <Typography variant="h4" color="text.secondary" sx={{ mb: 4, fontWeight: 500 }}>
            Coming Soon
          </Typography>
          <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', maxWidth: 600, mx: 'auto' }}>
            We're currently building our blog to share tips, tutorials, and insights about e-commerce, AI-powered listing creation, SEO best practices, and marketplace strategies.
          </Typography>
          <Typography variant="body1" sx={{ fontSize: '1.1rem', maxWidth: 600, mx: 'auto', mb: 4 }}>
            Stay tuned for helpful content that will help you grow your online business!
          </Typography>
          <Box sx={{ mt: 6 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              In the meantime, check out:
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mt: 2 }}>
              <Link href="/how-it-works" style={{ textDecoration: 'none' }}>
                <Box
                  component="button"
                  sx={{
                    px: 3,
                    py: 1,
                    bgcolor: 'white',
                    color: 'primary.main',
                    border: '2px solid',
                    borderColor: 'primary.main',
                    borderRadius: 2,
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'primary.50' }
                  }}
                >
                  How It Works
                </Box>
              </Link>
              <Link href="/faq" style={{ textDecoration: 'none' }}>
                <Box
                  component="button"
                  sx={{
                    px: 3,
                    py: 1,
                    bgcolor: 'white',
                    color: 'primary.main',
                    border: '2px solid',
                    borderColor: 'primary.main',
                    borderRadius: 2,
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'primary.50' }
                  }}
                >
                  FAQ
                </Box>
              </Link>
              <Link href="/help" style={{ textDecoration: 'none' }}>
                <Box
                  component="button"
                  sx={{
                    px: 3,
                    py: 1,
                    bgcolor: 'white',
                    color: 'primary.main',
                    border: '2px solid',
                    borderColor: 'primary.main',
                    borderRadius: 2,
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'primary.50' }
                  }}
                >
                  Help Center
                </Box>
              </Link>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
