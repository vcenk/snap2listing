# Phase 1, Week 2: Design Library & Product Creation

## 🎯 Goal
Build a complete design library system and product creation workflow, continuing the Listybox-style experience.

**Timeline:** 5-7 days
**Complexity:** Medium-High
**Impact:** High (enables actual product creation)

---

## 📋 Week 2 Overview

### What We'll Build:
1. **Design Library** - Upload, browse, and manage designs
2. **Design Upload API** - Handle design file uploads to R2
3. **Product Creation Workflow** - Create products with selected designs
4. **Product Management** - View and manage created products
5. **Product Details** - Edit product information and variants

---

## 📅 Day-by-Day Implementation

### **Day 1: Design Library Foundation** (6 hours)

#### 1. Create Design Types & Database Schema
```typescript
// lib/types/design.ts
export interface Design {
  id: string;
  userId: string;
  name: string;
  imageUrl: string;
  category: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

#### 2. Design Upload API Endpoint
**File:** `app/api/designs/upload/route.ts`

Features:
- Accept base64 image data
- Upload to R2 storage
- Save metadata to database
- Return design object

#### 3. Design List API Endpoint
**File:** `app/api/designs/list/route.ts`

Features:
- Fetch user's designs
- Filter by category/tags
- Pagination support
- Search functionality

✅ **Checkpoint:** Upload and list designs via API

---

### **Day 2: Design Library UI** (6 hours)

#### 1. DesignCard Component
**File:** `components/Designs/DesignCard.tsx`

Features:
- Beautiful card with hover effects
- Design preview image
- Selection checkbox
- Category badge
- Delete/Edit actions

#### 2. DesignUploader Component
**File:** `components/Designs/DesignUploader.tsx`

Features:
- Drag-and-drop upload
- File size validation
- Preview before upload
- Upload progress
- Multiple file support

#### 3. DesignLibrary Component
**File:** `components/Designs/DesignLibrary.tsx`

Features:
- Grid layout with designs
- Search bar
- Category filter
- Upload button
- Selection mode

✅ **Checkpoint:** Full design library UI working

---

### **Day 3: Product Creation Workflow** (8 hours)

#### 1. Product Type Definitions
**File:** `lib/types/product.ts`

```typescript
export interface Product {
  id: string;
  userId: string;
  name: string;
  description: string;
  productType: ProductType;
  designId: string;
  mockupUrls: string[];
  variants: ProductVariant[];
  status: 'draft' | 'published' | 'archived';
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  color: string;
  size: string;
  price: number;
  mockupUrl?: string;
}
```

#### 2. Product Creation Form
**File:** `components/Products/ProductCreationForm.tsx`

Steps:
1. Select product type (already built)
2. Choose design from library
3. Enter product details (name, description, price)
4. Select variants (colors, sizes)
5. Generate mockups
6. Review and save

#### 3. Product API Endpoints
**File:** `app/api/products/create/route.ts`

Features:
- Create product with variants
- Save to database
- Return product object

✅ **Checkpoint:** Can create products with designs

---

### **Day 4: Product Management** (6 hours)

#### 1. ProductCard Component
**File:** `components/Products/ProductCard.tsx`

Features:
- Product image (first mockup)
- Product name & price
- Status badge
- Platform badges
- Quick actions (Edit, Delete, View)
- Sales count (if any)

#### 2. ProductGrid Component
**File:** `components/Products/ProductGrid.tsx`

Features:
- Responsive grid layout
- Filter by status
- Search products
- Sort options
- Bulk select mode

#### 3. Products Dashboard Tab
Update PodDashboard to show recent products

✅ **Checkpoint:** Product management UI complete

---

### **Day 5: Product Details & Editing** (6 hours)

#### 1. ProductDetailsDialog Component
**File:** `components/Products/ProductDetailsDialog.tsx`

Features:
- View all product info
- View all mockups
- Edit product name/description
- Manage variants
- Change status
- Delete product

#### 2. Product Update API
**File:** `app/api/products/[id]/route.ts`

Methods:
- GET - Fetch product details
- PUT - Update product
- DELETE - Delete product

#### 3. Variant Management
**File:** `components/Products/VariantManager.tsx`

Features:
- Add/remove variants
- Edit variant details
- Assign mockups to variants

✅ **Checkpoint:** Full product CRUD operations

---

### **Day 6: Enhanced Features** (6 hours)

#### 1. Batch Operations
**File:** `components/Products/BatchActions.tsx`

Features:
- Select multiple products
- Bulk status change
- Bulk delete
- Bulk export

#### 2. Product Filters
Enhanced filtering:
- By product type
- By status
- By date created
- By price range

#### 3. Product Analytics
Basic product stats:
- Total products
- By status breakdown
- By product type breakdown

✅ **Checkpoint:** Enhanced management features

---

### **Day 7: Polish & Testing** (4 hours)

#### Tasks:
- [ ] Test entire workflow end-to-end
- [ ] Add loading states everywhere
- [ ] Add error messages
- [ ] Implement optimistic UI updates
- [ ] Add confirmation dialogs for destructive actions
- [ ] Mobile responsive testing
- [ ] Performance optimization
- [ ] Documentation updates

✅ **Checkpoint:** Production-ready product system

---

## 🎨 UI Components to Build

### 1. DesignCard
```typescript
<DesignCard
  design={design}
  selected={isSelected}
  onSelect={(id, selected) => handleSelect(id, selected)}
  onClick={() => viewDesign(design)}
  onDelete={() => deleteDesign(design.id)}
/>
```

### 2. DesignUploader
```typescript
<DesignUploader
  onUploadComplete={(designs) => {
    setDesigns([...designs, ...newDesigns]);
  }}
  accept="image/*"
  maxSize={10 * 1024 * 1024} // 10MB
  multiple
/>
```

### 3. ProductCard
```typescript
<ProductCard
  product={product}
  onEdit={() => editProduct(product)}
  onDelete={() => deleteProduct(product.id)}
  onView={() => viewProduct(product)}
/>
```

### 4. ProductCreationForm
```typescript
<ProductCreationForm
  onComplete={(product) => {
    router.push(`/products/${product.id}`);
  }}
  onCancel={() => setShowForm(false)}
/>
```

---

## 📊 Database Schema (Prisma)

```prisma
model Design {
  id        String   @id @default(cuid())
  userId    String
  name      String
  imageUrl  String
  category  String
  tags      String[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  products  Product[]

  @@index([userId])
  @@index([category])
}

model Product {
  id          String   @id @default(cuid())
  userId      String
  name        String
  description String?
  productType String
  designId    String
  design      Design   @relation(fields: [designId], references: [id])
  mockupUrls  String[]
  status      ProductStatus @default(DRAFT)
  basePrice   Decimal
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  variants    ProductVariant[]
  listings    Listing[]

  @@index([userId])
  @@index([status])
  @@index([productType])
}

model ProductVariant {
  id        String   @id @default(cuid())
  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  name      String
  sku       String   @unique
  color     String?
  size      String?
  price     Decimal
  mockupUrl String?

  @@index([productId])
}

enum ProductStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}
```

---

## 🔧 API Endpoints to Create

### Designs
- `POST /api/designs/upload` - Upload design
- `GET /api/designs/list` - List user's designs
- `GET /api/designs/[id]` - Get design details
- `DELETE /api/designs/[id]` - Delete design
- `PUT /api/designs/[id]` - Update design metadata

### Products
- `POST /api/products/create` - Create product
- `GET /api/products/list` - List user's products
- `GET /api/products/[id]` - Get product details
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product
- `POST /api/products/bulk` - Bulk operations

---

## 💡 Key Features

### Design Library
- ✅ Upload designs (drag-and-drop)
- ✅ Browse designs (grid view)
- ✅ Search designs
- ✅ Filter by category
- ✅ Select designs for products
- ✅ Delete designs
- ✅ Preview designs

### Product Creation
- ✅ Multi-step wizard
- ✅ Select product type
- ✅ Choose design
- ✅ Enter details
- ✅ Configure variants
- ✅ Generate mockups
- ✅ Save draft or publish

### Product Management
- ✅ View all products
- ✅ Filter & search
- ✅ Edit products
- ✅ Delete products
- ✅ Bulk operations
- ✅ Status management

---

## 🎯 Success Metrics

By end of Week 2, you should be able to:
- ✅ Upload designs to library
- ✅ Create products with designs
- ✅ Generate mockups for products
- ✅ Manage product variants
- ✅ View all products in dashboard
- ✅ Edit existing products
- ✅ Delete products
- ✅ Perform bulk operations

---

## 🐛 Common Issues & Solutions

### Issue: Design upload fails
**Solution:** Check R2 credentials, increase max file size in API route

### Issue: Mockup generation slow
**Solution:** Show loading state, consider background job queue

### Issue: Too many products to load
**Solution:** Implement pagination (10-20 per page)

---

## 📈 Performance Tips

1. **Lazy load images** in design library
2. **Paginate products** (don't load all at once)
3. **Cache designs** in memory after fetching
4. **Optimize images** before upload (resize large images)
5. **Use optimistic updates** for better UX

---

## 🎨 Design Patterns

### Upload Flow
1. User drags file or clicks upload
2. Show preview immediately
3. Upload in background
4. Show progress bar
5. Add to library on success
6. Show toast notification

### Product Creation Flow
1. Select product type
2. Choose design from library
3. Enter product details
4. Configure variants
5. Preview mockups
6. Save or publish

### Product Management Flow
1. View products in grid
2. Filter/search products
3. Click product to view details
4. Edit inline or in dialog
5. Save changes
6. Update grid optimistically

---

## 🚀 Quick Start (Day 1)

```bash
# Create necessary directories
mkdir -p components/Designs
mkdir -p app/api/designs/upload
mkdir -p app/api/designs/list
mkdir -p lib/types
```

```typescript
// Start with design types
// lib/types/design.ts
export interface Design {
  id: string;
  userId: string;
  name: string;
  imageUrl: string;
  category: string;
  tags: string[];
  createdAt: Date;
}
```

Then build the upload API, then the UI components!

---

## 📚 Resources

- **Week 1 Components:** Reuse StatCard, gradients, theme
- **Material-UI Docs:** https://mui.com/material-ui/
- **R2 Storage:** Use existing upload functions
- **Drag & Drop:** react-dropzone library

---

## ✅ Week 2 Checklist

### Design Library
- [ ] Design upload API
- [ ] Design list API
- [ ] DesignCard component
- [ ] DesignUploader component
- [ ] DesignLibrary component
- [ ] Design search/filter

### Product Creation
- [ ] Product types defined
- [ ] Product creation API
- [ ] ProductCreationForm component
- [ ] Multi-step wizard
- [ ] Variant configuration
- [ ] Mockup generation integration

### Product Management
- [ ] ProductCard component
- [ ] ProductGrid component
- [ ] Product list API
- [ ] Product details dialog
- [ ] Product edit functionality
- [ ] Product delete functionality

### Enhanced Features
- [ ] Batch operations
- [ ] Advanced filters
- [ ] Product analytics
- [ ] Mobile responsive
- [ ] Error handling
- [ ] Loading states

---

**Ready to build an amazing design library and product system!** 🎨🚀

Let's make Week 2 even better than Week 1! 💪
