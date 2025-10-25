const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Create placeholder images
function createPlaceholderImage(width, height, text, bgColor = '#f0f0f0', textColor = '#666') {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);
  
  // Text
  ctx.fillStyle = textColor;
  ctx.font = `${Math.min(width, height) / 10}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, height / 2);
  
  return canvas.toBuffer('image/jpeg');
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

// Generate placeholder images
const images = [
  // T-Shirt
  { path: 'tshirts/thumb.jpg', width: 300, height: 300, text: 'T-Shirt\nThumb', bg: '#e3f2fd' },
  { path: 'tshirts/base.jpg', width: 2400, height: 2400, text: 'T-Shirt\nBase Image', bg: '#ffffff' },
  
  // Mug  
  { path: 'mugs/thumb.jpg', width: 300, height: 300, text: 'Coffee\nMug', bg: '#fff3e0' },
  { path: 'mugs/base.jpg', width: 1800, height: 1800, text: 'Mug\nBase Image', bg: '#ffffff' },
  
  // Pillow
  { path: 'pillows/thumb.jpg', width: 300, height: 300, text: 'Throw\nPillow', bg: '#f3e5f5' },
  { path: 'pillows/base.jpg', width: 2000, height: 2000, text: 'Pillow\nBase Image', bg: '#ffffff' }
];

images.forEach(img => {
  const buffer = createPlaceholderImage(img.width, img.height, img.text, img.bg);
  const filePath = path.join(basePath, img.path);
  fs.writeFileSync(filePath, buffer);
  console.log(`Created: ${filePath}`);
});

console.log('All placeholder images created successfully!');