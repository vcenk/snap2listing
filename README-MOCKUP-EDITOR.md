# Snap2Mock: Production-Ready PSD Mockup Editor

A modern TypeScript library for client-side PSD mockup rendering with WebGL acceleration and Canvas2D fallback. Parse PSD files, replace smart objects, apply warps/transformations, and export high-quality mockups entirely in the browser.

## 🚀 Features

- **PSD Parsing**: Client-side PSD parsing with ag-psd
- **Smart Object Replacement**: Replace design layers with user artwork
- **Advanced Rendering**: WebGL2 with Canvas2D fallback
- **Warp Transformations**: Flat, curved (barrel distortion), and perspective warps
- **Blend Modes**: Normal, multiply, screen, overlay, soft-light
- **Layer Compositing**: Masks, opacity, clipping chains
- **Color Variants**: Dynamic product recoloring
- **High Performance**: Optimized for real-time preview and batch export
- **Type Safety**: Full TypeScript with strict mode
- **Framework Agnostic**: Works with React, Vue, vanilla JS

## 📦 Package Structure

```
packages/
├── core/           # Main library (@snap2mock/core)
├── web-demo/       # React demo app  
└── scripts/        # CLI utilities
```

## 🔧 Installation

```bash
# Install the core library
npm install @snap2mock/core

# Or with yarn/pnpm
yarn add @snap2mock/core
pnpm add @snap2mock/core
```

## 🎯 Quick Start

### Basic Usage

```typescript
import { 
  loadTemplateIndex, 
  loadTemplate, 
  renderTemplate, 
  loadArtwork,
  createRenderOptions 
} from '@snap2mock/core';

// Load templates from JSON
const templates = await loadTemplateIndex('/templates.json');
const template = templates.find(t => t.id === 'tshirt-front');

// Load template (caches PSD if available)
await loadTemplate(template);

// Load user artwork
const artwork = await loadArtwork('/path/to/design.png');

// Render mockup
const options = createRenderOptions(artwork, {
  source: 'psd', // or 'base'
  artworkFit: 'contain',
  colorVariantName: 'Black',
  background: 'transparent'
});

const result = await renderTemplate(template, options);

// Export as PNG
const blob = await result.toBlob('image/png');
const url = result.dataURL();
```

### React Integration

```tsx
import React, { useState, useCallback } from 'react';
import { 
  loadTemplate, 
  renderTemplate, 
  loadArtwork,
  type TemplateEntry,
  type RenderResult 
} from '@snap2mock/core';

function MockupEditor() {
  const [result, setResult] = useState<RenderResult | null>(null);
  
  const handleRender = useCallback(async (
    template: TemplateEntry, 
    file: File
  ) => {
    try {
      // Load template and artwork
      await loadTemplate(template);
      const artwork = await loadArtwork(file);
      
      // Render
      const renderResult = await renderTemplate(template, {
        source: template.psd ? 'psd' : 'base',
        artwork,
        artworkFit: 'contain'
      });
      
      setResult(renderResult);
    } catch (error) {
      console.error('Render failed:', error);
    }
  }, []);
  
  const handleExport = useCallback(async () => {
    if (!result) return;
    
    const blob = await result.toBlob('image/png');
    const url = URL.createObjectURL(blob);
    
    // Trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mockup.png';
    a.click();
    
    URL.revokeObjectURL(url);
  }, [result]);
  
  return (
    <div>
      {result && (
        <div>
          <canvas ref={ref => {
            if (ref && result) {
              const ctx = ref.getContext('2d');
              ctx?.drawImage(result.canvas, 0, 0);
            }
          }} />
          <button onClick={handleExport}>
            Export PNG
          </button>
        </div>
      )}
    </div>
  );
}
```

## 📋 Template Configuration

Templates are defined in JSON with the following structure:

```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-01-21",
  "categories": ["Apparel", "Drinkware", "Canvas Prints", "Home Decor"],
  "templates": [
    {
      "id": "tshirt-front-001",
      "name": "T-Shirt Front View",
      "category": "Apparel",
      "thumbnail": "/Mockup_Images/tshirts/thumb.jpg",
      "baseImage": "/Mockup_Images/tshirts/base.jpg",
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
        "url": "https://cdn.example.com/tshirt.psd",
        "smartLayer": "YOUR DESIGN HERE"
      }
    }
  ]
}
```

### Print Area Types

#### Flat
```json
{
  "type": "flat",
  "bounds": { "x": 100, "y": 100, "width": 500, "height": 400 }
}
```

#### Curved (Mugs, Bottles)
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

#### Perspective (Bags, Pillows)
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

## 🎨 Rendering Pipeline

### PSD Path
1. Parse PSD with ag-psd (`useImageData: true`)
2. Extract layers, masks, transforms, blend modes
3. Find smart layer by name
4. Create render plan (background → artwork → foreground)
5. Apply color variant overlay
6. Composite layers with WebGL/Canvas2D
7. Apply artwork warp transformation
8. Export final result

### Base Image Path
1. Load base image
2. Apply color variant overlay
3. Apply artwork with warp transformation
4. Composite and export

## ⚡ Performance

- **PSD Loading**: < 2.5s for files ≤ 20MB
- **Rendering**: 30+ FPS for real-time preview
- **Export**: 500ms - 1.5s for 1600-2400px images
- **Memory**: Automatic artwork resizing for large files
- **Caching**: Templates and PSDs cached in memory

## 🔧 API Reference

### Core Functions

```typescript
// Template management
loadTemplateIndex(url: string): Promise<TemplateEntry[]>
loadTemplate(template: TemplateEntry, options?: LoadOptions): Promise<void>
getTemplate(id: string): TemplateEntry | undefined

// Rendering
renderTemplate(template: TemplateEntry, options: RenderOptions): Promise<RenderResult>
renderTemplateBatch(template: TemplateEntry, artworks: ImageSource[], options): Promise<RenderResult[]>

// Utilities
loadArtwork(source: string | File): Promise<HTMLImageElement | ImageBitmap>
supportsWebGL2(): boolean
supportsCanvas2D(): boolean
validateTemplateIndex(json: unknown): asserts json is TemplateIndex
```

### Types

```typescript
interface RenderOptions {
  source: "psd" | "base";
  artwork: HTMLImageElement | ImageBitmap;
  artworkFit?: "contain" | "cover";
  colorVariantName?: string;
  background?: "keep" | "transparent";
}

interface RenderResult {
  width: number;
  height: number;
  canvas: HTMLCanvasElement;
  toBlob(type?: string, quality?: number): Promise<Blob>;
  dataURL(type?: string, quality?: number): string;
}
```

## 🛠 Development

### Setup
```bash
# Clone and install
git clone <repo>
cd snap2listing
npm install

# Build core library
npm run build:core

# Run demo
npm run dev:demo

# Run tests
npm run test:core

# Validate templates
npm run validate:templates
```

### Project Structure
```
packages/core/src/
├── index.ts              # Main API
├── types.ts              # Type definitions
├── psd/
│   ├── parse.ts          # PSD loading & parsing
│   └── layers.ts         # Layer processing
├── gl/
│   ├── ctx.ts            # WebGL context
│   ├── shader.ts         # Shader programs
│   ├── warps.ts          # Transformations
│   └── pipelines/
│       └── composite.ts  # Main compositor
├── canvas/
│   └── render.ts         # Canvas2D fallback
├── utils/
│   └── image.ts          # Image utilities
└── validate/
    └── schema.ts         # Zod schemas
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

Tests cover:
- Schema validation
- Image fitting calculations
- Blend mode mappings
- Template validation edge cases
- Mock canvas/WebGL environments

## 📜 Scripts

### Template Validation
```bash
npm run validate:templates
```

Validates:
- JSON schema compliance
- File existence
- Bounds validation
- Color format validation
- PSD configuration
- Performance warnings

## 🎯 Browser Support

- **WebGL2**: Chrome 56+, Firefox 51+, Safari 15+
- **Canvas2D**: Universal fallback
- **ES2022**: Modern browsers with native modules
- **TypeScript**: Full type safety

## 🔒 Security & CORS

- PSDs must be served with proper CORS headers
- Use `crossOrigin="anonymous"` for images
- Client-side only - no server dependencies
- No data leaves the browser

## 📈 Error Handling

```typescript
import { MockupError, PSDError, WebGLError } from '@snap2mock/core';

try {
  await renderTemplate(template, options);
} catch (error) {
  if (error instanceof PSDError) {
    console.log('PSD issue:', error.message);
  } else if (error instanceof WebGLError) {
    console.log('WebGL issue:', error.message);  
  } else if (error instanceof MockupError) {
    console.log('General error:', error.message, error.code);
  }
}
```

## 🚀 Production Deployment

1. **Build the library**: `npm run build:core`
2. **Validate templates**: `npm run validate:templates`
3. **Configure CORS**: Ensure PSD files have proper headers
4. **CDN setup**: Serve templates and assets from CDN
5. **Error monitoring**: Implement error tracking
6. **Performance**: Monitor render times and memory usage

## 📝 Adding New Templates

1. **Prepare assets**:
   ```
   public/Mockup_Images/category/
   ├── thumbnail.jpg     # 300x300px preview
   ├── base.jpg         # Full resolution base
   └── template.psd     # Optional PSD file
   ```

2. **Add to templates.json**:
   ```json
   {
     "id": "unique-id",
     "name": "Display Name", 
     "category": "Apparel",
     "thumbnail": "/Mockup_Images/category/thumbnail.jpg",
     "baseImage": "/Mockup_Images/category/base.jpg",
     "printArea": {
       "type": "flat",
       "bounds": { "x": 100, "y": 100, "width": 500, "height": 400 }
     },
     "resolution": { "width": 2400, "height": 2400 }
   }
   ```

3. **Validate**: `npm run validate:templates`

4. **Test**: Load in demo app and verify rendering

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Add tests for new functionality
4. Ensure all tests pass: `npm test`
5. Update documentation
6. Submit pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🙋‍♂️ Support

- **Issues**: GitHub Issues
- **Docs**: This README + inline code documentation
- **Examples**: See `packages/web-demo/` for complete React implementation

---

Built with ❤️ for the print-on-demand community. Happy mocking! 🎨