# How to Enable Dynamic Mockups Export

## Current Status ✅
- SDK initialized correctly
- Website key: `ZqruUQEIF9Hc`
- Collections loading properly
- ❌ **Cannot export** - Need to enable API access

---

## What You Need to Enable

Your Dynamic Mockups account needs **"Custom Mode"** or **"API Access"** permissions to use programmatic exports with callbacks.

### Two Modes Explained:

| Mode | Description | Export Method | Your Status |
|------|-------------|---------------|-------------|
| **Download Mode** | Users manually download files to their computer | Direct download | ✅ Free/Basic |
| **Custom Mode** | Programmatic export via callbacks to your app | API callback | ❌ **Need this!** |

---

## How to Enable API Access

### Option 1: Check Your Dashboard

1. **Go to:** https://dynamicmockups.com/dashboard
2. **Find:** Your website key `ZqruUQEIF9Hc`
3. **Look for settings like:**
   - ☐ API Access
   - ☐ Programmatic Export
   - ☐ Custom Mode
   - ☐ Embed Mode Settings
4. **Enable** these options if available

### Option 2: Check Your Plan

1. **Go to:** https://dynamicmockups.com/pricing
2. **Check if your current plan includes:**
   - API Access
   - Programmatic Exports
   - Custom Callbacks
3. **Upgrade if needed** to a plan with API access

### Option 3: Contact Support

**Email:** support@dynamicmockups.com

**Message Template:**
```
Subject: Enable API Access for Website Key

Hi Dynamic Mockups Team,

I'm integrating your embed editor into my application and need to enable
programmatic exports with callbacks.

Website Key: ZqruUQEIF9Hc
Current Issue: Editor loads and shows collections, but export functionality
doesn't trigger callbacks.

I'm using mode: "custom" with the SDK. Can you please:
1. Confirm if this website key has API/Custom mode access
2. Enable it if not already active
3. Let me know if I need to upgrade my plan

Thank you!
```

---

## Alternative: Use Download Mode (Temporary Solution)

If API access isn't available immediately, you can switch to **download mode** as a temporary workaround:

### What This Means:
- Users click "Download" button in the editor
- Files download to their computer
- You add an **upload button** for users to manually upload the downloaded mockups
- Less seamless, but works with basic/free accounts

### To Implement Download Mode:

**In `components/CreateListing/Pod/MockupEditor.tsx`, change:**

```typescript
mode: "custom",  // ❌ Requires API access
```

**To:**

```typescript
mode: "download",  // ✅ Works with basic accounts
// Remove the callback parameter (not used in download mode)
```

**Then add an upload button** for users to upload their downloaded mockups manually.

---

## Testing After Enabling API Access

Once API access is enabled, test:

1. **Open mockup editor**
2. **Open browser console (F12)**
3. **Select a mockup and customize it**
4. **Click "Export" or "Generate"** (button name may vary)
5. **Watch console for:**
   ```
   🎉 SDK callback triggered!
   📦 Callback data: {...}
   ✅ Processing mockup URLs: [...]
   Mockups received from Dynamic Mockups: [...]
   Saving your mockups...
   ```

If you see these logs, **export is working!** ✅

---

## Common Issues

### Issue: Export button does nothing
**Solution:**
- Verify API access is enabled
- Check browser console for errors
- Try different browsers

### Issue: "Website key is not available"
**Solution:**
- Already fixed! ✅ Dev server was restarted

### Issue: Collections don't load
**Solution:**
- Already fixed! ✅ You created collections in dashboard

### Issue: Callback never fires
**Solution:**
- Most likely: API access not enabled yet
- Contact Dynamic Mockups support

---

## Next Steps

1. ✅ Check your Dynamic Mockups dashboard for API settings
2. ✅ Contact support if needed (use email template above)
3. ✅ Test export after enabling
4. ✅ Share results with development team

---

## Support Resources

- **Dashboard:** https://dynamicmockups.com/dashboard
- **Pricing:** https://dynamicmockups.com/pricing
- **Documentation:** https://docs.dynamicmockups.com
- **Support:** support@dynamicmockups.com
- **Community:** Check if they have a Discord/Slack channel

---

## Current Integration Status

| Component | Status |
|-----------|--------|
| SDK Installation | ✅ Working |
| Environment Variables | ✅ Loaded correctly |
| Website Key | ✅ `ZqruUQEIF9Hc` |
| Iframe Loading | ✅ Working |
| Collections | ✅ Loading |
| SDK Initialization | ✅ Timing fixed |
| Export Functionality | ⏳ **Waiting for API access** |

Once API access is enabled, everything should work automatically! 🚀
