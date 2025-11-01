'use client';

import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Stack,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import Link from 'next/link';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import BrushIcon from '@mui/icons-material/Brush';
import VideocamIcon from '@mui/icons-material/Videocam';
import CreateIcon from '@mui/icons-material/Create';
import PublicIcon from '@mui/icons-material/Public';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

const comparisonData = [
  {
    icon: <CameraAltIcon sx={{ fontSize: 40 }} />,
    task: 'Product Photography',
    manualTime: '2-4 hours',
    manualCost: '$50-200 per product',
    manualSteps: ['Schedule photoshoot', 'Set up lighting', 'Edit in Photoshop'],
    snap2listingTime: '30 seconds',
    snap2listingCost: '3 credits',
    snap2listingSteps: ['Upload image', 'AI generates instantly'],
  },
  {
    icon: <BrushIcon sx={{ fontSize: 40 }} />,
    task: 'Mockup Creation',
    manualTime: '1-2 hours',
    manualCost: '$25-50 per mockup',
    manualSteps: ['Find templates', 'Manual placement', 'Adjust perspective'],
    snap2listingTime: '10 seconds',
    snap2listingCost: '3 credits',
    snap2listingSteps: ['Choose from 1,000+ templates', '1-click apply'],
  },
  {
    icon: <VideocamIcon sx={{ fontSize: 40 }} />,
    task: 'Video Production',
    manualTime: '3-5 hours',
    manualCost: '$100-500 per video',
    manualSteps: ['Shoot footage', 'Edit & add effects', 'Export & optimize'],
    snap2listingTime: '15 seconds',
    snap2listingCost: '3 credits',
    snap2listingSteps: ['Select image', 'AI creates 5s video'],
  },
  {
    icon: <CreateIcon sx={{ fontSize: 40 }} />,
    task: 'SEO Copywriting (All Marketplaces)',
    manualTime: '1-3 hours',
    manualCost: '$50-150 per listing',
    manualSteps: ['Keyword research', 'Write title & description', 'Optimize for SEO'],
    snap2listingTime: '20 seconds',
    snap2listingCost: 'FREE ✨ (0 credits)',
    snap2listingSteps: ['AI analyzes marketplace', 'Generates optimized copy', 'Unlimited generations'],
  },
  {
    icon: <PublicIcon sx={{ fontSize: 40 }} />,
    task: 'Multi-Marketplace Adaptation (6 platforms)',
    manualTime: '4-6 hours',
    manualCost: 'Rewrite for each',
    manualSteps: ['Different formats', 'Platform-specific rules', 'Unique keywords per platform'],
    snap2listingTime: '1 minute',
    snap2listingCost: 'FREE ✨ (0 credits)',
    snap2listingSteps: ['1-click for all 6 markets', 'Auto-optimized', 'Platform-specific SEO'],
  },
];

export default function ComparisonSection() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        {/* Section Header */}
        <Stack spacing={2} alignItems="center" textAlign="center" mb={6}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', md: '3rem' },
              fontWeight: 800,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Stop Wasting Hours on Manual Work
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 700 }}>
            See how Snap2Listing transforms a multi-day process into minutes
          </Typography>
        </Stack>

        {/* Comparison Table */}
        <Paper elevation={3} sx={{ overflow: 'hidden', mb: 6, borderRadius: 3 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell sx={{ fontWeight: 700, fontSize: '1.1rem', width: '30%' }}>
                    Task
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      bgcolor: '#fff5f5',
                      color: '#d32f2f',
                      borderLeft: '3px solid #d32f2f',
                    }}
                  >
                    ❌ Manual Method
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      bgcolor: '#f1f8f4',
                      color: '#2e7d32',
                      borderLeft: '3px solid #2e7d32',
                    }}
                  >
                    ✅ Snap2Listing
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {comparisonData.map((item, index) => (
                  <TableRow key={index} sx={{ '&:hover': { bgcolor: 'grey.50' } }}>
                    {/* Task Column */}
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{ color: 'primary.main' }}>{item.icon}</Box>
                        <Typography variant="body1" fontWeight={600}>
                          {item.task}
                        </Typography>
                      </Stack>
                    </TableCell>

                    {/* Manual Method Column */}
                    <TableCell sx={{ bgcolor: '#fafafa', borderLeft: '3px solid #d32f2f' }}>
                      <Stack spacing={1.5}>
                        <Box>
                          <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                            <AccessTimeIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                            <Typography variant="body2" fontWeight={600} color="text.secondary">
                              {item.manualTime}
                            </Typography>
                          </Stack>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <AttachMoneyIcon sx={{ fontSize: 18, color: 'error.main' }} />
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              sx={{ textDecoration: 'line-through', color: 'error.main' }}
                            >
                              {item.manualCost}
                            </Typography>
                          </Stack>
                        </Box>
                        <Box component="ul" sx={{ pl: 2, m: 0 }}>
                          {item.manualSteps.map((step, idx) => (
                            <Typography
                              component="li"
                              variant="caption"
                              key={idx}
                              color="text.secondary"
                              sx={{ mb: 0.5 }}
                            >
                              {step}
                            </Typography>
                          ))}
                        </Box>
                      </Stack>
                    </TableCell>

                    {/* Snap2Listing Column */}
                    <TableCell sx={{ bgcolor: '#f9fff9', borderLeft: '3px solid #2e7d32' }}>
                      <Stack spacing={1.5}>
                        <Box>
                          <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                            <AccessTimeIcon sx={{ fontSize: 18, color: 'success.main' }} />
                            <Typography variant="body2" fontWeight={700} color="success.main">
                              {item.snap2listingTime}
                            </Typography>
                          </Stack>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <AttachMoneyIcon sx={{ fontSize: 18, color: 'success.main' }} />
                            <Typography variant="body2" fontWeight={700} color="success.main">
                              {item.snap2listingCost}
                            </Typography>
                          </Stack>
                        </Box>
                        <Box component="ul" sx={{ pl: 2, m: 0 }}>
                          {item.snap2listingSteps.map((step, idx) => (
                            <Typography
                              component="li"
                              variant="caption"
                              key={idx}
                              color="text.secondary"
                              sx={{ mb: 0.5 }}
                            >
                              {step}
                            </Typography>
                          ))}
                        </Box>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}

                {/* Total Row */}
                <TableRow sx={{ bgcolor: 'grey.200' }}>
                  <TableCell>
                    <Typography variant="h6" fontWeight={700}>
                      TOTAL PER PRODUCT:
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ borderLeft: '3px solid #d32f2f' }}>
                    <Stack spacing={0.5}>
                      <Typography variant="h6" fontWeight={700} color="error.main">
                        11-20 HOURS
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        sx={{ textDecoration: 'line-through', color: 'error.main' }}
                      >
                        $225-1,000
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Across multiple days
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ borderLeft: '3px solid #2e7d32' }}>
                    <Stack spacing={0.5}>
                      <Typography variant="h6" fontWeight={700} color="success.main">
                        3 MINUTES
                      </Typography>
                      <Typography variant="h6" fontWeight={700} color="success.main">
                        9 credits
                      </Typography>
                      <Typography variant="caption" color="success.main" fontWeight={600}>
                        Same day • SEO content FREE
                      </Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          {/* Savings Badges */}
          <Box sx={{ p: 2, bgcolor: 'success.main', textAlign: 'center' }}>
            <Stack direction="row" spacing={3} justifyContent="center" flexWrap="wrap" useFlexGap>
              <Chip
                icon={<TrendingUpIcon />}
                label="⚡ 400x faster"
                sx={{
                  bgcolor: 'white',
                  color: 'success.main',
                  fontWeight: 700,
                  fontSize: '1rem',
                  px: 2,
                  py: 2.5,
                }}
              />
              <Chip
                icon={<AttachMoneyIcon />}
                label="💰 Save 99.9% cost"
                sx={{
                  bgcolor: 'white',
                  color: 'success.main',
                  fontWeight: 700,
                  fontSize: '1rem',
                  px: 2,
                  py: 2.5,
                }}
              />
              <Chip
                label="✨ Unlimited SEO content"
                sx={{
                  bgcolor: 'white',
                  color: 'success.main',
                  fontWeight: 700,
                  fontSize: '1rem',
                  px: 2,
                  py: 2.5,
                }}
              />
            </Stack>
          </Box>
        </Paper>

        {/* Coffee Cup Breakdown Callout */}
        <Paper
          elevation={4}
          sx={{
            p: 4,
            mb: 4,
            background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
            color: 'white',
            borderRadius: 3,
            border: '3px solid #FFB74D',
          }}
        >
          <Typography
            variant="h4"
            gutterBottom
            fontWeight={800}
            textAlign="center"
            sx={{ textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}
          >
            ☕ THE COFFEE CUP BREAKDOWN ☕
          </Typography>
          <Typography variant="h6" textAlign="center" mb={3} sx={{ opacity: 0.95 }}>
            Our Starter plan costs less than 3 coffee cups per month
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', bgcolor: 'rgba(255,255,255,0.95)' }}>
                <CardContent>
                  <Typography variant="h5" gutterBottom fontWeight={700} color="primary">
                    💰 What You Get for $19/mo:
                  </Typography>
                  <Stack spacing={2} mt={2}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CheckCircleIcon sx={{ color: 'success.main' }} />
                      <Typography variant="body1">
                        <strong>300 credits</strong> = 100 images, videos, or mockups
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CheckCircleIcon sx={{ color: 'success.main' }} />
                      <Typography variant="body1">
                        <strong>33 complete listings</strong> (image + mockup + video)
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CheckCircleIcon sx={{ color: 'success.main' }} />
                      <Typography variant="body1">
                        <strong>Unlimited SEO content</strong> for all marketplaces
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CheckCircleIcon sx={{ color: 'success.main' }} />
                      <Typography variant="body1">
                        <strong>Unlimited AI prompts</strong> and title generation
                      </Typography>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', bgcolor: 'rgba(255,255,255,0.95)' }}>
                <CardContent>
                  <Typography variant="h5" gutterBottom fontWeight={700} color="primary">
                    ☕ The Coffee Comparison:
                  </Typography>
                  <Stack spacing={2} mt={2}>
                    <Box>
                      <Typography variant="h3" fontWeight={800} color="warning.main">
                        ☕☕☕
                      </Typography>
                      <Typography variant="body2" color="text.secondary" mt={1}>
                        3 Starbucks lattes = $19
                      </Typography>
                    </Box>
                    <Divider />
                    <Typography variant="body1" fontWeight={600}>
                      For the price of <strong>3 coffee cups</strong>, you get:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • 33 complete product listings<br />
                      • Worth $7,425-33,000 if done manually<br />
                      • Saves you 363-660 hours of work<br />
                      • All text content completely FREE
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Typography
            variant="h5"
            textAlign="center"
            mt={4}
            fontWeight={700}
            sx={{ textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}
          >
            Skip the coffee. Build your empire. ☕ → 💰
          </Typography>
        </Paper>

        {/* Real-World Example Box */}
        <Paper
          elevation={4}
          sx={{
            p: 4,
            mb: 4,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 3,
          }}
        >
          <Typography variant="h5" gutterBottom fontWeight={700} textAlign="center" mb={3}>
            📊 Real-World Example: Launching 20 New Products
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', bgcolor: 'rgba(255,255,255,0.95)' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight={700} color="error.main">
                    Traditional Way:
                  </Typography>
                  <Stack spacing={1.5} mt={2}>
                    <Stack direction="row" spacing={1}>
                      <CloseIcon sx={{ color: 'error.main' }} />
                      <Typography variant="body1">
                        <strong>⏰ 220-400 hours</strong> of work
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      <CloseIcon sx={{ color: 'error.main' }} />
                      <Typography variant="body1">
                        <strong>💸 $4,500-20,000</strong> in costs
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      <CloseIcon sx={{ color: 'error.main' }} />
                      <Typography variant="body1">
                        <strong>📅 Weeks</strong> to complete
                      </Typography>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', bgcolor: 'rgba(255,255,255,0.95)' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight={700} color="success.main">
                    With Snap2Listing:
                  </Typography>
                  <Stack spacing={1.5} mt={2}>
                    <Stack direction="row" spacing={1}>
                      <CheckCircleIcon sx={{ color: 'success.main' }} />
                      <Typography variant="body1">
                        <strong>⏰ 60 minutes</strong> total
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      <CheckCircleIcon sx={{ color: 'success.main' }} />
                      <Typography variant="body1">
                        <strong>180 credits</strong> (60% of Starter plan)
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      <CheckCircleIcon sx={{ color: 'success.main' }} />
                      <Typography variant="body1">
                        <strong>📅 Same afternoon</strong>
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      <CheckCircleIcon sx={{ color: 'success.main' }} />
                      <Typography variant="body1">
                        <strong>✨ SEO content: FREE</strong> (unlimited)
                      </Typography>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Typography
            variant="h4"
            textAlign="center"
            mt={4}
            fontWeight={700}
            sx={{ textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}
          >
            Savings: 99.7% less time • 99.9% less cost • $19/mo total
          </Typography>
        </Paper>

        {/* Hidden Costs Callout */}
        <Paper elevation={2} sx={{ p: 4, mb: 4, bgcolor: '#fff9e6', borderRadius: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight={700} color="warning.dark">
            💡 Manual workflow hidden costs you don't see:
          </Typography>
          <Grid container spacing={2} mt={1}>
            <Grid item xs={12} md={6}>
              <Stack spacing={1.5}>
                <Stack direction="row" spacing={1}>
                  <CloseIcon sx={{ color: 'error.main', fontSize: 20 }} />
                  <Typography variant="body2">
                    Studio rental or equipment <strong>($200-500/day)</strong>
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1}>
                  <CloseIcon sx={{ color: 'error.main', fontSize: 20 }} />
                  <Typography variant="body2">
                    Software subscriptions <strong>(Photoshop, editors: $50-100/mo)</strong>
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1}>
                  <CloseIcon sx={{ color: 'error.main', fontSize: 20 }} />
                  <Typography variant="body2">
                    Hiring freelancers <strong>(delays, revisions, communication)</strong>
                  </Typography>
                </Stack>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack spacing={1.5}>
                <Stack direction="row" spacing={1}>
                  <CloseIcon sx={{ color: 'error.main', fontSize: 20 }} />
                  <Typography variant="body2">
                    Learning curve <strong>(SEO research, marketplace rules)</strong>
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1}>
                  <CloseIcon sx={{ color: 'error.main', fontSize: 20 }} />
                  <Typography variant="body2">
                    Opportunity cost <strong>(time NOT spent growing your business)</strong>
                  </Typography>
                </Stack>
                <Divider sx={{ my: 1 }} />
                <Stack direction="row" spacing={1}>
                  <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
                  <Typography variant="body2" fontWeight={700} color="success.main">
                    ✅ Snap2Listing includes everything in one tool
                  </Typography>
                </Stack>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {/* CTA Button */}
        <Box textAlign="center">
          <Button
            component={Link}
            href="/signup"
            variant="contained"
            size="large"
            sx={{
              px: 6,
              py: 2.5,
              fontSize: '1.2rem',
              fontWeight: 700,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                boxShadow: '0 12px 32px rgba(102, 126, 234, 0.6)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Start Saving Time & Money Today
          </Button>
          <Typography variant="body2" color="text.secondary" mt={2}>
            ✓ No credit card required • ✓ 15 credits free • ✓ 7-day trial
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
