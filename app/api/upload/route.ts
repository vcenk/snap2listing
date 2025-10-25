import { NextRequest, NextResponse } from 'next/server';
import { uploadBase64Image } from '@/lib/api/storage';

export async function POST(request: NextRequest) {
  try {
    console.log('📥 [Upload API] Request received');

    const body = await request.json();
    console.log('📦 [Upload API] Body keys:', Object.keys(body));

    const { image, fileName } = body;

    if (!image) {
      console.error('❌ [Upload API] No image provided');
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    console.log('🔍 [Upload API] Image length:', image.length);
    console.log('📝 [Upload API] File name:', fileName);

    // Upload base64 image to R2
    console.log('📤 [Upload API] Uploading to R2...');
    const url = await uploadBase64Image(image, fileName || 'upload.jpg');

    console.log('✅ [Upload API] Upload successful:', url);
    return NextResponse.json({ url });
  } catch (error) {
    console.error('❌ [Upload API] Error uploading image:', error);
    if (error instanceof Error) {
      console.error('   Error name:', error.name);
      console.error('   Error message:', error.message);
      console.error('   Error stack:', error.stack);
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload image' },
      { status: 500 }
    );
  }
}
