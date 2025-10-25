# 🤖 AI Content Generation - Implementation Guide

## ✅ **What's Been Created**

### **1. API Endpoints**
```
✅ GET  /api/channels                - Fetch available channels (EXISTS)
✅ POST /api/generate-listings       - Multi-channel AI generation (NEW)
✅ POST /api/generate-text           - Single Etsy generation (EXISTS)
✅ POST /api/seo/draft              - SEO Brain optimization (EXISTS)
✅ POST /api/seo/optimize           - SEO refinement (EXISTS)
```

### **2. Services**
```
✅ lib/services/productListingGenerator.ts  - Multi-channel logic
✅ lib/api/openai.ts                        - Etsy-focused OpenAI
✅ lib/api/openai-vision.ts                 - Vision API integration (NEW)
✅ lib/seo/seo-brain.ts                     - SEO optimization engine
```

---

## 🎯 **How Content Generation Works**

### **Option 1: Simple Flow (Existing)**
```
Upload Image
    ↓
POST /api/generate-text
    ↓
Returns: {title, tags, description, materials}
```

**Used by**: Etsy-only workflow

---

### **Option 2: Multi-Channel Flow (NEW)**
```
1. Upload Image
    ↓
2. POST /api/generate-listings
   {
     image: "https://...",
     description: "...",
     selectedChannels: ["amazon", "etsy", "shopify"],
     attributes: {brand, color, category, price}
   }
    ↓
3. Returns: {
     listings: [
       {
         channel: "amazon",
         ai_generated: {title, bullet_points, description, keywords},
         validation_status: {valid, warnings, errors}
       },
       {
         channel: "etsy",
         ai_generated: {title, description, tags, materials},
         ...
       }
     ],
     detected_product_type: "Apparel",
     taxonomy_mappings: {...}
   }
```

**Used by**: New multi-channel wizard

---

### **Option 3: Vision-Enhanced Flow (BEST)**
```
1. Upload Image
    ↓
2. Analyze with Vision
   analyzeProductImage(imageUrl, userDescription)
    ↓
3. Returns: {
     productType: "Apparel",
     category: "T-Shirt",
     detectedAttributes: {colors, materials, style, occasions},
     suggestedKeywords: [...],
     confidence: 0.95
   }
    ↓
4. Generate Multi-Channel Content
   generateMultiChannelContent(imageUrl, analysis, description, channels)
    ↓
5. Returns optimized content for each channel
```

**Usage**:
```typescript
import { generateCompleteListing } from '@/lib/api/openai-vision';

const result = await generateCompleteListing(
  'https://example.com/product.jpg',
  'Handmade cotton t-shirt with graphic print',
  ['amazon', 'etsy', 'shopify']
);

// result.analysis = Product analysis from Vision
// result.content = {amazon: {...}, etsy: {...}, shopify: {...}}
// result.metadata = Generation info
```

---

## 📊 **API Request/Response Examples**

### **POST /api/generate-listings**

**Request:**
```json
{
  "image": "https://example.com/product.jpg",
  "description": "Handmade leather wallet with RFID blocking",
  "selectedChannels": ["amazon", "etsy"],
  "attributes": {
    "brand": "CraftCo",
    "color": "Brown",
    "material": "Leather",
    "price": 49.99,
    "category": "Accessories"
  }
}
```

**Response:**
```json
{
  "success": true,
  "listings": [
    {
      "channel": "amazon",
      "ai_generated": {
        "title": "CraftCo Leather Wallet - RFID Blocking...",
        "bullet_points": [
          "✓ Premium full-grain leather construction",
          "✓ RFID blocking technology protects cards",
          "✓ Slim design fits comfortably in pocket",
          "✓ Hand-stitched for durability",
          "✓ Perfect gift for men and women"
        ],
        "description": "Protect your cards in style...",
        "search_keywords": "leather wallet, rfid blocking, slim wallet...",
        "alt_text": "Brown leather RFID wallet by CraftCo"
      },
      "requires_user_input": ["gtin", "sku", "dimensions", "weight"],
      "compatibility_rules": {
        "title_max": 200,
        "description_max": 2000
      },
      "validation_status": {
        "valid": true,
        "warnings": [],
        "errors": []
      }
    },
    {
      "channel": "etsy",
      "ai_generated": {
        "title": "Handmade Leather Wallet RFID Blocking Slim Minimalist Gift",
        "description": "Discover the perfect blend of style and security...",
        "tags": ["leather wallet", "rfid blocking", "handmade", "gift", "minimalist", ...],
        "materials": ["leather", "thread", "rfid chip"]
      },
      "requires_user_input": ["price", "quantity", "who_made", "when_made"],
      "validation_status": {
        "valid": true,
        "warnings": [],
        "errors": []
      }
    }
  ],
  "detected_product_type": "Accessories",
  "taxonomy_mappings": {
    "amazon": "Clothing, Shoes & Jewelry > Accessories > Wallets",
    "etsy": "Accessories > Bags & Purses > Wallets"
  }
}
```

---

## 🔧 **Integration Steps**

### **Step 1: Update UploadStep Component**
After image upload, call the generation endpoint:

```typescript
// In UploadStep.tsx or similar
const handleUpload = async (imageUrl: string, description: string) => {
  // Call multi-channel generation
  const response = await fetch('/api/generate-listings', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      image: imageUrl,
      description,
      selectedChannels: selectedChannelIds, // From context
      attributes: {
        category: selectedCategory,
        price: enteredPrice,
      }
    })
  });

  const result = await response.json();
  
  if (result.success) {
    // Store listings in state
    setGeneratedListings(result.listings);
    setDetectedProductType(result.detected_product_type);
    
    // Populate base data
    const firstListing = result.listings[0];
    setBaseData({
      title: firstListing.ai_generated.title,
      description: firstListing.ai_generated.description,
      category: result.detected_product_type,
      ...
    });
  }
};
```

### **Step 2: Update GenericDetailsStep**
Pre-populate with AI-generated content:

```typescript
// GenericDetailsStep.tsx
const [title, setTitle] = useState(props.aiGenerated?.title || '');
const [description, setDescription] = useState(props.aiGenerated?.description || '');
```

### **Step 3: Update BaseOverridesEditor**
Show channel-specific AI content:

```typescript
// BaseOverridesEditor.tsx
{channels.map(channel => {
  const listing = generatedListings.find(l => l.channel === channel.slug);
  return (
    <Tab key={channel.id}>
      <TextField
        label="Title"
        value={listing?.ai_generated.title}
        // ... editable
      />
      <TextField
        label="Description"
        value={listing?.ai_generated.description}
        multiline
      />
      {/* Show channel-specific fields */}
    </Tab>
  );
})}
```

---

## 🚀 **Testing**

### **Test 1: Basic Generation**
```bash
curl -X POST http://localhost:3000/api/generate-listings \
  -H "Content-Type: application/json" \
  -d '{
    "image": "https://example.com/test.jpg",
    "description": "Test product",
    "selectedChannels": ["etsy"]
  }'
```

### **Test 2: Multi-Channel**
```bash
curl -X POST http://localhost:3000/api/generate-listings \
  -H "Content-Type: application/json" \
  -d '{
    "image": "https://example.com/product.jpg",
    "description": "Handmade ceramic mug",
    "selectedChannels": ["amazon", "etsy", "shopify", "tiktok", "facebook"]
  }'
```

### **Test 3: With Vision**
```typescript
import { analyzeProductImage } from '@/lib/api/openai-vision';

const analysis = await analyzeProductImage(
  'https://example.com/product.jpg',
  'Optional description'
);

console.log(analysis.productType);      // "Home & Kitchen"
console.log(analysis.category);         // "Coffee Mug"
console.log(analysis.detectedAttributes); // {colors: [...], materials: [...]}
```

---

## 📝 **Environment Variables Required**

```env
OPENAI_API_KEY=sk-...              # For all AI generation
NEXT_PUBLIC_SUPABASE_URL=...       # For channels table
SUPABASE_SERVICE_ROLE_KEY=...      # For server-side ops
```

---

## ⚡ **Performance Tips**

1. **Cache channel data**: Load channels once, store in context
2. **Parallel generation**: Generate all channels simultaneously
3. **Progressive enhancement**: Show basic content first, enhance with AI
4. **Token optimization**: Use `gpt-4o-mini` for simple tasks, `gpt-4o` for complex
5. **Image detail**: Use `low` detail for content, `high` for analysis

---

## 🐛 **Troubleshooting**

### **Content Not Generating**
- ✅ Check `OPENAI_API_KEY` is set
- ✅ Verify image URL is accessible (https://)
- ✅ Check Supabase channels table has data
- ✅ Look at server logs for errors

### **Low Quality Output**
- ✅ Provide better product description
- ✅ Use Vision API for richer analysis
- ✅ Adjust temperature (lower = more focused)
- ✅ Add more attributes (brand, material, etc.)

### **Validation Errors**
- ✅ Check character limits per channel
- ✅ Verify tag counts (Etsy: 13 max)
- ✅ Ensure required fields are populated

---

## 🎯 **Next Steps**

1. ✅ Database migration (run `MULTI_CHANNEL_MIGRATION_SIMPLE.sql`)
2. ✅ Test `/api/generate-listings` endpoint
3. ✅ Update workflow components to use new endpoint
4. ⏳ Add export functionality (CSV/JSON)
5. ⏳ Add image generation integration
6. ⏳ End-to-end testing

---

**Status**: Core generation ready, integration pending
**Priority**: High - Required for multi-channel workflow
