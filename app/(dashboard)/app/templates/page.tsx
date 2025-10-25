'use client';

import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Stack,
  IconButton,
  alpha,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import StyleIcon from '@mui/icons-material/Style';
import DiamondIcon from '@mui/icons-material/Diamond';
import PaletteIcon from '@mui/icons-material/Palette';
import HomeIcon from '@mui/icons-material/Home';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import WatchIcon from '@mui/icons-material/Watch';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// Pre-made templates for common Etsy categories
const TEMPLATE_LIBRARY = [
  {
    id: 'vintage-jewelry',
    name: 'Vintage Jewelry',
    description: 'Perfect for antique rings, necklaces, and bracelets with a classic aesthetic',
    icon: <DiamondIcon />,
    color: '#9C27B0',
    prompt: 'vintage jewelry piece on elegant display, soft lighting, detailed craftsmanship',
    tags: ['vintage', 'jewelry', 'handmade', 'antique', 'gift'],
    style: 'vintage',
    category: 'Jewelry',
  },
  {
    id: 'modern-art',
    name: 'Modern Art Prints',
    description: 'Contemporary designs for posters, wall art, and digital downloads',
    icon: <PaletteIcon />,
    color: '#2196F3',
    prompt: 'modern minimalist art design, clean lines, contemporary aesthetic',
    tags: ['art', 'print', 'modern', 'wall decor', 'downloadable'],
    style: 'modern',
    category: 'Art',
  },
  {
    id: 'home-decor',
    name: 'Home Decor',
    description: 'Cozy items for living spaces, including cushions, candles, and accessories',
    icon: <HomeIcon />,
    color: '#FF9800',
    prompt: 'cozy home decor item in warm interior setting, lifestyle photography',
    tags: ['home decor', 'cozy', 'handmade', 'gift', 'interior'],
    style: 'lifestyle',
    category: 'Home & Living',
  },
  {
    id: 'kids-toys',
    name: 'Kids & Baby',
    description: 'Playful designs for toys, clothing, and nursery items',
    icon: <ChildCareIcon />,
    color: '#4CAF50',
    prompt: 'colorful children\'s item, playful and safe, bright natural lighting',
    tags: ['kids', 'baby', 'toys', 'handmade', 'gift'],
    style: 'playful',
    category: 'Toys & Games',
  },
  {
    id: 'accessories',
    name: 'Fashion Accessories',
    description: 'Trendy bags, scarves, and wearable items with style',
    icon: <WatchIcon />,
    color: '#E91E63',
    prompt: 'stylish fashion accessory, editorial photography, clean background',
    tags: ['fashion', 'accessories', 'style', 'handmade', 'trending'],
    style: 'editorial',
    category: 'Accessories',
  },
  {
    id: 'custom-gifts',
    name: 'Custom Gifts',
    description: 'Personalized items perfect for special occasions',
    icon: <FavoriteIcon />,
    color: '#F44336',
    prompt: 'personalized gift item, meaningful and special, warm atmosphere',
    tags: ['gift', 'personalized', 'custom', 'special', 'handmade'],
    style: 'warm',
    category: 'Gifts',
  },
];

export default function TemplatesPage() {
  const router = useRouter();

  const handleUseTemplate = (template: typeof TEMPLATE_LIBRARY[0]) => {
    // Store template data in localStorage to pre-fill the create page
    localStorage.setItem('selectedTemplate', JSON.stringify({
      prompt: template.prompt,
      tags: template.tags,
      style: template.style,
      category: template.category,
    }));

    // Navigate to create page
    router.push('/app/create');
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h2" gutterBottom>
            Listing Templates
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Start with a professional template to create listings faster
          </Typography>
        </Box>
      </Stack>

      {/* Template Library */}
      <Grid container spacing={3}>
        {TEMPLATE_LIBRARY.map((template) => (
          <Grid item xs={12} sm={6} lg={4} key={template.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                border: '2px solid',
                borderColor: 'transparent',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 6,
                  borderColor: template.color,
                },
              }}
            >
              {/* Header with icon */}
              <Box
                sx={{
                  bgcolor: alpha(template.color, 0.1),
                  p: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    color: template.color,
                    bgcolor: 'white',
                    borderRadius: 2,
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 32,
                    boxShadow: 2,
                  }}
                >
                  {template.icon}
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" fontWeight={700}>
                    {template.name}
                  </Typography>
                  <Chip
                    label={template.category}
                    size="small"
                    sx={{
                      mt: 0.5,
                      bgcolor: 'white',
                      fontWeight: 600,
                    }}
                  />
                </Box>
              </Box>

              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {template.description}
                </Typography>

                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={1}>
                  INCLUDES:
                </Typography>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                  {template.tags.slice(0, 4).map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.7rem' }}
                    />
                  ))}
                  {template.tags.length > 4 && (
                    <Chip
                      label={`+${template.tags.length - 4} more`}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.7rem' }}
                    />
                  )}
                </Stack>
              </CardContent>

              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => handleUseTemplate(template)}
                  sx={{
                    bgcolor: template.color,
                    '&:hover': {
                      bgcolor: template.color,
                      opacity: 0.9,
                    },
                    textTransform: 'none',
                    fontWeight: 600,
                    py: 1.5,
                  }}
                >
                  Use This Template
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Info Section */}
      <Card sx={{ mt: 4, bgcolor: alpha('#2196F3', 0.05), border: 'none' }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <StyleIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom fontWeight={600}>
            More Templates Coming Soon!
          </Typography>
          <Typography variant="body1" color="text.secondary" maxWidth={600} mx="auto">
            We&apos;re constantly adding new templates based on trending Etsy categories.
            Start with these curated templates to create professional listings in seconds.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
