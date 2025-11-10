import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

/**
 * GET /api/channels/debug
 * Debug endpoint to check channel data and fix validation_rules
 */
export async function GET() {
  try {
    // Fetch current channels
    const { data: channels, error } = await supabase
      .from('channels')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
      });
    }

    // Check if validation_rules are empty
    const channelsWithEmptyRules = channels?.filter(
      ch => !ch.validation_rules || Object.keys(ch.validation_rules).length === 0
    );

    return NextResponse.json({
      success: true,
      totalChannels: channels?.length || 0,
      channels: channels?.map(ch => ({
        name: ch.name,
        slug: ch.slug,
        hasValidationRules: ch.validation_rules && Object.keys(ch.validation_rules).length > 0,
        validationRules: ch.validation_rules,
        hasDescription: !!ch.config?.description,
        description: ch.config?.description,
      })),
      channelsWithEmptyRules: channelsWithEmptyRules?.map(ch => ch.slug),
      needsFix: (channelsWithEmptyRules?.length || 0) > 0,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * POST /api/channels/debug
 * Fix validation_rules for all channels
 */
export async function POST() {
  try {
    const updates = [
      {
        slug: 'shopify',
        validation_rules: {
          title: { required: true, maxLength: 255 },
          description: { required: true, maxLength: 65535 },
          price: { required: true, min: 0 },
          images: { required: true, min: 1, max: 250 },
        },
        description: 'Perfect for your own online store',
      },
      {
        slug: 'ebay',
        validation_rules: {
          title: { required: true, maxLength: 80 },
          description: { required: true, maxLength: 500000 },
          price: { required: true, min: 0 },
          category: { required: true },
          images: { required: true, min: 1, max: 24 },
        },
        description: 'Auction and fixed-price marketplace',
      },
      {
        slug: 'amazon',
        validation_rules: {
          title: { required: true, maxLength: 200 },
          description: { required: true, maxLength: 2000 },
          bullets: { required: true, max: 5 },
          price: { required: true, min: 0 },
          images: { required: true, min: 1, max: 9 },
        },
        description: 'Worlds largest marketplace',
      },
      {
        slug: 'etsy',
        validation_rules: {
          title: { required: true, maxLength: 140 },
          description: { required: true, maxLength: 5000 },
          tags: { required: true, max: 13 },
          price: { required: true, min: 0.20 },
          images: { required: true, min: 1, max: 10 },
          materials: { max: 13 },
        },
        description: 'Handmade and vintage marketplace',
      },
      {
        slug: 'facebook-ig',
        validation_rules: {
          title: { required: true, maxLength: 100 },
          description: { required: true, maxLength: 5000 },
          price: { required: true, min: 0 },
          images: { required: true, min: 1, max: 20 },
        },
        description: 'Social commerce platform',
      },
      {
        slug: 'tiktok',
        validation_rules: {
          title: { required: true, maxLength: 255 },
          description: { required: true, maxLength: 5000 },
          price: { required: true, min: 0 },
          images: { required: true, min: 1, max: 9 },
          video: { recommended: true },
        },
        description: 'Social shopping platform',
      },
    ];

    const results = [];
    for (const update of updates) {
      // Get current channel
      const { data: currentChannel } = await supabase
        .from('channels')
        .select('config')
        .eq('slug', update.slug)
        .single();

      // Merge description into existing config
      const newConfig = {
        ...(currentChannel?.config || {}),
        description: update.description,
      };

      // Update channel
      const { error } = await supabase
        .from('channels')
        .update({
          validation_rules: update.validation_rules,
          config: newConfig,
        })
        .eq('slug', update.slug);

      results.push({
        slug: update.slug,
        success: !error,
        error: error?.message,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Channels updated successfully',
      results,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    });
  }
}
