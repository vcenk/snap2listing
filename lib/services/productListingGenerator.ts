/**
 * AI Product Listing Generator
 * Generates platform-specific e-commerce listings from product images and descriptions
 */

export interface ProductInput {
  image: string; // URL or base64
  description: string; // Short description (2-3 sentences)
  attributes?: {
    brand?: string;
    color?: string;
    size?: string;
    material?: string;
    price?: number;
    category?: string;
    [key: string]: any;
  };
}

export interface ChannelListing {
  channel: string;
  ai_generated: Record<string, any>;
  requires_user_input: string[];
  compatibility_rules: {
    title_max?: number;
    description_max?: number;
    image_requirements?: string;
    tags_max?: number;
    [key: string]: any;
  };
  validation_status: {
    valid: boolean;
    warnings: string[];
    errors: string[];
  };
}

export interface GenerationResult {
  success: boolean;
  listings: ChannelListing[];
  detected_product_type?: string;
  taxonomy_mappings?: Record<string, string>;
  error?: string;
}

// Channel-specific field configurations (Based on platform requirements)
const CHANNEL_CONFIGS = {
  amazon: {
    ai_fields: ['title', 'bullet_points', 'description', 'keywords', 'features'],
    manual_fields: ['brand', 'gtin', 'price', 'sku', 'dimensions', 'weight', 'shipping', 'fulfillment_type'],
    rules: {
      title_max: 200,
      title_recommended: 80,
      description_max: 2000,
      bullet_points_max: 5,
      bullet_point_min: 10,
      bullet_point_max: 255,
      image_min_size: 1000,
      image_format: ['JPG', 'PNG'],
      image_background: 'white',
    },
    compatibility: 'Title ≤ 200 chars • Image ≥ 1000 px (white background)',
  },
  ebay: {
    ai_fields: ['title', 'description', 'tags', 'bullets'],
    manual_fields: ['price', 'quantity', 'category', 'condition', 'shipping', 'payment_methods', 'return_policy'],
    rules: {
      title_max: 80,
      description_max: 500000,
      images_max: 12,
      image_min_size: 500,
    },
    compatibility: 'Title ≤ 80 chars • Up to 12 images ≥ 500 px',
  },
  etsy: {
    ai_fields: ['title', 'description', 'tags', 'materials', 'sections'],
    manual_fields: ['price', 'quantity', 'who_made', 'what_is_it', 'when_made', 'shipping_profile', 'variations'],
    rules: {
      title_max: 140,
      description_max: 5000,
      tags_max: 13,
      tag_max_length: 20,
      images_max: 10,
      image_min_size: 2000,
      materials_required: true,
      video_max_duration: 15,
    },
    compatibility: 'Title ≤ 140 chars • Up to 10 images ≥ 2000 px • 13 tags ≤ 20 chars each',
  },
  tiktok: {
    ai_fields: ['title', 'short_description', 'video_caption', 'hashtags'],
    manual_fields: ['price', 'stock', 'category', 'license', 'variants'],
    rules: {
      title_max: 100,
      description_max: 500,
      caption_max: 2200,
      image_min_width: 600,
      image_min_height: 600,
      video_max_size_mb: 5,
    },
    compatibility: 'Title ≤ 100 chars • Image ≥ 600 × 600 px • Video ≤ 5 MB',
  },
  shopify: {
    ai_fields: ['title', 'description', 'seo_meta_title', 'seo_meta_description', 'tags', 'collections'],
    manual_fields: ['price', 'sku', 'inventory', 'weight', 'shipping', 'vendor', 'product_type', 'variants'],
    rules: {
      title_max: 255,
      description_format: 'html',
      seo_title_max: 70,
      seo_description_max: 160,
      images_max: 250,
      image_min_size: 1000,
      variants_max: 100,
      variant_options_max: 3,
    },
    compatibility: 'Title ≤ 255 chars • Image ≥ 1000 px • ≤ 100 variants (3 options max)',
  },
  facebook: {
    ai_fields: ['title', 'description', 'ad_caption', 'tags'],
    manual_fields: ['price', 'availability', 'product_url', 'gtin', 'brand', 'shipping'],
    rules: {
      title_max: 150,
      description_max: 5000,
      caption_max: 125,
      image_min_width: 500,
      image_min_height: 500,
      image_max_size_mb: 8,
      price_format: 'XX.XX USD',
    },
    compatibility: 'Title ≤ 150 chars • Image ≥ 500 × 500 px (≤ 8 MB) • Price format "19.99 USD"',
  },
};

/**
 * Generate AI-powered listings for all selected channels
 */
export async function generateListings(
  input: ProductInput,
  selectedChannels: string[]
): Promise<GenerationResult> {
  try {
    // Step 1: Detect product type from image + description
    const productType = await detectProductType(input);

    // Step 2: Generate content for each channel
    const listings: ChannelListing[] = [];

    for (const channel of selectedChannels) {
      const channelConfig = CHANNEL_CONFIGS[channel as keyof typeof CHANNEL_CONFIGS];
      if (!channelConfig) continue;

      const listing = await generateChannelListing(input, channel, channelConfig, productType);
      listings.push(listing);
    }

    // Step 3: Map taxonomy for each platform
    const taxonomyMappings = await mapTaxonomies(productType, selectedChannels);

    return {
      success: true,
      listings,
      detected_product_type: productType,
      taxonomy_mappings: taxonomyMappings,
    };
  } catch (error) {
    console.error('Listing generation error:', error);
    return {
      success: false,
      listings: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Detect product type from image and description using AI
 */
async function detectProductType(input: ProductInput): Promise<string> {
  // TODO: Integrate with OpenAI Vision API or similar
  // For now, use basic keyword detection from description
  const desc = input.description.toLowerCase();
  
  if (desc.includes('shirt') || desc.includes('tee') || desc.includes('clothing')) {
    return 'Apparel';
  } else if (desc.includes('jewelry') || desc.includes('necklace') || desc.includes('ring')) {
    return 'Jewelry';
  } else if (desc.includes('mug') || desc.includes('cup') || desc.includes('drinkware')) {
    return 'Home & Kitchen';
  } else if (desc.includes('book') || desc.includes('journal') || desc.includes('notebook')) {
    return 'Books & Stationery';
  } else if (desc.includes('toy') || desc.includes('game') || desc.includes('puzzle')) {
    return 'Toys & Games';
  } else if (desc.includes('art') || desc.includes('print') || desc.includes('poster')) {
    return 'Art & Collectibles';
  }
  
  return 'General Merchandise';
}

/**
 * Generate listing content for a specific channel
 */
async function generateChannelListing(
  input: ProductInput,
  channel: string,
  config: any,
  productType: string
): Promise<ChannelListing> {
  const aiGenerated: Record<string, any> = {};

  // Generate content based on channel requirements
  switch (channel) {
    case 'amazon':
      aiGenerated.title = await generateAmazonTitle(input, config.rules.title_recommended);
      aiGenerated.bullet_points = await generateAmazonBullets(input, config.rules.bullet_points_max);
      aiGenerated.description = await generateAmazonDescription(input, config.rules.description_max);
      aiGenerated.keywords = await generateKeywords(input, 50);
      aiGenerated.tags = await generateAmazonTags(input);
      aiGenerated.features = await generateAmazonBullets(input, config.rules.bullet_points_max);
      break;

    case 'ebay':
      aiGenerated.title = await generateEbayTitle(input, config.rules.title_max);
      aiGenerated.description = await generateEbayDescription(input, config.rules.description_max);
      aiGenerated.tags = await generateEbayTags(input);
      aiGenerated.bullets = await generateEbayBullets(input, 5);
      aiGenerated.category_guess = productType;
      break;

    case 'etsy':
      aiGenerated.title = await generateEtsyTitle(input, config.rules.title_max);
      aiGenerated.description = await generateEtsyDescription(input, config.rules.description_max);
      aiGenerated.tags = await generateEtsyTags(input, config.rules.tags_max, config.rules.tag_max_length);
      aiGenerated.materials = extractMaterials(input);
      aiGenerated.sections = await suggestEtsySections(productType);
      aiGenerated.bullets = await generateEtsyBullets(input, 5);
      break;

    case 'tiktok':
      aiGenerated.title = await generateTikTokTitle(input, config.rules.title_max);
      aiGenerated.short_description = await generateTikTokDescription(input, config.rules.description_max);
      aiGenerated.video_caption = await generateTikTokCaption(input, config.rules.caption_max);
      aiGenerated.hashtags = await generateHashtags(input, 10);
      aiGenerated.tags = await generateTikTokTags(input);
      break;

    case 'shopify':
      aiGenerated.title = await generateShopifyTitle(input, config.rules.title_max);
      aiGenerated.description = await generateShopifyDescription(input);
      aiGenerated.seo_meta_title = await generateSEOTitle(input, config.rules.seo_title_max);
      aiGenerated.seo_meta_description = await generateSEODescription(input, config.rules.seo_description_max);
      aiGenerated.tags = await generateShopifyTags(input);
      aiGenerated.collections = await suggestCollections(productType);
      break;

    case 'facebook':
      aiGenerated.title = await generateFacebookTitle(input, config.rules.title_max);
      aiGenerated.description = await generateFacebookDescription(input, config.rules.description_max);
      aiGenerated.ad_caption = await generateFacebookCaption(input, config.rules.caption_max);
      aiGenerated.category_guess = productType;
      aiGenerated.tags = await generateFacebookTags(input);
      break;
  }

  // Validate generated content
  const validation = validateListing(aiGenerated, config.rules);

  return {
    channel,
    ai_generated: aiGenerated,
    requires_user_input: config.manual_fields,
    compatibility_rules: config.rules,
    validation_status: validation,
  };
}

/**
 * Validate listing content against channel rules
 */
function validateListing(content: Record<string, any>, rules: Record<string, any>) {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Check title length
  if (content.title && rules.title_max) {
    if (content.title.length > rules.title_max) {
      errors.push(`Title exceeds ${rules.title_max} characters`);
    }
    if (rules.title_recommended && content.title.length > rules.title_recommended) {
      warnings.push(`Title exceeds recommended ${rules.title_recommended} characters`);
    }
  }

  // Check description length
  if (content.description && rules.description_max) {
    if (content.description.length > rules.description_max) {
      errors.push(`Description exceeds ${rules.description_max} characters`);
    }
  }

  // Check tags
  if (content.tags && rules.tags_max) {
    if (content.tags.length > rules.tags_max) {
      errors.push(`Too many tags: ${content.tags.length} (max: ${rules.tags_max})`);
    }
    if (rules.tag_max_length) {
      content.tags.forEach((tag: string, i: number) => {
        if (tag.length > rules.tag_max_length) {
          errors.push(`Tag ${i + 1} exceeds ${rules.tag_max_length} characters`);
        }
      });
    }
  }

  return {
    valid: errors.length === 0,
    warnings,
    errors,
  };
}

/**
 * Map product type to platform-specific taxonomies
 */
async function mapTaxonomies(productType: string, channels: string[]): Promise<Record<string, string>> {
  const mappings: Record<string, string> = {};

  // Example taxonomy mappings (would be expanded based on actual platform taxonomies)
  const taxonomyMap: Record<string, Record<string, string>> = {
    'Apparel': {
      amazon: 'Clothing, Shoes & Jewelry > Clothing',
      etsy: 'Clothing & Accessories',
      tiktok: 'Fashion & Accessories > Clothing',
      shopify: 'Apparel',
      facebook: 'Apparel & Accessories > Clothing',
    },
    'Jewelry': {
      amazon: 'Clothing, Shoes & Jewelry > Jewelry',
      etsy: 'Jewelry',
      tiktok: 'Fashion & Accessories > Jewelry',
      shopify: 'Jewelry',
      facebook: 'Apparel & Accessories > Jewelry',
    },
    // Add more mappings...
  };

  channels.forEach((channel) => {
    mappings[channel] = taxonomyMap[productType]?.[channel] || 'General';
  });

  return mappings;
}

// ======================
// AI Content Generators
// ======================

async function generateAmazonTitle(input: ProductInput, maxLength: number): Promise<string> {
  // Amazon SEO: Brand + Primary Keywords + Key Features + Attributes
  // Format: [Brand] + Product Type + Key Benefits + Color/Size/Material
  const parts = [];
  
  // Add brand if available
  if (input.attributes?.brand) {
    parts.push(input.attributes.brand);
  }
  
  // Extract main product keywords from description
  const desc = input.description;
  const mainKeywords = extractKeyProductTerms(desc);
  parts.push(...mainKeywords.slice(0, 3));
  
  // Add attributes for better searchability
  if (input.attributes?.material) parts.push(input.attributes.material);
  if (input.attributes?.color) parts.push(input.attributes.color);
  if (input.attributes?.size) parts.push(`${input.attributes.size}`);
  
  // Add key benefit/feature
  const benefits = ['Premium Quality', 'Durable', 'High-Quality', 'Professional'];
  if (parts.length < 6) {
    parts.push(benefits[0]);
  }
  
  let title = parts.filter(p => p).join(' ');
  
  // Ensure it's within Amazon's recommended length
  if (title.length > maxLength) {
    title = title.substring(0, maxLength - 3) + '...';
  }
  
  return title;
}

// Helper: Extract key product terms from description
function extractKeyProductTerms(description: string): string[] {
  const terms: string[] = [];
  const words = description.split(/\s+/);
  
  // Extract nouns and meaningful terms (capitalize first letter)
  for (let i = 0; i < words.length && terms.length < 5; i++) {
    const word = words[i].replace(/[^a-zA-Z]/g, '');
    if (word.length >= 4 && 
        !['this', 'that', 'with', 'from', 'have', 'been', 'were', 'their', 'about'].includes(word.toLowerCase())) {
      terms.push(word.charAt(0).toUpperCase() + word.slice(1));
    }
  }
  
  return terms;
}

async function generateAmazonBullets(input: ProductInput, count: number): Promise<string[]> {
  // Amazon SEO bullets: Benefits-first, keyword-rich, scannable
  const bullets = [];
  const sentences = input.description.split(/[.!?]/).filter(s => s.trim());
  
  // Bullet 1: Primary benefit/unique selling point
  if (sentences[0]) {
    bullets.push(`✓ PREMIUM QUALITY: ${sentences[0].trim()}`);
  }
  
  // Bullet 2: Key feature/material
  if (input.attributes?.material) {
    bullets.push(`✓ DURABLE CONSTRUCTION: Made from high-quality ${input.attributes.material} for long-lasting use`);
  } else if (sentences[1]) {
    bullets.push(`✓ KEY FEATURES: ${sentences[1].trim()}`);
  }
  
  // Bullet 3: Use case/versatility
  bullets.push(`✓ VERSATILE USE: Perfect for daily use, gifts, or special occasions`);
  
  // Bullet 4: Quality assurance
  bullets.push(`✓ QUALITY GUARANTEE: Carefully crafted to meet the highest standards`);
  
  // Bullet 5: Customer satisfaction
  if (bullets.length < count) {
    bullets.push(`✓ SATISFACTION GUARANTEED: We stand behind our products with excellent customer service`);
  }
  
  return bullets.slice(0, count);
}

async function generateAmazonDescription(input: ProductInput, maxLength: number): Promise<string> {
  return input.description.substring(0, maxLength);
}

async function generateAmazonTags(input: ProductInput): Promise<string[]> {
  const tags: string[] = [];
  
  // Add category
  if (input.attributes?.category) tags.push(input.attributes.category.toLowerCase());
  
  // Add material
  if (input.attributes?.material) tags.push(input.attributes.material.toLowerCase());
  
  // Add color
  if (input.attributes?.color) tags.push(input.attributes.color.toLowerCase());
  
  // Extract meaningful keywords
  const keywords = extractKeyProductTerms(input.description);
  tags.push(...keywords.slice(0, 5).map(k => k.toLowerCase()));
  
  return [...new Set(tags)].slice(0, 10);
}

async function generateEtsyTitle(input: ProductInput, maxLength: number): Promise<string> {
  // Etsy SEO: Descriptive, keyword-rich, includes style/material/use
  // Format: [Adjective] [Material] [Product] - [Style/Use] - [Feature]
  const parts = [];
  
  // Extract descriptive adjectives
  const adjectives = ['Handmade', 'Unique', 'Custom', 'Vintage', 'Artisan', 'Beautiful', 'Charming'];
  const desc = input.description.toLowerCase();
  const foundAdj = adjectives.find(adj => desc.includes(adj.toLowerCase()));
  if (foundAdj) parts.push(foundAdj);
  
  // Add material
  if (input.attributes?.material) {
    parts.push(input.attributes.material);
  }
  
  // Extract main product type
  const mainTerms = extractKeyProductTerms(input.description);
  if (mainTerms.length > 0) {
    parts.push(mainTerms[0]);
  }
  
  // Add style descriptor
  const styles = ['Modern', 'Rustic', 'Bohemian', 'Minimalist', 'Vintage', 'Classic', 'Contemporary'];
  const foundStyle = styles.find(style => desc.includes(style.toLowerCase()));
  if (foundStyle && parts.length < 5) {
    parts.push(`${foundStyle} Design`);
  }
  
  // Add use case if space allows
  if (parts.length < 4) {
    if (desc.includes('gift')) parts.push('Perfect Gift');
    else if (desc.includes('decor') || desc.includes('decoration')) parts.push('Home Decor');
  }
  
  let title = parts.join(' - ');
  
  // Ensure within Etsy's limit
  if (title.length > maxLength) {
    title = parts.slice(0, 3).join(' - ');
    if (title.length > maxLength) {
      title = title.substring(0, maxLength);
    }
  }
  
  return title || input.description.substring(0, maxLength);
}

async function generateEtsyDescription(input: ProductInput, maxLength: number): Promise<string> {
  // Etsy loves storytelling
  let desc = `${input.description}\n\n`;
  desc += `This unique item is perfect for anyone looking for quality and style.\n\n`;
  desc += `FEATURES:\n`;
  desc += `• Handcrafted with care\n`;
  desc += `• High-quality materials\n`;
  desc += `• Perfect for gifting\n`;
  
  return desc.substring(0, maxLength);
}

async function generateEtsyTags(input: ProductInput, maxTags: number, maxLength: number): Promise<string[]> {
  const tags: string[] = [];
  const desc = input.description.toLowerCase();
  
  // Extract product type and attributes from description
  const productTypes = ['wooden', 'handmade', 'vintage', 'custom', 'personalized', 'unique', 'artisan'];
  const materials = ['wood', 'metal', 'ceramic', 'glass', 'fabric', 'leather', 'cotton', 'wool'];
  const occasions = ['gift', 'birthday', 'wedding', 'christmas', 'anniversary', 'valentine'];
  const styles = ['modern', 'rustic', 'bohemian', 'minimalist', 'vintage', 'farmhouse', 'industrial'];
  
  // Add product category from attributes
  if (input.attributes?.category) {
    const category = input.attributes.category.toLowerCase().replace(/[^a-z0-9\s]/g, '');
    if (category.length <= maxLength) {
      tags.push(category);
    }
  }
  
  // Add material if specified
  if (input.attributes?.material) {
    const material = input.attributes.material.toLowerCase().replace(/[^a-z0-9\s]/g, '');
    if (material.length <= maxLength && !tags.includes(material)) {
      tags.push(material);
    }
  }
  
  // Extract nouns and meaningful phrases (2-3 words)
  const words = desc.replace(/[^a-z0-9\s]/g, '').split(/\s+/);
  
  // Look for meaningful product descriptors
  for (let i = 0; i < words.length && tags.length < maxTags; i++) {
    // Check for product type keywords
    if (productTypes.includes(words[i]) && words[i].length <= maxLength) {
      if (!tags.includes(words[i])) tags.push(words[i]);
    }
    
    // Check for material keywords
    if (materials.some(m => words[i].includes(m)) && words[i].length <= maxLength) {
      if (!tags.includes(words[i])) tags.push(words[i]);
    }
    
    // Check for style keywords
    if (styles.includes(words[i]) && words[i].length <= maxLength) {
      if (!tags.includes(words[i])) tags.push(words[i]);
    }
    
    // Check for occasion keywords
    if (occasions.some(o => words[i].includes(o)) && words[i].length <= maxLength) {
      if (!tags.includes(words[i])) tags.push(words[i]);
    }
    
    // Create 2-word phrases for better SEO
    if (i < words.length - 1 && tags.length < maxTags) {
      const twoWordPhrase = `${words[i]} ${words[i + 1]}`;
      if (twoWordPhrase.length <= maxLength && 
          twoWordPhrase.length >= 5 && 
          !tags.includes(twoWordPhrase) &&
          !['the', 'and', 'for', 'with', 'from', 'this', 'that'].includes(words[i])) {
        // Only add if it contains meaningful keywords
        if (productTypes.includes(words[i]) || productTypes.includes(words[i + 1]) ||
            materials.some(m => twoWordPhrase.includes(m)) ||
            styles.includes(words[i]) || styles.includes(words[i + 1])) {
          tags.push(twoWordPhrase);
        }
      }
    }
    
    // Add standalone meaningful nouns (longer words are usually more meaningful)
    if (words[i].length >= 5 && words[i].length <= maxLength && tags.length < maxTags) {
      if (!tags.includes(words[i]) && 
          !['introducing', 'featuring', 'perfect', 'ideal', 'amazing'].includes(words[i])) {
        tags.push(words[i]);
      }
    }
  }
  
  // Add color if specified
  if (input.attributes?.color && tags.length < maxTags) {
    const color = input.attributes.color.toLowerCase();
    if (color.length <= maxLength && !tags.includes(color)) {
      tags.push(color);
    }
  }
  
  return tags.slice(0, maxTags);
}

async function generateTikTokTitle(input: ProductInput, maxLength: number): Promise<string> {
  // TikTok SEO: Catchy, trend-friendly, emoji-ready
  // Format: 🔥 [Trending Adjective] [Product] - [Key Benefit]
  const trendyWords = ['Amazing', 'Must-Have', 'Trending', 'Viral', 'Popular', 'Hot'];
  const desc = input.description;
  
  const mainTerms = extractKeyProductTerms(desc);
  const title = `${trendyWords[0]} ${mainTerms.slice(0, 2).join(' ')} - Perfect Gift`;
  
  return title.substring(0, maxLength);
}

async function generateTikTokDescription(input: ProductInput, maxLength: number): Promise<string> {
  return input.description.substring(0, maxLength);
}

async function generateTikTokHighlights(input: ProductInput): Promise<string[]> {
  return input.description.split('.').filter(s => s.trim()).slice(0, 3);
}

async function generateTikTokCaption(input: ProductInput, maxLength: number): Promise<string> {
  return `Check out this amazing product! ${input.description.substring(0, maxLength - 50)} #trending #musthave`;
}

async function generateTikTokTags(input: ProductInput): Promise<string[]> {
  const tags: string[] = [];
  
  // Add category
  if (input.attributes?.category) tags.push(input.attributes.category.toLowerCase());
  
  // Add trending keywords
  const trendingTags = ['trending', 'viral', 'musthave', 'fyp', 'foryou'];
  tags.push(...trendingTags);
  
  // Extract product keywords
  const keywords = extractKeyProductTerms(input.description);
  tags.push(...keywords.slice(0, 3).map(k => k.toLowerCase()));
  
  return [...new Set(tags)].slice(0, 10);
}

async function generateShopifyTitle(input: ProductInput, maxLength: number): Promise<string> {
  // Shopify SEO: Clear, concise, includes brand and key features
  const parts = [];
  
  if (input.attributes?.brand) {
    parts.push(input.attributes.brand);
  }
  
  // Main product keywords
  const mainTerms = extractKeyProductTerms(input.description);
  parts.push(...mainTerms.slice(0, 3));
  
  // Add variant info if available
  if (input.attributes?.color) parts.push(`(${input.attributes.color})`);
  
  return parts.join(' ').substring(0, maxLength);
}

async function generateShopifyDescription(input: ProductInput): Promise<string> {
  // HTML-formatted description for Shopify
  return `<p>${input.description.split('.').join('.</p><p>')}</p>`;
}

async function generateSEOTitle(input: ProductInput, maxLength: number): Promise<string> {
  return input.description.split('.')[0].substring(0, maxLength);
}

async function generateSEODescription(input: ProductInput, maxLength: number): Promise<string> {
  return input.description.substring(0, maxLength);
}

async function generateShopifyTags(input: ProductInput): Promise<string[]> {
  const tags: string[] = [];
  
  // Add category
  if (input.attributes?.category) tags.push(input.attributes.category);
  
  // Add material
  if (input.attributes?.material) tags.push(input.attributes.material);
  
  // Add color
  if (input.attributes?.color) tags.push(input.attributes.color);
  
  // Extract meaningful keywords
  const keywords = extractKeyProductTerms(input.description);
  tags.push(...keywords.slice(0, 5).map(k => k.toLowerCase()));
  
  // Add common Shopify tags
  tags.push('new-arrival', 'featured', 'bestseller');
  
  return [...new Set(tags)].slice(0, 10);
}

async function generateFacebookTitle(input: ProductInput, maxLength: number): Promise<string> {
  return input.description.split('.')[0].substring(0, maxLength);
}

async function generateFacebookDescription(input: ProductInput, maxLength: number): Promise<string> {
  return input.description.substring(0, maxLength);
}

async function generateFacebookCaption(input: ProductInput, maxLength: number): Promise<string> {
  return input.description.split('.')[0].substring(0, maxLength);
}

async function generateFacebookTags(input: ProductInput): Promise<string[]> {
  return input.description.toLowerCase().split(/\s+/).filter(w => w.length > 3).slice(0, 5);
}

async function generateKeywords(input: ProductInput, count: number): Promise<string[]> {
  const keywords: string[] = [];

  // Add product attributes
  if (input.attributes?.brand) keywords.push(input.attributes.brand.toLowerCase());
  if (input.attributes?.material) keywords.push(input.attributes.material.toLowerCase());
  if (input.attributes?.color) keywords.push(input.attributes.color.toLowerCase());
  if (input.attributes?.category) keywords.push(input.attributes.category.toLowerCase());

  // Extract meaningful terms from description
  const terms = extractKeyProductTerms(input.description);
  keywords.push(...terms.map(t => t.toLowerCase()));

  // Add related search terms
  const desc = input.description.toLowerCase();
  const relatedTerms = ['quality', 'premium', 'durable', 'handmade', 'unique', 'gift', 'bestseller'];
  relatedTerms.forEach(term => {
    if (desc.includes(term)) keywords.push(term);
  });

  return [...new Set(keywords)].slice(0, count);
}

async function generateHashtags(input: ProductInput, count: number): Promise<string[]> {
  const words = input.description.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  return words.slice(0, count).map(w => `#${w}`);
}

async function generateAltText(input: ProductInput, maxLength?: number): Promise<string> {
  const alt = `Product image showing ${input.description.split('.')[0]}`;
  return maxLength ? alt.substring(0, maxLength) : alt;
}

async function generateVideoScript(input: ProductInput): Promise<string> {
  return `Hook: Check this out!\nIntro: ${input.description}\nCall to action: Get yours today!`;
}

function extractAttributes(input: ProductInput): Record<string, any> {
  return input.attributes || {};
}

function extractMaterials(input: ProductInput): string[] {
  const materials = [];
  if (input.attributes?.material) materials.push(input.attributes.material);
  return materials;
}

async function suggestEtsySections(productType: string): Promise<string[]> {
  return [productType, 'Featured', 'Best Sellers'];
}

async function suggestCollections(productType: string): Promise<string[]> {
  return [productType, 'New Arrivals', 'Popular'];
}

// eBay Generators
async function generateEbayTitle(input: ProductInput, maxLength: number): Promise<string> {
  // eBay SEO: Concise, keyword-rich, front-loaded with important terms
  const parts = [];
  
  if (input.attributes?.brand) {
    parts.push(input.attributes.brand);
  }
  
  const mainTerms = extractKeyProductTerms(input.description);
  parts.push(...mainTerms.slice(0, 3));
  
  if (input.attributes?.color) parts.push(input.attributes.color);
  if (input.attributes?.size) parts.push(input.attributes.size);
  
  return parts.join(' ').substring(0, maxLength);
}

async function generateEbayDescription(input: ProductInput, maxLength: number): Promise<string> {
  let desc = `<h2>Product Description</h2>\n<p>${input.description}</p>\n\n`;
  desc += `<h3>Features:</h3>\n<ul>\n`;
  desc += `<li>High-quality construction</li>\n`;
  desc += `<li>Perfect for daily use</li>\n`;
  desc += `<li>Great value for money</li>\n`;
  desc += `</ul>`;
  return desc.substring(0, maxLength);
}

async function generateEbayTags(input: ProductInput): Promise<string[]> {
  const tags: string[] = [];
  
  if (input.attributes?.category) tags.push(input.attributes.category.toLowerCase());
  if (input.attributes?.brand) tags.push(input.attributes.brand.toLowerCase());
  if (input.attributes?.material) tags.push(input.attributes.material.toLowerCase());
  if (input.attributes?.color) tags.push(input.attributes.color.toLowerCase());
  
  const keywords = extractKeyProductTerms(input.description);
  tags.push(...keywords.slice(0, 5).map(k => k.toLowerCase()));
  
  return [...new Set(tags)].slice(0, 10);
}

async function generateEbayBullets(input: ProductInput, count: number): Promise<string[]> {
  const bullets = [];
  const sentences = input.description.split(/[.!?]/).filter(s => s.trim());
  
  if (sentences[0]) bullets.push(sentences[0].trim());
  if (input.attributes?.material) {
    bullets.push(`Made from ${input.attributes.material}`);
  }
  bullets.push('High-quality construction');
  bullets.push('Perfect for gifting');
  bullets.push('Fast shipping available');
  
  return bullets.slice(0, count);
}

async function generateEtsyBullets(input: ProductInput, count: number): Promise<string[]> {
  const bullets = [];
  const sentences = input.description.split(/[.!?]/).filter(s => s.trim());
  
  if (sentences[0]) bullets.push(`✨ ${sentences[0].trim()}`);
  if (input.attributes?.material) {
    bullets.push(`🎨 Crafted from premium ${input.attributes.material}`);
  }
  bullets.push('💝 Perfect gift for any occasion');
  bullets.push('🌟 Handmade with love and care');
  bullets.push('📦 Carefully packaged for safe delivery');
  
  return bullets.slice(0, count);
}
