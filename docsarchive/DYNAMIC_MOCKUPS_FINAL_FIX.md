# Dynamic Mockups Integration - Final Fix

**Date:** October 23, 2024
**Status:** ✅ COMPLETE

---

## Issues Fixed

### 1. ❌ "Iframe with ID 'dm-iframe' not found"
**Cause:** SDK initialization running before iframe rendered in DOM
**Fix:** Added 200ms delay to wait for MUI Dialog animation

### 2. ❌ "Website key is not available"
**Cause:** Using wrapper function instead of direct SDK call
**Fix:** Import and call `initDynamicMockupsIframe` directly from SDK

### 3. ❌ Multiple initializations
**Cause:** `handleMockupGenerated` in useEffect dependencies
**Fix:** Removed from dependencies, only depend on `open`

---

## Final Implementation

### Import (Line 20)
```typescript
import { initDynamicMockupsIframe } from '@dynamic-mockups/mockup-editor-sdk';
```

**✅ DIRECT SDK IMPORT** - No wrapper, no re-export

### Initialization (Lines 83-125)
```typescript
useEffect(() => {
  if (!open) {
    // Reset state
    return;
  }

  setIframeReady(true); // Render iframe first

  const timer = setTimeout(() => {
    // DIRECT SDK CALL - exactly as per official docs
    initDynamicMockupsIframe({
      iframeId: "dm-iframe",
      data: {
        "x-website-key": "6teekeB1pltX",
        showCollectionsWidget: true,
        showArtworkLibrary: true,
        showColorPicker: true,
        showColorPresets: true,
        showUploadYourArtwork: true,
        showArtworkEditor: true,
        showTransformControls: true,
        enableExportMockups: true,
      },
      mode: "download",
      callback: async (response: any) => {
        if (response.mockupsExport && response.mockupsExport.length > 0) {
          const mockupUrls = response.mockupsExport.map((m: any) => m.export_path);
          await handleMockupGenerated(mockupUrls);
        }
      },
    });
  }, 200); // 200ms for MUI Dialog animation

  return () => clearTimeout(timer);
}, [open]);
```

**Key Points:**
- ✅ Sets `iframeReady=true` FIRST (triggers iframe render)
- ✅ Waits 200ms for MUI Dialog animation
- ✅ Calls SDK directly with `initDynamicMockupsIframe`
- ✅ Only depends on `open` prop
- ✅ Cleanup with `clearTimeout`

### iframe Element (Lines 240-250)
```html
<iframe
  id="dm-iframe"
  src="https://embed.dynamicmockups.com"
  style={{
    width: '100%',
    height: 'calc(90vh - 240px)',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#fff',
  }}
  title="Dynamic Mockups Editor"
  allow="clipboard-write"
/>
```

**✅ Correct URL:** `https://embed.dynamicmockups.com`

---

## What Should Happen Now

### 1. Dialog Opens
```
User clicks "Open Mockup Editor"
  → Dialog opens with animation (200ms)
  → iframe renders with id="dm-iframe"
  → src loads https://embed.dynamicmockups.com
```

### 2. SDK Initializes
```
After 200ms delay:
  → initDynamicMockupsIframe() called
  → SDK finds iframe with id="dm-iframe"
  → Sends configuration via postMessage
  → Website key: 6teekeB1pltX validated
```

### 3. Editor Loads (if domain whitelisted)
```
Dynamic Mockups iframe validates:
  ✓ Website key is valid
  ✓ Domain is whitelisted
  ✓ Subscription is active
  → Editor UI loads
  → Collections displayed
  → Mockup library shown
```

### 4. User Creates Mockups
```
User uploads design
  → Selects mockup template
  → Customizes colors/positioning
  → Clicks "Download" or "Export"
  → SDK callback triggered
  → Mockups saved to R2/S3
  → Success message shown
```

---

## Expected Behavior

### ✅ Success (if domain whitelisted):
- No "iframe not found" errors
- No "website key not available" errors
- Dynamic Mockups editor loads in iframe
- Collections and mockup library visible
- Can upload designs and generate mockups

### ❌ Failure (if domain NOT whitelisted):
- iframe loads but shows error message
- Console shows: "Host validation failed"
- Error: "Host is not in whitelist"

**Solution:** Add your domain to allowed domains in Dynamic Mockups dashboard

---

## Domain Whitelisting Required

**You MUST whitelist your domain** in Dynamic Mockups dashboard:

1. Go to: https://app.dynamicmockups.com/dashboard
2. Navigate to: **Integrations** → **Website Keys**
3. Find key: `6teekeB1pltX`
4. Click: **Edit** or **Settings**
5. Add domains:
   ```
   localhost:3000
   http://localhost:3000
   localhost
   ```
6. Save changes
7. Refresh your app and test

---

## Testing Checklist

### Before Testing:
- [ ] Website key `6teekeB1pltX` is active
- [ ] Subscription is active and paid
- [ ] Domain is whitelisted in Dynamic Mockups dashboard
- [ ] Dev server restarted (`npm run dev`)

### During Testing:
- [ ] Open browser console (F12)
- [ ] Navigate to `/app/create`
- [ ] Select "Print-on-Demand"
- [ ] Upload a design file
- [ ] Select a product (e.g., T-Shirt)
- [ ] Click "Open Mockup Editor"

### Expected Console Logs:
```javascript
// NO errors for:
✅ "Iframe with ID 'dm-iframe' not found"
✅ "Website key is not available"

// Expected logs:
✅ "Dynamic Mockups callback received: {...}"
```

### Expected UI:
- [ ] Dialog opens smoothly
- [ ] iframe loads Dynamic Mockups editor
- [ ] Collections widget visible
- [ ] Mockup library/templates shown
- [ ] Upload button functional
- [ ] Color picker available
- [ ] Can generate and export mockups

---

## Files Modified

### 1. `components/CreateListing/Pod/MockupEditor.tsx`
**Changes:**
- Import `initDynamicMockupsIframe` directly from SDK
- Removed wrapper function usage
- Added 200ms delay for Dialog animation
- Simplified useEffect dependencies to `[open]` only
- Removed unused imports

**Lines:**
- Line 20: Direct SDK import
- Lines 83-125: Simplified useEffect with timing fix
- Lines 240-250: iframe element (unchanged)

### 2. No Other Files Changed
All other files remain as they were. The fix was isolated to MockupEditor.tsx.

---

## Code Comparison

### ❌ Before (Broken):
```typescript
// Via wrapper
import { initializeDynamicMockups } from '@/lib/api/dynamicMockups';

useEffect(() => {
  if (open) {
    initializeDynamicMockups({ ... }); // ❌ Wrapper causing issues
    setIframeReady(true);
  }
}, [open, handleMockupGenerated]); // ❌ Extra dependency
```

### ✅ After (Fixed):
```typescript
// Direct SDK
import { initDynamicMockupsIframe } from '@dynamic-mockups/mockup-editor-sdk';

useEffect(() => {
  if (!open) return;

  setIframeReady(true); // ✅ Render iframe first

  const timer = setTimeout(() => {
    initDynamicMockupsIframe({ ... }); // ✅ Direct SDK call
  }, 200); // ✅ Wait for Dialog animation

  return () => clearTimeout(timer);
}, [open]); // ✅ Only one dependency
```

---

## Success Criteria

### Development Complete: ✅
- [x] Direct SDK import used
- [x] Timing issue fixed (200ms delay)
- [x] Single initialization (not multiple)
- [x] Correct iframe URL
- [x] Proper callback handling
- [x] Build succeeds with no errors

### Production Ready: ⏳ (Waiting for domain whitelist)
- [ ] Domain whitelisted in Dynamic Mockups dashboard
- [ ] iframe loads editor successfully
- [ ] Collections and mockup library visible
- [ ] Can upload designs
- [ ] Can generate mockups
- [ ] Export callback works
- [ ] Mockups save to R2/S3

---

## Next Steps

1. **Whitelist your domain** in Dynamic Mockups dashboard (REQUIRED)
2. **Test the editor** - it should now load without "iframe not found" errors
3. **Verify collections appear** - mockup library should be visible
4. **Test mockup generation** - upload design, select template, export

---

## Support

If still having issues after whitelisting:

**Dynamic Mockups Support:**
- Email: support@dynamicmockups.com
- Docs: https://docs.dynamicmockups.com
- Dashboard: https://app.dynamicmockups.com

**Issues to Report:**
- Website key: `6teekeB1pltX`
- Domain: `localhost:3000` (or your domain)
- Error: Include console logs and screenshots

---

**Status:** ✅ **CODE COMPLETE** - Waiting for domain whitelist to test fully

---

*Last Updated: October 23, 2024 - Final Implementation*
