# Mockup Editor Investigation Report

## Executive Summary

**Date:** 2025-01-21
**Status:** Investigation Complete - Issues Identified

**Key Findings:**
1. ✅ **Positioning algorithm is CORRECT** - Artwork is properly centered in print area
2. ✅ **Scaling calculation is CORRECT** - Coordinates are scaled appropriately
3. ⚠️ **Fit mode is CONTAIN (not COVER)** - Artwork fits inside but doesn't fill print area 100%
4. ❌ **No perspective transformation** - Missing for angled surfaces (t-shirts)
5. ❌ **No displacement mapping** - Missing for curved surfaces (mugs)
6. ⚠️ **Print area coordinates need verification** - May not match actual smart object positions

---

## Current Implementation Analysis

### Coordinate System

**Canvas:**
- Fixed size: 800x800 pixels
- Used for preview display

**Template Resolution (example: t-shirt):**
- Original: 2400x2400 pixels
- Scale factor: 800 / 2400 = 0.333...

**Print Area (example: t-shirt):**
- Original coordinates:
  ```json
  {
    "x": 1236,
    "y": 1066,
    "width": 846,
    "height": 1334
  }
  ```
- Scaled coordinates (for 800x800 canvas):
  ```
  x: 1236 * 0.333 = 412px
  y: 1066 * 0.333 = 355px
  width: 846 * 0.333 = 282px
  height: 1334 * 0.333 = 444px
  ```

### Positioning Algorithm (components/CreateListing/MockupCanvas.tsx:116-210)

**Step 1: Calculate scale factor**
```typescript
const scale = 800 / Math.max(template.resolution.width, template.resolution.height);
```
✅ **CORRECT** - Properly scales mockup to fit 800x800 canvas

**Step 2: Scale print area coordinates**
```typescript
const printAreaScaled = {
  x: printArea.x * scale,
  y: printArea.y * scale,
  width: printArea.width * scale,
  height: printArea.height * scale,
};
```
✅ **CORRECT** - Print area coordinates are proportionally scaled

**Step 3: Calculate artwork scale (CONTAIN fit)**
```typescript
const scaleToFit = Math.min(
  printAreaScaled.width / (artworkImg.width || 1),
  printAreaScaled.height / (artworkImg.height || 1)
);
```
⚠️ **ISSUE IDENTIFIED** - Uses `Math.min` which creates CONTAIN fit
- Artwork fits INSIDE print area
- May leave empty space
- **Expected:** COVER fit (fills 100%, may crop)

**Step 4: Center artwork in print area**
```typescript
const centerX = printAreaScaled.x + printAreaScaled.width / 2;
const centerY = printAreaScaled.y + printAreaScaled.height / 2;

artworkImg.set({
  left: centerX,
  top: centerY,
  originX: 'center',
  originY: 'center',
  scaleX: scaleToFit,
  scaleY: scaleToFit,
});
```
✅ **CORRECT** - Artwork is properly centered

### Layer Stacking (MockupCanvas.tsx:125-255)

**Current order:**
1. Base mockup image (Layer 1)
2. Color overlay (Layer 2) - optional
3. User artwork (Layer 3) - selectable
4. Overlay image (Layer 4) - shadows/highlights

**Implementation:**
```typescript
canvas.add(baseImg);
canvas.sendObjectToBack(baseImg); // ✅ Base at bottom

canvas.add(colorOverlay); // ✅ Above base

canvas.add(artworkImg); // ✅ Above color

canvas.add(overlayImg);
canvas.bringObjectToFront(overlayImg); // ✅ Overlay on top
```
✅ **CORRECT** - Layer order is properly maintained

---

## Issues Identified

### Issue #1: CONTAIN Fit Instead of COVER Fit

**Current Behavior:**
- Artwork scales to fit INSIDE print area (Math.min)
- Maintains aspect ratio
- May leave empty space if aspect ratios don't match

**Expected Behavior (Dynamic Mockups):**
- Artwork scales to FILL print area (Math.max)
- Maintains aspect ratio
- May crop edges if aspect ratios don't match

**Example:**
- Print area: 300x400px (aspect 0.75)
- Artwork: 1000x1000px (aspect 1.0)

Current (CONTAIN):
- Scale: min(300/1000, 400/1000) = 0.3
- Result: 300x300px artwork in 300x400px area (100px empty space)

Desired (COVER):
- Scale: max(300/1000, 400/1000) = 0.4
- Result: 400x400px artwork in 300x400px area (100px cropped horizontally)

**Fix:** Add fit mode option to ArtworkSettings

### Issue #2: No Perspective Transformation

**Current State:**
- All templates use `type: "flat"`
- No perspective distortion applied
- Artwork appears as flat rectangle

**Required for Realistic Mockups:**
- T-shirts: Slight perspective (fabric drapes slightly)
- Bags: Angled perspective
- Pillows: Perspective + depth

**Missing Implementation:**
```typescript
// For perspective type templates
if (printArea.type === 'perspective') {
  const perspectiveTransform = new fabric.PerspectiveTransform({
    topLeft: [x1, y1],
    topRight: [x2, y2],
    bottomRight: [x3, y3],
    bottomLeft: [x4, y4]
  });
  artworkImg.setTransform(perspectiveTransform);
}
```

**Impact:** Mockups look unrealistic (artwork too flat)

### Issue #3: No Displacement Mapping for Curved Surfaces

**Current State:**
- Mugs use `type: "curved"` but no actual curving applied
- Artwork appears flat on curved surface

**Required for Mugs:**
- Displacement map showing curvature
- Artwork should warp to follow mug surface
- Creates realistic 3D effect

**Missing Implementation:**
```typescript
// For curved type templates
if (printArea.type === 'curved') {
  const displacementFilter = new fabric.filters.Displacement({
    map: displacementMapImage,
    scaleX: warpData.curveAmount,
    scaleY: warpData.curveAmount
  });
  artworkImg.filters.push(displacementFilter);
  artworkImg.applyFilters();
}
```

**Impact:** Mug mockups look flat and unrealistic

### Issue #4: Print Area Coordinates May Be Incorrect

**Current Coordinates (t-shirt):**
```json
{
  "x": 1236,
  "y": 1066,
  "width": 846,
  "height": 1334,
  "resolution": {
    "width": 2400,
    "height": 2400
  }
}
```

**Verification Needed:**
- Open actual template image (`man-white-tshirt-front.jpg`)
- Measure actual smart object position
- Compare with JSON coordinates
- Update if mismatched

**How to Verify:**
1. Open image in Photopea/Photoshop
2. Select rectangular area where design should appear
3. Note exact pixel coordinates (x, y, width, height)
4. Compare with templates.json
5. Update if different

**All 9 templates need verification:**
- ✅ mug-white-001
- ✅ mug-angle-001
- ✅ phone-screen-001
- ✅ canvas-print-001
- ✅ canvas-print-002
- ✅ pillow-couch-001
- ✅ tote-bag-001
- ✅ poster-frame-001
- ⚠️ tshirt-man-white-front-001 (needs verification)

---

## Debug Tools Added

### Console Logging (MockupCanvas.tsx:118-193)

Added comprehensive logging:
```typescript
console.log('=== MOCKUP CANVAS DEBUG ===');
console.log('Template:', template.name);
console.log('Template Resolution:', template.resolution);
console.log('Canvas Size:', canvas.width, 'x', canvas.height);
console.log('Scale Factor:', scale);
console.log('Artwork Original Size:', artworkImg.width, 'x', artworkImg.height);
console.log('Print Area (original):', printArea);
console.log('Print Area (scaled):', printAreaScaled);
console.log('Scale to Fit:', scaleToFit);
console.log('Artwork will be scaled to:', { width, height });
console.log('Artwork Center Position:', centerX, centerY);
```

**Usage:** Open browser console when testing mockup editor

### Visual Debug Rectangle (MockupCanvas.tsx:180-193)

Added red dashed outline showing print area:
```typescript
const debugRect = new Rect({
  left: printAreaScaled.x,
  top: printAreaScaled.y,
  width: printAreaScaled.width,
  height: printAreaScaled.height,
  fill: 'transparent',
  stroke: '#ff0000',
  strokeWidth: 2,
  strokeDashArray: [5, 5],
});
```

**Visual Aid:** Red dashed rectangle shows exact print area boundaries

---

## Recommendations

### Priority 1: Fix Fit Mode (Quick Win)

**Change from CONTAIN to COVER:**

1. Add fit mode to ArtworkSettings type:
```typescript
// lib/types/mockupTemplates.ts
export interface ArtworkSettings {
  // ... existing fields
  fitMode: 'cover' | 'contain' | 'fill' | 'stretch';
}
```

2. Update scaleToFit calculation:
```typescript
// MockupCanvas.tsx
const scaleToFit = artworkSettings.fitMode === 'cover'
  ? Math.max( // FILL print area (may crop)
      printAreaScaled.width / (artworkImg.width || 1),
      printAreaScaled.height / (artworkImg.height || 1)
    )
  : Math.min( // FIT inside print area (may have gaps)
      printAreaScaled.width / (artworkImg.width || 1),
      printAreaScaled.height / (artworkImg.height || 1)
    );
```

3. Set default to 'cover':
```typescript
// lib/types/mockupTemplates.ts
export const DEFAULT_ARTWORK_SETTINGS: ArtworkSettings = {
  // ... existing
  fitMode: 'cover', // ← Fill print area 100%
};
```

**Impact:** Artwork will now fill print area completely (matches Dynamic Mockups)

### Priority 2: Add Perspective Transformation

**For templates with slight perspective (t-shirts, bags):**

1. Update templates.json with perspective points
2. Implement perspective transform using Fabric.js or custom shader
3. Apply to flat-but-angled surfaces

**Estimated Effort:** 2-3 hours

### Priority 3: Add Displacement Mapping

**For curved surfaces (mugs):**

1. Create displacement maps for each curved template
2. Implement displacement filter
3. Apply to curved type templates

**Estimated Effort:** 4-5 hours (includes creating displacement maps)

### Priority 4: Verify All Coordinates

**Measure and update print area coordinates:**

1. Open each template in image editor
2. Measure actual smart object area
3. Update templates.json
4. Test with debug rectangle

**Estimated Effort:** 1-2 hours

---

## Testing Checklist

Once fixes are implemented, test:

- [ ] Artwork auto-centers in print area (check with debug rectangle)
- [ ] Artwork fills print area 100% (no gaps)
- [ ] Artwork maintains aspect ratio
- [ ] Works with square artwork (1000x1000)
- [ ] Works with wide artwork (1000x500)
- [ ] Works with tall artwork (500x1000)
- [ ] Works with tiny artwork (100x100)
- [ ] Works with huge artwork (4000x4000)
- [ ] T-shirt has subtle perspective warp
- [ ] Mug has curved warp effect
- [ ] User can drag artwork within print area
- [ ] User can resize artwork
- [ ] Export produces correct final image
- [ ] All 9 templates work correctly

---

## Summary

**What's Working:**
✅ Coordinate scaling algorithm
✅ Artwork centering logic
✅ Layer stacking order
✅ Debug tools in place

**What Needs Fixing:**
⚠️ Change Math.min to Math.max (COVER fit)
❌ Add perspective transformation
❌ Add displacement mapping
⚠️ Verify print area coordinates

**Next Steps:**
1. Implement COVER fit mode (30 min)
2. Test with debug tools enabled
3. Verify coordinates are correct
4. Plan perspective/displacement implementation

