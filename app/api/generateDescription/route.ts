import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { image_url, short_description } = await request.json();

    if (!image_url) {
      return NextResponse.json(
        { success: false, error: 'Image URL is required' },
        { status: 400 }
      );
    }

    // Determine if it's a base64 data URL or regular URL
    const isBase64 = image_url.startsWith('data:image');

    const messages: any[] = [
      {
        role: 'system',
        content: `You are a product description expert. Generate compelling, concise product descriptions that:
- Highlight key features and benefits
- Use marketing-friendly language
- Are 2-3 sentences long
- Appeal to online shoppers
- Are suitable for multiple e-commerce platforms`,
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: short_description
              ? `Analyze this product image and user hint: "${short_description}". Generate a compelling product description.`
              : 'Analyze this product image and generate a compelling product description.',
          },
          {
            type: 'image_url',
            image_url: {
              url: image_url,
              detail: 'low', // Use low detail to save costs
            },
          },
        ],
      },
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 200,
      temperature: 0.7,
    });

    const suggestion = response.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      suggestion,
      tokens_used: response.usage?.total_tokens || 0,
    });
  } catch (error: any) {
    console.error('Generate description error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate description',
      },
      { status: 500 }
    );
  }
}
