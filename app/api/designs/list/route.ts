import { NextRequest, NextResponse } from 'next/server';
import { designStore } from '@/lib/storage/memoryStore';

export async function GET(request: NextRequest) {
  try {
    console.log('📥 [Design List API] Request received');

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get user ID from auth (for now, use 'guest')
    // TODO: Replace with actual auth
    const userId = 'guest';

    console.log('🔍 [Design List API] Query parameters:');
    console.log('   Category:', category || 'all');
    console.log('   Search:', search || 'none');
    console.log('   Limit:', limit);
    console.log('   Offset:', offset);

    // Get designs from storage
    let designs = designStore.getAll(userId);

    // Filter by category
    if (category) {
      designs = designs.filter((d) => d.category === category);
    }

    // Search
    if (search) {
      const lowerSearch = search.toLowerCase();
      designs = designs.filter(
        (d) =>
          d.name.toLowerCase().includes(lowerSearch) ||
          d.category.toLowerCase().includes(lowerSearch) ||
          d.tags.some((tag) => tag.toLowerCase().includes(lowerSearch))
      );
    }

    // Sort by most recent first
    designs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Pagination
    const total = designs.length;
    const paginatedDesigns = designs.slice(offset, offset + limit);

    console.log('✅ [Design List API] Found', total, 'designs');
    console.log('   Returning:', paginatedDesigns.length, 'designs');

    return NextResponse.json({
      success: true,
      designs: paginatedDesigns,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('❌ [Design List API] Error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch designs',
      },
      { status: 500 }
    );
  }
}
