'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Typography,
  Stack,
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StarIcon from '@mui/icons-material/Star';
import { PLANS } from '@/config/pricing';
import Link from 'next/link';

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  type: 'image' | 'video';
  currentPlan?: string;
}

export default function UpgradeModal({ open, onClose, type, currentPlan = 'free' }: UpgradeModalProps) {
  const isImage = type === 'image';
  const limitType = isImage ? 'image' : 'video';
  const currentPlanData = PLANS.find(p => p.id === currentPlan);

  // Get recommended upgrade plans (exclude current plan and free)
  const upgradePlans = PLANS.filter(p => p.id !== currentPlan && p.id !== 'free');

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        },
      }}
    >
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: 'white',
        }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent sx={{ p: 4 }}>
        <Stack spacing={3} alignItems="center" textAlign="center">
          {/* Icon */}
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
            }}
          >
            {isImage ? '🎨' : '🎬'}
          </Box>

          {/* Title */}
          <Box>
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
              {isImage ? 'Image' : 'Video'} Limit Reached
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              You&apos;ve used all {currentPlanData?.[`${limitType}s` as keyof typeof currentPlanData]} {limitType}s in your {currentPlanData?.name} plan
            </Typography>
          </Box>

          {/* Options */}
          <Typography variant="body1" sx={{ opacity: 0.95 }}>
            Choose how you&apos;d like to continue:
          </Typography>

          {/* Quick Add-on Option */}
          <Card
            sx={{
              width: '100%',
              bgcolor: 'white',
              color: 'text.primary',
              boxShadow: 3,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Quick Top-Up
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {isImage ? '20 extra images for $10' : '2 extra videos for $10'}
                  </Typography>
                </Box>
                <Button
                  component={Link}
                  href="/app/billing"
                  variant="contained"
                  size="large"
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    px: 4,
                  }}
                >
                  Buy Now
                </Button>
              </Stack>
            </CardContent>
          </Card>

          {/* Upgrade Plans */}
          <Typography variant="body1" sx={{ opacity: 0.95, mt: 2 }}>
            Or upgrade your plan for more {limitType}s every month:
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: '100%' }}>
            {upgradePlans.slice(0, 3).map((plan) => {
              const icon = plan.id === 'starter' ? <RocketLaunchIcon /> : plan.id === 'pro' ? <StarIcon /> : <TrendingUpIcon />;

              return (
                <Card
                  key={plan.id}
                  sx={{
                    flex: 1,
                    bgcolor: 'white',
                    color: 'text.primary',
                    position: 'relative',
                    border: plan.popular ? '2px solid' : 'none',
                    borderColor: plan.popular ? plan.color : 'transparent',
                  }}
                >
                  {plan.popular && (
                    <Chip
                      label="POPULAR"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: -12,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        bgcolor: plan.color,
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                      }}
                    />
                  )}
                  <CardContent sx={{ p: 2, textAlign: 'center' }}>
                    <Box sx={{ color: plan.color, mb: 1 }}>
                      {icon}
                    </Box>
                    <Typography variant="h6" gutterBottom>
                      {plan.name}
                    </Typography>
                    <Typography variant="h4" color={plan.color} gutterBottom sx={{ fontWeight: 700 }}>
                      ${plan.price}
                      <Typography component="span" variant="body2" color="text.secondary">
                        /mo
                      </Typography>
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {plan.images} images
                      <br />
                      {plan.videos} videos
                    </Typography>
                    <Button
                      component={Link}
                      href={`/pricing`}
                      variant={plan.popular ? 'contained' : 'outlined'}
                      size="small"
                      fullWidth
                      sx={{
                        ...(plan.popular && {
                          bgcolor: plan.color,
                          '&:hover': { bgcolor: plan.color, opacity: 0.9 },
                        }),
                      }}
                    >
                      Upgrade
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>

          {/* View All Plans */}
          <Button
            component={Link}
            href="/pricing"
            variant="text"
            sx={{ color: 'white', textDecoration: 'underline', mt: 2 }}
          >
            View all plans →
          </Button>

          {/* Footer */}
          <Typography variant="body2" sx={{ opacity: 0.8, mt: 2 }}>
            💡 Pro tip: Yearly plans save you 20%!
          </Typography>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
