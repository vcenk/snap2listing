'use client';

import {
  Box,
  Paper,
  Typography,
  Stack,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Button,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import UploadIcon from '@mui/icons-material/Upload';
import CategoryIcon from '@mui/icons-material/Category';
import ImageIcon from '@mui/icons-material/Image';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { motion } from 'framer-motion';

interface PodWorkflowPlaceholderProps {
  onBack: () => void;
}

export default function PodWorkflowPlaceholder({ onBack }: PodWorkflowPlaceholderProps) {
  const steps = [
    {
      label: 'Upload Design',
      icon: <UploadIcon />,
      description: 'Upload your artwork or design',
    },
    {
      label: 'Select Product',
      icon: <CategoryIcon />,
      description: 'Choose base product (t-shirt, mug, poster, etc.)',
    },
    {
      label: 'Generate Mockup',
      icon: <ImageIcon />,
      description: 'Create realistic product mockups with Dynamic Mockups API',
    },
    {
      label: 'Create Listing',
      icon: <ListAltIcon />,
      description: 'Generate optimized listings for your channels',
    },
  ];

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', py: 4 }}>
      <Stack spacing={4}>
        {/* Header */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          sx={{ textAlign: 'center' }}
        >
          <Box
            sx={{
              width: 100,
              height: 100,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
              boxShadow: '0 10px 30px rgba(79, 172, 254, 0.3)',
            }}
          >
            <PrintIcon sx={{ fontSize: 60, color: 'white' }} />
          </Box>
          <Typography variant="h3" fontWeight={800} gutterBottom>
            Print-on-Demand Listing Creator
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Create stunning mockups and listings for your PoD products
          </Typography>
        </Box>

        {/* Coming Soon Alert */}
        <Alert
          severity="info"
          sx={{
            background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
            border: '2px solid #667eea40',
            borderRadius: 3,
            py: 2,
          }}
        >
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Coming in Phase 3: Dynamic Mockups Integration
          </Typography>
          <Typography variant="body1">
            The PoD workflow is currently under development. It will integrate with the Dynamic
            Mockups API to automatically generate professional product mockups for t-shirts, mugs,
            posters, phone cases, and more.
          </Typography>
        </Alert>

        {/* Workflow Preview */}
        <Paper sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Planned Workflow
          </Typography>
          <Divider sx={{ my: 3 }} />

          <Stepper activeStep={-1} orientation="vertical">
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel
                  StepIconComponent={() => (
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                      }}
                    >
                      {step.icon}
                    </Box>
                  )}
                >
                  <Typography variant="h6" fontWeight={600}>
                    {step.label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {step.description}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* Features Preview */}
        <Box>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Planned Features
          </Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mt: 3 }}>
            <Card
              component={motion.div}
              whileHover={{ y: -8 }}
              sx={{ flex: 1, borderRadius: 3 }}
            >
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Dynamic Mockups API
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Integration with professional mockup generation service for realistic product
                  visualizations
                </Typography>
              </CardContent>
            </Card>

            <Card
              component={motion.div}
              whileHover={{ y: -8 }}
              sx={{ flex: 1, borderRadius: 3 }}
            >
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Multiple Product Types
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Support for t-shirts, hoodies, mugs, posters, phone cases, tote bags, and more
                </Typography>
              </CardContent>
            </Card>

            <Card
              component={motion.div}
              whileHover={{ y: -8 }}
              sx={{ flex: 1, borderRadius: 3 }}
            >
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  AI-Optimized Listings
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Automatically generate SEO-optimized titles, descriptions, and tags for each
                  marketplace
                </Typography>
              </CardContent>
            </Card>
          </Stack>
        </Box>

        {/* Back Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', pt: 2 }}>
          <Button onClick={onBack} size="large" variant="outlined">
            ← Back to Product Type Selection
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
