'use client';

import {
  Box,
  TextField,
  Typography,
  Stack,
  Button,
  Alert,
  Chip,
  Grid,
  Card,
  CardMedia,
  CardActions,
  IconButton,
  Paper,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import { useState, useEffect } from 'react';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import { GeneratedImage } from '@/lib/types';
import UpgradeModal from '@/components/common/UpgradeModal';
import { useAuth } from '@/lib/auth/context';
import AIGenerationLoader from '@/components/common/AIGenerationLoader';

interface ImagesStepProps {
  originalImage: string;
  productName: string;
  productType?: 'physical' | 'digital' | 'pod';
  onNext: (images: GeneratedImage[]) => void;
  onBack: () => void;
}

const SUGGESTED_PROMPTS = [
  'professional product photo of [PRODUCT], front view, white background, studio lighting, high quality, 4k',
  '[PRODUCT] at 45 degree angle, showing details, white background, natural lighting',
  'top-down flat lay of [PRODUCT], overhead view, white background, clean composition',
  'extreme close-up of [PRODUCT] texture and details, macro photography',
  '[PRODUCT] in lifestyle setting, being used naturally, warm lighting',
  '[PRODUCT] with size reference, scale comparison, white background',
  '[PRODUCT] packaged for gift, elegant presentation',
  'artistic angle of [PRODUCT], creative composition',
  '[PRODUCT] in styled scene with props, instagram aesthetic',
];

const QUICK_ADD_PROMPTS = [
  'white background',
  'studio lighting',
  '4k quality',
  'professional',
  'high resolution',
];

export default function ImagesStep({ originalImage, productName, productType: initialProductType, onNext, onBack, channelSlugs = [] as string[] }: ImagesStepProps & { channelSlugs?: string[] }) {
  const { user } = useAuth();
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('blurry, watermark, text, low quality');
  const [upscale, setUpscale] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [userPlan, setUserPlan] = useState('free');
  const [previewImage, setPreviewImage] = useState<{ url: string; index: number } | null>(null);
  const [productType, setProductType] = useState<'physical' | 'digital' | 'pod'>(initialProductType || 'physical');

  // Suggest aspect ratio based on channels
  const suggestedRatio = (() => {
    if (channelSlugs.includes('facebook-ig')) return '1:1';
    if (channelSlugs.includes('amazon')) return '1:1';
    if (channelSlugs.includes('shopify')) return '1:1';
    if (channelSlugs.includes('tiktok')) return '9:16';
    if (channelSlugs.includes('ebay')) return '1:1';
    return '1:1';
  })();

  useState(() => {
    setAspectRatio(suggestedRatio);
  });

  // Set suggested prompt when moving to next slot
  useState(() => {
    if (currentIndex < SUGGESTED_PROMPTS.length) {
      const suggestedPrompt = SUGGESTED_PROMPTS[currentIndex].replace(/\[PRODUCT\]/g, productName);
      setPrompt(suggestedPrompt);
    }
  });


  const generateImage = async () => {
    if (!prompt.trim()) {
      alert('Please enter a prompt');
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
          prompt,
          negativePrompt,
          upscale,
          aspectRatio,
          inputImageUrl: originalImage, // Use original image for image-to-image
          imagePromptStrength: 0.98, // Enforce near-exact adherence to the uploaded image
          userId: user?.id, // Pass user ID for limit checking
          productName, // Pass product name for alt text generation
        }),
      });

      const result = await response.json();

      // Check if limit reached
      if (response.status === 403 && (result as any)?.upgrade) {
        setUpgradeModalOpen(true);
        setIsGenerating(false);
        return;
      }

      if (!response.ok) {
        throw new Error((result as any)?.error || 'Failed to generate image');
      }

      const newImage: GeneratedImage = result as GeneratedImage;

      // Add image to the array
      const updatedImages = [...images];
      updatedImages[currentIndex] = newImage;
      setImages(updatedImages);

      // Move to next slot if not at max
      if (currentIndex < 8) {
        setCurrentIndex(currentIndex + 1);
        // Set next suggested prompt
        if (currentIndex + 1 < SUGGESTED_PROMPTS.length) {
          setPrompt(SUGGESTED_PROMPTS[currentIndex + 1].replace(/\[PRODUCT\]/g, productName));
        } else {
          setPrompt('');
        }
      }
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Failed to generate image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const regenerateImage = async (index: number) => {
    setCurrentIndex(index);
    setPrompt(images[index].prompt);
    setNegativePrompt(images[index].negativePrompt || '');
  };

  const deleteImage = (index: number) => {
    const updatedImages = [...images];
    updatedImages[index] = null as any;
    setImages(updatedImages.filter(Boolean));
  };

  const addToPrompt = (text: string) => {
    if (!prompt.includes(text)) {
      setPrompt(prompt ? `${prompt}, ${text}` : text);
    }
  };

  const downloadImage = (url: string, index: number) => {
    try {
      // Use proxy API to bypass CORS
      const downloadUrl = `/api/download-image?url=${encodeURIComponent(url)}`;
      
      // Create a temporary anchor element
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `generated-image-${index + 1}.jpg`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading image:', error);
      alert('Failed to download image. Please try again.');
    }
  };

  const completedCount = images.filter(Boolean).length;
  const canContinue = completedCount >= 3;

  const handleSubmit = () => {
    if (!canContinue) {
      alert('Please generate at least 3 images');
      return;
    }
    onNext(images.filter(Boolean));
  };


  // Show AI loader while generating
  if (isGenerating) {
    return (
      <Box>
        <AIGenerationLoader 
          message="Creating stunning product images"
          type="image"
        />
      </Box>
    );
  }

  return (
    <Box>
      <Stack spacing={4}>
        <Typography variant="h4">
          Generate Product Images ({completedCount}/9 completed)
        </Typography>

        {/* Current Image Generation */}
        <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
          <Stack spacing={3}>
            <Typography variant="h6">Image #{currentIndex + 1}</Typography>
            <Divider />
            <TextField
              multiline
              rows={3}
              label="Image Prompt"
              placeholder="professional product photo, front view, white background, studio lighting..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              fullWidth
            />

            <TextField
              label="Negative Prompt (optional)"
              placeholder="blurry, watermark, text, low quality"
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              fullWidth
            />

          <Stack direction="row" spacing={2} flexWrap="wrap">
            <FormControlLabel
              control={<Checkbox checked={upscale} onChange={(e) => setUpscale(e.target.checked)} />}
              label="2x Upscale (+$0.02)"
            />
            <FormControl sx={{ minWidth: 200 }}>
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
            <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>
              Suggested: {suggestedRatio} based on selected channels
            </Typography>
            </Stack>

            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Quick add:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {QUICK_ADD_PROMPTS.map((quickPrompt) => (
                  <Chip
                    key={quickPrompt}
                    label={quickPrompt}
                    onClick={() => addToPrompt(quickPrompt)}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Stack>
            </Box>

            <Button
              variant="contained"
              onClick={generateImage}
              disabled={isGenerating || !prompt.trim()}
              size="large"
              startIcon={isGenerating ? <CircularProgress size={20} /> : undefined}
            >
              {isGenerating ? 'Generating...' : `Generate Image #${currentIndex + 1}`}
            </Button>
          </Stack>
        </Paper>


        {/* Generated Images Grid */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Generated Images
          </Typography>
          <Grid container spacing={2}>
            {Array.from({ length: 9 }).map((_, idx) => (
              <Grid item xs={6} sm={4} md={3} key={idx}>
                {images[idx] ? (
                  <Card>
                    <CardMedia
                      component="img"
                      image={images[idx].url}
                      alt={images[idx].altText || `Generated image ${idx + 1}`}
                      sx={{ 
                        aspectRatio: '1/1', 
                        objectFit: 'cover',
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'scale(1.05)',
                        }
                      }}
                      onClick={() => setPreviewImage({ url: images[idx].url, index: idx })}
                    />
                    {images[idx].altText && (
                      <Box sx={{ px: 1, py: 0.5, bgcolor: 'background.default' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                          Alt: {images[idx].altText}
                        </Typography>
                      </Box>
                    )}
                    <CardActions>
                      <IconButton
                        size="small"
                        onClick={() => regenerateImage(idx)}
                        title="Regenerate"
                      >
                        <RefreshIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => downloadImage(images[idx].url, idx)}
                        title="Download"
                        color="primary"
                      >
                        <DownloadIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => deleteImage(idx)}
                        title="Delete"
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </CardActions>
                  </Card>
                ) : (
                  <Paper
                    sx={{
                      aspectRatio: '1/1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'background.default',
                      border: '2px dashed',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Slot #{idx + 1}
                    </Typography>
                  </Paper>
                )}
              </Grid>
            ))}
          </Grid>
        </Box>

        {canContinue && (
          <Alert severity="success">
            Minimum 3 images completed. You can continue or add more (up to 9).
          </Alert>
        )}

        <Stack direction="row" justifyContent="space-between" pt={2}>
          <Button onClick={onBack} size="large">
            ← Back
          </Button>
          <Button
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={!canContinue}
          >
            Continue →
          </Button>
        </Stack>
      </Stack>

      {/* Upgrade Modal */}
      <UpgradeModal
        open={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        type="image"
        currentPlan={userPlan}
      />

      {/* Image Preview Modal */}
      <Dialog
        open={previewImage !== null}
        onClose={() => setPreviewImage(null)}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent sx={{ p: 0, position: 'relative', bgcolor: 'black' }}>
          <IconButton
            onClick={() => setPreviewImage(null)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'white',
              bgcolor: 'rgba(0,0,0,0.5)',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
              zIndex: 1,
            }}
          >
            <CloseIcon />
          </IconButton>
          {previewImage && (
            <Box
              component="img"
              src={previewImage.url}
              alt={images[previewImage.index]?.altText || `Preview of image ${previewImage.index + 1}`}
              sx={{
                width: '100%',
                height: 'auto',
                maxHeight: '85vh',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ bgcolor: 'background.paper' }}>
          {previewImage && (
            <>
              <Button
                startIcon={<DownloadIcon />}
                onClick={() => {
                  downloadImage(previewImage.url, previewImage.index);
                }}
              >
                Download
              </Button>
              <Button
                startIcon={<RefreshIcon />}
                onClick={() => {
                  regenerateImage(previewImage.index);
                  setPreviewImage(null);
                }}
              >
                Regenerate
              </Button>
              <Button
                startIcon={<DeleteIcon />}
                color="error"
                onClick={() => {
                  deleteImage(previewImage.index);
                  setPreviewImage(null);
                }}
              >
                Delete
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
