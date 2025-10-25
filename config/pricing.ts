// Pricing configuration for Snap2Listing
// Based on images/videos usage model
// INTERNAL ONLY - Costs and margins not shown to users

export const UNIT_COSTS = {
  image: 0.075, // FAL.ai average cost per image
  video: 0.30,  // FAL.ai average cost per video
  text: 0.01,   // OpenAI cost per text generation
} as const;

export const OVERAGE_PRICING = {
  image: 0.50, // $10 per 20 images
  video: 5.00, // $10 per 2 videos
} as const;

export interface Plan {
  id: string;
  name: string;
  tagline: string; // Marketing tagline
  price: number; // monthly price in dollars
  yearlyPrice: number; // yearly price (20% discount)
  images: number; // included images per month
  videos: number; // included videos per month
  shops: number; // max Etsy shops (-1 = unlimited)
  features: string[]; // Feature list for UI
  popular?: boolean;
  color: string; // UI color theme
  icon: string; // Emoji icon
}

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Try It Out',
    tagline: 'Perfect for testing the waters',
    price: 0,
    yearlyPrice: 0,
    images: 15,
    videos: 1,
    shops: 1,
    features: [
      '15 AI-generated images',
      '1 AI-generated video',
      'Unlimited titles & descriptions',
      'Unlimited AI-powered tags',
      'Unlimited materials suggestions',
      '1 Etsy shop connection',
      'Basic support',
    ],
    color: '#9E9E9E',
    icon: '🚀',
  },
  {
    id: 'starter',
    name: 'Launch Your Shop',
    tagline: 'Hit the ground running',
    price: 19,
    yearlyPrice: 190,
    images: 100,
    videos: 5,
    shops: 3,
    features: [
      '100 AI-generated images',
      '5 AI-generated videos',
      'Unlimited titles & descriptions',
      'Unlimited AI-powered tags',
      'Unlimited materials suggestions',
      '3 Etsy shop connections',
      'HD image upscaling',
      'Priority support',
    ],
    color: '#2196F3',
    icon: '📈',
  },
  {
    id: 'pro',
    name: 'Scale Your Business',
    tagline: 'For serious sellers',
    price: 49,
    yearlyPrice: 490,
    images: 300,
    videos: 15,
    shops: -1,
    features: [
      '300 AI-generated images',
      '15 AI-generated videos',
      'Unlimited titles & descriptions',
      'Unlimited AI-powered tags',
      'Unlimited materials suggestions',
      'Unlimited Etsy shop connections',
      'HD image upscaling',
      'Bulk listing export',
      'Advanced analytics',
      'Priority support',
    ],
    popular: true,
    color: '#FF9800',
    icon: '⭐',
  },
  {
    id: 'enterprise',
    name: 'Dominate Your Niche',
    tagline: 'Maximum creative power',
    price: 129,
    yearlyPrice: 1290,
    images: 1000,
    videos: 50,
    shops: -1,
    features: [
      '1,000 AI-generated images',
      '50 AI-generated videos',
      'Unlimited titles & descriptions',
      'Unlimited AI-powered tags',
      'Unlimited materials suggestions',
      'Unlimited Etsy shop connections',
      'HD image upscaling',
      'Bulk listing export',
      'Advanced analytics',
      'API access',
      'White-label option',
      'Dedicated support',
    ],
    color: '#9C27B0',
    icon: '👑',
  },
];

// Get plan by ID
export function getPlanById(id: string): Plan | undefined {
  return PLANS.find(plan => plan.id === id);
}

// Check if user has exceeded their plan limits
export function checkUsageLimits(
  plan: Plan,
  imagesUsed: number,
  videosUsed: number
): {
  imagesRemaining: number;
  videosRemaining: number;
  imagesExceeded: boolean;
  videosExceeded: boolean;
} {
  const imagesRemaining = Math.max(0, plan.images - imagesUsed);
  const videosRemaining = Math.max(0, plan.videos - videosUsed);

  return {
    imagesRemaining,
    videosRemaining,
    imagesExceeded: imagesUsed > plan.images,
    videosExceeded: videosUsed > plan.videos,
  };
}

// Calculate overage charges (for billing)
export function calculateOverageCharges(
  plan: Plan,
  imagesUsed: number,
  videosUsed: number
): { imageOverage: number; videoOverage: number; totalCharge: number } {
  const imageOverage = Math.max(0, imagesUsed - plan.images);
  const videoOverage = Math.max(0, videosUsed - plan.videos);

  const totalCharge =
    imageOverage * OVERAGE_PRICING.image +
    videoOverage * OVERAGE_PRICING.video;

  return {
    imageOverage,
    videoOverage,
    totalCharge,
  };
}
