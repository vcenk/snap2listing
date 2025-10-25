# Mockup Editor Migration Guide

## 🔄 Migrating from Fabric.js to Snap2Mock

This guide helps you migrate from the current Fabric.js-based mockup editor to the new Snap2Mock implementation with WebGL/Canvas2D rendering.

## 📋 Quick Migration Steps

### 1. Install Dependencies

The required dependencies are already added to your workspace:

```bash
npm install
# or
pnpm install
```

Dependencies added:
- `@snap2mock/core` - Main rendering library
- `ag-psd` - PSD parsing library  
- `zod` - Schema validation

### 2. Replace Component Import

In `components/CreateListing/EnhancedMockupEditor.tsx`:

```diff
- import MockupCanvas from './MockupCanvas';
+ import NewMockupCanvas from './NewMockupCanvas';
```

### 3. Update Component Usage

In the same file, replace `MockupCanvas` with `NewMockupCanvas`:

```diff
- <MockupCanvas
+ <NewMockupCanvas
```

### 4. Build the Core Library

Before running your application:

```bash
npm run build:core
# or 
pnpm build:core
```

## 🎯 What's Different

### ✅ Improvements
- **Better Performance**: WebGL2 acceleration with Canvas2D fallback
- **PSD Support**: Load and parse PSD files with smart object replacement
- **Advanced Warps**: Proper curved and perspective transformations
- **Better Blending**: Photoshop-compatible blend modes
- **Type Safety**: Full TypeScript support with strict mode
- **Modern Architecture**: No more Fabric.js dependency

### 🔄 Behavior Changes

1. **Interactive Editing**: The new implementation focuses on rendering quality over interactive editing
   - No more drag/drop handles on artwork (this was planned for v2)
   - Artwork positioning controlled via sidebar controls only
   
2. **Rendering Pipeline**: 
   - Old: Fabric.js Canvas → Export
   - New: Load Template → Apply Artwork → WebGL/Canvas2D Render → Export

3. **Template Format**: Fully backward compatible
   - Your existing `templates.json` works as-is
   - Optional PSD support can be added by extending templates

## 📝 Template Enhancement (Optional)

You can enhance your templates with PSD support:

```json
{
  "id": "enhanced-tshirt",
  "name": "Enhanced T-Shirt",
  // ... existing fields ...
  "psd": {
    "url": "https://your-cdn.com/tshirt-layers.psd",
    "smartLayer": "YOUR DESIGN HERE"
  }
}
```

## 🧪 Testing the Migration

1. **Start Development Server**:
   ```bash
   npm run dev
   ```

2. **Test Basic Functionality**:
   - Navigate to Create Listing → Digital Product Generation
   - Select a mockup template
   - Upload artwork
   - Verify rendering works
   - Test export functionality

3. **Check Browser Console**:
   - Look for any import errors
   - Verify WebGL2 support is detected
   - Check for successful render logs (when DEBUG_MODE is true)

## 🔧 Troubleshooting

### Import Errors
```
Module not found: Can't resolve '@snap2mock/core'
```
**Solution**: Run `npm run build:core` first, then restart your dev server.

### WebGL Issues
If you see Canvas2D fallback warnings:
- This is normal for older browsers
- Performance may be slower but functionality remains the same

### Template Loading Errors
```
Failed to load template
```
**Solution**: Check that your `templates.json` is accessible at `/Mockup_Images/templates.json`

### PSD Errors (if using PSD templates)
```
CORS error loading PSD
```
**Solution**: Ensure PSD files are served with proper CORS headers:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET
```

## 🚀 Performance Tips

1. **Preload Templates**: Templates are automatically cached after first load
2. **Optimize Images**: Use WebP format for base images when possible  
3. **Batch Operations**: Multiple exports from the same template are faster
4. **WebGL2**: Ensure WebGL2 is available for best performance

## 🔄 Rollback Plan

If you need to rollback:

1. **Restore Old Import**:
   ```diff
   - import NewMockupCanvas from './NewMockupCanvas';
   + import MockupCanvas from './MockupCanvas';
   ```

2. **Restore Component Usage**:
   ```diff
   - <NewMockupCanvas
   + <MockupCanvas
   ```

3. **Remove Dependencies** (if needed):
   ```diff
   - "@snap2mock/core": "workspace:*",
   - "ag-psd": "^14.3.6",
   - "zod": "^3.22.4"
   ```

## 📞 Support

- **Issues**: Check browser console for detailed error messages
- **Performance**: Monitor render times in browser dev tools
- **Templates**: Use `npm run validate:templates` to verify template structure
- **Demo**: Run `npm run dev:demo` to test the new system standalone

## 🎉 Next Steps

Once migration is successful:

1. **Enhance Templates**: Add PSD support for advanced templates
2. **Optimize Performance**: Monitor render times and optimize as needed  
3. **Update Documentation**: Update any internal docs referencing the old system
4. **User Testing**: Test with your most common use cases

Happy mocking with the new Snap2Mock system! 🎨