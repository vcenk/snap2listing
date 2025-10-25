import { NextRequest, NextResponse } from 'next/server';
import { productStore } from '@/lib/storage/memoryStore';

export async function GET(request: NextRequest) {
  try {
    console.log('📥 [Product List API] Request received');

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const productType = searchParams.get('productType');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get user ID from auth (for now, use 'guest')
    // TODO: Replace with actual auth
    const userId = 'guest';

    console.log('🔍 [Product List API] Query parameters:');
    console.log('   Product Type:', productType || 'all');
    console.log('   Status:', status || 'all');
    console.log('   Search:', search || 'none');
    console.log('   Limit:', limit);
    console.log('   Offset:', offset);

    // Get products from storage
    let products = productStore.getAll(userId);

    // Filter by product type
    if (productType) {
      products = products.filter((p) => p.productType === productType);
    }

    // Filter by status
    if (status) {
      products = products.filter((p) => p.status === status);
    }

    // Search
    if (search) {
      const lowerSearch = search.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(lowerSearch) ||
          p.description.toLowerCase().includes(lowerSearch) ||
          p.productType.toLowerCase().includes(lowerSearch)
      );
    }

    // Sort by most recent first
    products.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Pagination
    const total = products.length;
    const paginatedProducts = products.slice(offset, offset + limit);

    console.log('✅ [Product List API] Found', total, 'products');
    console.log('   Returning:', paginatedProducts.length, 'products');

    return NextResponse.json({
      success: true,
      products: paginatedProducts,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('❌ [Product List API] Error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch products',
      },
      { status: 500 }
    );
  }
}
