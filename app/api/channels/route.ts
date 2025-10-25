import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { channelModelToChannel, type ChannelModel } from '@/lib/types/channels';

/**
 * GET /api/channels
 * Fetches all available sales channels
 */
export async function GET(req: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching channels:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch channels' },
        { status: 500 }
      );
    }

    const channels = (data as ChannelModel[]).map(channelModelToChannel);

    return NextResponse.json({
      success: true,
      channels,
    });
  } catch (error) {
    console.error('Unexpected error fetching channels:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
