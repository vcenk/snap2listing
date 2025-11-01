import { NextRequest, NextResponse } from 'next/server';
import { generateListings, type ProductInput } from '@/lib/services/productListingGenerator';
import { generateListingText, generateChannelListing } from '@/lib/api/openai';

/**
 * POST /api/generate-listings
 * Generate AI-powered listings for multiple channels
 * 
 * Body:
 * {
 *   image: string,
 *   description: string,
 *   selectedChannels: string[],
 *   attributes?: {
 *     brand?: string,
 *     color?: string,
 *     size?: string,
 *     material?: string,
 *     price?: number,
 *     category?: string
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, description, selectedChannels, attributes } = body;

    // Validate inputs
    if (!image || !description) {
      return NextResponse.json(
        { success: false, error: 'Image and description are required' },
        { status: 400 }
      );
    }

    if (!selectedChannels || selectedChannels.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one channel must be selected' },
        { status: 400 }
      );
    }

    // Prepare input for generation
    const input: ProductInput = {
      image,
      description,
      attributes: attributes || {},
    };

    // Generate basic listings for all channels
    const result = await generateListings(input, selectedChannels);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to generate listings' },
        { status: 500 }
      );
    }

    // Enhance with OpenAI for better quality (if using a channel that benefits from it)
    // For now, we'll use the basic generator and enhance specific channels
    const enhancedListings = await enhanceListingsWithAI(result.listings, input);

    return NextResponse.json({
      success: true,
      listings: enhancedListings,
      detected_product_type: result.detected_product_type,
      taxonomy_mappings: result.taxonomy_mappings,
    });
  } catch (error) {
    console.error('Generate listings error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * Enhance AI-generated listings with OpenAI for better quality
 * Now uses AI for ALL channels, not just Etsy
 */
async function enhanceListingsWithAI(listings: any[], input: ProductInput) {
  const enhanced = [];
  const errors: string[] = [];

  for (const listing of listings) {
    try {
      // Use AI generation for ALL channels
      const openAIResult = await generateChannelListing({
        productImageUrl: input.image,
        productName: input.attributes?.brand,
        category: input.attributes?.category || 'General',
        shortDescription: input.description,
        channel: listing.channel,
        attributes: {
          brand: input.attributes?.brand,
          material: input.attributes?.material,
          color: input.attributes?.color,
          size: input.attributes?.size,
        },
      });

      // Replace template-based generation with AI result
      listing.ai_generated = {
        ...listing.ai_generated,
        ...openAIResult,
      };

      // Update validation
      const titleMax = getTitleMaxForChannel(listing.channel);
      listing.validation_status = {
        valid: !openAIResult.title || openAIResult.title.length <= titleMax,
        warnings: openAIResult.title && openAIResult.title.length > titleMax * 0.85 
          ? [`Title is close to ${titleMax} char limit`] : [],
        errors: openAIResult.title && openAIResult.title.length > titleMax 
          ? [`Title exceeds ${titleMax} characters`] : [],
      };

      enhanced.push(listing);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error enhancing listing for ${listing.channel}:`, errorMsg);
      errors.push(`${listing.channel}: ${errorMsg}`);

      // Keep the basic template-generated version if AI enhancement fails
      enhanced.push(listing);
    }
  }

  if (errors.length > 0) {
    console.error(`AI generation failed for ${errors.length} channel(s):`, errors.join(', '));
  }

  return enhanced;
}

function getTitleMaxForChannel(channel: string): number {
  const limits: Record<string, number> = {
    amazon: 200,
    ebay: 80,
    etsy: 140,
    tiktok: 100,
    shopify: 255,
    facebook: 150,
  };
  return limits[channel] || 200;
}
