# Quick Add Template Guide

## 📋 **Checklist**

- [ ] Image prepared (JPG/PNG, <500KB)
- [ ] Image placed in correct folder
- [ ] Print area coordinates found
- [ ] JSON entry added to templates.json
- [ ] App reloaded to test

---

## 🚀 **3-Step Process**

### **1. Add Image File**

Place your mockup image in the appropriate folder:

```
public/Mockup_Images/
├── tshirts/          ← T-shirts, hoodies
├── mugs/             ← Mugs, cups
├── canvas-prints/    ← Canvas, posters
├── pillows/          ← Pillows, cushions
├── tote-bags/        ← Bags
├── phone-screens/    ← Phone/app mockups
└── other/            ← Other products
```

**Example:**
```
public/Mockup_Images/mugs/my-mug-mockup.jpg
```

---

### **2. Find Print Area (Easy Method)**

**Using Any Image Editor:**

1. Open your mockup image
2. Draw a rectangle where artwork should go
3. Note these 4 numbers:
   - **X**: Distance from left edge
   - **Y**: Distance from top edge
   - **Width**: Rectangle width
   - **Height**: Rectangle height

**Quick Estimate (if no editor):**
- Most t-shirts: `x: 350-400, y: 250-300, width: 400-500, height: 500-600`
- Most mugs: `x: 400-450, y: 350-400, width: 500-600, height: 400-500`
- Phone screens: `x: 300-350, y: 150-200, width: 500-600, height: 900-1000`

**Pro Tip:** Start with rough estimates, then fine-tune in the editor!

---

### **3. Add to templates.json**

Open: `public/Mockup_Images/templates.json`

Add this entry to the `"templates"` array:

```json
{
  "id": "your-unique-id",
  "name": "Your Template Name",
  "category": "Apparel",
  "thumbnail": "/Mockup_Images/folder/your-image.jpg",
  "baseImage": "/Mockup_Images/folder/your-image.jpg",
  "printArea": {
    "type": "flat",
    "bounds": {
      "x": 400,
      "y": 300,
      "width": 500,
      "height": 600
    }
  },
  "tags": ["keyword1", "keyword2"],
  "resolution": {
    "width": 1600,
    "height": 1800
  }
}
```

**Don't forget the comma** between entries!

---

## 📊 **Field Reference**

### **Required Fields**

| Field | Type | Example | Description |
|-------|------|---------|-------------|
| `id` | string | `"mug-red-001"` | Unique ID (no spaces, use dashes) |
| `name` | string | `"Red Ceramic Mug"` | Display name |
| `category` | string | `"Drinkware"` | See categories below |
| `thumbnail` | string | `"/Mockup_Images/mugs/red-mug.jpg"` | Path to image |
| `baseImage` | string | `"/Mockup_Images/mugs/red-mug.jpg"` | Path to full image |
| `printArea.type` | string | `"flat"` | `flat`, `curved`, or `perspective` |
| `printArea.bounds.x` | number | `450` | Left edge position (pixels) |
| `printArea.bounds.y` | number | `350` | Top edge position (pixels) |
| `printArea.bounds.width` | number | `550` | Print area width (pixels) |
| `printArea.bounds.height` | number | `400` | Print area height (pixels) |
| `tags` | array | `["mug", "red"]` | Search keywords |
| `resolution.width` | number | `1500` | Image width |
| `resolution.height` | number | `1500` | Image height |

### **Categories**

Choose one:
- `Apparel` - T-shirts, hoodies, clothing
- `Drinkware` - Mugs, cups, bottles
- `Canvas Prints` - Canvas, posters, wall art
- `Home Decor` - Pillows, cushions, home items
- `Digital` - Phone screens, app mockups
- `Bags` - Tote bags, shopping bags
- `Other` - Everything else

---

## 🎨 **Examples**

### **Example 1: Simple T-Shirt**

```json
{
  "id": "tshirt-black-002",
  "name": "Black T-Shirt - Front View",
  "category": "Apparel",
  "thumbnail": "/Mockup_Images/tshirts/black-tshirt.jpg",
  "baseImage": "/Mockup_Images/tshirts/black-tshirt.jpg",
  "printArea": {
    "type": "flat",
    "bounds": {
      "x": 380,
      "y": 280,
      "width": 480,
      "height": 560
    }
  },
  "tags": ["tshirt", "black", "apparel"],
  "resolution": {
    "width": 1600,
    "height": 1800
  }
}
```

### **Example 2: Mug with Color Variants**

```json
{
  "id": "mug-classic-001",
  "name": "Classic Coffee Mug",
  "category": "Drinkware",
  "thumbnail": "/Mockup_Images/mugs/white-mug.jpg",
  "baseImage": "/Mockup_Images/mugs/white-mug.jpg",
  "printArea": {
    "type": "curved",
    "bounds": {
      "x": 450,
      "y": 350,
      "width": 550,
      "height": 420
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
      "hex": "#000000",
      "colorBlendMode": "multiply"
    },
    {
      "name": "Blue",
      "hex": "#3498DB",
      "colorBlendMode": "multiply"
    }
  ],
  "tags": ["mug", "coffee", "ceramic"],
  "resolution": {
    "width": 1500,
    "height": 1500
  }
}
```

### **Example 3: Phone Screen**

```json
{
  "id": "phone-iphone-001",
  "name": "iPhone 14 Screen",
  "category": "Digital",
  "thumbnail": "/Mockup_Images/phone-screens/iphone-14.jpg",
  "baseImage": "/Mockup_Images/phone-screens/iphone-14.jpg",
  "printArea": {
    "type": "flat",
    "bounds": {
      "x": 320,
      "y": 180,
      "width": 560,
      "height": 1000
    }
  },
  "tags": ["phone", "iphone", "mobile", "screen"],
  "resolution": {
    "width": 1200,
    "height": 1400
  }
}
```

---

## 🔧 **Advanced Features (Optional)**

### **Color Variants**

Allow users to change product colors:

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
    "name": "Red",
    "hex": "#E74C3C",
    "colorBlendMode": "multiply"
  }
]
```

**Blend Modes:**
- `normal` - For white/light base
- `multiply` - For dark colors
- `overlay` - Mixed effect
- `screen` - Lightening effect

### **Curved Products (Mugs)**

```json
"printArea": {
  "type": "curved",
  "bounds": { "x": 450, "y": 350, "width": 550, "height": 420 },
  "warpData": {
    "type": "mesh",
    "curveAmount": 30
  }
}
```

**curveAmount:** 0-100 (higher = more curve)

### **Perspective Products (Bags at Angle)**

```json
"printArea": {
  "type": "perspective",
  "bounds": { "x": 350, "y": 300, "width": 500, "height": 500 },
  "perspectivePoints": {
    "topLeft": { "x": 370, "y": 320 },
    "topRight": { "x": 830, "y": 340 },
    "bottomRight": { "x": 810, "y": 780 },
    "bottomLeft": { "x": 360, "y": 750 }
  }
}
```

---

## ✅ **Testing Your Template**

1. Save `templates.json`
2. Reload your app (`npm run dev`)
3. Go to Create Listing → Digital Product
4. Click "Browse Mockup Library"
5. Search for your template
6. Select it and test in the editor

**If print area is wrong:**
- Adjust the `x`, `y`, `width`, `height` values
- Reload and test again
- Fine-tune until perfect!

---

## 🐛 **Troubleshooting**

| Problem | Solution |
|---------|----------|
| Template not showing | Check JSON syntax at jsonlint.com |
| Image not loading | Verify file path is correct |
| Print area off | Adjust x, y, width, height values |
| Colors not working | Use light base image + multiply blend |
| Slow loading | Optimize image size (<500KB) |

---

## 📐 **Print Area Tips**

### **Quick Measurements**

**T-Shirts (1600×1800 image):**
```json
"bounds": { "x": 380, "y": 280, "width": 480, "height": 560 }
```

**Mugs (1500×1500 image):**
```json
"bounds": { "x": 450, "y": 350, "width": 550, "height": 420 }
```

**Phone Screens (1200×1400 image):**
```json
"bounds": { "x": 320, "y": 180, "width": 560, "height": 1000 }
```

**Canvas Prints (1600×1200 image):**
```json
"bounds": { "x": 250, "y": 180, "width": 700, "height": 500 }
```

**Pillows (1400×1400 image):**
```json
"bounds": { "x": 400, "y": 280, "width": 500, "height": 500 }
```

---

## 💡 **Pro Tips**

1. **Start Simple:** Begin with `type: "flat"` and no color variants
2. **Test Early:** Add template → test → adjust → repeat
3. **Use Templates:** Copy an existing template and modify it
4. **Batch Add:** Add multiple templates at once
5. **Organize:** Use consistent naming (tshirt-color-001, tshirt-color-002)
6. **Optimize Images:** Always compress before adding

---

## 📚 **Full Documentation**

See detailed guide: `public/Mockup_Images/TEMPLATE_GUIDE.md`

---

**Happy template creating! 🎨**
