'use client';

import { useState } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { PRODUCT_CATALOG, ProductType } from '@/lib/data/productCatalog';
import { ProductTypeCard } from './ProductTypeCard';

interface ProductCatalogProps {
  onSelect: (productType: ProductType) => void;
}

export function ProductCatalog({ onSelect }: ProductCatalogProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (productType: ProductType) => {
    setSelected(productType.id);
    onSelect(productType);
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Choose Product Type
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Select the type of product you want to create
      </Typography>

      {/* Product Grid */}
      <Grid container spacing={2}>
        {PRODUCT_CATALOG.map((productType) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={productType.id}>
            <ProductTypeCard
              productType={productType}
              selected={selected === productType.id}
              onClick={() => handleSelect(productType)}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
