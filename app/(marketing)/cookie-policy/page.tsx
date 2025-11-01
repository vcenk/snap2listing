'use client';

import { Box, Container, Typography, Stack, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import Link from 'next/link';

export default function CookiePolicyPage() {
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
            Cookie Policy
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
            Last Updated: January 2025
          </Typography>

          <Stack spacing={4}>
            <Box>
              <Typography variant="h4" gutterBottom>
                1. What Are Cookies
              </Typography>
              <Typography variant="body1" paragraph>
                Cookies are small text files that are stored on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and understanding how you use our service.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h4" gutterBottom>
                2. How We Use Cookies
              </Typography>
              <Typography variant="body1" paragraph>
                Snap2Listing uses cookies for the following purposes:
              </Typography>
              <Typography variant="body1" component="ul" sx={{ pl: 4 }}>
                <li><strong>Essential Cookies:</strong> Necessary for the website to function properly (authentication, security)</li>
                <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how you use our service to improve it</li>
                <li><strong>Performance Cookies:</strong> Monitor and improve service performance</li>
              </Typography>
            </Box>

            <Box>
              <Typography variant="h4" gutterBottom>
                3. Types of Cookies We Use
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Cookie Type</strong></TableCell>
                      <TableCell><strong>Purpose</strong></TableCell>
                      <TableCell><strong>Duration</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Authentication</TableCell>
                      <TableCell>Keep you logged in to your account</TableCell>
                      <TableCell>Session/Persistent</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Preferences</TableCell>
                      <TableCell>Remember your settings and choices</TableCell>
                      <TableCell>Persistent (1 year)</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Analytics</TableCell>
                      <TableCell>Track usage patterns and improve service</TableCell>
                      <TableCell>Persistent (2 years)</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Security</TableCell>
                      <TableCell>Protect against fraud and abuse</TableCell>
                      <TableCell>Session</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            <Box>
              <Typography variant="h4" gutterBottom>
                4. Third-Party Cookies
              </Typography>
              <Typography variant="body1" paragraph>
                We may use third-party services that set cookies on your device:
              </Typography>
              <Typography variant="body1" component="ul" sx={{ pl: 4 }}>
                <li><strong>Supabase:</strong> Authentication and database services</li>
                <li><strong>Stripe:</strong> Payment processing (if you make a purchase)</li>
                <li><strong>Analytics Services:</strong> Usage analytics and service improvement</li>
              </Typography>
              <Typography variant="body1" paragraph>
                These third parties have their own privacy policies governing their use of cookies.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h4" gutterBottom>
                5. Managing Cookies
              </Typography>
              <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
                Browser Settings
              </Typography>
              <Typography variant="body1" paragraph>
                Most web browsers allow you to control cookies through their settings. You can:
              </Typography>
              <Typography variant="body1" component="ul" sx={{ pl: 4 }}>
                <li>View and delete cookies</li>
                <li>Block all cookies</li>
                <li>Allow only first-party cookies</li>
                <li>Clear cookies when you close your browser</li>
              </Typography>

              <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
                Impact of Disabling Cookies
              </Typography>
              <Typography variant="body1" paragraph>
                Please note that if you disable cookies, some features of our service may not function properly:
              </Typography>
              <Typography variant="body1" component="ul" sx={{ pl: 4 }}>
                <li>You may not be able to stay logged in</li>
                <li>Your preferences may not be saved</li>
                <li>Some features may not be available</li>
              </Typography>
            </Box>

            <Box>
              <Typography variant="h4" gutterBottom>
                6. Session Storage and Local Storage
              </Typography>
              <Typography variant="body1" paragraph>
                In addition to cookies, we may use browser storage technologies like Session Storage and Local Storage to:
              </Typography>
              <Typography variant="body1" component="ul" sx={{ pl: 4 }}>
                <li>Store your authentication tokens securely</li>
                <li>Cache data for better performance</li>
                <li>Remember your workflow progress (e.g., draft listings)</li>
                <li>Store temporary data for the current session</li>
              </Typography>
              <Typography variant="body1" paragraph>
                This data is stored locally on your device and is not transmitted to our servers unless necessary for the service to function.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h4" gutterBottom>
                7. Do Not Track Signals
              </Typography>
              <Typography variant="body1" paragraph>
                Some browsers include a "Do Not Track" (DNT) feature that signals to websites that you do not want your online activities tracked. Currently, there is no universal standard for how to respond to DNT signals, so our website does not respond to DNT signals at this time.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h4" gutterBottom>
                8. Updates to This Policy
              </Typography>
              <Typography variant="body1" paragraph>
                We may update this Cookie Policy from time to time to reflect changes in our practices or for legal requirements. We will notify you of any significant changes by posting the updated policy on this page with a new "Last Updated" date.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h4" gutterBottom>
                9. Contact Us
              </Typography>
              <Typography variant="body1" paragraph>
                If you have questions about our use of cookies, please contact us at:
              </Typography>
              <Typography variant="body1">
                Email: snap2listing@gmail.com
              </Typography>
            </Box>

            <Box sx={{ mt: 4, pt: 4, borderTop: '1px solid', borderColor: 'divider' }}>
              <Typography variant="body2" color="text.secondary">
                By continuing to use Snap2Listing, you consent to our use of cookies as described in this Cookie Policy.
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
