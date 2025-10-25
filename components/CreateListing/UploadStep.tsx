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
} from '@mui/material';
import { useState, useRef, useEffect } from 'react';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SmartDescriptionComposer from './SmartDescriptionComposer';
import AIGenerationLoader from '@/components/common/AIGenerationLoader';

interface UploadStepProps {
  primaryChannelSlug?: string;
  selectedChannels?: string[]; // Channel slugs
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

export default function UploadStep({ primaryChannelSlug, selectedChannels, onNext }: UploadStepProps) {
  const [uploadedImage, setUploadedImage] = useState<string>('');
  const [uploadedImageName, setUploadedImageName] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const descriptionRef = useRef<HTMLDivElement>(null);

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
        <Typography variant="h4">Upload Product Photo</Typography>

        {/* Image Upload */}
        <Paper
          sx={{
            p: 4,
            textAlign: 'center',
            border: '2px dashed',
            borderColor: uploadedImage ? 'primary.main' : 'divider',
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
          {uploadedImage ? (
            <Box>
              <img
                src={uploadedImage}
                alt="Uploaded product"
                style={{ maxWidth: '100%', maxHeight: 400, borderRadius: 14 }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                {uploadedImageName}
              </Typography>
            </Box>
          ) : (
            <Stack spacing={2} alignItems="center">
              <CloudUploadIcon sx={{ fontSize: 60, color: 'text.secondary' }} />
              <Typography variant="h5">
                Click to upload product photo
              </Typography>
              <Typography variant="body2" color="text.secondary">
                PNG, JPG up to 10MB
              </Typography>
            </Stack>
          )}
        </Paper>


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
