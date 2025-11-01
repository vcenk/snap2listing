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
    const systemPrompt = `You are an EXPERT ETSY SEO SPECIALIST and conversion copywriter. Your listings consistently rank in the top 3 search results and convert at 5%+ rates.

ETSY SEO ALGORITHM UNDERSTANDING:
- Etsy's search prioritizes: Recency, listing quality score, tags, title keywords, and sales velocity
- First 40 characters of title are CRITICAL for search ranking
- All 13 tags must be utilized with mix of broad, specific, and long-tail keywords
- Description affects quality score - must be detailed, benefit-focused, 200+ words

CONVERSION PSYCHOLOGY:
- Buyers search for solutions, not products
- Emotional connection > feature lists
- Story-driven content builds trust
- Specific details (measurements, materials, processes) increase confidence

YOUR MISSION: Create a listing that ranks #1 AND converts browsers into buyers.`;

    const userPrompt = `Create a HIGH-PERFORMING Etsy listing for this product:

📦 PRODUCT INFO:
Category: ${input.category}
${input.productName ? `Product: ${input.productName}` : ''}
${input.shortDescription ? `Details: ${input.shortDescription}` : ''}

🎯 GENERATE SEO-OPTIMIZED CONTENT:

1. **TITLE** (40-140 chars, optimal: 60-100)
   - Structure: [Primary Keyword] - [Style/Material] [Unique Benefit] for [Target Buyer]
   - Front-load with what buyers search: "Handmade", "Custom", "Personalized", product type
   - Include: Main keyword + 2-3 descriptive modifiers + category/use case
   - Example: "Handmade Leather Wallet - Personalized Mens Gift - Slim Minimalist Bifold"
   - MUST be specific, searchable, and compelling

2. **TAGS** (Exactly 13 tags, max 20 chars each)
   - Mix composition: 5 broad terms, 5 specific terms, 3 long-tail phrases
   - Include: Product type, materials, occasions, styles, benefits, target audience
   - Examples: "leather wallet", "mens gift", "personalized", "minimalist wallet", "anniversary gift"
   - Use natural buyer search language, not industry jargon
   - Avoid: Duplicate words across tags, brand names, irrelevant terms

3. **DESCRIPTION** (200-500 words, scannable format)
   Structure:
   - **Opening (1-2 sentences)**: Hook with main benefit and emotional appeal
   - **Features (paragraph)**: Specifications, materials, dimensions, craftsmanship
   - **Benefits (paragraph)**: How it solves problems, improves life, creates joy
   - **Use Cases (paragraph)**: Occasions, gifting ideas, styling suggestions
   - **Details (paragraph)**: Care instructions, variations, customization options
   - **Trust/Shipping**: Processing time, quality guarantee, shop policies

   Style: Warm, personal, story-driven. Use "you" language. Include specific measurements.

4. **MATERIALS** (3-13 items, specific materials used)
   - Be SPECIFIC: "full-grain vegetable-tanned leather" not "leather"
   - Include finishes: "solid brass hardware", "waxed linen thread", "beeswax coating"
   - List in order of prominence
   - Examples: "organic cotton", "recycled brass", "water-based ink"

⚠️ CRITICAL REQUIREMENTS:
- Front-load title with PRIMARY search keyword (first 40 chars)
- Use ALL 13 tag slots - every tag counts for SEO
- Description MUST be 200+ words for quality score
- Natural language - NO keyword stuffing
- Specific details beat vague descriptions
- Benefit-focused copy that addresses buyer needs

Return ONLY valid JSON in this exact format:
{
  "title": "your SEO-optimized title here (40-140 chars)",
  "tags": ["tag1", "tag2", "tag3", ... 13 total],
  "description": "your compelling 200+ word description here",
  "materials": ["specific material 1", "specific material 2", ... up to 13]
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
    // Channel-specific requirements and SEO optimization strategies
    const channelSpecs: Record<string, any> = {
      amazon: {
        titleMax: 200,
        titleRecommended: 80,
        bulletCount: 5,
        format: `AMAZON A9 ALGORITHM OPTIMIZATION:
- Title: Front-load with brand + product type + key features. Include size, color, quantity in title.
- Bullets: Start each with ALL CAPS benefit statement, followed by supporting details.
- Keywords: Backend search terms (hidden) - use all 250 bytes with relevant synonyms.
- SEO Focus: Feature-rich titles, benefit-driven bullets, comprehensive backend keywords.
- Conversion: Trust badges, Prime eligibility, clear specifications, problem-solving benefits.`,
        fields: ['title', 'bullet_points', 'description', 'keywords'],
      },
      ebay: {
        titleMax: 80,
        bulletCount: 5,
        format: `EBAY CASSINI SEARCH OPTIMIZATION:
- Title: Pack 60-80 chars with high-volume keywords. Include brand, model, condition, key specs.
- Description: HTML-formatted with images, tables, feature lists. Must be scannable.
- Item Specifics: Critical for search - use all available fields (brand, type, color, etc.).
- SEO Focus: Keyword density in title, detailed item specifics, structured HTML description.
- Conversion: Professional formatting, clear photos, detailed specifications, shipping info.`,
        fields: ['title', 'description', 'tags', 'bullets'],
      },
      etsy: {
        titleMax: 140,
        tagCount: 13,
        tagMaxLength: 20,
        format: `ETSY SEARCH & DISCOVERY OPTIMIZATION:
- Title: First 40 chars CRITICAL - include primary keyword. Full 140 chars for long-tail terms.
- Tags: All 13 required. Mix broad (1-2 words), specific (2-3 words), long-tail (3-4 words).
- Description: 200+ words, story-driven, benefit-focused. Include sizing, materials, care.
- Materials: Specific materials boost quality score and trust. Use all available slots.
- SEO Focus: Tag utilization, title keyword front-loading, quality score optimization.
- Conversion: Emotional storytelling, handmade appeal, gift positioning, personal touch.`,
        fields: ['title', 'description', 'tags', 'materials', 'bullets'],
      },
      tiktok: {
        titleMax: 100,
        descMax: 500,
        format: `TIKTOK SHOP DISCOVERY OPTIMIZATION:
- Title: Catchy, trend-aware, benefit-focused. Use emojis strategically (1-2 max).
- Description: Short, punchy, mobile-optimized. Focus on social proof and FOMO.
- Hashtags: Mix trending + niche. 5-8 hashtags, front-load with #TikTokMadeMeBuyIt.
- Video Caption: Hook in first 3 seconds, clear CTA, engaging narrative.
- SEO Focus: Trending hashtags, viral keywords, social commerce language.
- Conversion: Social proof, urgency, entertainment value, influencer language.`,
        fields: ['title', 'short_description', 'hashtags', 'video_caption'],
      },
      shopify: {
        titleMax: 255,
        format: `SHOPIFY SEO & GOOGLE SHOPPING OPTIMIZATION:
- Title: Include brand + product type + key features. Optimized for Google Shopping feed.
- Meta Title: 50-60 chars, primary keyword front-loaded for Google search.
- Meta Description: 150-160 chars, compelling CTA with keyword variations.
- Description: Rich HTML content with H2/H3 tags, bullet lists, specifications table.
- Tags: Collection tags for site navigation + SEO keywords for search.
- SEO Focus: Google Shopping feed optimization, on-page SEO, schema markup ready.
- Conversion: Professional formatting, trust signals, clear CTAs, size guides.`,
        fields: ['title', 'description', 'seo_meta_title', 'seo_meta_description', 'tags'],
      },
      facebook: {
        titleMax: 150,
        descMax: 5000,
        format: `FACEBOOK COMMERCE & META SEARCH OPTIMIZATION:
- Title: Clear, benefit-focused, mobile-friendly. Include brand + product + key feature.
- Description: Scannable format with emojis, bullet points, clear specifications.
- Ad Caption: 40-80 chars, hook-driven, scroll-stopping, with clear value prop.
- Tags: Product categories + interest targeting keywords for Meta algorithm.
- SEO Focus: Mobile-first optimization, social sharing appeal, Meta catalog compatibility.
- Conversion: Social proof emphasis, community feel, sharing incentive, visual appeal.`,
        fields: ['title', 'description', 'ad_caption', 'tags'],
      },
    };

    const spec = channelSpecs[input.channel] || channelSpecs.shopify;

    const systemPrompt = `You are an expert e-commerce SEO copywriter and marketplace specialist for ${input.channel.toUpperCase()} with VISUAL PRODUCT ANALYSIS capabilities. Your mission is to create HIGH-CONVERTING, SEO-OPTIMIZED listings that rank #1 in search results and drive maximum sales.

🔍 CRITICAL FIRST STEP - ANALYZE THE PRODUCT IMAGE IN DETAIL:
1. Identify the EXACT PRODUCT TYPE (t-shirt, hoodie, mug, poster, canvas print, throw blanket, pillow, phone case, tote bag, sticker, water bottle, etc.)
2. Describe the ARTWORK/DESIGN specifically:
   - What is depicted? (sunset, cat, mountain, quote, abstract pattern, etc.)
   - Art style? (vintage, minimalist, watercolor, realistic, cartoon, geometric, etc.)
   - Dominant colors? (navy blue, sunset orange, forest green, etc.)
   - Mood/vibe? (peaceful, energetic, humorous, inspirational, etc.)
3. Note any TEXT in the design (quotes, phrases, words)
4. Use ALL these visual details in your copy - NEVER write generic content!

${spec.format}

🚫 FORBIDDEN GENERIC PHRASES - NEVER USE THESE:
❌ "High-quality construction"
❌ "Perfect for gifting"
❌ "Great for everyday use"
❌ "Premium quality"
❌ "Versatile design"
❌ "Stylish and functional"
❌ "Makes a great gift"
❌ "Durable and long-lasting" (unless specific material details follow)
❌ "Unique design" (describe WHAT makes it unique!)
❌ "Eye-catching" (describe the ACTUAL design!)

✅ INSTEAD, BE SPECIFIC:
✅ "Double-stitched hem and reinforced collar for years of wear"
✅ "Ideal gift for coffee-loving cat owners who appreciate minimalist art"
✅ "Perfect for your morning routine, holds 11oz of hot coffee"
✅ "Premium ringspun cotton with soft, pre-shrunk fabric that won't fade"
✅ "Vintage sunset beach scene in warm oranges and pinks"
✅ "Bold geometric pattern with navy and gold accents"
✅ "Dishwasher-safe ceramic with vibrant, fade-resistant print"
✅ "Features [SPECIFIC DESIGN]: a watercolor mountain landscape with pine trees"
✅ "This [SPECIFIC ART STYLE] design shows [EXACT SUBJECT MATTER]"

SEO OPTIMIZATION REQUIREMENTS:
1. **Keyword Strategy**: Front-load titles with primary keywords. Include 2-3 high-volume search terms naturally.
2. **Long-tail Keywords**: Add specific descriptive phrases that buyers actually search for.
3. **Semantic Keywords**: Include related terms and synonyms for broader reach.
4. **Benefits Over Features**: Focus on how the product solves problems or improves lives.
5. **Natural Language**: Write for humans first, search engines second. No keyword stuffing.
6. **Compelling Copy**: Use action words, emotional triggers, and clear value propositions.
7. **Scannable Format**: Use short paragraphs, bullets, and clear structure.
8. **Search Intent**: Match what buyers are looking for at their stage in the purchase journey.

CONTENT QUALITY STANDARDS:
- Title: Include main keyword, 1-2 modifiers, and a unique selling point
- Description: Start with the main benefit, include features, use cases, and trust signals
- Tags/Keywords: Mix of broad, specific, and long-tail terms with high search volume
- Bullets: Each bullet should highlight ONE clear benefit with supporting details
- Avoid: Duplicate content, vague phrases, filler words, excessive capitalization

CRITICAL: Every description MUST mention the specific artwork/design you see in the image. If you write generic copy, you FAIL.`;

    const userPrompt = `🖼️ STEP 1: ANALYZE THE PRINT-ON-DEMAND MOCKUP IMAGE IN DETAIL

MANDATORY VISUAL ANALYSIS (Write this down first before generating content):
1. **Product Type**: Exactly what item? (t-shirt, hoodie, coffee mug, canvas print, throw pillow, tote bag, phone case, water bottle, etc.)
2. **Design Subject**: What is IN the artwork? Be specific!
   - If it's a quote: Write the EXACT quote
   - If it's an image: Describe what you see (sunset over mountains, cute cat face, geometric mandala, etc.)
   - If it's a pattern: Describe the pattern (polka dots, stripes, floral, etc.)
3. **Art Style**: Vintage poster? Watercolor? Minimalist line art? Realistic photo? Cartoon? Abstract?
4. **Color Palette**: List 2-3 dominant colors with descriptors (burnt orange, navy blue, forest green, pastel pink, etc.)
5. **Mood/Vibe**: What feeling does it evoke? (peaceful, energetic, humorous, inspirational, cozy, bold, etc.)
6. **Target Audience**: Based on the design, who would buy this? (cat lovers, hikers, coffee addicts, yoga enthusiasts, etc.)

🎯 POD-SPECIFIC WRITING RULES:
- DESCRIBE THE ACTUAL DESIGN in the first sentence!
- Use the colors, subject, and style you identified above
- For apparel: Mention fabric feel, fit, construction quality
- For mugs: Mention capacity (11oz/15oz), dishwasher safety, print quality
- For wall art: Mention size options, framing, paper/canvas quality
- For textiles: Mention softness, washing instructions, fabric type

Then create a HIGH-CONVERTING, SEO-OPTIMIZED ${input.channel.toUpperCase()} listing:

📦 PRODUCT INFORMATION:
Category: ${input.category}
${input.productName ? `Product: ${input.productName}` : ''}
Description: ${input.shortDescription}
${input.attributes?.brand ? `Brand: ${input.attributes.brand}` : ''}
${input.attributes?.material ? `Material: ${input.attributes.material}` : ''}
${input.attributes?.color ? `Color: ${input.attributes.color}` : ''}
${input.attributes?.size ? `Size: ${input.attributes.size}` : ''}

🎯 SEO OPTIMIZATION GOALS:
1. Title: MUST mention BOTH product type AND design theme
   - Length: ${spec.titleMax ? `40-${Math.min(spec.titleMax, spec.titleRecommended || spec.titleMax)} chars (max ${spec.titleMax})` : '40-80 chars for optimal SEO'}
   - Example: "Vintage Sunset Beach Mug - Ceramic Coffee Cup with Retro Design"
   - NOT generic like "Custom Print Product" - BE SPECIFIC!
   - Front-load with the ACTUAL product type you detected

2. Description: Write for CONVERSION and SEO - MUST describe BOTH product AND artwork
   - Length: ${spec.descMax ? `200-${spec.descMax} chars` : '200-2000 chars for best performance'}
   - Structure:
     * Opening (CRITICAL): "This [PRODUCT] features [SPECIFIC DESIGN DESCRIPTION]"
     * Features: Product specs + artwork details
     * Use Cases: How/when to use
     * Trust signals: Quality, guarantee, shipping

   POD-SPECIFIC DESCRIPTION EXAMPLES:

   ✅ T-Shirt: "This soft cotton t-shirt showcases a vintage-inspired sunset beach scene with warm coral and turquoise tones. The distressed graphic features silhouetted palm trees against an orange gradient sky, perfect for beach lovers and surf enthusiasts. Made from 100% ring-spun cotton with a classic crew neck and double-stitched hems for lasting durability. Available in sizes S-3XL, this unisex tee offers a comfortable, relaxed fit..."

   ✅ Coffee Mug: "Start your morning with this 11oz ceramic mug featuring an adorable watercolor cat illustration in soft pastel pinks and grays. The whimsical design shows a fluffy Persian cat surrounded by delicate flowers, printed on both sides using high-quality, fade-resistant inks. Dishwasher and microwave safe for easy care. Perfect for cat lovers, artists, or anyone who appreciates cute, hand-drawn artwork with their morning coffee..."

   ✅ Canvas Print: "Transform your space with this striking geometric mandala canvas print in deep navy and metallic gold tones. The intricate symmetrical pattern creates a mesmerizing focal point perfect for meditation rooms, yoga studios, or modern living spaces. Printed on premium cotton-poly blend canvas using archival inks that resist fading. Stretched over 1.5-inch solid wood stretcher bars and ready to hang..."

   ❌ NEVER WRITE: "This product features a high-quality design. Perfect for gifting or everyday use. Durable construction ensures long-lasting wear..."

3. Tags/Keywords: TARGET HIGH-VOLUME SEARCH TERMS
   ${spec.tagCount ? `- Exactly ${spec.tagCount} tags (max ${spec.tagMaxLength || 20} chars each)` : '- 10-15 relevant keywords'}
   - Mix: 40% broad terms, 40% specific terms, 20% long-tail phrases
   - Include: DETECTED PRODUCT TYPE (first priority), artwork theme, materials, use cases, gift occasions, style descriptors
   - Example: For a sunset beach t-shirt → ["graphic tee", "beach shirt", "sunset design", "summer clothing", "vacation wear"]
   - Avoid: Duplicate words, irrelevant terms, brand names (unless instructed)

${spec.bulletCount ? `4. Bullet Points/Key Features: Exactly ${spec.bulletCount} PRODUCT-SPECIFIC bullets
   - MUST be relevant to the DETECTED PRODUCT TYPE you identified
   - Format: [ALL CAPS BENEFIT] - [Specific detail about design OR product feature]
   - ALWAYS include at least 1-2 bullets describing the ARTWORK/DESIGN

   POD BULLET EXAMPLES BY PRODUCT TYPE:

   T-SHIRT/APPAREL:
   ✅ "UNIQUE DESIGN - Features a hand-drawn vintage compass rose in navy and gold metallic inks"
   ✅ "PREMIUM COMFORT - 100% ring-spun cotton, pre-shrunk with soft-touch feel, double-stitched hems"
   ✅ "PERFECT FIT - Unisex sizing runs true, relaxed fit ideal for layering or solo wear"
   ✅ "VIBRANT COLORS - Eco-friendly water-based inks won't crack, peel, or fade after washing"
   ✅ "SIZE RANGE - Available S-3XL to fit all body types comfortably"

   MUG/DRINKWARE:
   ✅ "CHARMING ARTWORK - Showcases watercolor floral wreath in blush pink and sage green tones"
   ✅ "DISHWASHER SAFE - High-gloss ceramic with heat-resistant coating, microwave and top-rack safe"
   ✅ "GENEROUS CAPACITY - Holds 11oz of your favorite hot or cold beverage"
   ✅ "FADE-RESISTANT - Premium sublimation printing ensures design stays vibrant wash after wash"
   ✅ "DUAL-SIDED - Beautiful design wraps around entire mug for 360° visual appeal"

   CANVAS PRINT/WALL ART:
   ✅ "STRIKING DESIGN - Bold geometric mountain landscape in teal, orange, and cream retro palette"
   ✅ "MUSEUM QUALITY - Archival-grade canvas with fade-resistant professional inks"
   ✅ "READY TO HANG - Stretched over 1.5\" solid pine stretcher bars, arrives ready for display"
   ✅ "MULTIPLE SIZES - Choose from 12x16, 16x20, or 24x36 inches to fit your space"
   ✅ "ARTIST COLLABORATION - Each print celebrates independent artists and modern design"

   THROW PILLOW/HOME DECOR:
   ✅ "EYE-CATCHING PATTERN - Abstract terrazzo design with pops of coral, navy, and mustard yellow"
   ✅ "ULTRA SOFT - Plush polyester cover with hidden zipper, machine washable for easy care"
   ✅ "PERFECT SIZE - 18x18 inch square fits standard pillow covers and furniture"
   ✅ "FADE-RESISTANT - Vibrant dye-sublimation print on both sides resists fading and washing"
   ✅ "VERSATILE STYLE - Modern boho aesthetic complements farmhouse, contemporary, or eclectic decor"

   ❌ NEVER WRITE:
   ❌ "HIGH QUALITY - Durable construction"
   ❌ "GREAT GIFT - Perfect for any occasion"
   ❌ "VERSATILE - Use anywhere"
   ❌ "STYLISH DESIGN - Looks great"` : ''}

${spec.fields.includes('materials') ? `5. Materials: PRODUCT-TYPE SPECIFIC materials based on what you detected
   - T-Shirt/Apparel: "100% cotton", "polyester blend", "soft fabric", "ribbed collar"
   - Mug/Drinkware: "ceramic", "enamel coating", "food-safe glaze", "heat-resistant material"
   - Canvas/Prints: "premium canvas", "archival ink", "solid wood frame", "acid-free paper"
   - Blanket/Textiles: "fleece fabric", "microfiber", "polyester fill", "soft plush"
   - Pillow: "polyester fill", "cotton cover", "hidden zipper", "soft fabric"
   - Be SPECIFIC to the product type: "100% ring-spun cotton" not just "fabric"
   - Include finishes relevant to product: "double-stitched hem" for apparel, "glossy finish" for mugs` : ''}

📊 PLATFORM-SPECIFIC REQUIREMENTS:
${spec.fields.map((f: string) => `✓ ${f.replace(/_/g, ' ').toUpperCase()}`).join('\n')}

⚠️ CRITICAL RULES:
- NO keyword stuffing or unnatural repetition
- NO misleading claims or exaggerations
- NO generic phrases like "high quality" without specifics
- YES to natural, compelling, buyer-focused language
- YES to specific measurements, materials, and details
- YES to emotional connection and problem-solving benefits

Return ONLY valid JSON in this exact format:
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
