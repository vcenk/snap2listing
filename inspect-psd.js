const { readPsd, initializeCanvas } = require('ag-psd');
const { createCanvas } = require('canvas');
const fs = require('fs');

// Initialize canvas for Node.js environment
initializeCanvas(createCanvas);

async function inspectPSD() {
  try {
    const psdPath = './packages/web-demo/public/Mockup_Images/tshirts/23.psd';
    
    if (!fs.existsSync(psdPath)) {
      console.log('PSD file not found at:', psdPath);
      return;
    }

    const buffer = fs.readFileSync(psdPath);
    const psd = readPsd(buffer, { useImageData: false }); // Don't load image data
    
    console.log('PSD Info:');
    console.log('- Width:', psd.width);
    console.log('- Height:', psd.height);
    console.log('- Layers found:', psd.children?.length || 0);
    console.log();
    
    if (psd.children && psd.children.length > 0) {
      console.log('Layer names:');
      psd.children.forEach((layer, index) => {
        console.log(`${index + 1}. "${layer.name}" (visible: ${layer.visible !== false})`);
        
        // Check for nested layers
        if (layer.children && layer.children.length > 0) {
          layer.children.forEach((child, childIndex) => {
            console.log(`   ${index + 1}.${childIndex + 1}. "${child.name}" (visible: ${child.visible !== false})`);
          });
        }
      });
    } else {
      console.log('No layers found in PSD');
    }
    
    console.log();
    console.log('Suggested smart layer names to try:');
    const allLayers = [];
    
    function collectLayers(layers, prefix = '') {
      if (!layers) return;
      layers.forEach(layer => {
        allLayers.push(prefix + layer.name);
        if (layer.children) {
          collectLayers(layer.children, prefix + layer.name + '/');
        }
      });
    }
    
    collectLayers(psd.children);
    
    // Filter potential design layers
    const designLayers = allLayers.filter(name => 
      name.toLowerCase().includes('design') ||
      name.toLowerCase().includes('smart') ||
      name.toLowerCase().includes('artwork') ||
      name.toLowerCase().includes('logo') ||
      name.toLowerCase().includes('graphic') ||
      name.toLowerCase().includes('print') ||
      name.toLowerCase().includes('your') ||
      name.toLowerCase().includes('here') ||
      name.toLowerCase().includes('place')
    );
    
    if (designLayers.length > 0) {
      designLayers.forEach(name => console.log(`- "${name}"`));
    } else {
      console.log('No obvious design layers found. Try these layer names:');
      allLayers.slice(0, 5).forEach(name => console.log(`- "${name}"`));
    }
    
  } catch (error) {
    console.error('Error inspecting PSD:', error.message);
  }
}

inspectPSD();