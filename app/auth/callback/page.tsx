'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('🔄 OAuth callback started...');
        console.log('📍 URL:', window.location.href);
        console.log('🔑 Search params:', Object.fromEntries(searchParams.entries()));

        // Check if we have an authorization code (PKCE flow)
        const code = searchParams.get('code');

        if (code) {
          console.log('✅ Authorization code found, exchanging for session...');

          // Exchange the code for a session (PKCE flow)
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            console.error('❌ Code exchange error:', exchangeError);
            setError(exchangeError.message);
            setTimeout(() => router.push('/login'), 3000);
            return;
          }

          if (!data.session) {
            console.error('❌ No session after code exchange');
            setError('Failed to create session. Please try again.');
            setTimeout(() => router.push('/login'), 3000);
            return;
          }

          console.log('✅ Session created successfully!');
          const { session } = data;

          // Create or update user record in database
          const { user } = session;
          console.log('📝 Creating/updating user record for:', user.email);

          const { error: dbError } = await supabase
            .from('users')
            .upsert({
              id: user.id,
              email: user.email,
              name: user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0],
              plan_id: 'free',
              subscription_status: 'active',
              last_login: new Date().toISOString(),
            }, {
              onConflict: 'id',
              ignoreDuplicates: false,
            });

          if (dbError && dbError.code !== '23505') {
            console.error('⚠️ Error creating/updating user record:', dbError);
            // Continue anyway - user is authenticated
          } else {
            console.log('✅ User record created/updated');
          }

          // Get redirect URL from query params or default to overview
          const next = searchParams.get('next') || '/app/overview';
          console.log('🚀 Redirecting to:', next);
          router.push(next);
        } else {
          // Fallback: Try to get existing session (for older flows or edge cases)
          console.log('ℹ️ No code parameter, checking for existing session...');

          const { data: { session }, error: sessionError } = await supabase.auth.getSession();

          if (sessionError) {
            console.error('❌ Session error:', sessionError);
            setError(sessionError.message);
            setTimeout(() => router.push('/login'), 3000);
            return;
          }

          if (session) {
            console.log('✅ Existing session found, redirecting...');
            const next = searchParams.get('next') || '/app/overview';
            router.push(next);
          } else {
            console.error('❌ No code and no session found');
            setError('No authorization code found. Please try signing in again.');
            setTimeout(() => router.push('/login'), 3000);
          }
        }
      } catch (err: any) {
        console.error('❌ Auth callback error:', err);
        setError(err.message || 'Authentication failed');
        setTimeout(() => router.push('/login'), 3000);
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        p: 3,
      }}
    >
      {error ? (
        <Alert severity="error" sx={{ maxWidth: 500, mb: 2 }}>
          {error}
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            Redirecting to login...
          </Typography>
        </Alert>
      ) : (
        <>
          <CircularProgress size={60} sx={{ color: 'white', mb: 3 }} />
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>
            Completing sign in...
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 1 }}>
            Please wait while we set up your account
          </Typography>
        </>
      )}
    </Box>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
          p: 3,
        }}
      >
        <CircularProgress size={60} sx={{ color: 'white', mb: 3 }} />
        <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>
          Loading...
        </Typography>
      </Box>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
