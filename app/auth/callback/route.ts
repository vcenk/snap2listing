import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/app';

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error('Auth callback error:', error);
        return NextResponse.redirect(`${requestUrl.origin}/login?error=verification_failed`);
      }

      // Email confirmed successfully, redirect to app
      return NextResponse.redirect(`${requestUrl.origin}${next}`);
    } catch (error) {
      console.error('Auth callback exception:', error);
      return NextResponse.redirect(`${requestUrl.origin}/login?error=verification_failed`);
    }
  }

  // No code present, redirect to login
  return NextResponse.redirect(`${requestUrl.origin}/login?error=no_code`);
}
