'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Stack,
  Typography,
  Paper,
  Card,
  alpha,
  LinearProgress,
  Chip,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/lib/contexts/ToastContext';
import DetailsStep from './DetailsStep';
import ImagesStep from './ImagesStep';
import VideoStep from './VideoStep';
import ReviewStep from './ReviewStep';
import { ListingDraft, GeneratedImage, GeneratedVideo, WizardStep } from '@/lib/types';
import { ListingData } from '@/lib/types/channels';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const steps = [
  { label: 'Details', description: 'Edit title & description' },
  { label: 'Images', description: 'Manage AI images' },
  { label: 'Video', description: 'Manage video (optional)' },
  { label: 'Review', description: 'Review & save changes' },
];

interface EditListingWizardProps {
  initialData: any;
  isEditMode: boolean;
}

export default function EditListingWizard({ initialData, isEditMode }: EditListingWizardProps) {
  const router = useRouter();
  const toast = useToast();
  const [activeStep, setActiveStep] = useState<WizardStep>(1);

  // Resume from lastStep
  useEffect(() => {
    const last = (initialData?.lastStep as string) || '';
    const map: Record<string, number> = {
      'Upload': 1, // start at Details for edit flow
      'Details': 1,
      'Optimize': 1,
      'Images': 2,
      'Video': 3,
      'Review': 4,
    };
    const s = map[last];
    if (s) setActiveStep(s as WizardStep);
  }, [initialData?.lastStep]);

  const [draft, setDraft] = useState<ListingDraft>({
    currentStep: 1,
    uploadedImage: initialData?.base?.originalImage || initialData?.base?.images?.[0],
    uploadedImageName: initialData?.base?.title,
    shortDescription: initialData?.base?.description?.substring(0, 100),
    taxonomy_id: undefined,
    category_path: initialData?.base?.category,
    price: initialData?.base?.price,
    title: initialData?.base?.title,
    description: initialData?.base?.description,
    tags: (initialData?.channels?.[0]?.tags as string[]) || [],
    quantity: initialData?.base?.quantity,
    materials: initialData?.base?.materials,
    occasion: undefined,
    holiday: undefined,
    recipient: undefined,
    style: undefined,
    item_type: 'physical',
    who_made: 'i_did',
    what_is_it: 'finished_product',
    when_made: '2020_2025',
    is_customizable: false,
    personalization_instructions: undefined,
    personalization_char_limit: undefined,
    processing_min: 1,
    processing_max: 3,
    images: initialData?.base?.images,
    video: initialData?.base?.video,
  });

  const handleDetailsComplete = (data: any) => {
    setDraft({
      ...draft,
      ...data,
      currentStep: 2,
    });
    setActiveStep(2);
  };

  const handleImagesComplete = (images: GeneratedImage[]) => {
    setDraft({
      ...draft,
      images,
      currentStep: 3,
    });
    setActiveStep(3);
  };

  const handleVideoComplete = (video?: GeneratedVideo) => {
    setDraft({
      ...draft,
      video,
      currentStep: 4,
    });
    setActiveStep(4);
  };

  const handleSaveChanges = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error('You must be logged in to save changes');
        router.push('/login');
        return;
      }

      // Build payload for new multi-channel save API
      const listingData: Partial<ListingData> = {
        id: initialData.id,
        userId: user.id,
        status: initialData.status,
        base: {
          ...initialData.base,
          title: draft.title!,
          description: draft.description!,
          price: draft.price!,
          category: draft.category_path || initialData.base?.category || '',
          images: draft.images || initialData.base?.images || [],
          video: (draft as any).video || initialData.base?.video,
          originalImage: draft.uploadedImage || initialData.base?.originalImage,
          quantity: draft.quantity ?? initialData.base?.quantity ?? 1,
          materials: draft.materials ?? initialData.base?.materials,
        },
        channels: initialData.channels || [],
        seoScore: initialData.seoScore || 0,
        lastStep: steps[activeStep - 1].label,
        lastChannelTab: initialData.lastChannelTab,
        scrollPosition: Math.round(window.scrollY || 0),
      };

      const response = await fetch('/api/listings/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(listingData),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.error || 'Failed to update listing');
      }

      const { listing } = await response.json();
      console.log('Listing updated:', listing);

      toast.success('Listing updated successfully!');
      router.push('/app/listings');
    } catch (error) {
      console.error('Error updating listing:', error);
      toast.error('Failed to update listing. Please try again.');
    }
  };

  const progressPercentage = ((activeStep - 1) / (steps.length - 1)) * 100;

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      {/* Modern Header Card */}
      <Card
        sx={{
          mb: 4,
          background: `linear-gradient(135deg, ${alpha('#FF9800', 0.1)} 0%, ${alpha('#F44336', 0.1)} 100%)`,
          border: 'none',
          boxShadow: 3,
        }}
      >
        <Box sx={{ p: 4 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Box>
              <Stack direction="row" alignItems="center" spacing={2} mb={1}>
                <Typography variant="h2" sx={{ fontWeight: 700 }}>
                  Edit Listing
                </Typography>
                <Chip
                  label={`Step ${activeStep} of ${steps.length}`}
                  color="warning"
                  sx={{ fontWeight: 600 }}
                />
                <Chip
                  label={initialData.status}
                  size="small"
                  color={initialData.status === 'published' ? 'success' : 'default'}
                />
              </Stack>
              <Typography variant="body1" color="text.secondary">
                {steps[activeStep - 1].description}
              </Typography>
            </Box>
            <Button
              onClick={() => router.push('/app/listings')}
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              sx={{
                borderRadius: 2,
                px: 3,
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Back to Listings
            </Button>
          </Stack>

          {/* Progress Bar */}
          <Box sx={{ mt: 3 }}>
            <LinearProgress
              variant="determinate"
              value={progressPercentage}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: alpha('#000', 0.1),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  background: 'linear-gradient(90deg, #FF9800 0%, #F44336 100%)',
                },
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {Math.round(progressPercentage)}% Complete
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* Modern Stepper */}
      <Paper sx={{ p: 3, mb: 4, boxShadow: 2 }}>
        <Stepper
          activeStep={activeStep - 1}
          sx={{
            '& .MuiStepLabel-root .Mui-completed': {
              color: 'success.main',
            },
            '& .MuiStepLabel-root .Mui-active': {
              color: 'warning.main',
              fontWeight: 700,
            },
          }}
        >
          {steps.map((step, index) => (
            <Step key={step.label} completed={index < activeStep - 1}>
              <StepLabel
                optional={
                  <Typography variant="caption" color="text.secondary">
                    {step.description}
                  </Typography>
                }
                StepIconProps={{
                  icon: index < activeStep - 1 ? <CheckCircleIcon /> : index + 1,
                }}
              >
                <Typography variant="body2" fontWeight={index === activeStep - 1 ? 700 : 400}>
                  {step.label}
                </Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Step Content in Card */}
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 3,
          minHeight: 500,
          background: 'linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(249,250,251,1) 100%)',
        }}
      >
        {activeStep === 1 && draft.uploadedImage && (
          <DetailsStep
            productImageUrl={draft.uploadedImage}
            productName={draft.uploadedImageName}
            category_path={draft.category_path!}
            shortDescription={draft.shortDescription}
            onNext={handleDetailsComplete}
            onBack={() => router.push('/app/listings')}
          />
        )}

        {activeStep === 2 && draft.uploadedImage && draft.title && (
          <ImagesStep
            originalImage={draft.uploadedImage}
            productName={draft.title}
            onNext={handleImagesComplete}
            onBack={() => setActiveStep(1)}
          />
        )}

        {activeStep === 3 && draft.images && draft.uploadedImage && (
          <VideoStep
            originalImage={draft.uploadedImage}
            generatedImages={draft.images}
            productName={draft.title || ''}
            onNext={handleVideoComplete}
            onBack={() => setActiveStep(2)}
          />
        )}

        {activeStep === 4 && draft.title && draft.description && draft.tags && draft.images && (
          <ReviewStep
            title={draft.title}
            description={draft.description}
            tags={draft.tags}
            price={draft.price || 0}
            images={draft.images}
            video={draft.video}
            onBack={() => setActiveStep(3)}
            onSave={handleSaveChanges}
          />
        )}
      </Paper>
    </Box>
  );
}
