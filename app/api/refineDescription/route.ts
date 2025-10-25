import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { current_description, instruction, conversation_history } = await request.json();

    if (!current_description || !instruction) {
      return NextResponse.json(
        { success: false, error: 'Description and instruction are required' },
        { status: 400 }
      );
    }

    // Build conversation context
    const messages: any[] = [
      {
        role: 'system',
        content: `You are a product description refinement assistant. Your job is to improve product descriptions based on user feedback.
- Follow user instructions precisely
- Maintain the core product information
- Keep descriptions concise (2-4 sentences unless requested otherwise)
- Use engaging, marketing-friendly language
- Return ONLY the revised description, no explanations`,
      },
      {
        role: 'user',
        content: `Current description: "${current_description}"

User instruction: ${instruction}

Please revise the description according to the instruction.`,
      },
    ];

    // Add conversation history if provided (for context)
    if (conversation_history && Array.isArray(conversation_history)) {
      // Insert history before the current request
      messages.splice(1, 0, ...conversation_history.slice(-4)); // Keep last 2 exchanges
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 250,
      temperature: 0.7,
    });

    const refined_text = response.choices[0]?.message?.content?.trim() || '';

    return NextResponse.json({
      success: true,
      refined_text,
      tokens_used: response.usage?.total_tokens || 0,
    });
  } catch (error: any) {
    console.error('Refine description error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to refine description',
      },
      { status: 500 }
    );
  }
}
