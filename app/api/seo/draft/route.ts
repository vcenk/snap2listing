import { NextRequest, NextResponse } from 'next/server';
import { createSEOBrain } from '@/lib/seo/seo-brain';

/**
 * POST /api/seo/draft
 * Generate initial SEO-optimized content draft
 */
export async function POST(req: NextRequest) {
  try {
    const { productImage, shortDescription, category, channels } = await req.json();

    // Validation
    if (!productImage || !shortDescription || !category || !channels || channels.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: productImage, shortDescription, category, channels',
        },
        { status: 400 }
      );
    }

    // Create SEO Brain
    const seoBrain = createSEOBrain();

    // Generate draft
    const result = await seoBrain.generateDraft(productImage, shortDescription, category, channels);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('SEO draft generation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate SEO draft',
      },
      { status: 500 }
    );
  }
}
