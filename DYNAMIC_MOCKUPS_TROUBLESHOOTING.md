# Dynamic Mockups Integration Troubleshooting

## Current Status

### ✅ What's Working
- SDK package is installed correctly (`@dynamic-mockups/mockup-editor-sdk@1.1.43`)
- Using npm import method (no need for CDN script tag)
- SDK initializes successfully
- Iframe loads and communicates (`dmIframeReady` event received)

### ❌ What's NOT Working
- Export events are not being captured
- Callback function never fires when users try to export mockups

---

## Most Likely Issue: Website Key Permissions

Your website key `6teekeB1pltX` might not have permissions for **"custom" mode** with programmatic callbacks.

### Dynamic Mockups has 2 modes:

1. **"download" mode** (FREE/BASIC)
   - Users click download button
   - Files download directly to their computer
   - NO callbacks or programmatic access
   - Cannot capture mockup URLs

2. **"custom" mode** (PAID/API ACCESS)
   - Users click export/generate button
   - Mockup URLs are sent via callback
   - Programmatic access to mockup data
   - ✅ This is what we need!

---

## How to Fix

### Option 1: Verify Your Dynamic Mockups Account Permissions

1. Go to https://dynamicmockups.com/dashboard
2. Navigate to your website key settings
3. Check if you have:
   - ✅ **API Access** enabled
   - ✅ **Programmatic Export** enabled
   - ✅ **Custom Mode** available
4. If not available, you may need to:
   - Upgrade your plan
   - Contact Dynamic Mockups support to enable API access
   - Request a trial of API features

### Option 2: Contact Dynamic Mockups Support

**Email:** support@dynamicmockups.com

**Ask them:**
> "Hi, I'm trying to use the embed editor with `mode: 'custom'` and the callback function to capture mockup URLs programmatically. My website key is `6teekeB1pltX`. Does this key support custom mode with callbacks? If not, how can I enable it?"

### Option 3: Alternative Approach (If Only Download Mode Available)

If you can only use "download" mode, you'll need to:
1. Let users download mockups to their computer
2. Add an upload button for users to manually upload the downloaded mockups
3. Store the uploaded files in your system

This is less seamless but works with basic/free accounts.

---

## Testing Instructions

### After enabling API access, test with these steps:

1. **Open mockup editor dialog**
2. **Open browser console (F12)**
3. **Look for these logs:**
   ```
   🔑 Using website key: 6teekeB1pltX
   ✅ SDK function is available: function
   🚀 Initializing Dynamic Mockups SDK with mode: custom
   ✅ SDK initialized successfully
   ✅ Iframe is ready!
   ```

4. **Generate a mockup:**
   - Select a mockup template
   - Apply your design
   - Click "Export" or "Generate" button

5. **Watch for export events:**
   ```
   🚨 EXPORT EVENT DETECTED! Processing via fallback handler...
   ✅ FALLBACK: Found mockup URLs: [...]
   ```

### If you see "🎉 Dynamic Mockups SDK callback triggered!" - Success! ✅

### If you don't see any export events:
- Your website key likely doesn't support custom mode
- Contact Dynamic Mockups support

---

## Code Summary

### Installation Method (Current - Correct! ✅)
```typescript
// package.json
"@dynamic-mockups/mockup-editor-sdk": "^1.1.43"

// MockupEditor.tsx
import { initDynamicMockupsIframe } from "@dynamic-mockups/mockup-editor-sdk";
```

**You do NOT need:**
```html
<!-- ❌ NOT NEEDED - This is for CDN method -->
<script src="https://cdn.jsdelivr.net/npm/@dynamic-mockups/mockup-editor-sdk@latest/dist/index.js"></script>
```

### Current Configuration
```typescript
initDynamicMockupsIframe({
  iframeId: "dm-iframe",
  data: {
    "x-website-key": "6teekeB1pltX",
    showUploadYourArtwork: true,
    enableExportMockups: true,
    showCollectionsWidget: true,
    showColorPicker: true,
    showArtworkLibrary: true,
    showTransformControls: true,
  },
  mode: "custom", // ⚠️ Requires API access on your account
  callback: async (callbackData) => {
    // Captures mockup URLs
  },
});
```

---

## Next Steps

1. ✅ Verify your Dynamic Mockups account has API/custom mode access
2. ✅ Contact support if needed
3. ✅ Test with the updated code
4. ✅ Share console logs with the development team

---

## Support Resources

- **Documentation:** https://docs.dynamicmockups.com
- **Support:** support@dynamicmockups.com
- **Dashboard:** https://dynamicmockups.com/dashboard
- **Pricing:** https://dynamicmockups.com/pricing
