import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { channelModelToChannel, type ChannelModel } from '@/lib/types/channels';

/**
 * GET /api/channels
 * Fetches all available sales channels
 */
export async function GET(req: NextRequest) {
  try {
    console.log('📡 Fetching channels from database...');

    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('❌ Database error fetching channels:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch channels' },
        { status: 500 }
      );
    }

    console.log('✅ Raw database data:', JSON.stringify(data, null, 2));
    console.log('📊 Channels count:', data?.length);

    const channels = (data as ChannelModel[]).map(model => {
      console.log('🔄 Converting channel:', model.name);
      const converted = channelModelToChannel(model);
      console.log('✅ Converted channel:', converted);
      return converted;
    });

    console.log('📦 Final channels array:', channels.length, 'items');

    return NextResponse.json({
      success: true,
      channels,
    });
  } catch (error: any) {
    console.error('❌ Unexpected error fetching channels:', error);
    console.error('Stack:', error.stack);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
