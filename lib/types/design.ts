export interface Design {
  id: string;
  userId: string;
  name: string;
  imageUrl: string;
  thumbnailUrl?: string;
  category: string;
  tags: string[];
  fileSize?: number;
  dimensions?: {
    width: number;
    height: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface DesignUploadData {
  name: string;
  image: string; // base64
  category?: string;
  tags?: string[];
}

export interface DesignListQuery {
  category?: string;
  search?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}

export type DesignCategory =
  | 'Logo'
  | 'Illustration'
  | 'Typography'
  | 'Pattern'
  | 'Photo'
  | 'Custom'
  | 'Other';

export const DESIGN_CATEGORIES: DesignCategory[] = [
  'Logo',
  'Illustration',
  'Typography',
  'Pattern',
  'Photo',
  'Custom',
  'Other',
];
