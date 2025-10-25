import { NextRequest, NextResponse } from 'next/server';
import { getEtsyAuthUrl } from '@/lib/etsy/client';

// Mark this route as dynamic
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Deprecated as part of Multi-Channel migration
  return NextResponse.json(
    {
      success: false,
      error: 'Etsy OAuth has been deprecated. Use multi-channel export instead.',
      migration: {
        message: 'Shop connections replaced by export-based workflow',
        next: '/app/channels'
      }
    },
    { status: 410 }
  );
}
