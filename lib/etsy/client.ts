// Etsy API v3 Client
// Documentation: https://developers.etsy.com/documentation/

const ETSY_API_BASE = 'https://openapi.etsy.com/v3';

export interface EtsyOAuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export interface EtsyShopInfo {
  shop_id: number;
  shop_name: string;
  user_id: number;
}

/**
 * Get Etsy OAuth authorization URL
 */
export function getEtsyAuthUrl(state: string): string {
  const clientId = process.env.ETSY_CLIENT_ID;
  const redirectUri = process.env.ETSY_REDIRECT_URI;

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId!,
    redirect_uri: redirectUri!,
    scope: 'listings_w listings_r shops_r',
    state,
  });

  return `https://www.etsy.com/oauth/connect?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(code: string): Promise<EtsyOAuthTokens> {
  const clientId = process.env.ETSY_CLIENT_ID!;
  const clientSecret = process.env.ETSY_CLIENT_SECRET!;
  const redirectUri = process.env.ETSY_REDIRECT_URI!;

  const response = await fetch('https://api.etsy.com/v3/public/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Etsy token exchange failed: ${error}`);
  }

  return response.json();
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(refreshToken: string): Promise<EtsyOAuthTokens> {
  const clientId = process.env.ETSY_CLIENT_ID!;
  const clientSecret = process.env.ETSY_CLIENT_SECRET!;

  const response = await fetch('https://api.etsy.com/v3/public/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh Etsy access token');
  }

  return response.json();
}

/**
 * Get user's shops
 */
export async function getUserShops(accessToken: string): Promise<EtsyShopInfo[]> {
  const response = await fetch(`${ETSY_API_BASE}/application/users/me`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'x-api-key': process.env.ETSY_CLIENT_ID!,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch Etsy user shops');
  }

  const data = await response.json();

  // Get shop details
  const shopsResponse = await fetch(`${ETSY_API_BASE}/application/shops?user_id=${data.user_id}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'x-api-key': process.env.ETSY_CLIENT_ID!,
    },
  });

  if (!shopsResponse.ok) {
    throw new Error('Failed to fetch shop details');
  }

  const shopsData = await shopsResponse.json();
  return shopsData.results || [];
}

/**
 * Create a draft listing on Etsy
 */
export async function createEtsyListing(
  accessToken: string,
  shopId: number,
  listingData: {
    title: string;
    description: string;
    price: number;
    quantity: number;
    taxonomy_id: number;
    tags: string[];
    materials?: string[];
    who_made: string;
    when_made: string;
    shipping_profile_id?: number;
  }
): Promise<any> {
  const response = await fetch(`${ETSY_API_BASE}/application/shops/${shopId}/listings`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'x-api-key': process.env.ETSY_CLIENT_ID!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...listingData,
      type: 'physical',
      state: 'draft',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create Etsy listing: ${error}`);
  }

  return response.json();
}

/**
 * Upload image to Etsy listing
 */
export async function uploadListingImage(
  accessToken: string,
  shopId: number,
  listingId: number,
  imageUrl: string,
  rank: number = 1
): Promise<any> {
  // Download image from URL
  const imageResponse = await fetch(imageUrl);
  const imageBlob = await imageResponse.blob();

  const formData = new FormData();
  formData.append('image', imageBlob);
  formData.append('rank', rank.toString());

  const response = await fetch(
    `${ETSY_API_BASE}/application/shops/${shopId}/listings/${listingId}/images`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'x-api-key': process.env.ETSY_CLIENT_ID!,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to upload image: ${error}`);
  }

  return response.json();
}

/**
 * Upload video to Etsy listing
 */
export async function uploadListingVideo(
  accessToken: string,
  shopId: number,
  listingId: number,
  videoUrl: string
): Promise<any> {
  // Download video from URL
  const videoResponse = await fetch(videoUrl);
  const videoBlob = await videoResponse.blob();

  const formData = new FormData();
  formData.append('video', videoBlob);

  const response = await fetch(
    `${ETSY_API_BASE}/application/shops/${shopId}/listings/${listingId}/videos`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'x-api-key': process.env.ETSY_CLIENT_ID!,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error('Failed to upload video:', error);
    // Don't throw - video upload is optional
    return null;
  }

  return response.json();
}

/**
 * Publish a draft listing (make it active)
 */
export async function publishListing(
  accessToken: string,
  shopId: number,
  listingId: number
): Promise<any> {
  const response = await fetch(
    `${ETSY_API_BASE}/application/shops/${shopId}/listings/${listingId}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'x-api-key': process.env.ETSY_CLIENT_ID!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        state: 'active',
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to publish listing: ${error}`);
  }

  return response.json();
}
