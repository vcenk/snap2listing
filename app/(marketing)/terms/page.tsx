'use client';

import { Box, Container, Typography, Stack, Paper } from '@mui/material';
import Link from 'next/link';

export default function TermsOfServicePage() {
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
            Terms of Service
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
            Last Updated: January 2025
          </Typography>

          <Stack spacing={4}>
            <Box>
              <Typography variant="h4" gutterBottom>
                1. Acceptance of Terms
              </Typography>
              <Typography variant="body1" paragraph>
                By accessing and using Snap2Listing (&quot;Service&quot;), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Service.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h4" gutterBottom>
                2. Description of Service
              </Typography>
              <Typography variant="body1" paragraph>
                Snap2Listing is an AI-powered platform that helps Etsy sellers create professional product listings, including:
              </Typography>
              <Typography variant="body1" component="ul" sx={{ pl: 4 }}>
                <li>AI-generated product images</li>
                <li>AI-generated product videos</li>
                <li>SEO-optimized titles, tags, and descriptions</li>
                <li>Direct publishing to Etsy shops</li>
              </Typography>
            </Box>

            <Box>
              <Typography variant="h4" gutterBottom>
                3. User Accounts
              </Typography>
              <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
                Registration
              </Typography>
              <Typography variant="body1" paragraph>
                You must create an account to use our Service. You agree to:
              </Typography>
              <Typography variant="body1" component="ul" sx={{ pl: 4 }}>
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Be responsible for all activities under your account</li>
              </Typography>

              <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
                Eligibility
              </Typography>
              <Typography variant="body1" paragraph>
                You must be at least 18 years old to use our Service. By using our Service, you represent that you meet this requirement.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h4" gutterBottom>
                4. Pricing and Payments
              </Typography>
              <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
                Subscription Plans
              </Typography>
              <Typography variant="body1" paragraph>
                We offer various subscription plans with different usage limits. Pricing is displayed on our pricing page and may change with notice.
              </Typography>

              <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
                Billing
              </Typography>
              <Typography variant="body1" component="ul" sx={{ pl: 4 }}>
                <li>Subscriptions are billed monthly or yearly in advance</li>
                <li>Payments are processed securely through Stripe</li>
                <li>You authorize us to charge your payment method automatically</li>
                <li>Failed payments may result in service suspension</li>
              </Typography>

              <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
                Refunds
              </Typography>
              <Typography variant="body1" paragraph>
                Subscription fees are non-refundable except as required by law. You may cancel your subscription at any time, effective at the end of your current billing period.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h4" gutterBottom>
                5. Usage Limits
              </Typography>
              <Typography variant="body1" paragraph>
                Each subscription plan includes specific usage limits for:
              </Typography>
              <Typography variant="body1" component="ul" sx={{ pl: 4 }}>
                <li>Number of images generated per month</li>
                <li>Number of videos created per month</li>
                <li>Number of connected Etsy shops</li>
              </Typography>
              <Typography variant="body1" paragraph>
                Exceeding these limits requires upgrading your plan or purchasing add-ons.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h4" gutterBottom>
                6. Content and Intellectual Property
              </Typography>
              <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
                Your Content
              </Typography>
              <Typography variant="body1" paragraph>
                You retain ownership of content you upload. By using our Service, you grant us a license to:
              </Typography>
              <Typography variant="body1" component="ul" sx={{ pl: 4 }}>
                <li>Process your images to generate new content</li>
                <li>Store your content on our servers</li>
                <li>Display your content back to you</li>
                <li>Publish to Etsy on your behalf (with your explicit permission)</li>
              </Typography>

              <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
                Generated Content
              </Typography>
              <Typography variant="body1" paragraph>
                AI-generated images and text created through our Service belong to you. You are responsible for ensuring generated content complies with Etsy&apos;s policies and applicable laws.
              </Typography>

              <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
                Our Content
              </Typography>
              <Typography variant="body1" paragraph>
                The Service itself, including our software, design, and branding, is owned by Snap2Listing and protected by copyright and other intellectual property laws.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h4" gutterBottom>
                7. Acceptable Use
              </Typography>
              <Typography variant="body1" paragraph>
                You agree NOT to:
              </Typography>
              <Typography variant="body1" component="ul" sx={{ pl: 4 }}>
                <li>Use the Service for any illegal or unauthorized purpose</li>
                <li>Generate content that violates Etsy&apos;s policies</li>
                <li>Upload images you don&apos;t have rights to use</li>
                <li>Attempt to reverse engineer or copy our Service</li>
                <li>Share your account credentials with others</li>
                <li>Use automated tools to abuse the Service</li>
                <li>Generate offensive, harmful, or misleading content</li>
              </Typography>
            </Box>

            <Box>
              <Typography variant="h4" gutterBottom>
                8. Etsy Integration
              </Typography>
              <Typography variant="body1" paragraph>
                Our Service integrates with Etsy&apos;s API. By connecting your Etsy shop:
              </Typography>
              <Typography variant="body1" component="ul" sx={{ pl: 4 }}>
                <li>You authorize us to publish listings on your behalf</li>
                <li>You remain responsible for all listings published to Etsy</li>
                <li>You must comply with all Etsy policies and terms</li>
                <li>We are not liable for issues with Etsy&apos;s platform</li>
              </Typography>
            </Box>

            <Box>
              <Typography variant="h4" gutterBottom>
                9. AI-Generated Content Disclaimer
              </Typography>
              <Typography variant="body1" paragraph>
                AI-generated content may not always be perfect. You are responsible for:
              </Typography>
              <Typography variant="body1" component="ul" sx={{ pl: 4 }}>
                <li>Reviewing all generated content before publishing</li>
                <li>Ensuring accuracy of product descriptions and pricing</li>
                <li>Verifying images accurately represent your products</li>
                <li>Compliance with all applicable laws and regulations</li>
              </Typography>
            </Box>

            <Box>
              <Typography variant="h4" gutterBottom>
                10. Service Availability
              </Typography>
              <Typography variant="body1" paragraph>
                We strive to provide reliable service but do not guarantee:
              </Typography>
              <Typography variant="body1" component="ul" sx={{ pl: 4 }}>
                <li>Uninterrupted or error-free operation</li>
                <li>That defects will be corrected immediately</li>
                <li>Specific response times for support</li>
              </Typography>
              <Typography variant="body1" paragraph>
                We may modify, suspend, or discontinue the Service at any time with reasonable notice.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h4" gutterBottom>
                11. Limitation of Liability
              </Typography>
              <Typography variant="body1" paragraph>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW:
              </Typography>
              <Typography variant="body1" component="ul" sx={{ pl: 4 }}>
                <li>We are not liable for any indirect, incidental, or consequential damages</li>
                <li>Our total liability is limited to the amount you paid in the last 12 months</li>
                <li>We are not responsible for loss of profits, sales, or business opportunities</li>
              </Typography>
            </Box>

            <Box>
              <Typography variant="h4" gutterBottom>
                12. Indemnification
              </Typography>
              <Typography variant="body1" paragraph>
                You agree to indemnify and hold harmless Snap2Listing from any claims, damages, or expenses arising from:
              </Typography>
              <Typography variant="body1" component="ul" sx={{ pl: 4 }}>
                <li>Your use of the Service</li>
                <li>Content you upload or generate</li>
                <li>Violation of these Terms</li>
                <li>Infringement of third-party rights</li>
              </Typography>
            </Box>

            <Box>
              <Typography variant="h4" gutterBottom>
                13. Termination
              </Typography>
              <Typography variant="body1" paragraph>
                Either party may terminate your account at any time:
              </Typography>
              <Typography variant="body1" component="ul" sx={{ pl: 4 }}>
                <li>You may cancel your subscription from your account settings</li>
                <li>We may suspend or terminate accounts that violate these Terms</li>
                <li>Upon termination, your access to the Service will end</li>
                <li>You remain liable for any outstanding payments</li>
              </Typography>
            </Box>

            <Box>
              <Typography variant="h4" gutterBottom>
                14. Changes to Terms
              </Typography>
              <Typography variant="body1" paragraph>
                We may update these Terms from time to time. We will notify you of material changes via email or service notification. Continued use after changes constitutes acceptance of the new Terms.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h4" gutterBottom>
                15. Governing Law
              </Typography>
              <Typography variant="body1" paragraph>
                These Terms are governed by the laws of [Your Jurisdiction], without regard to conflict of law principles. Any disputes shall be resolved in the courts of [Your Jurisdiction].
              </Typography>
            </Box>

            <Box>
              <Typography variant="h4" gutterBottom>
                16. Contact Information
              </Typography>
              <Typography variant="body1" paragraph>
                For questions about these Terms, please contact us at:
              </Typography>
              <Typography variant="body1">
                Email: support@snap2listing.com
              </Typography>
            </Box>

            <Box sx={{ mt: 4, pt: 4, borderTop: '1px solid', borderColor: 'divider' }}>
              <Typography variant="body2" color="text.secondary">
                By using Snap2Listing, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
