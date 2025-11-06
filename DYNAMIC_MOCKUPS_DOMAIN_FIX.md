# 🚨 Dynamic Mockups Domain Validation Error - FIX GUIDE

## Error You're Seeing

```
Failed to load resource: the server responded with a status of 400 (Bad Request)
embed-proxy.dynamicmockups.com/api/mockup-editor-iframe-integrations/validate-integration-domain
```

```
Error: Max retry attempts reached. Unable to validate client.
```

---

## 🔍 What This Means

Dynamic Mockups is **blocking your domain** from loading the editor. This is a security feature - they need to verify that your domain is authorized to use their embed editor.

**The issue:** Your domain (likely `localhost:3000` or your deployment domain) is **NOT whitelisted** in your Dynamic Mockups account for website key `ZqruUQEIF9Hc`.

---

## ✅ How to Fix

### Step 1: Go to Dynamic Mockups Dashboard

1. Visit: **https://dynamicmockups.com/dashboard**
2. Log in to your account

### Step 2: Find Your Website Key Settings

1. Look for **"Website Keys"** or **"Integrations"** section
2. Find your website key: **`ZqruUQEIF9Hc`**
3. Click to view/edit settings

### Step 3: Add Your Domain(s)

You need to whitelist the domains where your app runs:

#### For Development:
```
http://localhost:3000
localhost:3000
```

#### For Production (when deployed):
```
https://yourdomain.com
yourdomain.com
```

**Important:** Add BOTH formats (with and without protocol) to be safe.

### Step 4: Save and Wait

1. Click **Save** or **Update**
2. Wait **2-5 minutes** for the changes to propagate
3. **Clear your browser cache** (Ctrl+Shift+Delete)
4. **Hard refresh** your app (Ctrl+Shift+R or Cmd+Shift+R)

---

## 🧪 Testing After Fix

### Step 1: Open Your App
Navigate to the POD mockup editor page

### Step 2: Open Browser Console (F12)
Watch for these messages:

#### ✅ Success Signs:
```
✅ SDK initialized successfully
✅ Iframe is ready!
```

#### ❌ Still Failing:
```
Failed to load resource: 400 (Bad Request)
Max retry attempts reached
```

### Step 3: Try Creating a Mockup
1. Select a mockup template
2. Upload your design
3. Try to export

---

## 🔧 Alternative Solutions

### Option 1: Check Domain Format

Try adding domains in different formats:
- `http://localhost:3000`
- `localhost:3000`
- `localhost`
- `127.0.0.1:3000`
- `http://127.0.0.1:3000`

### Option 2: Create a New Website Key

If the existing key has issues:

1. Go to Dynamic Mockups Dashboard
2. Create a **new website key**
3. Add your domains during setup
4. Copy the new key
5. Update your `.env.local`:
   ```env
   NEXT_PUBLIC_DYNAMIC_MOCKUPS_KEY=your_new_key_here
   ```
6. Restart your dev server:
   ```bash
   # Press Ctrl+C, then:
   npm run dev
   ```

### Option 3: Contact Support

If whitelisting doesn't work:

**Email:** support@dynamicmockups.com

**Subject:** Domain Validation Error - Unable to Load Embed Editor

**Message Template:**
```
Hi Dynamic Mockups Support,

I'm getting a 400 error when trying to load the embed editor:
"Failed to validate integration domain"

My website key: ZqruUQEIF9Hc
Domains I'm trying to use:
- Development: localhost:3000
- Production: [your domain if deployed]

I've tried adding these domains in the dashboard but still getting errors.
Could you please help verify:
1. Is my domain correctly whitelisted?
2. Are there any additional settings needed?
3. Does my account have embed/custom mode access?

Error details:
- Error: Max retry attempts reached. Unable to validate client.
- Endpoint: embed-proxy.dynamicmockups.com/api/mockup-editor-iframe-integrations/validate-integration-domain

Thank you!
```

---

## 🎯 Your Current Configuration

### Website Key (Client-side):
```
ZqruUQEIF9Hc
```
**Used for:** Embed editor iframe

### API Key (Server-side):
```
08552981-e681-4022-92c7-d746e3352156:...
```
**Used for:** Direct API calls (not related to this domain validation error)

### Current Domain:
```
localhost:3000
```
(or check your browser URL bar)

---

## 📋 Quick Fix Checklist

- [ ] Logged into Dynamic Mockups Dashboard
- [ ] Found website key `ZqruUQEIF9Hc` settings
- [ ] Added `localhost:3000` to allowed domains
- [ ] Added `http://localhost:3000` to allowed domains
- [ ] Saved changes and waited 2-5 minutes
- [ ] Cleared browser cache
- [ ] Hard refreshed app (Ctrl+Shift+R)
- [ ] Checked browser console for errors
- [ ] Tested mockup editor

---

## 🔍 Understanding the Error

### What's Happening:

1. Your app loads the Dynamic Mockups iframe
2. The iframe tries to validate: "Is localhost:3000 allowed to use key ZqruUQEIF9Hc?"
3. Dynamic Mockups API checks their whitelist
4. **Domain not found** → Returns 400 error
5. SDK retries 6 times
6. All attempts fail → "Max retry attempts reached"

### Why This Security Exists:

- Prevents unauthorized use of your website key
- Stops other domains from stealing/abusing your account
- Required for CORS and iframe security

---

## 🚀 After It's Fixed

Once domain validation passes, you should see:

```
✅ SDK initialized successfully
✅ Iframe is ready!
✅ Domain validation passed
```

And you'll be able to:
- Load the mockup editor
- Browse collections
- Create mockups
- Export mockups (if custom mode is enabled)

---

## 💡 Pro Tips

### For Development:
Always whitelist `localhost:3000` in your Dynamic Mockups account when developing locally.

### For Production:
Before deploying, add your production domain (e.g., `https://snap2listing.com`) to the whitelist.

### Multiple Environments:
You can have multiple domains whitelisted for one website key:
- `localhost:3000` (dev)
- `staging.yourdomain.com` (staging)
- `yourdomain.com` (production)

### Wildcard Support:
Check if Dynamic Mockups supports wildcards:
- `*.yourdomain.com` (all subdomains)

---

## 📞 Need More Help?

1. **Check Console Logs:** Press F12, look for specific error messages
2. **Dynamic Mockups Docs:** https://docs.dynamicmockups.com
3. **Support Email:** support@dynamicmockups.com
4. **Dashboard:** https://dynamicmockups.com/dashboard

---

## ✅ Success Criteria

Your fix is complete when:
1. ✅ No 400 errors in console
2. ✅ No "Unable to validate client" errors
3. ✅ Mockup editor iframe loads fully
4. ✅ You can see mockup collections
5. ✅ You can interact with the editor

---

**Last Updated:** Now
**Your Website Key:** ZqruUQEIF9Hc
**Issue:** Domain validation failing (400 error)
**Solution:** Whitelist your domain in Dynamic Mockups dashboard
