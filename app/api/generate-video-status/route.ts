import { NextRequest, NextResponse } from 'next/server';

// Mark this route as dynamic
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get('requestId');

    if (!requestId) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      );
    }

    // TODO: Check actual status from FAL.ai
    // const status = await fal.status("fal-ai/pixverse", { requestId });

    // MOCK for now - simulate completion after first poll
    await new Promise((resolve) => setTimeout(resolve, 5000));

    return NextResponse.json({
      id: requestId,
      status: 'completed',
      url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
      progress: 100,
    });
  } catch (error) {
    console.error('Error checking video status:', error);
    return NextResponse.json(
      { error: 'Failed to check video status' },
      { status: 500 }
    );
  }
}
