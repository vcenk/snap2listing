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
  Paper,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { ProductCard } from './ProductCard';
import { Product, ProductStatus } from '@/lib/types/product';
import { listyboxGradients } from '@/lib/theme/podTheme';
import { PRODUCT_CATALOG } from '@/lib/data/productCatalog';

interface ProductGridProps {
  onCreateProduct?: () => void;
  onViewProduct?: (product: Product) => void;
  onEditProduct?: (productId: string) => void;
}

const STATUS_FILTERS: ProductStatus[] = ['draft', 'published', 'archived'];

export function ProductGrid({ onCreateProduct, onViewProduct, onEditProduct }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProductStatus | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/products/list');

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    setProductToDelete(productId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    try {
      // TODO: Implement delete API
      // For now, just remove from local state
      setProducts(products.filter((p) => p.id !== productToDelete));
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    } catch (err) {
      console.error('Failed to delete product:', err);
      setError('Failed to delete product');
    }
  };

  const handleStatusChange = async (productId: string, newStatus: ProductStatus) => {
    try {
      // TODO: Implement update API
      // For now, update local state
      setProducts(
        products.map((p) =>
          p.id === productId ? { ...p, status: newStatus, updatedAt: new Date() } : p
        )
      );
    } catch (err) {
      console.error('Failed to update product status:', err);
      setError('Failed to update product status');
    }
  };

  const filteredProducts = products.filter((product) => {
    // Status filter
    if (statusFilter && product.status !== statusFilter) {
      return false;
    }

    // Type filter
    if (typeFilter && product.productType !== typeFilter) {
      return false;
    }

    // Search filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      return (
        product.name.toLowerCase().includes(lowerSearch) ||
        product.description.toLowerCase().includes(lowerSearch) ||
        product.productType.toLowerCase().includes(lowerSearch)
      );
    }

    return true;
  });

  // Get unique product types from catalog
  const productTypes = PRODUCT_CATALOG.map((p) => ({ id: p.id, name: p.name, icon: p.icon }));

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <CircularProgress size={60} />
        <Typography variant="body1" sx={{ mt: 2 }} color="text.secondary">
          Loading products...
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
            My Products
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {products.length} product{products.length !== 1 ? 's' : ''} total
            {filteredProducts.length !== products.length &&
              ` • ${filteredProducts.length} filtered`}
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onCreateProduct}
          sx={{
            background: listyboxGradients.pink,
            fontWeight: 700,
            '&:hover': {
              background: listyboxGradients.pink,
            },
          }}
        >
          Create Product
        </Button>
      </Stack>

      {/* Search & Filters */}
      <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 3 }}>
        <Stack spacing={2}>
          {/* Search */}
          <TextField
            fullWidth
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />

          {/* Status Filters */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
              Status
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
              <Chip
                label="All"
                onClick={() => setStatusFilter(null)}
                color={statusFilter === null ? 'primary' : 'default'}
                sx={{ fontWeight: 600 }}
              />
              {STATUS_FILTERS.map((status) => (
                <Chip
                  key={status}
                  label={status.charAt(0).toUpperCase() + status.slice(1)}
                  onClick={() => setStatusFilter(status)}
                  color={statusFilter === status ? 'primary' : 'default'}
                  sx={{ fontWeight: 600 }}
                />
              ))}
            </Stack>
          </Box>

          {/* Product Type Filters */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
              Product Type
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
              <Chip
                label="All Types"
                onClick={() => setTypeFilter(null)}
                color={typeFilter === null ? 'primary' : 'default'}
                sx={{ fontWeight: 600 }}
              />
              {productTypes.map((type) => (
                <Chip
                  key={type.id}
                  label={`${type.icon} ${type.name}`}
                  onClick={() => setTypeFilter(type.id)}
                  color={typeFilter === type.id ? 'primary' : 'default'}
                  sx={{ fontWeight: 600 }}
                />
              ))}
            </Stack>
          </Box>
        </Stack>
      </Paper>

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <Grid container spacing={3}>
          {filteredProducts.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
              <ProductCard
                product={product}
                onClick={() => onViewProduct?.(product)}
                onEdit={onEditProduct}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {searchTerm || statusFilter || typeFilter ? 'No products found' : 'No products yet'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {searchTerm || statusFilter || typeFilter
              ? 'Try adjusting your filters'
              : 'Create your first product to get started!'}
          </Typography>
          {!searchTerm && !statusFilter && !typeFilter && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onCreateProduct}
              sx={{
                background: listyboxGradients.purple,
                fontWeight: 700,
              }}
            >
              Create Product
            </Button>
          )}
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle fontWeight={700}>Delete Product?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this product? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            sx={{ fontWeight: 700 }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
