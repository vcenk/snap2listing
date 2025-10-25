import { createClient } from '@/lib/supabase/client';
import type { ListingBase } from '@/lib/types/channels';

export interface PodListingData {
  userId: string;
  title: string;
  description: string;
  productType: 'pod';
  selectedProductType: string; // 't-shirt', 'mug', etc.
  baseDesignUrl?: string;
  mockupUrls: string[];
  mockupTemplateIds?: string[];
  podProvider?: string;
  baseProductSku?: string;
  price?: number;
  tags?: string[];
  category?: string;
}

/**
 * Save a new PoD listing with mockups
 * @param listing PoD listing data
 * @param mockupUrls Array of mockup image URLs
 * @returns Promise with created listing
 */
export async function saveListingWithMockups(
  listing: Partial<ListingBase> & {
    userId: string;
    selectedProductType: string;
  },
  mockupUrls: string[]
) {
  const supabase = createClient();

  const listingData = {
    user_id: listing.userId,
    product_type: 'pod',
    selected_product_type: listing.selectedProductType,
    base_design_url: listing.baseDesignUrl,
    mockup_urls: mockupUrls,
    mockup_template_ids: listing.mockupTemplateIds || [],
    pod_provider: listing.podProvider || 'dynamicmockups',
    base_product_sku: listing.baseProductSku,
    status: 'draft',
    base_data: {
      title: listing.title || '',
      description: listing.description || '',
      price: listing.price || 0,
      category: listing.category || '',
      images: mockupUrls,
      productType: 'pod',
      selectedProductType: listing.selectedProductType,
    },
    selected_channels: [],
    channel_overrides: {},
    ai_generated_base: {},
    seo_score: 0,
    last_step: 'mockup',
  };

  const { data, error } = await supabase
    .from('listings')
    .insert(listingData)
    .select()
    .single();

  if (error) {
    console.error('Failed to save PoD listing:', error);
    throw error;
  }

  return data;
}

/**
 * Update an existing listing with mockups
 * @param listingId Listing ID
 * @param mockupUrls Array of mockup URLs
 * @returns Promise with updated listing
 */
export async function updateListingMockups(
  listingId: string,
  mockupUrls: string[],
  mockupTemplateIds?: string[]
) {
  const supabase = createClient();

  const updateData: any = {
    mockup_urls: mockupUrls,
    updated_at: new Date().toISOString(),
  };

  if (mockupTemplateIds) {
    updateData.mockup_template_ids = mockupTemplateIds;
  }

  // Also update the base_data.images
  const { data: existingListing } = await supabase
    .from('listings')
    .select('base_data')
    .eq('id', listingId)
    .single();

  if (existingListing) {
    updateData.base_data = {
      ...existingListing.base_data,
      images: mockupUrls,
    };
  }

  const { data, error } = await supabase
    .from('listings')
    .update(updateData)
    .eq('id', listingId)
    .select()
    .single();

  if (error) {
    console.error('Failed to update listing mockups:', error);
    throw error;
  }

  return data;
}

/**
 * Get all PoD listings for a user
 * @param userId User ID
 * @returns Promise with array of PoD listings
 */
export async function getPodListings(userId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('user_id', userId)
    .eq('product_type', 'pod')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch PoD listings:', error);
    throw error;
  }

  return data;
}

/**
 * Get PoD listings by product type
 * @param userId User ID
 * @param productType Specific product type (e.g., 't-shirt', 'mug')
 * @returns Promise with array of listings
 */
export async function getPodListingsByProductType(
  userId: string,
  productType: string
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('user_id', userId)
    .eq('product_type', 'pod')
    .eq('selected_product_type', productType)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch PoD listings by product type:', error);
    throw error;
  }

  return data;
}

/**
 * Delete a PoD listing and its mockups
 * @param listingId Listing ID
 * @returns Promise
 */
export async function deletePodListing(listingId: string) {
  const supabase = createClient();

  // TODO: Also delete mockup files from storage if needed

  const { error } = await supabase
    .from('listings')
    .delete()
    .eq('id', listingId);

  if (error) {
    console.error('Failed to delete PoD listing:', error);
    throw error;
  }
}

/**
 * Get PoD statistics for a user
 * @param userId User ID
 * @returns Promise with statistics
 */
export async function getPodStatistics(userId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('listings')
    .select('mockup_urls, selected_product_type')
    .eq('user_id', userId)
    .eq('product_type', 'pod');

  if (error) {
    console.error('Failed to fetch PoD statistics:', error);
    throw error;
  }

  const totalListings = data.length;
  const totalMockups = data.reduce(
    (sum, listing) => sum + (listing.mockup_urls?.length || 0),
    0
  );

  // Count by product type
  const productTypeCounts: Record<string, number> = {};
  data.forEach((listing) => {
    const type = listing.selected_product_type || 'unknown';
    productTypeCounts[type] = (productTypeCounts[type] || 0) + 1;
  });

  return {
    totalListings,
    totalMockups,
    productTypeCounts,
    mostPopularProduct: Object.keys(productTypeCounts).reduce((a, b) =>
      productTypeCounts[a] > productTypeCounts[b] ? a : b
    , 'none'),
  };
}
