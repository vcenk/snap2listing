import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ProductAnalysis {
  productType: string; // 'Apparel', 'Jewelry', 'Home & Kitchen', etc.
  category: string; // More specific category
  detectedAttributes: {
    colors?: string[];
    materials?: string[];
    style?: string[];
    occasions?: string[];
    features?: string[];
  };
  suggestedKeywords: string[];
  description: string; // AI-generated description from image analysis
  confidence: number; // 0-1
}

/**
 * Analyze product image using GPT-4 Vision
 * Detects product type, attributes, and generates initial description
 */
export async function analyzeProductImage(
  imageUrl: string,
  userDescription?: string
): Promise<ProductAnalysis> {
  try {
    const systemPrompt = `You are an expert e-commerce product analyst. Analyze product images and extract detailed information for listing creation.`;

    const userPrompt = `Analyze this product image and extract:
1. Product type (e.g., Apparel, Jewelry, Home Decor, Electronics, Art, Toys)
2. Specific category (e.g., T-Shirt, Necklace, Coffee Mug, Phone Case)
3. Detected attributes:
   - Colors (all visible colors)
   - Materials (what it appears to be made of)
   - Style (modern, vintage, minimalist, etc.)
   - Occasions (casual, formal, gift, etc.)
   - Key features (unique elements, patterns, designs)
4. Suggested SEO keywords (10-15 high-value keywords)
5. Detailed description (2-3 sentences describing what you see)
6. Confidence score (0-1, how certain you are about the analysis)

${userDescription ? `Additional context from seller: ${userDescription}` : ''}

Return ONLY valid JSON in this format:
{
  "productType": "Apparel",
  "category": "T-Shirt",
  "detectedAttributes": {
    "colors": ["black", "white"],
    "materials": ["cotton"],
    "style": ["casual", "minimalist"],
    "occasions": ["everyday", "casual"],
    "features": ["graphic print", "crew neck"]
  },
  "suggestedKeywords": ["cotton tee", "graphic tshirt", ...],
  "description": "A black cotton t-shirt with a minimalist graphic print...",
  "confidence": 0.95
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // GPT-4 with vision
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: userPrompt,
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
                detail: 'high', // Use high detail for better analysis
              },
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3, // Lower temperature for more consistent analysis
      max_tokens: 800,
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No content generated from vision analysis');
    }

    const result = JSON.parse(content) as ProductAnalysis;

    // Validate and ensure minimum confidence
    if (result.confidence < 0.5) {
      console.warn('Low confidence product analysis:', result);
    }

    return result;
  } catch (error) {
    console.error('OpenAI Vision analysis error:', error);
    
    // Return fallback analysis
    return {
      productType: 'General Merchandise',
      category: 'General',
      detectedAttributes: {},
      suggestedKeywords: userDescription ? userDescription.toLowerCase().split(' ').slice(0, 10) : [],
      description: userDescription || 'Product available for purchase',
      confidence: 0.3,
    };
  }
}

/**
 * Generate multi-channel listing content with Vision-enhanced understanding
 */
export async function generateMultiChannelContent(
  imageUrl: string,
  productAnalysis: ProductAnalysis,
  userDescription: string,
  targetChannels: string[]
): Promise<Record<string, any>> {
  try {
    const channelPrompts = {
      amazon: 'Amazon: 200 char title with brand/key features, 5 bullet points (10-255 chars each), search keywords',
      etsy: 'Etsy: 140 char keyword-rich title, story-driven description, 13 tags (max 20 chars each), materials list',
      shopify: 'Shopify: 255 char title, HTML description, SEO meta title (70 chars), SEO meta description (160 chars)',
      tiktok: 'TikTok Shop: 100 char trendy title, 500 char short description, hashtags, engaging highlights',
      facebook: 'Facebook Shop: 150 char title, social-friendly description, ad caption (125 chars)',
    };

    const selectedPrompts = targetChannels
      .filter(ch => channelPrompts[ch as keyof typeof channelPrompts])
      .map(ch => channelPrompts[ch as keyof typeof channelPrompts])
      .join('\n');

    const userPrompt = `Create optimized listings for this product:

PRODUCT ANALYSIS:
- Type: ${productAnalysis.productType}
- Category: ${productAnalysis.category}
- Colors: ${productAnalysis.detectedAttributes.colors?.join(', ') || 'N/A'}
- Materials: ${productAnalysis.detectedAttributes.materials?.join(', ') || 'N/A'}
- Style: ${productAnalysis.detectedAttributes.style?.join(', ') || 'N/A'}
- Description: ${productAnalysis.description}

USER DESCRIPTION:
${userDescription}

SUGGESTED KEYWORDS:
${productAnalysis.suggestedKeywords.join(', ')}

Generate platform-optimized content for:
${selectedPrompts}

Return JSON with content for each channel, following platform-specific character limits and formatting rules.

Format:
{
  "amazon": {
    "title": "...",
    "bullet_points": ["...", "...", "...", "...", "..."],
    "description": "...",
    "search_keywords": "...",
    "alt_text": "..."
  },
  "etsy": {
    "title": "...",
    "description": "...",
    "tags": ["...", "...", ...], // max 13, each ≤20 chars
    "materials": ["..."]
  },
  // ... other channels
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert e-commerce copywriter specializing in multi-channel listing optimization.',
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: userPrompt,
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
                detail: 'low', // Low detail for content generation (saves tokens)
              },
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No content generated');
    }

    return JSON.parse(content);
  } catch (error) {
    console.error('Multi-channel content generation error:', error);
    throw new Error('Failed to generate multi-channel content');
  }
}

/**
 * Generate product listing with full Vision + AI pipeline
 * This is the main function to use for comprehensive listing generation
 */
export async function generateCompleteListing(
  imageUrl: string,
  userDescription: string,
  targetChannels: string[]
) {
  // Step 1: Analyze image with Vision
  const analysis = await analyzeProductImage(imageUrl, userDescription);

  // Step 2: Generate multi-channel content
  const channelContent = await generateMultiChannelContent(
    imageUrl,
    analysis,
    userDescription,
    targetChannels
  );

  return {
    analysis,
    content: channelContent,
    metadata: {
      generatedAt: new Date().toISOString(),
      channels: targetChannels,
      confidence: analysis.confidence,
    },
  };
}
