import { NextRequest, NextResponse } from 'next/server';
import { createSEOBrain } from '@/lib/seo/seo-brain';

/**
 * POST /api/seo/optimize
 * Optimize existing content with targeted keywords
 */
export async function POST(req: NextRequest) {
  try {
    const { currentContent, targetKeywords, channels, focusAreas } = await req.json();

    // Validation
    if (!currentContent || !targetKeywords || !channels) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: currentContent, targetKeywords, channels',
        },
        { status: 400 }
      );
    }

    // Create SEO Brain
    const seoBrain = createSEOBrain();

    // Optimize content
    const result = await seoBrain.optimize(
      currentContent,
      targetKeywords,
      channels,
      focusAreas
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('SEO optimization error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to optimize content',
      },
      { status: 500 }
    );
  }
}
