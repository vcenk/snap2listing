# Etsy OAuth Setup Guide

## Step 1: Register Your App on Etsy

1. Go to https://www.etsy.com/developers/register
2. Click **"Create a New App"**
3. Fill in app details:
   - **App Name**: Snap2Listing
   - **Description**: AI-powered Etsy listing creation tool
   - **Tell us about your app**: Generate product listings with AI
   - **Will your app have users?**: Yes

## Step 2: Configure OAuth Settings

### Development (Local Testing)

1. Go to https://www.etsy.com/developers/your-apps
2. Click on your app
3. Scroll to **"OAuth Callback URLs"**
4. Click **"Add URL"**
5. Enter: `http://localhost:3000/api/etsy/callback`
6. Click **"Save"**

### Production (Vercel)

Once deployed, add another callback URL:
- `https://your-domain.vercel.app/api/etsy/callback`

**Important**: Both URLs must be registered before OAuth will work!

## Step 3: Set OAuth Scopes

Scroll to **"OAuth Scopes"** section and select:
- ✅ `listings_r` - Read listings
- ✅ `listings_w` - Write listings
- ✅ `shops_r` - Read shops

Click **"Update Scopes"**

## Step 4: Get Your Credentials

1. Find the **"Keystring"** - This is your `ETSY_CLIENT_ID`
2. Find the **"Shared Secret"** - This is your `ETSY_CLIENT_SECRET`
3. Copy both to your `.env.local`:

```env
ETSY_CLIENT_ID=your_keystring_here
ETSY_CLIENT_SECRET=your_shared_secret_here
ETSY_REDIRECT_URI=http://localhost:3000/api/etsy/callback
```

## Step 5: Understanding App Status

### Development Mode
- Your app starts in **"Development"** mode
- Can only connect to **your own Etsy shop**
- Perfect for testing
- No review required

### Production Mode
- After testing, submit for review
- Can connect to any user's shop
- Etsy reviews your app (takes 1-2 weeks)
- Required before public launch

**For now**: Keep it in Development mode and test with your own shop!

## Step 6: Test the Connection

1. Restart your dev server: `npm run dev`
2. Go to http://localhost:3000/app/shops
3. Click **"Connect Etsy Shop"**
4. You should be redirected to Etsy's OAuth page
5. Click **"Allow Access"**
6. You'll be redirected back to your app
7. Your shop should appear in the Shops list

## Troubleshooting

### Error: "redirect_uri_mismatch"
**Solution**:
- Check that `http://localhost:3000/api/etsy/callback` is added in Etsy Developer Portal
- Must match EXACTLY (no trailing slash)
- Check for typos

### Error: "invalid_scope"
**Solution**:
- Ensure you selected `listings_r`, `listings_w`, `shops_r` scopes
- Click "Update Scopes" after selecting

### Error: "The app cannot be used by this account"
**Solution**:
- Your app is in Development mode
- You can only connect your own Etsy shop
- This is normal! Once you submit for review, it will work for all users

### Can't find my shop after connecting
**Solution**:
- Make sure you have an active Etsy shop
- Shop must be in "Open" status, not "Vacation" mode
- Check browser console for error messages

### Access token expired
**Solution**:
- Etsy tokens expire after 3600 seconds (1 hour)
- The app automatically refreshes tokens using `refresh_token`
- If refresh fails, you'll need to reconnect

## Production Deployment Checklist

Before deploying to Vercel:

- [ ] Add production callback URL to Etsy app settings
- [ ] Update `ETSY_REDIRECT_URI` in Vercel environment variables
- [ ] Test OAuth flow on production URL
- [ ] Submit app for Etsy review (if you want public access)

## Etsy API Documentation

- OAuth Guide: https://developers.etsy.com/documentation/essentials/authentication
- API Reference: https://developers.etsy.com/documentation/reference
- Rate Limits: 10 requests per second per app

## Need Help?

Check the Etsy API Forum: https://community.etsy.com/t5/Etsy-API/bd-p/developer
