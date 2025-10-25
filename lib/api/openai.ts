import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface GenerateListingTextInput {
  productImageUrl: string;
  productName?: string;
  category: string;
  shortDescription?: string;
}

export interface GenerateListingTextOutput {
  title: string;
  tags: string[];
  description: string;
  materials?: string[];
}

/**
 * Generate Etsy listing text (title, tags, description) using GPT-4 Vision
 */
export async function generateListingText(
  input: GenerateListingTextInput
): Promise<GenerateListingTextOutput> {
  try {
    const systemPrompt = `You are an expert Etsy listing copywriter. Generate SEO-optimized, compelling listing content that converts browsers into buyers. Follow these rules:
1. Title: Max 140 characters, include key selling points and category
2. Tags: 13 relevant tags, mix of specific and broad terms for SEO
3. Description: 2-3 paragraphs with features, benefits, use cases, and shipping info
4. Materials: Up to 13 materials used to make the product`;

    const userPrompt = `Create an Etsy listing for this product:
Category: ${input.category}
${input.productName ? `Product: ${input.productName}` : ''}
${input.shortDescription ? `Details: ${input.shortDescription}` : ''}

Generate:
1. A compelling title (max 140 chars)
2. 13 SEO tags
3. A detailed description
4. Materials list (what the product is made from, up to 13 items)

Return ONLY valid JSON in this exact format:
{
  "title": "your title here",
  "tags": ["tag1", "tag2", ...],
  "description": "your description here",
  "materials": ["material1", "material2", ...]
}`;

    // Build message content - include image only if it's a valid HTTP URL
    const messageContent: any[] = [
      {
        type: 'text',
        text: userPrompt,
      },
    ];

    // Only add image if it's a valid HTTP(S) URL, not a data URL
    if (input.productImageUrl && input.productImageUrl.startsWith('http')) {
      messageContent.push({
        type: 'image_url',
        image_url: {
          url: input.productImageUrl,
          detail: 'low', // Use low detail to save tokens
        },
      });
    } else {
      console.log('Skipping image URL (not HTTP):', input.productImageUrl?.substring(0, 50));
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // GPT-4 with vision
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: messageContent,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 1000,
    });

    console.log('OpenAI Response:', JSON.stringify(response, null, 2));

    const content = response.choices?.[0]?.message?.content;
    if (!content) {
      console.error('No content in response:', response);
      throw new Error('No content generated from OpenAI');
    }

    const result = JSON.parse(content);

    // Validate and limit tags to 13
    if (result.tags && result.tags.length > 13) {
      result.tags = result.tags.slice(0, 13);
    }

    // Validate and limit materials to 13
    if (result.materials && result.materials.length > 13) {
      result.materials = result.materials.slice(0, 13);
    }

    // Validate title length
    if (result.title && result.title.length > 140) {
      result.title = result.title.substring(0, 137) + '...';
    }

    return {
      title: result.title || 'Handmade Product',
      tags: result.tags || [],
      description: result.description || '',
      materials: result.materials || [],
    };
  } catch (error) {
    console.error('OpenAI text generation error:', error);
    throw new Error('Failed to generate listing text');
  }
}

/**
 * Regenerate just the title
 */
export async function regenerateTitle(
  currentTitle: string,
  category: string
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an Etsy SEO expert. Generate compelling product titles under 140 characters.',
        },
        {
          role: 'user',
          content: `Create a different, better title for an Etsy ${category} listing. Current title: "${currentTitle}". Return ONLY the new title, nothing else.`,
        },
      ],
      temperature: 0.8,
      max_tokens: 50,
    });

    let title = response.choices[0].message.content?.trim() || currentTitle;

    // Remove quotes if present
    title = title.replace(/^["']|["']$/g, '');

    // Limit to 140 characters
    if (title.length > 140) {
      title = title.substring(0, 137) + '...';
    }

    return title;
  } catch (error) {
    console.error('OpenAI title regeneration error:', error);
    throw new Error('Failed to regenerate title');
  }
}

/**
 * Regenerate just the description
 */
export async function regenerateDescription(
  title: string,
  category: string
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an Etsy copywriter. Write compelling, detailed product descriptions.',
        },
        {
          role: 'user',
          content: `Write a detailed Etsy description for: "${title}" in the ${category} category. Include features, benefits, use cases, and shipping info. Return ONLY the description text.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return response.choices[0].message.content?.trim() || '';
  } catch (error) {
    console.error('OpenAI description regeneration error:', error);
    throw new Error('Failed to regenerate description');
  }
}

/**
 * Generate channel-specific listing content for any marketplace
 */
export interface ChannelListingInput {
  productImageUrl: string;
  productName?: string;
  category: string;
  shortDescription: string;
  channel: string;
  attributes?: {
    brand?: string;
    material?: string;
    color?: string;
    size?: string;
  };
}

export interface ChannelListingOutput {
  title: string;
  description: string;
  tags?: string[];
  bullets?: string[];
  materials?: string[];
  [key: string]: any;
}

/**
 * Generate marketplace-optimized listing content using AI
 */
export async function generateChannelListing(
  input: ChannelListingInput
): Promise<ChannelListingOutput> {
  try {
    // Channel-specific requirements and prompts
    const channelSpecs: Record<string, any> = {
      amazon: {
        titleMax: 200,
        titleRecommended: 80,
        bulletCount: 5,
        format: 'Amazon requires keyword-rich titles, benefit-driven bullet points with checkmarks, and search-optimized keywords.',
        fields: ['title', 'bullet_points', 'description', 'keywords'],
      },
      ebay: {
        titleMax: 80,
        bulletCount: 5,
        format: 'eBay needs concise titles front-loaded with key terms, HTML-formatted descriptions with features, and descriptive tags.',
        fields: ['title', 'description', 'tags', 'bullets'],
      },
      etsy: {
        titleMax: 140,
        tagCount: 13,
        tagMaxLength: 20,
        format: 'Etsy requires descriptive, story-driven titles, 13 tags (max 20 chars each), materials list, and benefit-focused bullet points.',
        fields: ['title', 'description', 'tags', 'materials', 'bullets'],
      },
      tiktok: {
        titleMax: 100,
        descMax: 500,
        format: 'TikTok Shop needs catchy, trend-friendly titles, short descriptions, viral hashtags, and engaging captions.',
        fields: ['title', 'short_description', 'hashtags', 'video_caption'],
      },
      shopify: {
        titleMax: 255,
        format: 'Shopify needs clear titles, HTML-formatted descriptions, SEO meta fields, and collection tags.',
        fields: ['title', 'description', 'seo_meta_title', 'seo_meta_description', 'tags'],
      },
      facebook: {
        titleMax: 150,
        descMax: 5000,
        format: 'Facebook Shop requires concise titles, benefit-focused descriptions, short ad captions, and relevant tags.',
        fields: ['title', 'description', 'ad_caption', 'tags'],
      },
    };

    const spec = channelSpecs[input.channel] || channelSpecs.shopify;

    const systemPrompt = `You are an expert e-commerce copywriter specializing in ${input.channel.toUpperCase()} listings. Create SEO-optimized, conversion-focused content that follows marketplace best practices.

${spec.format}

Always include product benefits, features, and use cases. Make content compelling and searchable.`;

    const userPrompt = `Create a ${input.channel.toUpperCase()} listing for this product:

Category: ${input.category}
${input.productName ? `Product: ${input.productName}` : ''}
Description: ${input.shortDescription}
${input.attributes?.brand ? `Brand: ${input.attributes.brand}` : ''}
${input.attributes?.material ? `Material: ${input.attributes.material}` : ''}
${input.attributes?.color ? `Color: ${input.attributes.color}` : ''}

Generate the following fields optimized for ${input.channel}:
${spec.fields.map((f: string) => `- ${f}`).join('\n')}

IMPORTANT:
- Title: ${spec.titleMax ? `Max ${spec.titleMax} chars` : 'Concise and keyword-rich'}
${spec.titleRecommended ? `- Title recommended: ${spec.titleRecommended} chars or less` : ''}
${spec.bulletCount ? `- Bullet points: Exactly ${spec.bulletCount} benefit-driven bullets` : ''}
${spec.tagCount ? `- Tags: Exactly ${spec.tagCount} SEO tags (max ${spec.tagMaxLength} chars each)` : ''}
${spec.descMax ? `- Description: Max ${spec.descMax} chars` : ''}

Return ONLY valid JSON in this format:
${JSON.stringify(getChannelJSONSchema(input.channel), null, 2)}`;

    // Build message content
    const messageContent: any[] = [
      {
        type: 'text',
        text: userPrompt,
      },
    ];

    // Add image if it's a valid HTTP URL
    if (input.productImageUrl && input.productImageUrl.startsWith('http')) {
      messageContent.push({
        type: 'image_url',
        image_url: {
          url: input.productImageUrl,
          detail: 'low',
        },
      });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: messageContent,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 1500,
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error(`No content generated from OpenAI for ${input.channel}`);
    }

    const result = JSON.parse(content);
    
    // Validate and sanitize based on channel rules
    return sanitizeChannelOutput(result, input.channel, spec);
  } catch (error) {
    console.error(`OpenAI ${input.channel} generation error:`, error);
    throw new Error(`Failed to generate ${input.channel} listing`);
  }
}

function getChannelJSONSchema(channel: string): any {
  const schemas: Record<string, any> = {
    amazon: {
      title: 'Product title here',
      bullet_points: ['Bullet 1', 'Bullet 2', 'Bullet 3', 'Bullet 4', 'Bullet 5'],
      description: 'Full description here',
      keywords: ['keyword1', 'keyword2', 'keyword3'],
    },
    ebay: {
      title: 'Product title here',
      description: 'HTML description with features',
      tags: ['tag1', 'tag2', 'tag3'],
      bullets: ['Feature 1', 'Feature 2', 'Feature 3'],
    },
    etsy: {
      title: 'Product title here',
      description: 'Story-driven description',
      tags: ['tag1', 'tag2'],
      materials: ['material1', 'material2'],
      bullets: ['Benefit 1', 'Benefit 2'],
    },
    tiktok: {
      title: 'Catchy title',
      short_description: 'Brief description',
      hashtags: ['#hashtag1', '#hashtag2'],
      video_caption: 'Engaging caption for video',
    },
    shopify: {
      title: 'Product title',
      description: '<p>HTML description</p>',
      seo_meta_title: 'SEO title',
      seo_meta_description: 'SEO description',
      tags: ['tag1', 'tag2'],
    },
    facebook: {
      title: 'Product title',
      description: 'Product description',
      ad_caption: 'Short ad caption',
      tags: ['tag1', 'tag2'],
    },
  };
  return schemas[channel] || schemas.shopify;
}

function sanitizeChannelOutput(result: any, channel: string, spec: any): ChannelListingOutput {
  // Validate title length
  if (result.title && spec.titleMax && result.title.length > spec.titleMax) {
    result.title = result.title.substring(0, spec.titleMax - 3) + '...';
  }

  // Validate tags
  if (result.tags && spec.tagCount) {
    result.tags = result.tags.slice(0, spec.tagCount);
    if (spec.tagMaxLength) {
      result.tags = result.tags.map((tag: string) => 
        tag.length > spec.tagMaxLength ? tag.substring(0, spec.tagMaxLength) : tag
      );
    }
  }

  // Validate bullets
  if (result.bullet_points && spec.bulletCount) {
    result.bullet_points = result.bullet_points.slice(0, spec.bulletCount);
  }
  if (result.bullets && spec.bulletCount) {
    result.bullets = result.bullets.slice(0, spec.bulletCount);
  }

  // Validate description length
  if (result.description && spec.descMax && result.description.length > spec.descMax) {
    result.description = result.description.substring(0, spec.descMax - 3) + '...';
  }

  // Validate materials (Etsy)
  if (result.materials && result.materials.length > 13) {
    result.materials = result.materials.slice(0, 13);
  }

  return result;
}
