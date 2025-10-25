# Listybox-Inspired UI Components & Design Patterns

## 🎨 Visual Design Language

### Color System

```typescript
// theme/colors.ts
export const listyboxColors = {
  // Primary Gradients
  gradients: {
    purple: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    pink: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    blue: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    green: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    orange: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    sunset: 'linear-gradient(135deg, #ff6a00 0%, #ee0979 100%)',
  },

  // Status Colors
  status: {
    draft: '#95a5a6',
    pending: '#f39c12',
    published: '#27ae60',
    failed: '#e74c3c',
    processing: '#3498db',
  },

  // Background Layers
  background: {
    default: '#f8f9fa',
    paper: '#ffffff',
    elevated: '#ffffff',
  },

  // Text
  text: {
    primary: '#2c3e50',
    secondary: '#7f8c8d',
    disabled: '#bdc3c7',
  },
};
```

---

## 🃏 Component Library

### 1. Dashboard Stat Card

**Purpose:** Display key metrics with visual appeal

```typescript
// components/Dashboard/StatCard.tsx

import { Card, CardContent, Stack, Typography, Box } from '@mui/material';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  gradient: string;
  change?: {
    value: number;
    period: string;
  };
}

export function StatCard({ label, value, icon, gradient, change }: StatCardProps) {
  return (
    <Card
      sx={{
        borderRadius: 3,
        background: gradient,
        color: 'white',
        p: 3,
        height: '100%',
        transition: 'transform 0.2s',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
        },
      }}
    >
      <Stack spacing={2}>
        <Box sx={{ fontSize: 48 }}>{icon}</Box>
        <Box>
          <Typography variant="h3" fontWeight={800}>
            {value}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {label}
          </Typography>
          {change && (
            <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mt: 0.5 }}>
              {change.value > 0 ? '↑' : '↓'} {Math.abs(change.value)}% vs {change.period}
            </Typography>
          )}
        </Box>
      </Stack>
    </Card>
  );
}

// Usage:
<StatCard
  label="Total Revenue"
  value="$12,345"
  icon="💰"
  gradient={listyboxColors.gradients.blue}
  change={{ value: 12.5, period: 'last month' }}
/>
```

---

### 2. Product Card

**Purpose:** Display product with mockup, status, and quick actions

```typescript
// components/Products/ProductCard.tsx

import {
  Card, CardMedia, CardContent, CardActions,
  Typography, Chip, IconButton, Stack, Box, alpha,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';

interface ProductCardProps {
  id: string;
  name: string;
  mockupUrl: string;
  price: number;
  status: 'draft' | 'published' | 'archived';
  platforms: string[];
  sales: number;
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
}

export function ProductCard({
  name,
  mockupUrl,
  price,
  status,
  platforms,
  sales,
  onEdit,
  onDelete,
  onView,
}: ProductCardProps) {
  const statusColors = {
    draft: 'warning',
    published: 'success',
    archived: 'default',
  } as const;

  return (
    <Card
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        border: '1px solid',
        borderColor: 'divider',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: 8,
          borderColor: 'primary.main',
        },
      }}
    >
      {/* Image with Overlay */}
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="240"
          image={mockupUrl}
          alt={name}
          sx={{
            objectFit: 'cover',
            backgroundColor: 'background.default',
          }}
        />

        {/* Status Badge */}
        <Chip
          label={status}
          color={statusColors[status]}
          size="small"
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            fontWeight: 600,
            textTransform: 'capitalize',
          }}
        />

        {/* Sales Badge */}
        {sales > 0 && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 12,
              left: 12,
              backgroundColor: alpha('#000', 0.7),
              color: 'white',
              px: 1.5,
              py: 0.5,
              borderRadius: 2,
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            🔥 {sales} sold
          </Box>
        )}
      </Box>

      {/* Content */}
      <CardContent>
        <Typography variant="h6" fontWeight={700} noWrap gutterBottom>
          {name}
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center" mb={1}>
          <Typography variant="h5" fontWeight={800} color="primary.main">
            ${price}
          </Typography>
        </Stack>

        {/* Platform Chips */}
        <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
          {platforms.map((platform) => (
            <Chip
              key={platform}
              label={platform}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.7rem' }}
            />
          ))}
        </Stack>
      </CardContent>

      {/* Actions */}
      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" onClick={onView} color="primary">
            <VisibilityIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={onEdit} color="primary">
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={onDelete} color="error">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      </CardActions>
    </Card>
  );
}
```

---

### 3. Quick Action Button

**Purpose:** Prominent call-to-action with gradient styling

```typescript
// components/UI/QuickActionButton.tsx

import { Button, ButtonProps } from '@mui/material';
import { ReactNode } from 'react';

interface QuickActionButtonProps extends Omit<ButtonProps, 'variant' | 'size'> {
  gradient?: string;
  icon?: ReactNode;
  label: string;
}

export function QuickActionButton({
  gradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  icon,
  label,
  ...props
}: QuickActionButtonProps) {
  return (
    <Button
      variant="contained"
      size="large"
      startIcon={icon}
      sx={{
        background: gradient,
        fontWeight: 700,
        py: 1.5,
        px: 4,
        borderRadius: 3,
        fontSize: '1rem',
        textTransform: 'none',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
          background: gradient,
        },
        '&:active': {
          transform: 'translateY(0)',
        },
      }}
      {...props}
    >
      {label}
    </Button>
  );
}

// Usage:
<QuickActionButton
  gradient={listyboxColors.gradients.pink}
  icon={<AddIcon />}
  label="Create New Product"
  onClick={() => console.log('clicked')}
/>
```

---

### 4. Design Card (for Design Library)

**Purpose:** Display design artwork with selection and preview

```typescript
// components/Designs/DesignCard.tsx

import { Card, CardMedia, CardContent, Typography, Checkbox, Box, alpha } from '@mui/material';
import { useState } from 'react';

interface DesignCardProps {
  id: string;
  name: string;
  imageUrl: string;
  category: string;
  isPremium: boolean;
  selected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
  onClick?: () => void;
}

export function DesignCard({
  id,
  name,
  imageUrl,
  category,
  isPremium,
  selected = false,
  onSelect,
  onClick,
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
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        border: 2,
        borderColor: selected ? 'primary.main' : 'transparent',
        '&:hover': {
          transform: 'scale(1.03)',
          boxShadow: 4,
        },
      }}
    >
      {/* Image */}
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="200"
          image={imageUrl}
          alt={name}
          sx={{
            objectFit: 'cover',
            backgroundColor: alpha('#000', 0.05),
          }}
        />

        {/* Premium Badge */}
        {isPremium && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              backgroundColor: 'gold',
              color: 'black',
              px: 1,
              py: 0.3,
              borderRadius: 1,
              fontSize: '0.7rem',
              fontWeight: 700,
            }}
          >
            ⭐ PREMIUM
          </Box>
        )}

        {/* Selection Checkbox */}
        <Checkbox
          checked={selected}
          onChange={(e) => {
            e.stopPropagation();
            onSelect?.(id, e.target.checked);
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
          }}
        />

        {/* Hover Overlay */}
        {isHovered && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: alpha('#000', 0.4),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700,
              fontSize: '1.2rem',
            }}
          >
            Click to Preview
          </Box>
        )}
      </Box>

      {/* Content */}
      <CardContent sx={{ p: 1.5 }}>
        <Typography variant="body2" fontWeight={600} noWrap>
          {name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {category}
        </Typography>
      </CardContent>
    </Card>
  );
}
```

---

### 5. Empty State Component

**Purpose:** Friendly empty states with call-to-action

```typescript
// components/UI/EmptyState.tsx

import { Box, Typography, Button, Stack } from '@mui/material';
import { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <Box
      sx={{
        textAlign: 'center',
        py: 8,
        px: 3,
      }}
    >
      <Box sx={{ fontSize: 80, mb: 2, opacity: 0.3 }}>
        {icon}
      </Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        {title}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
        {description}
      </Typography>
      {actionLabel && onAction && (
        <Button
          variant="contained"
          size="large"
          onClick={onAction}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            fontWeight: 700,
            px: 4,
          }}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}

// Usage:
<EmptyState
  icon="📦"
  title="No Products Yet"
  description="Start creating your first product to build your print-on-demand empire!"
  actionLabel="Create Product"
  onAction={() => navigate('/create')}
/>
```

---

### 6. Dashboard Layout

**Purpose:** Main dashboard structure with quick actions and stats

```typescript
// components/Dashboard/PodDashboard.tsx

import { Box, Grid, Paper, Stack, Typography } from '@mui/material';
import { StatCard } from './StatCard';
import { QuickActionButton } from '../UI/QuickActionButton';
import AddIcon from '@mui/icons-material/Add';
import UploadIcon from '@mui/icons-material/Upload';
import BarChartIcon from '@mui/icons-material/BarChart';

export function PodDashboard() {
  return (
    <Box sx={{ p: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Header */}
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
          Here's what's happening with your POD business today
        </Typography>
      </Paper>

      {/* Quick Actions */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Quick Actions
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mt={2}>
          <QuickActionButton
            gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            icon={<AddIcon />}
            label="Create New Product"
            fullWidth
          />
          <QuickActionButton
            gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
            icon={<UploadIcon />}
            label="Import Designs"
            fullWidth
          />
          <QuickActionButton
            gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
            icon={<BarChartIcon />}
            label="View Analytics"
            fullWidth
          />
        </Stack>
      </Paper>

      {/* Stats Grid */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Total Revenue"
            value="$12,345"
            icon="💰"
            gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
            change={{ value: 12.5, period: 'last month' }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Active Products"
            value="234"
            icon="📦"
            gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            change={{ value: 8.2, period: 'last week' }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Orders Today"
            value="45"
            icon="🛒"
            gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
            change={{ value: -3.1, period: 'yesterday' }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Conversion Rate"
            value="3.2%"
            icon="📈"
            gradient="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
            change={{ value: 0.5, period: 'last month' }}
          />
        </Grid>
      </Grid>

      {/* Recent Products */}
      <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Recent Products
        </Typography>
        {/* ProductCard grid goes here */}
      </Paper>
    </Box>
  );
}
```

---

### 7. Progress Indicator

**Purpose:** Visual feedback for multi-step processes

```typescript
// components/UI/ProgressSteps.tsx

import { Box, Stepper, Step, StepLabel, Typography } from '@mui/material';

interface ProgressStepsProps {
  steps: string[];
  currentStep: number;
}

export function ProgressSteps({ steps, currentStep }: ProgressStepsProps) {
  return (
    <Stepper activeStep={currentStep} alternativeLabel sx={{ mb: 4 }}>
      {steps.map((label, index) => (
        <Step key={label}>
          <StepLabel
            StepIconComponent={() => (
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background:
                    index <= currentStep
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : '#e0e0e0',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '1.2rem',
                  transition: 'all 0.3s ease',
                }}
              >
                {index + 1}
              </Box>
            )}
          >
            <Typography variant="body2" fontWeight={600} sx={{ mt: 1 }}>
              {label}
            </Typography>
          </StepLabel>
        </Step>
      ))}
    </Stepper>
  );
}
```

---

### 8. Table with Actions

**Purpose:** Product/order listing with inline actions

```typescript
// components/Products/ProductTable.tsx

import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, IconButton, Avatar, Stack, Checkbox,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';

interface Product {
  id: string;
  name: string;
  mockupUrl: string;
  price: number;
  status: 'draft' | 'published';
  sales: number;
  platforms: string[];
}

export function ProductTable({ products }: { products: Product[] }) {
  return (
    <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: 'background.default' }}>
            <TableCell padding="checkbox">
              <Checkbox />
            </TableCell>
            <TableCell>Product</TableCell>
            <TableCell>Price</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Platforms</TableCell>
            <TableCell>Sales</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products.map((product) => (
            <TableRow
              key={product.id}
              hover
              sx={{
                '&:hover': { bgcolor: 'action.hover' },
                cursor: 'pointer',
              }}
            >
              <TableCell padding="checkbox">
                <Checkbox />
              </TableCell>
              <TableCell>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    src={product.mockupUrl}
                    variant="rounded"
                    sx={{ width: 56, height: 56 }}
                  />
                  <Typography variant="body2" fontWeight={600}>
                    {product.name}
                  </Typography>
                </Stack>
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight={700}>
                  ${product.price}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={product.status}
                  color={product.status === 'published' ? 'success' : 'warning'}
                  size="small"
                  sx={{ textTransform: 'capitalize' }}
                />
              </TableCell>
              <TableCell>
                <Stack direction="row" spacing={0.5}>
                  {product.platforms.map((p) => (
                    <Chip key={p} label={p} size="small" variant="outlined" />
                  ))}
                </Stack>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{product.sales}</Typography>
              </TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                  <IconButton size="small" color="primary">
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small">
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
```

---

## 🎯 Animation & Transitions

### Hover Effects
```typescript
const hoverEffects = {
  lift: {
    transition: 'transform 0.2s ease',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: 6,
    },
  },

  scale: {
    transition: 'transform 0.3s ease',
    '&:hover': {
      transform: 'scale(1.03)',
    },
  },

  glow: {
    transition: 'box-shadow 0.3s ease',
    '&:hover': {
      boxShadow: '0 0 20px rgba(102, 126, 234, 0.6)',
    },
  },
};
```

### Page Transitions
```typescript
import { motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

<motion.div
  initial="initial"
  animate="animate"
  exit="exit"
  variants={pageVariants}
  transition={{ duration: 0.3 }}
>
  {/* Page content */}
</motion.div>
```

---

## 📱 Responsive Design Patterns

### Breakpoints
```typescript
const breakpoints = {
  xs: 0,     // Mobile
  sm: 600,   // Tablet
  md: 960,   // Small desktop
  lg: 1280,  // Desktop
  xl: 1920,  // Large desktop
};

// Usage in sx prop:
sx={{
  fontSize: { xs: '1rem', sm: '1.2rem', md: '1.5rem' },
  padding: { xs: 2, sm: 3, md: 4 },
}}
```

---

## ✅ Implementation Checklist

### Phase 1: Core Components
- [ ] StatCard component
- [ ] ProductCard component
- [ ] QuickActionButton component
- [ ] EmptyState component
- [ ] DesignCard component

### Phase 2: Layout Components
- [ ] PodDashboard layout
- [ ] ProductTable component
- [ ] ProgressSteps component
- [ ] Sidebar navigation

### Phase 3: Theme & Styling
- [ ] Color system implementation
- [ ] Gradient definitions
- [ ] Typography scale
- [ ] Spacing system
- [ ] Animation utilities

### Phase 4: Responsiveness
- [ ] Mobile optimizations
- [ ] Tablet layouts
- [ ] Desktop polish
- [ ] Touch interactions

---

## 🚀 Quick Start

1. **Copy color system** to your theme configuration
2. **Implement StatCard** for dashboard metrics
3. **Build ProductCard** for product listings
4. **Create QuickActionButton** for CTAs
5. **Assemble PodDashboard** using components

Start with these 5 components and you'll have a Listybox-quality interface!

---

**Last Updated:** 2025-10-25
**Related:** LISTYBOX_POD_ROADMAP.md
