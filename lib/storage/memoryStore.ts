/**
 * In-memory storage for development
 * Replace with database (Prisma/Supabase) in production
 */

import { Design } from '@/lib/types/design';
import { Product } from '@/lib/types/product';

// Design storage
const designs: Design[] = [];

// Product storage
const products: Product[] = [];

export const designStore = {
  getAll: (userId?: string): Design[] => {
    if (userId) {
      return designs.filter((d) => d.userId === userId);
    }
    return [...designs];
  },

  getById: (id: string): Design | undefined => {
    return designs.find((d) => d.id === id);
  },

  create: (design: Design): Design => {
    designs.push(design);
    return design;
  },

  update: (id: string, updates: Partial<Design>): Design | null => {
    const index = designs.findIndex((d) => d.id === id);
    if (index === -1) return null;

    designs[index] = {
      ...designs[index],
      ...updates,
      updatedAt: new Date(),
    };
    return designs[index];
  },

  delete: (id: string): boolean => {
    const index = designs.findIndex((d) => d.id === id);
    if (index === -1) return false;

    designs.splice(index, 1);
    return true;
  },

  search: (query: string, userId?: string): Design[] => {
    let results = userId
      ? designs.filter((d) => d.userId === userId)
      : designs;

    if (query) {
      const lowerQuery = query.toLowerCase();
      results = results.filter(
        (d) =>
          d.name.toLowerCase().includes(lowerQuery) ||
          d.category.toLowerCase().includes(lowerQuery) ||
          d.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
      );
    }

    return results;
  },

  filterByCategory: (category: string, userId?: string): Design[] => {
    let results = userId
      ? designs.filter((d) => d.userId === userId)
      : designs;

    return results.filter((d) => d.category === category);
  },
};

export const productStore = {
  getAll: (userId?: string): Product[] => {
    if (userId) {
      return products.filter((p) => p.userId === userId);
    }
    return [...products];
  },

  getById: (id: string): Product | undefined => {
    return products.find((p) => p.id === id);
  },

  create: (product: Product): Product => {
    products.push(product);
    return product;
  },

  update: (id: string, updates: Partial<Product>): Product | null => {
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) return null;

    products[index] = {
      ...products[index],
      ...updates,
      updatedAt: new Date(),
    };
    return products[index];
  },

  delete: (id: string): boolean => {
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) return false;

    products.splice(index, 1);
    return true;
  },

  search: (query: string, userId?: string): Product[] => {
    let results = userId
      ? products.filter((p) => p.userId === userId)
      : products;

    if (query) {
      const lowerQuery = query.toLowerCase();
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(lowerQuery) ||
          p.description.toLowerCase().includes(lowerQuery) ||
          p.productType.toLowerCase().includes(lowerQuery)
      );
    }

    return results;
  },

  filterByStatus: (status: string, userId?: string): Product[] => {
    let results = userId
      ? products.filter((p) => p.userId === userId)
      : products;

    return results.filter((p) => p.status === status);
  },
};
