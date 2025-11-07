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
  Grid,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/lib/contexts/ToastContext';
import { useAuth } from '@/lib/auth/context';
import ProductTypeStep from './ProductTypeStep';
import UploadStep from './UploadStep';
import ChannelSelector from './ChannelSelector';
import ChannelDetailsEditor from './ChannelDetailsEditor';
import ImagesStep from './ImagesStep';
import VideoStep from './VideoStep';
import ReviewStep from './ReviewStep';
import PodWorkflow from './Pod/PodWorkflow';
import MockupEditorFullPage from './Pod/MockupEditorFullPage';
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
// Physical products: Upload → Details → Images → Video → Review
const physicalSteps = [
  { label: 'Upload', description: 'Upload product image', icon: '📸' },
  { label: 'Details', description: 'Channel-specific content', icon: '✨' },
  { label: 'Images', description: 'Generate AI images', icon: '🖼️' },
  { label: 'Video', description: 'Create video (optional)', icon: '🎥' },
  { label: 'Review', description: 'Review & export', icon: '✅' },
];

// Digital products: Upload/Generate → Images → Video → Details → Review
const digitalSteps = [
  { label: 'Upload', description: 'Upload or generate image', icon: '📸' },
  { label: 'Images', description: 'Generate AI images', icon: '🖼️' },
  { label: 'Video', description: 'Create video (optional)', icon: '🎥' },
  { label: 'Details', description: 'Channel-specific content', icon: '✨' },
  { label: 'Review', description: 'Review & export', icon: '✅' },
];

// POD products: Images (mockups) → Details → Video → Review
const podSteps = [
  { label: 'Images', description: 'Create product mockups', icon: '🖼️' },
  { label: 'Details', description: 'Channel-specific content', icon: '✨' },
  { label: 'Video', description: 'Create video (optional)', icon: '🎥' },
  { label: 'Review', description: 'Review & export', icon: '✅' },
];

type WizardStep = -1 | 0 | 1 | 2 | 3 | 4 | 5; // -1 = product type, 0 = mockup/channels, 1-5 = workflow

interface ListingWizardProps {
  initialData?: ListingData;
  isEditMode?: boolean;
}

export default function ListingWizard({ initialData, isEditMode = false }: ListingWizardProps = {}) {
  const router = useRouter();
  const toast = useToast();
  const { user } = useAuth();
  const [aiGenerating, setAiGenerating] = useState(false);

  // For edit mode, detect product type from initialData and start at review step
  const [activeStep, setActiveStep] = useState<WizardStep>(
    isEditMode && initialData ? (initialData.base.productType === 'pod' ? 4 : 5) : -1
  );
  const [productType, setProductType] = useState<'physical' | 'digital' | 'pod' | null>(
    isEditMode && initialData?.base?.productType
      ? (initialData.base.productType as 'physical' | 'digital' | 'pod')
      : null
  );

  // Get steps based on product type
  const getSteps = () => {
    if (productType === 'digital') return digitalSteps;
    if (productType === 'pod') return podSteps;
    return physicalSteps;
  };
  const steps = getSteps();
  const [channelsConfirmed, setChannelsConfirmed] = useState(
    isEditMode && initialData?.channels && initialData.channels.length > 0
  );
  const [loading, setLoading] = useState(false);

  // Upload step data
  const [uploadedImage, setUploadedImage] = useState<string>(
    isEditMode && initialData?.base?.originalImage ? initialData.base.originalImage : ''
  );
  const [uploadedImageName, setUploadedImageName] = useState<string>(
    isEditMode && initialData?.base?.title ? initialData.base.title : ''
  );
  const [shortDescription, setShortDescription] = useState<string>(
    isEditMode && initialData?.base?.description ? initialData.base.description.substring(0, 100) : ''
  );
  const [category, setCategory] = useState<string>(
    isEditMode && initialData?.base?.category ? initialData.base.category : ''
  );
  const [initialPrice, setInitialPrice] = useState<number>(
    isEditMode && initialData?.base?.price ? initialData.base.price : 0
  );

  // POD mockup data
  const [podMockups, setPodMockups] = useState<string[]>(
    isEditMode && initialData?.base?.images ? initialData.base.images : []
  );
  const [podListingId] = useState(() =>
    isEditMode && initialData?.id ? initialData.id : `pod_${Date.now()}`
  );
  const [showPodContinuePrompt, setShowPodContinuePrompt] = useState(false);

  // Channel selection
  const [selectedChannelIds, setSelectedChannelIds] = useState<string[]>(
    isEditMode && initialData?.channels ? initialData.channels.map(c => c.id) : []
  );
  const [channels, setChannels] = useState<Channel[]>(
    isEditMode && initialData?.channels ? initialData.channels : []
  );

  // Base listing data
  const [baseData, setBaseData] = useState<ListingBase>(
    isEditMode && initialData?.base
      ? initialData.base
      : {
          title: '',
          description: '',
          price: 0,
          category: '',
          images: [],
          quantity: 1,
        }
  );

  // Channel overrides
  const [channelOverrides, setChannelOverrides] = useState<ChannelOverride[]>(
    isEditMode && initialData?.channelOverrides ? initialData.channelOverrides : []
  );
  const [activeChannelId, setActiveChannelId] = useState<string | undefined>(undefined);
  const [scrollPosition, setScrollPosition] = useState(0);

  // Generated content
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>(
    isEditMode && initialData?.base?.images
      ? initialData.base.images.map((url, idx) => ({
          url,
          prompt: '',
          model: 'existing' as const,
          seed: idx,
        }))
      : []
  );
  const [generatedVideo, setGeneratedVideo] = useState<GeneratedVideo | undefined>(
    isEditMode && initialData?.base?.video
      ? { url: initialData.base.video, prompt: '', model: 'existing' }
      : undefined
  );
  const [aiGeneratedListings, setAiGeneratedListings] = useState<any[]>([]);

  // Celebration state
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');
  const [celebrationType, setCelebrationType] = useState<'step' | 'final'>('step');
  const [previousStep, setPreviousStep] = useState(0);

  // Saved listing ID (for updates)
  const [listingId, setListingId] = useState<string | undefined>(
    isEditMode && initialData?.id ? initialData.id : undefined
  );

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
          productType: productType || 'physical', // FIXED: Set productType for physical/digital
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
      // No AI data, use defaults - FIXED: Added productType
      setBaseData({
        title: data.uploadedImageName,
        description: data.shortDescription,
        price: 0,
        category: '',
        images: [data.uploadedImage],
        quantity: 1,
        originalImage: data.uploadedImage,
        productType: productType || 'physical', // FIXED: Set productType for physical/digital
      });
    }

    // Digital products: Upload → Images (step 2)
    // Physical products: Upload → Details (step 2)
    setActiveStep(2);
  };

  // POD Step 1: Mockups/Images Complete
  const handlePodMockupsComplete = async (mockupUrls: string[]) => {
    console.log('POD mockups generated:', mockupUrls);

    // Append new mockups to existing ones (don't replace)
    const allMockups = [...podMockups, ...mockupUrls];
    setPodMockups(allMockups);

    if (allMockups.length > 0) {
      setUploadedImage(allMockups[0]);
      setUploadedImageName('mockup-1.png');

      // Convert mockup URLs to GeneratedImage format
      const mockupImages: GeneratedImage[] = allMockups.map((url, index) => ({
        id: `pod_mockup_${index + 1}_${Date.now()}`,
        url,
        prompt: `Product mockup ${index + 1}`,
        status: 'completed' as const,
        createdAt: new Date().toISOString(),
      }));
      setGeneratedImages(mockupImages);

      // Set basic data immediately so details step works
      const basicData = {
        title: 'Custom Print-on-Demand Product',
        description: `High-quality custom product with unique design. Perfect for personal use or as a gift.\n\nFeatures:\n• Premium quality materials\n• Vibrant, long-lasting print\n• Comfortable and durable\n• Unique custom design\n\nThis product is made-to-order, ensuring you receive a fresh, high-quality item every time.`,
        images: allMockups,
        quantity: 1,
        originalImage: allMockups[0],
      };

      setBaseData(basicData);

      // Create basic channel overrides with default content
      const basicOverrides = selectedChannelIds.map(channelId => {
        const channel = channels.find(c => c.id === channelId);
        return {
          channelId,
          channelSlug: channel?.slug || '',
          title: basicData.title,
          description: basicData.description,
          tags: ['custom design', 'print on demand', 'personalized', 'unique gift', 'handmade'],
          bullets: [
            'Premium quality materials for lasting durability',
            'Vibrant, high-resolution print that won\'t fade',
            'Made-to-order to ensure freshness and quality',
            'Perfect for personal use or as a thoughtful gift',
            'Unique custom design that stands out',
          ],
          materials: ['premium fabric', 'eco-friendly ink', 'quality thread'],
          customFields: {},
        };
      });

      setChannelOverrides(basicOverrides);

      // CRITICAL FIX: Generate AI descriptions and WAIT for them (blocking)
      if (selectedChannelIds.length > 0) {
        console.log('🔄 Waiting for AI to analyze artwork and mockup...');
        toast.info('Analyzing artwork with AI...');
        try {
          await generateAIDescriptions(allMockups[0], selectedChannelIds);
          console.log('✅ AI generation complete, showing continue prompt');
        } catch (err) {
          console.warn('⚠️ AI generation failed, using default content:', err);
        }
      }

      // Show continue prompt AFTER AI generation completes
      setShowPodContinuePrompt(true);
    }
  };

  // Background AI generation helper - FIXED: Now properly uses toast from hook
  const generateAIDescriptions = async (imageUrl: string, channelIds: string[]) => {
    try {
      setAiGenerating(true);
      console.log('🤖 Generating AI descriptions in background...');
      console.log('Image URL:', imageUrl);
      console.log('Channel IDs:', channelIds);

      // Convert channel IDs to slugs for marketplace-specific generation
      const channelSlugs = channelIds
        .map(id => {
          const channel = channels.find(c => c.id === id);
          return channel?.slug;
        })
        .filter(Boolean) as string[];

      console.log('Channel slugs for AI:', channelSlugs);

      const response = await fetch('/api/generate-listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageUrl,
          description: 'Analyze this product mockup image to determine the product type (t-shirt, mug, poster, blanket, etc.) and the artwork/design shown. Generate compelling listing content that accurately describes BOTH the product type AND the artwork design. Include relevant materials and features specific to this product type.',
          selectedChannels: channelSlugs,
          attributes: {
            category: 'Print-on-Demand',
            detectProductType: true, // Flag to trigger enhanced analysis
          },
        }),
      });

      const result = await response.json();
      console.log('AI API response:', result);

      if (result.success && result.listings && result.listings.length > 0) {
        console.log('✅ AI listings generated, updating data...');
        console.log('Full AI response:', result.listings);

        // Update base data with AI-generated content
        const firstListing = result.listings[0];
        const aiGenerated = firstListing.ai_generated || {};

        setBaseData(prev => ({
          ...prev,
          title: aiGenerated.title || firstListing.title || prev.title,
          description: aiGenerated.description || firstListing.description || prev.description,
          productType: 'pod', // Ensure product type is set for POD listings
        }));

        // Create channel overrides with AI-generated content
        const enhancedOverrides = result.listings.map((listing: any) => {
          const channelSlug = listing.channel || listing.slug;
          const ai = listing.ai_generated || {};

          // Find the matching channel to get the ID
          const channel = channels.find(c => c.slug === channelSlug);

          return {
            channelId: channel?.id || listing.channel_id,
            channelSlug: channelSlug,
            title: ai.title || listing.title,
            description: ai.description || listing.description,
            tags: ai.tags || listing.tags || [],
            bullets: ai.bullets || ai.bullet_points || listing.bullets || [],
            materials: ai.materials || listing.materials || [],
            customFields: {},
          };
        });

        console.log('Enhanced channel overrides:', enhancedOverrides);
        setChannelOverrides(enhancedOverrides);
        setAiGeneratedListings(result.listings);

        // FIXED: Use toast from useToast hook
        toast.success('AI descriptions generated successfully!');
      } else {
        console.warn('⚠️ AI generation failed:', result.error || 'No listings returned');
        toast.warning('AI generation failed, using default content');
      }
    } catch (error) {
      console.error('❌ Background AI generation error:', error);
      toast.error('Failed to generate AI content');
    } finally {
      setAiGenerating(false);
    }
  };

  // Step 2/4: Channel Details Complete (merged with optimize)
  const handleDetailsComplete = () => {
    // Physical: Details (step 2) → Images (step 3)
    // Digital: Details (step 4) → Review (step 5)
    // POD: Details (step 2) → Images (step 3)
    if (productType === 'digital') {
      setActiveStep(5);
    } else {
      setActiveStep(3);
    }
  };

  const handleChannelDataChange = (data: {
    baseData: ListingBase;
    channelOverrides: ChannelOverride[];
  }) => {
    // FIXED: Ensure productType is preserved when updating baseData
    setBaseData({
      ...data.baseData,
      productType: data.baseData.productType || productType || 'physical',
    });
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


  // Step 2/3: Images Complete
  const handleImagesComplete = (images: GeneratedImage[]) => {
    setGeneratedImages(images);

    // Create image metadata array with alt text
    const imageMetadata = images.map((img, index) => ({
      url: img.url,
      altText: img.altText,
      prompt: img.prompt,
      position: index + 1,  // Start from 1 (uploaded image is 0)
    }));

    // Add uploaded image metadata as first item
    const uploadedImageMetadata = {
      url: uploadedImage,
      altText: baseData.title || 'Product image',
      position: 0,
    };

    setBaseData({
      ...baseData,
      images: [uploadedImage, ...images.map((img) => img.url)],  // Keep for backward compatibility
      imageMetadata: [uploadedImageMetadata, ...imageMetadata],  // Store metadata with alt text
    });
    // Physical: Images (step 3) → Video (step 4)
    // Digital: Images (step 2) → Video (step 3)
    if (productType === 'digital') {
      setActiveStep(3);
    } else {
      setActiveStep(4);
    }
  };

  // Step 3/4: Video Complete
  const handleVideoComplete = (video?: GeneratedVideo) => {
    setGeneratedVideo(video);
    if (video) {
      setBaseData({
        ...baseData,
        video: video.url,
      });
    }
    // Physical: Video (step 4) → Review (step 5)
    // POD: Video (step 3) → Review (step 4)
    // Digital: Video (step 3) → Details (step 4)
    if (productType === 'digital') {
      setActiveStep(4);
    } else if (productType === 'pod') {
      setActiveStep(4); // POD review is step 4, not 5
    } else {
      setActiveStep(5); // Physical review is step 5
    }
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

  const progressPercentage = activeStep <= 0
    ? 0
    : ((activeStep - 1) / ((productType === 'pod' ? podSteps.length : steps.length) - 1)) * 100;

  const getSelectedChannels = () => {
    return channels.filter((c) => selectedChannelIds.includes(c.id));
  };

  // Step guide content (-1 = product type, 0 = channels, 1-5 = workflow steps)
  const getStepGuides = (): Record<number, { title: string; description: string }> => {
    const baseGuides = {
      [-1]: {
        title: 'Select Product Type',
        description: 'Choose whether you\'re listing a physical product (shipped to customers) or a digital product (downloadable file).',
      },
      0: {
        title: 'Choose Your Sales Channels',
        description: 'Select one or more platforms where you want to list this product. You can customize your listing for each platform later.',
      },
    };

    if (productType === 'digital') {
      return {
        ...baseGuides,
        1: {
          title: 'Upload or Generate Image',
          description: 'Upload an existing product image or generate one from a prompt using AI.',
        },
        2: {
          title: 'Generate AI Images',
          description: 'Create professional product images or mockups automatically. These visuals will make your listing stand out.',
        },
        3: {
          title: 'Add Video (Optional)',
          description: 'Generate short promotional clips automatically to increase engagement and conversions.',
        },
        4: {
          title: 'Channel-Specific Details',
          description: 'AI will generate optimized title, description, tags, and features for each sales channel.',
        },
        5: {
          title: 'Final Review',
          description: 'Review your complete listing before saving or exporting to your selected channels.',
        },
      };
    } else {
      return {
        ...baseGuides,
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
    }
  };

  const stepGuides = getStepGuides();

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
                    label={`Step ${activeStep} of ${productType === 'pod' ? podSteps.length : steps.length}`}
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
                  : productType === 'pod'
                  ? podSteps[activeStep - 1]?.description || ''
                  : steps[activeStep - 1]?.description || ''
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

      {/* Edit Mode Navigation Tabs */}
      {isEditMode && productType && (
        <Paper sx={{ mb: 4, borderRadius: 3 }}>
          <Tabs
            value={activeStep}
            onChange={(_, newValue) => setActiveStep(newValue as WizardStep)}
            variant="fullWidth"
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                minHeight: 64,
              },
              '& .Mui-selected': {
                color: 'primary.main',
              },
            }}
          >
            <Tab
              label="Images"
              value={productType === 'pod' ? 1 : (productType === 'digital' ? 2 : 3)}
              icon={<Typography>🖼️</Typography>}
              iconPosition="start"
            />
            <Tab
              label="Content Details"
              value={productType === 'pod' ? 2 : (productType === 'digital' ? 4 : 2)}
              icon={<Typography>✨</Typography>}
              iconPosition="start"
            />
            <Tab
              label="Video (Optional)"
              value={productType === 'pod' ? 3 : (productType === 'digital' ? 3 : 4)}
              icon={<Typography>🎥</Typography>}
              iconPosition="start"
            />
            <Tab
              label="Review"
              value={productType === 'pod' ? 4 : 5}
              icon={<Typography>✅</Typography>}
              iconPosition="start"
            />
          </Tabs>
        </Paper>
      )}

      {/* Product Type Selection - FIRST STEP */}
      {activeStep === -1 && productType === null && (
        <Box sx={{ mb: 4 }}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
            <ProductTypeStep onSelect={handleProductTypeSelected} />
          </Paper>
        </Box>
      )}

      {/* Channel Selector Section - Shows after product type is selected */}
      {activeStep === 0 && !channelsConfirmed && productType !== null && (
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

          {/* Step 1: POD=Mockups, Physical/Digital=Upload */}
          {activeStep === 1 && productType !== 'pod' && (
            <UploadStep
              onNext={handleUploadComplete}
              primaryChannelSlug={getSelectedChannels()[0]?.slug}
              selectedChannels={getSelectedChannels().map(c => c.slug)}
              productType={productType === 'digital' ? 'digital' : 'physical'}
            />
          )}

          {/* POD Step 1: Mockup Editor */}
          {activeStep === 1 && productType === 'pod' && (
            <Box>
              <MockupEditorFullPage
                onBack={() => {
                  // If no mockups created, go back to channel selection
                  if (podMockups.length === 0) {
                    setActiveStep(0);
                    setChannelsConfirmed(false);
                  }
                }}
                onMockupsGenerated={handlePodMockupsComplete}
                userId={user?.id || 'guest'}
                listingId={podListingId}
              />

              {/* Continue Prompt Dialog */}
              <Dialog
                open={showPodContinuePrompt}
                onClose={() => setShowPodContinuePrompt(false)}
                maxWidth="sm"
                fullWidth
              >
                <DialogTitle>
                  <Typography variant="h5" fontWeight={700}>
                    ✓ Mockups Created Successfully!
                  </Typography>
                </DialogTitle>
                <DialogContent>
                  <Stack spacing={2}>
                    <Alert severity="success">
                      You've created {podMockups.length} mockup image{podMockups.length !== 1 ? 's' : ''}
                    </Alert>
                    <Typography variant="body1">
                      Would you like to continue to the next step to add product details, or create more mockup images?
                    </Typography>
                    {podMockups.length < 10 && (
                      <Typography variant="body2" color="text.secondary">
                        You can create up to {10 - podMockups.length} more image{10 - podMockups.length !== 1 ? 's' : ''}.
                      </Typography>
                    )}
                    {podMockups.length >= 10 && (
                      <Typography variant="body2" color="warning.main" fontWeight={600}>
                        You've reached the maximum of 10 images.
                      </Typography>
                    )}
                  </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                  <Button
                    onClick={() => setShowPodContinuePrompt(false)}
                    variant="outlined"
                    size="large"
                    disabled={podMockups.length >= 10}
                  >
                    Create More Images
                  </Button>
                  <Button
                    onClick={() => {
                      console.log('🚀 Continue to Details clicked');
                      console.log('Current baseData:', baseData);
                      console.log('Current uploadedImage:', uploadedImage);
                      console.log('POD mockups count:', podMockups.length);
                      setShowPodContinuePrompt(false);
                      setActiveStep(2);
                      console.log('✅ Active step set to 2 (Details)');
                    }}
                    variant="contained"
                    size="large"
                    sx={{ px: 4 }}
                  >
                    Continue to Details →
                  </Button>
                </DialogActions>
              </Dialog>
            </Box>
          )}

          {/* Step 2: Physical/POD=Details, Digital=Images */}
          {activeStep === 2 && uploadedImage && (productType === 'physical' || productType === 'pod') && (() => {
            console.log('📋 Rendering Details Step for POD');
            console.log('Product Image URL:', uploadedImage);
            console.log('Base Data:', baseData);
            console.log('Selected Channels:', getSelectedChannels());

            return (
              <ChannelDetailsEditor
                productImageUrl={uploadedImage}
                initialData={{
                  title: baseData.title || uploadedImageName || 'Custom Product',
                  description: baseData.description || shortDescription || 'Product description',
                  price: 0, // Price hidden for POD
                  category: '', // Category hidden for POD
                  quantity: baseData.quantity || 1,
                }}
                channels={getSelectedChannels()}
                overrides={channelOverrides}
                onDataChange={handleChannelDataChange}
                onNext={handleDetailsComplete}
                onBack={() => setActiveStep(1)}
              />
            );
          })()}

          {activeStep === 2 && uploadedImage && productType === 'digital' && (
            <ImagesStep
              channelSlugs={getSelectedChannels().map(c=>c.slug)}
              originalImage={uploadedImage}
              productName={baseData.title || uploadedImageName}
              productType={productType}
              onNext={handleImagesComplete}
              onBack={() => setActiveStep(1)}
            />
          )}

          {/* Step 3: Physical=Images, POD=Video, Digital=Video */}
          {activeStep === 3 && uploadedImage && productType === 'physical' && baseData.title && (
            <ImagesStep
              channelSlugs={getSelectedChannels().map(c=>c.slug)}
              originalImage={uploadedImage}
              productName={baseData.title}
              productType={productType}
              onNext={handleImagesComplete}
              onBack={() => setActiveStep(2)}
            />
          )}

          {activeStep === 3 && uploadedImage && productType === 'pod' && (
            <VideoStep
              originalImage={uploadedImage}
              generatedImages={generatedImages}
              productName={baseData.title || ''}
              onNext={handleVideoComplete}
              onBack={() => setActiveStep(2)}
            />
          )}

          {activeStep === 3 && uploadedImage && productType === 'digital' && (
            <VideoStep
              originalImage={uploadedImage}
              generatedImages={generatedImages}
              productName={baseData.title || uploadedImageName}
              onNext={handleVideoComplete}
              onBack={() => setActiveStep(2)}
            />
          )}

          {/* Step 4: Physical=Video, POD=Review, Digital=Details */}
          {activeStep === 4 && uploadedImage && productType === 'physical' && (
            <VideoStep
              originalImage={uploadedImage}
              generatedImages={generatedImages}
              productName={baseData.title || ''}
              onNext={handleVideoComplete}
              onBack={() => setActiveStep(3)}
            />
          )}

          {activeStep === 4 && productType === 'pod' && (
            <ReviewStep
              title={baseData.title}
              description={baseData.description}
              tags={[]}
              price={baseData.price || 0}
              images={generatedImages}
              video={generatedVideo}
              onBack={() => setActiveStep(3)}
              onSave={handleSaveComplete}
              listingId={listingId}
              selectedChannelIds={selectedChannelIds}
              baseData={baseData}
              channelOverrides={channelOverrides}
              channels={channels}
            />
          )}

          {activeStep === 4 && uploadedImage && productType === 'digital' && (
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
              onBack={() => setActiveStep(3)}
            />
          )}

          {/* Step 5: Review - Physical and Digital only (POD has 4 steps) */}
          {activeStep === 5 && (productType === 'physical' || productType === 'digital') && (
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
              baseData={baseData}
              channelOverrides={channelOverrides}
              channels={channels}
            />
          )}
            </Paper>
          )}
        </Box>
      </Fade>
    </Box>
  );
}
