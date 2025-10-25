import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Stack,
  Chip,
  IconButton,
  alpha,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PublishIcon from '@mui/icons-material/Publish';
import ArchiveIcon from '@mui/icons-material/Archive';
import { useState } from 'react';
import { Product } from '@/lib/types/product';
import { PRODUCT_CATALOG } from '@/lib/data/productCatalog';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: 'draft' | 'published' | 'archived') => void;
}

export function ProductCard({
  product,
  onClick,
  onEdit,
  onDelete,
  onStatusChange,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const productTypeInfo = PRODUCT_CATALOG.find((p) => p.id === product.productType);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleEdit = (event: React.MouseEvent) => {
    event.stopPropagation();
    handleMenuClose();
    onEdit?.(product.id);
  };

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    handleMenuClose();
    onDelete?.(product.id);
  };

  const handleStatusChange = (status: 'draft' | 'published' | 'archived') => (event: React.MouseEvent) => {
    event.stopPropagation();
    handleMenuClose();
    onStatusChange?.(product.id, status);
  };

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

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Get first mockup URL or fallback to placeholder
  const imageUrl =
    product.mockupUrls && product.mockupUrls.length > 0
      ? product.mockupUrls[0]
      : 'https://via.placeholder.com/600x600/667eea/ffffff?text=No+Mockup';

  return (
    <Card
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        border: 2,
        borderColor: 'transparent',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
          borderColor: alpha('#667eea', 0.3),
        },
      }}
    >
      {/* Image */}
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="240"
          image={imageUrl}
          alt={product.name}
          sx={{
            objectFit: 'cover',
            backgroundColor: alpha('#000', 0.05),
          }}
        />

        {/* Status Badge */}
        <Chip
          label={getStatusLabel(product.status)}
          size="small"
          color={getStatusColor(product.status)}
          sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            fontWeight: 600,
            fontSize: '0.7rem',
            background: alpha('#fff', 0.95),
            backdropFilter: 'blur(10px)',
          }}
        />

        {/* More Menu */}
        <IconButton
          onClick={handleMenuOpen}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor: alpha('#fff', 0.9),
            backdropFilter: 'blur(10px)',
            '&:hover': {
              bgcolor: 'white',
            },
          }}
        >
          <MoreVertIcon />
        </IconButton>

        {/* Hover Overlay */}
        {isHovered && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
              p: 2,
            }}
          >
            <Stack direction="row" spacing={1} justifyContent="center">
              {onEdit && (
                <IconButton
                  size="small"
                  onClick={handleEdit}
                  sx={{
                    color: 'white',
                    bgcolor: alpha('#fff', 0.2),
                    '&:hover': {
                      bgcolor: alpha('#fff', 0.3),
                    },
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              )}
              <IconButton
                size="small"
                onClick={onClick}
                sx={{
                  color: 'white',
                  bgcolor: alpha('#fff', 0.2),
                  '&:hover': {
                    bgcolor: alpha('#fff', 0.3),
                  },
                }}
              >
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Box>
        )}
      </Box>

      {/* Content */}
      <CardContent sx={{ p: 2 }}>
        <Typography variant="h6" fontWeight={700} noWrap gutterBottom>
          {product.name}
        </Typography>

        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
          <Typography variant="body2" sx={{ fontSize: '1.2rem' }}>
            {productTypeInfo?.icon}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {productTypeInfo?.name}
          </Typography>
        </Stack>

        {product.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 1.5,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {product.description}
          </Typography>
        )}

        <Typography variant="caption" color="text.secondary">
          {product.variants.length} variant{product.variants.length !== 1 ? 's' : ''}
        </Typography>
      </CardContent>

      {/* Action Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem onClick={onClick}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>

        {onEdit && (
          <MenuItem onClick={handleEdit}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit Product</ListItemText>
          </MenuItem>
        )}

        {onStatusChange && product.status !== 'published' && (
          <MenuItem onClick={handleStatusChange('published')}>
            <ListItemIcon>
              <PublishIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Publish</ListItemText>
          </MenuItem>
        )}

        {onStatusChange && product.status === 'published' && (
          <MenuItem onClick={handleStatusChange('draft')}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Move to Draft</ListItemText>
          </MenuItem>
        )}

        {onStatusChange && product.status !== 'archived' && (
          <MenuItem onClick={handleStatusChange('archived')}>
            <ListItemIcon>
              <ArchiveIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Archive</ListItemText>
          </MenuItem>
        )}

        {onDelete && (
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </Card>
  );
}
