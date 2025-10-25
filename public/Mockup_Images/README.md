# Mockup Templates Directory

This directory contains mockup templates organized by category. Add your mockup template images to the appropriate folders.

## Directory Structure

```
Mockup_Images/
├── poster-frames/     # Wall frames, desk frames, gallery walls
├── tshirts/          # T-shirt mockups (white, black, colors)
├── mugs/             # Coffee mugs, travel mugs
├── phone-screens/    # Phone/mobile app screens
├── canvas-prints/    # Canvas wall prints
├── pillows/          # Throw pillows, cushions
├── tote-bags/        # Tote bags, shopping bags
└── other/            # Any other mockup types
```

## Adding Templates

1. **Save your mockup images** to the appropriate category folder
2. **Name format**: Use descriptive names like:
   - `white-tshirt-front.jpg`
   - `black-mug-side.jpg`
   - `poster-frame-wall-scene.jpg`

3. **Image requirements**:
   - Format: JPG or PNG
   - Recommended size: 800×800px to 2000×2000px
   - Keep file sizes reasonable (<2MB each)

4. **Update the component** after adding new images:
   - Open: `components/CreateListing/MockupPicker.tsx`
   - Update the `MOCKUPS` array with your new template details

## Example Entry

```typescript
{
  id: 'white-tshirt-1',
  name: 'White T-Shirt - Front',
  thumbnail: '/Mockup_Images/tshirts/white-tshirt-front.jpg',
  category: 'Apparel',
  tags: ['tshirt', 'clothing', 'white', 'front'],
}
```

## Categories Explained

- **Frames**: Picture frames, posters on walls
- **Apparel**: T-shirts, hoodies, clothing items
- **Drinkware**: Mugs, cups, bottles
- **Digital**: Phone screens, laptop screens, tablets
- **Prints**: Canvas prints, art prints
- **Home**: Pillows, home decor
- **Bags**: Tote bags, shopping bags
- **Other**: Miscellaneous mockup types

## Tips

- Use high-quality, professional mockup templates
- Ensure consistent lighting across similar mockups
- Consider multiple angles (front, side, perspective)
- Include lifestyle scenes when possible
- Test mockups to ensure product area is clearly defined
