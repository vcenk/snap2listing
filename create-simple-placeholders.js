const fs = require('fs');
const path = require('path');

// Create a simple 1x1 pixel PNG data
function createSimplePNG(width, height, r = 255, g = 255, b = 255) {
  // Simple PNG header + 1x1 white pixel
  const pngData = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 dimensions
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, // 8-bit RGB
    0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, // IDAT chunk
    0x54, 0x08, 0xD7, 0x63, r, g, b, 0x00, 0x00, 0x00, // RGB data
    0x02, 0x00, 0x01, 0xE2, 0x21, 0xBC, 0x33, 0x00,
    0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, // IEND
    0x42, 0x60, 0x82
  ]);
  return pngData;
}

const basePath = './packages/web-demo/public/Mockup_Images';

// Create directories if they don't exist
const dirs = ['tshirts', 'mugs', 'pillows'];
dirs.forEach(dir => {
  const dirPath = path.join(basePath, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Generate simple placeholder images
const images = [
  // T-Shirt (light blue)
  { path: 'tshirts/thumb.jpg', color: [227, 242, 253] },
  { path: 'tshirts/base.jpg', color: [255, 255, 255] },
  
  // Mug (light orange)
  { path: 'mugs/thumb.jpg', color: [255, 243, 224] },
  { path: 'mugs/base.jpg', color: [255, 255, 255] },
  
  // Pillow (light purple)
  { path: 'pillows/thumb.jpg', color: [243, 229, 245] },
  { path: 'pillows/base.jpg', color: [255, 255, 255] }
];

images.forEach(img => {
  const [r, g, b] = img.color;
  const buffer = createSimplePNG(300, 300, r, g, b);
  const filePath = path.join(basePath, img.path);
  fs.writeFileSync(filePath, buffer);
  console.log(`Created: ${filePath}`);
});

console.log('All placeholder images created successfully!');