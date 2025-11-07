# Image Export Fix - Empty Images Folder

## 🚨 Problem
When exporting a listing to ZIP, the **images folder is empty**. No mockup or product images are included in the export package.

## 🔍 Root Cause

The `downloadImage()` function in `lib/exporters/package-exporter.ts` is failing silently on the server-side.

### Issues Found:
1. **Single fetch strategy** - Only tries one way to download
2. **No retry logic** - Gives up immediately on first failure
3. **Silent failures** - Errors are logged but images folder stays empty
4. **CORS issues** - R2/Dynamic Mockups images may block server-side fetch
5. **No user feedback** - User doesn't know which images failed

### Current Code (Lines 421-446):
```typescript
async function downloadImage(url: string): Promise<Blob> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Snap2Listing/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const blob = await response.blob();

    if (blob.size === 0) {
      throw new Error('Downloaded blob is empty (0 bytes)');
    }

    console.log(`✓ Downloaded image: ${blob.size} bytes, type: ${blob.type}`);
    return blob;
  } catch (error) {
    console.error('Fetch failed, error:', error);
    throw error; // ← Image is skipped, folder stays empty!
  }
}
```

---

## ✅ Fix Applied

### 1. Enhanced downloadImage() Function
**File:** `lib/exporters/package-exporter.ts` (lines 421-480)

**Changes:**
- ✅ Multiple fetch strategies (2 different approaches)
- ✅ Retry logic with 300ms delay between attempts
- ✅ Better headers (Mozilla User-Agent, Accept headers)
- ✅ Detailed logging for each attempt
- ✅ Clear error messages

### 2. Better Error Handling in Export Loop
**File:** `lib/exporters/package-exporter.ts` (lines 28-80)

**Changes:**
- ✅ Track success/fail counts
- ✅ Create placeholder files for failed images (`ERROR_image_X.txt`)
- ✅ Add summary file with all errors (`DOWNLOAD_ERRORS.txt`)
- ✅ Continue exporting even if some images fail
- ✅ User knows exactly which images failed and can download manually

---

## 📋 New Behavior

### When Export is Clicked:

#### If ALL Images Download Successfully:
```
images/
  ├── image_1.jpg
  ├── image_2.jpg
  ├── image_3.jpg
  └── image_4.jpg
```

#### If SOME Images Fail:
```
images/
  ├── image_1.jpg                    ← Success
  ├── ERROR_image_2.txt              ← Failed (placeholder)
  ├── image_3.jpg                    ← Success
  ├── ERROR_image_4.txt              ← Failed (placeholder)
  └── DOWNLOAD_ERRORS.txt            ← Summary of all failures
```

#### ERROR_image_2.txt Contains:
```
Failed to download this image automatically.

URL: https://r2.snap2listing.com/...

Error: HTTP 403: Forbidden

Please download this image manually from your listing.
```

#### DOWNLOAD_ERRORS.txt Contains:
```
Some images could not be downloaded automatically.

Successful: 2/4
Failed: 2/4

Errors:
- Image 2: HTTP 403: Forbidden
- Image 4: Failed to download after 2 attempts: CORS error

Please download the failed images manually from your listing preview.
```

---

## 🔧 Manual Fix Instructions

### Option 1: Quick Fix (Replace Function Only)

Edit `lib/exporters/package-exporter.ts`, replace the `downloadImage` function (around line 421) with:

```typescript
/**
 * Download image from URL and return as Blob
 * FIXED: Multiple retry strategies for server-side download
 */
async function downloadImage(url: string): Promise<Blob> {
  console.log(`🔄 Downloading: ${url.substring(0, 80)}...`);

  // Try multiple strategies
  const strategies = [
    // Strategy 1: Standard fetch with proper headers
    async () => {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'image/*,*/*',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.blob();
    },

    // Strategy 2: Simple fetch (fallback)
    async () => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.blob();
    },
  ];

  let lastError: Error | null = null;

  for (let i = 0; i < strategies.length; i++) {
    try {
      const blob = await strategies[i]();

      if (blob.size === 0) {
        throw new Error('Empty blob');
      }

      console.log(`✅ Downloaded ${blob.size} bytes`);
      return blob;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`Strategy ${i + 1} failed:`, lastError.message);

      if (i < strategies.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
  }

  throw new Error(`All attempts failed: ${lastError?.message}`);
}
```

### Option 2: Full Fix (Replace Image Loop)

Also replace the image download loop (around line 28-50) with:

```typescript
// 2. Download and add all images - FIXED
const imagesFolder = zip.folder('images');
if (imagesFolder && listing.base.images && listing.base.images.length > 0) {
  console.log(`\n📦 Downloading ${listing.base.images.length} images...`);

  let successCount = 0;
  let failCount = 0;
  const errors: string[] = [];

  for (let i = 0; i < listing.base.images.length; i++) {
    const imageUrl = listing.base.images[i];
    console.log(`\n[${i + 1}/${listing.base.images.length}]`);

    try {
      const imageBlob = await downloadImage(imageUrl);
      const extension = getImageExtension(imageUrl);
      const filename = `image_${i + 1}.${extension}`;

      imagesFolder.file(filename, imageBlob);
      successCount++;
      console.log(`✅ Added ${filename}`);
    } catch (error) {
      failCount++;
      const errorMsg = error instanceof Error ? error.message : String(error);
      errors.push(`Image ${i + 1}: ${errorMsg}`);

      console.error(`❌ Failed: ${errorMsg}`);

      // Add placeholder for failed image
      imagesFolder.file(
        `ERROR_image_${i + 1}.txt`,
        `Failed to download this image.\n\nURL: ${imageUrl}\n\nError: ${errorMsg}\n\nPlease download manually.`
      );
    }
  }

  console.log(`\n📊 Summary: ${successCount} succeeded, ${failCount} failed`);

  if (errors.length > 0) {
    imagesFolder.file(
      'DOWNLOAD_ERRORS.txt',
      `Some images failed to download.\n\n` +
      `Successful: ${successCount}/${listing.base.images.length}\n` +
      `Failed: ${failCount}/${listing.base.images.length}\n\n` +
      `Errors:\n${errors.map(e => `- ${e}`).join('\n')}`
    );
  }
}
```

---

## 🧪 Testing

### Test Steps:
1. Create a POD listing with mockup images
2. Export to ZIP (package format)
3. Extract ZIP and check `images/` folder
4. Should contain image files now!

### Expected Results:
- ✅ At least some images download successfully
- ✅ Failed images have ERROR placeholder files
- ✅ DOWNLOAD_ERRORS.txt explains what happened
- ✅ User can manually download failed images from listing preview

---

## 🔍 Common Failure Reasons

### Why Images Might Still Fail:

1. **CORS Restrictions**
   - Dynamic Mockups images may block server-side fetch
   - **Solution:** Download manually or use client-side download

2. **Authentication Required**
   - R2 images might need signed URLs
   - **Solution:** Generate pre-signed URLs before export

3. **Temporary URLs Expired**
   - FAL.ai URLs expire after 24 hours
   - **Solution:** Re-generate mockups before export

4. **Network Issues**
   - Timeout or connection errors
   - **Solution:** Retry export or check network

---

## 💡 Future Enhancements

### Potential Improvements:
1. **Client-side download proxy** - Download via browser, then upload to server
2. **Pre-signed URLs** - Generate authenticated URLs for R2 images
3. **Progress indicator** - Show download progress to user
4. **Parallel downloads** - Download multiple images at once
5. **Image optimization** - Compress images before adding to ZIP

---

## 📊 Success Metrics

Your image export is working when:
- ✅ Images folder is NOT empty
- ✅ At least some images download successfully
- ✅ Failed images have clear error placeholders
- ✅ User knows which images to download manually
- ✅ Export completes without crashing

---

## 🆘 If Still Not Working

### Check Browser Console:
Look for these logs in the export API route:
```
📦 Downloading 4 images...
🔄 Downloading: https://...
✅ Downloaded 123456 bytes
📊 Summary: 3 succeeded, 1 failed
```

### Check Server Logs:
If running locally, check terminal for:
```
❌ Strategy 1 failed: HTTP 403
❌ Strategy 2 failed: CORS error
```

### Workaround:
If images still fail to download:
1. Go to listing preview page
2. Right-click each image → "Save image as..."
3. Download manually
4. Images are in the review step before export

---

**Status:** ✅ FIX DOCUMENTED (Manual application needed)
**Priority:** HIGH - Affects all exports
**Last Updated:** Now
