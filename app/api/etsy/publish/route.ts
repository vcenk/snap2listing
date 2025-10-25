import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import {
  createEtsyListing,
  uploadListingImage,
  uploadListingVideo,
  publishListing,
} from '@/lib/etsy/client';

export async function POST(request: NextRequest) {
  // Deprecated as part of Multi-Channel migration
  return NextResponse.json(
    {
      success: false,
      error: 'Direct Etsy publishing has been deprecated. Use Multi-Channel Export.',
      migration: {
        message: 'Generate exports (CSV/XLSX) or readiness reports per channel',
        next: '/app/channels'
      }
    },
    { status: 410 }
  );
}
