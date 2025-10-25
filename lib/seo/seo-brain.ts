// ============================================
// SEO BRAIN - AI-POWERED CONTENT OPTIMIZATION
// ============================================
// Two-pass optimization system for multi-channel listings
// Author: Claude Code Migration Team
// Date: 2025-10-15

import OpenAI from 'openai';
import { SEOResponse, SEOBrainConfig, Channel } from '@/lib/types/channels';

export class SEOBrain {
  private openai: OpenAI;
  private config: SEOBrainConfig;

  constructor(apiKey: string, config?: Partial<SEOBrainConfig>) {
    this.openai = new OpenAI({ apiKey });
    this.config = {
      model: config?.model || 'gpt-4-turbo',
      passes: {
        draft: {
          temperature: config?.passes?.draft?.temperature || 0.7,
          maxTokens: config?.passes?.draft?.maxTokens || 2000,
        },
        optimize: {
          temperature: config?.passes?.optimize?.temperature || 0.3,
          maxTokens: config?.passes?.optimize?.maxTokens || 2500,
        },
      },
    };
  }

  /**
   * PASS 1: Generate initial draft content from product data
   * More creative, exploratory temperature
   */
  async generateDraft(
    productImage: string,
    shortDescription: string,
    category: string,
    channels: Channel[]
  ): Promise<SEOResponse> {
    const channelNames = channels.map((c) => c.name).join(', ');
    const channelRequirements = this.formatChannelRequirements(channels);

    const prompt = `You are an expert e-commerce SEO copywriter. Analyze this product and create optimized, conversion-focused content.

PRODUCT DETAILS:
- Image URL: ${productImage}
- Description: ${shortDescription}
- Category: ${category}
- Target Channels: ${channelNames}

CHANNEL REQUIREMENTS:
${channelRequirements}

YOUR TASK:
Generate content optimized for SEO and conversions across multiple platforms.

1. BASE CONTENT (shared across all channels):
   - Title: 50-70 characters, keyword-rich, benefit-focused
   - Description: 200-300 words, conversational, highlight benefits over features
   - Bullets: 5 concise feature bullets (if applicable)

2. CHANNEL-SPECIFIC OPTIMIZATIONS:
   For each channel, provide platform-specific variations:
   - Shopify: Longer title with promotional hook, HTML-formatted description
   - eBay: 80-char title, condition-focused copy
   - Amazon: 200-char title, 5 bullet points (10-250 chars each)
   - Etsy: 140-char title, craft-focused tags, materials emphasis
   - Facebook/Instagram: Social-friendly short description
   - TikTok: Trendy, youth-oriented copy

3. SEO ANALYSIS:
   - Calculate SEO score (0-100)
   - List any issues found
   - Provide specific fixes

4. KEYWORDS:
   - 5-10 primary keywords (high-volume, competitive)
   - 10-20 long-tail keywords (specific, lower competition)
   - Suggest placements (title, description, bullets, tags)

IMPORTANT:
- Use natural language (avoid keyword stuffing)
- Focus on benefits and emotional triggers
- Include power words and urgency where appropriate
- Ensure compliance with each platform's policies
- Return ONLY valid JSON matching the SEOResponse interface

Return format:
{
  "base": {
    "title": "...",
    "description": "...",
    "bullets": ["...", "..."]
  },
  "channels": {
    "shopify": { "title": "...", "tags": [...] },
    "ebay": { "title": "...", "overrides": {...} },
    "amazon": { "bullets": [...] },
    "etsy": { "title": "...", "tags": [...] },
    "facebook-ig": { "description": "..." },
    "tiktok": { "title": "...", "description": "..." }
  },
  "seo": {
    "score": 85,
    "issues": ["..."],
    "fixes": ["..."]
  },
  "keywords": {
    "primary": ["...", "..."],
    "longtail": ["...", "..."],
    "placements": {
      "keyword1": ["title", "description"],
      "keyword2": ["bullets", "tags"]
    }
  }
}`;

    try {
      const response = await this.openai.chat.completions.create({
        model: this.config.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: this.config.passes.draft.temperature,
        max_tokens: this.config.passes.draft.maxTokens,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('No content generated');
      }

      return JSON.parse(content) as SEOResponse;
    } catch (error) {
      console.error('SEO Brain draft generation error:', error);
      throw new Error(`Failed to generate draft: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * PASS 2: Optimize existing content with keyword focus
   * Lower temperature for more focused, precise optimization
   */
  async optimize(
    currentContent: any,
    targetKeywords: string[],
    channels: Channel[],
    focusAreas?: string[]
  ): Promise<SEOResponse> {
    const channelNames = channels.map((c) => c.name).join(', ');
    const focus = focusAreas?.join(', ') || 'overall SEO, readability, conversion rate';

    const prompt = `You are an expert SEO optimizer. Improve this e-commerce content for maximum visibility and conversions.

CURRENT CONTENT:
${JSON.stringify(currentContent, null, 2)}

TARGET KEYWORDS:
${targetKeywords.join(', ')}

TARGET CHANNELS:
${channelNames}

OPTIMIZATION FOCUS:
${focus}

YOUR TASK:
Optimize the content while maintaining natural language and readability.

1. KEYWORD OPTIMIZATION:
   - Integrate target keywords naturally
   - Improve keyword density (aim for 2-3% for primary keywords)
   - Add semantic variations and related terms
   - Ensure keyword placement in strategic locations (title start, first 100 chars of description, bullets)

2. READABILITY:
   - Use active voice
   - Short sentences (15-20 words average)
   - Break into scannable paragraphs
   - Add transition words
   - Include power words and emotional triggers

3. PLATFORM COMPLIANCE:
   - Ensure all channel-specific content meets platform requirements
   - Verify title lengths, tag counts, bullet formatting
   - Remove any prohibited language or claims
   - Optimize for each platform's search algorithm

4. CONVERSION OPTIMIZATION:
   - Lead with benefits (not features)
   - Include social proof elements
   - Add urgency/scarcity where appropriate
   - Clear value proposition in first 50 characters
   - Strong call-to-action implications

5. SEO SCORING:
   - Target score: 85+ (out of 100)
   - Identify remaining issues
   - Provide specific, actionable fixes

Return ONLY valid JSON in the same SEOResponse format, with optimized content and improved SEO score.`;

    try {
      const response = await this.openai.chat.completions.create({
        model: this.config.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: this.config.passes.optimize.temperature,
        max_tokens: this.config.passes.optimize.maxTokens,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('No content generated');
      }

      return JSON.parse(content) as SEOResponse;
    } catch (error) {
      console.error('SEO Brain optimization error:', error);
      throw new Error(`Failed to optimize content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Quick SEO score calculation without full optimization
   */
  async scoreSEO(content: any): Promise<{ score: number; issues: string[]; fixes: string[] }> {
    const prompt = `Analyze this e-commerce content and provide an SEO score.

CONTENT:
${JSON.stringify(content, null, 2)}

Analyze:
1. Keyword usage and density
2. Title optimization
3. Description quality and length
4. Readability (sentence length, paragraph structure)
5. Power words and emotional triggers
6. Content uniqueness
7. Call-to-action effectiveness

Return JSON:
{
  "score": 0-100,
  "issues": ["specific issue 1", "specific issue 2"],
  "fixes": ["actionable fix 1", "actionable fix 2"]
}`;

    try {
      const response = await this.openai.chat.completions.create({
        model: this.config.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 1000,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('No score generated');
      }

      return JSON.parse(content);
    } catch (error) {
      console.error('SEO scoring error:', error);
      throw new Error(`Failed to score SEO: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Helper: Format channel requirements for prompt
   */
  private formatChannelRequirements(channels: Channel[]): string {
    return channels
      .map((channel) => {
        const rules = channel.validationRules;
        const requirements: string[] = [];

        if (rules.title?.maxLength) {
          requirements.push(`Title max ${rules.title.maxLength} chars`);
        }
        if (rules.description?.minLength) {
          requirements.push(`Description min ${rules.description.minLength} chars`);
        }
        if (rules.tags) {
          requirements.push(`Tags: ${rules.tags.min || 0}-${rules.tags.max || '∞'}`);
        }
        if (rules.bullets?.count) {
          requirements.push(`${rules.bullets.count} bullet points required`);
        }
        if (rules.images?.min) {
          requirements.push(`Min ${rules.images.min} images`);
        }

        return `- ${channel.name}: ${requirements.join(', ')}`;
      })
      .join('\n');
  }
}

/**
 * Factory function to create configured SEO Brain instance
 */
export function createSEOBrain(apiKey?: string): SEOBrain {
  const key = apiKey || process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error('OpenAI API key not configured');
  }

  return new SEOBrain(key, {
    model: 'gpt-4-turbo',
    passes: {
      draft: {
        temperature: 0.7,
        maxTokens: 2000,
      },
      optimize: {
        temperature: 0.3,
        maxTokens: 2500,
      },
    },
  });
}

/**
 * Convenience function: Full two-pass optimization pipeline
 */
export async function fullSEOOptimization(
  productImage: string,
  shortDescription: string,
  category: string,
  channels: Channel[],
  apiKey?: string
): Promise<SEOResponse> {
  const brain = createSEOBrain(apiKey);

  // Pass 1: Generate initial draft
  console.log('SEO Brain: Generating draft...');
  const draft = await brain.generateDraft(productImage, shortDescription, category, channels);

  // Pass 2: Optimize with discovered keywords
  console.log('SEO Brain: Optimizing with keywords...');
  const optimized = await brain.optimize(
    draft,
    [...draft.keywords.primary, ...draft.keywords.longtail.slice(0, 5)],
    channels,
    ['keyword density', 'readability', 'conversion rate']
  );

  return optimized;
}
