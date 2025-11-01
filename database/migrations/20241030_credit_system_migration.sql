-- Migration: Credit System and 7-Day Trial Support
-- Date: 2024-10-30
-- Description: Migrate from images/videos tracking to credit-based system

-- Step 1: Add new credit-based columns to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS credits_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS credits_limit INTEGER DEFAULT 15,
ADD COLUMN IF NOT EXISTS account_created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Step 2: Backfill account_created_at with existing created_at data
UPDATE public.users
SET account_created_at = created_at
WHERE account_created_at IS NULL;

-- Step 3: Migrate existing usage data to credits
-- Assumption: 1 image = 3 credits, 1 video = 3 credits (based on new CREDIT_COSTS)
UPDATE public.users
SET credits_used = COALESCE(images_used, 0) * 3 + COALESCE(videos_used, 0) * 3
WHERE credits_used = 0;

-- Step 4: Set credit limits based on current plan_id
-- Free: 15 credits (updated from 10)
-- Starter: 300 credits
-- Pro: 750 credits (updated from 580)
-- Growth: 900 credits
-- Business: 1800 credits (updated from 1600)

UPDATE public.users
SET credits_limit = CASE
  WHEN plan_id = 'free' THEN 15
  WHEN plan_id = 'starter' THEN 300
  WHEN plan_id = 'pro' THEN 750
  WHEN plan_id = 'growth' THEN 900
  WHEN plan_id = 'business' OR plan_id = 'enterprise' THEN 1800
  ELSE 15 -- Default to free tier
END
WHERE credits_limit = 15 OR credits_limit = 10; -- Update both old default (10) and new default (15)

-- Step 5: Create index on credits_used for performance
CREATE INDEX IF NOT EXISTS idx_users_credits_used
ON public.users(credits_used);

CREATE INDEX IF NOT EXISTS idx_users_account_created_at
ON public.users(account_created_at);

CREATE INDEX IF NOT EXISTS idx_users_plan_credits
ON public.users(plan_id, credits_used, credits_limit);

-- Step 6: Add comments for documentation
COMMENT ON COLUMN public.users.credits_used IS 'Total credits used in current billing period';
COMMENT ON COLUMN public.users.credits_limit IS 'Credit limit for current plan (resets each billing period)';
COMMENT ON COLUMN public.users.account_created_at IS 'Account creation timestamp (for trial expiration tracking)';

-- Step 7: Create helper function to check if trial has expired
CREATE OR REPLACE FUNCTION public.is_trial_expired(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_plan_id TEXT;
  user_created_at TIMESTAMP WITH TIME ZONE;
  days_elapsed INTEGER;
BEGIN
  SELECT plan_id, account_created_at INTO user_plan_id, user_created_at
  FROM public.users
  WHERE id = user_id;

  -- Only free plan has trial period
  IF user_plan_id != 'free' THEN
    RETURN FALSE;
  END IF;

  days_elapsed := EXTRACT(DAY FROM (NOW() - user_created_at));

  -- Free plan has 7-day trial
  RETURN days_elapsed >= 7;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Create helper function to get trial days remaining
CREATE OR REPLACE FUNCTION public.get_trial_days_remaining(user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  user_plan_id TEXT;
  user_created_at TIMESTAMP WITH TIME ZONE;
  days_elapsed INTEGER;
BEGIN
  SELECT plan_id, account_created_at INTO user_plan_id, user_created_at
  FROM public.users
  WHERE id = user_id;

  -- Only free plan has trial period
  IF user_plan_id != 'free' THEN
    RETURN 0;
  END IF;

  days_elapsed := EXTRACT(DAY FROM (NOW() - user_created_at));

  -- Free plan has 7-day trial
  RETURN GREATEST(0, 7 - days_elapsed);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 9: Create helper function to deduct credits
CREATE OR REPLACE FUNCTION public.deduct_credits(
  user_id UUID,
  credits_to_deduct INTEGER,
  action_type TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  current_credits_used INTEGER;
  current_credits_limit INTEGER;
  trial_expired BOOLEAN;
BEGIN
  -- Get current usage and check trial status
  SELECT credits_used, credits_limit, public.is_trial_expired(user_id)
  INTO current_credits_used, current_credits_limit, trial_expired
  FROM public.users
  WHERE id = user_id;

  -- Check if trial has expired for free plan users
  IF trial_expired THEN
    RAISE EXCEPTION 'Free trial has expired. Please upgrade to continue using Snap2Listing.';
  END IF;

  -- Allow 0-credit actions (SEO content, AI prompts, titles, descriptions, tags)
  IF credits_to_deduct = 0 THEN
    RETURN TRUE;
  END IF;

  -- Check if user has enough credits
  IF current_credits_used + credits_to_deduct > current_credits_limit THEN
    RAISE EXCEPTION 'Insufficient credits. You need % credits but only have % remaining.',
      credits_to_deduct,
      (current_credits_limit - current_credits_used);
  END IF;

  -- Deduct credits
  UPDATE public.users
  SET credits_used = credits_used + credits_to_deduct
  WHERE id = user_id;

  -- Log the action if action_type provided (optional audit trail)
  -- This could be expanded to log to a separate credit_usage_log table

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 10: Create credit_costs table
CREATE TABLE IF NOT EXISTS public.credit_costs (
  id SERIAL PRIMARY KEY,
  action_type VARCHAR(50) NOT NULL UNIQUE,
  credit_cost INTEGER NOT NULL,
  description VARCHAR(255),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert current credit costs
INSERT INTO public.credit_costs (action_type, credit_cost, description) VALUES
  ('image_generation', 3, 'AI image generation with prompt'),
  ('video_generation', 3, '5-second video generation'),
  ('mockup_download', 3, 'Mockup template download'),
  ('seo_content', 0, 'SEO content generation (unlimited)'),
  ('ai_prompt_suggestion', 0, 'AI prompt suggestions (unlimited)'),
  ('title_generation', 0, 'Title generation (unlimited)'),
  ('description_generation', 0, 'Description generation (unlimited)'),
  ('tags_generation', 0, 'Tags generation (unlimited)')
ON CONFLICT (action_type) DO UPDATE
SET credit_cost = EXCLUDED.credit_cost,
    description = EXCLUDED.description,
    updated_at = NOW();

COMMENT ON TABLE public.credit_costs IS 'Credit costs for each action type. 0 = unlimited/free.';

-- Step 11: Create subscription_plans table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id SERIAL PRIMARY KEY,
  plan_name VARCHAR(50) NOT NULL UNIQUE,
  plan_display_name VARCHAR(100) NOT NULL,
  monthly_price_usd DECIMAL(10,2) NOT NULL,
  annual_price_usd DECIMAL(10,2) NOT NULL,
  credits_per_month INTEGER NOT NULL,
  max_brand_kits INTEGER DEFAULT 1,
  max_team_seats INTEGER DEFAULT 1,
  features JSONB,
  trial_days INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert current subscription plans
INSERT INTO public.subscription_plans
  (plan_name, plan_display_name, monthly_price_usd, annual_price_usd, credits_per_month, max_brand_kits, max_team_seats, trial_days, features)
VALUES
  ('free', 'Free Trial', 0.00, 0.00, 15, 1, 1, 7, '["Full dashboard access", "Try all features", "1 complete listing"]'::jsonb),
  ('starter', 'Starter', 19.00, 190.00, 300, 1, 1, 0, '["300 credits/month", "33 complete listings/month", "Unlimited SEO content", "1 Brand Kit"]'::jsonb),
  ('pro', 'Pro', 39.00, 390.00, 750, 3, 1, 0, '["750 credits/month", "83 complete listings/month", "Unlimited SEO content", "3 Brand Kits", "Priority queue"]'::jsonb),
  ('growth', 'Growth', 49.00, 490.00, 900, 5, 2, 0, '["900 credits/month", "100 complete listings/month", "5 Brand Kits", "2 Team Seats"]'::jsonb),
  ('business', 'Business', 79.00, 790.00, 1800, -1, 5, 0, '["1,800 credits/month", "200 complete listings/month", "Unlimited Brand Kits", "5 Team Seats", "Dedicated support"]'::jsonb)
ON CONFLICT (plan_name) DO UPDATE
SET plan_display_name = EXCLUDED.plan_display_name,
    monthly_price_usd = EXCLUDED.monthly_price_usd,
    annual_price_usd = EXCLUDED.annual_price_usd,
    credits_per_month = EXCLUDED.credits_per_month,
    max_brand_kits = EXCLUDED.max_brand_kits,
    max_team_seats = EXCLUDED.max_team_seats,
    trial_days = EXCLUDED.trial_days,
    features = EXCLUDED.features,
    updated_at = NOW();

COMMENT ON TABLE public.subscription_plans IS 'Subscription plan definitions with pricing and features.';

-- Step 12: Create credit_usage_log table for audit trail
CREATE TABLE IF NOT EXISTS public.credit_usage_log (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL,
  credits_used INTEGER NOT NULL,
  credits_remaining INTEGER NOT NULL,
  listing_id UUID,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for fast user queries
CREATE INDEX IF NOT EXISTS idx_credit_usage_log_user_id
ON public.credit_usage_log(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_credit_usage_log_action_type
ON public.credit_usage_log(action_type);

COMMENT ON TABLE public.credit_usage_log IS 'Audit trail of all credit usage by users.';

-- Step 13: Update RLS policies if they reference images_used or videos_used
-- (This is a placeholder - adjust based on your actual RLS policies)

-- Optional: Keep images_used and videos_used columns for backwards compatibility
-- They can be removed in a future migration after all code is updated
-- For now, we'll keep them but they won't be the primary tracking mechanism

COMMENT ON TABLE public.users IS 'User accounts with credit-based usage tracking. Free tier has 7-day trial period.';

-- Migration complete! ✅
-- Test with: SELECT credits_used, credits_limit, account_created_at FROM users LIMIT 5;
