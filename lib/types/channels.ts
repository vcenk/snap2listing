// ============================================
// MULTI-CHANNEL TYPE DEFINITIONS
// ============================================
// Core types for multi-channel export platform
// Author: Claude Code Migration Team
// Date: 2025-10-15

// ============================================
// CHANNEL CONFIGURATION TYPES
// ============================================

export interface Channel {
  id: string;
  name: string;
  slug: string;
  config: ChannelConfig;
  validationRules: ValidationRules;
  exportFormat: string;
  createdAt?: string;
}

export interface ChannelConfig {
  fields?: string[];
  description?: string;
  requiredFields?: string[];
  maxLengths?: Record<string, number>;
  maxTitleLength?: number;
  maxDescriptionLength?: number;
  maxTags?: number;
  maxBullets?: number;
  customRules?: Record<string, any>;
  [key: string]: any; // Allow additional properties from database
}

export interface ValidationRules {
  title?: {
    required?: boolean;
    maxLength?: number;
    minLength?: number;
  };
  description?: {
    required?: boolean;
    maxLength?: number;
    minLength?: number;
  };
  tags?: {
    min?: number;
    max?: number;
    required?: boolean;
  };
  images?: {
    min?: number;
    max?: number;
    required?: boolean;
  };
  bullets?: {
    required?: boolean;
    count?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
  };
  price?: {
    required?: boolean;
    min?: number;
    max?: number;
  };
  category?: {
    required?: boolean;
  };
  materials?: {
    max?: number;
  };
  video?: {
    recommended?: boolean;
    required?: boolean;
  };
  condition?: {
    required?: boolean;
    allowed?: string[];
  };
  availability?: {
    required?: boolean;
  };
  [key: string]: any; // Allow additional validation rules
}

// ============================================
// LISTING DATA TYPES
// ============================================

export interface ImageMetadata {
  url: string;
  altText?: string;
  prompt?: string;
  position?: number;
}

export interface ListingBase {
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];  // Array of URLs (for backward compatibility)
  imageMetadata?: ImageMetadata[];  // Array of image metadata including alt text
  video?: string;
  originalImage?: string;
  quantity?: number;
  sku?: string;
  materials?: string[];
  productType?: 'physical' | 'digital' | 'pod';
  // PoD-specific fields
  podProvider?: string;            // 'printful', 'printify', 'dynamicmockups', etc.
  mockupTemplateId?: string;       // External mockup template ID (deprecated - use mockupTemplateIds)
  baseProductSku?: string;         // Base product SKU (e.g., 't-shirt-white-m')
  // Mockup-related fields
  mockupUrls?: string[];           // Generated mockup images from Dynamic Mockups
  baseDesignUrl?: string;          // Original design file URL
  mockupTemplateIds?: string[];    // Array of template IDs used
  selectedProductType?: string;    // Specific PoD product (e.g., 't-shirt', 'mug')
}

export interface ChannelOverride {
  channelId: string;
  channelSlug: string;
  title?: string;
  description?: string;
  tags?: string[];
  bullets?: string[];
  materials?: string[];
  customFields?: Record<string, any>;
  validationState?: ValidationResult;
  readinessScore?: number;
  isReady?: boolean;
  exportedAt?: string;
}

export interface ListingData {
  id?: string;
  userId: string;
  status: 'draft' | 'optimized' | 'completed';
  base: ListingBase;
  channels: ChannelOverride[];
  seoScore: number;
  keywords?: Keyword[];
  lastStep?: string;
  lastChannelTab?: string;
  scrollPosition?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ListingImage {
  id?: string;
  listingId: string;
  url: string;
  position: number;
  isMain: boolean;
  metadata?: Record<string, any>;
  createdAt?: string;
}

export interface ListingVersion {
  id?: string;
  listingId: string;
  versionNumber: number;
  snapshotData: any;
  seoScore?: number;
  createdAt?: string;
}

// ============================================
// KEYWORD TYPES
// ============================================

export interface Keyword {
  id?: string;
  listingId?: string;
  keyword: string;
  type: 'longtail' | 'autosuggest' | 'manual';
  source?: string;
  category?: 'material' | 'style' | 'audience' | 'occasion' | 'problem' | 'modifier';
  placements: string[];
  createdAt?: string;
}

export interface GroupedKeywords {
  material: string[];
  style: string[];
  audience: string[];
  occasion: string[];
  problem: string[];
  modifier: string[];
}

export interface KeywordPlacement {
  keyword: string;
  locations: ('title' | 'description' | 'bullets' | 'tags')[];
  count: number;
}

// ============================================
// VALIDATION TYPES
// ============================================

export interface ValidationResult {
  isReady: boolean;
  isValid?: boolean;
  errors: string[];
  warnings: string[];
  score?: number;
  channelId?: string;
  channelName?: string;
}

export interface PreflightCheck {
  name: string;
  description: string;
  status: 'pass' | 'fail' | 'warning';
  message?: string;
}

// ============================================
// EXPORT TYPES
// ============================================

export interface ExportFile {
  fileName: string;
  contentType: string;
  content: string | Buffer;
  encoding?: string;
}

export interface ExportLog {
  id?: string;
  listingId: string;
  channelId: string;
  format: string;
  fileName: string;
  exportedData?: any;
  createdAt?: string;
}

// ============================================
// SEO TYPES
// ============================================

export interface SEOResponse {
  base: {
    title: string;
    description: string;
    bullets?: string[];
  };
  channels: Record<string, {
    title?: string;
    tags?: string[];
    bullets?: string[];
    overrides?: any;
  }>;
  seo: {
    score: number;
    issues: string[];
    fixes: string[];
  };
  keywords: {
    primary: string[];
    longtail: string[];
    placements: Record<string, string[]>;
  };
}

export interface SEOBrainConfig {
  model: 'gpt-4' | 'gpt-4-turbo';
  passes: {
    draft: {
      temperature: number;
      maxTokens: number;
    };
    optimize: {
      temperature: number;
      maxTokens: number;
    };
  };
}

// ============================================
// WIZARD STATE TYPES
// ============================================

export interface WizardState {
  listingId?: string;
  lastStep: string;
  activeChannelTab: string;
  scrollAnchor: number;
  timestamps: Record<string, Date>;
  data: {
    base: ListingBase;
    channels: ChannelOverride[];
    images: ListingImage[];
    seo: any;
    validators: Record<string, ValidationResult>;
  };
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: string[];
}

export interface ChannelsResponse {
  channels: Channel[];
}

export interface ListingResponse {
  listing: ListingData;
}

export interface ExportResponse {
  file: {
    name: string;
    content: string;
    contentType: string;
  };
}

// ============================================
// HELPER TYPE GUARDS
// ============================================

export function isChannel(obj: any): obj is Channel {
  return (
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.slug === 'string' &&
    typeof obj.config === 'object' &&
    typeof obj.validationRules === 'object' &&
    typeof obj.exportFormat === 'string'
  );
}

export function isListingData(obj: any): obj is ListingData {
  return (
    typeof obj === 'object' &&
    typeof obj.userId === 'string' &&
    typeof obj.status === 'string' &&
    typeof obj.base === 'object' &&
    Array.isArray(obj.channels)
  );
}

export function isValidationResult(obj: any): obj is ValidationResult {
  return (
    typeof obj === 'object' &&
    typeof obj.isReady === 'boolean' &&
    Array.isArray(obj.errors) &&
    Array.isArray(obj.warnings)
  );
}

// ============================================
// UTILITY TYPES
// ============================================

export type ChannelSlug = 'shopify' | 'ebay' | 'facebook-ig' | 'amazon' | 'etsy' | 'tiktok';

export type ListingStatus = 'draft' | 'optimized' | 'completed';

export type ProductType = 'physical' | 'digital' | 'pod';

export type KeywordType = 'longtail' | 'autosuggest' | 'manual';

export type KeywordCategory = 'material' | 'style' | 'audience' | 'occasion' | 'problem' | 'modifier';

export type ValidationStatus = 'pass' | 'fail' | 'warning';

// ============================================
// DATABASE MODELS (for Supabase)
// ============================================

export interface ChannelModel {
  id: string;
  name: string;
  slug: string;
  config: any; // JSONB
  validation_rules: any; // JSONB
  export_format: string;
  created_at: string;
}

export interface ListingModel {
  id: string;
  user_id: string;
  status: string;
  product_type?: string; // 'physical', 'digital', or 'pod'
  base_data: any; // JSONB
  seo_score: number;
  last_step: string;
  last_channel_tab: string | null;
  scroll_position: number;
  // PoD-specific fields
  pod_provider?: string | null;
  mockup_template_id?: string | null;
  base_product_sku?: string | null;
  // Mockup fields
  mockup_urls?: string[] | null;
  base_design_url?: string | null;
  mockup_template_ids?: string[] | null;
  selected_product_type?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ListingChannelModel {
  id: string;
  listing_id: string;
  channel_id: string;
  override_data: any; // JSONB
  validation_state: any; // JSONB
  readiness_score: number;
  is_ready: boolean;
  exported_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ListingImageModel {
  id: string;
  listing_id: string;
  url: string;
  position: number;
  is_main: boolean;
  metadata: any; // JSONB
  created_at: string;
}

export interface KeywordModel {
  id: string;
  listing_id: string;
  keyword: string;
  type: string;
  source: string | null;
  category: string | null;
  placements: any; // JSONB
  created_at: string;
}

export interface ExportLogModel {
  id: string;
  listing_id: string;
  channel_id: string;
  format: string;
  file_name: string;
  exported_data: any; // JSONB
  created_at: string;
}

export interface ListingVersionModel {
  id: string;
  listing_id: string;
  version_number: number;
  snapshot_data: any; // JSONB
  seo_score: number | null;
  created_at: string;
}

// ============================================
// CONVERSION HELPERS
// ============================================

export function channelModelToChannel(model: ChannelModel): Channel {
  return {
    id: model.id,
    name: model.name,
    slug: model.slug,
    config: model.config,
    validationRules: model.validation_rules,
    exportFormat: model.export_format,
    createdAt: model.created_at,
  };
}

export function listingModelToListingData(
  model: ListingModel,
  channels: ChannelOverride[],
  images: ListingImage[]
): ListingData {
  return {
    id: model.id,
    userId: model.user_id,
    status: model.status as ListingStatus,
    base: model.base_data,
    channels,
    seoScore: model.seo_score || 0,
    lastStep: model.last_step,
    lastChannelTab: model.last_channel_tab || undefined,
    scrollPosition: model.scroll_position,
    createdAt: model.created_at,
    updatedAt: model.updated_at,
  };
}

export function listingChannelModelToOverride(model: ListingChannelModel): ChannelOverride {
  return {
    channelId: model.channel_id,
    channelSlug: model.override_data.channelSlug || '',
    title: model.override_data.title,
    description: model.override_data.description,
    tags: model.override_data.tags,
    bullets: model.override_data.bullets,
    materials: model.override_data.materials,
    customFields: model.override_data.customFields,
    validationState: model.validation_state,
    readinessScore: model.readiness_score,
    isReady: model.is_ready,
    exportedAt: model.exported_at || undefined,
  };
}
