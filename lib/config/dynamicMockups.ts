/**
 * Dynamic Mockups Configuration
 *
 * Website Key (Client-side): Used for embed editor - ZqruUQEIF9Hc
 * API Key (Server-side): Used for API calls - stored in DYNAMIC_MOCKUPS_API_KEY
 */

// Debug logging for environment variables
if (typeof window !== 'undefined') {
  console.log('[DynamicMockups Config] NEXT_PUBLIC_DYNAMIC_MOCKUPS_KEY:', process.env.NEXT_PUBLIC_DYNAMIC_MOCKUPS_KEY);
}

export const dynamicMockupsConfig = {
  // Website key for embed editor (client-side, safe to expose)
  websiteKey: process.env.NEXT_PUBLIC_DYNAMIC_MOCKUPS_KEY || 'ZqruUQEIF9Hc',

  // API key for server-side operations (never expose to client)
  // This is accessed via process.env.DYNAMIC_MOCKUPS_API_KEY in server-side code only

  iframeId: 'dm-iframe',
  mode: 'custom' as const, // Changed from 'download' to 'custom' for callback support
  apiUrl: process.env.DYNAMIC_MOCKUPS_API_URL || 'https://api.dynamic-mockups.com',
};

// Verify config on load
if (typeof window !== 'undefined') {
  console.log('[DynamicMockups Config] Final websiteKey:', dynamicMockupsConfig.websiteKey);
  console.log('[DynamicMockups Config] Mode:', dynamicMockupsConfig.mode);
}

// Product categories available in Dynamic Mockups
export const PRODUCT_CATEGORIES = {
  APPAREL: 'apparel',
  HOME_LIVING: 'home-living',
  ACCESSORIES: 'accessories',
  TECH: 'tech',
  STATIONERY: 'stationery',
} as const;

export type ProductCategory = typeof PRODUCT_CATEGORIES[keyof typeof PRODUCT_CATEGORIES];
