import * as fal from '@fal-ai/serverless-client';

// Configure FAL.ai client with credentials
// This runs on every import to ensure env vars are loaded
const getFalCredentials = () => {
  const credentials = process.env.FAL_KEY;
  if (!credentials) {
    throw new Error('FAL_KEY environment variable is not set');
  }
  return credentials;
};

// Configure once at module load
try {
  fal.config({
    credentials: getFalCredentials(),
  });
} catch (error) {
  console.error('FAL.ai configuration error:', error);
}

export interface GenerateImageInput {
  prompt: string;
  inputImageUrl?: string; // For image-to-image generation
  imagePromptStrength?: number; // 0-1, how much to follow input image (default: 0.7)
  negativePrompt?: string;
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4' | '21:9' | '9:21';
  numImages?: number;
  seed?: number;
  safetyTolerance?: '1' | '2' | '3' | '4' | '5' | '6';
}

export interface GenerateImageOutput {
  images: Array<{
    url: string;
    width: number;
    height: number;
    content_type: string;
  }>;
  seed: number;
  has_nsfw_concepts: boolean[];
}

export interface GenerateVideoInput {
  imageUrl: string;
  prompt: string;
  duration?: number; // 5 or 10 seconds
}

export interface GenerateVideoOutput {
  video: {
    url: string;
  };
}

/**
 * Generate an image using FAL.ai FLUX models
 * - Text-to-image: Uses FLUX Pro for generation from scratch
 * - Image-to-image: Uses FLUX Pro Kontext for context-aware editing
 */
export async function generateImage(input: GenerateImageInput): Promise<GenerateImageOutput> {
  try {
    const requestInput: any = {
      prompt: input.prompt,
      num_images: input.numImages || 1,
      safety_tolerance: input.safetyTolerance || '2',
    };

    // Add optional parameters
    if (input.negativePrompt) {
      requestInput.negative_prompt = input.negativePrompt;
    }

    if (input.seed !== undefined) {
      requestInput.seed = input.seed;
    }

    // Determine which model to use
    let modelEndpoint: string;

    if (input.inputImageUrl) {
      // Image-to-image mode: Use FLUX Pro Kontext (requires image_url)
      modelEndpoint = 'fal-ai/flux-pro/kontext';
      requestInput.image_url = input.inputImageUrl;
      requestInput.aspect_ratio = input.aspectRatio || '1:1';

      // MAXIMUM adherence to preserve the product exactly as uploaded
      // Use the highest possible strength (0.95-0.99) to prevent ANY product modifications
      const strength = input.imagePromptStrength !== undefined ? input.imagePromptStrength : 0.99;
      requestInput.image_prompt_strength = Math.max(Math.min(strength, 0.99), 0.95);

      // Strengthen the prompt with explicit preservation instructions
      requestInput.prompt = `IMPORTANT: Keep the exact same product/subject from the uploaded image. Do not modify its design, colors, shape, size, or any visual characteristics. The product must remain 100% identical. ${input.prompt}. Only modify: background, lighting, camera angle, or presentation style.`.trim();
    } else {
      // Text-to-image mode: Use FLUX Pro (doesn't accept image_url)
      modelEndpoint = 'fal-ai/flux-pro';
      // FLUX Pro uses image_size instead of aspect_ratio
      const aspectRatio = input.aspectRatio || '1:1';
      const sizeMap: Record<string, { width: number; height: number }> = {
        '1:1': { width: 1024, height: 1024 },
        '16:9': { width: 1344, height: 768 },
        '9:16': { width: 768, height: 1344 },
        '4:3': { width: 1152, height: 896 },
        '3:4': { width: 896, height: 1152 },
        '21:9': { width: 1536, height: 640 },
        '9:21': { width: 640, height: 1536 },
      };
      const size = sizeMap[aspectRatio] || sizeMap['1:1'];
      requestInput.image_size = size;
    }

    console.log('FAL.ai model:', modelEndpoint);
    console.log('FAL.ai request params:', JSON.stringify(requestInput, null, 2));

    const result = await fal.subscribe(modelEndpoint, {
      input: requestInput,
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === 'IN_PROGRESS') {
          console.log('Image generation in progress...');
        }
      },
    });

    return result as GenerateImageOutput;
  } catch (error: any) {
    console.error('FAL.ai image generation error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    if (error.body) {
      console.error('Error body:', JSON.stringify(error.body, null, 2));
    }
    if (error.body?.detail) {
      console.error('Validation errors:', JSON.stringify(error.body.detail, null, 2));
    }
    throw new Error('Failed to generate image: ' + (error.message || JSON.stringify(error.body?.detail || error)));
  }
}

/**
 * Generate a video using FAL.ai Luma Photon
 */
export async function generateVideo(input: GenerateVideoInput): Promise<GenerateVideoOutput> {
  try {
    const result: any = await fal.subscribe('fal-ai/minimax/hailuo-02/standard/image-to-video', {
      input: {
        prompt: input.prompt,
        image_url: input.imageUrl,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === 'IN_PROGRESS') {
          console.log('Video generation in progress...', update);
        }
      },
    });

    console.log('Video generation complete! Full result:', JSON.stringify(result, null, 2));

    // Try different possible response structures
    const videoUrl = result.video?.url || result.url || result.data?.video_url || result.data?.url;

    if (!videoUrl) {
      console.error('Could not find video URL in result. Full result:', result);
      throw new Error('No video URL found in response');
    }

    return {
      video: {
        url: videoUrl,
      },
    };
  } catch (error) {
    console.error('FAL.ai video generation error:', error);
    throw new Error('Failed to generate video');
  }
}

/**
 * Upscale an image using FAL.ai
 */
export async function upscaleImage(imageUrl: string, scale: number = 2): Promise<string> {
  try {
    const result: any = await fal.subscribe('fal-ai/creative-upscaler', {
      input: {
        image_url: imageUrl,
        scale,
        creativity: 0.35,
      },
    });

    return result.image.url;
  } catch (error) {
    console.error('FAL.ai upscale error:', error);
    throw new Error('Failed to upscale image');
  }
}
