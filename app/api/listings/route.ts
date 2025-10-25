import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import type { ListingModel, ListingImageModel, ListingChannelModel } from '@/lib/types/channels';

/**
 * GET /api/listings
 * Fetch all listings for a user (new multi-channel schema)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Fetch listings with related data
    const { data: listings, error } = await supabaseAdmin
      .from('listings')
      .select(`
        *,
        listing_images(*),
        listing_channels(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Build channel id -> details map for all listings
    let channelMap: Record<string, { id: string; slug: string; name: string }> = {};
    if (!error && listings && listings.length > 0) {
      const allChannelIds = Array.from(
        new Set(
          listings
            .flatMap((l: any) => (l.listing_channels || []).map((lc: any) => lc.channel_id))
            .filter(Boolean)
        )
      );
      if (allChannelIds.length > 0) {
        const { data: channelsData } = await supabaseAdmin
          .from('channels')
          .select('id, slug, name')
          .in('id', allChannelIds);
        (channelsData || []).forEach((c: any) => {
          channelMap[c.id] = { id: c.id, slug: c.slug, name: c.name };
        });
      }
    }

    if (error) {
      console.error('Error fetching listings:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch listings' },
        { status: 500 }
      );
    }

    // Transform listings to include reconstructed data
    const transformedListings = (listings || []).map((listing: any) => {
      // Reconstruct images array
      const images = (listing.listing_images as ListingImageModel[])
        .sort((a, b) => a.position - b.position)
        .map(img => img.url);

      // Get preview image (first image or originalImage)
      const previewImage = images[0] || (listing.base_data as any)?.originalImage || '';

      const channelsSummary = (listing.listing_channels as ListingChannelModel[]).map((lc: any) => {
        const meta = channelMap[lc.channel_id];
        return {
          channelId: lc.channel_id,
          channelSlug: meta?.slug || '',
          channelName: meta?.name || meta?.slug || '',
          readinessScore: lc.readiness_score,
          isReady: lc.is_ready,
        };
      });

      return {
        id: listing.id,
        userId: listing.user_id,
        status: listing.status,
        title: (listing.base_data as any)?.title || 'Untitled',
        description: (listing.base_data as any)?.description || '',
        price: (listing.base_data as any)?.price || 0,
        previewImage,
        channelCount: channelsSummary.length,
        channels: channelsSummary,
        imageCount: images.length,
        seoScore: listing.seo_score,
        createdAt: listing.created_at,
        updatedAt: listing.updated_at,
      };
    });

    return NextResponse.json({
      success: true,
      listings: transformedListings,
    });
  } catch (error) {
    console.error('Error fetching listings:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch listings',
      },
      { status: 500 }
    );
  }
}

/**
 * POST method removed - use /api/listings/save instead
 * The /api/listings/save route properly handles the new multi-channel schema
 * with base_data (JSONB), listing_images, and listing_channels tables.
 */

/**
 * PUT method removed - use /api/listings/save instead
 * The /api/listings/save route handles both creates and updates for the new multi-channel schema.
 * Pass an 'id' field in the request body to update an existing listing.
 */

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    let userId = searchParams.get('userId');

    // If single delete via query params
    if (id) {
      if (!userId) {
        return NextResponse.json(
          { error: 'User ID is required' },
          { status: 400 }
        );
      }

      const { error } = await supabaseAdmin
        .from('listings')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting listing:', error);
        return NextResponse.json(
          { error: 'Failed to delete listing' },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    }

    // Attempt bulk delete via JSON body
    let body: any = {};
    try {
      body = await request.json();
    } catch (_) {
      // no body
    }

    const ids: string[] = Array.isArray(body?.ids) ? body.ids : [];
    if (!userId) userId = body?.userId || undefined;

    if (!userId || ids.length === 0) {
      return NextResponse.json(
        { error: 'User ID and one or more Listing IDs are required' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('listings')
      .delete()
      .in('id', ids)
      .eq('user_id', userId);

    if (error) {
      console.error('Error bulk deleting listings:', error);
      return NextResponse.json(
        { error: 'Failed to delete listings' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting listing(s):', error);
    return NextResponse.json(
      { error: 'Failed to delete listing(s)' },
      { status: 500 }
    );
  }
}
