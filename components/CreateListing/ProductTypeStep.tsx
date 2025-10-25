'use client';

import { Box, Card, CardContent, Typography, Stack, Button } from '@mui/material';
import { motion } from 'framer-motion';
import InventoryIcon from '@mui/icons-material/Inventory';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import PrintIcon from '@mui/icons-material/Print';

interface ProductTypeStepProps {
  onSelect: (type: 'physical' | 'digital' | 'pod') => void;
}

export default function ProductTypeStep({ onSelect }: ProductTypeStepProps) {
  const productTypes = [
    {
      type: 'physical' as const,
      icon: <InventoryIcon sx={{ fontSize: 80 }} />,
      title: 'Physical Product',
      description: 'Tangible items that will be shipped to customers',
      examples: 'Clothing, Electronics, Books, Handmade items',
      emoji: '📦',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
      type: 'digital' as const,
      icon: <CloudDownloadIcon sx={{ fontSize: 80 }} />,
      title: 'Digital Product',
      description: 'Downloadable files or digital content',
      examples: 'Ebooks, Templates, Printables, Digital Art',
      emoji: '💾',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
    {
      type: 'pod' as const,
      icon: <PrintIcon sx={{ fontSize: 80 }} />,
      title: 'Print-on-Demand',
      description: 'Custom designs on products like t-shirts, mugs, and posters',
      examples: 'T-shirts, Mugs, Posters, Phone Cases',
      emoji: '🖨️',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
  ];

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', py: 4 }}>
      <Stack spacing={4} alignItems="center">
        {/* Header */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant="h3"
            sx={{
              fontSize: { xs: '2rem', md: '2.5rem' },
              fontWeight: 900,
              mb: 2,
            }}
          >
            What type of product are you listing?
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}
          >
            Choose the product type to get started
          </Typography>
        </Box>

        {/* Product Type Cards */}
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={4}
          sx={{ width: '100%', mt: 6 }}
        >
          {productTypes.map((product, index) => (
            <Box
              key={product.type}
              component={motion.div}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              sx={{ flex: 1 }}
            >
              <Card
                component={motion.div}
                whileHover={{ y: -12, scale: 1.03 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  borderRadius: 4,
                  border: '3px solid transparent',
                  background: product.gradient,
                  p: 0.3,
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onClick={() => onSelect(product.type)}
              >
                {/* Glow effect */}
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    background: product.gradient,
                    filter: 'blur(20px)',
                    opacity: 0.3,
                    zIndex: 0,
                  }}
                />

                {/* Inner card */}
                <CardContent
                  sx={{
                    background: '#fff',
                    borderRadius: 3.5,
                    p: 4,
                    height: '100%',
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  <Stack spacing={3} alignItems="center" textAlign="center">
                    {/* Emoji Icon */}
                    <Box
                      sx={{
                        width: 100,
                        height: 100,
                        borderRadius: 3,
                        background: product.gradient,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 60,
                        boxShadow: `0 10px 30px ${product.gradient.match(/#[0-9A-F]{6}/i)?.[0]}40`,
                      }}
                    >
                      {product.emoji}
                    </Box>

                    {/* Title */}
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 800,
                        fontSize: { xs: '1.5rem', md: '1.75rem' },
                      }}
                    >
                      {product.title}
                    </Typography>

                    {/* Description */}
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ lineHeight: 1.6 }}
                    >
                      {product.description}
                    </Typography>

                    {/* Examples */}
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        background: 'rgba(0, 0, 0, 0.02)',
                        border: '1px solid rgba(0, 0, 0, 0.05)',
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: 'text.secondary',
                          fontSize: '0.875rem',
                        }}
                      >
                        Examples: {product.examples}
                      </Typography>
                    </Box>

                    {/* Button */}
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      sx={{
                        mt: 2,
                        py: 1.5,
                        background: product.gradient,
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        textTransform: 'none',
                        borderRadius: 2,
                        boxShadow: `0 8px 20px ${product.gradient.match(/#[0-9A-F]{6}/i)?.[0]}30`,
                        '&:hover': {
                          boxShadow: `0 12px 30px ${product.gradient.match(/#[0-9A-F]{6}/i)?.[0]}40`,
                        },
                      }}
                    >
                      Select {product.title}
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Stack>
      </Stack>
    </Box>
  );
}
