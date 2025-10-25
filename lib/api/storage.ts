import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Extract account ID from the URL if it's in that format
const getAccountId = (accountIdOrUrl: string) => {
  if (accountIdOrUrl.includes('r2.cloudflarestorage.com')) {
    const match = accountIdOrUrl.match(/https:\/\/([^.]+)\.r2\.cloudflarestorage\.com/);
    return match ? match[1] : accountIdOrUrl;
  }
  return accountIdOrUrl;
};

const accountId = getAccountId(process.env.R2_ACCOUNT_ID || '');

// Initialize R2 client (compatible with S3 API)
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'snap2listing';
const PUBLIC_URL = process.env.R2_PUBLIC_URL || '';

/**
 * Upload a file to R2 storage
 */
export async function uploadToR2(
  file: Buffer | Uint8Array | Blob,
  key: string,
  contentType: string
): Promise<string> {
  try {
    console.log('📤 [R2] Uploading to bucket:', BUCKET_NAME);
    console.log('   Key:', key);
    console.log('   Content Type:', contentType);
    console.log('   Endpoint:', `https://${accountId}.r2.cloudflarestorage.com`);
    console.log('   Public URL base:', PUBLIC_URL);

    // Validate configuration
    if (!accountId || accountId === '') {
      throw new Error('R2_ACCOUNT_ID is not configured');
    }
    if (!process.env.R2_ACCESS_KEY_ID) {
      throw new Error('R2_ACCESS_KEY_ID is not configured');
    }
    if (!process.env.R2_SECRET_ACCESS_KEY) {
      throw new Error('R2_SECRET_ACCESS_KEY is not configured');
    }
    if (!BUCKET_NAME) {
      throw new Error('R2_BUCKET_NAME is not configured');
    }

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
    });

    console.log('📡 [R2] Sending upload command...');
    await r2Client.send(command);

    // Return public URL
    const publicUrl = `${PUBLIC_URL}/${key}`;
    console.log('✅ [R2] Upload successful! Public URL:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('❌ [R2] Error uploading to R2:', error);
    if (error instanceof Error) {
      console.error('   Error name:', error.name);
      console.error('   Error message:', error.message);
      console.error('   Error stack:', error.stack);
    }
    throw new Error(`Failed to upload file to storage: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Upload a base64 image to R2
 */
export async function uploadBase64Image(
  base64Data: string,
  fileName: string
): Promise<string> {
  try {
    console.log('📥 [Storage] uploadBase64Image called');
    console.log('   File name:', fileName);
    console.log('   Base64 length:', base64Data.length);
    console.log('   Base64 prefix:', base64Data.substring(0, 100));

    // Detect content type from base64 prefix BEFORE removing it
    let contentType = 'image/png'; // Default to PNG for mockups
    if (base64Data.startsWith('data:image/png')) {
      contentType = 'image/png';
    } else if (base64Data.startsWith('data:image/jpeg') || base64Data.startsWith('data:image/jpg')) {
      contentType = 'image/jpeg';
    } else if (base64Data.startsWith('data:image/webp')) {
      contentType = 'image/webp';
    } else if (base64Data.startsWith('data:image/gif')) {
      contentType = 'image/gif';
    }

    console.log('   Detected content type:', contentType);

    // Remove data URL prefix if present
    const base64String = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64String, 'base64');

    console.log('   Buffer size:', buffer.length, 'bytes');

    // Verify file extension matches content type
    const fileExt = fileName.split('.').pop()?.toLowerCase();
    console.log('   File extension:', fileExt);
    if (fileExt === 'png' && contentType !== 'image/png') {
      console.warn('⚠️  File extension is .png but content-type is', contentType, '- forcing to image/png');
      contentType = 'image/png';
    }

    console.log('   Final content type:', contentType);

    // Use the fileName as-is if it contains a path, otherwise generate one
    const key = fileName.includes('/') ? fileName : `uploads/${Date.now()}-${fileName}`;
    console.log('   Storage key:', key);

    console.log('📤 [Storage] Uploading to R2...');
    const url = await uploadToR2(buffer, key, contentType);
    console.log('✅ [Storage] Upload successful:', url);

    return url;
  } catch (error) {
    console.error('❌ [Storage] uploadBase64Image failed:', error);
    throw error;
  }
}

/**
 * Upload from URL (for API-generated images/videos)
 */
export async function uploadFromUrl(
  url: string,
  fileName: string,
  contentType: string = 'image/jpeg'
): Promise<string> {
  try {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();

    const key = `generated/${Date.now()}-${fileName}`;
    return uploadToR2(new Uint8Array(buffer), key, contentType);
  } catch (error) {
    console.error('Error uploading from URL:', error);
    throw new Error('Failed to upload file from URL');
  }
}

/**
 * Get a signed URL for private files (if needed)
 */
export async function getSignedDownloadUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return getSignedUrl(r2Client, command, { expiresIn: 3600 }); // 1 hour
}

/**
 * Generate a unique file name
 */
export function generateFileName(originalName: string, prefix: string = ''): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  const extension = originalName.split('.').pop() || 'jpg';
  return `${prefix}${timestamp}-${random}.${extension}`;
}
