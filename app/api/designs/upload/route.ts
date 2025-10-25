import { NextRequest, NextResponse } from 'next/server';
import { uploadBase64Image } from '@/lib/api/storage';
import { Design } from '@/lib/types/design';
import { designStore } from '@/lib/storage/memoryStore';

export async function POST(request: NextRequest) {
  try {
    console.log('📥 [Design Upload API] Request received');

    const body = await request.json();
    const { image, name, category = 'Custom', tags = [] } = body;

    if (!image) {
      console.error('❌ [Design Upload API] No image provided');
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    if (!name) {
      console.error('❌ [Design Upload API] No name provided');
      return NextResponse.json({ error: 'Design name is required' }, { status: 400 });
    }

    // Get user ID from auth (for now, use 'guest')
    // TODO: Replace with actual auth
    const userId = 'guest';

    console.log('📤 [Design Upload API] Uploading to R2...');
    console.log('   Name:', name);
    console.log('   Category:', category);
    console.log('   Tags:', tags);

    // Generate filename
    const timestamp = Date.now();
    const sanitizedName = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const fileName = `designs/${userId}/${timestamp}-${sanitizedName}.png`;

    try {
      // Upload to R2
      const imageUrl = await uploadBase64Image(image, fileName);
      console.log('✅ [Design Upload API] Upload successful:', imageUrl);

      // Create design object
      const design: Design = {
        id: `design_${timestamp}`,
        userId,
        name,
        imageUrl,
        category,
        tags,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Save to storage
      const savedDesign = designStore.create(design);
      console.log('💾 [Design Upload API] Design saved to storage');
      console.log('   Total designs:', designStore.getAll().length);

      return NextResponse.json({
        success: true,
        design: savedDesign,
      });
    } catch (uploadError) {
      console.error('❌ [Design Upload API] Upload failed:', uploadError);
      return NextResponse.json(
        {
          error: 'Failed to upload design',
          details: uploadError instanceof Error ? uploadError.message : 'Unknown error',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ [Design Upload API] Error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to upload design',
      },
      { status: 500 }
    );
  }
}
