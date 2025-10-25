import { NextRequest, NextResponse } from 'next/server';

// Mock mockup URLs for development
// In production, this will call Dynamic Mockups API
// Using placeholder.com for reliable, CORS-friendly placeholder images
const MOCK_MOCKUP_URLS = [
  'https://via.placeholder.com/600x600/667eea/ffffff?text=Mockup+1',
  'https://via.placeholder.com/600x600/764ba2/ffffff?text=Mockup+2',
  'https://via.placeholder.com/600x600/f093fb/ffffff?text=Mockup+3',
  'https://via.placeholder.com/600x600/4facfe/ffffff?text=Mockup+4',
  'https://via.placeholder.com/600x600/43e97b/ffffff?text=Mockup+5',
  'https://via.placeholder.com/600x600/fa709a/ffffff?text=Mockup+6',
];

export async function POST(request: NextRequest) {
  try {
    console.log('📥 [Mockup Generate API] Request received');

    const body = await request.json();
    const { designUrl, productType, variants } = body;

    if (!designUrl) {
      console.error('❌ [Mockup Generate API] Missing design URL');
      return NextResponse.json(
        {
          error: 'Design URL is required',
        },
        { status: 400 }
      );
    }

    console.log('🎨 [Mockup Generate API] Generating mockups...');
    console.log('   Design URL:', designUrl);
    console.log('   Product Type:', productType);
    console.log('   Variants:', variants);

    // Check if Dynamic Mockups API is available
    const apiKey = process.env.DYNAMIC_MOCKUPS_API_KEY;

    if (!apiKey) {
      console.warn('⚠️ [Mockup Generate API] API key not configured, using mock mockups');

      // Return mock mockups
      return NextResponse.json({
        success: true,
        mockupUrls: MOCK_MOCKUP_URLS,
        mock: true,
        warning: 'Dynamic Mockups API key not configured. Using placeholder mockups.',
      });
    }

    try {
      // TODO: Integrate with Dynamic Mockups SDK
      // For now, we'll use the batch preview approach from the documentation

      // In a real implementation, this would:
      // 1. Upload the design to Dynamic Mockups
      // 2. Select mockup templates based on productType
      // 3. Generate preview images
      // 4. Return the mockup URLs

      // Simulating API delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log('✅ [Mockup Generate API] Mockups generated successfully');
      console.log('   Generated:', MOCK_MOCKUP_URLS.length, 'mockups');

      return NextResponse.json({
        success: true,
        mockupUrls: MOCK_MOCKUP_URLS,
        mock: true,
        warning: 'Dynamic Mockups integration pending. Using placeholder mockups.',
      });
    } catch (apiError) {
      console.error('❌ [Mockup Generate API] API error:', apiError);

      // Fallback to mock mockups
      return NextResponse.json({
        success: true,
        mockupUrls: MOCK_MOCKUP_URLS,
        mock: true,
        warning: 'Dynamic Mockups API error. Using placeholder mockups.',
      });
    }
  } catch (error) {
    console.error('❌ [Mockup Generate API] Error:', error);

    // Even on error, return mock mockups
    return NextResponse.json({
      success: true,
      mockupUrls: MOCK_MOCKUP_URLS,
      mock: true,
      warning: 'Error generating mockups. Using placeholder mockups.',
    });
  }
}
