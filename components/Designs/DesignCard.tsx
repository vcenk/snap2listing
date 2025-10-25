import { Card, CardMedia, CardContent, Typography, Checkbox, Box, alpha, IconButton, Stack, Chip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useState } from 'react';
import { Design } from '@/lib/types/design';

interface DesignCardProps {
  design: Design;
  selected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
  onClick?: () => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
}

export function DesignCard({
  design,
  selected = false,
  onSelect,
  onClick,
  onDelete,
  onEdit,
}: DesignCardProps) {
  const [isHovered, setIsHovered] = useState(false);

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
        borderColor: selected ? 'primary.main' : 'transparent',
        bgcolor: selected ? alpha('#667eea', 0.05) : 'background.paper',
        '&:hover': {
          transform: 'scale(1.03)',
          boxShadow: 4,
          borderColor: selected ? 'primary.main' : alpha('#667eea', 0.3),
        },
      }}
    >
      {/* Image */}
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="200"
          image={design.imageUrl}
          alt={design.name}
          sx={{
            objectFit: 'cover',
            backgroundColor: alpha('#000', 0.05),
          }}
        />

        {/* Category Badge */}
        <Chip
          label={design.category}
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            fontWeight: 600,
            fontSize: '0.7rem',
            background: alpha('#fff', 0.9),
            backdropFilter: 'blur(10px)',
          }}
        />

        {/* Selection Checkbox */}
        {onSelect && (
          <Checkbox
            checked={selected}
            onChange={(e) => {
              e.stopPropagation();
              onSelect(design.id, e.target.checked);
            }}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: 'white',
              backgroundColor: alpha('#000', 0.3),
              borderRadius: 1,
              '&.Mui-checked': {
                color: 'primary.main',
                backgroundColor: 'white',
              },
              '&:hover': {
                backgroundColor: alpha('#000', 0.5),
              },
            }}
          />
        )}

        {/* Hover Overlay with Actions */}
        {isHovered && (onDelete || onEdit) && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
              p: 1,
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 0.5,
            }}
          >
            {onEdit && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(design.id);
                }}
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
            {onDelete && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(design.id);
                }}
                sx={{
                  color: 'white',
                  bgcolor: alpha('#f44336', 0.8),
                  '&:hover': {
                    bgcolor: '#f44336',
                  },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        )}
      </Box>

      {/* Content */}
      <CardContent sx={{ p: 1.5 }}>
        <Typography variant="body2" fontWeight={600} noWrap gutterBottom>
          {design.name}
        </Typography>

        {/* Tags */}
        {design.tags && design.tags.length > 0 && (
          <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
            {design.tags.slice(0, 2).map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                variant="outlined"
                sx={{
                  fontSize: '0.65rem',
                  height: 20,
                  '& .MuiChip-label': {
                    px: 0.75,
                  },
                }}
              />
            ))}
            {design.tags.length > 2 && (
              <Typography variant="caption" color="text.secondary">
                +{design.tags.length - 2} more
              </Typography>
            )}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
