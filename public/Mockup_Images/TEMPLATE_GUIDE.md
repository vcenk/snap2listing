# Mockup Template Addition Guide

This guide will walk you through adding new mockup templates to the Snap2Listing mockup editor.

---

## Quick Start

**3 Steps to Add a Template:**

1. Add your mockup image to the appropriate category folder
2. Add template metadata to `templates.json`
3. Reload the app to see your new template

---

## Folder Structure

Add your mockup images to these folders:

```
public/Mockup_Images/
├── canvas-prints/      # Canvas prints, wall art, posters
├── mugs/              # Coffee mugs, travel mugs, drinkware
├── phone-screens/     # Phone/tablet screen mockups
├── pillows/           # Throw pillows, cushions
├── poster-frames/     # Framed posters, picture frames
├── tote-bags/         # Tote bags, shopping bags, canvas bags
├── tshirts/           # T-shirts, hoodies, apparel
└── other/             # Any other product types
```

---

## Image Requirements

### File Format
- **Supported:** JPG, PNG
- **Recommended:** PNG (for transparency/shadows)

### Resolution
- **Minimum:** 1200×1200 pixels
- **Recommended:** 1600×1600 to 2000×2000 pixels
- **Maximum:** 3000×3000 pixels (for performance)

### File Size
- **Target:** <500KB per image
- **Maximum:** 2MB per image
- Use image optimization tools (TinyPNG, Squoosh, etc.)

### Quality Guidelines
- High-quality, professional photography
- Good lighting and clean background
- Product should be clearly visible
- Avoid watermarks or text overlays
- Consistent style across similar mockups

---

## Template Metadata (JSON)

Each template needs an entry in `public/Mockup_Images/templates.json`.

### Basic Template Example

```json
{
  "id": "tshirt-white-001",
  "name": "White T-Shirt - Front View",
  "category": "Apparel",
  "thumbnail": "/Mockup_Images/tshirts/my-tshirt-mockup.jpg",
  "baseImage": "/Mockup_Images/tshirts/my-tshirt-mockup.jpg",
  "printArea": {
    "type": "flat",
    "bounds": {
      "x": 400,
      "y": 300,
      "width": 500,
      "height": 600
    }
  },
  "tags": ["tshirt", "apparel", "clothing"],
  "resolution": {
    "width": 1600,
    "height": 1800
  }
}
```

### Field Explanations

| Field | Required | Description |
|-------|----------|-------------|
| `id` | ✅ Yes | Unique identifier (use kebab-case) |
| `name` | ✅ Yes | Display name for the template |
| `category` | ✅ Yes | Category (see list below) |
| `thumbnail` | ✅ Yes | Path to preview image |
| `baseImage` | ✅ Yes | Path to full-resolution image |
| `printArea` | ✅ Yes | Where artwork will be placed |
| `tags` | ✅ Yes | Search keywords (array of strings) |
| `resolution` | ✅ Yes | Image dimensions (width, height) |
| `colorVariants` | ❌ No | Product color options (see below) |
| `overlayImage` | ❌ No | Shadow/highlight overlay layer |

### Categories

Use one of these standard categories:

- `Apparel` - T-shirts, hoodies, clothing
- `Drinkware` - Mugs, cups, bottles
- `Canvas Prints` - Canvas, posters, wall art
- `Home Decor` - Pillows, cushions, home items
- `Digital` - Phone screens, app mockups
- `Bags` - Tote bags, shopping bags
- `Other` - Everything else

---

## Print Area Definition

The print area defines where the user's artwork will be placed on the mockup.

### For Flat Products (T-shirts, Posters, Phone Screens)

```json
"printArea": {
  "type": "flat",
  "bounds": {
    "x": 400,      // X position from left edge
    "y": 300,      // Y position from top edge
    "width": 500,  // Width of print area
    "height": 600  // Height of print area
  }
}
```

**How to Find Print Area Coordinates:**

1. Open your mockup image in an image editor (Photoshop, GIMP, etc.)
2. Use the selection/rectangle tool
3. Select the area where designs should appear
4. Note the X, Y, Width, and Height values
5. Use these values in your JSON

### For Curved Products (Mugs, Rounded Items)

```json
"printArea": {
  "type": "curved",
  "bounds": {
    "x": 450,
    "y": 350,
    "width": 550,
    "height": 400
  },
  "warpData": {
    "type": "mesh",
    "curveAmount": 30  // 0-100, higher = more curve
  }
}
```

### For Perspective Products (Tote Bags at Angle)

```json
"printArea": {
  "type": "perspective",
  "bounds": {
    "x": 350,
    "y": 300,
    "width": 500,
    "height": 500
  },
  "perspectivePoints": {
    "topLeft": { "x": 370, "y": 320 },
    "topRight": { "x": 830, "y": 340 },
    "bottomRight": { "x": 810, "y": 780 },
    "bottomLeft": { "x": 360, "y": 750 }
  }
}
```

---

## Color Variants (Optional)

Allow users to change product colors (e.g., white/black t-shirt).

```json
"colorVariants": [
  {
    "name": "White",
    "hex": "#FFFFFF",
    "colorBlendMode": "normal"
  },
  {
    "name": "Black",
    "hex": "#000000",
    "colorBlendMode": "multiply"
  },
  {
    "name": "Navy",
    "hex": "#001F3F",
    "colorBlendMode": "multiply"
  },
  {
    "name": "Red",
    "hex": "#FF4136",
    "colorBlendMode": "multiply"
  }
]
```

### Blend Modes

- `normal` - Default color (use for white/light colors)
- `multiply` - Darkens the image (use for dark colors)
- `overlay` - Mix of multiply and screen
- `screen` - Lightens the image

**Pro Tip:** For best results, use a white or light-colored base image and use `multiply` blend mode for darker colors.

---

## Advanced: Overlay Layer (Shadows/Highlights)

Create realistic mockups by adding a shadow/highlight overlay.

### Steps:

1. Create a separate PNG file with just the shadows/highlights
2. Make the product area transparent
3. Save as PNG with transparency
4. Reference in your template:

```json
"overlayImage": "/Mockup_Images/tshirts/tshirt-shadow-overlay.png"
```

**Example:**
- `base-image.jpg` - The t-shirt without shadows
- `shadow-overlay.png` - Transparent PNG with only the fabric folds/shadows

The editor will layer: Base → Artwork → Overlay

---

## Step-by-Step Example

Let's add a new coffee mug template.

### 1. Prepare Your Image

- File: `white-mug-front.jpg`
- Resolution: 1500×1500 pixels
- Optimized to 400KB

### 2. Add to Folder

Place in: `public/Mockup_Images/mugs/white-mug-front.jpg`

### 3. Find Print Area

Open in image editor:
- Print area starts at: X=500, Y=400
- Print area size: 600×450 pixels

### 4. Add to templates.json

```json
{
  "id": "mug-white-front-001",
  "name": "White Ceramic Mug - Front View",
  "category": "Drinkware",
  "thumbnail": "/Mockup_Images/mugs/white-mug-front.jpg",
  "baseImage": "/Mockup_Images/mugs/white-mug-front.jpg",
  "printArea": {
    "type": "curved",
    "bounds": {
      "x": 500,
      "y": 400,
      "width": 600,
      "height": 450
    },
    "warpData": {
      "type": "mesh",
      "curveAmount": 25
    }
  },
  "colorVariants": [
    {
      "name": "White",
      "hex": "#FFFFFF",
      "colorBlendMode": "normal"
    },
    {
      "name": "Black",
      "hex": "#1C1C1C",
      "colorBlendMode": "multiply"
    },
    {
      "name": "Red",
      "hex": "#E74C3C",
      "colorBlendMode": "multiply"
    }
  ],
  "tags": ["mug", "coffee", "drinkware", "ceramic", "white"],
  "resolution": {
    "width": 1500,
    "height": 1500
  }
}
```

### 5. Test

1. Reload the app
2. Go to Create Listing → Digital Product
3. Select your new template
4. Test with sample artwork

---

## Troubleshooting

### Template Not Showing Up

- ✅ Check JSON syntax (use JSONLint.com)
- ✅ Verify file path is correct
- ✅ Ensure image file exists in folder
- ✅ Clear browser cache and reload

### Print Area Not Aligned

- ✅ Double-check X, Y coordinates
- ✅ Verify width and height values
- ✅ Test with different artwork sizes
- ✅ Adjust bounds incrementally

### Colors Not Working

- ✅ Ensure base image is light-colored
- ✅ Use `multiply` blend mode for dark colors
- ✅ Test each color variant
- ✅ Check hex color format (#RRGGBB)

### Low Quality Output

- ✅ Use higher resolution source images
- ✅ Optimize images properly (don't over-compress)
- ✅ Ensure print area matches design dimensions

---

## Best Practices

### ✅ Do's

- Use professional, high-quality mockup images
- Test print area placement with various artwork
- Provide 3-5 color variants when applicable
- Use descriptive, unique template names
- Add relevant tags for searchability
- Optimize images for web (use TinyPNG, Squoosh)
- Keep file sizes under 500KB
- Create multiple angles of same product

### ❌ Don'ts

- Don't use copyrighted mockup images
- Don't use watermarked images
- Don't make print areas too small
- Don't use overly compressed/pixelated images
- Don't duplicate template IDs
- Don't exceed 2MB per image
- Don't skip the thumbnail field

---

## Template Checklist

Before adding a template, verify:

- [ ] Image is high-quality and professional
- [ ] Image is optimized (<500KB)
- [ ] Resolution is at least 1200×1200px
- [ ] File is in correct category folder
- [ ] Unique `id` assigned
- [ ] `name` is descriptive
- [ ] Correct `category` selected
- [ ] Print area coordinates are accurate
- [ ] Tags are relevant and searchable
- [ ] Resolution matches actual image size
- [ ] JSON syntax is valid
- [ ] Template tested in the app

---

## Template Collections

### Starter Pack (Included)

- 2 T-shirt mockups
- 2 Mug mockups
- 2 Canvas print mockups
- 1 Phone screen mockup
- 1 Pillow mockup
- 1 Tote bag mockup
- 1 Poster frame mockup

### Recommended Additions

**Apparel:**
- Hoodies (front, back)
- Tank tops
- Long-sleeve shirts
- Sweatshirts

**Drinkware:**
- Travel mugs
- Water bottles
- Wine glasses
- Beer steins

**Home:**
- Wall clocks
- Blankets
- Coasters
- Mouse pads

**Digital:**
- Laptop screens
- Tablet screens
- Smartwatch faces
- Desktop monitors

---

## Advanced Customization

### Creating Displacement Maps (for curved products)

1. Create a grayscale image representing depth
   - White = maximum displacement
   - Black = no displacement
   - Gray = partial displacement

2. Save as: `displacement-map.png`

3. Reference in template:
```json
"warpData": {
  "type": "displacement",
  "displacementMap": "/Mockup_Images/mugs/displacement-map.png",
  "curveAmount": 50
}
```

---

## Resources

### Image Optimization Tools
- [TinyPNG](https://tinypng.com/) - PNG/JPG compression
- [Squoosh](https://squoosh.app/) - Advanced image compression
- [ImageOptim](https://imageoptim.com/) - Mac image optimizer

### JSON Validation
- [JSONLint](https://jsonlint.com/) - Validate JSON syntax

### Image Editors
- [Photoshop](https://www.adobe.com/products/photoshop.html) - Professional (paid)
- [GIMP](https://www.gimp.org/) - Free alternative
- [Photopea](https://www.photopea.com/) - Free online editor

### Mockup Sources
- [Mockup World](https://www.mockupworld.co/) - Free mockups
- [Placeit](https://placeit.net/) - Premium mockups
- [Smartmockups](https://smartmockups.com/) - Mockup generator

---

## Support

For issues or questions:

1. Check this guide first
2. Verify JSON syntax with JSONLint
3. Test with sample artwork
4. Check browser console for errors
5. Contact support if issues persist

---

## Template Folder Location

**Absolute Path:**
```
C:\Users\User\Desktop\AI_APP_Projects\snap2listing\public\Mockup_Images\
```

**Templates JSON:**
```
C:\Users\User\Desktop\AI_APP_Projects\snap2listing\public\Mockup_Images\templates.json
```

---

## Version History

- **v1.0.0** - Initial mockup editor release with 10 starter templates
- Template system supports flat, curved, and perspective products
- Color variant system implemented
- Full editor with adjustments panel

---

*Happy templating! 🎨*
