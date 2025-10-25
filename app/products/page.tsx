'use client';

import { useState } from 'react';
import { Box, Container, Dialog, DialogContent, Fade } from '@mui/material';
import { ProductGrid } from '@/components/Products/ProductGrid';
import { ProductCreationForm } from '@/components/Products/ProductCreationForm';
import { ProductDetailsDialog } from '@/components/Products/ProductDetailsDialog';
import { Product } from '@/lib/types/product';

export default function ProductsPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreateProduct = () => {
    setCreateDialogOpen(true);
  };

  const handleCreateComplete = (productId: string) => {
    console.log('Product created:', productId);
    setCreateDialogOpen(false);
    setRefreshTrigger((prev) => prev + 1); // Trigger refresh
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setDetailsDialogOpen(true);
  };

  const handleEditProduct = (productId: string) => {
    // TODO: Implement edit functionality
    console.log('Edit product:', productId);
    setDetailsDialogOpen(false);
    // Could open the creation form in edit mode
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;

    try {
      const response = await fetch(`/api/products/${selectedProduct.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDetailsDialogOpen(false);
        setSelectedProduct(null);
        setRefreshTrigger((prev) => prev + 1); // Trigger refresh
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  const handleStatusChange = async (status: 'draft' | 'published' | 'archived') => {
    if (!selectedProduct) return;

    try {
      const response = await fetch(`/api/products/${selectedProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedProduct(data.product);
        setRefreshTrigger((prev) => prev + 1); // Trigger refresh
      }
    } catch (error) {
      console.error('Failed to update product status:', error);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <ProductGrid
        key={refreshTrigger} // Force refresh when trigger changes
        onCreateProduct={handleCreateProduct}
        onViewProduct={handleViewProduct}
        onEditProduct={handleEditProduct}
      />

      {/* Create Product Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        TransitionComponent={Fade}
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxHeight: '95vh',
          },
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ p: 3 }}>
            <ProductCreationForm
              onComplete={handleCreateComplete}
              onCancel={() => setCreateDialogOpen(false)}
            />
          </Box>
        </DialogContent>
      </Dialog>

      {/* Product Details Dialog */}
      <ProductDetailsDialog
        product={selectedProduct}
        open={detailsDialogOpen}
        onClose={() => {
          setDetailsDialogOpen(false);
          setSelectedProduct(null);
        }}
        onEdit={() => handleEditProduct(selectedProduct?.id || '')}
        onDelete={handleDeleteProduct}
        onStatusChange={handleStatusChange}
      />
    </Container>
  );
}
