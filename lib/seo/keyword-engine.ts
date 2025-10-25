// ============================================
// KEYWORD ENGINE - INTELLIGENT KEYWORD MINING
// ============================================
// Generates long-tail keywords, fuses autosuggests, and maps placements
// Author: Claude Code Migration Team
// Date: 2025-10-15

import OpenAI from 'openai';
import { GroupedKeywords, Keyword, KeywordPlacement } from '@/lib/types/channels';

export class KeywordEngine {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  /**
   * Mine long-tail keywords grouped by category
   */
  async mineLongTails(
    productTitle: string,
    productDescription: string,
    category: string
  ): Promise<GroupedKeywords> {
    const prompt = `Generate long-tail keyword variations for this product. Long-tail keywords are 3-5 word phrases that are more specific and less competitive.

PRODUCT:
- Title: ${productTitle}
- Description: ${productDescription}
- Category: ${category}

Generate keywords grouped by these categories:

1. MATERIAL: What is it made of? (e.g., "genuine leather", "organic cotton", "solid wood")
2. STYLE: What style/aesthetic? (e.g., "modern minimalist", "vintage industrial", "boho chic")
3. AUDIENCE: Who is it for? (e.g., "gifts for mom", "professional women", "teen boys")
4. OCCASION: When to use it? (e.g., "wedding gift", "office desk", "everyday carry")
5. PROBLEM: What problem does it solve? (e.g., "organization solution", "space saving", "travel friendly")
6. MODIFIER: Descriptive qualities (e.g., "handmade", "eco-friendly", "luxury", "affordable")

For each category, provide 5-10 relevant long-tail keywords. Focus on:
- Search intent alignment
- Specificity (3-5 words)
- Natural language
- Buyer intent keywords

Return JSON format:
{
  "material": ["keyword1", "keyword2", ...],
  "style": ["keyword1", "keyword2", ...],
  "audience": ["keyword1", "keyword2", ...],
  "occasion": ["keyword1", "keyword2", ...],
  "problem": ["keyword1", "keyword2", ...],
  "modifier": ["keyword1", "keyword2", ...]
}`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1500,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('No keywords generated');
      }

      return JSON.parse(content) as GroupedKeywords;
    } catch (error) {
      console.error('Keyword mining error:', error);
      throw new Error(`Failed to mine keywords: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fuse autosuggest results from multiple sources
   * In production, integrate with Google Autocomplete API, Etsy API, etc.
   */
  async fuseAutosuggests(
    baseKeyword: string,
    sources: string[] = ['google', 'etsy', 'amazon', 'pinterest']
  ): Promise<string[]> {
    const prompt = `Generate search autosuggestion variations for "${baseKeyword}" as if from these platforms: ${sources.join(', ')}.

For each platform, consider their typical search patterns:
- Google: General queries, questions, comparisons
- Etsy: Handmade, personalized, gift-focused
- Amazon: Product features, brand names, use cases
- Pinterest: DIY, inspiration, style-focused

Generate 20-25 unique autosuggestion phrases that real users might search for. Include:
- Question format (how to, what is, where to buy)
- Comparative (vs, alternative to, similar to)
- Qualified (best, cheap, luxury, handmade)
- Use case specific (for home, for office, for travel)
- Time/event based (2025, christmas, wedding)

Return JSON:
{
  "suggestions": ["suggestion1", "suggestion2", ...]
}`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        max_tokens: 1000,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('No suggestions generated');
      }

      const result = JSON.parse(content);
      return result.suggestions || [];
    } catch (error) {
      console.error('Autosuggest fusion error:', error);
      throw new Error(`Failed to fuse autosuggests: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Map keyword placements in existing content
   */
  async mapPlacements(
    keywords: string[],
    content: {
      title: string;
      description: string;
      bullets?: string[];
      tags?: string[];
    }
  ): Promise<Record<string, string[]>> {
    const placements: Record<string, string[]> = {};

    for (const keyword of keywords) {
      const keywordPlacements: string[] = [];
      const lowerKeyword = keyword.toLowerCase();

      // Check title
      if (content.title.toLowerCase().includes(lowerKeyword)) {
        keywordPlacements.push('title');
      }

      // Check description
      if (content.description.toLowerCase().includes(lowerKeyword)) {
        keywordPlacements.push('description');
      }

      // Check bullets
      if (content.bullets?.some((b) => b.toLowerCase().includes(lowerKeyword))) {
        keywordPlacements.push('bullets');
      }

      // Check tags
      if (content.tags?.some((t) => t.toLowerCase().includes(lowerKeyword))) {
        keywordPlacements.push('tags');
      }

      placements[keyword] = keywordPlacements;
    }

    return placements;
  }

  /**
   * Suggest optimal placements for keywords not yet used
   */
  async suggestPlacements(
    keywords: string[],
    currentPlacements: Record<string, string[]>,
    content: {
      title: string;
      description: string;
      bullets?: string[];
    }
  ): Promise<Record<string, string[]>> {
    const suggestions: Record<string, string[]> = {};

    for (const keyword of keywords) {
      const current = currentPlacements[keyword] || [];
      const recommended: string[] = [];

      // If not in title and title has room, recommend it
      if (!current.includes('title') && content.title.length < 60) {
        recommended.push('title');
      }

      // Always recommend description (can handle multiple keywords)
      if (!current.includes('description')) {
        recommended.push('description');
      }

      // If bullets exist and keyword not in them, recommend
      if (content.bullets && content.bullets.length > 0 && !current.includes('bullets')) {
        recommended.push('bullets');
      }

      // Always recommend tags (if applicable)
      if (!current.includes('tags')) {
        recommended.push('tags');
      }

      suggestions[keyword] = recommended;
    }

    return suggestions;
  }

  /**
   * Analyze keyword competition and search intent
   */
  async analyzeKeywords(keywords: string[]): Promise<
    Array<{
      keyword: string;
      competition: 'low' | 'medium' | 'high';
      intent: 'informational' | 'navigational' | 'commercial' | 'transactional';
      score: number;
    }>
  > {
    const prompt = `Analyze these e-commerce keywords for SEO potential:

KEYWORDS:
${keywords.join('\n')}

For each keyword, determine:
1. COMPETITION LEVEL (low/medium/high):
   - Low: Niche, specific, less common
   - Medium: Moderately common, some competition
   - High: Very common, highly competitive

2. SEARCH INTENT:
   - Informational: "how to", "what is", "guide"
   - Navigational: Brand/product name searches
   - Commercial: "best", "review", "comparison"
   - Transactional: "buy", "price", "discount", product+modifier

3. SEO SCORE (0-100):
   - Consider: specificity, buyer intent, competition, relevance

Return JSON array:
[
  {
    "keyword": "...",
    "competition": "low|medium|high",
    "intent": "informational|navigational|commercial|transactional",
    "score": 0-100
  },
  ...
]`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('No analysis generated');
      }

      const result = JSON.parse(content);
      return result.keywords || [];
    } catch (error) {
      console.error('Keyword analysis error:', error);
      throw new Error(`Failed to analyze keywords: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get keyword density in content
   */
  calculateDensity(keyword: string, content: string): number {
    const lowerContent = content.toLowerCase();
    const lowerKeyword = keyword.toLowerCase();

    // Count keyword occurrences
    const regex = new RegExp(`\\b${lowerKeyword}\\b`, 'gi');
    const matches = lowerContent.match(regex);
    const keywordCount = matches ? matches.length : 0;

    // Count total words
    const words = content.split(/\s+/).length;

    // Calculate density (percentage)
    const density = (keywordCount / words) * 100;

    return Math.round(density * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Optimize keyword density in content
   */
  async optimizeDensity(
    content: string,
    keywords: string[],
    targetDensity: number = 2.5
  ): Promise<string> {
    const currentDensities = keywords.map((kw) => ({
      keyword: kw,
      density: this.calculateDensity(kw, content),
    }));

    const prompt = `Optimize this content for keyword density without keyword stuffing.

CONTENT:
${content}

KEYWORDS AND CURRENT DENSITY:
${currentDensities.map((d) => `- "${d.keyword}": ${d.density}%`).join('\n')}

TARGET DENSITY: ${targetDensity}% per keyword

TASK:
- Naturally integrate keywords where density is too low
- Remove/replace keywords where density is too high (>3%)
- Maintain readability and flow
- Use synonyms and semantic variations
- Keep the same approximate word count

Return the optimized content as plain text (not JSON).`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
        max_tokens: 1500,
      });

      return response.choices[0].message.content || content;
    } catch (error) {
      console.error('Density optimization error:', error);
      return content; // Return original on error
    }
  }
}

/**
 * Factory function to create configured Keyword Engine
 */
export function createKeywordEngine(apiKey?: string): KeywordEngine {
  const key = apiKey || process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error('OpenAI API key not configured');
  }

  return new KeywordEngine(key);
}

/**
 * Full keyword research pipeline
 */
export async function fullKeywordResearch(
  productTitle: string,
  productDescription: string,
  category: string,
  apiKey?: string
): Promise<{
  grouped: GroupedKeywords;
  autosuggests: string[];
  analysis: Array<{
    keyword: string;
    competition: string;
    intent: string;
    score: number;
  }>;
}> {
  const engine = createKeywordEngine(apiKey);

  console.log('Keyword Engine: Mining long-tails...');
  const grouped = await engine.mineLongTails(productTitle, productDescription, category);

  console.log('Keyword Engine: Fusing autosuggests...');
  const autosuggests = await engine.fuseAutosuggests(productTitle);

  // Combine all keywords for analysis
  const allKeywords = [
    ...Object.values(grouped).flat(),
    ...autosuggests.slice(0, 10), // Limit autosuggests
  ].slice(0, 30); // Max 30 keywords to analyze

  console.log('Keyword Engine: Analyzing keywords...');
  const analysis = await engine.analyzeKeywords(allKeywords);

  return {
    grouped,
    autosuggests,
    analysis,
  };
}
