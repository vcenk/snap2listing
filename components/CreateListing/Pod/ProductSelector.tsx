'use client';

import { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Chip,
  Stack,
  Tabs,
  Tab,
  Badge,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import HomeIcon from '@mui/icons-material/Home';
import DevicesIcon from '@mui/icons-material/Devices';
import CreateIcon from '@mui/icons-material/Create';
import { motion } from 'framer-motion';

interface ProductSelectorProps {
  onSelect: (productType: string) => void;
}

const PRODUCT_CATEGORIES = [
  { id: 'all', label: 'All Products', icon: <LocalMallIcon /> },
  { id: 'apparel', label: 'Apparel', icon: <LocalMallIcon /> },
  { id: 'home', label: 'Home & Living', icon: <HomeIcon /> },
  { id: 'tech', label: 'Tech & Accessories', icon: <DevicesIcon /> },
  { id: 'stationery', label: 'Stationery', icon: <CreateIcon /> },
];

const PRODUCT_TYPES = [
  {
    id: 'tshirt',
    name: 'T-Shirt',
    category: 'apparel',
    description: 'Classic crew neck t-shirt in various colors',
    mockupTemplates: 15,
    popularity: 'high',
    emoji: '👕',
    colors: ['White', 'Black', 'Gray', 'Navy'],
  },
  {
    id: 'hoodie',
    name: 'Hoodie',
    category: 'apparel',
    description: 'Comfortable pullover hoodie',
    mockupTemplates: 12,
    popularity: 'high',
    emoji: '🧥',
    colors: ['White', 'Black', 'Gray'],
  },
  {
    id: 'tank-top',
    name: 'Tank Top',
    category: 'apparel',
    description: 'Sleeveless athletic tank',
    mockupTemplates: 8,
    popularity: 'medium',
    emoji: '🎽',
    colors: ['White', 'Black', 'Gray'],
  },
  {
    id: 'mug',
    name: 'Coffee Mug',
    category: 'home',
    description: '11oz ceramic coffee mug',
    mockupTemplates: 10,
    popularity: 'high',
    emoji: '☕',
    colors: ['White', 'Black'],
  },
  {
    id: 'poster',
    name: 'Poster',
    category: 'home',
    description: 'High-quality art print poster',
    mockupTemplates: 20,
    popularity: 'high',
    emoji: '🖼️',
    colors: ['White Background'],
  },
  {
    id: 'pillow',
    name: 'Throw Pillow',
    category: 'home',
    description: 'Decorative throw pillow with insert',
    mockupTemplates: 8,
    popularity: 'medium',
    emoji: '🛋️',
    colors: ['White', 'Beige'],
  },
  {
    id: 'canvas',
    name: 'Canvas Print',
    category: 'home',
    description: 'Gallery-wrapped canvas art',
    mockupTemplates: 15,
    popularity: 'high',
    emoji: '🎨',
    colors: ['White Background'],
  },
  {
    id: 'phone-case',
    name: 'Phone Case',
    category: 'tech',
    description: 'Protective slim phone case',
    mockupTemplates: 12,
    popularity: 'high',
    emoji: '📱',
    colors: ['Clear', 'White', 'Black'],
  },
  {
    id: 'laptop-sleeve',
    name: 'Laptop Sleeve',
    category: 'tech',
    description: 'Padded laptop protection sleeve',
    mockupTemplates: 6,
    popularity: 'medium',
    emoji: '💻',
    colors: ['Black'],
  },
  {
    id: 'tote-bag',
    name: 'Tote Bag',
    category: 'tech',
    description: 'Reusable canvas tote bag',
    mockupTemplates: 8,
    popularity: 'high',
    emoji: '👜',
    colors: ['Natural', 'Black'],
  },
  {
    id: 'notebook',
    name: 'Notebook',
    category: 'stationery',
    description: 'Spiral-bound notebook',
    mockupTemplates: 6,
    popularity: 'medium',
    emoji: '📓',
    colors: ['White Cover'],
  },
  {
    id: 'sticker',
    name: 'Sticker',
    category: 'stationery',
    description: 'Die-cut vinyl sticker',
    mockupTemplates: 10,
    popularity: 'high',
    emoji: '🏷️',
    colors: ['Transparent Background'],
  },
];

export default function ProductSelector({ onSelect }: ProductSelectorProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');

  const handleSelect = (productId: string) => {
    setSelected(productId);
  };

  const handleContinue = () => {
    if (selected) {
      const product = PRODUCT_TYPES.find((p) => p.id === selected);
      onSelect(selected);
    }
  };

  const filteredProducts =
    activeCategory === 'all'
      ? PRODUCT_TYPES
      : PRODUCT_TYPES.filter((p) => p.category === activeCategory);

  const selectedProduct = PRODUCT_TYPES.find((p) => p.id === selected);

  return (
    <Box>
      <Typography
        variant="h4"
        fontWeight={800}
        gutterBottom
        sx={{
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Select Product Type
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Choose which product you want to apply your design to
      </Typography>

      {/* Category Tabs */}
      <Tabs
        value={activeCategory}
        onChange={(_, newValue) => setActiveCategory(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        {PRODUCT_CATEGORIES.map((category) => (
          <Tab
            key={category.id}
            value={category.id}
            label={category.label}
            icon={category.icon}
            iconPosition="start"
          />
        ))}
      </Tabs>

      <Grid container spacing={2}>
        {filteredProducts.map((product, index) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <Card
              component={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -8 }}
              sx={{
                cursor: 'pointer',
                height: '100%',
                border: 2,
                borderColor: selected === product.id ? 'primary.main' : 'transparent',
                position: 'relative',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: 'primary.light',
                  boxShadow: 4,
                },
              }}
              onClick={() => handleSelect(product.id)}
            >
              {selected === product.id && (
                <CheckCircleIcon
                  color="primary"
                  sx={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    zIndex: 1,
                    fontSize: 32,
                    bgcolor: 'background.paper',
                    borderRadius: '50%',
                  }}
                />
              )}

              {product.popularity === 'high' && (
                <Chip
                  label="Popular"
                  size="small"
                  color="success"
                  sx={{
                    position: 'absolute',
                    top: 12,
                    left: 12,
                    zIndex: 1,
                    fontWeight: 700,
                  }}
                />
              )}

              <CardMedia
                component="div"
                sx={{
                  height: 180,
                  background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 80,
                }}
              >
                {product.emoji}
              </CardMedia>

              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  {product.name}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2, minHeight: 40 }}
                >
                  {product.description}
                </Typography>

                <Stack spacing={1}>
                  <Chip
                    label={`${product.mockupTemplates} mockup templates`}
                    size="small"
                    variant="outlined"
                    sx={{ alignSelf: 'flex-start' }}
                  />
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Available colors:
                    </Typography>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" mt={0.5}>
                      {product.colors.map((color) => (
                        <Chip key={color} label={color} size="small" />
                      ))}
                    </Stack>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {selected && (
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          sx={{
            mt: 4,
            p: 3,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #4facfe15 0%, #00f2fe15 100%)',
            border: '2px solid',
            borderColor: 'primary.main',
          }}
        >
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center">
            <Box flex={1}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Selected: {selectedProduct?.name} {selectedProduct?.emoji}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedProduct?.mockupTemplates} professional mockup templates available
              </Typography>
            </Box>
            <Button
              variant="contained"
              size="large"
              onClick={handleContinue}
              sx={{
                minWidth: { xs: '100%', md: 250 },
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                fontWeight: 700,
                py: 1.5,
              }}
            >
              Continue to Mockup Generator →
            </Button>
          </Stack>
        </Box>
      )}
    </Box>
  );
}
