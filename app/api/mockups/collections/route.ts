import { NextRequest, NextResponse } from 'next/server';

// Mock collections for development/fallback
const MOCK_COLLECTIONS = [
  {
    uuid: 'mock-tshirt-001',
    name: 'T-Shirts',
    mockup_count: 25,
    created_at: new Date().toISOString(),
  },
  {
    uuid: 'mock-mug-001',
    name: 'Mugs',
    mockup_count: 15,
    created_at: new Date().toISOString(),
  },
  {
    uuid: 'mock-hoodie-001',
    name: 'Hoodies',
    mockup_count: 18,
    created_at: new Date().toISOString(),
  },
  {
    uuid: 'mock-phone-001',
    name: 'Phone Cases',
    mockup_count: 12,
    created_at: new Date().toISOString(),
  },
  {
    uuid: 'mock-tote-001',
    name: 'Tote Bags',
    mockup_count: 10,
    created_at: new Date().toISOString(),
  },
];

export async function GET(request: NextRequest) {
  try {
    console.log('📥 [Collections API] Request received');

    const apiKey = process.env.DYNAMIC_MOCKUPS_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ [Collections API] API key not configured, using mock data');
      return NextResponse.json({
        success: true,
        collections: MOCK_COLLECTIONS,
        mock: true,
      });
    }

    console.log('📤 [Collections API] Fetching collections from Dynamic Mockups...');
    console.log('   API Key present:', apiKey ? `${apiKey.substring(0, 20)}...` : 'NO');

    try {
      const response = await fetch(
        'https://api.dynamic-mockups.com/api/v1/collections',
        {
          headers: {
            'x-api-key': apiKey,
            'Accept': 'application/json',
          },
        }
      );

      console.log('   Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Could not read error');
        console.error('❌ [Collections API] Fetch failed');
        console.error('   Status:', response.status);
        console.error('   Error:', errorText);
        console.warn('⚠️ [Collections API] Falling back to mock data');

        return NextResponse.json({
          success: true,
          collections: MOCK_COLLECTIONS,
          mock: true,
          warning: `Dynamic Mockups API returned ${response.status}. Using mock data.`,
        });
      }

      const data = await response.json();
      console.log('✅ [Collections API] Fetch successful');
      console.log('   Collections count:', data.collections?.length || 0);

      // If no collections, return mock data
      if (!data.collections || data.collections.length === 0) {
        console.warn('⚠️ [Collections API] No collections found, using mock data');
        return NextResponse.json({
          success: true,
          collections: MOCK_COLLECTIONS,
          mock: true,
          warning: 'No collections found in Dynamic Mockups. Using mock data.',
        });
      }

      return NextResponse.json({
        success: true,
        collections: data.collections,
        mock: false,
      });
    } catch (fetchError) {
      console.error('❌ [Collections API] Fetch error:', fetchError);
      console.warn('⚠️ [Collections API] Network error, falling back to mock data');

      return NextResponse.json({
        success: true,
        collections: MOCK_COLLECTIONS,
        mock: true,
        warning: `Network error: ${fetchError instanceof Error ? fetchError.message : 'Unknown'}. Using mock data.`,
      });
    }
  } catch (error) {
    console.error('❌ [Collections API] Unexpected error:', error);

    // Even on error, return mock data so the UI can continue working
    return NextResponse.json({
      success: true,
      collections: MOCK_COLLECTIONS,
      mock: true,
      warning: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown'}. Using mock data.`,
    });
  }
}
