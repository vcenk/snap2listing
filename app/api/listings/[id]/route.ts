import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import type { ChannelModel, ListingModel, ListingChannelModel, ListingImageModel } from '@/lib/types/channels';

/**
 * GET /api/listings/[id]
 * Fetch a single listing with all related data (new multi-channel schema)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Fetch listing with related images and channel associations
    const { data: listing, error } = await supabaseAdmin
      .from('listings')
      .select(`
        *,
        listing_images(*),
        listing_channels(*)
      `)
      .eq('id', params.id)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Listing not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching listing:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch listing' },
        { status: 500 }
      );
    }

    // Fetch channel details for each listing_channel
    const channelIds = (listing.listing_channels as ListingChannelModel[]).map(lc => lc.channel_id);
    let channels: ChannelModel[] = [];

    if (channelIds.length > 0) {
      const { data: channelsData, error: channelsError } = await supabaseAdmin
        .from('channels')
        .select('*')
        .in('id', channelIds);

      if (channelsError) {
        console.error('Error fetching channels:', channelsError);
      } else {
        channels = channelsData || [];
      }
    }

    // Reconstruct images array from listing_images
    const images = (listing.listing_images as ListingImageModel[])
      .sort((a, b) => a.position - b.position)
      .map(img => img.url);

    // Reconstruct the data in a format the wizard expects
    const reconstructed = {
      id: listing.id,
      userId: listing.user_id,
      status: listing.status,
      base: {
        ...(listing.base_data as Record<string, any>),
        images, // Add reconstructed images array
      },
      channels: (listing.listing_channels as ListingChannelModel[]).map((lc: ListingChannelModel) => {
        const channel = channels.find(c => c.id === lc.channel_id);
        return {
          channelId: lc.channel_id,
          channelSlug: channel?.slug || '',
          channelName: (channel as any)?.name || channel?.slug || '',
          ...lc.override_data,
          validationState: lc.validation_state,
          readinessScore: lc.readiness_score,
          isReady: lc.is_ready,
        };
      }),
      seoScore: listing.seo_score,
      lastStep: listing.last_step,
      lastChannelTab: listing.last_channel_tab,
      scrollPosition: listing.scroll_position,
      createdAt: listing.created_at,
      updatedAt: listing.updated_at,
    };

    return NextResponse.json({
      success: true,
      listing: reconstructed,
      raw: listing, // Include raw data for debugging
    });
  } catch (error) {
    console.error('Error fetching listing:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch listing',
      },
      { status: 500 }
    );
  }
}
