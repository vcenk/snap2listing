# 🧪 Testing Checklist - AI Content Generation Integration

## ✅ **What Was Updated**

### **Files Modified:**
1. `components/CreateListing/UploadStep.tsx`
   - Added `selectedChannels` prop
   - Added `aiGenerated` to onNext callback
   - Calls `/api/generate-listings` after upload
   - Shows loading state during generation

2. `components/CreateListing/ListingWizard.tsx`
   - Stores AI-generated listings in state
   - Pre-populates baseData with AI content
   - Pre-fills channel overrides with AI-specific content
   - Passes selected channel slugs to UploadStep

### **Database:**
- ✅ Migration completed (multi-channel schema)
- ✅ Removed duplicate Facebook channel

### **API Endpoints:**
- ✅ `/api/channels` - Working
- ✅ `/api/generate-listings` - Working (tested via curl)

---

## 🎯 **Manual Testing Steps**

### **Test 1: Basic Flow (Single Channel)**
1. Open http://localhost:3001
2. Go to Create Listing
3. Select **Etsy** only
4. Click "Start Creating Listing"
5. Upload a product image
6. Add description: "Handmade ceramic mug"
7. Select category, enter price
8. Click "Continue"
9. **Expected:** 
   - Button shows "Generating AI Content..."
   - After ~3-5 seconds, proceeds to Details step
   - Title and description are pre-filled with AI content

### **Test 2: Multi-Channel Flow**
1. Select **Amazon**, **Etsy**, **Shopify**
2. Start workflow
3. Upload product image
4. Continue through upload
5. **Expected:**
   - AI generates content for all 3 channels
   - Details step shows AI-generated base content
   - Optimize step shows channel-specific overrides
   - Each tab (Amazon/Etsy/Shopify) has unique content

### **Test 3: Error Handling**
1. Disconnect internet or set invalid `OPENAI_API_KEY`
2. Upload image
3. **Expected:**
   - Generation fails gracefully
   - Continues to next step with manual entry
   - No crashes

### **Test 4: Vision Analysis (Advanced)**
Test in browser console:
```javascript
const response = await fetch('/api/generate-listings', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
    description: 'Watch',
    selectedChannels: ['amazon', 'etsy']
  })
});
const data = await response.json();
console.log(data);
```

**Expected:** Returns listings with:
- `amazon`: title, bullet_points, description, keywords
- `etsy`: title, description, tags, materials

---

## 🐛 **Known Issues to Check**

### **Issue 1: Base64 Images**
- Upload uses base64 data URLs
- OpenAI Vision API might need public URLs
- **Fix if needed**: Upload to Supabase Storage first

### **Issue 2: Channel Overrides Timing**
- Overrides set before channels fully loaded
- **Check**: Console for errors about undefined channel IDs

### **Issue 3: Price/Category Missing**
- Some channels require specific formats
- **Check**: Validation warnings in response

---

## 📊 **Success Criteria**

- [ ] AI generates content within 5 seconds
- [ ] Content quality is relevant to product
- [ ] Channel-specific fields populated correctly
  - Amazon: bullet_points exist
  - Etsy: tags array has 5-13 items
  - Shopify: alt_text exists for images
- [ ] User can edit AI-generated content
- [ ] Workflow continues if AI fails
- [ ] No console errors
- [ ] No TypeScript errors

---

## 🔧 **If Tests Fail**

### **Generation Not Working**
```bash
# Check API endpoint directly
Invoke-WebRequest -Uri http://localhost:3001/api/generate-listings `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"image":"https://images.unsplash.com/photo-1523275335684-37898b6baf30","description":"Test","selectedChannels":["etsy"]}'
```

### **Base64 Image Issue**
Update UploadStep to upload image first:
```typescript
// Upload to Supabase Storage
const { data: uploadData } = await supabase.storage
  .from('product-images')
  .upload(`uploads/${Date.now()}.jpg`, file);

const publicUrl = supabase.storage
  .from('product-images')
  .getPublicUrl(uploadData.path).data.publicUrl;

// Use publicUrl in API call instead of base64
```

### **Channel Slugs Mismatch**
Check channels table slugs match code:
```sql
SELECT slug FROM channels;
```

Should be: `amazon`, `etsy`, `shopify`, `ebay`, `tiktok`, `facebook-instagram`

---

## 📝 **Next Steps After Testing**

1. ✅ Verify generation works end-to-end
2. ⏳ Add image upload to Supabase (if base64 fails)
3. ⏳ Add export/download functionality
4. ⏳ Test with real products
5. ⏳ Performance optimization (caching, parallel)

---

**Current Status**: Integration complete, ready for testing
**Priority**: High - Core feature
**Estimated Test Time**: 15-20 minutes
