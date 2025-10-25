'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  LinearProgress,
  Stack,
  TextField,
  MenuItem,
  Chip,
  Alert,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import { Design, DESIGN_CATEGORIES } from '@/lib/types/design';
import { listyboxGradients } from '@/lib/theme/podTheme';

interface DesignUploaderProps {
  onUploadComplete?: (designs: Design[]) => void;
  maxSize?: number; // in bytes
  multiple?: boolean;
}

export function DesignUploader({
  onUploadComplete,
  maxSize = 10 * 1024 * 1024, // 10MB default
  multiple = true,
}: DesignUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState('Custom');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (file) => file.type.startsWith('image/')
    );

    if (!multiple && droppedFiles.length > 0) {
      setFiles([droppedFiles[0]]);
    } else {
      setFiles(droppedFiles);
    }
    setError(null);
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      if (!multiple && selectedFiles.length > 0) {
        setFiles([selectedFiles[0]]);
      } else {
        setFiles(selectedFiles);
      }
      setError(null);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please select at least one file');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const uploadedDesigns: Design[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Check file size
        if (file.size > maxSize) {
          throw new Error(`File ${file.name} is too large (max ${maxSize / 1024 / 1024}MB)`);
        }

        // Convert to base64
        const base64 = await fileToBase64(file);

        // Upload to API
        const response = await fetch('/api/designs/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
            image: base64,
            category,
            tags,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Upload failed');
        }

        const data = await response.json();
        uploadedDesigns.push(data.design);

        // Update progress
        setUploadProgress(((i + 1) / files.length) * 100);
      }

      // Success
      onUploadComplete?.(uploadedDesigns);

      // Reset
      setFiles([]);
      setTags([]);
      setUploadProgress(0);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload designs');
    } finally {
      setUploading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert file'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <Box>
      {/* Drop Zone */}
      <Paper
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        sx={{
          p: 4,
          textAlign: 'center',
          cursor: 'pointer',
          borderRadius: 3,
          border: 2,
          borderStyle: 'dashed',
          borderColor: isDragging ? 'primary.main' : 'divider',
          bgcolor: isDragging ? (theme) => theme.palette.action.hover : 'background.paper',
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: (theme) => theme.palette.action.hover,
          },
        }}
      >
        <CloudUploadIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
        <Typography variant="h6" fontWeight={700} gutterBottom>
          {isDragging ? 'Drop files here' : 'Drag & drop designs here'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          or click to browse • PNG, JPG, WebP • Max {maxSize / 1024 / 1024}MB
        </Typography>
        <input
          ref={fileInputRef}
          type="file"
          hidden
          accept="image/*"
          multiple={multiple}
          onChange={handleFileInput}
        />
      </Paper>

      {/* Selected Files */}
      {files.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Selected Files ({files.length})
          </Typography>

          <Stack spacing={1}>
            {files.map((file, index) => (
              <Paper
                key={index}
                sx={{
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderRadius: 2,
                }}
              >
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {file.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {(file.size / 1024).toFixed(2)} KB
                  </Typography>
                </Box>
                <Button
                  size="small"
                  color="error"
                  onClick={() => removeFile(index)}
                  disabled={uploading}
                >
                  <CloseIcon fontSize="small" />
                </Button>
              </Paper>
            ))}
          </Stack>

          {/* Settings */}
          <Box sx={{ mt: 3 }}>
            <TextField
              select
              fullWidth
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              sx={{ mb: 2 }}
              disabled={uploading}
            >
              {DESIGN_CATEGORIES.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </TextField>

            <Stack direction="row" spacing={1} alignItems="center" mb={2}>
              <TextField
                fullWidth
                size="small"
                label="Add tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                disabled={uploading}
              />
              <Button variant="outlined" onClick={handleAddTag} disabled={uploading}>
                Add
              </Button>
            </Stack>

            {tags.length > 0 && (
              <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5} mb={2}>
                {tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => removeTag(tag)}
                    size="small"
                    disabled={uploading}
                  />
                ))}
              </Stack>
            )}
          </Box>

          {/* Upload Progress */}
          {uploading && (
            <Box sx={{ mb: 2 }}>
              <LinearProgress variant="determinate" value={uploadProgress} sx={{ height: 8, borderRadius: 4 }} />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                Uploading... {Math.round(uploadProgress)}%
              </Typography>
            </Box>
          )}

          {/* Error */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Upload Button */}
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handleUpload}
            disabled={uploading || files.length === 0}
            sx={{
              background: listyboxGradients.pink,
              fontWeight: 700,
              '&:hover': {
                background: listyboxGradients.pink,
              },
            }}
          >
            {uploading ? 'Uploading...' : `Upload ${files.length} Design${files.length > 1 ? 's' : ''}`}
          </Button>
        </Box>
      )}
    </Box>
  );
}
