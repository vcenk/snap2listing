export interface ProductType {
  id: string;
  name: string;
  icon: string;
  basePrice: number;
  category: string;
  variants: {
    colors: string[];
    sizes: string[];
  };
  mockupTemplateCount: number;
  description?: string;
}

export const PRODUCT_CATALOG: ProductType[] = [
  {
    id: 't-shirt',
    name: 'T-Shirt',
    icon: '👕',
    basePrice: 19.99,
    category: 'Apparel',
    variants: {
      colors: ['Black', 'White', 'Navy', 'Gray', 'Red', 'Blue'],
      sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
    },
    mockupTemplateCount: 25,
    description: 'Classic crew neck t-shirt, perfect for any design',
  },
  {
    id: 'mug',
    name: 'Coffee Mug',
    icon: '☕',
    basePrice: 14.99,
    category: 'Drinkware',
    variants: {
      colors: ['White', 'Black'],
      sizes: ['11oz', '15oz'],
    },
    mockupTemplateCount: 15,
    description: 'Ceramic coffee mug with vibrant prints',
  },
  {
    id: 'hoodie',
    name: 'Hoodie',
    icon: '🧥',
    basePrice: 39.99,
    category: 'Apparel',
    variants: {
      colors: ['Black', 'Gray', 'Navy', 'White'],
      sizes: ['S', 'M', 'L', 'XL', '2XL'],
    },
    mockupTemplateCount: 18,
    description: 'Comfortable pullover hoodie with front pocket',
  },
  {
    id: 'phone-case',
    name: 'Phone Case',
    icon: '📱',
    basePrice: 24.99,
    category: 'Accessories',
    variants: {
      colors: ['Clear', 'Black', 'White'],
      sizes: ['iPhone 14', 'iPhone 15', 'Samsung Galaxy S23', 'Samsung Galaxy S24'],
    },
    mockupTemplateCount: 12,
    description: 'Durable phone case with high-quality print',
  },
  {
    id: 'tote-bag',
    name: 'Tote Bag',
    icon: '👜',
    basePrice: 18.99,
    category: 'Accessories',
    variants: {
      colors: ['Natural', 'Black'],
      sizes: ['Standard'],
    },
    mockupTemplateCount: 10,
    description: 'Eco-friendly canvas tote bag',
  },
  {
    id: 'poster',
    name: 'Poster',
    icon: '🖼️',
    basePrice: 12.99,
    category: 'Home Decor',
    variants: {
      colors: ['White'],
      sizes: ['12x18', '18x24', '24x36'],
    },
    mockupTemplateCount: 8,
    description: 'High-quality art print poster',
  },
  {
    id: 'sticker',
    name: 'Sticker',
    icon: '🏷️',
    basePrice: 3.99,
    category: 'Accessories',
    variants: {
      colors: ['Full Color'],
      sizes: ['2x2', '3x3', '4x4'],
    },
    mockupTemplateCount: 6,
    description: 'Weatherproof vinyl sticker',
  },
  {
    id: 'pillow',
    name: 'Throw Pillow',
    icon: '🛋️',
    basePrice: 22.99,
    category: 'Home Decor',
    variants: {
      colors: ['White', 'Cream'],
      sizes: ['16x16', '18x18', '20x20'],
    },
    mockupTemplateCount: 12,
    description: 'Soft decorative throw pillow',
  },
];

// Get product by ID
export function getProductById(id: string): ProductType | undefined {
  return PRODUCT_CATALOG.find((p) => p.id === id);
}

// Get products by category
export function getProductsByCategory(category: string): ProductType[] {
  return PRODUCT_CATALOG.filter((p) => p.category === category);
}

// Get all categories
export function getAllCategories(): string[] {
  return Array.from(new Set(PRODUCT_CATALOG.map((p) => p.category)));
}
