import { ProductType as ProductTypeCatalog } from '@/lib/data/productCatalog';

export interface Product {
  id: string;
  userId: string;
  name: string;
  description: string;
  productType: string; // Reference to ProductType ID
  designId: string;
  mockupUrls: string[];
  variants: ProductVariant[];
  status: ProductStatus;
  basePrice: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string; // e.g., "Black / M"
  sku: string;
  color?: string;
  size?: string;
  price: number;
  mockupUrl?: string;
}

export type ProductStatus = 'draft' | 'published' | 'archived';

export interface ProductCreateData {
  name: string;
  description?: string;
  productType: string;
  designId: string;
  basePrice: number;
  variants?: Omit<ProductVariant, 'id' | 'productId'>[];
}

export interface ProductUpdateData {
  name?: string;
  description?: string;
  basePrice?: number;
  status?: ProductStatus;
  mockupUrls?: string[];
}

export interface ProductListQuery {
  status?: ProductStatus;
  productType?: string;
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'name' | 'price';
  sortOrder?: 'asc' | 'desc';
}
