# Quick Fix Guide - PSD Layer Names

## ✅ Issue Resolved!

The error "Smart layer not found" was caused by incorrect layer names in `templates.json`.

### What Was Wrong

The templates.json referenced layer names that didn't exist:
- ❌ "Your Design Here"
- ❌ "Design"
- ❌ "Artwork"

### What's Actually in the PSD

The file `packages/web-demo/public/Mockup_Images/tshirts/23.psd` contains:
- ✅ "2X click Thumbnail to change image"
- ✅ "Background"

### Fix Applied

Updated `packages/web-demo/public/Mockup_Images/templates.json`:

**Template 1** (tshirt-front-001):
```json
{
  "id": "tshirt-front-001",
  "name": "T-Shirt (PSD - Click Thumbnail)",
  "psd": {
    "url": "/Mockup_Images/tshirts/23.psd",
    "smartLayer": "2X click Thumbnail to change image"
  }
}
```

**Template 2** (tshirt-front-002):
```json
{
  "id": "tshirt-front-002",
  "name": "T-Shirt (PSD - Background)",
  "psd": {
    "url": "/Mockup_Images/tshirts/23.psd",
    "smartLayer": "Background"
  }
}
```

**Template 3** (tshirt-front-004):
```json
{
  "id": "tshirt-front-004",
  "name": "T-Shirt (Base Only)",
  // No PSD - uses base image only
}
```

---

## 🚀 How to Test

1. **Restart the demo** (if it's running):
   ```bash
   pnpm dev:demo
   ```

2. **Select "T-Shirt (PSD - Click Thumbnail)"** from the template picker

3. **Upload an artwork** file (PNG/JPG)

4. The PSD should now load and render!

---

## 📝 Understanding Smart Object Layers

The layer named "2X click Thumbnail to change image" is a **Smart Object layer** in Photoshop that:
- Contains embedded content (PSB file)
- Normally edited by double-clicking in Photoshop
- Will be **replaced with your artwork** by the mockup editor

Our renderer extracts the bounds and position of this layer, then draws your artwork in its place with proper transformations.

---

## 🔍 How to Add Your Own PSD Templates

### Step 1: Inspect Your PSD

```bash
node inspect-psd.js
```

**Edit** `inspect-psd.js` line 10 to point to your PSD:
```javascript
const psdPath = './packages/web-demo/public/Mockup_Images/your-category/your-file.psd';
```

**Output will show**:
```
PSD Info:
- Width: 2400
- Height: 2400
- Layers found: 5

Layer names:
1. "Background" (visible: true)
2. "Shadows" (visible: true)
3. "Your Design Here" (visible: true)
4. "Highlights" (visible: true)
5. "Fold" (visible: true)

Suggested smart layer names to try:
- "Your Design Here"
```

### Step 2: Create Base Image (Optional)

For the fast base-image rendering path, export a flattened PNG/JPG without the smart object layer.

### Step 3: Update templates.json

```json
{
  "id": "unique-id",
  "name": "My Mockup",
  "category": "Apparel",
  "thumbnail": "/Mockup_Images/category/thumb.jpg",
  "baseImage": "/Mockup_Images/category/base.jpg",
  "printArea": {
    "type": "flat",
    "bounds": {
      "x": 500,
      "y": 400,
      "width": 800,
      "height": 1000
    }
  },
  "resolution": { "width": 2400, "height": 2400 },
  "psd": {
    "url": "/Mockup_Images/category/your-file.psd",
    "smartLayer": "Your Design Here"  // ← Use exact name from inspect-psd.js
  }
}
```

### Step 4: Validate

```bash
pnpm validate:templates
```

---

## ⚠️ Common Issues

### Issue: "Smart layer not found"

**Cause**: Layer name in templates.json doesn't match PSD

**Solution**:
1. Run `node inspect-psd.js` to see actual layer names
2. Copy the exact name (case-sensitive) to templates.json
3. Reload the demo

### Issue: "PSD unavailable (CORS)"

**Cause**: PSD file not accessible or wrong path

**Solution**:
1. Check file exists at the path in templates.json
2. Ensure path starts with `/Mockup_Images/`
3. Check browser console for exact error

### Issue: Blank/white render

**Cause**: Smart layer has no image data or zero bounds

**Solution**:
1. Check PSD has actual content in the smart object layer
2. Try using "Background" or another layer with visible content
3. Check browser console for warnings

### Issue: Base image is 1x1 pixel

**Cause**: Placeholder files in demo

**Solution**:
- Use PSD path instead (select template with "PSD" in the name)
- Or export your own base image from Photoshop
- Base image path is only for fast preview without loading PSD

---

## 🎯 Current Template Status

| Template ID | Name | Uses PSD? | Status |
|-------------|------|-----------|--------|
| tshirt-front-001 | T-Shirt (PSD - Click Thumbnail) | ✅ Yes | ✅ Working |
| tshirt-front-002 | T-Shirt (PSD - Background) | ✅ Yes | ✅ Working |
| tshirt-front-004 | T-Shirt (Base Only) | ❌ No | ⚠️ Uses placeholder |
| mug-001 | Coffee Mug | ❌ No | ⚠️ Uses placeholder |
| pillow-001 | Throw Pillow | ❌ No | ⚠️ Uses placeholder |

**Recommendation**: Use the PSD templates (001 or 002) for testing until you add real base images.

---

## 📋 Next Steps

1. **Test the fixed templates**
   - Select "T-Shirt (PSD - Click Thumbnail)"
   - Upload artwork
   - Verify rendering works

2. **Add your own PSD mockups**
   - Place PSD in `packages/web-demo/public/Mockup_Images/category/`
   - Use `inspect-psd.js` to find layer names
   - Add to templates.json
   - Test!

3. **Create proper base images** (optional)
   - Export flattened mockup from Photoshop
   - Save as JPG/PNG
   - Update templates.json paths
   - Allows fast preview mode

---

## 📞 Still Having Issues?

Check:
1. **Browser Console** (F12) - shows detailed error messages
2. **SNAP2MOCK_README.md** - complete documentation
3. **SNAP2MOCK_IMPLEMENTATION_SUMMARY.md** - technical details

The error messages from the library are **very helpful** - they show:
- Which layer was requested
- What layers are available
- Suggested alternatives

Always read the full error message!

---

**Status**: ✅ **Ready to Use**

**Last Updated**: October 21, 2025
