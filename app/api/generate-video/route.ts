import { NextRequest, NextResponse } from 'next/server';
import { generateVideo } from '@/lib/api/fal';
import { uploadFromUrl } from '@/lib/api/storage';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { baseImageUrl, prompt, userId } = await request.json();

    // Check usage limits
    if (userId) {
      const { data: canGenerate } = await supabaseAdmin.rpc('can_generate_video', {
        p_user_id: userId,
      });

      if (!canGenerate) {
        return NextResponse.json(
          {
            error: 'Video limit reached',
            message: 'You have reached your monthly video limit. Please upgrade your plan or purchase add-ons.',
            upgrade: true,
          },
          { status: 403 }
        );
      }
    }

    // Generate video with FAL.ai (this will take 30-60 seconds)
    const result = await generateVideo({
      imageUrl: baseImageUrl,
      prompt,
      duration: 5,
    });

    if (!result.video || !result.video.url) {
      throw new Error('No video generated');
    }

    // Upload to R2 storage
    const storedUrl = await uploadFromUrl(
      result.video.url,
      `video-${Date.now()}.mp4`,
      'video/mp4'
    );

    // Increment usage counter immediately after successful generation
    if (userId) {
      await supabaseAdmin.rpc('increment_video_usage', {
        p_user_id: userId,
      });
    }

    const requestId = `vid_${Date.now()}`;

    return NextResponse.json({
      id: requestId,
      requestId,
      status: 'completed',
      url: storedUrl, // Return R2 URL
      progress: 100,
    });
  } catch (error) {
    console.error('Error generating video:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate video' },
      { status: 500 }
    );
  }
}
