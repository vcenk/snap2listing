import { initDynamicMockupsIframe } from '@dynamic-mockups/mockup-editor-sdk';
import { dynamicMockupsConfig } from '@/lib/config/dynamicMockups';

const WEBSITE_KEY = dynamicMockupsConfig.websiteKey;
const IFRAME_ID = dynamicMockupsConfig.iframeId;

export interface DynamicMockupsConfig {
  iframeId: string;
  websiteKey: string;
  mode: 'download' | 'upload';
  onComplete?: (data: any) => void;
  onError?: (error: any) => void;
}

export interface MockupGeneratedEvent {
  type: 'mockup-generated' | 'mockups-ready' | 'download-complete';
  urls?: string[];
  files?: File[];
  data?: any;
}

/**
 * Initialize Dynamic Mockups iframe editor
 * This is just a re-export wrapper
 */
export { initDynamicMockupsIframe as initializeDynamicMockups };

/**
 * Listen for messages from Dynamic Mockups iframe
 * @param onMockupGenerated Callback when mockups are generated
 * @param onError Error callback
 * @returns Cleanup function to remove listener
 */
export function setupDynamicMockupsListener(
  onMockupGenerated: (mockupUrls: string[]) => void,
  onError?: (error: any) => void
): () => void {
  const handleMessage = (event: MessageEvent) => {
    // Log all messages for debugging
    console.log('Dynamic Mockups message received:', event.data);

    // Handle different message types from Dynamic Mockups
    if (!event.data || typeof event.data !== 'object') return;

    const { type, urls, files, data, error } = event.data;

    switch (type) {
      case 'mockup-generated':
      case 'mockups-ready':
      case 'download-complete':
        if (urls && Array.isArray(urls)) {
          onMockupGenerated(urls);
        } else if (files && Array.isArray(files)) {
          // Convert files to URLs if needed
          const fileUrls = files.map((file: File) => URL.createObjectURL(file));
          onMockupGenerated(fileUrls);
        } else if (data?.mockups) {
          onMockupGenerated(data.mockups);
        }
        break;

      case 'error':
      case 'mockup-error':
        console.error('Dynamic Mockups error:', error || data);
        onError?.(error || data || 'Unknown error occurred');
        break;

      case 'editor-ready':
        console.log('Dynamic Mockups editor is ready');
        break;

      case 'editor-closed':
        console.log('Dynamic Mockups editor was closed');
        break;

      default:
        // Log unhandled message types
        console.log('Unhandled Dynamic Mockups message type:', type);
    }
  };

  window.addEventListener('message', handleMessage);

  // Return cleanup function
  return () => {
    window.removeEventListener('message', handleMessage);
  };
}

/**
 * Upload design to Dynamic Mockups
 * Note: This may not be needed if the iframe handles uploads internally
 * @param designFile The design file to upload
 * @returns Promise with design ID
 */
export async function uploadDesignToMockups(
  designFile: File
): Promise<string> {
  const formData = new FormData();
  formData.append('design', designFile);
  formData.append('websiteKey', WEBSITE_KEY);

  try {
    // Note: This endpoint may need to be adjusted based on Dynamic Mockups API
    const response = await fetch(`${dynamicMockupsConfig.apiUrl}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.designId || data.id;
  } catch (error) {
    console.error('Failed to upload design to Dynamic Mockups:', error);
    throw error;
  }
}

/**
 * Detect image format from file signature (magic bytes)
 */
function detectImageFormat(arrayBuffer: ArrayBuffer): string {
  const bytes = new Uint8Array(arrayBuffer);

  // PNG: 89 50 4E 47
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
    return 'image/png';
  }

  // JPEG: FF D8 FF
  if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
    return 'image/jpeg';
  }

  // WebP: RIFF ... WEBP
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
      bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
    return 'image/webp';
  }

  // GIF: 47 49 46
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
    return 'image/gif';
  }

  // Default
  return 'image/png';
}

/**
 * Convert blob to base64 string with correct MIME type
 */
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      // Read blob as array buffer to detect format
      const arrayBuffer = await blob.arrayBuffer();
      const detectedType = detectImageFormat(arrayBuffer);

      console.log('   🔍 Detected image format from magic bytes:', detectedType);
      console.log('   📝 Blob type from server:', blob.type);

      // Convert to base64 with correct MIME type
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          // Replace incorrect MIME type with detected one
          let base64 = reader.result;
          if (base64.startsWith('data:binary/octet-stream') || base64.startsWith('data:application/octet-stream')) {
            base64 = base64.replace(/^data:[^;]+/, `data:${detectedType}`);
            console.log('   ✅ Fixed MIME type in data URL');
          }
          console.log('   📝 Final data URL prefix:', base64.substring(0, 50));
          resolve(base64);
        } else {
          reject(new Error('Failed to convert blob to base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Save generated mockup to our storage (R2/S3)
 * @param mockupUrl URL of the mockup from Dynamic Mockups
 * @param userId User ID for organizing files
 * @param listingId Listing ID for organizing files
 * @returns Promise with stored URL
 */
export async function saveMockupToStorage(
  mockupUrl: string,
  userId: string,
  listingId: string
): Promise<string> {
  try {
    console.log('\n============================================');
    console.log('📥 [saveMockupToStorage] Starting');
    console.log('   URL:', mockupUrl);
    console.log('   User ID:', userId);
    console.log('   Listing ID:', listingId);

    // Download mockup from Dynamic Mockups URL
    console.log('\n📡 [Step 1/4] Fetching from Dynamic Mockups...');
    const response = await fetch(mockupUrl);

    console.log('   Response status:', response.status, response.statusText);
    console.log('   Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Could not read error body');
      console.error('❌ Fetch failed!');
      console.error('   Status:', response.status);
      console.error('   Status Text:', response.statusText);
      console.error('   Response body:', errorText);
      throw new Error(`Failed to fetch mockup from Dynamic Mockups: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const blob = await response.blob();
    console.log('✅ [Step 1/4] Download successful');
    console.log('   Size:', blob.size, 'bytes');
    console.log('   Type:', blob.type);

    if (blob.size === 0) {
      throw new Error('Downloaded mockup is empty (0 bytes)');
    }

    // Convert blob to base64
    console.log('\n🔄 [Step 2/4] Converting to base64...');
    const base64Image = await blobToBase64(blob);
    console.log('✅ [Step 2/4] Conversion successful');
    console.log('   Base64 length:', base64Image.length);
    console.log('   Base64 prefix:', base64Image.substring(0, 50) + '...');

    // Generate filename
    const fileName = `mockups/${userId}/${listingId}/mockup-${Date.now()}.png`;
    console.log('\n📤 [Step 3/4] Uploading to R2 storage...');
    console.log('   File name:', fileName);

    // Upload to our storage via API endpoint
    const uploadResponse = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: base64Image,
        fileName: fileName,
      }),
    });

    console.log('   Upload response status:', uploadResponse.status, uploadResponse.statusText);
    console.log('   Upload response ok:', uploadResponse.ok);
    console.log('   Upload response headers:', Object.fromEntries(uploadResponse.headers.entries()));

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text().catch(() => 'Could not read response');
      console.error('❌ [Step 3/4] Upload failed!');
      console.error('   Status:', uploadResponse.status);
      console.error('   Response body:', errorText);
      throw new Error(`Upload to storage failed: ${uploadResponse.status} - ${errorText}`);
    }

    // Parse JSON response
    let uploadData;
    try {
      const responseText = await uploadResponse.text();
      console.log('   Raw response text:', responseText.substring(0, 200));
      uploadData = JSON.parse(responseText);
      console.log('   Parsed JSON:', uploadData);
    } catch (parseErr) {
      console.error('❌ Failed to parse upload response JSON:', parseErr);
      console.error('   Response was:', await uploadResponse.text().catch(() => 'Could not read'));
      throw new Error('Failed to parse upload response');
    }

    if (!uploadData || !uploadData.url) {
      console.error('❌ Upload response missing URL!');
      console.error('   Response data:', uploadData);
      throw new Error('Upload response missing URL');
    }

    console.log('✅ [Step 3/4] Upload successful');
    console.log('   Public URL:', uploadData.url);

    console.log('\n✅ [Step 4/4] Complete!');
    console.log('============================================\n');
    return uploadData.url;
  } catch (error) {
    console.error('\n❌ ============================================');
    console.error('❌ [saveMockupToStorage] FAILED');
    console.error('   Original URL:', mockupUrl);
    if (error instanceof Error) {
      console.error('   Error name:', error.name);
      console.error('   Error message:', error.message);
      console.error('   Error stack:', error.stack);
    } else {
      console.error('   Error:', error);
    }
    console.error('============================================\n');
    throw error;
  }
}

/**
 * Save multiple mockups to storage
 * @param mockupUrls Array of mockup URLs from Dynamic Mockups
 * @param userId User ID
 * @param listingId Listing ID
 * @returns Promise with array of stored URLs
 */
export async function saveMockupsToStorage(
  mockupUrls: string[],
  userId: string,
  listingId: string
): Promise<string[]> {
  return Promise.all(
    mockupUrls.map((url) => saveMockupToStorage(url, userId, listingId))
  );
}

/**
 * Send message to Dynamic Mockups iframe
 * @param message Message to send
 */
export function sendMessageToMockupEditor(message: any): void {
  const iframe = document.getElementById(IFRAME_ID) as HTMLIFrameElement;
  if (!iframe || !iframe.contentWindow) {
    console.warn('Dynamic Mockups iframe not found');
    return;
  }

  iframe.contentWindow.postMessage(message, '*');
}

/**
 * Close the Dynamic Mockups editor
 */
export function closeMockupEditor(): void {
  sendMessageToMockupEditor({ type: 'close-editor' });
}
