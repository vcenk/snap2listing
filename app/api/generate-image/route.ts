import { NextRequest, NextResponse } from 'next/server';
import { generateImage, upscaleImage } from '@/lib/api/fal';
import { uploadFromUrl } from '@/lib/api/storage';
import { supabaseAdmin } from '@/lib/supabase/server';
import { deductCredits, checkCreditsAvailable } from '@/lib/services/creditTracking';

/**
 * Generate SEO-friendly alt text from prompt and product name
 * Alt text should be descriptive, accessible, and free of technical prompt instructions
 */
function generateAltText(prompt: string, productName?: string): string {
  // Remove technical prompt instructions that shouldn't be in alt text
  let altText = prompt
    // Remove instructions about keeping the product the same
    .replace(/Keep the exact same product from the reference image with no modifications\.?\s*/gi, '')
    .replace(/Only change background,?\s*(lighting,?)?\s*(or)?\s*camera angle\.?\s*/gi, '')
    .replace(/same product,?\s*/gi, '')

    // Replace [PRODUCT] placeholder with actual product name
    .replace(/\[PRODUCT\]/gi, productName || 'product')

    // Remove technical image quality terms (keep them out of alt text)
    .replace(/,?\s*(4k|8k|high quality|high resolution|professional|hd|uhd)/gi, '')

    // Clean up photography/lighting terms to be more natural
    .replace(/studio lighting/gi, 'well-lit')
    .replace(/white background/gi, 'on white background')
    .replace(/clean background/gi, 'on clean background')
    .replace(/neutral background/gi, 'on neutral background')

    // Remove extra commas and spaces
    .replace(/,\s*,/g, ',')
    .replace(/\s+,/g, ',')
    .replace(/,\s+/g, ', ')
    .replace(/\s+/g, ' ')
    .trim()

    // Remove leading/trailing commas
    .replace(/^,\s*/, '')
    .replace(/,\s*$/, '');

  // If we have a product name but it's not in the alt text, prepend it
  if (productName && !altText.toLowerCase().includes(productName.toLowerCase())) {
    altText = `${productName}, ${altText}`;
  }

  // Capitalize first letter
  altText = altText.charAt(0).toUpperCase() + altText.slice(1);

  // Ensure proper sentence ending
  if (!altText.match(/[.!?]$/)) {
    altText = altText + '.';
  }

  // Limit to 125 characters for optimal SEO
  if (altText.length > 125) {
    altText = altText.substring(0, 122).trim() + '...';
  }

  return altText;
}

export async function POST(request: NextRequest) {
  try {
    const {
      prompt,
      negativePrompt,
      upscale,
      aspectRatio,
      inputImageUrl,
      imagePromptStrength,
      userId,
      productName,
    } = await request.json();

    // Only add guardrails for image-to-image (to prevent subject drift)
    const mergedNegative = inputImageUrl
      ? [
          negativePrompt,
          // Guardrails against changing the subject
          'different subject',
          'replaced subject',
          'missing subject',
          'identity change',
          'redraw',
          'reimagine',
          'wrong logo',
          'wrong design',
          'distorted subject',
        ]
          .filter(Boolean)
          .join(', ')
      : negativePrompt || '';

    // FIXED: Check credit availability before generating (3 credits per image)
    if (userId) {
      const creditCheck = await checkCreditsAvailable(userId, 'image_generation', 1);

      if (!creditCheck.available) {
        return NextResponse.json(
          {
            error: 'Insufficient credits',
            message: creditCheck.error || 'You do not have enough credits. Please upgrade your plan or purchase add-ons.',
            creditsNeeded: creditCheck.creditsNeeded,
            creditsRemaining: creditCheck.creditsRemaining,
            upgrade: true,
          },
          { status: 403 }
        );
      }
    }

    // Build request params conditionally
    const generateParams: any = {
      prompt,
      negativePrompt: mergedNegative,
      aspectRatio: aspectRatio || '1:1',
      numImages: 1,
    };

    // Only add image-to-image params if input image is provided
    if (inputImageUrl) {
      generateParams.inputImageUrl = inputImageUrl;
      // If image provided and no or low strength specified, enforce a high minimum
      generateParams.imagePromptStrength = Math.max(imagePromptStrength ?? 0.97, 0.95);
    }

    // Generate image with FAL.ai FLUX Pro Kontext
    const result = await generateImage(generateParams);

    if (!result.images || result.images.length === 0) {
      throw new Error('No image generated');
    }

    let imageUrl = result.images[0].url;

    // Upscale if requested
    if (upscale) {
      imageUrl = await upscaleImage(imageUrl, 2);
    }

    // Upload to R2 storage
    const storedUrl = await uploadFromUrl(
      imageUrl,
      `image-${Date.now()}.jpg`,
      result.images[0].content_type || 'image/jpeg'
    );

    // FIXED: Deduct credits after successful generation (3 credits per image)
    if (userId) {
      const deductionResult = await deductCredits(userId, 'image_generation', 1);

      if (!deductionResult.success) {
        console.error('Credit deduction failed (non-fatal):', deductionResult.error);
        // Non-fatal - image already generated, log the issue
      } else {
        console.log(`✅ Credits deducted: ${deductionResult.creditsDeducted}, Remaining: ${deductionResult.creditsRemaining}`);
      }
    }

    const id = `img_${Date.now()}`;

    // Generate SEO-friendly alt text
    const altText = generateAltText(prompt, productName);

    return NextResponse.json({
      id,
      url: storedUrl, // Return R2 URL instead of temporary FAL URL
      prompt,
      negativePrompt,
      upscaled: upscale,
      aspectRatio,
      altText,
      status: 'completed',
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate image' },
      { status: 500 }
    );
  }
}
