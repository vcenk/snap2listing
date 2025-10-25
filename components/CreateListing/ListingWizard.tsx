'use client';

import { useState, useEffect, useRef } from 'react';
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
  Fade,
  Slide,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/lib/contexts/ToastContext';
import ProductTypeStep from './ProductTypeStep';
import UploadStep from './UploadStep';
import ChannelSelector from './ChannelSelector';
import ChannelDetailsEditor from './ChannelDetailsEditor';
import ImagesStep from './ImagesStep';
import VideoStep from './VideoStep';
import ReviewStep from './ReviewStep';
import PodWorkflow from './Pod/PodWorkflow';
import ChannelRulesSummary from './ChannelRulesSummary';
import StepGuidePopup from './StepGuidePopup';
import JourneyPath from './JourneyPath';
import SuccessCelebration from './SuccessCelebration';
import { GeneratedImage, GeneratedVideo } from '@/lib/types';
import {
  Channel,
  ListingBase,
  ChannelOverride,
  ListingData,
} from '@/lib/types/channels';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

// 5-step workflow AFTER channel selection (merged Details+Optimize)
const steps = [
  { label: 'Upload', description: 'Upload product image', icon: '📸' },
  { label: 'Details', description: 'Channel-specific content', icon: '✨' },
  { label: 'Images', description: 'Generate AI images', icon: '🖼️' },
  { label: 'Video', description: 'Create video (optional)', icon: '🎥' },
  { label: 'Review', description: 'Review & export', icon: '✅' },
];

type WizardStep = -1 | 0 | 1 | 2 | 3 | 4 | 5; // -1 = product type, 0 = mockup/channels, 1-5 = workflow

export default function ListingWizard() {
  const router = useRouter();
  const toast = useToast();
  const [activeStep, setActiveStep] = useState<WizardStep>(-1); // Start with product type selection
  const [productType, setProductType] = useState<'physical' | 'digital' | 'pod' | null>(null);
  const [channelsConfirmed, setChannelsConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  // Upload step data
  const [uploadedImage, setUploadedImage] = useState<string>('');
  const [uploadedImageName, setUploadedImageName] = useState<string>('');
  const [shortDescription, setShortDescription] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [initialPrice, setInitialPrice] = useState<number>(0);

  // Channel selection
  const [selectedChannelIds, setSelectedChannelIds] = useState<string[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);

  // Base listing data
  const [baseData, setBaseData] = useState<ListingBase>({
    title: '',
    description: '',
    price: 0,
    category: '',
    images: [],
    quantity: 1,
  });

  // Channel overrides
  const [channelOverrides, setChannelOverrides] = useState<ChannelOverride[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string | undefined>(undefined);
  const [scrollPosition, setScrollPosition] = useState(0);

  // Generated content
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [generatedVideo, setGeneratedVideo] = useState<GeneratedVideo | undefined>();
  const [aiGeneratedListings, setAiGeneratedListings] = useState<any[]>([]);

  // Celebration state
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');
  const [celebrationType, setCelebrationType] = useState<'step' | 'final'>('step');
  const [previousStep, setPreviousStep] = useState(0);

  // Saved listing ID (for updates)
  const [listingId, setListingId] = useState<string | undefined>();

  // Refs for smooth scrolling
  const workflowStartRef = useRef<HTMLDivElement>(null);

  // Track scroll
  useEffect(() => {
    const onScroll = () => setScrollPosition(window.scrollY || 0);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Trigger celebration on step completion
  useEffect(() => {
    if (activeStep > previousStep && activeStep > 0 && activeStep <= steps.length) {
      // Step completed
      if (activeStep === steps.length) {
        // Final step
        setCelebrationMessage('Listing Complete!');
        setCelebrationType('final');
      } else {
        // Regular step
        setCelebrationMessage(`${steps[activeStep - 2]?.label || 'Step'} Complete!`);
        setCelebrationType('step');
      }
      setShowCelebration(true);
      
      // Hide celebration after delay
      setTimeout(() => setShowCelebration(false), celebrationType === 'final' ? 3000 : 1500);
    }
    setPreviousStep(activeStep);
  }, [activeStep]);

  // Scroll to workflow when it becomes visible
  useEffect(() => {
    if (channelsConfirmed && workflowStartRef.current) {
      // Small delay to ensure DOM has updated
      setTimeout(() => {
        workflowStartRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 100);
    }
  }, [channelsConfirmed]);


  // Load channels on mount
  useEffect(() => {
    const loadChannels = async () => {
      try {
        const response = await fetch('/api/channels');
        const data = await response.json();
        if (data.success) {
          setChannels(data.channels);
        }
      } catch (error) {
        console.error('Error loading channels:', error);
        toast.error('Failed to load channels');
      }
    };
    loadChannels();
  }, []);

// Step 1: Upload Complete
  const handleUploadComplete = (data: {
    uploadedImage: string;
    uploadedImageName: string;
    shortDescription: string;
    aiGenerated?: any;
  }) => {
    setUploadedImage(data.uploadedImage);
    setUploadedImageName(data.uploadedImageName);
    setShortDescription(data.shortDescription);

    // Store AI-generated content
    if (data.aiGenerated) {
      setAiGeneratedListings(data.aiGenerated);

      // Use first channel's AI content for base data
      const firstListing = data.aiGenerated[0];
      if (firstListing?.ai_generated) {
        setBaseData({
          title: firstListing.ai_generated.title || data.uploadedImageName,
          description: firstListing.ai_generated.description || data.shortDescription,
          price: 0, // Will be set in Details step
          category: '', // Will be set in Details step
          images: [data.uploadedImage],
          quantity: 1,
          originalImage: data.uploadedImage,
        });

        // Pre-populate channel overrides with AI content
        const newOverrides = data.aiGenerated.map((listing: any) => {
          const channel = channels.find((c) => c.slug === listing.channel);
          const aiData = listing.ai_generated;
          return {
            channelId: channel?.id || '',
            channelSlug: listing.channel,
            title: aiData.title || data.uploadedImageName,
            description: aiData.description || data.shortDescription,
            tags: aiData.tags || aiData.keywords || [],
            bullets: aiData.bullet_points || aiData.bullets || [],
            price: aiData.price || 0,
            materials: aiData.materials,
          };
        });
        setChannelOverrides(newOverrides);
      }
    } else {
      // No AI data, use defaults
      setBaseData({
        title: data.uploadedImageName,
        description: data.shortDescription,
        price: 0,
        category: '',
        images: [data.uploadedImage],
        quantity: 1,
        originalImage: data.uploadedImage,
      });
    }

    setActiveStep(2);
  };

  // Step 2: Channel Details Complete (merged with optimize)
  const handleDetailsComplete = () => {
    setActiveStep(3);
  };

  const handleChannelDataChange = (data: {
    baseData: ListingBase;
    channelOverrides: ChannelOverride[];
  }) => {
    setBaseData(data.baseData);
    setChannelOverrides(data.channelOverrides);
    
    // Update category and price if changed
    if (data.baseData.category) {
      setCategory(data.baseData.category);
    }
    if (data.baseData.price) {
      setInitialPrice(data.baseData.price);
    }
  };

  // Product Type Selected
  const handleProductTypeSelected = (type: 'physical' | 'digital' | 'pod') => {
    setProductType(type);
    setActiveStep(0); // Move to step 0 for all types, but rendering will differ
  };

  // Channel Selection Confirmed (activates workflow)
  const handleChannelsSelected = () => {
    if (selectedChannelIds.length === 0) {
      toast.warning('Please select at least one channel');
      return;
    }

    // Initialize overrides for selected channels
    const newOverrides = selectedChannelIds.map((channelId) => {
      const channel = channels.find((c) => c.id === channelId);
      return {
        channelId,
        channelSlug: channel?.slug || '',
      } as ChannelOverride;
    });
    setChannelOverrides(newOverrides);
    setChannelsConfirmed(true);
    setActiveStep(1); // Start at step 1 (Upload)
  };


  // Step 3: Images Complete
  const handleImagesComplete = (images: GeneratedImage[]) => {
    setGeneratedImages(images);
    setBaseData({
      ...baseData,
      images: [uploadedImage, ...images.map((img) => img.url)],
    });
    setActiveStep(4);
  };

  // Step 4: Video Complete
  const handleVideoComplete = (video?: GeneratedVideo) => {
    setGeneratedVideo(video);
    if (video) {
      setBaseData({
        ...baseData,
        video: video.url,
      });
    }
    setActiveStep(5);
  };

  // Save listing to database
  const handleSaveListing = async (status: 'draft' | 'completed' = 'completed') => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in');
        router.push('/login');
        return;
      }

      // Ensure channel overrides have channelId set
      const validChannelOverrides = channelOverrides
        .filter(override => override.channelId) // Filter out any without channelId
        .map(override => ({
          ...override,
          // Ensure channelId is set from selectedChannelIds if missing
          channelId: override.channelId || selectedChannelIds.find(id => {
            const channel = channels.find(c => c.id === id);
            return channel?.slug === override.channelSlug;
          }) || '',
        }));

      // If no valid channel overrides, create basic ones from selected channels
      const channelsToSave = validChannelOverrides.length > 0 
        ? validChannelOverrides
        : selectedChannelIds.map(channelId => ({
            channelId,
            channelSlug: channels.find(c => c.id === channelId)?.slug || '',
            title: baseData.title,
            description: baseData.description,
          } as ChannelOverride));

      // Prepare listing data for new schema
      const listingData: Partial<ListingData> = {
        id: listingId, // include id to update existing draft instead of creating new
        userId: user.id,
        status,
        base: baseData,
        channels: channelsToSave,
        seoScore: 0,
        lastStep: steps[activeStep-1]?.label,
        lastChannelTab: (channels.find(c => c.id === activeChannelId)?.slug) || undefined,
        scrollPosition: Math.round(scrollPosition), // Ensure integer
      };

      console.log('Saving listing data:', listingData);

      // Save to listings table via API
      const response = await fetch('/api/listings/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(listingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Save listing error response:', errorData);
        console.error('Full error details:', JSON.stringify(errorData, null, 2));
        const errorMessage = errorData.details || errorData.error || 'Failed to save listing';
        throw new Error(errorMessage);
      }

      const result = await response.json();
      setListingId(result.listing.id);

      toast.success(status === 'draft' ? 'Draft saved!' : 'Listing saved!');

      if (status === 'completed') {
        router.push('/app/listings');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error(`Failed to save listing: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = () => handleSaveListing('draft');
  const handleSaveComplete = () => handleSaveListing('completed');

  const handleExit = async () => {
    if (confirm('Save as draft before exiting?')) {
      await handleSaveDraft();
    }
    router.push('/app/listings');
  };

  const progressPercentage = activeStep <= 0 ? 0 : ((activeStep - 1) / (steps.length - 1)) * 100;

  const getSelectedChannels = () => {
    return channels.filter((c) => selectedChannelIds.includes(c.id));
  };

  // Step guide content (-1 = product type, 0 = channels, 1-5 = workflow steps)
  const stepGuides: Record<number, { title: string; description: string }> = {
    [-1]: {
      title: 'Select Product Type',
      description: 'Choose whether you\'re listing a physical product (shipped to customers) or a digital product (downloadable file).',
    },
    0: {
      title: 'Choose Your Sales Channels',
      description: 'Select one or more platforms where you want to list this product. You can customize your listing for each platform later.',
    },
    1: {
      title: 'Upload Your Product',
      description: 'Upload a clear product photo. AI will use this image to generate optimized descriptions, mockups, and more.',
    },
    2: {
      title: 'Channel-Specific Details',
      description: 'Customize title, description, tags, and features for each sales channel. Use Auto-Optimize for AI-powered SEO improvements.',
    },
    3: {
      title: 'Generate AI Images',
      description: 'Create professional product images or mockups automatically. These visuals will make your listing stand out.',
    },
    4: {
      title: 'Add Video (Optional)',
      description: 'Generate short promotional clips automatically to increase engagement and conversions.',
    },
    5: {
      title: 'Final Review',
      description: 'Review your complete listing before saving or exporting to your selected channels.',
    },
  };

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      {/* Success Celebration */}
      <SuccessCelebration
        show={showCelebration}
        message={celebrationMessage}
        type={celebrationType}
      />
      {/* Header */}
      <Card
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1100,
          mb: 4,
          background: `linear-gradient(135deg, ${alpha('#2196F3', 0.1)} 0%, ${alpha('#9C27B0', 0.1)} 100%)`,
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          border: 'none',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Box sx={{ p: 4 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Box>
              <Stack direction="row" alignItems="center" spacing={2} mb={1}>
                <Typography variant="h2" sx={{ fontWeight: 700 }}>
                  Create Multi-Channel Listing
                </Typography>
                {activeStep > 0 && (
                  <Chip 
                    label={`Step ${activeStep} of ${steps.length}`} 
                    color="primary" 
                    sx={{ fontWeight: 600 }} 
                  />
                )}
              </Stack>
              <Typography variant="body1" color="text.secondary">
                {activeStep === -1
                  ? 'Choose your product type to get started'
                  : activeStep === 0
                  ? 'Select your sales channels to get started'
                  : steps[activeStep - 1].description
                }
              </Typography>
            </Box>
            <Stack direction="row" spacing={2} alignItems="center">
              {activeStep > 0 && (
                <Button
                  onClick={handleSaveDraft}
                  variant="outlined"
                  startIcon={<SaveIcon />}
                  disabled={loading}
                  sx={{ borderRadius: 2, px: 3, textTransform: 'none', fontWeight: 600 }}
                >
                  Save Draft
                </Button>
              )}
              <Button
                onClick={handleExit}
                variant="text"
                startIcon={<ExitToAppIcon />}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
              >
                Exit
              </Button>
            </Stack>
          </Stack>

          {activeStep > 0 && (
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
                    background: 'linear-gradient(90deg, #2196F3 0%, #9C27B0 100%)',
                  },
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {Math.round(progressPercentage)}% Complete
              </Typography>
            </Box>
          )}
        </Box>
      </Card>

      {/* Product Type Selection - FIRST STEP */}
      {activeStep === -1 && productType === null && (
        <Box sx={{ mb: 4 }}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
            <ProductTypeStep onSelect={handleProductTypeSelected} />
          </Paper>
        </Box>
      )}

      {/* PoD Workflow - Shows when PoD is selected */}
      {productType === 'pod' && (
        <Box sx={{ mb: 4 }}>
          <PodWorkflow
            onBack={() => {
              setProductType(null);
              setActiveStep(-1);
            }}
          />
        </Box>
      )}

      {/* Channel Selector Section - Shows after product type is selected (except for PoD) */}
      {activeStep === 0 && !channelsConfirmed && productType !== null && productType !== 'pod' && (
        <Box sx={{ mb: 4 }}>
          <StepGuidePopup
            stepKey="channel-selector"
            title={stepGuides[0].title}
            description={stepGuides[0].description}
          />
          <Paper
            elevation={3}
            sx={{
              p: 4,
              borderRadius: 3,
              border: !channelsConfirmed && selectedChannelIds.length === 0
                ? `2px dashed ${alpha('#2196F3', 0.3)}`
                : 'none',
            }}
          >
            <ChannelSelector
              selectedChannels={selectedChannelIds}
              onSelectionChange={(ids) => {
                setSelectedChannelIds(ids);
                if (channelsConfirmed && ids.length === 0) {
                  // Reset workflow if all channels are deselected
                  setChannelsConfirmed(false);
                  setActiveStep(0);
                }
              }}
              onChannelsLoaded={(loadedChannels) => setChannels(loadedChannels)}
            />
            {!channelsConfirmed && (
              <Stack direction="row" spacing={2} mt={4} justifyContent="space-between">
                <Button
                  onClick={() => {
                    // Go back to product type selection
                    setProductType(null);
                    setActiveStep(-1);
                  }}
                  variant="outlined"
                  size="large"
                  sx={{
                    borderRadius: 2,
                    px: 4,
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  Back
                </Button>
                <Button
                  onClick={handleChannelsSelected}
                  variant="contained"
                  size="large"
                  disabled={selectedChannelIds.length === 0}
                  sx={{
                    borderRadius: 2,
                    px: 4,
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  Start Creating Listing
                </Button>
              </Stack>
            )}
          </Paper>
        </Box>
      )}

      {/* Channel Rules Summary - Shows after channels confirmed */}
      <Fade in={channelsConfirmed && selectedChannelIds.length > 0} timeout={600}>
        <Box ref={workflowStartRef}>
          {channelsConfirmed && selectedChannelIds.length > 0 && (
            <ChannelRulesSummary channels={getSelectedChannels()} />
          )}
        </Box>
      </Fade>

      {/* Journey Path - Only shows after channels are confirmed */}
      <Slide direction="down" in={channelsConfirmed} timeout={500} mountOnEnter unmountOnExit>
        <Paper sx={{ p: 4, mb: 4, boxShadow: 2, borderRadius: 3, overflow: 'visible' }}>
          <JourneyPath
            milestones={steps.map((step, index) => ({
              id: index + 1,
              label: step.label,
              icon: step.icon,
              description: step.description,
            }))}
            activeStep={activeStep}
            onStepClick={(step) => {
              // Allow clicking on completed steps to navigate back
              if (step < activeStep) {
                setActiveStep(step as WizardStep);
              }
            }}
          />
        </Paper>
      </Slide>

      {/* Step Content - Only shows after channels confirmed */}
      <Fade in={channelsConfirmed} timeout={700}>
        <Box>
          {channelsConfirmed && (
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3, minHeight: 500 }}>
          {/* Step Guide Popup */}
          {stepGuides[activeStep] && activeStep > 0 && (
            <StepGuidePopup
              stepKey={`step-${activeStep}`}
              title={stepGuides[activeStep].title}
              description={stepGuides[activeStep].description}
            />
          )}

          {activeStep === 1 && (
            <UploadStep
              onNext={handleUploadComplete}
              primaryChannelSlug={getSelectedChannels()[0]?.slug}
              selectedChannels={getSelectedChannels().map(c => c.slug)}
            />
          )}

          {activeStep === 2 && uploadedImage && (
            <ChannelDetailsEditor
              productImageUrl={uploadedImage}
              initialData={{
                title: baseData.title || uploadedImageName,
                description: baseData.description || shortDescription,
                price: initialPrice || 0,
                category: category || '',
                quantity: baseData.quantity || 1,
              }}
              channels={getSelectedChannels()}
              overrides={channelOverrides}
              onDataChange={handleChannelDataChange}
              onNext={handleDetailsComplete}
              onBack={() => setActiveStep(1)}
            />
          )}

          {activeStep === 3 && uploadedImage && baseData.title && (
            <ImagesStep
              channelSlugs={getSelectedChannels().map(c=>c.slug)}
              originalImage={uploadedImage}
              productName={baseData.title}
              productType={productType || 'physical'}
              onNext={handleImagesComplete}
              onBack={() => setActiveStep(2)}
            />
          )}

          {activeStep === 4 && uploadedImage && (
            <VideoStep
              originalImage={uploadedImage}
              generatedImages={generatedImages}
              productName={baseData.title || ''}
              onNext={handleVideoComplete}
              onBack={() => setActiveStep(3)}
            />
          )}

          {activeStep === 5 && (
            <ReviewStep
              title={baseData.title}
              description={baseData.description}
              tags={[]}
              price={baseData.price || 0}
              images={generatedImages}
              video={generatedVideo}
              onBack={() => setActiveStep(4)}
              onSave={handleSaveComplete}
              listingId={listingId}
              selectedChannelIds={selectedChannelIds}
            />
          )}
            </Paper>
          )}
        </Box>
      </Fade>
    </Box>
  );
}
