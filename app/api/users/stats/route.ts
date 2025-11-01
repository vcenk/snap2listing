import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getPlanById, PLANS, checkCreditLimits, calculateCreditBreakdown, getTrialDaysRemaining, isTrialExpired } from '@/config/pricing';

// Mark this route as dynamic
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user data
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user:', userError);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get listings count
    const { count: totalListings, error: listingsError } = await supabaseAdmin
      .from('listings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Get published count
    const { count: publishedCount, error: publishedError } = await supabaseAdmin
      .from('listings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'published');

    // Get supported channels count (global)
    const { count: channelsCount, error: channelsError } = await supabaseAdmin
      .from('channels')
      .select('*', { count: 'exact', head: true });

    // Get plan limits from pricing config
    const plan = getPlanById(user.plan_id || 'free') || PLANS[0];

    // Credit-based tracking (primary)
    const creditsUsed = user.credits_used ?? 0;
    const creditsLimit = user.credits_limit ?? plan.credits ?? 10;
    const creditLimits = checkCreditLimits(plan, creditsUsed);
    const creditBreakdown = calculateCreditBreakdown(creditLimits.creditsRemaining);

    // Trial information (for free users)
    const accountCreatedAt = user.account_created_at ? new Date(user.account_created_at) : new Date(user.created_at);
    const trialDaysRemaining = plan.id === 'free' ? getTrialDaysRemaining(accountCreatedAt, plan) : 0;
    const trialExpired = plan.id === 'free' ? isTrialExpired(accountCreatedAt, plan) : false;

    const stats = {
      // Credit-based stats (primary)
      creditsUsed,
      creditsLimit,
      creditsRemaining: creditLimits.creditsRemaining,
      percentageUsed: creditLimits.percentageUsed,
      creditBreakdown,

      // Legacy stats (for backwards compatibility)
      imagesUsed: user.images_used || 0,
      imagesLimit: plan.images || 0,
      videosUsed: user.videos_used || 0,
      videosLimit: plan.videos || 0,

      // Counts
      listingsCount: totalListings || 0,
      publishedCount: publishedCount || 0,
      channelsCount: channelsCount || 0,

      // Plan info
      currentPlan: user.plan_id,
      planName: plan.name,
      subscriptionStatus: user.subscription_status,

      // Trial info (for free users)
      trialDaysRemaining,
      trialExpired,
      accountCreatedAt: accountCreatedAt.toISOString(),
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user stats' },
      { status: 500 }
    );
  }
}
