// Pricing configuration for Snap2Listing
// Credit-based system for all AI operations
// INTERNAL ONLY - Costs and margins not shown to users

export const CREDIT_COSTS = {
  // Media generation (all cost 3 credits)
  imageGeneration: 3,        // Image generation with prompt
  videoGeneration: 3,        // 5-second video generation
  mockupDownload: 3,         // Mockup template download

  // Text generation (all FREE - unlimited)
  aiPromptSuggestion: 0,     // AI prompt suggestions for images
  seoContentPerChannel: 0,   // SEO content generation per marketplace
  titleGeneration: 0,        // Title generation
  descriptionGeneration: 0,  // Description generation
  tagsGeneration: 0,         // Tags generation
} as const;

export const UNIT_COSTS = {
  image: 0.075,              // FAL.ai average cost per image
  video: 0.30,               // FAL.ai average cost per video
  text: 0.01,                // OpenAI cost per text generation
  mockup: 0.05,              // Dynamic Mockups API cost
} as const;

export const OVERAGE_PRICING = {
  small: {
    price: 10,
    credits: 300,
  },
  large: {
    price: 25,
    credits: 900,
  },
} as const;

export interface Plan {
  id: string;
  name: string;
  tagline: string;           // Marketing tagline
  price: number;             // monthly price in dollars
  yearlyPrice: number;       // yearly price (20% discount)
  credits: number;           // included credits per month
  trialDays?: number;        // trial period in days (only for free plan)
  features: string[];        // Feature list for UI
  planSpecificFeatures?: string[]; // Features unique to this plan
  popular?: boolean;
  color: string;             // UI color theme
  icon: string;              // Emoji icon
  maxBrandKits?: number;     // Max brand kits
  maxTeamSeats?: number;     // Max team seats
}

// Shared features across all plans
export const SHARED_FEATURES = [
  '6 Marketplace Integrations',
  'Amazon, Etsy, TikTok, Facebook, eBay, Shopify',
  'AI Image Generation with Smart Prompts',
  'SEO-Optimized Listings per Marketplace',
  '5-Second Product Videos',
  '1,000+ Professional Mockup Templates',
  'ZIP & CSV Export (bulk download)',
  'Watermark-free HD exports',
];

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'Try the full dashboard',
    price: 0,
    yearlyPrice: 0,
    credits: 15,
    trialDays: 7,
    features: [
      '15 credits • 7-day trial',
      '1 complete listing (image + mockup + video)',
      '✨ Unlimited SEO content',
      'AI prompt suggestions (FREE)',
      '6 marketplace support',
      'Full dashboard access',
      'HD watermark-free exports',
      '1,000+ mockup templates',
    ],
    color: '#9E9E9E',
    icon: '🚀',
  },
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'Solo sellers launching new products',
    price: 19,
    yearlyPrice: 190,
    credits: 300,
    maxBrandKits: 1,
    features: [
      '300 credits/month',
      '33 complete listings/month',
      '✨ Unlimited SEO for all 6 marketplaces',
      'Amazon, Etsy, TikTok, Shopify, eBay, Facebook',
      'AI prompt suggestions (FREE)',
      '1,000+ mockup templates',
      'HD watermark-free exports',
      'ZIP & CSV bulk export',
      '1 Brand Kit',
      'Community support',
    ],
    color: '#2196F3',
    icon: '📈',
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'Growing e-commerce brands',
    price: 39,
    yearlyPrice: 390,
    credits: 750,
    maxBrandKits: 3,
    features: [
      '750 credits/month',
      '83 complete listings/month',
      '✨ Unlimited SEO + AI text generation',
      'Everything in Starter, plus:',
      'Multi-marketplace optimization',
      'A/B testing for titles & tags',
      'Advanced analytics dashboard',
      '3 Brand Kits',
      'Priority generation queue',
      'ZIP & CSV bulk export',
      'Email support (24h response)',
    ],
    popular: true,
    color: '#FF9800',
    icon: '⭐',
  },
  {
    id: 'growth',
    name: 'Growth',
    tagline: 'Scaling brands ($50K-200K revenue)',
    price: 49,
    yearlyPrice: 490,
    credits: 900,
    maxBrandKits: 5,
    maxTeamSeats: 2,
    features: [
      '900 credits/month',
      '100 complete listings/month',
      '✨ Unlimited SEO content',
      'Everything in Pro, plus:',
      'Batch processing (up to 50 SKUs)',
      'Advanced performance analytics',
      '5 Brand Kits',
      '2 Team Seats',
      'Shared brand assets',
      'Priority support (12h response)',
      'Custom integrations',
    ],
    color: '#9C27B0',
    icon: '🚀',
  },
  {
    id: 'business',
    name: 'Business',
    tagline: 'Agencies & teams managing multiple brands',
    price: 79,
    yearlyPrice: 790,
    credits: 1800,
    maxBrandKits: -1, // unlimited
    maxTeamSeats: 5,
    features: [
      '1,800 credits/month',
      '200 complete listings/month',
      '✨ Unlimited SEO content',
      'Everything in Growth, plus:',
      'Unlimited Brand Kits',
      '5 Team Seats',
      'Shared brand assets & templates',
      'Version history & rollback',
      'Custom template library',
      'Dedicated account manager',
      'Priority support (4h response)',
      'White-label options',
    ],
    color: '#1976D2',
    icon: '👑',
  },
];

// Get plan by ID
export function getPlanById(id: string): Plan | undefined {
  return PLANS.find(plan => plan.id === id);
}

// Check if user has exceeded their plan limits
export function checkCreditLimits(
  plan: Plan,
  creditsUsed: number
): {
  creditsRemaining: number;
  creditsExceeded: boolean;
  percentageUsed: number;
} {
  const creditsRemaining = Math.max(0, plan.credits - creditsUsed);
  const percentageUsed = plan.credits > 0 ? Math.min(100, (creditsUsed / plan.credits) * 100) : 0;

  return {
    creditsRemaining,
    creditsExceeded: creditsUsed > plan.credits,
    percentageUsed,
  };
}

// Calculate what a user can do with remaining credits
export function calculateCreditBreakdown(creditsRemaining: number): {
  images: number;
  mockups: number;
  videos: number;
  completeListings: number;
} {
  // Complete listing = 1 image (3) + 1 mockup (3) + 1 video (3) + SEO for 6 marketplaces (0) = 9 credits
  const COMPLETE_LISTING_COST =
    CREDIT_COSTS.imageGeneration +
    CREDIT_COSTS.mockupDownload +
    CREDIT_COSTS.videoGeneration +
    (CREDIT_COSTS.seoContentPerChannel * 6);

  return {
    images: Math.floor(creditsRemaining / CREDIT_COSTS.imageGeneration),
    mockups: Math.floor(creditsRemaining / CREDIT_COSTS.mockupDownload),
    videos: Math.floor(creditsRemaining / CREDIT_COSTS.videoGeneration),
    completeListings: Math.floor(creditsRemaining / COMPLETE_LISTING_COST),
  };
}

// Check if free trial has expired
export function isTrialExpired(accountCreatedAt: Date, plan: Plan): boolean {
  if (plan.id !== 'free' || !plan.trialDays) {
    return false;
  }

  const now = new Date();
  const daysElapsed = Math.floor((now.getTime() - accountCreatedAt.getTime()) / (1000 * 60 * 60 * 24));
  return daysElapsed >= plan.trialDays;
}

// Get days remaining in trial
export function getTrialDaysRemaining(accountCreatedAt: Date, plan: Plan): number {
  if (plan.id !== 'free' || !plan.trialDays) {
    return 0;
  }

  const now = new Date();
  const daysElapsed = Math.floor((now.getTime() - accountCreatedAt.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, plan.trialDays - daysElapsed);
}
