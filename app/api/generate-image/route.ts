import { NextRequest, NextResponse } from 'next/server';
import { generateImage, upscaleImage } from '@/lib/api/fal';
import { uploadFromUrl } from '@/lib/api/storage';
import { supabaseAdmin } from '@/lib/supabase/server';

/**
 * Generate SEO-friendly alt text from prompt and product name
 */
function generateAltText(prompt: string, productName?: string): string {
  // Remove common prompt artifacts
  let altText = prompt
    .replace(/\[PRODUCT\]/gi, productName || 'product')
    .replace(/,\s*(4k|high quality|professional|studio lighting|white background)/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Capitalize first letter
  altText = altText.charAt(0).toUpperCase() + altText.slice(1);

  // Limit to 125 characters for optimal SEO
  if (altText.length > 125) {
    altText = altText.substring(0, 122) + '...';
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

    // Check usage limits
    if (userId) {
      const { data: canGenerate } = await supabaseAdmin.rpc('can_generate_image', {
        p_user_id: userId,
      });

      if (!canGenerate) {
        return NextResponse.json(
          {
            error: 'Image limit reached',
            message: 'You have reached your monthly image limit. Please upgrade your plan or purchase add-ons.',
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

    // Increment usage counter immediately after successful generation
    if (userId) {
      await supabaseAdmin.rpc('increment_image_usage', {
        p_user_id: userId,
      });
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
