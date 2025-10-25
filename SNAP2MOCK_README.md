# Snap2Mock - Production PSD Mockup Editor

A production-ready TypeScript library for loading PSD mockup templates, replacing Smart-Object-like layers with user artwork, and rendering with WebGL2 (with Canvas2D fallback).

## 📦 Project Structure

```
snap2listing/
├── packages/
│   ├── core/                    # @snap2mock/core library
│   │   ├── src/
│   │   │   ├── index.ts         # Main API exports
│   │   │   ├── types.ts         # TypeScript definitions
│   │   │   ├── psd/
│   │   │   │   ├── parse.ts     # PSD loading with ag-psd
│   │   │   │   └── layers.ts    # Layer rendering plan
│   │   │   ├── gl/
│   │   │   │   ├── ctx.ts       # WebGL2 context management
│   │   │   │   ├── shader.ts    # All GLSL shaders
│   │   │   │   ├── warps.ts     # Perspective/curved transforms
│   │   │   │   └── pipelines/
│   │   │   │       └── composite.ts  # WebGL compositor
│   │   │   ├── canvas/
│   │   │   │   └── render.ts    # Canvas2D fallback
│   │   │   ├── utils/
│   │   │   │   └── image.ts     # Image utilities
│   │   │   └── validate/
│   │   │       └── schema.ts    # Zod validation schemas
│   │   └── package.json
│   │
│   ├── web-demo/                # Demo React application
│   │   ├── src/
│   │   │   ├── App.tsx          # Main demo app
│   │   │   └── components/
│   │   │       ├── TemplatePicker.tsx
│   │   │       ├── ArtworkUpload.tsx
│   │   │       ├── MockupPreview.tsx
│   │   │       ├── Controls.tsx
│   │   │       └── StatusBar.tsx
│   │   ├── public/
│   │   │   └── Mockup_Images/
│   │   │       ├── templates.json
│   │   │       ├── tshirts/
│   │   │       │   └── 23.psd   # PSD mockup file
│   │   │       ├── mugs/
│   │   │       └── pillows/
│   │   └── package.json
│   │
│   └── scripts/                 # Utility scripts
│       └── src/
│           └── validate-templates.ts
│
├── components/CreateListing/
│   └── NewMockupCanvas.tsx      # Integration with main app
│
├── inspect-psd.js               # PSD inspection utility
└── package.json                 # Root workspace config
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Build Core Library

```bash
pnpm build:core
```

### 3. Run Demo Application

```bash
pnpm dev:demo
```

The demo will open at `http://localhost:5173`

### 4. Validate Templates

```bash
pnpm validate:templates
```

## 📖 Core Library API

### Loading Templates

```typescript
import {
  loadTemplateIndex,
  loadTemplate,
  renderTemplate,
  loadArtwork,
  supportsWebGL2
} from '@snap2mock/core';

// Load templates from JSON
const templates = await loadTemplateIndex('/Mockup_Images/templates.json');

// Load a specific template (caches PSD if available)
await loadTemplate(templates[0]);

// Load user artwork
const artwork = await loadArtwork('/path/to/design.png');

// Render mockup
const result = await renderTemplate(templates[0], {
  source: 'psd',              // 'psd' or 'base'
  artwork: artwork,
  artworkFit: 'contain',      // 'contain' or 'cover'
  colorVariantName: 'Black',  // Optional color variant
  background: 'keep'          // 'keep' or 'transparent'
});

// Export
const blob = await result.toBlob('image/png');
const dataURL = result.dataURL('image/png');
```

### Type Definitions

```typescript
interface TemplateEntry {
  id: string;
  name: string;
  category: "Apparel" | "Drinkware" | "Canvas Prints" | "Home Decor" | "Digital" | "Bags" | "Other";
  thumbnail: string;
  baseImage: string;
  printArea: {
    type: "flat" | "curved" | "perspective";
    bounds: { x: number; y: number; width: number; height: number };
    warpData?: { type: "mesh"; curveAmount?: number };
    perspectivePoints?: {
      topLeft: {x: number; y: number};
      topRight: {x: number; y: number};
      bottomRight: {x: number; y: number};
      bottomLeft: {x: number; y: number};
    };
  };
  colorVariants?: Array<{
    name: string;
    hex: string;
    colorBlendMode?: "normal" | "multiply" | "screen" | "overlay" | "soft-light";
  }>;
  tags?: string[];
  resolution: { width: number; height: number };
  psd?: {
    url: string;
    smartLayer: string;
  };
}
```

## 🎨 Adding New Templates

### Step 1: Prepare Your PSD File

1. Create your mockup in Photoshop
2. Create a layer for the design placement (name it descriptively, e.g., "Your Design Here", "Design", "Artwork")
3. Save as PSD with maximum compatibility
4. Place in `packages/web-demo/public/Mockup_Images/{category}/`

### Step 2: Inspect PSD Layers

```bash
node inspect-psd.js
```

This will show you:
- PSD dimensions
- All layer names
- Suggested smart layer names

### Step 3: Create Base Image (Optional)

For the fast rendering path, create a flattened PNG/JPG without the design layer.

### Step 4: Add to templates.json

```json
{
  "id": "unique-id",
  "name": "Display Name",
  "category": "Apparel",
  "thumbnail": "/Mockup_Images/category/thumb.jpg",
  "baseImage": "/Mockup_Images/category/base.jpg",
  "printArea": {
    "type": "flat",
    "bounds": { "x": 500, "y": 400, "width": 800, "height": 1000 }
  },
  "colorVariants": [
    { "name": "White", "hex": "#FFFFFF" },
    { "name": "Black", "hex": "#000000", "colorBlendMode": "multiply" }
  ],
  "resolution": { "width": 2400, "height": 2400 },
  "psd": {
    "url": "/Mockup_Images/category/yourfile.psd",
    "smartLayer": "Your Design Here"
  }
}
```

### Print Area Types

**Flat** (T-shirts, posters):
```json
{
  "type": "flat",
  "bounds": { "x": 500, "y": 400, "width": 800, "height": 1000 }
}
```

**Curved** (Mugs, bottles):
```json
{
  "type": "curved",
  "bounds": { "x": 300, "y": 200, "width": 400, "height": 600 },
  "warpData": {
    "type": "mesh",
    "curveAmount": 25
  }
}
```

**Perspective** (Pillows, books):
```json
{
  "type": "perspective",
  "bounds": { "x": 200, "y": 200, "width": 600, "height": 400 },
  "perspectivePoints": {
    "topLeft": { "x": 220, "y": 210 },
    "topRight": { "x": 780, "y": 230 },
    "bottomRight": { "x": 760, "y": 580 },
    "bottomLeft": { "x": 240, "y": 560 }
  }
}
```

## 🔧 Integration with Main App

The NewMockupCanvas component in `components/CreateListing/` demonstrates integration:

```tsx
import NewMockupCanvas from '@/components/CreateListing/NewMockupCanvas';

<NewMockupCanvas
  template={selectedTemplate}
  artwork={userArtwork}
  productColor="#FFFFFF"
  artworkSettings={{
    fitMode: 'contain',
    position: { x: 0, y: 0 },
    scale: 1.0,
    rotation: 0
  }}
  adjustments={{
    brightness: 0,
    contrast: 0,
    saturation: 0
  }}
  onExport={(dataURL) => {
    // Handle exported mockup
  }}
/>
```

## 🎯 Features Implemented

### Core Features
- ✅ PSD parsing with ag-psd
- ✅ WebGL2 renderer with Canvas2D fallback
- ✅ Smart layer replacement
- ✅ Layer masks and opacity
- ✅ Blend modes (normal, multiply, screen, overlay, soft-light)
- ✅ Flat/curved/perspective warps
- ✅ Color variants with blend modes
- ✅ PNG export
- ✅ Zod schema validation

### Web Demo Features
- ✅ Template picker with categories
- ✅ Artwork upload (drag & drop)
- ✅ Live preview
- ✅ Color variant selector
- ✅ Render source toggle (PSD vs Base)
- ✅ Artwork fit mode toggle
- ✅ Export to PNG
- ✅ Status bar with render stats
- ✅ Error handling with user feedback

## 🧪 Testing

### Run Unit Tests

```bash
pnpm test:core
```

### Manual Testing Checklist

1. **Base Image Rendering**
   - Select "T-Shirt (Base Only)" template
   - Upload a logo
   - Verify placement in bounds
   - Export PNG

2. **PSD Rendering**
   - Select "T-Shirt (Smart Object)" template
   - Upload artwork
   - Verify PSD layers (shadows, highlights) render correctly
   - Try different layer names (Design, Artwork, etc.)

3. **Curved Warp**
   - Select "Coffee Mug" template
   - Upload design
   - Verify cylindrical wrap

4. **Perspective Warp**
   - Select "Throw Pillow" template
   - Upload design
   - Verify perspective distortion

5. **Color Variants**
   - Switch between White/Black variants
   - Verify color multiply effect

6. **Fallback**
   - Disable WebGL in browser
   - Verify Canvas2D fallback works

## 🔍 Troubleshooting

### PSD Not Loading

**Error**: "PSD unavailable (CORS / parse)"

**Solutions**:
1. Ensure PSD file path is correct in templates.json
2. Check browser console for CORS errors
3. Verify PSD is saved with maximum compatibility
4. Use inspect-psd.js to validate PSD structure

### Smart Layer Not Found

**Error**: "Smart layer 'X' not found"

**Solutions**:
1. Run `node inspect-psd.js` to see exact layer names
2. Update `smartLayer` in templates.json to match exactly (case-sensitive)
3. Check for nested layers (use full path if needed)

### Bounds Out of Range

**Error**: "Bounds exceed resolution"

**Solutions**:
1. Run `pnpm validate:templates`
2. Adjust `printArea.bounds` to fit within `resolution`
3. Check x + width ≤ resolution.width
4. Check y + height ≤ resolution.height

### Canvas Initialization Error (Node.js)

**Error**: "Canvas not initialized"

**Solution**:
```javascript
const { initializeCanvas } = require('ag-psd');
const { createCanvas } = require('canvas');
initializeCanvas(createCanvas);
```

## 🏗️ Architecture

### PSD Rendering Pipeline

1. **Parse**: Load PSD with ag-psd, extract layers and masks
2. **Plan**: Create render plan (background → artwork → foreground)
3. **Load**: Cache PSD document and prepare WebGL context
4. **Render**:
   - Clear framebuffer
   - Render background layers with blend modes
   - Apply artwork with warp transformation
   - Render foreground layers (shadows, highlights)
   - Composite to main canvas
5. **Export**: Convert to Blob or DataURL

### Base Image Pipeline

1. **Load**: Fetch base image
2. **Render**:
   - Draw base image
   - Apply color variant overlay
   - Apply artwork with fit and warp
3. **Export**: Convert to Blob or DataURL

### Blend Mode Implementation

WebGL fragment shader functions:
- **Multiply**: `B * S`
- **Screen**: `1 - (1-B)(1-S)`
- **Overlay**: `mix(2*B*S, 1 - 2*(1-B)*(1-S), step(0.5, B))`
- **Soft Light**: Photoshop-compatible approximation

## 📊 Performance

- PSD ≤ 20MB: < 2.5s load time
- Render: ~30 FPS (suitable for real-time updates)
- Export 2400×2400: ~500ms - 1.5s

### Optimization Tips

1. Resize large artwork before rendering
2. Use base image path for faster iteration
3. Switch to PSD path only for final export
4. Limit curveAmount for curved warps (0-50 recommended)

## 🔐 Security

- All PSD parsing is client-side
- No server required
- Files must be served from same origin or with CORS headers
- Image uploads are processed as ImageBitmap (sandboxed)

## 📝 License

MIT

## 🙏 Credits

- **ag-psd**: PSD parsing library (MIT)
- **Zod**: Schema validation
- **React + Vite**: Demo framework
- **Tailwind CSS**: Styling

## 📞 Support

For issues, check:
1. Browser console for detailed errors
2. `inspect-psd.js` output for PSD structure
3. `pnpm validate:templates` for template validation
4. This README's troubleshooting section

---

**Status**: ✅ Production Ready

**Last Updated**: October 21, 2025

**Version**: 0.1.0
