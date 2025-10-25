'use client';

import { Box, Container, Typography, Stack, Paper } from '@mui/material';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
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

      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper sx={{ p: { xs: 3, md: 5 } }}>
          <Typography variant="h2" gutterBottom>
            Privacy Policy
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
            Last Updated: January 2025
          </Typography>

          <Stack spacing={4}>
            <Box>
              <Typography variant="h4" gutterBottom>
                1. Introduction
              </Typography>
              <Typography variant="body1" paragraph>
                Snap2Listing (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h4" gutterBottom>
                2. Information We Collect
              </Typography>
              <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
                Personal Information
              </Typography>
              <Typography variant="body1" paragraph>
                We collect information you provide directly to us, including:
              </Typography>
              <Typography variant="body1" component="ul" sx={{ pl: 4 }}>
                <li>Name and email address (for account creation)</li>
                <li>Payment information (processed securely through Stripe)</li>
                <li>Etsy shop information (when you connect your shop)</li>
                <li>Product images and listing details you upload</li>
              </Typography>

              <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
                Usage Information
              </Typography>
              <Typography variant="body1" component="ul" sx={{ pl: 4 }}>
                <li>Log data (IP address, browser type, pages visited)</li>
                <li>Usage statistics (images generated, videos created)</li>
                <li>Device information</li>
              </Typography>
            </Box>

            <Box>
              <Typography variant="h4" gutterBottom>
                3. How We Use Your Information
              </Typography>
              <Typography variant="body1" paragraph>
                We use the information we collect to:
              </Typography>
              <Typography variant="body1" component="ul" sx={{ pl: 4 }}>
                <li>Provide, maintain, and improve our services</li>
                <li>Process your payments and manage subscriptions</li>
                <li>Generate AI-powered images and videos for your listings</li>
                <li>Publish listings to your Etsy shop (with your permission)</li>
                <li>Send you service-related communications</li>
                <li>Respond to your requests and support inquiries</li>
                <li>Analyze usage patterns to improve our service</li>
              </Typography>
            </Box>

            <Box>
              <Typography variant="h4" gutterBottom>
                4. Third-Party Services
              </Typography>
              <Typography variant="body1" paragraph>
                We use the following third-party services:
              </Typography>
              <Typography variant="body1" component="ul" sx={{ pl: 4 }}>
                <li><strong>Stripe:</strong> Payment processing (subject to Stripe&apos;s Privacy Policy)</li>
                <li><strong>Etsy API:</strong> Publishing listings to your shop (subject to Etsy&apos;s Privacy Policy)</li>
                <li><strong>Supabase:</strong> Database and authentication services</li>
                <li><strong>Replicate AI:</strong> Image and video generation</li>
                <li><strong>Claude API:</strong> Text generation and SEO optimization</li>
              </Typography>
            </Box>

            <Box>
              <Typography variant="h4" gutterBottom>
                5. Data Storage and Security
              </Typography>
              <Typography variant="body1" paragraph>
                We implement industry-standard security measures to protect your data. Your information is stored securely using encryption and access controls. However, no method of transmission over the internet is 100% secure.
              </Typography>
              <Typography variant="body1" paragraph>
                Your uploaded images and generated content are stored securely and used solely for providing our services.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h4" gutterBottom>
                6. Data Retention
              </Typography>
              <Typography variant="body1" paragraph>
                We retain your personal information for as long as your account is active or as needed to provide services. You may delete your account at any time, which will remove your personal data within 30 days.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h4" gutterBottom>
                7. Your Rights
              </Typography>
              <Typography variant="body1" paragraph>
                You have the right to:
              </Typography>
              <Typography variant="body1" component="ul" sx={{ pl: 4 }}>
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Export your data</li>
                <li>Opt out of marketing communications</li>
              </Typography>
            </Box>

            <Box>
              <Typography variant="h4" gutterBottom>
                8. Cookies
              </Typography>
              <Typography variant="body1" paragraph>
                We use cookies and similar tracking technologies to track activity on our service and store certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h4" gutterBottom>
                9. Children&apos;s Privacy
              </Typography>
              <Typography variant="body1" paragraph>
                Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13. If you become aware that a child has provided us with personal data, please contact us.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h4" gutterBottom>
                10. Changes to This Policy
              </Typography>
              <Typography variant="body1" paragraph>
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last Updated&quot; date.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h4" gutterBottom>
                11. Contact Us
              </Typography>
              <Typography variant="body1" paragraph>
                If you have questions about this Privacy Policy, please contact us at:
              </Typography>
              <Typography variant="body1">
                Email: privacy@snap2listing.com
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
