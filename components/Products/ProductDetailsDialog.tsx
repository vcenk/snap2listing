'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Grid,
  Stack,
  Chip,
  Button,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  alpha,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import PublishIcon from '@mui/icons-material/Publish';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import { Product } from '@/lib/types/product';
import { PRODUCT_CATALOG } from '@/lib/data/productCatalog';
import { listyboxGradients } from '@/lib/theme/podTheme';

interface ProductDetailsDialogProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onStatusChange?: (status: 'draft' | 'published' | 'archived') => void;
}

export function ProductDetailsDialog({
  product,
  open,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
}: ProductDetailsDialogProps) {
  if (!product) return null;

  const productTypeInfo = PRODUCT_CATALOG.find((p) => p.id === product.productType);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'success';
      case 'draft':
        return 'warning';
      case 'archived':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 2,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="h6" fontWeight={700}>
            Product Details
          </Typography>
          <Chip label={product.status} size="small" color={getStatusColor(product.status)} />
        </Stack>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          {/* Main Product Info */}
          <Grid container spacing={3}>
            {/* Image Gallery */}
            <Grid item xs={12} md={5}>
              <Box>
                {product.mockupUrls.length > 0 ? (
                  <Box>
                    {/* Main Image */}
                    <Paper
                      elevation={2}
                      sx={{
                        borderRadius: 3,
                        overflow: 'hidden',
                        mb: 2,
                      }}
                    >
                      <img
                        src={product.mockupUrls[0]}
                        alt={product.name}
                        style={{
                          width: '100%',
                          aspectRatio: '1',
                          objectFit: 'cover',
                        }}
                      />
                    </Paper>

                    {/* Thumbnail Grid */}
                    {product.mockupUrls.length > 1 && (
                      <Grid container spacing={1}>
                        {product.mockupUrls.slice(1, 5).map((url, index) => (
                          <Grid item xs={3} key={index}>
                            <Paper
                              elevation={1}
                              sx={{
                                borderRadius: 2,
                                overflow: 'hidden',
                                cursor: 'pointer',
                                '&:hover': {
                                  transform: 'scale(1.05)',
                                  transition: 'transform 0.2s',
                                },
                              }}
                            >
                              <img
                                src={url}
                                alt={`Mockup ${index + 2}`}
                                style={{
                                  width: '100%',
                                  aspectRatio: '1',
                                  objectFit: 'cover',
                                }}
                              />
                            </Paper>
                          </Grid>
                        ))}
                        {product.mockupUrls.length > 5 && (
                          <Grid item xs={3}>
                            <Paper
                              elevation={1}
                              sx={{
                                borderRadius: 2,
                                aspectRatio: '1',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'action.hover',
                              }}
                            >
                              <Stack alignItems="center">
                                <ImageIcon color="action" />
                                <Typography variant="caption" color="text.secondary">
                                  +{product.mockupUrls.length - 5}
                                </Typography>
                              </Stack>
                            </Paper>
                          </Grid>
                        )}
                      </Grid>
                    )}
                  </Box>
                ) : (
                  <Paper
                    elevation={1}
                    sx={{
                      borderRadius: 3,
                      aspectRatio: '1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'action.hover',
                    }}
                  >
                    <Stack alignItems="center" spacing={1}>
                      <ImageIcon sx={{ fontSize: 60, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        No mockups
                      </Typography>
                    </Stack>
                  </Paper>
                )}
              </Box>
            </Grid>

            {/* Product Info */}
            <Grid item xs={12} md={7}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="h4" fontWeight={700} gutterBottom>
                    {product.name}
                  </Typography>
                  {product.description && (
                    <Typography variant="body1" color="text.secondary" paragraph>
                      {product.description}
                    </Typography>
                  )}
                </Box>

                <Divider />

                <Stack spacing={1.5}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Product Type
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      {productTypeInfo?.icon} {productTypeInfo?.name}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Design ID
                    </Typography>
                    <Typography variant="body2" fontFamily="monospace">
                      {product.designId}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Created
                    </Typography>
                    <Typography variant="body2">
                      {new Date(product.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Last Updated
                    </Typography>
                    <Typography variant="body2">
                      {new Date(product.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
            </Grid>
          </Grid>

          <Divider />

          {/* Variants */}
          <Box>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Variants ({product.variants.length})
            </Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'action.hover' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>SKU</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Color</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Size</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {product.variants.map((variant) => (
                    <TableRow key={variant.id} hover>
                      <TableCell>{variant.name}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {variant.sku}
                        </Typography>
                      </TableCell>
                      <TableCell>{variant.color || '-'}</TableCell>
                      <TableCell>{variant.size || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Actions */}
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            {onDelete && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={onDelete}
                sx={{ fontWeight: 600 }}
              >
                Delete
              </Button>
            )}

            {onStatusChange && product.status !== 'published' && (
              <Button
                variant="outlined"
                color="success"
                startIcon={<PublishIcon />}
                onClick={() => onStatusChange('published')}
                sx={{ fontWeight: 600 }}
              >
                Publish
              </Button>
            )}

            {onEdit && (
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={onEdit}
                sx={{
                  background: listyboxGradients.purple,
                  fontWeight: 700,
                }}
              >
                Edit Product
              </Button>
            )}
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
