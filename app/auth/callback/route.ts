import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/app/overview';

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error('Auth callback error:', error);
        return NextResponse.redirect(`${requestUrl.origin}/login?error=verification_failed`);
      }

      // Create or update user record in database
      if (data.user) {
        const { error: dbError } = await supabase
          .from('users')
          .upsert({
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.name || data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
            plan_id: 'free',
            subscription_status: 'active',
            last_login: new Date().toISOString(),
          }, {
            onConflict: 'id',
            ignoreDuplicates: false,
          });

        if (dbError && dbError.code !== '23505') {
          console.error('Error creating/updating user record:', dbError);
          // Continue anyway - user is authenticated
        }
      }

      // Authentication successful, redirect to app
      return NextResponse.redirect(`${requestUrl.origin}${next}`);
    } catch (error) {
      console.error('Auth callback exception:', error);
      return NextResponse.redirect(`${requestUrl.origin}/login?error=verification_failed`);
    }
  }

  // No code present, redirect to login
  return NextResponse.redirect(`${requestUrl.origin}/login?error=no_code`);
}
