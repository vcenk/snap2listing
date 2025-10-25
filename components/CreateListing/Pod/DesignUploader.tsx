'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Alert,
  Stack,
  Paper,
  Chip,
  LinearProgress,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ImageIcon from '@mui/icons-material/Image';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface DesignUploaderProps {
  onUpload: (file: File) => void;
}

const ACCEPTED_FORMATS = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function DesignUploader({ onUpload }: DesignUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_FORMATS.includes(file.type)) {
      return 'Please upload a PNG, JPG, or SVG file';
    }

    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 10MB';
    }

    return null;
  };

  const handleFileChange = (file: File | null) => {
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    handleFileChange(file || null);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    handleFileChange(file || null);
  };

  const handleSubmit = () => {
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  const getFileSizeDisplay = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <Box>
      <Typography
        variant="h4"
        fontWeight={800}
        gutterBottom
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Upload Your Design
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Upload your artwork, logo, or design to apply to print-on-demand products
      </Typography>

      <Card
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        sx={{ borderRadius: 3 }}
      >
        <CardContent sx={{ p: 4 }}>
          {!previewUrl ? (
            <Paper
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              sx={{
                p: 6,
                textAlign: 'center',
                border: '3px dashed',
                borderColor: dragActive ? 'primary.main' : 'divider',
                borderRadius: 3,
                bgcolor: dragActive ? 'action.hover' : 'background.default',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'action.hover',
                },
              }}
            >
              <input
                type="file"
                hidden
                id="design-upload-input"
                accept={ACCEPTED_FORMATS.join(',')}
                onChange={handleInputChange}
              />
              <label htmlFor="design-upload-input" style={{ cursor: 'pointer' }}>
                <Stack spacing={3} alignItems="center">
                  <Box
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CloudUploadIcon sx={{ fontSize: 60, color: 'white' }} />
                  </Box>

                  <Box>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      Drag & drop your design here
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      or click to browse your files
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
                    <Chip label="PNG" size="small" />
                    <Chip label="JPG" size="small" />
                    <Chip label="SVG" size="small" />
                    <Chip label="Max 10MB" size="small" color="primary" />
                  </Stack>
                </Stack>
              </label>
            </Paper>
          ) : (
            <Stack spacing={3}>
              <Box
                component={motion.div}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                sx={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: 500,
                  height: 400,
                  mx: 'auto',
                  borderRadius: 3,
                  overflow: 'hidden',
                  border: '2px solid',
                  borderColor: 'divider',
                  bgcolor: 'grey.50',
                }}
              >
                <Image
                  src={previewUrl}
                  alt="Design preview"
                  fill
                  style={{ objectFit: 'contain', padding: '16px' }}
                />
              </Box>

              <Alert
                severity="success"
                icon={<CheckCircleIcon />}
                sx={{ borderRadius: 2 }}
              >
                <Typography variant="body2" fontWeight={600}>
                  Design uploaded: {selectedFile?.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Size: {selectedFile && getFileSizeDisplay(selectedFile.size)}
                </Typography>
              </Alert>

              <Stack direction="row" spacing={2}>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<ImageIcon />}
                  fullWidth
                >
                  Choose Different File
                  <input
                    type="file"
                    hidden
                    accept={ACCEPTED_FORMATS.join(',')}
                    onChange={handleInputChange}
                  />
                </Button>

                <Button
                  variant="contained"
                  size="large"
                  onClick={handleSubmit}
                  fullWidth
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    fontWeight: 700,
                    py: 1.5,
                  }}
                >
                  Continue to Product Selection →
                </Button>
              </Stack>
            </Stack>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </CardContent>
      </Card>

      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Design Tips for Best Results
        </Typography>
        <Stack spacing={1}>
          <Typography variant="body2" color="text.secondary">
            • Use high-resolution images (300 DPI or higher) for best print quality
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • PNG files with transparent backgrounds work best for most products
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Make sure text is readable and not too small
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Use vibrant colors - they look great on products!
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
}
