import { NextRequest, NextResponse } from 'next/server';
import { productStore } from '@/lib/storage/memoryStore';

// GET /api/products/[id] - Get product by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('📥 [Product Get API] Request received for ID:', params.id);

    const product = productStore.getById(params.id);

    if (!product) {
      console.error('❌ [Product Get API] Product not found:', params.id);
      return NextResponse.json(
        {
          error: 'Product not found',
        },
        { status: 404 }
      );
    }

    console.log('✅ [Product Get API] Product found:', product.name);

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error('❌ [Product Get API] Error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch product',
      },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id] - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('📥 [Product Update API] Request received for ID:', params.id);

    const body = await request.json();
    const { name, description, status, basePrice, variants } = body;

    // Validate product exists
    const existingProduct = productStore.getById(params.id);
    if (!existingProduct) {
      console.error('❌ [Product Update API] Product not found:', params.id);
      return NextResponse.json(
        {
          error: 'Product not found',
        },
        { status: 404 }
      );
    }

    console.log('✨ [Product Update API] Updating product:', existingProduct.name);

    // Update product
    const updates: any = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;
    if (basePrice !== undefined) updates.basePrice = basePrice;
    if (variants !== undefined) updates.variants = variants;

    const updatedProduct = productStore.update(params.id, updates);

    if (!updatedProduct) {
      console.error('❌ [Product Update API] Update failed');
      return NextResponse.json(
        {
          error: 'Failed to update product',
        },
        { status: 500 }
      );
    }

    console.log('✅ [Product Update API] Product updated successfully');

    return NextResponse.json({
      success: true,
      product: updatedProduct,
    });
  } catch (error) {
    console.error('❌ [Product Update API] Error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to update product',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('📥 [Product Delete API] Request received for ID:', params.id);

    // Validate product exists
    const existingProduct = productStore.getById(params.id);
    if (!existingProduct) {
      console.error('❌ [Product Delete API] Product not found:', params.id);
      return NextResponse.json(
        {
          error: 'Product not found',
        },
        { status: 404 }
      );
    }

    console.log('🗑️ [Product Delete API] Deleting product:', existingProduct.name);

    // Delete product
    const success = productStore.delete(params.id);

    if (!success) {
      console.error('❌ [Product Delete API] Delete failed');
      return NextResponse.json(
        {
          error: 'Failed to delete product',
        },
        { status: 500 }
      );
    }

    console.log('✅ [Product Delete API] Product deleted successfully');

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('❌ [Product Delete API] Error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to delete product',
      },
      { status: 500 }
    );
  }
}
