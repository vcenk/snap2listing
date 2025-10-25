# Dynamic Mockups Integration - Troubleshooting Guide

**Date:** October 22, 2024

---

## Current Error

```
Error: Website key is not available
Host validation failed
Host is not supported
Host is not in insights whitelist
```

---

## Root Cause

Dynamic Mockups requires **two things** to work:

1. ✅ **Valid Website Key** (you have: `6teekeB1pltX`)
2. ❌ **Whitelisted Domain** (your current domain is NOT whitelisted)

---

## Solution: Whitelist Your Domain

### Step 1: Log into Dynamic Mockups Dashboard

Go to: **https://app.dynamicmockups.com/dashboard**

### Step 2: Navigate to Website Key Settings

1. Click on **"Integrations"** or **"Website Keys"** in the sidebar
2. Find your website key: `6teekeB1pltX`
3. Click **"Edit"** or **"Settings"**

### Step 3: Add Allowed Domains

In the website key settings, you'll see an **"Allowed Domains"** or **"Whitelisted Domains"** section.

**Add these domains:**

For Development:
```
http://localhost:3000
localhost:3000
localhost
```

For Production (when deployed):
```
https://yourdomain.com
yourdomain.com
```

### Step 4: Save Changes

Click **"Save"** or **"Update"** to apply the changes.

### Step 5: Test Again

1. Refresh your Next.js app (`npm run dev`)
2. Navigate to `/app/create`
3. Select "Print-on-Demand"
4. Upload a design
5. Select a product
6. Click "Open Mockup Editor"
7. The iframe should now load successfully

---

## Verification Checklist

Open browser console and check for these logs:

✅ **Expected Logs:**
```javascript
Initializing Dynamic Mockups iframe...
Website Key: 6teekeB1pltX
iframe ID: dm-iframe
```

❌ **Error to Avoid:**
```javascript
Error: Website key is not available
Host validation failed
```

---

## Alternative: Check if Website Key is Active

### In Dynamic Mockups Dashboard:

1. Go to **Integrations** → **Website Keys**
2. Check the status of `6teekeB1pltX`
3. Make sure it shows:
   - ✅ **Active** (not expired or disabled)
   - ✅ **Subscription Active** (plan is paid and current)
   - ✅ **Iframe Embedding Enabled**

---

## If Domain Whitelisting Doesn't Work

### Option 1: Try Using API Key Instead

Dynamic Mockups may support API key authentication in addition to website keys.

Check your dashboard for an **API Key** (different from website key):
- Format: Usually longer, like `dm_abc123xyz...`

If available, update `.env.local`:
```env
NEXT_PUBLIC_DYNAMIC_MOCKUPS_API_KEY=your_api_key_here
```

And update `lib/config/dynamicMockups.ts`:
```typescript
export const dynamicMockupsConfig = {
  websiteKey: process.env.NEXT_PUBLIC_DYNAMIC_MOCKUPS_KEY || '6teekeB1pltX',
  apiKey: process.env.NEXT_PUBLIC_DYNAMIC_MOCKUPS_API_KEY, // Add this
  // ...
};
```

### Option 2: Contact Dynamic Mockups Support

If domain whitelisting doesn't resolve the issue:

**Email:** support@dynamicmockups.com
**Subject:** "Host validation failed for iframe integration"

**Include:**
- Your website key: `6teekeB1pltX`
- Your domain: `localhost:3000` (or production domain)
- Error message: "Host validation failed"
- Request: Add domain to whitelist for iframe embedding

---

## Testing Without Domain Issues (Temporary)

### Use Dynamic Mockups Playground

While waiting for domain approval:

1. Go to: https://app.dynamicmockups.com/playground
2. Test mockup creation manually
3. Download mockup images
4. Use the `/api/upload` endpoint to upload them to your R2 storage
5. Continue with listing creation

This allows you to test the rest of the PoD workflow while the iframe integration is being resolved.

---

## Environment Variables Check

Make sure `.env.local` has:

```env
# Dynamic Mockups
NEXT_PUBLIC_DYNAMIC_MOCKUPS_KEY=6teekeB1pltX
DYNAMIC_MOCKUPS_API_URL=https://api.dynamic-mockups.com
```

**IMPORTANT:** Environment variables starting with `NEXT_PUBLIC_` are exposed to the browser and **must** be used for client-side SDK initialization.

---

## Code Configuration Check

### Current Configuration:

**File:** `components/CreateListing/Pod/MockupEditor.tsx`

```typescript
initializeDynamicMockups({
  iframeId: dynamicMockupsConfig.iframeId,     // 'dm-iframe'
  data: {
    'x-website-key': dynamicMockupsConfig.websiteKey,  // '6teekeB1pltX'
    showCollectionsWidget: true,
    showArtworkLibrary: true,        // ← Shows mockup templates
    showColorPicker: true,
    showColorPresets: true,
    showUploadYourArtwork: true,
    showArtworkEditor: true,
    showTransformControls: true,
    showSmartObjectArea: false,
    enableExportMockups: true,
    enableCollectionExport: false,
  },
  mode: 'download',
  callback: async (response) => {
    // Handles mockup exports
  },
});
```

This configuration is **correct** ✅

---

## iframe URL Check

**File:** `components/CreateListing/Pod/MockupEditor.tsx` (line ~258)

```html
<iframe
  id="dm-iframe"
  src="https://embed.dynamicmockups.com"  ← Must be this exact URL
  ...
/>
```

✅ **Correct URL:** `https://embed.dynamicmockups.com`
❌ **Wrong URL:** `https://app.dynamicmockups.com/embed`

---

## Network Debugging

### Check Network Tab in Browser DevTools:

1. Open DevTools (F12)
2. Go to **Network** tab
3. Filter by **"dynamicmockups"**
4. Look for requests to:
   - `https://embed.dynamicmockups.com`
   - `https://embed-proxy.dynamicmockups.com/api/mockup-editor-iframe-integrations/validate-integration-domain`

### Expected Successful Response:

**Status:** `200 OK`

```json
{
  "success": true,
  "valid": true,
  "website_key_valid": true
}
```

### Current Failed Response:

**Status:** `400 Bad Request`

```json
{
  "success": false,
  "error": "Host validation failed",
  "message": "Host is not in whitelist"
}
```

---

## Quick Checklist

Before asking for help, verify:

- [ ] Website key `6teekeB1pltX` is active in Dynamic Mockups dashboard
- [ ] Subscription is active and paid
- [ ] Domain `localhost:3000` (or your domain) is whitelisted
- [ ] Environment variable `NEXT_PUBLIC_DYNAMIC_MOCKUPS_KEY=6teekeB1pltX` is set
- [ ] You've restarted the Next.js dev server after adding env vars
- [ ] iframe src is `https://embed.dynamicmockups.com` (not app.dynamicmockups.com)
- [ ] Browser console shows "Website Key: 6teekeB1pltX" log
- [ ] No CORS errors in browser console

---

## Summary

**The issue is NOT with your code.** The code is configured correctly.

**The issue IS with Dynamic Mockups account settings.** You need to:

1. ✅ Log into https://app.dynamicmockups.com/dashboard
2. ✅ Find website key `6teekeB1pltX` settings
3. ✅ Add `localhost:3000` to allowed domains
4. ✅ Save changes
5. ✅ Refresh your app

Once the domain is whitelisted, the iframe will load successfully and you'll see your mockup collections and templates.

---

**Next Step:** Whitelist your domain in Dynamic Mockups dashboard, then test again.

---

*Last Updated: October 22, 2024*
