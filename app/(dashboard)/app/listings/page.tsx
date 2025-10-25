'use client';

import {
  Box,
  Button,
  Stack,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Skeleton,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { useToast } from '@/lib/contexts/ToastContext';
import { supabase } from '@/lib/supabase/client';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import EmptyState from '@/components/common/EmptyState';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

interface ListingChannelSummary {
  channelId: string;
  channelSlug: string;
  channelName?: string;
  readinessScore?: number;
  isReady?: boolean;
}

interface Listing {
  id: string;
  userId: string;
  status: string;
  title: string;
  description: string;
  price: number;
  previewImage: string;
  channelCount: number;
  channels?: ListingChannelSummary[];
  imageCount: number;
  seoScore: number;
  createdAt: string;
  updatedAt: string;
}

interface Shop {
  id: string;
  shop_id: string;
  shop_name: string;
  status: string;
}

export default function ListingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  // Export dialog state
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  const [listingChannels, setListingChannels] = useState<{ channelId: string; channelSlug: string; readinessScore?: number; isReady?: boolean; title?: string }[]>([]);
  const [selectedChannelId, setSelectedChannelId] = useState('');
  const [preflight, setPreflight] = useState<{ validation: any; preflightChecks: any[] } | null>(null);
  // Selection state for multi-delete
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      fetchListings();
    }
  }, [user]);

  const fetchListings = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/listings?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setListings(data.listings || []);
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleEdit = (listingId: string) => {
    // TODO: Navigate to edit page once we implement it
    router.push(`/app/listings/${listingId}/edit`);
  };

  const handleExportClick = async (listing: Listing) => {
    if (!user) return;
    setSelectedListing(listing);
    setExportError('');
    setListingChannels([]);
    setSelectedChannelId('');
    try {
      const res = await fetch(`/api/listings/${listing.id}?userId=${user.id}`);
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.error || 'Failed to load listing');
      const chans = (data.listing.channels || []) as { channelId: string; channelSlug: string; readinessScore?: number; isReady?: boolean; title?: string }[];
      setListingChannels(chans);
      if (chans[0]?.channelId) setSelectedChannelId(chans[0].channelId);
      setExportDialogOpen(true);
    } catch (e: any) {
      setExportError(e.message);
      setExportDialogOpen(true);
    }
  };

  // Load preflight when channel selection changes
  useEffect(() => {
    const loadPreflight = async () => {
      if (!selectedListing || !selectedChannelId) return;
      try {
        const res = await fetch(`/api/export?listingId=${selectedListing.id}&channelId=${selectedChannelId}`);
        const data = await res.json();
        if (!res.ok || !data?.success) throw new Error(data?.error || 'Failed to load preflight');
        setPreflight({ validation: data.validation, preflightChecks: data.preflightChecks });
      } catch (e: any) {
        setPreflight(null);
      }
    };
    loadPreflight();
  }, [selectedChannelId, selectedListing]);

  const handleExport = async () => {
    if (!user || !selectedListing || !selectedChannelId) return;
    setExporting(true);
    setExportError('');
    try {
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: selectedListing.id, channelId: selectedChannelId }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.error || 'Export failed');
      // Download file
      const byteChars = atob(data.file.content);
      const byteNumbers = new Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i);
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: data.file.contentType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.file.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success('Export generated');
      setExportDialogOpen(false);
    } catch (e: any) {
      setExportError(e.message);
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) {
      return;
    }

    if (!user) return;

    try {
      const response = await fetch(`/api/listings?id=${id}&userId=${user.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setListings(listings.filter((listing) => listing.id !== id));
        setSelectedIds((prev) => prev.filter((sid) => sid !== id));
        toast.success('Listing deleted successfully');
      } else {
        throw new Error('Failed to delete listing');
      }
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast.error('Failed to delete listing');
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const currentIds = filteredListings.map((l) => l.id);
    const allSelected = currentIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !currentIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...currentIds])));
    }
  };

  const handleBulkDelete = async () => {
    if (!user || selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} selected listing(s)?`)) return;

    try {
      const res = await fetch(`/api/listings?userId=${user.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, userId: user.id }),
      });
      if (!res.ok) throw new Error('Failed to delete selected listings');
      setListings((prev) => prev.filter((l) => !selectedIds.includes(l.id)));
      setSelectedIds([]);
      toast.success('Selected listings deleted');
    } catch (e) {
      console.error(e);
      toast.error('Failed to delete selected listings');
    }
  };

  const filteredListings = listings.filter((listing) => {
    const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || listing.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h2">My Listings</Typography>
        <Button
          component={Link}
          href="/app/create"
          variant="contained"
          size="large"
        >
          + Create New
        </Button>
      </Stack>

      <Stack direction="row" spacing={2} mb={2}>
        <TextField
          placeholder="Search listings..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ flexGrow: 1 }}
        />
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filterStatus}
            label="Status"
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="draft">Drafts</MenuItem>
            <MenuItem value="optimized">Optimized</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {filteredListings.length > 0 && (
        <Stack direction="row" spacing={2} alignItems="center" mb={4}>
          <FormControlLabel
            control={
              <Checkbox
                checked={filteredListings.every((l) => selectedIds.includes(l.id)) && filteredListings.length > 0}
                indeterminate={
                  selectedIds.length > 0 &&
                  !filteredListings.every((l) => selectedIds.includes(l.id))
                }
                onChange={toggleSelectAll}
              />
            }
            label="Select all on page"
          />
          <Button
            variant="outlined"
            color="error"
            disabled={selectedIds.length === 0}
            onClick={handleBulkDelete}
          >
            Delete selected ({selectedIds.length})
          </Button>
        </Stack>
      )}

      {loading ? (
        <Grid container spacing={3}>
          {Array.from({ length: 6 }).map((_, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Card>
                <Skeleton variant="rectangular" height={250} />
                <CardContent>
                  <Stack spacing={1}>
                    <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 3 }} />
                    <Skeleton variant="text" width="90%" height={30} />
                    <Skeleton variant="text" width="40%" height={35} />
                    <Skeleton variant="text" width="60%" />
                  </Stack>
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Stack direction="row" spacing={1}>
                    <Skeleton variant="circular" width={32} height={32} />
                    <Skeleton variant="circular" width={32} height={32} />
                  </Stack>
                  <Skeleton variant="rectangular" width={90} height={32} sx={{ borderRadius: 1 }} />
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : filteredListings.length === 0 ? (
        <EmptyState
          icon={<AddCircleOutlineIcon fontSize="inherit" />}
          title={listings.length === 0 ? "No listings yet" : "No listings match your search"}
          description={listings.length === 0 ? "Create your first AI-powered, multi-channel listing in minutes" : "Try adjusting your search or filter"}
          action={listings.length === 0 ? {
            label: 'Create Listing',
            onClick: () => window.location.href = '/app/create',
          } : undefined}
        />
      ) : (
        <Grid container spacing={3}>
          {filteredListings.map((listing) => (
            <Grid item xs={12} sm={6} md={4} key={listing.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  maxWidth: '100%',
                  overflow: 'hidden',
                }}
              >
                <CardMedia
                  component="img"
                  height="250"
                  image={listing.previewImage || 'https://via.placeholder.com/400'}
                  alt={listing.title}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1, width: '100%' }}>
                  <Stack spacing={1}>
                    <Chip
                      label={listing.status}
                      size="small"
                      color={
                        listing.status === 'completed' ? 'success' :
                        listing.status === 'optimized' ? 'primary' :
                        'default'
                      }
                      sx={{ alignSelf: 'flex-start' }}
                    />
                    <Typography
                      variant="h6"
                      sx={{
                        lineHeight: 1.3,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        wordBreak: 'break-word',
                      }}
                    >
                      {listing.title}
                    </Typography>
                    <Typography variant="h5" color="primary">
                      ${listing.price}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {listing.imageCount} images • {listing.channelCount} channels • SEO: {listing.seoScore}/100
                    </Typography>
                  </Stack>
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Checkbox
                      size="small"
                      checked={selectedIds.includes(listing.id)}
                      onChange={() => toggleSelect(listing.id)}
                      inputProps={{ 'aria-label': `select ${listing.title}` }}
                    />
                    <IconButton size="small" color="primary" onClick={() => handleEdit(listing.id)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(listing.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {/* Channel readiness chips */}
                    {listing.channels?.slice(0, 3).map((ch) => (
                      <Chip
                        key={ch.channelId}
                        label={ch.channelName || ch.channelSlug}
                        size="small"
                        color={ch.isReady ? 'success' : 'default'}
                        variant={ch.isReady ? 'filled' : 'outlined'}
                      />
                    ))}
                    {listing.channelCount > 3 && (
                      <Chip label={`+${listing.channelCount - 3}`} size="small" />
                    )}
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<FileDownloadIcon />}
                      onClick={() => handleExportClick(listing)}
                    >
                      Export
                    </Button>
                  </Stack>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onClose={() => !exporting && setExportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Export Listing</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {exportError && (
              <Alert severity="error" onClose={() => setExportError('')}>
                {exportError}
              </Alert>
            )}

            <Typography variant="body2" color="text.secondary">
              Choose a channel to generate an export file.
            </Typography>

            <FormControl fullWidth>
              <InputLabel>Channel</InputLabel>
              <Select
                value={selectedChannelId}
                label="Channel"
                onChange={(e) => setSelectedChannelId(e.target.value)}
                disabled={exporting}
              >
                {listingChannels.map((ch) => (
                  <MenuItem key={ch.channelId} value={ch.channelId}>
                    {(ch as any).channelName || ch.channelSlug} {typeof ch.readinessScore === 'number' ? `(${ch.readinessScore}%)` : ''} {ch.isReady === false ? '• Needs fixes' : ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedListing && (
              <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Listing Preview:
                </Typography>
                <Typography variant="body2">
                  <strong>Title:</strong> {selectedListing.title}
                </Typography>
                <Typography variant="body2">
                  <strong>Price:</strong> ${selectedListing.price}
                </Typography>
                <Typography variant="body2">
                  <strong>Images:</strong> {selectedListing.imageCount}
                </Typography>
                <Typography variant="body2">
                  <strong>Channels:</strong> {selectedListing.channelCount}
                </Typography>
                <Typography variant="body2">
                  <strong>SEO Score:</strong> {selectedListing.seoScore}/100
                </Typography>
              </Box>
            )}

            {/* Preflight checks */}
            {preflight && (
              <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Preflight Checks
                </Typography>
                <Stack spacing={1}>
                  {preflight.validation && (
                    <Alert severity={preflight.validation.isReady ? 'success' : 'warning'}>
                      {preflight.validation.isReady ? 'Ready to export' : 'Fix issues before export'}
                    </Alert>
                  )}
                  {preflight.preflightChecks?.map((check: any, idx: number) => (
                    <Alert key={idx} severity={check.status === 'pass' ? 'success' : check.status === 'warning' ? 'warning' : 'error'}>
                      <strong>{check.name}:</strong> {check.description}
                      {check.message ? ` — ${check.message}` : ''}
                    </Alert>
                  ))}
                </Stack>
              </Box>
            )}

            <Alert severity="info">
              Exports are downloaded as files (CSV/XLSX/TXT) depending on channel. Use the chosen platform to import or proceed with listing.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)} disabled={exporting}>
            Cancel
          </Button>
          <Button onClick={handleExport} variant="contained" disabled={exporting || !selectedChannelId}>
            {exporting ? <CircularProgress size={20} /> : 'Export'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
