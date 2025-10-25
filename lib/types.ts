// Core types for Snap2Listing application

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  negativePrompt?: string;
  upscaled?: boolean;
  aspectRatio?: string;
  altText?: string; // SEO-friendly alt text for the image
  status: 'generating' | 'completed' | 'failed';
  createdAt: string;
}

export interface GeneratedVideo {
  id: string;
  url: string;
  prompt: string;
  baseImageUrl: string;
  baseImageType: 'original' | 'generated';
  status: 'queued' | 'generating' | 'completed' | 'failed';
  progress?: number;
  estimatedTime?: number;
  createdAt: string;
}

export interface AIGeneratedText {
  title: string;
  tags: string[];
  description: string;
}

export interface ListingDraft {
  // Step 1: Upload
  uploadedImage?: string;
  uploadedImageName?: string;
  shortDescription?: string;

  // Step 2: Complete Etsy Details
  // Basic Info
  title?: string;
  description?: string;
  price?: number;
  quantity?: number;
  sku?: string;

  // Etsy Category (taxonomy_id from Etsy API)
  taxonomy_id?: number;
  category_path?: string; // Human-readable path like "Home & Living > Kitchen & Dining"

  // Required Etsy Fields
  item_type?: ItemType; // physical, digital, both
  who_made?: WhoMade; // i_did, collective, someone_else
  what_is_it?: WhatIsIt; // finished_product, supply, tool
  when_made?: WhenMade; // made_to_order, 2020_2024, etc.

  // Tags & Materials
  tags?: string[]; // Max 13 tags
  materials?: string[]; // Max 13 materials

  // Optional Fields
  occasion?: string[]; // e.g., ["Christmas", "Birthday"]
  holiday?: string[]; // e.g., ["Christmas", "Halloween"]
  recipient?: string[]; // e.g., ["Men", "Women", "Children"]
  style?: string[]; // e.g., ["Minimalist", "Bohemian"]

  // Personalization
  is_customizable?: boolean;
  personalization_instructions?: string;
  personalization_char_limit?: number;

  // Production & Processing
  processing_min?: number; // Processing time in days (min)
  processing_max?: number; // Processing time in days (max)
  production_partner_ids?: number[];

  // Variations/Attributes (e.g., Size, Color)
  variations?: ProductVariation[];
  has_variations?: boolean;

  // Step 3: Images
  images?: GeneratedImage[];

  // Step 4: Video
  video?: GeneratedVideo;

  // Metadata
  currentStep: number;
  lastSaved?: string;
}

export interface Listing {
  id: string;
  userId: string;
  shopId?: string;

  // Basic Info
  title: string;
  description: string;
  price: number;
  quantity: number;
  sku?: string;

  // Etsy Category
  taxonomy_id?: number;
  category_path?: string;

  // Required Etsy Fields
  item_type: ItemType;
  who_made: WhoMade;
  what_is_it: WhatIsIt;
  when_made: WhenMade;

  // Tags & Materials
  tags: string[];
  materials?: string[];

  // Optional Classification
  occasion?: string[];
  holiday?: string[];
  recipient?: string[];
  style?: string[];

  // Personalization
  is_customizable?: boolean;
  personalization_instructions?: string;
  personalization_char_limit?: number;

  // Production & Processing
  processing_min?: number;
  processing_max?: number;

  // Variations
  variations?: ProductVariation[];
  has_variations?: boolean;

  // Media
  images: GeneratedImage[];
  video?: GeneratedVideo;
  originalImage: string;

  // Status
  status: 'draft' | 'ready' | 'published' | 'archived';
  publishedAt?: string;
  etsyListingId?: string;

  // Metadata
  createdAt: string;
  updatedAt: string;

  // Usage tracking
  imagesCount: number;
  videosCount: number;
}

// Etsy Taxonomy (Category) structure
export interface EtsyTaxonomy {
  id: number;
  level: number;
  name: string;
  parent_id?: number;
  path: string;
  children?: EtsyTaxonomy[];
}

export interface EtsyShop {
  id: string;
  userId: string;
  shopId: string;
  shopName: string;
  status: 'connected' | 'disconnected' | 'error';
  accessToken?: string;
  refreshToken?: string;
  connectedAt: string;
  lastSync?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;

  // Subscription
  planId: string;
  subscriptionStatus: 'active' | 'canceled' | 'past_due' | 'trialing';

  // Usage tracking (current billing period)
  imagesUsed: number;
  videosUsed: number;
  billingPeriodStart: string;
  billingPeriodEnd: string;

  // Metadata
  createdAt: string;
  lastLogin?: string;
}

export interface UsageStats {
  imagesUsed: number;
  imagesLimit: number;
  videosUsed: number;
  videosLimit: number;
  listingsCount: number;
  publishedCount: number;
  shopsCount: number;
  currentPlan: string;
}

// API Response types
export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface GenerateTextResponse {
  title: string;
  tags: string[];
  description: string;
}

export interface GenerateImageResponse {
  id: string;
  url: string;
  prompt: string;
  status: 'completed' | 'failed';
  createdAt: string;
}

export interface GenerateVideoResponse {
  id: string;
  requestId: string;
  status: 'queued' | 'generating' | 'completed' | 'failed';
  url?: string;
  progress?: number;
  estimatedTime?: number;
}

export interface VideoStatusResponse {
  id: string;
  status: 'queued' | 'generating' | 'completed' | 'failed';
  url?: string;
  progress?: number;
  error?: string;
}

// Form types
export interface ImageGenerationForm {
  prompt: string;
  negativePrompt?: string;
  upscale?: boolean;
  aspectRatio?: '1:1' | '4:3' | '16:9' | '3:4' | '9:16';
}

export interface VideoGenerationForm {
  baseImageType: 'original' | 'generated';
  selectedImageId?: string;
  prompt: string;
}

// Wizard step type
export type WizardStep = 1 | 2 | 3 | 4 | 5;

// Etsy Product Type (Item Type)
export const ITEM_TYPES = ['physical', 'digital', 'both'] as const;
export type ItemType = typeof ITEM_TYPES[number];

// Who Made It
export const WHO_MADE_OPTIONS = [
  'i_did',
  'collective',
  'someone_else',
] as const;
export type WhoMade = typeof WHO_MADE_OPTIONS[number];

export const WHO_MADE_LABELS: Record<WhoMade, string> = {
  i_did: 'I did',
  collective: 'A member of my shop',
  someone_else: 'Another company or person',
};

// What Is It
export const WHAT_IS_IT_OPTIONS = [
  'finished_product',
  'supply',
  'tool',
] as const;
export type WhatIsIt = typeof WHAT_IS_IT_OPTIONS[number];

export const WHAT_IS_IT_LABELS: Record<WhatIsIt, string> = {
  finished_product: 'A finished product',
  supply: 'A supply or tool to make things',
  tool: 'A tool to make things',
};

// When Was It Made
export const WHEN_MADE_OPTIONS = [
  'made_to_order',
  '2020_2025',
  '2010_2019',
  '2000_2009',
  'before_2000',
  '1990s',
  '1980s',
  '1970s',
  '1960s',
  '1950s',
  '1940s',
  '1930s',
  '1920s',
  '1910s',
  '1900s',
  '1800s',
  '1700s',
  'before_1700',
] as const;
export type WhenMade = typeof WHEN_MADE_OPTIONS[number];

export const WHEN_MADE_LABELS: Record<WhenMade, string> = {
  made_to_order: 'Made to order',
  '2020_2025': '2020-2025',
  '2010_2019': '2010-2019',
  '2000_2009': '2000-2009',
  'before_2000': 'Before 2000',
  '1990s': '1990s',
  '1980s': '1980s',
  '1970s': '1970s',
  '1960s': '1960s',
  '1950s': '1950s',
  '1940s': '1940s',
  '1930s': '1930s',
  '1920s': '1920s',
  '1910s': '1910s',
  '1900s': '1900s',
  '1800s': '1800s',
  '1700s': '1700s',
  'before_1700': 'Before 1700',
};

// Renewal Options
export const RENEWAL_OPTIONS = ['auto', 'manual', 'none'] as const;
export type RenewalOption = typeof RENEWAL_OPTIONS[number];

// Product variations/attributes
export interface ProductVariation {
  property_id: number;
  property_name: string; // e.g., "Size", "Color"
  value_id?: number;
  value: string; // e.g., "Small", "Blue"
  price_modifier?: number; // Additional price for this variant
  quantity?: number; // Quantity available for this variant
}

export interface ProductAttribute {
  property_id: number;
  property_name: string;
  values: string[];
  scale_id?: number;
}
