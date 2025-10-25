# Dynamic Mockups - Product Categorization Guide

## How Dynamic Mockups Organizes Products

Dynamic Mockups uses **Collections** to categorize mockups by product type (t-shirts, mugs, hoodies, etc.).

---

## 📋 Method 1: Using Collections (Recommended)

### Step 1: Create Collections in Dashboard

1. Go to https://dynamicmockups.com/dashboard
2. Navigate to **"My Mockups"** or **"Collections"**
3. Create collections for each product type:
   - "T-Shirts"
   - "Mugs"
   - "Hoodies"
   - "Phone Cases"
   - "Tote Bags"
   - etc.

4. **Add mockups to each collection** by product type

### Step 2: Get Collection UUIDs

Use the **Get Collections API**:

```bash
curl -X GET "https://api.dynamic-mockups.com/api/v1/collections" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Accept: application/json"
```

**Response:**
```json
{
  "collections": [
    {
      "uuid": "f63c0cfa-f106-463e-bbf9-5514b5164245",
      "name": "T-Shirts",
      "mockup_count": 25,
      "created_at": "2025-01-15T10:00:00Z"
    },
    {
      "uuid": "a7b2c3d4-e5f6-7890-abcd-1234567890ef",
      "name": "Mugs",
      "mockup_count": 15,
      "created_at": "2025-01-15T11:00:00Z"
    }
  ]
}
```

### Step 3: Get Mockups by Collection

Use the **Get Mockups API** with `collection_uuid`:

```bash
# Get all T-shirt mockups
curl -X GET "https://api.dynamic-mockups.com/api/v1/mockups?collection_uuid=f63c0cfa-f106-463e-bbf9-5514b5164245" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Accept: application/json"
```

**Response:**
```json
{
  "mockups": [
    {
      "uuid": "12345678-1234-1234-1234-123456789012",
      "name": "Black T-Shirt Front",
      "thumbnail": "https://...",
      "collection_uuid": "f63c0cfa-f106-463e-bbf9-5514b5164245"
    },
    // ... more t-shirt mockups
  ]
}
```

---

## 🎨 Method 2: Filter Embed Editor by Templates

### Option A: Use Templates Parameter in SDK

```typescript
import { initDynamicMockupsIframe } from "@dynamic-mockups/mockup-editor-sdk";

// Get mockup UUIDs from API first
const tshirtMockupUUIDs = [
  "12345678-1234-1234-1234-123456789012",
  "23456789-2345-2345-2345-234567890123",
  // ... more UUIDs
];

initDynamicMockupsIframe({
  iframeId: "dm-iframe",
  data: {
    "x-website-key": "YOUR_WEBSITE_KEY",
    templates: tshirtMockupUUIDs, // ⬅️ Only show these templates
    showCollectionsWidget: true,
    enableExportMockups: true,
  },
  mode: "custom",
  callback: (data) => {
    // Handle exported mockups
  }
});
```

### Option B: Use Collection in Iframe URL

```typescript
// Method 1: Direct collection URL
<iframe
  id="dm-iframe"
  src={`https://embed.dynamicmockups.com/collection/${collectionUUID}`}
/>

// Method 2: Query parameter (if supported)
<iframe
  id="dm-iframe"
  src={`https://embed.dynamicmockups.com?collection=${collectionUUID}`}
/>
```

---

## 🚀 Implementation in Your App

### Approach 1: Product Type Selector

Let users choose a product type first:

```typescript
interface ProductType {
  name: string;
  collectionUUID: string;
  icon: string;
}

const productTypes: ProductType[] = [
  { name: "T-Shirts", collectionUUID: "f63c0cfa-...", icon: "👕" },
  { name: "Mugs", collectionUUID: "a7b2c3d4-...", icon: "☕" },
  { name: "Hoodies", collectionUUID: "b8c3d4e5-...", icon: "🧥" },
  { name: "Phone Cases", collectionUUID: "c9d4e5f6-...", icon: "📱" },
];

function ProductSelector({ onSelect }) {
  return (
    <Grid container spacing={2}>
      {productTypes.map((type) => (
        <Grid item xs={6} md={3} key={type.collectionUUID}>
          <Card onClick={() => onSelect(type)}>
            <CardContent>
              <Typography variant="h2">{type.icon}</Typography>
              <Typography>{type.name}</Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
```

### Approach 2: Dynamic Collection Loading

Create an API endpoint to fetch collections:

```typescript
// app/api/mockups/collections/route.ts
export async function GET() {
  const response = await fetch('https://api.dynamic-mockups.com/api/v1/collections', {
    headers: {
      'x-api-key': process.env.DYNAMIC_MOCKUPS_API_KEY!,
      'Accept': 'application/json',
    },
  });

  const data = await response.json();
  return NextResponse.json(data);
}
```

Then use it in your component:

```typescript
const [collections, setCollections] = useState([]);
const [selectedCollection, setSelectedCollection] = useState(null);

useEffect(() => {
  fetch('/api/mockups/collections')
    .then(res => res.json())
    .then(data => setCollections(data.collections));
}, []);

// Pass selected collection to editor
<MockupEditor
  collectionUUID={selectedCollection?.uuid}
  // ...
/>
```

### Approach 3: Filter Templates in Editor

```typescript
// lib/api/dynamicMockups.ts

export async function getMockupsByCategory(category: string) {
  const collections = {
    'tshirt': 'f63c0cfa-f106-463e-bbf9-5514b5164245',
    'mug': 'a7b2c3d4-e5f6-7890-abcd-1234567890ef',
    'hoodie': 'b8c3d4e5-f6g7-8901-bcde-2345678901fg',
  };

  const collectionUUID = collections[category];

  const response = await fetch(
    `https://api.dynamic-mockups.com/api/v1/mockups?collection_uuid=${collectionUUID}`,
    {
      headers: {
        'x-api-key': process.env.DYNAMIC_MOCKUPS_API_KEY!,
        'Accept': 'application/json',
      },
    }
  );

  const data = await response.json();
  return data.mockups.map(m => m.uuid);
}
```

---

## 💡 Best Practices

### 1. Organize Collections by Product Type

Create clear, specific collections:
- ✅ "Men's T-Shirts - Black"
- ✅ "Ceramic Mugs - 11oz"
- ✅ "Hoodies - Pullover"
- ❌ "All Products" (too broad)

### 2. Use API to Stay in Sync

- Don't hardcode mockup UUIDs
- Fetch collections dynamically from the API
- Cache results with reasonable TTL (1 hour)

### 3. Provide Clear UI

```typescript
// Show product type before opening editor
<Typography variant="h6">
  Creating mockups for: {productType}
</Typography>
<Button onClick={() => openEditor(productTypeCollectionUUID)}>
  Open {productType} Editor
</Button>
```

### 4. Handle Empty Collections

```typescript
if (mockups.length === 0) {
  return (
    <Alert severity="info">
      No {productType} templates available.
      <Link href="/dashboard">Add templates</Link>
    </Alert>
  );
}
```

---

## 🔧 Updated MockupEditor Component

```typescript
interface MockupEditorProps {
  open: boolean;
  onClose: () => void;
  productType?: string; // "tshirt" | "mug" | "hoodie"
  collectionUUID?: string; // Optional: filter by collection
  templateUUIDs?: string[]; // Optional: specific templates
  onMockupsGenerated: (urls: string[]) => void;
  userId: string;
  listingId: string;
}

export default function MockupEditor({
  productType,
  collectionUUID,
  templateUUIDs,
  // ...
}: MockupEditorProps) {
  // If collectionUUID provided, fetch templates
  useEffect(() => {
    if (collectionUUID && !templateUUIDs) {
      fetchTemplatesForCollection(collectionUUID)
        .then(setTemplates);
    }
  }, [collectionUUID]);

  // Initialize SDK with filtered templates
  initDynamicMockupsIframe({
    // ...
    data: {
      "x-website-key": websiteKey,
      templates: templateUUIDs, // Only show these templates
      showCollectionsWidget: !templateUUIDs, // Hide if filtered
    },
    // ...
  });
}
```

---

## 📊 Database Schema (Optional)

Store collection mappings in your database:

```sql
CREATE TABLE product_categories (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  collection_uuid VARCHAR(100) NOT NULL,
  icon VARCHAR(50),
  sort_order INT,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO product_categories (name, collection_uuid, icon) VALUES
('T-Shirts', 'f63c0cfa-f106-463e-bbf9-5514b5164245', '👕'),
('Mugs', 'a7b2c3d4-e5f6-7890-abcd-1234567890ef', '☕'),
('Hoodies', 'b8c3d4e5-f6g7-8901-bcde-2345678901fg', '🧥');
```

---

## 🎯 Summary

**Dynamic Mockups uses Collections for categorization:**

1. ✅ **Create collections** in dashboard by product type
2. ✅ **Get collection UUIDs** via API
3. ✅ **Filter mockups** by `collection_uuid` parameter
4. ✅ **Pass templates array** to SDK to show specific products
5. ✅ **Build product selector** UI for better UX

**You cannot filter by arbitrary categories** - you must use the collection system.

---

## 📚 API Reference

- **Get Collections:** `GET /api/v1/collections`
- **Get Mockups (filtered):** `GET /api/v1/mockups?collection_uuid={UUID}`
- **SDK Docs:** https://docs.dynamicmockups.com/mockup-editor-sdk/editor-configuration

---

**Next Steps:**
1. Create collections in your Dynamic Mockups dashboard
2. Note down collection UUIDs
3. Update your app to filter by product type
4. Test the filtered editor experience
