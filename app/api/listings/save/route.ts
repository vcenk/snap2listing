import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import type { ListingBase, ChannelOverride } from '@/lib/types/channels';

/**
 * POST /api/listings/save
 * Save or update a listing in the new multi-channel schema
 *
 * Request body:
 * {
 *   id?: string,              // Optional - for updates
 *   userId: string,
 *   status: 'draft' | 'optimized' | 'completed',
 *   base: ListingBase,
 *   channels: ChannelOverride[],
 *   seoScore?: number,
 *   lastStep?: string,
 *   lastChannelTab?: string,
 *   scrollPosition?: number
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Received save request body:', JSON.stringify(body, null, 2));
    
    const {
      id,
      userId,
      status = 'draft',
      base,
      channels = [],
      seoScore = 0,
      lastStep,
      lastChannelTab,
      scrollPosition = 0,
    } = body;
    
    // Ensure scrollPosition is an integer (convert from float if needed)
    const scrollPositionInt = Math.round(Number(scrollPosition) || 0);

    // Validation
    if (!userId) {
      console.error('Validation error: userId is missing');
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    if (!base || typeof base !== 'object') {
      console.error('Validation error: base data is invalid', base);
      return NextResponse.json(
        { success: false, error: 'base data is required' },
        { status: 400 }
      );
    }

    // Extract images from base data for separate storage
    const { images: baseImages = [], ...baseDataWithoutImages } = base;

    // Prepare base_data JSONB (without images array, we'll store those separately)
    const baseData = {
      ...baseDataWithoutImages,
      // Keep originalImage in base_data for reference
      originalImage: base.originalImage || baseImages[0] || '',
    };

    console.log('Prepared base data:', baseData);
    console.log('Images count:', baseImages.length);
    console.log('Channels count:', channels.length);

    let listingId = id;

    // UPDATE existing listing
    if (listingId) {
      const { data: listing, error: updateError } = await supabaseAdmin
        .from('listings')
        .update({
          status,
          base_data: baseData,
          seo_score: seoScore,
          last_step: lastStep,
          last_channel_tab: lastChannelTab,
          scroll_position: scrollPositionInt,
          updated_at: new Date().toISOString(),
        })
        .eq('id', listingId)
        .eq('user_id', userId)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating listing:', updateError);
        return NextResponse.json(
          { success: false, error: 'Failed to update listing' },
          { status: 500 }
        );
      }

      // Delete existing images and channel associations (we'll recreate them)
      await supabaseAdmin
        .from('listing_images')
        .delete()
        .eq('listing_id', listingId);

      await supabaseAdmin
        .from('listing_channels')
        .delete()
        .eq('listing_id', listingId);

    } else {
      // CREATE new listing
      const { data: listing, error: insertError } = await supabaseAdmin
        .from('listings')
        .insert({
          user_id: userId,
          status,
          base_data: baseData,
          seo_score: seoScore,
          last_step: lastStep,
          last_channel_tab: lastChannelTab,
          scroll_position: scrollPositionInt,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating listing:', insertError);
        console.error('Insert error details:', JSON.stringify(insertError, null, 2));
        return NextResponse.json(
          { 
            success: false, 
            error: 'Failed to create listing', 
            details: insertError.message || insertError.toString(),
            hint: insertError.hint,
            code: insertError.code 
          },
          { status: 500 }
        );
      }

      listingId = listing.id;
    }

    // Insert images into listing_images table
    if (baseImages.length > 0) {
      const imageRecords = baseImages.map((url: string, index: number) => ({
        listing_id: listingId,
        url,
        position: index,
        is_main: index === 0,
        metadata: {},
      }));

      const { error: imagesError } = await supabaseAdmin
        .from('listing_images')
        .insert(imageRecords);

      if (imagesError) {
        console.error('Error inserting images:', imagesError);
        // Non-fatal - listing is created but images failed
        console.warn('Listing created but image insertion failed');
      }
    }

    // Insert channel associations into listing_channels table
    if (channels.length > 0) {
      console.log('Preparing channel records:', channels);
      
      const channelRecords = channels.map((channel: ChannelOverride) => {
        if (!channel.channelId) {
          console.warn('Channel missing channelId:', channel);
        }
        return {
          listing_id: listingId,
          channel_id: channel.channelId,
          override_data: {
            title: channel.title,
            description: channel.description,
            tags: channel.tags || [],
            bullets: channel.bullets || [],
            customFields: channel.customFields || {},
          },
          validation_state: channel.validationState || {},
          readiness_score: channel.readinessScore || 0,
          is_ready: channel.isReady || false,
        };
      });
      
      console.log('Channel records to insert:', JSON.stringify(channelRecords, null, 2));

      const { error: channelsError } = await supabaseAdmin
        .from('listing_channels')
        .insert(channelRecords);

      if (channelsError) {
        console.error('Error inserting channel associations:', channelsError);
        console.error('Channel insert error details:', JSON.stringify(channelsError, null, 2));
        // Non-fatal - listing is created but channel associations failed
        console.warn('Listing created but channel associations failed');
      }
    }

    // Fetch the complete listing with related data
    const { data: completeListing, error: fetchError } = await supabaseAdmin
      .from('listings')
      .select('*, listing_channels(*), listing_images(*)')
      .eq('id', listingId)
      .single();

    if (fetchError) {
      console.error('Error fetching complete listing:', fetchError);
      // Still return success since the listing was saved
      return NextResponse.json({
        success: true,
        listing: { id: listingId },
        message: 'Listing saved but failed to fetch complete data',
      });
    }

    return NextResponse.json({
      success: true,
      listing: completeListing,
    });
  } catch (error) {
    console.error('Save listing error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save listing',
        details: error instanceof Error ? error.toString() : String(error),
      },
      { status: 500 }
    );
  }
}
