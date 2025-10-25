'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  alpha,
} from '@mui/material';
import { motion } from 'framer-motion';

interface Collection {
  uuid: string;
  name: string;
  mockup_count: number;
  created_at: string;
}

interface ProductTypeSelectorProps {
  onSelect: (collection: Collection) => void;
}

// Icon mapping for common product types
const getProductIcon = (name: string): string => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('tshirt') || lowerName.includes('t-shirt')) return '👕';
  if (lowerName.includes('mug') || lowerName.includes('cup')) return '☕';
  if (lowerName.includes('hoodie') || lowerName.includes('sweatshirt')) return '🧥';
  if (lowerName.includes('phone') || lowerName.includes('case')) return '📱';
  if (lowerName.includes('bag') || lowerName.includes('tote')) return '👜';
  if (lowerName.includes('hat') || lowerName.includes('cap')) return '🧢';
  if (lowerName.includes('poster') || lowerName.includes('print')) return '🖼️';
  if (lowerName.includes('sticker')) return '🏷️';
  if (lowerName.includes('notebook') || lowerName.includes('journal')) return '📓';
  if (lowerName.includes('pillow') || lowerName.includes('cushion')) return '🛋️';
  return '🎨'; // Default
};

export default function ProductTypeSelector({ onSelect }: ProductTypeSelectorProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUUID, setSelectedUUID] = useState<string | null>(null);
  const [isMockData, setIsMockData] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      setError(null);
      setWarning(null);

      console.log('📥 Fetching collections...');
      const response = await fetch('/api/mockups/collections');

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch collections: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Collections fetched:', data.collections);

      if (data.mock) {
        setIsMockData(true);
        setWarning(data.warning || 'Using mock data for development');
        console.warn('⚠️ Using mock collections data');
      }

      if (!data.collections || data.collections.length === 0) {
        setError('No collections found. Please create collections in your Dynamic Mockups dashboard.');
      } else {
        setCollections(data.collections);
      }
    } catch (err) {
      console.error('❌ Failed to fetch collections:', err);
      setError(err instanceof Error ? err.message : 'Failed to load product types');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleSelect = (collection: Collection) => {
    setSelectedUUID(collection.uuid);
    onSelect(collection);
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <CircularProgress size={60} />
        <Typography variant="body1" sx={{ mt: 2 }} color="text.secondary">
          Loading product types...
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
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Select Product Type
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Choose the type of product you want to create mockups for
      </Typography>

      {warning && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2" fontWeight={600} gutterBottom>
            Development Mode
          </Typography>
          <Typography variant="body2">
            {warning}
          </Typography>
        </Alert>
      )}

      <Grid container spacing={2}>
        {collections.map((collection, index) => {
          const isSelected = selectedUUID === collection.uuid;
          const icon = getProductIcon(collection.name);

          return (
            <Grid item xs={12} sm={6} md={4} key={collection.uuid}>
              <Card
                component={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleSelect(collection)}
                sx={{
                  cursor: 'pointer',
                  borderRadius: 3,
                  border: 2,
                  borderColor: isSelected ? 'primary.main' : 'transparent',
                  bgcolor: isSelected
                    ? (theme) => alpha(theme.palette.primary.main, 0.08)
                    : 'background.paper',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                    borderColor: 'primary.main',
                  },
                }}
              >
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="h1" sx={{ mb: 1, fontSize: '3rem' }}>
                    {icon}
                  </Typography>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    {collection.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {collection.mockup_count} mockup{collection.mockup_count !== 1 ? 's' : ''}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {collections.length === 0 && (
        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2" fontWeight={600} gutterBottom>
            No collections found
          </Typography>
          <Typography variant="body2">
            Please create collections in your{' '}
            <a
              href="https://dynamicmockups.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'inherit', textDecoration: 'underline' }}
            >
              Dynamic Mockups dashboard
            </a>
            {' '}and organize your mockups by product type.
          </Typography>
        </Alert>
      )}
    </Box>
  );
}
