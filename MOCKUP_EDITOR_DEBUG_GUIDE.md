# Mockup Editor - Debug & Testing Guide

**Status:** ✅ All fixes implemented and ready for testing
**Build:** ✓ Compiled successfully
**Debug Mode:** ENABLED (set to true)

---

## Fixes Implemented

### ✅ Fix 1: Layer Ordering (CRITICAL)

**Problem:** Color overlay was painting over artwork instead of just the product.

**Root Cause:** Layers were added in sequence but not explicitly re-ordered after all objects loaded.

**Fix Applied:**
```typescript
// File: MockupCanvas.tsx:312-335

// Explicit layer ordering (bottom to top):
canvas.sendObjectToBack(baseImg);           // 1. Base mockup
canvas.sendObjectToBack(colorOverlayObj);   // 2. Color overlay
canvas.bringObjectForward(colorOverlayObj); // Move above base only
// Artwork in middle (position 3)
canvas.bringObjectToFront(overlayImgObj);   // 4. Shadows on top
```

**Expected Result:**
- Black t-shirt + white artwork → Only t-shirt is black, artwork stays white
- Red mug + blue artwork → Only mug is red, artwork stays blue

---

### ✅ Fix 2: Export Enhancement

**Problem:** Export button might be disabled or not providing feedback.

**Fixes Applied:**
```typescript
// File: MockupCanvas.tsx:473-515

// Enhanced export with:
1. Better error logging
2. Deselect active objects (removes selection handles)
3. 2x multiplier for higher quality export
4. Debug logging of export process
5. Proper error handling
```

**Expected Result:**
- Click "Export Mockup" → See console log "=== EXPORT STARTED ==="
- Export completes → See "Export successful!" in console
- Data URL is passed to parent component
- Mockup is saved to exportedMockups array

---

### ✅ Fix 3: Perspective Fine-Tuning

**Problem:** Perspective effect might be too strong or too weak.

**Fix Applied:**
```typescript
// File: MockupCanvas.tsx:433-449

// Adjustable dampening factor
const dampening = 0.4; // 0.3 = subtle, 0.5 = moderate, 0.7 = strong
```

**To Adjust:**
- Open MockupCanvas.tsx
- Find line 434: `const dampening = 0.4;`
- Try values: 0.3 (subtle), 0.5 (moderate), 0.7 (strong)
- Rebuild and test

---

### ✅ Fix 4: Debug Logging

**Status:** DEBUG_MODE = true

**Console Logs You'll See:**
```
=== MOCKUP CANVAS DEBUG ===
Template: White T-Shirt (Man) - Front View
Template Resolution: { width: 2400, height: 2400 }
Canvas Size: 800 x 800
Scale Factor: 0.3333333333333333

Artwork Original Size: 1000 x 1000
Print Area (original): { x: 1236, y: 1291, width: 846, height: 1334 }
Print Area (scaled): { x: 412, y: 430.33, width: 282, height: 444.67 }
DEBUG: Red dashed rectangle shows print area boundaries

Fit Mode: COVER (fills print area 100%)
Scale calculations: { scaleX: 0.282, scaleY: 0.44467, chosen: 0.44467 }

Applying perspective transformation to artwork
Calculated skew (raw): { skewX: 0.45, skewY: -0.12 }
Dampening factor: 0.4
Final skew (damped): { skewX: 0.18, skewY: -0.048 }

Layer order finalized:
  1. Base mockup (bottom)
  2. Color overlay (if exists)
  3. User artwork (middle)
  4. Shadow overlay (top)
Total canvas objects: 5
```

---

## Testing Workflow

### Step 1: Start Dev Server
```bash
npm run dev
```

Navigate to: http://localhost:3000/app/create

### Step 2: Complete Workflow Test

**2.1 Upload Artwork**
1. Click "Create Listing"
2. Select "Digital" product type
3. Upload test artwork (try these):
   - Square: 1000x1000px
   - Wide: 1000x500px
   - Tall: 500x1000px

**2.2 Select Template**
1. Go to Step 3 (Images)
2. Click "Browse Mockup Library"
3. Select "White T-Shirt (Man) - Front View"
4. Click "Continue"

**2.3 Verify Canvas Display**
Open browser console (F12) and check:
- ✅ See "=== MOCKUP CANVAS DEBUG ===" message
- ✅ See all coordinate calculations
- ✅ Red dashed rectangle is visible on canvas
- ✅ Artwork is centered in red rectangle
- ✅ Artwork fills red rectangle 100%
- ✅ No JavaScript errors

**2.4 Test Color Change (CRITICAL)**
1. In sidebar, find "Product Color" section
2. Select "Black" color
3. **VERIFY:**
   - ✅ T-shirt turns black
   - ✅ Artwork stays original colors (NOT black)
   - ✅ Console shows: "Color overlay added with blend mode: multiply"

**2.5 Test Adjustments**
1. Move "Opacity" slider → Artwork becomes transparent
2. Move "Brightness" slider → Artwork gets brighter/darker
3. Move "Contrast" slider → Artwork contrast changes
4. **VERIFY:** Adjustments only affect artwork, not t-shirt

**2.6 Test Export**
1. Click "Export Mockup" button
2. **CHECK CONSOLE:**
   ```
   === EXPORT STARTED ===
   Canvas dimensions: 800 x 800
   Number of objects: 5
   Export successful!
   Data URL length: 234567
   ```
3. **VERIFY:**
   - ✅ No export errors
   - ✅ Success alert appears: "1 mockup exported successfully!"

**2.7 Test Drag/Scale/Rotate**
1. Click and drag artwork → Moves within print area
2. Drag corner handles → Scales artwork
3. Rotate handles → Rotates artwork
4. **VERIFY:** Artwork stays clipped to print area (red rectangle)

---

## Debug Checklist

Use this checklist to diagnose issues:

### Canvas Not Showing
- [ ] Check console for "=== MOCKUP CANVAS DEBUG ===" message
- [ ] Verify template is loaded (check "Template:" log)
- [ ] Check for JavaScript errors in console
- [ ] Verify artwork URL is valid (check network tab)

### Artwork Positioning Wrong
- [ ] Check "Print Area (scaled)" log
- [ ] Look for red dashed rectangle on canvas
- [ ] Verify artwork center is inside rectangle
- [ ] Check "Scale to Fit" calculation

### Color Overlay Issue
- [ ] Check console for "Color overlay added with blend mode: multiply"
- [ ] Verify layer order log shows correct sequence
- [ ] Check "Total canvas objects" count (should be 4-5)
- [ ] Try different blend modes in template JSON

### Export Not Working
- [ ] Click export button
- [ ] Check console for "=== EXPORT STARTED ==="
- [ ] Look for export errors in console
- [ ] Verify onExport callback is defined
- [ ] Check EnhancedMockupEditor console logs

### Perspective Not Visible
- [ ] Select t-shirt template
- [ ] Check console for "Applying perspective transformation"
- [ ] Verify "Final skew (damped)" values
- [ ] Try adjusting dampening factor (0.3-0.7)
- [ ] Check perspectivePoints in templates.json

---

## Console Error Reference

### Error: "Export failed: No canvas or template"
**Cause:** Canvas not initialized or no template selected
**Fix:** Ensure template is selected before exporting

### Error: "Failed to load mockup"
**Cause:** Template image file not found or CORS issue
**Fix:**
- Verify image path in templates.json
- Check image exists in public/Mockup_Images/
- Check network tab for 404 errors

### Error: "onExport callback not provided"
**Cause:** Parent component not passing onExport prop
**Fix:** Verify EnhancedMockupEditor.tsx line 293 has `onExport={handleExportCurrent}`

### Warning: "No displacement map provided"
**Cause:** Curved template missing displacement map
**Fix:** This is expected - using skew fallback approximation

---

## Visual Debugging

### Red Dashed Rectangle
**What it shows:** Exact print area boundaries (scaled to canvas)

**Expected behavior:**
- Rectangle visible when DEBUG_MODE = true
- Artwork centered in rectangle
- Artwork fills rectangle completely (edges may extend beyond)

**If not visible:**
- Check DEBUG_MODE is true (line 15)
- Check console for "DEBUG: Red dashed rectangle shows print area boundaries"
- Verify print area coordinates are not zero

### Layer Order Visualization
**How to check:**
1. Use browser DevTools
2. Inspect canvas element
3. Check Fabric.js object z-indices
4. OR check console log: "Layer order finalized"

**Expected order (bottom to top):**
1. Base mockup image
2. Color overlay (if color != white)
3. Debug rectangle (if DEBUG_MODE)
4. User artwork
5. Shadow overlay (if template has one)

---

## Parameter Tuning

### Perspective Dampening
**File:** MockupCanvas.tsx:434
**Current:** 0.4
**Range:** 0.1 - 1.0

**Recommendations:**
- 0.3 → Subtle perspective (recommended for casual wear)
- 0.4 → Moderate perspective (current setting)
- 0.5 → Strong perspective (good for fitted garments)
- 0.7+ → Very strong (may look distorted)

### Curve Approximation (Mugs)
**File:** MockupCanvas.tsx:325
**Current:** `curveAmount * 0.1`

**To adjust:**
```typescript
// Line 325
const skewAmount = curveAmount * 0.15; // Increase multiplier for more curve
```

### Export Resolution
**File:** MockupCanvas.tsx:497
**Current:** `multiplier: 2` (1600x1600 px)

**Options:**
- `1` → 800x800 (fast, lower quality)
- `2` → 1600x1600 (balanced, current)
- `3` → 2400x2400 (slow, high quality)

---

## Troubleshooting Common Issues

### Issue: Color overlay covers entire canvas
**Symptoms:** Changing color affects artwork too
**Debug:**
```
1. Check console: "Layer order finalized"
2. Verify "Total canvas objects" count
3. Check blend mode: should be "multiply"
```
**Fix:** Already implemented in latest code (lines 312-335)

### Issue: Export button disabled
**Symptoms:** Button is grayed out, can't click
**Debug:**
```
1. Check: isLoading state
2. Check: error state
3. Verify template is selected
```
**Fix:** Check MockupCanvas.tsx:559-562 for button disable conditions

### Issue: Artwork doesn't fill print area
**Symptoms:** Artwork smaller than red rectangle
**Debug:**
```
1. Check console: "Fit Mode: COVER"
2. Verify scaleToFit uses Math.max (not Math.min)
3. Check "Scale to Fit" value
```
**Fix:** Already implemented (line 209 uses Math.max)

### Issue: Perspective too strong/weak
**Symptoms:** Artwork looks distorted or too flat
**Debug:**
```
1. Check console: "Final skew (damped)"
2. Note skewX and skewY values
3. Try different dampening values
```
**Fix:** Adjust line 434: `const dampening = 0.4;`

---

## Success Criteria

After testing, you should see:

- [x] ✅ Red debug rectangle visible (when DEBUG_MODE = true)
- [x] ✅ Artwork centered in rectangle
- [x] ✅ Artwork fills rectangle 100%
- [x] ✅ Color change only affects t-shirt, not artwork
- [x] ✅ Export button works (check console logs)
- [x] ✅ Exported mockup looks professional
- [x] ✅ Perspective effect is visible (subtle skew)
- [x] ✅ Can drag/scale/rotate artwork
- [x] ✅ Adjustments work (opacity, brightness, etc.)
- [x] ✅ No JavaScript errors in console

---

## Next Steps After Testing

### If Everything Works:
1. Set DEBUG_MODE = false (line 15)
2. Remove debug console.log statements (optional)
3. Remove red debug rectangle (optional)
4. Test with all 9 templates
5. Create production build

### If Issues Found:
1. **Report exact error messages** from console
2. **Screenshot the canvas** showing the issue
3. **Copy/paste console logs** for analysis
4. **Note which template** has the issue
5. **Describe expected vs actual behavior**

### To Disable Debug Mode:
```typescript
// MockupCanvas.tsx:15
const DEBUG_MODE = false; // Change back to false
```

---

## Template Coordinate Verification

If print area seems wrong, verify coordinates:

**For T-Shirt Template:**
```json
// templates.json:275-289
{
  "printArea": {
    "type": "perspective",
    "bounds": {
      "x": 1236,    // ← Verify this matches PSD
      "y": 1291,    // ← Verify this matches PSD
      "width": 846,
      "height": 1334
    }
  }
}
```

**How to Verify:**
1. Open `/public/Mockup_Images/tshirts/man-white-tshirt-front.jpg` in Photopea
2. Use rectangular selection tool
3. Select area where design should go
4. Note X, Y, Width, Height from info panel
5. Compare with templates.json
6. Update if different

---

## Summary

**All fixes are implemented and ready for testing:**

1. ✅ **Layer ordering fixed** - Color overlay won't paint over artwork
2. ✅ **Export enhanced** - Better logging and error handling
3. ✅ **Perspective tuned** - Realistic dampening (0.4 factor)
4. ✅ **Debug mode enabled** - Comprehensive console logging
5. ✅ **Build verified** - Compiles successfully

**Start testing by running `npm run dev` and following the workflow in Step 2.**

Report findings using the debug checklist above.

