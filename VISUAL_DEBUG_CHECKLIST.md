# Visual Debug Checklist - What You Should See

## When Testing the Mockup Editor

### 1. Canvas Display (Initial Load)

**What you should see on screen:**
```
┌─────────────────────────────────────────┐
│                                         │
│         [T-SHIRT MOCKUP IMAGE]          │
│                                         │
│       ┌─────────────────────┐           │
│       │ ╔═══════════════╗   │  ← RED    │
│       │ ║   ARTWORK     ║   │    DASHED │
│       │ ║   CENTERED    ║   │    RECTANGLE│
│       │ ║   FILLS 100%  ║   │           │
│       │ ╚═══════════════╝   │           │
│       └─────────────────────┘           │
│                                         │
└─────────────────────────────────────────┘

Legend:
─────  = Canvas border (800x800)
┌───┐  = Print area bounds
╔═══╗  = Artwork (filled to edges)
RED    = Debug rectangle (dashed red line)
```

**Verify:**
- ✅ Artwork is centered in red rectangle
- ✅ Artwork touches all 4 edges of rectangle
- ✅ No gaps between artwork and rectangle edges

---

### 2. Console Output (F12 DevTools)

**What you should see in console:**
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
Scale to Fit: 0.44467
Artwork will be scaled to: { width: 444.67, height: 444.67 }
Artwork Center Position: 553 577.665

Applying perspective transformation to artwork
Calculated skew (raw): { skewX: 0.42, skewY: -0.18 }
Dampening factor: 0.4
Final skew (damped): { skewX: 0.168, skewY: -0.072 }

Layer order finalized:
  1. Base mockup (bottom)
  2. Color overlay (if exists)
  3. User artwork (middle)
  4. Shadow overlay (top)
Total canvas objects: 5
```

**Key values to check:**
- ✅ Scale Factor should be ~0.333 (800/2400)
- ✅ scaleToFit uses the HIGHER value (Math.max)
- ✅ Layer order shows 4 layers
- ✅ No JavaScript errors

---

### 3. Color Change Test

**BEFORE (White T-Shirt):**
```
┌─────────────────────────┐
│   [WHITE T-SHIRT]       │
│                         │
│   ┌───────────┐         │
│   │  BLUE     │         │  ← User uploaded
│   │  ARTWORK  │         │     blue artwork
│   └───────────┘         │
└─────────────────────────┘
```

**AFTER (Select Black Color):**
```
┌─────────────────────────┐
│   [BLACK T-SHIRT]       │ ← T-shirt changed
│                         │    to BLACK
│   ┌───────────┐         │
│   │  BLUE     │         │  ← Artwork STILL
│   │  ARTWORK  │         │     BLUE
│   └───────────┘         │
└─────────────────────────┘
```

**Console should show:**
```
Color overlay added with blend mode: multiply
```

**CRITICAL:**
- ✅ Only t-shirt changes color
- ❌ Artwork should NOT change color
- ✅ Artwork maintains original colors

---

### 4. Layer Stacking (Visual Layers)

**What layers exist (bottom to top):**

```
Layer 4 (TOP)     ╔═══════════════════╗
Shadow Overlay    ║  Shadows/wrinkles ║ ← Semi-transparent
                  ╚═══════════════════╝

Layer 3 (MIDDLE)  ┌───────────────────┐
User Artwork      │   YOUR DESIGN     │ ← Selectable
                  │   (Drag/Scale)    │
                  └───────────────────┘

Layer 2           ╔═══════════════════╗
Color Overlay     ║ [multiply blend]  ║ ← Color tint
                  ╚═══════════════════╝    (only affects base)

Layer 1 (BOTTOM)  ┌───────────────────┐
Base Mockup       │   T-shirt photo   │ ← Original mockup
                  └───────────────────┘
```

**Verification:**
- ✅ Can select/drag artwork (Layer 3)
- ✅ Cannot select shadows (Layer 4)
- ✅ Cannot select base/color (Layers 1-2)

---

### 5. Export Button Click

**Console output when clicking "Export Mockup":**
```
=== EXPORT STARTED ===
Canvas dimensions: 800 x 800
Number of objects: 5
Export successful!
Data URL length: 234567
Data URL preview: data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...
```

**On screen:**
```
┌─────────────────────────────────────┐
│  ✓ Success!                         │
│  1 mockup exported successfully!    │
└─────────────────────────────────────┘
```

**Verify:**
- ✅ No error messages
- ✅ Success alert appears
- ✅ Data URL is very long (>100,000 chars)
- ✅ exportedMockups array has 1 item

---

### 6. Perspective Effect (T-Shirt)

**WITHOUT perspective (flat):**
```
┌─────────────┐
│             │
│   DESIGN    │  ← Perfect rectangle
│             │
└─────────────┘
```

**WITH perspective (skewed):**
```
┌───────────────┐
│               │╲
│    DESIGN     │ ╲  ← Slightly skewed
│               │  ╲    (follows fabric)
└───────────────┘   ╲
```

**Console shows:**
```
Applying perspective transformation to artwork
Final skew (damped): { skewX: 0.168, skewY: -0.072 }
```

**Verify:**
- ✅ Artwork has subtle skew (not perfectly rectangular)
- ✅ Effect is subtle (not distorted)
- ✅ Matches natural fabric drape

---

### 7. Print Area Boundaries (Debug Rectangle)

**What red dashed rectangle shows:**
```
Canvas (800x800)
┌─────────────────────────────────────┐
│                                     │
│     Print Area (red dashed)         │
│     ┌ ─ ─ ─ ─ ─ ─ ─ ┐               │
│     │               │               │
│     │   Artwork     │               │
│     │   fills this  │               │
│     │   exactly     │               │
│     └ ─ ─ ─ ─ ─ ─ ─ ┘               │
│                                     │
└─────────────────────────────────────┘
```

**Measurements:**
- Rectangle X: ~412px
- Rectangle Y: ~430px
- Rectangle Width: ~282px
- Rectangle Height: ~445px

**Verify:**
- ✅ Red rectangle visible
- ✅ Artwork centered in rectangle
- ✅ Artwork edges touch rectangle edges

---

## Quick Visual Tests

### Test 1: Square Artwork (1000x1000)
**Expected:** Fills height, crops width
```
Print Area: 282w × 445h (aspect 0.63)
Artwork:    1000 × 1000 (aspect 1.0)

Result: Scale by height (445/1000 = 0.445)
Final size: 445w × 445h (crops 163px left+right)
```

### Test 2: Wide Artwork (1000x500)
**Expected:** Fills height, extends beyond width
```
Print Area: 282w × 445h
Artwork:    1000 × 500

Result: Scale by height (445/500 = 0.89)
Final size: 890w × 445h (crops 304px left+right)
```

### Test 3: Tall Artwork (500x1000)
**Expected:** Fills width, crops height
```
Print Area: 282w × 445h
Artwork:    500 × 1000

Result: Scale by width (282/500 = 0.564)
Final size: 282w × 564h (crops 60px top+bottom)
```

**ALL cases:** Artwork fills print area 100%, no gaps

---

## Error States to Watch For

### ❌ BAD: Artwork smaller than rectangle
```
┌─────────────────┐
│                 │
│   ┌─────┐       │  ← Artwork too small
│   │ART  │       │     (using Math.min)
│   └─────┘       │
└─────────────────┘
```
**If you see this:** Math.min instead of Math.max (should be fixed)

### ❌ BAD: Color overlay on top of artwork
```
Layers (wrong order):
1. Base mockup
2. User artwork       ← WRONG
3. Color overlay      ← Should be below artwork
```
**If you see this:** Layer ordering not working (should be fixed)

### ❌ BAD: Export includes selection handles
```
Exported image shows:
┌─────────────┐
│   ⊕         │  ← Corner handles visible
│   DESIGN  ⊕ │     in exported image
│       ⊕     │
└─────────────┘
```
**If you see this:** discardActiveObject() not called (should be fixed)

---

## Success Checklist

After testing, you should have seen:

- [x] ✅ Red dashed rectangle on canvas
- [x] ✅ Artwork centered in rectangle
- [x] ✅ Artwork fills rectangle 100%
- [x] ✅ Console shows "Layer order finalized"
- [x] ✅ Console shows "Fit Mode: COVER"
- [x] ✅ Black t-shirt + white artwork works correctly
- [x] ✅ Export produces success message
- [x] ✅ Exported mockup looks professional
- [x] ✅ Perspective skew is visible (subtle)
- [x] ✅ Can drag/scale/rotate artwork
- [x] ✅ No JavaScript errors

---

## Screenshot Checklist

Take these screenshots for documentation:

1. **Canvas with debug rectangle**
   - Shows red dashed rectangle
   - Artwork centered and filled

2. **Console output**
   - Shows all debug logs
   - Layer order confirmation

3. **Color change test**
   - Before: white t-shirt
   - After: black t-shirt (artwork unchanged)

4. **Export success**
   - Console shows "Export successful!"
   - Success alert on screen

5. **Exported mockup**
   - Final PNG downloaded
   - Professional quality

---

## Summary

**IF YOU SEE ALL OF THE ABOVE:**
- ✅ All fixes are working correctly
- ✅ Ready to disable DEBUG_MODE
- ✅ Ready for production testing

**IF SOMETHING LOOKS DIFFERENT:**
- Check console for errors
- Compare with examples above
- Report exact differences

