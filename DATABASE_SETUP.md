# Database Setup Guide

## Phase 1: Save Listings to Database ✅ COMPLETED

This guide will help you set up the Supabase database to enable saving listings.

## Prerequisites

- Supabase project created
- Environment variables configured in `.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_KEY`

## Setup Steps

### 1. Run Database Schema

Go to your Supabase Dashboard → SQL Editor and run these files **in order**:

1. **`supabase-schema.sql`** - Creates all tables, indexes, and policies
2. **`supabase-schema-update.sql`** - Adds additional Etsy fields
3. **`supabase-demo-user.sql`** - Creates a demo user for testing

### 2. Verify Tables Created

In Supabase Dashboard → Table Editor, you should see:
- `users`
- `listings`
- `shops`
- `usage_logs`

### 3. Test the Application

1. **Create a Listing**:
   - Go to http://localhost:3007/app/create
   - Upload an image
   - Complete all steps (Details, Images, Video, Review)
   - Click "Save to Listings"
   - You should see "✅ Listing saved successfully!"

2. **View Listings**:
   - Go to http://localhost:3007/app/listings
   - You should see your saved listing
   - Test delete functionality

3. **Check Overview Stats**:
   - Go to http://localhost:3007/app/overview
   - You should see:
     - Images used count
     - Videos used count
     - Total listings count
     - Published count

## What's Working Now

✅ **Save Listings** - All listing data (images, video, text) saved to Supabase
✅ **View Listings** - Fetch and display saved listings
✅ **Delete Listings** - Remove listings from database
✅ **Usage Tracking** - Track images and videos generated
✅ **User Stats** - Display real-time usage statistics

## API Endpoints Created

- `POST /api/listings` - Create new listing
- `GET /api/listings?userId=X` - Get user's listings
- `PUT /api/listings` - Update listing
- `DELETE /api/listings?id=X&userId=Y` - Delete listing
- `GET /api/users/stats?userId=X` - Get user statistics

## Database Tables

### users
- Stores user profiles, subscription info, and usage counts
- Tracks billing periods and plan limits

### listings
- Stores all listing data (title, description, tags, price)
- Stores generated images and video
- Tracks Etsy-specific fields (materials, occasion, etc.)
- Includes status (draft, ready, published)

### shops
- Stores connected Etsy shop information
- OAuth tokens for Etsy API

### usage_logs
- Detailed usage tracking for billing
- Records costs per generation

## Next Steps

### Phase 2: User Authentication
- Implement Supabase Auth
- Replace `demo-user-id` with real user sessions
- Add protected routes
- Login/signup pages

### Phase 3: Etsy Integration
- OAuth connection to Etsy
- Publish listings to Etsy
- Sync status back to database

### Phase 4: Stripe Payments
- Subscription checkout
- Plan limit enforcement
- Webhook handling

## Troubleshooting

### Error: "User not found"
- Run `supabase-demo-user.sql` to create the demo user
- Check that `id = 'demo-user-id'` in the users table

### Error: "Failed to save listing"
- Check Supabase logs in Dashboard → Logs
- Verify all environment variables are set
- Check browser console for detailed error messages

### Listings not showing up
- Check browser console for API errors
- Verify `user_id` matches in listings table
- Check Row Level Security (RLS) policies

## Files Created

- `lib/supabase/client.ts` - Client-side Supabase client
- `lib/supabase/server.ts` - Server-side Supabase admin client
- `app/api/listings/route.ts` - Listings CRUD API
- `app/api/users/stats/route.ts` - User statistics API
- `components/CreateListing/ListingWizard.tsx` - Updated to save to DB
- `app/(dashboard)/app/listings/page.tsx` - Updated to fetch from DB
- `app/(dashboard)/app/overview/page.tsx` - Updated with real stats

## Demo User Credentials

- **User ID**: `demo-user-id`
- **Email**: `demo@snap2listing.com`
- **Plan**: Starter (200 images, 5 videos/month)
- **Status**: Active

---

**Need help?** Check the Supabase Dashboard logs or browser console for error messages.
