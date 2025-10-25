import { NextRequest, NextResponse } from 'next/server';
import { generateListingText } from '@/lib/api/openai';

export async function POST(request: NextRequest) {
  try {
    const { productImageUrl, productName, category, shortDescription } = await request.json();

    // Generate listing text with OpenAI GPT-4 Vision
    const result = await generateListingText({
      productImageUrl,
      productName,
      category,
      shortDescription,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating text:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate text' },
      { status: 500 }
    );
  }
}
