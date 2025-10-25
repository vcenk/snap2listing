import { NextRequest, NextResponse } from 'next/server';
import { createKeywordEngine } from '@/lib/seo/keyword-engine';

/**
 * POST /api/seo/keywords
 * Mine keywords for a product
 */
export async function POST(req: NextRequest) {
  try {
    const { productTitle, productDescription, category } = await req.json();

    // Validation
    if (!productTitle || !productDescription || !category) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: productTitle, productDescription, category',
        },
        { status: 400 }
      );
    }

    // Create Keyword Engine
    const keywordEngine = createKeywordEngine();

    // Mine long-tail keywords
    const grouped = await keywordEngine.mineLongTails(
      productTitle,
      productDescription,
      category
    );

    // Fuse autosuggests
    const autosuggests = await keywordEngine.fuseAutosuggests(productTitle);

    // Combine and analyze top keywords
    const allKeywords = [
      ...Object.values(grouped).flat(),
      ...autosuggests.slice(0, 10),
    ].slice(0, 30);

    const analysis = await keywordEngine.analyzeKeywords(allKeywords);

    return NextResponse.json({
      success: true,
      data: {
        grouped,
        autosuggests,
        analysis,
      },
    });
  } catch (error) {
    console.error('Keyword mining error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to mine keywords',
      },
      { status: 500 }
    );
  }
}
