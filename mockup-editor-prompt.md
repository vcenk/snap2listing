# MOCKUP EDITOR INTEGRATION FOR SNAP2LISTING

I need to integrate a mockup editor similar to Dynamic Mockups into my snap2listing app. I'm attaching screenshots showing the exact UI/UX I want to replicate.

## WORKFLOW CLARIFICATION

### Current Flow (Already exists):
1. User creates a listing
2. User selects product type → when "Digital" is selected
3. User uploads artwork (this upload already exists for AI title/description generation)
4. **[NEW FEATURE GOES HERE]** → Mockup editor section

### New Mockup Editor Flow:
1. User already uploaded their artwork earlier in the flow
2. User sees mockup template selector (t-shirt, mug, phone case, etc.)
3. User clicks a template → artwork automatically applies to mockup with proper warping
4. User can customize:
   - **Product color** (e.g., t-shirt color change)
   - **Print area** position/size (drag, scale, rotate)
   - **Adjustments**: Opacity, Brightness, Contrast, Vibrance, Saturation, Blur
5. User exports mockup → saves to listing images

## UI REFERENCE (See uploaded screenshots)

The interface should have:

**Left Sidebar Sections:**
1. **Artwork** (collapsed/expanded)
   - Print Area selector
   - Artwork positioning controls
   - Fit options (Cover, Contain, etc.)

2. **Color** (collapsed/expanded)
   - Color picker for product (t-shirt/mug color)
   - Multiple color swatches
   - Add/remove colors

3. **Adjustments** (collapsed/expanded)
   - Opacity slider (0-100)
   - Brightness slider
   - Contrast slider
   - Vibrance slider
   - Saturation slider
   - Blur slider

**Main Canvas:**
- Large preview showing the mockup with artwork applied
- Real-time updates as user adjusts settings

## TECHNICAL REQUIREMENTS

### Phase 1: INVESTIGATION (Do this first!)
Before writing any code, analyze:

1. **Find the artwork upload location** 
   - Where in the listing flow does the user upload their design?
   - How is it stored? (state management, file path, blob, etc.)
   - Can we reuse this upload for the mockup editor?

2. **Find the image generation section**
   - Locate the component/page where this should be added
   - Is it part of a multi-step form or single page?
   - What's the current structure?

3. **Find the placeholder mockup library**

-this is under    ..\public\Mockup_Images  (just png files, there is no smart object)
   - Where is the non-working placeholder code?
   - Should we replace it or add alongside it?

4. **Product type detection**
   - Where is "Digital" product type selected?
   - How is this state managed?
   - How do we conditionally show the editor?

### Phase 2: IMPLEMENTATION

**Technology:**
- Fabric.js for canvas manipulation
- Match existing UI framework (React/Vue/whatever snap2listing uses)
- Use existing design system/styling

**Core Features to Build:**

1. **Template Selector Component**
```
   Templates should include:
   - T-shirts (front, back)
   - Hoodies
   - Mugs
   - Phone cases
   - Posters/prints
   - Tote bags
```

2. **Fabric.js Canvas Component**
   - Load template base image
   - Apply user's artwork (from earlier upload)
   - Auto-warp artwork to fit print area
   - Real-time preview

3. **Product Color Picker**
   - Color overlay on base product image
   - Or multiple pre-rendered color variants
   - Live color change preview

4. **Adjustments Panel**
   - Fabric.js filters for:
     - Opacity
     - Brightness/Contrast
     - Saturation/Vibrance
     - Blur
   - Apply to artwork layer only (not entire mockup)

5. **Export Functionality**
   - Render final canvas to PNG/JPG
   - Save to listing's image array
   - Integrate with existing image storage

**Template Structure (JSON-based):**
```json
{
  "id": "tshirt-white-front",
  "name": "White T-Shirt - Front",
  "category": "apparel",
  "baseImage": "/templates/tshirt-white-base.png",
  "colorVariants": [
    { "name": "White", "hex": "#FFFFFF", "image": "tshirt-white-base.png" },
    { "name": "Black", "hex": "#000000", "image": "tshirt-black-base.png" },
    { "name": "Green", "hex": "#00FF00", "image": "tshirt-green-base.png" }
  ],
  "printArea": {
    "type": "flat",
    "bounds": { "x": 250, "y": 180, "width": 300, "height": 350 }
  },
  "overlay": "/templates/tshirt-shadow-overlay.png"
}
```

**Warping Implementation:**
For curved products (mugs), use displacement maps or 4-point perspective:
```javascript
// Apply artwork with warping
function applyArtworkToTemplate(artwork, template) {
  if (template.printArea.type === 'curved') {
    // Apply displacement filter or perspective transform
  } else {
    // Simple rectangular placement
  }
}
```

### Phase 3: INTEGRATION POINTS

**Critical Integrations:**
1. **Reuse uploaded artwork** from earlier in the flow
2. **Conditional rendering** - only show for digital products
3. **Image storage** - export mockup and add to listing images
4. **State management** - maintain editor state during listing creation
5. **Don't break existing features** - AI generation, image uploads, etc.

## STARTER TEMPLATES TO INCLUDE

Provide 8-10 ready-to-use templates:
- 2-3 T-shirt variations (white, black, colors)
- 1-2 Mug templates
- 1 Phone case template
- 1 Tote bag template
- 1 Poster/print template
- 1 Hoodie template

## DELIVERABLES

1. **Investigation Report**
   - Current workflow documentation
   - Integration points identified
   - Proposed component structure

2. **Design Proposal**
   - Where the editor fits in the UI
   - Component hierarchy
   - State management approach

3. **Implementation**
   - Mockup editor component
   - Template library system
   - 8-10 starter templates
   - Color customization
   - Adjustments panel
   - Export functionality

4. **Documentation**
   - How to add new templates
   - How to create color variants
   - How to use displacement maps for curved products

## CONSTRAINTS

❌ **DO NOT:**
- Break the existing listing creation flow
- Remove or modify the artwork upload functionality
- Depend on external APIs (Dynamic Mockups, Photopea, etc.)
- Use PSD files in production

✅ **DO:**
- Investigate first, implement second
- Reuse the existing uploaded artwork
- Make it work offline (client-side only)
- Follow existing code patterns
- Keep it performant (bundle size, render speed)

## QUESTIONS TO ANSWER FIRST

Before implementing, please answer:
1. Where exactly in the listing flow should this editor appear?
2. How is the artwork currently stored when user uploads it?
3. Should mockup generation be optional or mandatory for digital products?
4. How many mockups should users be able to create per listing?
5. What's the existing image storage mechanism (S3, local, etc.)?

---

**Start by investigating the codebase and report your findings. Only proceed with implementation after I approve your design proposal.**
