"use client";

import { Box, Stack, TextField, Typography, Button, Card, alpha, Divider } from "@mui/material";
import { useState } from "react";

interface Props {
  productImageUrl: string;
  productName?: string;
  category_path?: string;
  shortDescription?: string;
  primaryChannelSlug?: string;
  onNext: (data: {
    title: string;
    description: string;
    quantity: number;
    category: string;
    price: number;
    sku?: string;
  }) => void;
  onBack: () => void;
}

export default function GenericDetailsStep({ productImageUrl, productName, shortDescription, primaryChannelSlug, onNext, onBack }: Props) {
  const [title, setTitle] = useState(productName || "");
  const [description, setDescription] = useState(shortDescription || "");
  const [quantity, setQuantity] = useState(1);
  const [sku, setSku] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      alert('Please fill in all required fields');
      return;
    }
    onNext({ title, description, quantity, category: '', price: 0, sku: sku || undefined });
  };

  return (
    <Box component="form" onSubmit={submit}>
      <Stack spacing={4}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Review Product Details
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Verify and edit the basic product information below. This forms the foundation of your listing.
          </Typography>
        </Box>

        {/* Product Image Preview */}
        <Card
          sx={{
            p: 3,
            background: alpha('#f5f5f5', 0.5),
            border: `1px solid ${alpha('#000', 0.1)}`,
            borderRadius: 2,
          }}
        >
          <Typography variant="subtitle2" fontWeight={600} mb={2}>
            Product Image
          </Typography>
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              maxWidth: 300,
              height: 300,
              borderRadius: 2,
              overflow: 'hidden',
              border: `2px solid ${alpha('#000', 0.1)}`,
              mx: 'auto',
            }}
          >
            <img
              src={productImageUrl}
              alt="Product"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </Box>
        </Card>

        <Divider />

        {/* Form Fields */}
        <TextField
          label="Product Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          fullWidth
          helperText="A clear, descriptive title for your product"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          }}
        />

        <TextField
          label="Product Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          fullWidth
          rows={6}
          multiline
          helperText="Describe your product's features, benefits, and what makes it special"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          }}
        />

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            label="Quantity Available"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value || "1"))}
            inputProps={{ min: 1 }}
            sx={{
              maxWidth: 200,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
          <TextField
            label="SKU (Optional)"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="e.g., PROD-001"
            sx={{
              flex: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
        </Stack>

        <Divider />

        {/* Action Buttons */}
        <Stack direction="row" justifyContent="space-between">
          <Button
            variant="outlined"
            onClick={onBack}
            sx={{
              borderRadius: 2,
              px: 4,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Back
          </Button>
          <Button
            type="submit"
            variant="contained"
            sx={{
              borderRadius: 2,
              px: 4,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Continue to Optimization
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
