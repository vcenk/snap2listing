import { createClient } from '@supabase/supabase-js';

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ilxbhpasdaryezbqgzcl.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database types
export interface User {
  id: string;
  email: string;
  name?: string;
  plan_id: string;
  subscription_status: 'active' | 'canceled' | 'past_due' | 'trialing';
  images_used: number;
  videos_used: number;
  billing_period_start: string;
  billing_period_end: string;
  created_at: string;
  updated_at: string;
}

export interface Listing {
  id: string;
  user_id: string;
  shop_id?: string;
  title: string;
  description: string;
  tags: string[];
  price: number;
  category: string;
  images: any[]; // Array of GeneratedImage
  video?: any; // GeneratedVideo
  original_image: string;
  status: 'draft' | 'ready' | 'published' | 'archived';
  published_at?: string;
  etsy_listing_id?: string;
  images_count: number;
  videos_count: number;
  created_at: string;
  updated_at: string;
}

export interface Shop {
  id: string;
  user_id: string;
  shop_id: string;
  shop_name: string;
  status: 'connected' | 'disconnected' | 'error';
  access_token?: string;
  refresh_token?: string;
  connected_at: string;
  last_sync?: string;
}

// Helper functions
export async function getUser(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }

  return data as User;
}

export async function updateUserUsage(
  userId: string,
  imagesIncrement: number = 0,
  videosIncrement: number = 0
): Promise<void> {
  const { error } = await supabase.rpc('increment_usage', {
    p_user_id: userId,
    p_images: imagesIncrement,
    p_videos: videosIncrement,
  });

  if (error) {
    console.error('Error updating usage:', error);
    throw new Error('Failed to update usage');
  }
}

export async function createListing(listing: Omit<Listing, 'id' | 'created_at' | 'updated_at'>): Promise<Listing> {
  const { data, error } = await supabase
    .from('listings')
    .insert(listing)
    .select()
    .single();

  if (error) {
    console.error('Error creating listing:', error);
    throw new Error('Failed to create listing');
  }

  return data as Listing;
}

export async function getListings(userId: string): Promise<Listing[]> {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching listings:', error);
    return [];
  }

  return data as Listing[];
}

export async function updateListing(id: string, updates: Partial<Listing>): Promise<void> {
  const { error } = await supabase
    .from('listings')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Error updating listing:', error);
    throw new Error('Failed to update listing');
  }
}

export async function deleteListing(id: string): Promise<void> {
  const { error } = await supabase
    .from('listings')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting listing:', error);
    throw new Error('Failed to delete listing');
  }
}

export async function getShops(userId: string): Promise<Shop[]> {
  const { data, error } = await supabase
    .from('shops')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching shops:', error);
    return [];
  }

  return data as Shop[];
}
