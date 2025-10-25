import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken, getUserShops } from '@/lib/etsy/client';
import { supabaseAdmin } from '@/lib/supabase/server';

// Mark this route as dynamic
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Deprecated as part of Multi-Channel migration
  return NextResponse.json(
    {
      success: false,
      error: 'Etsy OAuth callback is no longer supported.',
      migration: {
        message: 'Shop connections replaced by export-based workflow',
        next: '/app/channels'
      }
    },
    { status: 410 }
  );
}
