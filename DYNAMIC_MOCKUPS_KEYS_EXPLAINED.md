# Dynamic Mockups Keys Explained

## 🔑 Two Different Keys

Dynamic Mockups uses **two different types of keys** for different purposes:

---

## 1️⃣ Website Key (Embed Editor)

**Your Website Key:** `ZqruUQEIF9Hc`

### Purpose:
- Used for the **embed editor** (iframe)
- Client-side integration
- Safe to expose in browser code

### Where It's Used:
```typescript
// In MockupEditor.tsx
initDynamicMockupsIframe({
  iframeId: "dm-iframe",
  data: {
    "x-website-key": "ZqruUQEIF9Hc"  // ← Website key
  },
  mode: "custom",
  callback: (data) => { /* ... */ }
});
```

### Current Status:
✅ Configured in `.env.local` as `NEXT_PUBLIC_DYNAMIC_MOCKUPS_KEY`
✅ Loading correctly after dev server restart
✅ Editor working, collections visible

---

## 2️⃣ API Key (Server-Side API Calls)

**Your API Key:** `08552981-e681-4022-92c7-d746e3352156:41a761a00b557e14cc3cfbd35c2c988366bc0fe47c000d5ab8cdeb64cc378cd1`

### Purpose:
- Used for **direct API calls** to Dynamic Mockups API
- Server-side only (never expose to client)
- For programmatic mockup rendering

### Where It Would Be Used:
```typescript
// Server-side API route (e.g., /api/render-mockup)
const response = await fetch('https://api.dynamic-mockups.com/render', {
  headers: {
    'Authorization': `Bearer ${process.env.DYNAMIC_MOCKUPS_API_KEY}`
  },
  // ...
});
```

### Example Use Cases:
- Render mockups programmatically without the editor
- Bulk mockup generation
- Automated workflows
- Background processing

### Current Status:
✅ Added to `.env.local` as `DYNAMIC_MOCKUPS_API_KEY`
⚠️ Not currently used (but available for future features)

---

## 🔐 Security Important!

| Key Type | Safe to Expose? | Where to Store |
|----------|-----------------|----------------|
| **Website Key** | ✅ Yes (client-side) | `NEXT_PUBLIC_DYNAMIC_MOCKUPS_KEY` |
| **API Key** | ❌ NO! (server-side only) | `DYNAMIC_MOCKUPS_API_KEY` (no NEXT_PUBLIC prefix) |

**Note:** Notice the API key does NOT have `NEXT_PUBLIC_` prefix, which means Next.js will **never** expose it to the browser. It's only accessible in server-side code.

---

## 📊 Your Current Setup

### Environment Variables (`.env.local`):
```env
# Website Key - Client-side
NEXT_PUBLIC_DYNAMIC_MOCKUPS_KEY=ZqruUQEIF9Hc

# API Key - Server-side only
DYNAMIC_MOCKUPS_API_KEY=08552981-e681-4022-92c7-d746e3352156:41a761a00b557e14cc3cfbd35c2c988366bc0fe47c000d5ab8cdeb64cc378cd1
```

### What's Working:
- ✅ SDK initialized
- ✅ Website key loaded
- ✅ Collections visible
- ✅ Editor functional

### What to Test Now:
- ⏳ **Export functionality** - Try exporting a mockup again!

---

## 🧪 Testing Export Now

Having an **API key** might mean your account has **API/Custom Mode access**, which would enable the export callbacks!

### Steps to Test:

1. **Restart dev server** (to load the new API key env var):
   ```bash
   # Press Ctrl+C, then:
   npm run dev
   ```

2. **Open mockup editor**

3. **Open browser console (F12)**

4. **Create/customize a mockup**

5. **Click "Export" or "Generate"**

6. **Watch console for:**
   ```
   🔍 [Dynamic Mockups Message] {mockupsExport: [...]}
   🎉 SDK callback triggered!
   📦 Callback data: {...}
   ✅ Processing mockup URLs: [...]
   ```

---

## 🎯 Expected Behavior

### If Export Works (API Access Enabled):
```
✅ Click Export button
✅ SDK callback fires
✅ Mockup URLs received
✅ "Saving your mockups..." progress appears
✅ Files uploaded to your R2 storage
✅ Success! Mockups added to listing
```

### If Export Still Doesn't Work:
- Website key might not have custom mode enabled
- Contact support with BOTH keys
- They may need to link the API key to the website key

---

## 💡 Why You Might Have Both Keys

Some Dynamic Mockups accounts have:
- **Basic website key** for embed editor
- **API key** for programmatic access

If you have an API key, it usually means:
✅ Your account has API access
✅ Custom mode should work
✅ Callbacks should be enabled

---

## 📞 If Export Still Doesn't Work

**Contact Dynamic Mockups Support:**

Email: support@dynamicmockups.com

**Message:**
```
Hi,

I have both a website key and API key for my account, but custom mode
exports aren't working in the embed editor.

Website Key: ZqruUQEIF9Hc
API Key: 08552981-e681-4022-92c7-d746e3352156:...

The editor loads correctly and shows collections, but when I click
export, the callback doesn't fire. Can you please verify:

1. Is custom mode enabled for my website key?
2. Do I need to link the API key to the website key?
3. Are there any additional settings I need to enable?

Thank you!
```

---

## 🚀 Next Steps

1. ✅ Restart dev server (to load API key env var)
2. ✅ Test export functionality
3. ✅ Share console logs
4. ✅ Contact support if needed

The fact that you have an API key is a good sign - your account likely has the necessary permissions! 🎉
