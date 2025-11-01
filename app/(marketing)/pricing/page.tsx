import {
  Box,
  Container,
  Typography,
  Stack,
  Grid,
  Button,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import PricingTable from '@/components/Pricing/PricingTable';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

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
              AI-powered multi-channel listing generator for Amazon, Etsy, TikTok, Shopify, eBay, and Facebook.
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
            Out of credits? Purchase add-ons without upgrading your plan.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap" useFlexGap>
            <Chip
              label="300 Extra Credits • $10"
              size="medium"
              variant="outlined"
              sx={{ px: 2, py: 2.5, fontSize: '1rem', fontWeight: 600 }}
            />
            <Chip
              label="900 Extra Credits • $25"
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
                  Create listings for <strong>6 marketplaces simultaneously</strong>. One upload generates Amazon-optimized, Etsy-ready, and TikTok-friendly versions instantly.
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
                  ☕ Save Thousands
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.05rem' }}>
                  Professional mockups cost <strong>$25-50 each</strong>. Product videos run <strong>$100-500</strong>. Our Starter plan costs less than <strong>3 coffee cups per month</strong> and includes 33 complete listings with unlimited SEO content.
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
                  AI analyzes <strong>each marketplace's algorithm</strong> to optimize your titles, tags, and descriptions. What works on Etsy won&apos;t work on Amazon—we handle both.
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* FAQ Section */}
      <Container maxWidth="md" sx={{ py: { xs: 8, md: 12 } }}>
        <Typography variant="h2" textAlign="center" gutterBottom fontWeight={700} sx={{ mb: 6 }}>
          Frequently Asked Questions
        </Typography>

        <Stack spacing={2}>
          <Accordion sx={{ '&:before': { display: 'none' }, boxShadow: 1 }}>
            <AccordionSummary expandIcon={<ChevronDown />}>
              <Typography variant="h6" fontWeight={600}>
                Do credits roll over?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" color="text.secondary">
                Monthly plans: No. Annual plans: Up to 50% rollover (max 1 month).
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion sx={{ '&:before': { display: 'none' }, boxShadow: 1 }}>
            <AccordionSummary expandIcon={<ChevronDown />}>
              <Typography variant="h6" fontWeight={600}>
                What happens if I run out of credits?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" color="text.secondary">
                Buy overage packs ($10 = 300 credits, $25 = 900 credits) or upgrade anytime.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion sx={{ '&:before': { display: 'none' }, boxShadow: 1 }}>
            <AccordionSummary expandIcon={<ChevronDown />}>
              <Typography variant="h6" fontWeight={600}>
                Can I switch plans?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" color="text.secondary">
                Yes! Upgrade anytime. Downgrades take effect next billing cycle.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion sx={{ '&:before': { display: 'none' }, boxShadow: 1 }}>
            <AccordionSummary expandIcon={<ChevronDown />}>
              <Typography variant="h6" fontWeight={600}>
                What's included in a "complete listing"?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" color="text.secondary">
                1 product image (3 credits) + 1 mockup (3 credits) + 1 video (3 credits) + SEO content for all 6 marketplaces (FREE unlimited) = <strong>☕☕☕ 9 credits total</strong>.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion sx={{ '&:before': { display: 'none' }, boxShadow: 1 }}>
            <AccordionSummary expandIcon={<ChevronDown />}>
              <Typography variant="h6" fontWeight={600}>
                Do I own the content?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" color="text.secondary">
                Yes! Full commercial rights to all generated images, videos, and copy.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion sx={{ '&:before': { display: 'none' }, boxShadow: 1 }}>
            <AccordionSummary expandIcon={<ChevronDown />}>
              <Typography variant="h6" fontWeight={600}>
                What if the 7-day free trial isn't enough?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" color="text.secondary">
                Contact us at snap2listing@gmail.com for an extended trial if you need more time to evaluate.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion sx={{ '&:before': { display: 'none' }, boxShadow: 1 }}>
            <AccordionSummary expandIcon={<ChevronDown />}>
              <Typography variant="h6" fontWeight={600}>
                How do credit costs work?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" color="text.secondary" paragraph>
                <strong>Simplified pricing - All media costs the same:</strong>
              </Typography>
              <Typography component="ul" variant="body2" color="text.secondary" sx={{ pl: 3 }}>
                <li><strong>Image Generation:</strong> ☕ 3 credits ($0.06)</li>
                <li><strong>Video Generation (5-sec):</strong> ☕ 3 credits ($0.06)</li>
                <li><strong>Mockup Download:</strong> ☕ 3 credits ($0.06)</li>
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ mt: 2 }}>
                <strong>✨ FREE (Unlimited):</strong>
              </Typography>
              <Typography component="ul" variant="body2" color="success.dark" sx={{ pl: 3, fontWeight: 600 }}>
                <li>SEO Content for ALL Marketplaces - FREE</li>
                <li>AI Prompt Suggestions - FREE</li>
                <li>Title Generation - FREE</li>
                <li>Description Generation - FREE</li>
                <li>Tags Generation - FREE</li>
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion sx={{ '&:before': { display: 'none' }, boxShadow: 1 }}>
            <AccordionSummary expandIcon={<ChevronDown />}>
              <Typography variant="h6" fontWeight={600}>
                Which marketplaces are supported?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" color="text.secondary">
                Amazon, Etsy, TikTok Shop, Facebook Marketplace, eBay, and Shopify. Each gets optimized content specific to their algorithm and requirements.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Stack>
      </Container>

      {/* CTA */}
      <Box sx={{ py: { xs: 8, md: 12 }, textAlign: 'center' }}>
        <Container maxWidth="md">
          <Stack spacing={3} alignItems="center">
            <Typography variant="h2" fontWeight={700}>
              Ready to scale your online business?
            </Typography>
            <Typography variant="h5" color="text.secondary">
              Join hundreds of sellers creating listings across 6 marketplaces with AI
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
              Start Free 7-Day Trial
            </Button>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              ✓ No credit card required • ✓ 10 credits to try all features • ✓ Cancel anytime
            </Typography>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
