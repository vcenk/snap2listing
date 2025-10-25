# Quick Reference - Listybox-Style Components

## 🎨 Gradients

```typescript
import { listyboxGradients } from '@/lib/theme/podTheme';

// Available gradients:
listyboxGradients.purple  // #667eea → #764ba2
listyboxGradients.pink    // #f093fb → #f5576c
listyboxGradients.blue    // #4facfe → #00f2fe
listyboxGradients.green   // #43e97b → #38f9d7
listyboxGradients.orange  // #fa709a → #fee140
listyboxGradients.sunset  // #ff6a00 → #ee0979
listyboxGradients.ocean   // #2af598 → #009efd
listyboxGradients.royal   // #6a11cb → #2575fc

// Usage:
<Box sx={{ background: listyboxGradients.purple }} />
```

---

## 📊 StatCard

```typescript
import { StatCard } from '@/components/Dashboard/StatCard';
import { listyboxGradients } from '@/lib/theme/podTheme';

<StatCard
  label="Total Revenue"
  value="$12,345"
  icon="💰"
  gradient={listyboxGradients.blue}
  change={{ value: 12.5, period: 'last month' }}
  onClick={() => console.log('clicked')}
/>
```

**Props:**
- `label` (string) - Stat name
- `value` (string | number) - Main value
- `icon` (string) - Emoji icon
- `gradient` (string) - Background gradient
- `change?` (object) - Optional % change
- `onClick?` (function) - Optional click handler

---

## ⚡ QuickActions

```typescript
import { QuickActions } from '@/components/Dashboard/QuickActions';

<QuickActions
  onCreateProduct={() => navigate('/create')}
  onImportDesigns={() => navigate('/import')}
  onViewAnalytics={() => navigate('/analytics')}
/>
```

**Props:**
- `onCreateProduct?` - Create button handler
- `onImportDesigns?` - Import button handler
- `onViewAnalytics?` - Analytics button handler

---

## 🏠 PodDashboard

```typescript
import { PodDashboard } from '@/components/Dashboard/PodDashboard';

<PodDashboard
  onCreateProduct={() => setStep('create')}
  onImportDesigns={() => setStep('import')}
  onViewAnalytics={() => setStep('analytics')}
  stats={{
    totalProducts: 150,
    designs: 300,
    published: 120,
    revenue: '$12,345',
  }}
/>
```

**Props:**
- `onCreateProduct?` - Create button handler
- `onImportDesigns?` - Import button handler
- `onViewAnalytics?` - Analytics button handler
- `stats?` - Dashboard statistics

---

## 🎯 ProductCatalog

```typescript
import { ProductCatalog } from '@/components/Products/ProductCatalog';

<ProductCatalog
  onSelect={(productType) => {
    console.log('Selected:', productType);
  }}
/>
```

**Props:**
- `onSelect` - Selection handler (receives ProductType)

**ProductType Interface:**
```typescript
interface ProductType {
  id: string;
  name: string;
  icon: string;
  basePrice: number;
  category: string;
  variants: {
    colors: string[];
    sizes: string[];
  };
  mockupTemplateCount: number;
  description?: string;
}
```

---

## 🎴 ProductTypeCard

```typescript
import { ProductTypeCard } from '@/components/Products/ProductTypeCard';

<ProductTypeCard
  productType={product}
  selected={selectedId === product.id}
  onClick={() => handleSelect(product)}
/>
```

**Props:**
- `productType` - ProductType object
- `selected?` - Boolean for selected state
- `onClick` - Click handler

---

## 🎭 Hover Effects

```typescript
import { hoverEffects } from '@/lib/theme/podTheme';

// Lift on hover:
<Box sx={{ ...hoverEffects.lift }}>Content</Box>

// Scale on hover:
<Box sx={{ ...hoverEffects.scale }}>Content</Box>

// Glow on hover:
<Box sx={{ ...hoverEffects.glow }}>Content</Box>

// Subtle lift:
<Box sx={{ ...hoverEffects.subtle }}>Content</Box>
```

---

## 🎨 Custom Buttons

```typescript
import { Button } from '@mui/material';
import { listyboxGradients } from '@/lib/theme/podTheme';

<Button
  variant="contained"
  size="large"
  sx={{
    background: listyboxGradients.purple,
    fontWeight: 700,
    py: 1.5,
    px: 4,
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
    '&:hover': {
      background: listyboxGradients.purple,
      boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
    },
  }}
>
  Click Me
</Button>
```

---

## 📦 Gradient Cards

```typescript
<Card
  sx={{
    borderRadius: 3,
    background: listyboxGradients.pink,
    color: 'white',
    p: 3,
    transition: 'transform 0.2s ease',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: 6,
    },
  }}
>
  <Typography variant="h5" fontWeight={800}>
    Card Title
  </Typography>
  <Typography variant="body2" sx={{ opacity: 0.9 }}>
    Card content
  </Typography>
</Card>
```

---

## 🎯 Page Headers

```typescript
<Paper
  elevation={0}
  sx={{
    p: 3,
    mb: 4,
    borderRadius: 3,
    background: 'linear-gradient(135deg, #4facfe15 0%, #00f2fe15 100%)',
    border: '1px solid',
    borderColor: 'divider',
  }}
>
  <Typography variant="h3" fontWeight={800} gutterBottom>
    Welcome back! 👋
  </Typography>
  <Typography variant="body1" color="text.secondary">
    Here's what's happening today
  </Typography>
</Paper>
```

---

## 📱 Responsive Grid

```typescript
<Grid container spacing={3}>
  <Grid item xs={12} sm={6} md={3}>
    <StatCard {...props1} />
  </Grid>
  <Grid item xs={12} sm={6} md={3}>
    <StatCard {...props2} />
  </Grid>
  <Grid item xs={12} sm={6} md={3}>
    <StatCard {...props3} />
  </Grid>
  <Grid item xs={12} sm={6} md={3}>
    <StatCard {...props4} />
  </Grid>
</Grid>
```

**Breakpoints:**
- `xs` - Mobile (0-600px)
- `sm` - Tablet (600-960px)
- `md` - Small desktop (960-1280px)
- `lg` - Desktop (1280-1920px)
- `xl` - Large desktop (1920px+)

---

## 🎨 Product Catalog Data

```typescript
import { PRODUCT_CATALOG, getProductById } from '@/lib/data/productCatalog';

// Get all products:
const products = PRODUCT_CATALOG;

// Get product by ID:
const tshirt = getProductById('t-shirt');

// Get categories:
import { getAllCategories } from '@/lib/data/productCatalog';
const categories = getAllCategories();
```

---

## 💡 Common Patterns

### Gradient Header
```typescript
<Typography
  variant="h4"
  fontWeight={800}
  sx={{
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  }}
>
  Gradient Text
</Typography>
```

### Selection Card
```typescript
<Card
  onClick={handleClick}
  sx={{
    cursor: 'pointer',
    border: 2,
    borderColor: selected ? 'primary.main' : 'transparent',
    bgcolor: selected ? alpha('#667eea', 0.08) : 'background.paper',
    transition: 'all 0.2s ease',
    '&:hover': {
      transform: 'translateY(-4px)',
      borderColor: 'primary.main',
    },
  }}
>
  Content
</Card>
```

### Chip Filter
```typescript
<Stack direction="row" spacing={1} flexWrap="wrap">
  <Chip
    label="All"
    onClick={() => setFilter(null)}
    color={filter === null ? 'primary' : 'default'}
    sx={{ fontWeight: 600 }}
  />
  <Chip
    label="Category"
    onClick={() => setFilter('category')}
    color={filter === 'category' ? 'primary' : 'default'}
    sx={{ fontWeight: 600 }}
  />
</Stack>
```

---

## 📚 Import Cheatsheet

```typescript
// Theme
import { listyboxGradients, hoverEffects, podTheme } from '@/lib/theme/podTheme';

// Dashboard
import { StatCard } from '@/components/Dashboard/StatCard';
import { QuickActions } from '@/components/Dashboard/QuickActions';
import { PodDashboard } from '@/components/Dashboard/PodDashboard';

// Products
import { ProductCatalog } from '@/components/Products/ProductCatalog';
import { ProductTypeCard } from '@/components/Products/ProductTypeCard';

// Data
import { PRODUCT_CATALOG, ProductType } from '@/lib/data/productCatalog';
```

---

## 🚀 Quick Start Template

```typescript
'use client';

import { Box, Grid } from '@mui/material';
import { StatCard } from '@/components/Dashboard/StatCard';
import { QuickActions } from '@/components/Dashboard/QuickActions';
import { listyboxGradients } from '@/lib/theme/podTheme';

export default function MyPage() {
  return (
    <Box sx={{ p: 4 }}>
      <QuickActions
        onCreateProduct={() => console.log('create')}
        onImportDesigns={() => console.log('import')}
        onViewAnalytics={() => console.log('analytics')}
      />

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <StatCard
            label="Total"
            value="100"
            icon="📊"
            gradient={listyboxGradients.blue}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
```

---

**Happy coding! 🚀**
