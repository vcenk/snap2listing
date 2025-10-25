# Dynamic Mockups - Bulk Preview Guide

## 🎯 Preview All Mockups with Your Artwork

Dynamic Mockups **Bulk Render API** allows you to apply one artwork to ALL mockups in a collection and get back rendered previews.

---

## 📋 How It Works

### The Bulk Render API

**Endpoint:** `POST https://app.dynamicmockups.com/api/v1/renders/bulk`

**Purpose:** Apply your design to all mockup templates in a collection at once.

**Result:** Get back rendered images showing your artwork on every product in that collection.

---

## 🔧 Step-by-Step Implementation

### Step 1: Upload Artwork to Temporary Storage

```typescript
// Upload user's artwork first
async function uploadArtwork(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/upload-temp', {
    method: 'POST',
    body: formData,
  });

  const { url } = await response.json();
  return url; // Public URL for artwork
}
```

### Step 2: Get Collection UUID

You need the collection UUID for the product type you want to preview:

```typescript
const COLLECTIONS = {
  'tshirt': '0663101b-f01c-4e85-89af-f90b4e9f983b',
  'mug': 'a7b2c3d4-e5f6-7890-abcd-1234567890ef',
  'hoodie': 'b8c3d4e5-f6g7-8901-bcde-2345678901fg',
};
```

Or fetch dynamically:
```typescript
const collections = await fetch(
  'https://api.dynamic-mockups.com/api/v1/collections',
  {
    headers: { 'x-api-key': API_KEY }
  }
);
```

### Step 3: Call Bulk Render API

```typescript
async function previewAllMockups(
  collectionUUID: string,
  artworkUrl: string,
  colors?: { [key: string]: string }
) {
  const response = await fetch(
    'https://app.dynamicmockups.com/api/v1/renders/bulk',
    {
      method: 'POST',
      headers: {
        'x-api-key': process.env.DYNAMIC_MOCKUPS_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        collection_uuid: collectionUUID,
        artworks: {
          artwork_main: artworkUrl, // Your design URL
        },
        colors: colors || {}, // Optional: customize product colors
        image_format: 'webp', // jpg, png, or webp
        image_size: 800, // Width in pixels
        mode: 'view', // 'view' for preview, omit for download
      }),
    }
  );

  const data = await response.json();
  return data.renders; // Array of rendered mockup URLs
}
```

### Step 4: Response Format

```json
{
  "renders": [
    {
      "label": "Black T-Shirt Front",
      "mockup_uuid": "12345678-1234-1234-1234-123456789012",
      "url": "https://renders.dynamicmockups.com/renders/abc123.webp"
    },
    {
      "label": "White T-Shirt Front",
      "mockup_uuid": "23456789-2345-2345-2345-234567890123",
      "url": "https://renders.dynamicmockups.com/renders/def456.webp"
    },
    // ... all mockups in collection with your artwork applied
  ]
}
```

---

## 🎨 UI Implementation Examples

### Option 1: Preview Gallery

```typescript
function BulkPreviewGallery({ artwork, productType }) {
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  async function generatePreviews() {
    setLoading(true);

    // Upload artwork
    const artworkUrl = await uploadArtwork(artwork);

    // Get collection UUID for product type
    const collectionUUID = COLLECTIONS[productType];

    // Generate all previews
    const renders = await previewAllMockups(collectionUUID, artworkUrl);

    setPreviews(renders);
    setLoading(false);
  }

  useEffect(() => {
    if (artwork && productType) {
      generatePreviews();
    }
  }, [artwork, productType]);

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CircularProgress />
        <Typography>Generating previews on all mockups...</Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={2}>
      {previews.map((render, index) => (
        <Grid item xs={6} sm={4} md={3} key={render.mockup_uuid}>
          <Card>
            <CardMedia
              component="img"
              image={render.url}
              alt={render.label}
              sx={{ aspectRatio: '1/1', objectFit: 'cover' }}
            />
            <CardContent>
              <Typography variant="caption">{render.label}</Typography>
              <Checkbox
                onChange={(e) => handleSelect(render.mockup_uuid, e.target.checked)}
              />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
```

### Option 2: Server-Side API Route

```typescript
// app/api/mockups/bulk-preview/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { artworkUrl, collectionUUID, colors } = await request.json();

    const response = await fetch(
      'https://app.dynamicmockups.com/api/v1/renders/bulk',
      {
        method: 'POST',
        headers: {
          'x-api-key': process.env.DYNAMIC_MOCKUPS_API_KEY!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collection_uuid: collectionUUID,
          artworks: {
            artwork_main: artworkUrl,
          },
          colors: colors || {},
          image_format: 'webp',
          image_size: 800,
          mode: 'view',
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Bulk render failed: ${response.statusText}`);
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      previews: data.renders,
    });
  } catch (error) {
    console.error('Bulk preview error:', error);
    return NextResponse.json(
      { error: 'Failed to generate previews' },
      { status: 500 }
    );
  }
}
```

Then use it from client:

```typescript
const response = await fetch('/api/mockups/bulk-preview', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    artworkUrl: 'https://...',
    collectionUUID: '0663101b-...',
    colors: { color_main: '#FF5733' },
  }),
});

const { previews } = await response.json();
```

---

## 🎯 Full Workflow Integration

### Combined: Product Type → Preview → Select → Export

```typescript
export default function PODWorkflow() {
  const [step, setStep] = useState<'upload' | 'preview' | 'editor'>('upload');
  const [artwork, setArtwork] = useState<File | null>(null);
  const [productType, setProductType] = useState<string | null>(null);
  const [previews, setPreviews] = useState([]);
  const [selectedMockups, setSelectedMockups] = useState<string[]>([]);

  // Step 1: Upload artwork
  function handleArtworkUpload(file: File) {
    setArtwork(file);
    setStep('preview');
  }

  // Step 2: Select product type and generate previews
  async function handleProductTypeSelect(type: string) {
    setProductType(type);

    // Show loading state
    toast.info('Generating previews on all mockups...');

    // Upload artwork
    const artworkUrl = await uploadArtwork(artwork!);

    // Generate bulk previews
    const response = await fetch('/api/mockups/bulk-preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        artworkUrl,
        collectionUUID: COLLECTIONS[type],
      }),
    });

    const { previews: generatedPreviews } = await response.json();
    setPreviews(generatedPreviews);

    toast.success(`Generated ${generatedPreviews.length} previews!`);
  }

  // Step 3: User selects which mockups they like
  function handleMockupToggle(mockupUUID: string, selected: boolean) {
    if (selected) {
      setSelectedMockups([...selectedMockups, mockupUUID]);
    } else {
      setSelectedMockups(selectedMockups.filter(id => id !== mockupUUID));
    }
  }

  // Step 4: Open editor with pre-selected mockups
  function openEditorWithSelection() {
    // Pass selected mockup UUIDs to editor
    setStep('editor');
  }

  return (
    <>
      {step === 'upload' && (
        <ArtworkUploader onUpload={handleArtworkUpload} />
      )}

      {step === 'preview' && (
        <>
          <ProductTypeSelector onSelect={handleProductTypeSelect} />

          {previews.length > 0 && (
            <>
              <Typography variant="h5" gutterBottom>
                Preview Your Design on All Products
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Select the mockups you want to include
              </Typography>

              <Grid container spacing={2}>
                {previews.map((preview) => (
                  <Grid item xs={6} sm={4} md={3} key={preview.mockup_uuid}>
                    <PreviewCard
                      preview={preview}
                      selected={selectedMockups.includes(preview.mockup_uuid)}
                      onToggle={(selected) =>
                        handleMockupToggle(preview.mockup_uuid, selected)
                      }
                    />
                  </Grid>
                ))}
              </Grid>

              <Button
                variant="contained"
                size="large"
                disabled={selectedMockups.length === 0}
                onClick={openEditorWithSelection}
              >
                Continue with {selectedMockups.length} Selected Mockup
                {selectedMockups.length !== 1 ? 's' : ''}
              </Button>
            </>
          )}
        </>
      )}

      {step === 'editor' && (
        <MockupEditor
          templateUUIDs={selectedMockups}
          // ... other props
        />
      )}
    </>
  );
}
```

---

## 💡 Advanced Features

### 1. Color Customization

Let users customize product colors in the preview:

```typescript
const [productColor, setProductColor] = useState('#000000');

// Generate previews with custom color
await previewAllMockups(collectionUUID, artworkUrl, {
  color_main: productColor,
  color_secondary: '#FFFFFF',
});
```

### 2. Artwork Positioning

For more control, use the regular Render API with positioning:

```typescript
{
  "collection_uuid": "...",
  "artworks": {
    "artwork_main": {
      "url": "https://...",
      "position": { "top": 100, "left": 50 },
      "size": { "width": 500, "height": 500 },
      "display": "contain" // or "cover" or "stretch"
    }
  }
}
```

### 3. Caching Previews

Cache generated previews to avoid regenerating:

```typescript
// Store in database
await db.bulkPreviews.create({
  artworkUrl,
  collectionUUID,
  previews: renders,
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
});

// Check cache first
const cached = await db.bulkPreviews.findFirst({
  where: { artworkUrl, collectionUUID },
  where: { expiresAt: { gt: new Date() } },
});

if (cached) {
  return cached.previews;
}
```

### 4. Pagination for Large Collections

If a collection has 50+ mockups, paginate the results:

```typescript
function PreviewGallery({ previews }) {
  const [page, setPage] = useState(0);
  const perPage = 12;

  const paginatedPreviews = previews.slice(
    page * perPage,
    (page + 1) * perPage
  );

  return (
    <>
      <Grid container spacing={2}>
        {paginatedPreviews.map(preview => (
          <PreviewCard key={preview.mockup_uuid} preview={preview} />
        ))}
      </Grid>

      <Pagination
        count={Math.ceil(previews.length / perPage)}
        page={page + 1}
        onChange={(e, value) => setPage(value - 1)}
      />
    </>
  );
}
```

---

## 🚀 Performance Optimization

### 1. Generate Thumbnails

```typescript
// Request smaller images for gallery view
{
  image_format: 'webp',
  image_size: 400, // Smaller for thumbnails
}

// Then generate full-size only for selected mockups
{
  image_size: 2000, // High-res for final export
}
```

### 2. Progressive Loading

```typescript
function PreviewCard({ preview }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <Card>
      {!loaded && <Skeleton variant="rectangular" height={200} />}
      <img
        src={preview.url}
        alt={preview.label}
        onLoad={() => setLoaded(true)}
        style={{ display: loaded ? 'block' : 'none' }}
      />
    </Card>
  );
}
```

### 3. Batch Processing

For very large collections, process in batches:

```typescript
async function generatePreviewsInBatches(mockupUUIDs: string[], artworkUrl: string) {
  const batchSize = 10;
  const allPreviews = [];

  for (let i = 0; i < mockupUUIDs.length; i += batchSize) {
    const batch = mockupUUIDs.slice(i, i + batchSize);

    const batchPreviews = await Promise.all(
      batch.map(uuid => renderSingleMockup(uuid, artworkUrl))
    );

    allPreviews.push(...batchPreviews);

    // Update progress
    setProgress((i + batchSize) / mockupUUIDs.length * 100);
  }

  return allPreviews;
}
```

---

## 📊 Cost Considerations

**Important:** Each bulk render counts as **one API call per mockup** in the collection.

- Collection with 20 mockups = 20 API calls
- Check your Dynamic Mockups plan limits
- Consider caching previews
- Let users preview before committing to generate all

### Pricing-Aware UX

```typescript
<Alert severity="info">
  This collection has {mockupCount} mockups.
  Generating previews will use {mockupCount} API credits.
  <Link>View your plan limits</Link>
</Alert>

<Button onClick={generatePreviews}>
  Generate {mockupCount} Previews
</Button>
```

---

## 🎯 Summary

**Bulk Preview Method:**

1. ✅ Upload user's artwork to accessible URL
2. ✅ Call **Bulk Render API** with `collection_uuid` and `artwork_main`
3. ✅ Display all rendered previews in a gallery
4. ✅ Let users select which mockups they want
5. ✅ Open editor with pre-selected mockups (optional)
6. ✅ Or directly export selected mockups

**API Endpoint:**
```
POST https://app.dynamicmockups.com/api/v1/renders/bulk
```

**Key Parameters:**
- `collection_uuid` - Which products to render
- `artworks.artwork_main` - Your design URL
- `colors` - Optional product color customization
- `image_format` - webp, jpg, or png
- `image_size` - Preview size in pixels

---

## 📚 Resources

- **Bulk Render API:** https://docs.dynamicmockups.com/api-reference/bulk-render-api
- **Collections API:** https://docs.dynamicmockups.com/api-reference/get-collections-api
- **Render API:** https://docs.dynamicmockups.com/api-reference/render-api

---

**Next Steps:**
1. Set up server-side API route for bulk rendering
2. Create preview gallery component
3. Add product type selector
4. Implement selection mechanism
5. Integrate with your POD workflow
