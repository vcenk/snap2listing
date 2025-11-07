/**
 * Credit Tracking Service
 * Handles credit deduction and tracking for all paid actions
 */

import { supabaseAdmin } from '@/lib/supabase/server';
import { CREDIT_COSTS } from '@/config/pricing';

export type ActionType =
  | 'image_generation'
  | 'video_generation'
  | 'mockup_download'
  | 'seo_content'
  | 'ai_prompt_suggestion'
  | 'title_generation'
  | 'description_generation'
  | 'tags_generation';

/**
 * Deduct credits from user account
 * Calls the database function deduct_credits() which handles:
 * - Trial expiration checks
 * - Credit limit validation
 * - Credit deduction
 * - Throws exceptions if insufficient credits or trial expired
 */
export async function deductCredits(
  userId: string,
  actionType: ActionType,
  quantity: number = 1
): Promise<{ success: boolean; creditsDeducted: number; creditsRemaining: number; error?: string }> {
  try {
    // Get credit cost for this action
    const costPerAction = getCreditCost(actionType);
    const totalCredits = costPerAction * quantity;

    console.log(`💳 Deducting ${totalCredits} credits for ${actionType} (${quantity}x${costPerAction})`);

    // Call the database function
    const { data, error } = await supabaseAdmin.rpc('deduct_credits', {
      user_id: userId,
      credits_to_deduct: totalCredits,
      action_type: actionType,
    });

    if (error) {
      console.error('❌ Credit deduction failed:', error);

      // Parse error message for user-friendly response
      if (error.message?.includes('Insufficient credits')) {
        return {
          success: false,
          creditsDeducted: 0,
          creditsRemaining: 0,
          error: 'Insufficient credits. Please upgrade your plan or purchase additional credits.',
        };
      }

      if (error.message?.includes('trial has expired')) {
        return {
          success: false,
          creditsDeducted: 0,
          creditsRemaining: 0,
          error: 'Your free trial has expired. Please upgrade to continue using Snap2Listing.',
        };
      }

      return {
        success: false,
        creditsDeducted: 0,
        creditsRemaining: 0,
        error: error.message || 'Failed to deduct credits',
      };
    }

    // Get updated credit info
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('credits_used, credits_limit')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      console.error('Failed to fetch updated credits:', userError);
      return {
        success: true,
        creditsDeducted: totalCredits,
        creditsRemaining: 0,
      };
    }

    const creditsRemaining = userData.credits_limit - userData.credits_used;

    console.log(`✅ Credits deducted successfully. Remaining: ${creditsRemaining}/${userData.credits_limit}`);

    // Log to credit usage log
    await logCreditUsage(userId, actionType, totalCredits, creditsRemaining);

    return {
      success: true,
      creditsDeducted: totalCredits,
      creditsRemaining,
    };
  } catch (error) {
    console.error('Exception in deductCredits:', error);
    return {
      success: false,
      creditsDeducted: 0,
      creditsRemaining: 0,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Get credit cost for an action type
 */
export function getCreditCost(actionType: ActionType): number {
  switch (actionType) {
    case 'image_generation':
      return CREDIT_COSTS.imageGeneration;
    case 'video_generation':
      return CREDIT_COSTS.videoGeneration;
    case 'mockup_download':
      return CREDIT_COSTS.mockupDownload;
    case 'seo_content':
      return CREDIT_COSTS.seoContentPerChannel;
    case 'ai_prompt_suggestion':
      return CREDIT_COSTS.aiPromptSuggestion;
    case 'title_generation':
      return CREDIT_COSTS.titleGeneration;
    case 'description_generation':
      return CREDIT_COSTS.descriptionGeneration;
    case 'tags_generation':
      return CREDIT_COSTS.tagsGeneration;
    default:
      return 0;
  }
}

/**
 * Check if user has enough credits for an action
 */
export async function checkCreditsAvailable(
  userId: string,
  actionType: ActionType,
  quantity: number = 1
): Promise<{ available: boolean; creditsNeeded: number; creditsRemaining: number; error?: string }> {
  try {
    const costPerAction = getCreditCost(actionType);
    const totalCreditsNeeded = costPerAction * quantity;

    // Get user's current credit status
    const { data: userData, error } = await supabaseAdmin
      .from('users')
      .select('credits_used, credits_limit, plan_id, account_created_at')
      .eq('id', userId)
      .single();

    if (error || !userData) {
      return {
        available: false,
        creditsNeeded: totalCreditsNeeded,
        creditsRemaining: 0,
        error: 'Failed to fetch user credits',
      };
    }

    const creditsRemaining = userData.credits_limit - userData.credits_used;

    // Check trial expiration for free plan
    if (userData.plan_id === 'free') {
      const accountCreatedAt = new Date(userData.account_created_at);
      const now = new Date();
      const daysElapsed = Math.floor((now.getTime() - accountCreatedAt.getTime()) / (1000 * 60 * 60 * 24));

      if (daysElapsed >= 7) {
        return {
          available: false,
          creditsNeeded: totalCreditsNeeded,
          creditsRemaining: 0,
          error: 'Your free trial has expired. Please upgrade to continue.',
        };
      }
    }

    // Check if enough credits
    if (creditsRemaining < totalCreditsNeeded) {
      return {
        available: false,
        creditsNeeded: totalCreditsNeeded,
        creditsRemaining,
        error: `Insufficient credits. You need ${totalCreditsNeeded} but only have ${creditsRemaining} remaining.`,
      };
    }

    return {
      available: true,
      creditsNeeded: totalCreditsNeeded,
      creditsRemaining,
    };
  } catch (error) {
    console.error('Exception in checkCreditsAvailable:', error);
    return {
      available: false,
      creditsNeeded: 0,
      creditsRemaining: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Log credit usage to audit trail
 */
async function logCreditUsage(
  userId: string,
  actionType: ActionType,
  creditsUsed: number,
  creditsRemaining: number,
  listingId?: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    await supabaseAdmin.from('credit_usage_log').insert({
      user_id: userId,
      action_type: actionType,
      credits_used: creditsUsed,
      credits_remaining: creditsRemaining,
      listing_id: listingId,
      metadata: metadata || {},
    });
  } catch (error) {
    console.error('Failed to log credit usage (non-fatal):', error);
    // Non-fatal error - don't throw
  }
}

/**
 * Get user's current credit status
 */
export async function getUserCredits(userId: string): Promise<{
  creditsUsed: number;
  creditsLimit: number;
  creditsRemaining: number;
  planId: string;
  trialDaysRemaining?: number;
}> {
  const { data: userData, error } = await supabaseAdmin
    .from('users')
    .select('credits_used, credits_limit, plan_id, account_created_at')
    .eq('id', userId)
    .single();

  if (error || !userData) {
    throw new Error('Failed to fetch user credits');
  }

  const creditsRemaining = userData.credits_limit - userData.credits_used;

  let trialDaysRemaining: number | undefined;
  if (userData.plan_id === 'free') {
    const accountCreatedAt = new Date(userData.account_created_at);
    const now = new Date();
    const daysElapsed = Math.floor((now.getTime() - accountCreatedAt.getTime()) / (1000 * 60 * 60 * 24));
    trialDaysRemaining = Math.max(0, 7 - daysElapsed);
  }

  return {
    creditsUsed: userData.credits_used,
    creditsLimit: userData.credits_limit,
    creditsRemaining,
    planId: userData.plan_id,
    trialDaysRemaining,
  };
}
