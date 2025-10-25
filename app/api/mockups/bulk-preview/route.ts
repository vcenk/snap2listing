import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('📥 [Bulk Preview API] Request received');

    const { artworkUrl, collectionUUID, colors } = await request.json();

    if (!artworkUrl) {
      console.error('❌ [Bulk Preview API] No artwork URL provided');
      return NextResponse.json(
        { error: 'Artwork URL is required' },
        { status: 400 }
      );
    }

    if (!collectionUUID) {
      console.error('❌ [Bulk Preview API] No collection UUID provided');
      return NextResponse.json(
        { error: 'Collection UUID is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.DYNAMIC_MOCKUPS_API_KEY;
    if (!apiKey) {
      console.error('❌ [Bulk Preview API] API key not configured');
      return NextResponse.json(
        { error: 'Dynamic Mockups API key not configured' },
        { status: 500 }
      );
    }

    console.log('📤 [Bulk Preview API] Calling Dynamic Mockups Bulk Render API...');
    console.log('   Collection UUID:', collectionUUID);
    console.log('   Artwork URL:', artworkUrl);

    const response = await fetch(
      'https://app.dynamicmockups.com/api/v1/renders/bulk',
      {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collection_uuid: collectionUUID,
          artworks: {
            artwork_main: artworkUrl,
          },
          colors: colors || {},
          image_format: 'webp',
          image_size: 800,
          mode: 'view', // 'view' for preview URLs, omit for download
        }),
      }
    );

    console.log('   Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Could not read error');
      console.error('❌ [Bulk Preview API] Bulk render failed');
      console.error('   Status:', response.status);
      console.error('   Error:', errorText);
      return NextResponse.json(
        { error: `Bulk render failed: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ [Bulk Preview API] Bulk render successful');
    console.log('   Previews count:', data.renders?.length || 0);

    return NextResponse.json({
      success: true,
      previews: data.renders || [],
    });
  } catch (error) {
    console.error('❌ [Bulk Preview API] Error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to generate previews',
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
