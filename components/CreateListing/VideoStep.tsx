'use client';

import {
  Box,
  TextField,
  Typography,
  Stack,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  ImageList,
  ImageListItem,
  Chip,
  LinearProgress,
  Paper,
  CircularProgress,
} from '@mui/material';
import { useState, useEffect } from 'react';
import RefreshIcon from '@mui/icons-material/Refresh';
import { GeneratedImage, GeneratedVideo } from '@/lib/types';
import UpgradeModal from '@/components/common/UpgradeModal';
import { useAuth } from '@/lib/auth/context';
import AIGenerationLoader from '@/components/common/AIGenerationLoader';

interface VideoStepProps {
  originalImage: string;
  generatedImages: GeneratedImage[];
  productName: string;
  onNext: (video?: GeneratedVideo) => void;
  onBack: () => void;
}

const VIDEO_PRESETS = [
  { label: '360° Rotation', prompt: 'smooth 360 degree rotation, showcase all angles, studio lighting' },
  { label: 'Slow Zoom', prompt: 'slow zoom in to show details, professional, cinematic' },
  { label: 'Lifestyle Scene', prompt: 'gentle camera movement, lifestyle setting, warm atmosphere' },
];

export default function VideoStep({
  originalImage,
  generatedImages,
  productName,
  onNext,
  onBack,
}: VideoStepProps) {
  const { user } = useAuth();
  const [baseImageType, setBaseImageType] = useState<'original' | 'generated'>('original');
  const [selectedImageId, setSelectedImageId] = useState<string>('');
  const [videoPrompt, setVideoPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(45);
  const [video, setVideo] = useState<GeneratedVideo | null>(null);
  const [requestId, setRequestId] = useState<string>('');
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [userPlan, setUserPlan] = useState('free');

  const handleSetPreset = (preset: typeof VIDEO_PRESETS[0]) => {
    setVideoPrompt(preset.prompt.replace(/\[PRODUCT\]/g, productName));
  };

  const generateVideo = async () => {
    const baseImageUrl =
      baseImageType === 'original'
        ? originalImage
        : generatedImages.find((img) => img.id === selectedImageId)?.url;

    if (!baseImageUrl || !videoPrompt.trim()) {
      alert('Please select a base image and enter a prompt');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setEstimatedTime(90); // Realistic estimate for video generation

    try {
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseImageUrl,
          prompt: videoPrompt,
          userId: user?.id, // Pass user ID for limit checking
        }),
      });

      const data = await response.json();

      // Check if limit reached
      if (response.status === 403 && data.upgrade) {
        setUpgradeModalOpen(true);
        setIsGenerating(false);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate video');
      }

      // Set the video directly from the response (no polling needed)
      setVideo({
        id: data.id,
        url: data.url,
        prompt: videoPrompt,
        baseImageUrl: baseImageUrl,
        baseImageType,
        status: 'completed',
        createdAt: new Date().toISOString(),
      });
      setIsGenerating(false);
    } catch (error) {
      console.error('Error generating video:', error);
      alert('Failed to generate video. Please try again.');
      setIsGenerating(false);
    }
  };

  const pollVideoStatus = async (reqId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/generate-video-status?requestId=${reqId}`);
        const data = await response.json();

        setProgress(data.progress || 0);

        if (data.status === 'completed') {
          clearInterval(interval);
          setVideo({
            id: data.id,
            url: data.url,
            prompt: videoPrompt,
            baseImageUrl: baseImageType === 'original' ? originalImage : generatedImages.find((img) => img.id === selectedImageId)?.url || '',
            baseImageType,
            status: 'completed',
            createdAt: new Date().toISOString(),
          });
          setIsGenerating(false);
        } else if (data.status === 'failed') {
          clearInterval(interval);
          alert('Video generation failed. Please try again.');
          setIsGenerating(false);
        }
      } catch (error) {
        console.error('Error polling video status:', error);
      }
    }, 3000);
  };

  const skipVideo = () => {
    onNext(undefined);
  };

  const handleSubmit = () => {
    onNext(video || undefined);
  };

  // Show AI loader while generating
  if (isGenerating) {
    return (
      <Box>
        <AIGenerationLoader 
          message="Creating your product video"
          type="video"
        />
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            This may take up to {estimatedTime} seconds
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ mt: 2, maxWidth: 400, mx: 'auto' }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            {Math.round(progress)}% complete
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Stack spacing={4}>
        <Typography variant="h4">Create Product Video (5 seconds)</Typography>

        {!video && (
          <>
            <FormControl>
              <FormLabel>Base Image for Video:</FormLabel>
              <RadioGroup
                value={baseImageType}
                onChange={(e) => setBaseImageType(e.target.value as 'original' | 'generated')}
              >
                <FormControlLabel
                  value="original"
                  control={<Radio />}
                  label="Use original uploaded photo"
                />
                <FormControlLabel
                  value="generated"
                  control={<Radio />}
                  label="Use generated image:"
                />
              </RadioGroup>

              {baseImageType === 'generated' && (
                <ImageList cols={3} gap={8} sx={{ mt: 2 }}>
                  {generatedImages.map((img) => (
                    <ImageListItem
                      key={img.id}
                      onClick={() => setSelectedImageId(img.id)}
                      sx={{
                        cursor: 'pointer',
                        border: selectedImageId === img.id ? '3px solid' : '2px solid transparent',
                        borderColor: selectedImageId === img.id ? 'primary.main' : 'transparent',
                        borderRadius: 2,
                        overflow: 'hidden',
                        '&:hover': { borderColor: 'primary.light' },
                      }}
                    >
                      <img src={img.url} alt="Generated" loading="lazy" />
                    </ImageListItem>
                  ))}
                </ImageList>
              )}
            </FormControl>

            <TextField
              label="Video Prompt"
              multiline
              rows={3}
              placeholder="Rotate 360 degrees with soft lighting..."
              value={videoPrompt}
              onChange={(e) => setVideoPrompt(e.target.value)}
            />

            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Quick presets:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {VIDEO_PRESETS.map((preset) => (
                  <Chip
                    key={preset.label}
                    label={preset.label}
                    onClick={() => handleSetPreset(preset)}
                    variant="outlined"
                  />
                ))}
              </Stack>
            </Box>

            {isGenerating && (
              <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
                <LinearProgress sx={{ mb: 2 }} />
                <Typography textAlign="center">
                  Generating video... This may take 60-90 seconds
                </Typography>
              </Paper>
            )}

            {!isGenerating && (
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  onClick={generateVideo}
                  disabled={isGenerating}
                  size="large"
                  fullWidth
                >
                  🎬 Generate Video
                </Button>
                <Button variant="outlined" onClick={skipVideo} fullWidth>
                  ⏩ Skip Video
                </Button>
              </Stack>
            )}
          </>
        )}

        {video && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Video Generated Successfully!
            </Typography>
            <Box sx={{ mt: 2, mb: 2 }}>
              <video
                src={video.url}
                controls
                style={{ width: '100%', maxHeight: 400, borderRadius: 14 }}
              />
            </Box>
            <Button startIcon={<RefreshIcon />} onClick={() => setVideo(null)} fullWidth>
              Regenerate Video
            </Button>
          </Paper>
        )}

        <Stack direction="row" justifyContent="space-between" pt={2}>
          <Button onClick={onBack} size="large" disabled={isGenerating}>
            ← Back
          </Button>
          <Button
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={isGenerating}
          >
            Continue →
          </Button>
        </Stack>
      </Stack>

      {/* Upgrade Modal */}
      <UpgradeModal
        open={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        type="video"
        currentPlan={userPlan}
      />
    </Box>
  );
}
