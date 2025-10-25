import {
  Box,
  Container,
  Typography,
  Stack,
  Grid,
  Button,
  Chip,
} from '@mui/material';
import PricingTable from '@/components/Pricing/PricingTable';
import Link from 'next/link';

export default function PricingPage() {
  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ bgcolor: 'background.default', py: { xs: 8, md: 12 }, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="lg">
          <Stack spacing={3} alignItems="center" textAlign="center">
            <Typography variant="h1" sx={{ fontSize: { xs: '2.5rem', md: '3.5rem' }, fontWeight: 800 }}>
              Simple, Transparent Pricing
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 700, fontSize: { xs: '1.1rem', md: '1.3rem' } }}>
              Create stunning Etsy listings with AI-powered photography and copywriting.
              <br />
              <strong>No hidden fees. Cancel anytime.</strong>
            </Typography>
          </Stack>
        </Container>
      </Box>

      {/* Pricing Cards */}
      <Container maxWidth="xl" sx={{ py: { xs: 8, md: 12 } }}>
        <PricingTable />

        {/* Overage Add-ons */}
        <Box sx={{ mt: 10, p: 4, bgcolor: 'background.paper', borderRadius: 2, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom fontWeight={700}>
            Need more? Top up anytime!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Out of images or videos? Purchase add-ons without upgrading your plan.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap" useFlexGap>
            <Chip
              label="20 Extra Images • $10"
              size="medium"
              variant="outlined"
              sx={{ px: 2, py: 2.5, fontSize: '1rem', fontWeight: 600 }}
            />
            <Chip
              label="2 Extra Videos • $10"
              size="medium"
              variant="outlined"
              sx={{ px: 2, py: 2.5, fontSize: '1rem', fontWeight: 600 }}
            />
          </Stack>
        </Box>
      </Container>

      {/* Value Proposition */}
      <Box sx={{ bgcolor: 'background.default', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Typography variant="h2" textAlign="center" gutterBottom fontWeight={700} sx={{ mb: 8 }}>
            Why Snap2Listing?
          </Typography>
          <Grid container spacing={6}>
            <Grid item xs={12} md={4}>
              <Stack spacing={2} alignItems="center" textAlign="center">
                <Box
                  sx={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.5rem',
                  }}
                >
                  ⚡
                </Box>
                <Typography variant="h4" fontWeight={700}>
                  10x Faster
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.05rem' }}>
                  Create professional listings in <strong>minutes, not hours</strong>. Skip the photoshoot, skip the writer&apos;s block. Just upload, generate, and publish.
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack spacing={2} alignItems="center" textAlign="center">
                <Box
                  sx={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    bgcolor: 'success.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.5rem',
                  }}
                >
                  💰
                </Box>
                <Typography variant="h4" fontWeight={700}>
                  Save Thousands
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.05rem' }}>
                  Professional photography costs <strong>$50-100 per product</strong>. Copywriters charge <strong>$50+ per listing</strong>. Get both for pennies.
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack spacing={2} alignItems="center" textAlign="center">
                <Box
                  sx={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    bgcolor: 'warning.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.5rem',
                  }}
                >
                  🚀
                </Box>
                <Typography variant="h4" fontWeight={700}>
                  Stand Out
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.05rem' }}>
                  AI-powered visuals and <strong>SEO-optimized copy</strong> that converts browsers into buyers. Outshine 99% of competitors.
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA */}
      <Box sx={{ py: { xs: 8, md: 12 }, textAlign: 'center' }}>
        <Container maxWidth="md">
          <Stack spacing={3} alignItems="center">
            <Typography variant="h2" fontWeight={700}>
              Ready to transform your Etsy shop?
            </Typography>
            <Typography variant="h5" color="text.secondary">
              Join hundreds of sellers creating stunning listings with AI
            </Typography>
            <Button
              component={Link}
              href="/signup"
              variant="contained"
              size="large"
              sx={{
                mt: 3,
                px: 8,
                py: 2.5,
                fontSize: '1.2rem',
                fontWeight: 700,
                borderRadius: 2,
              }}
            >
              Start Free Today
            </Button>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              ✓ No credit card required • ✓ Cancel anytime • ✓ Free forever plan available
            </Typography>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
