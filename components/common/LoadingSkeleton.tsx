'use client';

import { Skeleton, Stack, Box, Card, CardContent, Grid } from '@mui/material';

interface LoadingSkeletonProps {
  variant?: 'card' | 'form' | 'image' | 'table' | 'text' | 'custom';
  count?: number;
}

export default function LoadingSkeleton({ variant = 'card', count = 1 }: LoadingSkeletonProps) {
  if (variant === 'card') {
    return (
      <Grid container spacing={3}>
        {Array.from({ length: count }).map((_, idx) => (
          <Grid item xs={12} sm={6} md={4} key={idx}>
            <Card>
              <Skeleton variant="rectangular" height={200} />
              <CardContent>
                <Skeleton variant="text" width="80%" height={30} />
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  if (variant === 'form') {
    return (
      <Stack spacing={3}>
        <Skeleton variant="text" width="40%" height={40} />
        <Skeleton variant="rectangular" height={56} />
        <Skeleton variant="rectangular" height={56} />
        <Skeleton variant="rectangular" height={120} />
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Skeleton variant="rectangular" width={100} height={40} />
          <Skeleton variant="rectangular" width={100} height={40} />
        </Stack>
      </Stack>
    );
  }

  if (variant === 'image') {
    return (
      <Grid container spacing={2}>
        {Array.from({ length: count || 9 }).map((_, idx) => (
          <Grid item xs={6} sm={4} md={3} key={idx}>
            <Skeleton variant="rectangular" sx={{ aspectRatio: '1/1', borderRadius: 2 }} />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (variant === 'table') {
    return (
      <Stack spacing={2}>
        <Skeleton variant="rectangular" height={50} />
        {Array.from({ length: count || 5 }).map((_, idx) => (
          <Skeleton key={idx} variant="rectangular" height={60} />
        ))}
      </Stack>
    );
  }

  if (variant === 'text') {
    return (
      <Stack spacing={1}>
        {Array.from({ length: count || 3 }).map((_, idx) => (
          <Skeleton key={idx} variant="text" width={`${100 - idx * 10}%`} />
        ))}
      </Stack>
    );
  }

  // Custom variant - just basic skeleton
  return <Skeleton variant="rectangular" height={200} />;
}

// Specific skeleton components for common use cases
export function ListingCardSkeleton({ count = 3 }: { count?: number }) {
  return <LoadingSkeleton variant="card" count={count} />;
}

export function FormSkeleton() {
  return <LoadingSkeleton variant="form" />;
}

export function ImageGridSkeleton({ count = 9 }: { count?: number }) {
  return <LoadingSkeleton variant="image" count={count} />;
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return <LoadingSkeleton variant="table" count={rows} />;
}

export function TextSkeleton({ lines = 3 }: { lines?: number }) {
  return <LoadingSkeleton variant="text" count={lines} />;
}
