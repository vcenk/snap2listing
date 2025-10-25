import { NextRequest, NextResponse } from 'next/server';
import { productStore } from '@/lib/storage/memoryStore';
import { Product, ProductVariant, ProductStatus } from '@/lib/types/product';

export async function POST(request: NextRequest) {
  try {
    console.log('📥 [Product Create API] Request received');

    const body = await request.json();
    const {
      name,
      description = '',
      productType,
      designId,
      basePrice = 0,
      variants,
      mockupUrls = [],
    } = body;

    // Validation
    if (!name || !productType || !designId) {
      console.error('❌ [Product Create API] Missing required fields');
      return NextResponse.json(
        {
          error: 'Name, productType, and designId are required',
        },
        { status: 400 }
      );
    }

    // Get user ID from auth (for now, use 'guest')
    // TODO: Replace with actual auth
    const userId = 'guest';
    const timestamp = Date.now();
    const productId = `product_${timestamp}`;

    console.log('✨ [Product Create API] Creating product:', name);

    // Generate product variants
    const productVariants: ProductVariant[] = [];
    let variantCounter = 0;

    // Create variants based on colors and sizes
    const colors = variants?.colors || [];
    const sizes = variants?.sizes || [];

    if (colors.length > 0 && sizes.length > 0) {
      // Combination of colors and sizes
      for (const color of colors) {
        for (const size of sizes) {
          productVariants.push({
            id: `variant_${timestamp}_${variantCounter++}`,
            productId,
            name: `${color} - ${size}`,
            sku: `${productType.toUpperCase()}-${color.substring(0, 3).toUpperCase()}-${size}`,
            color,
            size,
            price: basePrice,
            mockupUrl: mockupUrls[variantCounter % mockupUrls.length],
          });
        }
      }
    } else if (colors.length > 0) {
      // Only colors
      for (const color of colors) {
        productVariants.push({
          id: `variant_${timestamp}_${variantCounter++}`,
          productId,
          name: color,
          sku: `${productType.toUpperCase()}-${color.substring(0, 3).toUpperCase()}`,
          color,
          price: basePrice,
          mockupUrl: mockupUrls[variantCounter % mockupUrls.length],
        });
      }
    } else if (sizes.length > 0) {
      // Only sizes
      for (const size of sizes) {
        productVariants.push({
          id: `variant_${timestamp}_${variantCounter++}`,
          productId,
          name: size,
          sku: `${productType.toUpperCase()}-${size}`,
          size,
          price: basePrice,
          mockupUrl: mockupUrls[variantCounter % mockupUrls.length],
        });
      }
    } else {
      // No variants - create a default one
      productVariants.push({
        id: `variant_${timestamp}_${variantCounter++}`,
        productId,
        name: 'Default',
        sku: `${productType.toUpperCase()}-DEFAULT`,
        price: basePrice,
        mockupUrl: mockupUrls[0],
      });
    }

    // Create product object
    const product: Product = {
      id: productId,
      userId,
      name,
      description,
      productType,
      designId,
      mockupUrls,
      variants: productVariants,
      status: 'draft' as ProductStatus,
      basePrice,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save to storage
    const savedProduct = productStore.create(product);

    console.log('✅ [Product Create API] Product created successfully');
    console.log('   Product ID:', productId);
    console.log('   Variants:', productVariants.length);

    return NextResponse.json({
      success: true,
      product: savedProduct,
    });
  } catch (error) {
    console.error('❌ [Product Create API] Error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to create product',
      },
      { status: 500 }
    );
  }
}
