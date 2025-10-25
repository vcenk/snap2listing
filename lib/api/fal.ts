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
 * Generate an image using FAL.ai FLUX Pro Kontext model
 * Supports both text-to-image and image-to-image generation
 */
export async function generateImage(input: GenerateImageInput): Promise<GenerateImageOutput> {
  try {
    const requestInput: any = {
      prompt: input.prompt,
      num_images: input.numImages || 1,
      aspect_ratio: input.aspectRatio || '1:1',
      safety_tolerance: input.safetyTolerance || '2',
    };

    // Add optional parameters
    if (input.negativePrompt) {
      requestInput.negative_prompt = input.negativePrompt;
    }

    if (input.seed !== undefined) {
      requestInput.seed = input.seed;
    }

    // Image-to-image mode: add input image and strength
    if (input.inputImageUrl) {
      requestInput.image_url = input.inputImageUrl;
      // Enforce high adherence to the uploaded image to avoid subject drift
      const strength = input.imagePromptStrength !== undefined ? input.imagePromptStrength : 0.97;
      requestInput.image_prompt_strength = Math.max(Math.min(strength, 1), 0.9);
      // Strengthen the prompt to explicitly require using the uploaded image as-is
      requestInput.prompt = `Use the uploaded image exactly as the subject. Do not replace, redraw, or alter the subject identity, pose, or design. Only adjust background/lighting/style as described. ${input.prompt}`.trim();
    }

    const result = await fal.subscribe('fal-ai/flux-pro/kontext', {
      input: requestInput,
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === 'IN_PROGRESS') {
          console.log('Image generation in progress...');
        }
      },
    });

    return result as GenerateImageOutput;
  } catch (error) {
    console.error('FAL.ai image generation error:', error);
    throw new Error('Failed to generate image');
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
