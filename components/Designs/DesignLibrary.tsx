'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Button,
  Stack,
  TextField,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { DesignCard } from './DesignCard';
import { DesignUploader } from './DesignUploader';
import { Design, DESIGN_CATEGORIES } from '@/lib/types/design';
import { listyboxGradients } from '@/lib/theme/podTheme';

interface DesignLibraryProps {
  selectionMode?: boolean;
  onSelectDesigns?: (designs: Design[]) => void;
}

export function DesignLibrary({
  selectionMode = false,
  onSelectDesigns,
}: DesignLibraryProps) {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  useEffect(() => {
    fetchDesigns();
  }, []);

  const fetchDesigns = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/designs/list');

      if (!response.ok) {
        throw new Error('Failed to fetch designs');
      }

      const data = await response.json();
      setDesigns(data.designs || []);
    } catch (err) {
      console.error('Failed to fetch designs:', err);
      setError(err instanceof Error ? err.message : 'Failed to load designs');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (id: string, isSelected: boolean) => {
    if (isSelected) {
      setSelected([...selected, id]);
    } else {
      setSelected(selected.filter((s) => s !== id));
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this design?')) {
      // TODO: Implement delete API
      setDesigns(designs.filter((d) => d.id !== id));
    }
  };

  const handleUploadComplete = (newDesigns: Design[]) => {
    setDesigns([...newDesigns, ...designs]);
    setUploadDialogOpen(false);
  };

  const filteredDesigns = designs.filter((design) => {
    // Category filter
    if (categoryFilter && design.category !== categoryFilter) {
      return false;
    }

    // Search filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      return (
        design.name.toLowerCase().includes(lowerSearch) ||
        design.category.toLowerCase().includes(lowerSearch) ||
        design.tags.some((tag) => tag.toLowerCase().includes(lowerSearch))
      );
    }

    return true;
  });

  const handleConfirmSelection = () => {
    const selectedDesigns = designs.filter((d) => selected.includes(d.id));
    onSelectDesigns?.(selectedDesigns);
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <CircularProgress size={60} />
        <Typography variant="body1" sx={{ mt: 2 }} color="text.secondary">
          Loading designs...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Design Library
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {designs.length} design{designs.length !== 1 ? 's' : ''} available
            {selected.length > 0 && ` • ${selected.length} selected`}
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<UploadIcon />}
          onClick={() => setUploadDialogOpen(true)}
          sx={{
            background: listyboxGradients.pink,
            fontWeight: 700,
            '&:hover': {
              background: listyboxGradients.pink,
            },
          }}
        >
          Upload Design
        </Button>
      </Stack>

      {/* Search & Filters */}
      <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 3 }}>
        <Stack spacing={2}>
          {/* Search */}
          <TextField
            fullWidth
            placeholder="Search designs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />

          {/* Category Filters */}
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
            <Chip
              label="All Categories"
              onClick={() => setCategoryFilter(null)}
              color={categoryFilter === null ? 'primary' : 'default'}
              sx={{ fontWeight: 600 }}
            />
            {DESIGN_CATEGORIES.map((category) => (
              <Chip
                key={category}
                label={category}
                onClick={() => setCategoryFilter(category)}
                color={categoryFilter === category ? 'primary' : 'default'}
                sx={{ fontWeight: 600 }}
              />
            ))}
          </Stack>
        </Stack>
      </Paper>

      {/* Selection Actions */}
      {selectionMode && selected.length > 0 && (
        <Paper
          elevation={3}
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 3,
            background: listyboxGradients.blue,
            color: 'white',
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="body1" fontWeight={600}>
              {selected.length} design{selected.length !== 1 ? 's' : ''} selected
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                onClick={() => setSelected([])}
                sx={{
                  color: 'white',
                  borderColor: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                Clear
              </Button>
              <Button
                variant="contained"
                onClick={handleConfirmSelection}
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  fontWeight: 700,
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.9)',
                  },
                }}
              >
                Use {selected.length} Design{selected.length !== 1 ? 's' : ''}
              </Button>
            </Stack>
          </Stack>
        </Paper>
      )}

      {/* Design Grid */}
      {filteredDesigns.length > 0 ? (
        <Grid container spacing={2}>
          {filteredDesigns.map((design) => (
            <Grid item xs={6} sm={4} md={3} lg={2} key={design.id}>
              <DesignCard
                design={design}
                selected={selected.includes(design.id)}
                onSelect={selectionMode ? handleSelect : undefined}
                onDelete={handleDelete}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {searchTerm || categoryFilter
              ? 'No designs found'
              : 'No designs yet'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {searchTerm || categoryFilter
              ? 'Try adjusting your filters'
              : 'Upload your first design to get started!'}
          </Typography>
          {!searchTerm && !categoryFilter && (
            <Button
              variant="contained"
              startIcon={<UploadIcon />}
              onClick={() => setUploadDialogOpen(true)}
              sx={{
                background: listyboxGradients.purple,
                fontWeight: 700,
              }}
            >
              Upload Design
            </Button>
          )}
        </Box>
      )}

      {/* Upload Dialog */}
      <Dialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={700}>
            Upload Designs
          </Typography>
          <IconButton onClick={() => setUploadDialogOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <DesignUploader onUploadComplete={handleUploadComplete} />
        </DialogContent>
      </Dialog>
    </Box>
  );
}
