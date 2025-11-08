'use client';

import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Typography,
  Stack,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { useState } from 'react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { PLANS } from '@/config/pricing';
import Link from 'next/link';

interface PricingTableProps {
  onSelectPlan?: (planId: string, isYearly: boolean) => void;
  showYearlyToggle?: boolean;
}

export default function PricingTable({ onSelectPlan, showYearlyToggle = true }: PricingTableProps) {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <Box>
      {/* Yearly Toggle */}
      {showYearlyToggle && (
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" mb={6}>
          <Typography variant="body1" color={!isYearly ? 'primary' : 'text.secondary'} fontWeight={!isYearly ? 600 : 400}>
            Monthly
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={isYearly}
                onChange={(e) => setIsYearly(e.target.checked)}
                color="primary"
              />
            }
            label=""
          />
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body1" color={isYearly ? 'primary' : 'text.secondary'} fontWeight={isYearly ? 600 : 400}>
              Yearly
            </Typography>
            <Chip
              label="Save 20%"
              size="small"
              color="success"
              sx={{ height: 22, fontSize: '0.75rem', fontWeight: 600 }}
            />
          </Stack>
        </Stack>
      )}

      {/* Pricing Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            lg: 'repeat(4, 1fr)',
          },
          gap: 3,
          alignItems: 'stretch',
        }}
      >
        {PLANS.filter(plan => plan.id !== 'free').map((plan) => (
          <Card
            key={plan.id}
            sx={{
              position: 'relative',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              border: plan.popular ? `3px solid ${plan.color}` : '1px solid',
              borderColor: plan.popular ? plan.color : 'divider',
              transform: plan.popular ? 'scale(1.04)' : 'scale(1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: 6,
              },
            }}
          >
            {plan.popular && (
              <Chip
                label="MOST POPULAR"
                size="small"
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  bgcolor: plan.color,
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                }}
              />
            )}

            <CardContent sx={{ flexGrow: 1, p: 3, pt: plan.popular ? 5 : 3 }}>
              <Stack spacing={2.5}>
                {/* Icon & Name */}
                <Box>
                  <Typography variant="h2" sx={{ fontSize: '2.5rem', mb: 1 }}>
                    {plan.icon}
                  </Typography>
                  <Typography variant="h4" gutterBottom fontWeight={700}>
                    {plan.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {plan.tagline}
                  </Typography>
                </Box>

                {/* Pricing */}
                <Box>
                  <Stack direction="row" alignItems="baseline" spacing={0.5}>
                    <Typography variant="h2" component="span" fontWeight={800}>
                      ${isYearly ? Math.floor(plan.yearlyPrice / 12) : plan.price}
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                      /mo
                    </Typography>
                  </Stack>
                  {isYearly && plan.price > 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Billed ${plan.yearlyPrice}/year
                    </Typography>
                  )}
                </Box>

                {/* Features */}
                <List dense sx={{ pt: 1 }}>
                  {plan.features.map((feature, index) => (
                    <ListItem key={index} sx={{ px: 0, py: 0.5, alignItems: 'flex-start' }}>
                      <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}>
                        <CheckCircleIcon sx={{ fontSize: 18, color: plan.color }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={feature}
                        primaryTypographyProps={{
                          variant: 'body2',
                          sx: {
                            fontWeight: feature.includes('Unlimited') || feature.includes('✨') || feature.includes('FREE') || feature.includes('Everything in') ? 700 : 400,
                            fontSize: '0.9rem',
                            lineHeight: 1.5,
                            color: feature.includes('✨') || feature.includes('FREE') ? 'success.main' : 'text.primary',
                          },
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Stack>
            </CardContent>

            <CardActions sx={{ p: 3, pt: 0 }}>
              <Button
                component={Link}
                href={
                  plan.price === 0
                    ? '/signup'
                    : onSelectPlan
                    ? '#'
                    : `/checkout?plan=${plan.id}&billing=${isYearly ? 'yearly' : 'monthly'}`
                }
                onClick={() => onSelectPlan && onSelectPlan(plan.id, isYearly)}
                variant={plan.popular ? 'contained' : 'outlined'}
                fullWidth
                size="large"
                sx={{
                  py: 1.5,
                  fontWeight: 700,
                  fontSize: '1rem',
                  ...(plan.popular && {
                    bgcolor: plan.color,
                    '&:hover': {
                      bgcolor: plan.color,
                      opacity: 0.9,
                    },
                  }),
                }}
              >
                {plan.price === 0 ? 'Start Free' : plan.popular ? 'Get Started' : 'Choose Plan'}
              </Button>
            </CardActions>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
