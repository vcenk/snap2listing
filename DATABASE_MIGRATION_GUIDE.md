# 🗄️ Database Migration Guide - Multi-Channel Support

## ✅ **Yes, Database Update Required**

Your current `listings` table is designed for single-channel (Etsy-focused) listings. To support the new AI Product Listing Generator with multi-channel capabilities, we need to migrate to a more flexible schema.

---

## 📊 **What Changes**

### **Before (Current Schema)**
```sql
CREATE TABLE listings (
  id UUID,
  user_id UUID,
  title TEXT,              -- Single title
  description TEXT,        -- Single description
  price DECIMAL,
  category TEXT,
  tags TEXT[],
  materials TEXT[],
  status TEXT,
  images JSONB,
  video JSONB,
  etsy_listing_id TEXT,    -- Etsy-specific
  ...
);
```

### **After (Multi-Channel Schema)**
```sql
CREATE TABLE listings (
  id UUID,
  user_id UUID,
  
  -- Base product data (universal)
  base JSONB,                    -- {title, description, price, category, images, quantity}
  
  -- Channel-specific overrides
  channels JSONB,                -- [{channelId, channelSlug, title, description, tags, ...}]
  selected_channels TEXT[],      -- ['amazon', 'etsy', 'shopify']
  
  -- AI metadata
  detected_product_type TEXT,    -- 'Apparel', 'Jewelry', etc.
  taxonomy_mappings JSONB,       -- {amazon: '...', etsy: '...'}
  seo_score INTEGER,
  ai_generated_at TIMESTAMP,
  validation_status JSONB,
  
  -- Export tracking
  export_history JSONB,
  
  -- Workflow state (for resuming)
  last_step TEXT,
  last_channel_tab TEXT,
  scroll_position INTEGER,
  
  -- Original assets
  original_image TEXT,
  
  -- Legacy fields (backward compatible)
  status TEXT,
  ...
);
```

---

## 🆕 **New Tables Created**

### 1. **`channels`** - Dynamic Channel Configuration
Stores all available sales channels and their validation rules.

```sql
CREATE TABLE channels (
  id UUID,
  slug TEXT,                    -- 'amazon', 'etsy', etc.
  name TEXT,                    -- 'Amazon', 'Etsy', etc.
  export_format TEXT,           -- 'csv', 'api'
  config JSONB,                 -- {description, logo}
  validation_rules JSONB,       -- {title: {maxLength: 200}, ...}
  enabled BOOLEAN,
  ...
);
```

**Pre-populated with:** Amazon, Etsy, TikTok, Shopify, Facebook

### 2. **`listing_exports`** - Export History Tracking
Tracks every time a listing is exported to a channel.

```sql
CREATE TABLE listing_exports (
  id UUID,
  listing_id UUID,
  user_id UUID,
  channel TEXT,
  export_format TEXT,
  export_data JSONB,
  status TEXT,                  -- 'pending', 'success', 'failed'
  error_message TEXT,
  external_id TEXT,             -- Platform-specific ID
  exported_at TIMESTAMP,
  ...
);
```

### 3. **`ai_generation_history`** - AI Usage Tracking
Tracks all AI generation requests for analytics and billing.

```sql
CREATE TABLE ai_generation_history (
  id UUID,
  user_id UUID,
  listing_id UUID,
  generation_type TEXT,         -- 'listing_content', 'image', 'video'
  input_data JSONB,
  output_data JSONB,
  channels TEXT[],
  tokens_used INTEGER,
  cost_usd DECIMAL,
  status TEXT,
  ...
);
```

---

## 🔧 **Migration Features**

### ✅ **Backward Compatible**
- Existing listings are automatically migrated
- Old single-channel data moved to `base` JSONB
- Assumed to be Etsy listings by default
- No data loss

### ✅ **New Helper Functions**
```sql
-- Get listings filtered by channel
get_listings_by_channel(user_id, channel)

-- Get channel-specific data
get_channel_data(listing_id, channel)
```

### ✅ **Analytics Views**
```sql
-- Listing stats per channel
listing_stats_by_channel

-- AI generation usage stats
ai_generation_stats
```

---

## 📋 **How to Apply Migration**

### Step 1: Backup (Recommended)
```bash
# In Supabase Dashboard
1. Go to Database > Backups
2. Create manual backup before migration
```

### Step 2: Run Migration

**Option A: Fresh Install (Recommended if no existing data)**
```bash
# In Supabase SQL Editor
1. Open: docs/MULTI_CHANNEL_MIGRATION_SIMPLE.sql
2. Copy entire file content
3. Paste into SQL Editor
4. Click "Run"
5. Verify success messages
```

**Option B: With Existing Data**
```bash
# In Supabase SQL Editor
1. Open: docs/MULTI_CHANNEL_MIGRATION.sql (full version)
2. Copy entire file content
3. Paste into SQL Editor
4. Click "Run"
5. Verify success messages
```

**Note**: If you get error about "column title does not exist", use Option A (SIMPLE version).

### Step 3: Verify
```sql
-- Check channels were created
SELECT * FROM public.channels;

-- Check listings were migrated
SELECT 
  id, 
  base->>'title' as title,
  selected_channels 
FROM public.listings 
LIMIT 5;
```

---

## 🔍 **Data Structure Examples**

### Example: Multi-Channel Listing
```json
{
  "id": "uuid-123",
  "user_id": "uuid-456",
  "base": {
    "title": "Handcrafted Leather Wallet",
    "description": "Premium leather wallet...",
    "price": 49.99,
    "category": "Accessories",
    "images": ["url1", "url2"],
    "quantity": 10
  },
  "channels": [
    {
      "channelId": "uuid-amazon",
      "channelSlug": "amazon",
      "title": "Premium Leather Wallet - RFID Blocking - Gift Box",
      "description": "Full Amazon description with bullet points...",
      "tags": ["leather", "wallet", "rfid"],
      "bullets": ["Feature 1", "Feature 2", ...]
    },
    {
      "channelId": "uuid-etsy",
      "channelSlug": "etsy",
      "title": "Handmade Leather Wallet",
      "description": "Etsy storytelling description...",
      "tags": ["handmade", "leather", "wallet"],
      "materials": ["leather", "thread"]
    }
  ],
  "selected_channels": ["amazon", "etsy"],
  "detected_product_type": "Accessories",
  "seo_score": 85,
  "validation_status": {
    "amazon": {"valid": true, "warnings": []},
    "etsy": {"valid": true, "warnings": ["Title could be longer"]}
  }
}
```

---

## 🎯 **Benefits**

| Feature | Before | After |
|---------|--------|-------|
| **Channels** | Single (Etsy) | Multiple (5+) |
| **Flexibility** | Fixed schema | JSONB flexibility |
| **AI Tracking** | None | Full history |
| **Export History** | None | Complete audit trail |
| **SEO Scoring** | None | Built-in |
| **Validation** | Manual | Automated per channel |

---

## ⚠️ **Important Notes**

### 1. **Run Once**
The migration is idempotent - safe to run multiple times. It uses `IF NOT EXISTS` and `ON CONFLICT DO NOTHING`.

### 2. **Backward Compatible**
Old code reading `title`, `description` fields will still work. But new code should read from `base` JSONB.

### 3. **Index Performance**
New GIN indexes on JSONB and array columns ensure fast queries.

### 4. **RLS Policies**
All new tables have Row Level Security enabled. Users can only see their own data.

---

## 🔄 **Migration Rollback (If Needed)**

If something goes wrong, you can rollback:

```sql
-- Drop new tables
DROP TABLE IF EXISTS public.listing_exports CASCADE;
DROP TABLE IF EXISTS public.ai_generation_history CASCADE;
DROP TABLE IF EXISTS public.channels CASCADE;

-- Remove new columns (optional - they don't break anything)
ALTER TABLE public.listings 
DROP COLUMN IF EXISTS base,
DROP COLUMN IF EXISTS channels,
DROP COLUMN IF EXISTS selected_channels,
DROP COLUMN IF EXISTS detected_product_type,
DROP COLUMN IF EXISTS taxonomy_mappings,
DROP COLUMN IF EXISTS seo_score;

-- Restore from backup (if needed)
```

---

## 📚 **Next Steps**

After running migration:

1. ✅ **Update API endpoints** to use new schema
2. ✅ **Update UI components** to read from `base` and `channels`
3. ✅ **Test listing creation** with multi-channel selection
4. ✅ **Test export functionality** for each channel
5. ✅ **Monitor AI generation costs** via `ai_generation_history`

---

## 📞 **Support**

If you encounter issues:
- Check Supabase logs for errors
- Verify RLS policies are correct
- Ensure user has proper permissions
- Review migration output messages

---

**Migration File**: `docs/MULTI_CHANNEL_MIGRATION.sql`  
**Status**: Ready to run  
**Risk Level**: Low (backward compatible)  
**Estimated Time**: < 1 minute  
**Downtime**: None (online migration)
