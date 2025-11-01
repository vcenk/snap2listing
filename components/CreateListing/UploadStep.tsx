'use client';

import {
  Box,
  TextField,
  Typography,
  Stack,
  Paper,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  AlertTitle,
  Tabs,
  Tab,
  Divider,
  Chip,
} from '@mui/material';
import { useState, useRef, useEffect } from 'react';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import ImageIcon from '@mui/icons-material/Image';
import SmartDescriptionComposer from './SmartDescriptionComposer';
import AIGenerationLoader from '@/components/common/AIGenerationLoader';
import { useAuth } from '@/lib/auth/context';

interface UploadStepProps {
  primaryChannelSlug?: string;
  selectedChannels?: string[]; // Channel slugs
  productType?: 'physical' | 'digital'; // Product type to determine if we show generate option
  onNext: (data: {
    uploadedImage: string;
    uploadedImageName: string;
    shortDescription: string;
    aiGenerated?: any; // AI-generated content for all channels
  }) => void;
}

const CHANNEL_CATEGORIES: Record<string, string[]> = {
  shopify: [
    'Accessories',
    'Art & Collectibles',
    'Home & Living',
    'Jewelry',
    'Clothing',
    'Health & Beauty',
    'Electronics Accessories',
  ],
  ebay: [
    'Electronics',
    'Home & Garden',
    'Fashion',
    'Collectibles & Art',
    'Toys & Hobbies',
    'Crafts',
  ],
  'facebook-ig': [
    'Apparel & Accessories',
    'Jewelry & Watches',
    'Beauty & Personal Care',
    'Home & Living',
    'Baby & Kids',
  ],
  amazon: [
    'Home & Kitchen',
    'Arts, Crafts & Sewing',
    'Toys & Games',
    'Clothing, Shoes & Jewelry',
    'Health & Household',
  ],
  etsy: [
    'Jewelry',
    'Home & Living',
    'Art & Collectibles',
    'Clothing',
    'Craft Supplies & Tools',
  ],
  tiktok: [
    'Accessories',
    'Beauty',
    'Gadgets',
    'Home & Lifestyle',
    'Fitness',
  ],
};

function priceSuggestion(slug?: string) {
  switch (slug) {
    case 'etsy': return 'Common range: $15 - $60';
    case 'shopify': return 'Common range: $20 - $80';
    case 'ebay': return 'Common range: $10 - $50';
    case 'facebook-ig': return 'Common range: $15 - $40';
    case 'amazon': return 'Common range: $12 - $70';
    case 'tiktok': return 'Common range: $10 - $35';
    default: return 'Enter a reasonable price (you can adjust later)';
  }
}

export default function UploadStep({ primaryChannelSlug, selectedChannels, productType = 'physical', onNext }: UploadStepProps) {
  const { user } = useAuth();
  const [mode, setMode] = useState<'upload' | 'generate'>('upload'); // Upload or Generate mode for digital products
  const [uploadedImage, setUploadedImage] = useState<string>('');
  const [uploadedImageName, setUploadedImageName] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const descriptionRef = useRef<HTMLDivElement>(null);

  // Image generation states (for digital products)
  const [generatePrompt, setGeneratePrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('blurry, watermark, text, low quality');
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedImageName(file.name);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Generate image from prompt (for digital products)
  const handleGenerateImage = async () => {
    if (!generatePrompt.trim()) {
      alert('Please enter a prompt to generate an image');
      return;
    }

    setIsGenerating(true);

    // Scroll to top to show loader
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: generatePrompt,
          negativePrompt,
          upscale: false, // Default no upscale for first image
          aspectRatio,
          userId: user?.id,
          productName: generatePrompt.split(',')[0], // Use first part of prompt as product name
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || 'Failed to generate image');
      }

      // Set the generated image
      setUploadedImage(result.url);
      setUploadedImageName('generated-image.jpg');

      // Auto-set description from prompt
      if (!shortDescription) {
        setShortDescription(generatePrompt);
      }
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Failed to generate image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Scroll to description area after image upload
  useEffect(() => {
    if (uploadedImage && descriptionRef.current) {
      setTimeout(() => {
        descriptionRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 300);
    }
  }, [uploadedImage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedImage) {
      alert('Please upload a product image');
      return;
    }

    if (!shortDescription) {
      alert('Please provide a product description');
      return;
    }

    // Generate AI content if channels are selected
    let aiGenerated = undefined;
    if (selectedChannels && selectedChannels.length > 0) {
      setIsGenerating(true);
      try {
        const response = await fetch('/api/generate-listings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: uploadedImage,
            description: shortDescription,
            selectedChannels,
          }),
        });
        
        const result = await response.json();
        if (result.success) {
          aiGenerated = result.listings;
        }
      } catch (error) {
        console.error('AI generation failed:', error);
        // Continue anyway without AI content
      } finally {
        setIsGenerating(false);
      }
    }

    onNext({
      uploadedImage,
      uploadedImageName,
      shortDescription,
      aiGenerated,
    });
  };

  // Show AI generation loader while generating
  if (isGenerating) {
    return (
      <Box>
        <AIGenerationLoader 
          message="Generating AI content for your product"
          type="text"
        />
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={3}>
        <Typography variant="h4">
          {productType === 'digital' ? 'Upload or Generate Product Image' : 'Upload Product Photo'}
        </Typography>

        {/* Mode Selector - Only for Digital Products */}
        {productType === 'digital' && !uploadedImage && (
          <Paper sx={{ p: 2 }}>
            <Tabs
              value={mode}
              onChange={(e, newValue) => setMode(newValue)}
              variant="fullWidth"
              sx={{ mb: 2 }}
            >
              <Tab
                icon={<CloudUploadIcon />}
                iconPosition="start"
                label="Upload Image"
                value="upload"
              />
              <Tab
                icon={<AutoFixHighIcon />}
                iconPosition="start"
                label="Generate with AI"
                value="generate"
              />
            </Tabs>
          </Paper>
        )}

        {/* Upload Mode */}
        {(mode === 'upload' || productType === 'physical') && !uploadedImage && (
          <Paper
            sx={{
              p: 4,
              textAlign: 'center',
              border: '2px dashed',
              borderColor: 'divider',
              bgcolor: 'background.default',
              cursor: 'pointer',
              '&:hover': { borderColor: 'primary.main' },
            }}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <Stack spacing={2} alignItems="center">
              <CloudUploadIcon sx={{ fontSize: 60, color: 'text.secondary' }} />
              <Typography variant="h5">
                Click to upload product photo
              </Typography>
              <Typography variant="body2" color="text.secondary">
                PNG, JPG up to 10MB
              </Typography>
            </Stack>
          </Paper>
        )}

        {/* Generate Mode - Only for Digital Products */}
        {mode === 'generate' && productType === 'digital' && !uploadedImage && (
          <Paper sx={{ p: 4, bgcolor: 'background.default' }}>
            <Stack spacing={3}>
              <Alert severity="info" icon={<AutoFixHighIcon />}>
                <AlertTitle>Generate Your Product Image with AI</AlertTitle>
                Describe what you want to create, and AI will generate a professional product image for you.
              </Alert>

              <TextField
                multiline
                rows={3}
                label="Image Generation Prompt"
                placeholder="Example: professional photo of wireless bluetooth headphones, white background, studio lighting, 4k quality"
                value={generatePrompt}
                onChange={(e) => setGeneratePrompt(e.target.value)}
                fullWidth
              />

              <TextField
                label="Negative Prompt (optional)"
                placeholder="blurry, watermark, text, low quality"
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                fullWidth
              />

              <FormControl fullWidth>
                <InputLabel>Aspect Ratio</InputLabel>
                <Select
                  value={aspectRatio}
                  label="Aspect Ratio"
                  onChange={(e) => setAspectRatio(e.target.value)}
                >
                  <MenuItem value="1:1">1:1 (Square) - 1024×1024</MenuItem>
                  <MenuItem value="4:3">4:3 - 1152×896</MenuItem>
                  <MenuItem value="16:9">16:9 (Landscape) - 1344×768</MenuItem>
                  <MenuItem value="3:4">3:4 (Portrait) - 896×1152</MenuItem>
                  <MenuItem value="9:16">9:16 (Vertical) - 768×1344</MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="contained"
                onClick={handleGenerateImage}
                disabled={isGenerating || !generatePrompt.trim()}
                size="large"
                startIcon={isGenerating ? <CircularProgress size={20} color="inherit" /> : <AutoFixHighIcon />}
              >
                {isGenerating ? 'Generating...' : 'Generate Image'}
              </Button>
            </Stack>
          </Paper>
        )}

        {/* Show Generated/Uploaded Image */}
        {uploadedImage && (
          <Paper
            sx={{
              p: 4,
              textAlign: 'center',
              border: '2px solid',
              borderColor: 'primary.main',
              bgcolor: 'background.default',
            }}
          >
            <Box>
              <img
                src={uploadedImage}
                alt="Product"
                style={{ maxWidth: '100%', maxHeight: 400, borderRadius: 14 }}
              />
              <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" sx={{ mt: 2 }}>
                <Chip
                  icon={mode === 'generate' ? <AutoFixHighIcon /> : <ImageIcon />}
                  label={mode === 'generate' ? 'AI Generated' : uploadedImageName}
                  color="primary"
                  variant="outlined"
                />
                <Button
                  size="small"
                  onClick={() => {
                    setUploadedImage('');
                    setUploadedImageName('');
                  }}
                >
                  Change Image
                </Button>
              </Stack>
            </Box>
          </Paper>
        )}


        {/* Smart Description Composer - Only show after image upload */}
        {uploadedImage && (
          <Box ref={descriptionRef}>
            <SmartDescriptionComposer
              imageUrl={uploadedImage}
              initialDescription={shortDescription}
              onDescriptionChange={(desc) => setShortDescription(desc)}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={!uploadedImage || !shortDescription || isGenerating}
                startIcon={isGenerating ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {isGenerating ? 'Generating AI Content...' : 'Continue →'}
              </Button>
            </Box>
          </Box>
        )}
      </Stack>
    </Box>
  );
}
