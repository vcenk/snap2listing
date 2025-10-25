'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import { useAuth } from '@/lib/auth/context';
import { useToast } from '@/lib/contexts/ToastContext';
import ListingWizard from '@/components/CreateListing/EditListingWizard';

interface Listing {
  id: string;
  user_id: string;
  title: string;
  description: string;
  price: number;
  tags: string[];
  category: string;
  images: any[];
  video?: any;
  original_image: string;
  quantity: number;
  materials: string[];
  occasion?: string[];
  holiday?: string[];
  recipient?: string[];
  style?: string[];
  category_id?: number;
  who_made?: string;
  when_made?: string;
  is_customizable?: boolean;
  personalization_instructions?: string;
  personalization_char_limit?: number;
  processing_min?: number;
  processing_max?: number;
  status: string;
}

export default function EditListingPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && params.id) {
      fetchListing();
    }
  }, [user, params.id]);

  const fetchListing = async () => {
    if (!user || !params.id) return;

    try {
      const response = await fetch(`/api/listings/${params.id}?userId=${user.id}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError('Listing not found');
        } else if (response.status === 403) {
          setError('You do not have permission to edit this listing');
        } else {
          setError('Failed to load listing');
        }
        return;
      }

      const data = await response.json();
      setListing(data.listing);
      // Restore scroll position if present
      if (typeof window !== 'undefined' && data.listing?.scrollPosition) {
        setTimeout(() => window.scrollTo(0, data.listing.scrollPosition), 0);
      }
    } catch (error) {
      console.error('Error fetching listing:', error);
      setError('Failed to load listing');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 400,
          gap: 2,
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Loading listing...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Typography variant="body1" color="text.secondary" paragraph>
          {error === 'Listing not found'
            ? 'The listing you are trying to edit does not exist or has been deleted.'
            : error === 'You do not have permission to edit this listing'
            ? 'This listing belongs to another user.'
            : 'Please try again later or contact support if the problem persists.'}
        </Typography>
      </Box>
    );
  }

  if (!listing) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Alert severity="warning">
          No listing data available
        </Alert>
      </Box>
    );
  }

  return <ListingWizard initialData={listing} isEditMode />;
}
