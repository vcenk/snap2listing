import { Card, CardContent, Typography, Box, alpha } from '@mui/material';
import { ProductType } from '@/lib/data/productCatalog';

interface ProductTypeCardProps {
  productType: ProductType;
  selected?: boolean;
  onClick: () => void;
}

export function ProductTypeCard({
  productType,
  selected,
  onClick,
}: ProductTypeCardProps) {
  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: 'pointer',
        borderRadius: 3,
        border: 2,
        borderColor: selected ? 'primary.main' : 'transparent',
        bgcolor: selected ? alpha('#667eea', 0.08) : 'background.paper',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
          borderColor: 'primary.main',
        },
      }}
    >
      <CardContent sx={{ textAlign: 'center', py: 3 }}>
        <Typography variant="h1" sx={{ fontSize: '3rem', mb: 1 }}>
          {productType.icon}
        </Typography>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          {productType.name}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" mb={1}>
          {productType.mockupTemplateCount} templates
        </Typography>
        {productType.description && (
          <Typography variant="caption" color="text.secondary" display="block" mt={1} sx={{ fontSize: '0.7rem' }}>
            {productType.description}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
