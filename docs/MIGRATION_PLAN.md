# Snap2Listing Multi-Channel Migration Plan

**Project:** Migrate from Etsy-only to Multi-Channel Export Platform
**Start Date:** 2025-10-15
**Status:** In Progress
**Author:** Claude Code Migration Team

---

## Executive Summary

This document outlines the complete migration strategy for transforming Snap2Listing from an Etsy-specific listing tool into a comprehensive multi-channel export platform. The migration involves database restructuring, UI/UX refactoring, AI optimization implementation, and export system development.

### Core Objectives
1. Remove Etsy OAuth dependencies and platform-specific constraints
2. Implement flexible base+overrides content model for multi-channel publishing
3. Build SEO Brain with keyword mining and placement optimization
4. Create platform-specific exporters (Shopify, eBay, Facebook/IG, Amazon, TikTok Shop)
5. Enable draft save/resume with exact state restoration

---

## Current Architecture Analysis

### Database Schema
**Current State:**
- `users` table with subscription management
- `shops` table for Etsy OAuth connections (TO BE REMOVED)
- `listings` table with Etsy-specific fields:
  - `etsy_listing_id`, `shop_id`, `category_id`
  - `who_made`, `when_made`, `materials[]`
  - `occasion[]`, `holiday[]`, `recipient[]`, `style[]`
  - `personalization_enabled`, `personalization_instructions`
- `usage_logs` for billing/metering

**Issues:**
- Tightly coupled to Etsy taxonomy and requirements
- No support for multiple channels per listing
- No versioning or keyword tracking
- Cannot store channel-specific overrides

### Application Flow
**Current State:**
- 5-step wizard: Upload → Details → Images → Video → Review
- All fields hardcoded for Etsy requirements
- No channel selection interface
- Basic draft saving without state restoration

**Issues:**
- Cannot adapt to different platform requirements
- No validation per-channel
- No export generation capability
- No SEO optimization or keyword management

---

## Migration Architecture

### New Database Schema

```sql
-- Core multi-channel tables

CREATE TABLE channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  config JSONB NOT NULL DEFAULT '{}',
  validation_rules JSONB NOT NULL DEFAULT '{}',
  export_format TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'draft',
  base_data JSONB NOT NULL DEFAULT '{}',
  seo_score INTEGER DEFAULT 0,
  last_step TEXT DEFAULT 'upload',
  last_channel_tab TEXT,
  scroll_position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE listing_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  override_data JSONB NOT NULL DEFAULT '{}',
  validation_state JSONB NOT NULL DEFAULT '{}',
  readiness_score INTEGER DEFAULT 0,
  is_ready BOOLEAN DEFAULT FALSE,
  exported_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(listing_id, channel_id)
);

CREATE TABLE listing_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  position INTEGER NOT NULL,
  is_main BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE listing_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  snapshot_data JSONB NOT NULL,
  seo_score INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  type TEXT NOT NULL, -- longtail, autosuggest, manual
  source TEXT,
  category TEXT, -- material, style, audience, occasion, problem, modifier
  placements JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE export_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  format TEXT NOT NULL,
  file_name TEXT NOT NULL,
  exported_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Channel Configuration Data

```sql
INSERT INTO channels (name, slug, config, validation_rules, export_format) VALUES
('Shopify', 'shopify',
  '{"fields": ["title", "body_html", "tags", "handle", "image_src", "price", "sku", "quantity"]}',
  '{"title": {"required": true}, "body": {"required": true}, "images": {"min": 1}}',
  'csv'),

('eBay', 'ebay',
  '{"fields": ["title", "price", "quantity", "condition", "images", "category"]}',
  '{"title": {"maxLength": 80, "required": true}, "price": {"required": true}, "quantity": {"required": true}}',
  'csv,xlsx'),

('Facebook/Instagram', 'facebook-ig',
  '{"fields": ["id", "title", "description", "availability", "condition", "price", "link", "image_link", "brand"]}',
  '{"title": {"required": true}, "price": {"required": true}, "image_link": {"required": true}}',
  'csv'),

('Amazon', 'amazon',
  '{"fields": ["title", "bullets", "description", "price", "images"]}',
  '{"title": {"maxLength": 200}, "bullets": {"count": 5, "minLength": 10, "maxLength": 255}}',
  'readiness'),

('Etsy', 'etsy',
  '{"fields": ["title", "tags", "description", "price", "materials", "images"]}',
  '{"title": {"maxLength": 140}, "tags": {"min": 8, "max": 13}, "images": {"min": 3}}',
  'readiness'),

('TikTok Shop', 'tiktok',
  '{"fields": ["title", "description", "price", "images", "category"]}',
  '{"title": {"required": true}, "price": {"required": true}}',
  'csv');
```

---

## Phase 0: Foundation Refactor (Week 1-2)

### Goal
Establish new database foundation and migrate existing data.

### Tasks

#### 0.1 Database Schema Creation
**File:** `supabase-multi-channel-migration.sql`

```sql
-- Drop existing Etsy-specific tables
DROP TABLE IF EXISTS shops CASCADE;

-- Create new multi-channel tables
-- (See schema above)

-- Create indexes
CREATE INDEX idx_listings_user_id ON listings(user_id);
CREATE INDEX idx_listing_channels_listing_id ON listing_channels(listing_id);
CREATE INDEX idx_listing_channels_channel_id ON listing_channels(channel_id);
CREATE INDEX idx_keywords_listing_id ON keywords(listing_id);
CREATE INDEX idx_keywords_type ON keywords(type);

-- Add RLS policies
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_channels ENABLE ROW LEVEL SECURITY;
-- (Continue with all policies)
```

#### 0.2 Data Migration Script
**File:** `supabase-data-migration.sql`

```sql
-- Migrate existing listings to new schema
INSERT INTO listings (id, user_id, status, base_data, created_at, updated_at)
SELECT
  id,
  user_id,
  status,
  jsonb_build_object(
    'title', title,
    'description', description,
    'tags', tags,
    'price', price,
    'category', category,
    'quantity', quantity,
    'materials', materials,
    'who_made', who_made,
    'when_made', when_made
  ) as base_data,
  created_at,
  updated_at
FROM old_listings;

-- Migrate images to listing_images table
INSERT INTO listing_images (listing_id, url, position, is_main)
SELECT
  id as listing_id,
  jsonb_array_elements_text(images) as url,
  row_number() OVER (PARTITION BY id ORDER BY position) - 1 as position,
  row_number() OVER (PARTITION BY id ORDER BY position) = 1 as is_main
FROM old_listings
WHERE jsonb_array_length(images) > 0;

-- Create Etsy channel entry for migrated listings
INSERT INTO listing_channels (listing_id, channel_id, is_ready)
SELECT
  ol.id,
  c.id,
  (ol.status = 'published') as is_ready
FROM old_listings ol
CROSS JOIN channels c
WHERE c.slug = 'etsy';
```

#### 0.3 Seed Channel Data
Run channel INSERT statements (see Channel Configuration Data above)

#### 0.4 Clean Up Legacy Tables
```sql
-- Remove Etsy-specific columns from users if any
ALTER TABLE users DROP COLUMN IF EXISTS etsy_shop_id;

-- Archive old listings table
ALTER TABLE listings RENAME TO listings_old_backup;

-- Verify migration
SELECT
  l.id,
  l.base_data->>'title' as title,
  COUNT(DISTINCT lc.channel_id) as channel_count,
  COUNT(li.id) as image_count
FROM listings l
LEFT JOIN listing_channels lc ON l.id = lc.listing_id
LEFT JOIN listing_images li ON l.id = li.listing_id
GROUP BY l.id
LIMIT 10;
```

### Deliverables
- [ ] New database schema deployed
- [ ] Channel configuration seeded
- [ ] Existing data migrated
- [ ] Legacy tables archived
- [ ] Migration verification report

---

## Phase 1: Core Feature Migration (Week 2-3)

### Goal
Refactor wizard to support multi-channel with base+overrides model.

### Tasks

#### 1.1 Type Definitions
**File:** `lib/types/channels.ts`

```typescript
export interface Channel {
  id: string;
  name: string;
  slug: string;
  config: ChannelConfig;
  validationRules: ValidationRules;
  exportFormat: string;
}

export interface ChannelConfig {
  fields: string[];
  requiredFields?: string[];
  maxLengths?: Record<string, number>;
  customRules?: Record<string, any>;
}

export interface ValidationRules {
  title?: {
    required?: boolean;
    maxLength?: number;
    minLength?: number;
  };
  description?: {
    required?: boolean;
    maxLength?: number;
    minLength?: number;
  };
  tags?: {
    min?: number;
    max?: number;
  };
  images?: {
    min?: number;
    max?: number;
  };
  bullets?: {
    count?: number;
    minLength?: number;
    maxLength?: number;
  };
}

export interface ListingBase {
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  video?: string;
}

export interface ChannelOverride {
  channelId: string;
  channelSlug: string;
  title?: string;
  description?: string;
  tags?: string[];
  bullets?: string[];
  customFields?: Record<string, any>;
}

export interface ListingData {
  id?: string;
  userId: string;
  status: 'draft' | 'optimized' | 'completed';
  base: ListingBase;
  channels: ChannelOverride[];
  seoScore: number;
  keywords: Keyword[];
}

export interface Keyword {
  id?: string;
  keyword: string;
  type: 'longtail' | 'autosuggest' | 'manual';
  source?: string;
  category?: string;
  placements: string[];
}
```

#### 1.2 ChannelSelector Component
**File:** `components/CreateListing/ChannelSelector.tsx`

```typescript
'use client';

import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Typography,
  Checkbox,
  Stack,
  Alert,
} from '@mui/material';
import { Channel } from '@/lib/types/channels';

interface ChannelSelectorProps {
  onSelectionChange: (channels: string[]) => void;
  selectedChannels: string[];
}

export default function ChannelSelector({
  onSelectionChange,
  selectedChannels,
}: ChannelSelectorProps) {
  const [channels, setChannels] = useState<Channel[]>([]);

  // Load channels from API
  useEffect(() => {
    fetch('/api/channels')
      .then(r => r.json())
      .then(data => setChannels(data.channels));
  }, []);

  const handleToggle = (channelId: string) => {
    const updated = selectedChannels.includes(channelId)
      ? selectedChannels.filter(id => id !== channelId)
      : [...selectedChannels, channelId];
    onSelectionChange(updated);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select Export Channels
      </Typography>
      <Alert severity="info" sx={{ mb: 3 }}>
        Choose one or more platforms where you want to list this product.
      </Alert>
      <Grid container spacing={2}>
        {channels.map(channel => (
          <Grid item xs={12} sm={6} md={4} key={channel.id}>
            <Card
              sx={{
                cursor: 'pointer',
                border: selectedChannels.includes(channel.id)
                  ? '2px solid'
                  : '1px solid',
                borderColor: selectedChannels.includes(channel.id)
                  ? 'primary.main'
                  : 'divider',
              }}
              onClick={() => handleToggle(channel.id)}
            >
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Checkbox
                    checked={selectedChannels.includes(channel.id)}
                    onChange={() => handleToggle(channel.id)}
                  />
                  <Box>
                    <Typography variant="h6">{channel.name}</Typography>
                    <Chip
                      label={channel.exportFormat.toUpperCase()}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
```

#### 1.3 BaseOverridesEditor Component
**File:** `components/CreateListing/BaseOverridesEditor.tsx`

```typescript
'use client';

import { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  TextField,
  Typography,
  Paper,
  Chip,
  Stack,
  Alert,
} from '@mui/material';
import { ListingBase, ChannelOverride, Channel } from '@/lib/types/channels';

interface BaseOverridesEditorProps {
  baseData: ListingBase;
  channels: Channel[];
  overrides: ChannelOverride[];
  onBaseChange: (base: ListingBase) => void;
  onOverrideChange: (channelId: string, override: Partial<ChannelOverride>) => void;
}

export default function BaseOverridesEditor({
  baseData,
  channels,
  overrides,
  onBaseChange,
  onOverrideChange,
}: BaseOverridesEditorProps) {
  const [activeTab, setActiveTab] = useState(0);

  const isBaseTab = activeTab === 0;
  const activeChannel = isBaseTab ? null : channels[activeTab - 1];

  return (
    <Box>
      <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
        <Tab label="Base Content" />
        {channels.map(channel => (
          <Tab key={channel.id} label={channel.name} />
        ))}
      </Tabs>

      <Paper sx={{ p: 3, mt: 2 }}>
        {isBaseTab ? (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              Base content is shared across all channels. Override specific fields per channel.
            </Alert>
            <TextField
              label="Title"
              fullWidth
              value={baseData.title}
              onChange={(e) => onBaseChange({ ...baseData, title: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={6}
              value={baseData.description}
              onChange={(e) => onBaseChange({ ...baseData, description: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Price"
              type="number"
              value={baseData.price}
              onChange={(e) => onBaseChange({ ...baseData, price: parseFloat(e.target.value) })}
            />
          </Box>
        ) : (
          <Box>
            <Alert severity="warning" sx={{ mb: 3 }}>
              Overrides for {activeChannel?.name}. Leave blank to use base content.
            </Alert>
            <TextField
              label={`Title Override (max ${activeChannel?.validationRules.title?.maxLength || 'unlimited'})`}
              fullWidth
              value={overrides.find(o => o.channelId === activeChannel?.id)?.title || ''}
              onChange={(e) => onOverrideChange(activeChannel!.id, { title: e.target.value })}
              placeholder={baseData.title}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Description Override"
              fullWidth
              multiline
              rows={6}
              value={overrides.find(o => o.channelId === activeChannel?.id)?.description || ''}
              onChange={(e) => onOverrideChange(activeChannel!.id, { description: e.target.value })}
              placeholder={baseData.description}
            />
          </Box>
        )}
      </Paper>
    </Box>
  );
}
```

#### 1.4 ChannelValidators
**File:** `lib/validators/channel-validators.ts`

```typescript
import { Channel, ListingBase, ChannelOverride, ValidationResult } from '@/lib/types/channels';

export class ChannelValidator {
  constructor(private channel: Channel) {}

  validate(base: ListingBase, override?: ChannelOverride): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Get effective values (override takes precedence)
    const title = override?.title || base.title;
    const description = override?.description || base.description;

    // Title validation
    const titleRules = this.channel.validationRules.title;
    if (titleRules?.required && !title) {
      errors.push('Title is required');
    }
    if (titleRules?.maxLength && title.length > titleRules.maxLength) {
      errors.push(`Title exceeds max length of ${titleRules.maxLength}`);
    }
    if (titleRules?.minLength && title.length < titleRules.minLength) {
      warnings.push(`Title should be at least ${titleRules.minLength} characters`);
    }

    // Description validation
    const descRules = this.channel.validationRules.description;
    if (descRules?.required && !description) {
      errors.push('Description is required');
    }
    if (descRules?.maxLength && description.length > descRules.maxLength) {
      errors.push(`Description exceeds max length of ${descRules.maxLength}`);
    }

    // Image validation
    const imageRules = this.channel.validationRules.images;
    if (imageRules?.min && base.images.length < imageRules.min) {
      errors.push(`At least ${imageRules.min} images required`);
    }
    if (imageRules?.max && base.images.length > imageRules.max) {
      warnings.push(`Maximum ${imageRules.max} images recommended`);
    }

    // Tags validation (if in override)
    const tagRules = this.channel.validationRules.tags;
    if (override?.tags) {
      if (tagRules?.min && override.tags.length < tagRules.min) {
        errors.push(`At least ${tagRules.min} tags required for ${this.channel.name}`);
      }
      if (tagRules?.max && override.tags.length > tagRules.max) {
        errors.push(`Maximum ${tagRules.max} tags allowed for ${this.channel.name}`);
      }
    }

    const isReady = errors.length === 0;
    const score = this.calculateReadinessScore(base, override, errors, warnings);

    return {
      isReady,
      errors,
      warnings,
      score,
      channelId: this.channel.id,
      channelName: this.channel.name,
    };
  }

  private calculateReadinessScore(
    base: ListingBase,
    override: ChannelOverride | undefined,
    errors: string[],
    warnings: string[]
  ): number {
    let score = 100;
    score -= errors.length * 20;
    score -= warnings.length * 10;

    // Bonus for overrides (shows optimization)
    if (override?.title && override.title !== base.title) score += 5;
    if (override?.description && override.description !== base.description) score += 5;
    if (override?.tags && override.tags.length > 0) score += 10;

    return Math.max(0, Math.min(100, score));
  }
}

export function validateAllChannels(
  channels: Channel[],
  base: ListingBase,
  overrides: ChannelOverride[]
): Record<string, ValidationResult> {
  const results: Record<string, ValidationResult> = {};

  for (const channel of channels) {
    const validator = new ChannelValidator(channel);
    const override = overrides.find(o => o.channelId === channel.id);
    results[channel.id] = validator.validate(base, override);
  }

  return results;
}
```

#### 1.5 Refactor ListingWizard
**File:** `components/CreateListing/ListingWizard.tsx` (Updated)

Key changes:
- Add ChannelSelector step between Details and Images
- Replace Etsy-specific fields with BaseOverridesEditor
- Add validation per channel
- Update save logic to new schema

### Deliverables
- [ ] Channel types defined
- [ ] ChannelSelector component created
- [ ] BaseOverridesEditor component created
- [ ] ChannelValidators implemented
- [ ] ListingWizard refactored
- [ ] `/api/channels` endpoint created

---

## Phase 2: SEO Brain Implementation (Week 3-4)

### Goal
Build AI-powered SEO optimization with keyword mining and placement.

### Tasks

#### 2.1 SEO Brain Core
**File:** `lib/seo/seo-brain.ts`

```typescript
import OpenAI from 'openai';

export interface SEOBrainConfig {
  model: 'gpt-4' | 'gpt-4-turbo';
  passes: {
    draft: {
      temperature: number;
      maxTokens: number;
    };
    optimize: {
      temperature: number;
      maxTokens: number;
    };
  };
}

export interface SEOResponse {
  base: {
    title: string;
    description: string;
    bullets?: string[];
  };
  channels: Record<string, {
    title?: string;
    tags?: string[];
    bullets?: string[];
    overrides?: any;
  }>;
  seo: {
    score: number;
    issues: string[];
    fixes: string[];
  };
  keywords: {
    primary: string[];
    longtail: string[];
    placements: Record<string, string[]>;
  };
}

export class SEOBrain {
  private openai: OpenAI;
  private config: SEOBrainConfig;

  constructor(apiKey: string, config: SEOBrainConfig) {
    this.openai = new OpenAI({ apiKey });
    this.config = config;
  }

  async generateDraft(
    productImage: string,
    shortDescription: string,
    category: string,
    channels: string[]
  ): Promise<SEOResponse> {
    const prompt = `
You are an expert e-commerce SEO copywriter. Analyze this product and create optimized content.

Product Details:
- Image: ${productImage}
- Description: ${shortDescription}
- Category: ${category}
- Target Channels: ${channels.join(', ')}

Generate:
1. Base title (50-60 chars, keyword-rich)
2. Base description (150-200 words, benefits-focused)
3. 5 bullet points highlighting key features
4. Channel-specific variations for: ${channels.join(', ')}
5. Primary keywords and long-tail variations
6. SEO score analysis

Return JSON format matching SEOResponse interface.
    `.trim();

    const response = await this.openai.chat.completions.create({
      model: this.config.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: this.config.passes.draft.temperature,
      max_tokens: this.config.passes.draft.maxTokens,
      response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0].message.content!);
  }

  async optimize(
    currentContent: any,
    keywords: string[],
    channels: string[]
  ): Promise<SEOResponse> {
    const prompt = `
You are an expert SEO optimizer. Improve this content for maximum visibility.

Current Content: ${JSON.stringify(currentContent)}
Target Keywords: ${keywords.join(', ')}
Channels: ${channels.join(', ')}

Optimize:
1. Keyword density and placement
2. Readability and flow
3. Channel-specific compliance (title lengths, tag counts, etc.)
4. SEO score (target 85+)

Return improved content in JSON format matching SEOResponse interface.
    `.trim();

    const response = await this.openai.chat.completions.create({
      model: this.config.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: this.config.passes.optimize.temperature,
      max_tokens: this.config.passes.optimize.maxTokens,
      response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0].message.content!);
  }
}
```

#### 2.2 Keyword Mining Engine
**File:** `lib/seo/keyword-engine.ts`

```typescript
import OpenAI from 'openai';

export interface GroupedKeywords {
  material: string[];
  style: string[];
  audience: string[];
  occasion: string[];
  problem: string[];
  modifier: string[];
}

export class KeywordEngine {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  async mineLongTails(
    productTitle: string,
    productDescription: string,
    category: string
  ): Promise<GroupedKeywords> {
    const prompt = `
Generate long-tail keywords for this product:
- Title: ${productTitle}
- Description: ${productDescription}
- Category: ${category}

Group keywords by:
1. material (e.g., "leather", "cotton", "wood")
2. style (e.g., "vintage", "modern", "minimalist")
3. audience (e.g., "women", "kids", "professional")
4. occasion (e.g., "wedding", "birthday", "office")
5. problem (e.g., "storage solution", "gift idea")
6. modifier (e.g., "handmade", "eco-friendly", "luxury")

Return 5-10 keywords per category in JSON format.
    `.trim();

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0].message.content!);
  }

  async fuseAutosuggests(
    baseKeyword: string,
    sources: string[]
  ): Promise<string[]> {
    // Simulate autosuggest from multiple sources
    // In production, integrate with Google Autocomplete API, Etsy API, etc.

    const prompt = `
Generate search autosuggestions for "${baseKeyword}" as if from:
${sources.join(', ')}

Return 20 unique suggestions in JSON array format.
    `.trim();

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0].message.content!);
    return result.suggestions || [];
  }

  async mapPlacements(
    keywords: string[],
    content: {
      title: string;
      description: string;
      bullets?: string[];
    }
  ): Promise<Record<string, string[]>> {
    const placements: Record<string, string[]> = {};

    for (const keyword of keywords) {
      const keywordPlacements: string[] = [];

      if (content.title.toLowerCase().includes(keyword.toLowerCase())) {
        keywordPlacements.push('title');
      }
      if (content.description.toLowerCase().includes(keyword.toLowerCase())) {
        keywordPlacements.push('description');
      }
      if (content.bullets?.some(b => b.toLowerCase().includes(keyword.toLowerCase()))) {
        keywordPlacements.push('bullets');
      }

      placements[keyword] = keywordPlacements;
    }

    return placements;
  }
}
```

#### 2.3 Keyword Panel Component
**File:** `components/CreateListing/KeywordPanel.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Stack,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { GroupedKeywords } from '@/lib/seo/keyword-engine';

interface KeywordPanelProps {
  listingId: string;
  onKeywordClick: (keyword: string) => void;
}

export default function KeywordPanel({ listingId, onKeywordClick }: KeywordPanelProps) {
  const [keywords, setKeywords] = useState<GroupedKeywords | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/seo/keywords/${listingId}`)
      .then(r => r.json())
      .then(data => {
        setKeywords(data.keywords);
        setLoading(false);
      });
  }, [listingId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Keyword Library
      </Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom>
        Click any keyword to insert into your content
      </Typography>

      {keywords && Object.entries(keywords).map(([category, words]) => (
        <Accordion key={category} defaultExpanded={category === 'material'}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight={600} textTransform="capitalize">
              {category} ({words.length})
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {words.map(keyword => (
                <Chip
                  key={keyword}
                  label={keyword}
                  onClick={() => onKeywordClick(keyword)}
                  clickable
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Stack>
          </AccordionDetails>
        </Accordion>
      ))}
    </Paper>
  );
}
```

#### 2.4 API Routes
**File:** `app/api/seo/draft/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { SEOBrain } from '@/lib/seo/seo-brain';

export async function POST(req: NextRequest) {
  try {
    const { productImage, shortDescription, category, channels } = await req.json();

    const seoBrain = new SEOBrain(process.env.OPENAI_API_KEY!, {
      model: 'gpt-4-turbo',
      passes: {
        draft: { temperature: 0.7, maxTokens: 1500 },
        optimize: { temperature: 0.3, maxTokens: 2000 },
      },
    });

    const result = await seoBrain.generateDraft(
      productImage,
      shortDescription,
      category,
      channels
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('SEO draft error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate draft' },
      { status: 500 }
    );
  }
}
```

### Deliverables
- [ ] SEO Brain core implemented
- [ ] Keyword mining engine created
- [ ] Keyword panel component built
- [ ] `/api/seo/draft` endpoint created
- [ ] `/api/seo/optimize` endpoint created
- [ ] `/api/seo/keywords` endpoint created

---

## Phase 3: Export System (Week 4)

### Goal
Create platform-specific exporters with validation and preflight checks.

### Tasks

#### 3.1 Base Exporter
**File:** `lib/exporters/base-exporter.ts`

```typescript
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface PreflightCheck {
  name: string;
  description: string;
  status: 'pass' | 'fail' | 'warning';
  message?: string;
}

export interface ExportFile {
  fileName: string;
  contentType: string;
  content: string | Buffer;
  encoding?: string;
}

export abstract class BaseExporter {
  abstract validate(listing: any, channel: any): ValidationResult;
  abstract generate(listing: any, channel: any): Promise<ExportFile>;
  abstract getPreflightChecks(listing: any, channel: any): PreflightCheck[];

  protected formatCSV(headers: string[], rows: any[][]): string {
    const lines = [headers.join(',')];
    for (const row of rows) {
      const escaped = row.map(cell => {
        const str = String(cell || '');
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? `"${str.replace(/"/g, '""')}"`
          : str;
      });
      lines.push(escaped.join(','));
    }
    return lines.join('\n');
  }
}
```

#### 3.2 Shopify Exporter
**File:** `lib/exporters/shopify-exporter.ts`

```typescript
import { BaseExporter, ValidationResult, ExportFile, PreflightCheck } from './base-exporter';

export class ShopifyExporter extends BaseExporter {
  validate(listing: any, channel: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!listing.base.title) errors.push('Title is required');
    if (!listing.base.description) errors.push('Description is required');
    if (!listing.base.price) errors.push('Price is required');
    if (listing.images.length === 0) warnings.push('At least one image recommended');

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  async generate(listing: any, channel: any): Promise<ExportFile> {
    const override = listing.channels.find((c: any) => c.channelId === channel.id);

    const title = override?.title || listing.base.title;
    const description = override?.description || listing.base.description;
    const tags = override?.tags?.join(', ') || '';
    const handle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const headers = [
      'Handle',
      'Title',
      'Body (HTML)',
      'Tags',
      'Image Src',
      'Image Position',
      'Variant Price',
      'Variant SKU',
      'Variant Inventory Qty',
    ];

    const rows: any[][] = [];

    listing.images.forEach((img: any, index: number) => {
      rows.push([
        index === 0 ? handle : '', // Only first row has handle
        index === 0 ? title : '',
        index === 0 ? `<p>${description}</p>` : '',
        index === 0 ? tags : '',
        img.url,
        index + 1,
        index === 0 ? listing.base.price : '',
        index === 0 ? listing.base.sku || '' : '',
        index === 0 ? '999' : '',
      ]);
    });

    const csvContent = this.formatCSV(headers, rows);

    return {
      fileName: `shopify-${handle}-${Date.now()}.csv`,
      contentType: 'text/csv',
      content: csvContent,
      encoding: 'utf-8',
    };
  }

  getPreflightChecks(listing: any, channel: any): PreflightCheck[] {
    return [
      {
        name: 'Title Length',
        description: 'Title should be descriptive but concise',
        status: listing.base.title.length < 70 ? 'pass' : 'warning',
        message: listing.base.title.length >= 70
          ? `Title is ${listing.base.title.length} characters (recommended: < 70)`
          : undefined,
      },
      {
        name: 'Images',
        description: 'At least 3 images recommended',
        status: listing.images.length >= 3 ? 'pass' : 'warning',
        message: listing.images.length < 3
          ? `Only ${listing.images.length} images (recommended: 3+)`
          : undefined,
      },
      {
        name: 'Description Length',
        description: 'Description should be detailed',
        status: listing.base.description.length > 200 ? 'pass' : 'warning',
        message: listing.base.description.length <= 200
          ? 'Description is short (recommended: 200+ characters)'
          : undefined,
      },
    ];
  }
}
```

#### 3.3 eBay Exporter
**File:** `lib/exporters/ebay-exporter.ts`

Similar structure, with eBay-specific CSV format:
- Title max 80 chars
- Condition field required
- Category field required
- Shipping details

#### 3.4 Facebook/Instagram Exporter
**File:** `lib/exporters/facebook-exporter.ts`

Similar structure, with Facebook Catalog format:
- Product ID
- Title, description, availability
- Image link, additional_image_link
- Price, brand, condition

#### 3.5 Amazon Readiness Checker
**File:** `lib/exporters/amazon-checker.ts`

```typescript
import { BaseExporter, ValidationResult, ExportFile, PreflightCheck } from './base-exporter';

export class AmazonChecker extends BaseExporter {
  validate(listing: any, channel: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const override = listing.channels.find((c: any) => c.channelId === channel.id);
    const title = override?.title || listing.base.title;
    const bullets = override?.bullets || [];

    if (title.length > 200) errors.push('Amazon title max 200 characters');
    if (bullets.length < 5) errors.push('Amazon requires 5 bullet points');

    bullets.forEach((bullet: string, index: number) => {
      if (bullet.length > 255) {
        errors.push(`Bullet ${index + 1} exceeds 255 characters`);
      }
      if (bullet.length < 10) {
        warnings.push(`Bullet ${index + 1} is too short (min 10 chars recommended)`);
      }
    });

    if (listing.images.length < 5) warnings.push('Amazon recommends 5+ images');

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  async generate(listing: any, channel: any): Promise<ExportFile> {
    // Amazon doesn't use CSV upload, so generate a readiness report
    const validation = this.validate(listing, channel);
    const preflights = this.getPreflightChecks(listing, channel);

    const report = `
Amazon Listing Readiness Report
================================
Generated: ${new Date().toISOString()}

Validation Status: ${validation.isValid ? 'READY' : 'NOT READY'}

${validation.errors.length > 0 ? `\nERRORS:\n${validation.errors.map(e => `- ${e}`).join('\n')}` : ''}
${validation.warnings.length > 0 ? `\nWARNINGS:\n${validation.warnings.map(w => `- ${w}`).join('\n')}` : ''}

PREFLIGHT CHECKS:
${preflights.map(p => `[${p.status.toUpperCase()}] ${p.name}: ${p.message || p.description}`).join('\n')}

LISTING DETAILS:
Title: ${listing.base.title}
Bullets: ${listing.channels.find((c: any) => c.channelId === channel.id)?.bullets?.join('\n') || 'None'}
Images: ${listing.images.length}
Price: $${listing.base.price}
    `.trim();

    return {
      fileName: `amazon-readiness-${Date.now()}.txt`,
      contentType: 'text/plain',
      content: report,
      encoding: 'utf-8',
    };
  }

  getPreflightChecks(listing: any, channel: any): PreflightCheck[] {
    const override = listing.channels.find((c: any) => c.channelId === channel.id);
    const bullets = override?.bullets || [];

    return [
      {
        name: 'Title Length',
        description: 'Amazon titles max 200 characters',
        status: listing.base.title.length <= 200 ? 'pass' : 'fail',
      },
      {
        name: 'Bullet Points',
        description: 'Amazon requires 5 bullet points',
        status: bullets.length >= 5 ? 'pass' : 'fail',
      },
      {
        name: 'Image Count',
        description: 'Amazon recommends 5+ images',
        status: listing.images.length >= 5 ? 'pass' : 'warning',
      },
      {
        name: 'Bullet Length',
        description: 'Each bullet should be 10-255 characters',
        status: bullets.every((b: string) => b.length >= 10 && b.length <= 255)
          ? 'pass'
          : 'fail',
      },
    ];
  }
}
```

#### 3.6 Export API
**File:** `app/api/export/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { ShopifyExporter } from '@/lib/exporters/shopify-exporter';
import { EbayExporter } from '@/lib/exporters/ebay-exporter';
import { FacebookExporter } from '@/lib/exporters/facebook-exporter';
import { AmazonChecker } from '@/lib/exporters/amazon-checker';
import { supabase } from '@/lib/supabase/client';

export async function POST(req: NextRequest) {
  try {
    const { listingId, channelId } = await req.json();

    // Fetch listing data
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('*, listing_channels(*), listing_images(*)')
      .eq('id', listingId)
      .single();

    if (listingError) throw listingError;

    // Fetch channel data
    const { data: channel, error: channelError } = await supabase
      .from('channels')
      .select('*')
      .eq('id', channelId)
      .single();

    if (channelError) throw channelError;

    // Select exporter
    let exporter;
    switch (channel.slug) {
      case 'shopify':
        exporter = new ShopifyExporter();
        break;
      case 'ebay':
        exporter = new EbayExporter();
        break;
      case 'facebook-ig':
        exporter = new FacebookExporter();
        break;
      case 'amazon':
        exporter = new AmazonChecker();
        break;
      default:
        throw new Error(`Unsupported channel: ${channel.slug}`);
    }

    // Validate
    const validation = exporter.validate(listing, channel);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      );
    }

    // Generate export
    const exportFile = await exporter.generate(listing, channel);

    // Log export
    await supabase.from('export_logs').insert({
      listing_id: listingId,
      channel_id: channelId,
      format: channel.export_format,
      file_name: exportFile.fileName,
    });

    return NextResponse.json({
      success: true,
      file: {
        name: exportFile.fileName,
        content: exportFile.content.toString('base64'),
        contentType: exportFile.contentType,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { success: false, error: 'Export failed' },
      { status: 500 }
    );
  }
}
```

### Deliverables
- [ ] Base exporter class created
- [ ] Shopify CSV exporter implemented
- [ ] eBay CSV exporter implemented
- [ ] Facebook/IG CSV exporter implemented
- [ ] Amazon readiness checker implemented
- [ ] TikTok Shop CSV exporter implemented
- [ ] `/api/export` endpoint created
- [ ] Preflight validation system added

---

## Phase 4: State Management & Resume (Week 5)

### Goal
Implement robust draft save/resume with exact state restoration.

### Tasks

#### 4.1 Wizard State Manager
**File:** `lib/state/wizard-state-manager.ts`

```typescript
import { supabase } from '@/lib/supabase/client';

export interface WizardState {
  listingId?: string;
  lastStep: string;
  activeChannelTab: string;
  scrollAnchor: number;
  timestamps: Record<string, Date>;
  data: {
    base: any;
    channels: any[];
    images: any[];
    seo: any;
    validators: any;
  };
}

export class WizardStateManager {
  async save(userId: string, state: WizardState): Promise<string> {
    const { data, error } = await supabase
      .from('listings')
      .upsert({
        id: state.listingId,
        user_id: userId,
        status: 'draft',
        base_data: state.data.base,
        last_step: state.lastStep,
        last_channel_tab: state.activeChannelTab,
        scroll_position: state.scrollAnchor,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    const listingId = data.id;

    // Save images
    if (state.data.images.length > 0) {
      await supabase.from('listing_images').delete().eq('listing_id', listingId);
      await supabase.from('listing_images').insert(
        state.data.images.map((img, index) => ({
          listing_id: listingId,
          url: img.url,
          position: index,
          is_main: index === 0,
        }))
      );
    }

    // Save channel overrides
    if (state.data.channels.length > 0) {
      for (const channelData of state.data.channels) {
        await supabase.from('listing_channels').upsert({
          listing_id: listingId,
          channel_id: channelData.channelId,
          override_data: channelData,
          validation_state: state.data.validators[channelData.channelId] || {},
        });
      }
    }

    return listingId;
  }

  async resume(listingId: string): Promise<WizardState | null> {
    const { data: listing, error } = await supabase
      .from('listings')
      .select(`
        *,
        listing_images(*),
        listing_channels(*)
      `)
      .eq('id', listingId)
      .single();

    if (error || !listing) return null;

    return {
      listingId: listing.id,
      lastStep: listing.last_step || 'upload',
      activeChannelTab: listing.last_channel_tab || 'base',
      scrollAnchor: listing.scroll_position || 0,
      timestamps: {
        created: listing.created_at,
        updated: listing.updated_at,
      },
      data: {
        base: listing.base_data,
        channels: listing.listing_channels.map((lc: any) => lc.override_data),
        images: listing.listing_images.map((img: any) => ({
          url: img.url,
          position: img.position,
          isMain: img.is_main,
        })),
        seo: listing.base_data.seo || {},
        validators: listing.listing_channels.reduce((acc: any, lc: any) => {
          acc[lc.channel_id] = lc.validation_state;
          return acc;
        }, {}),
      },
    };
  }

  async createSnapshot(listingId: string): Promise<void> {
    const { data: listing } = await supabase
      .from('listings')
      .select('*, listing_channels(*), listing_images(*)')
      .eq('id', listingId)
      .single();

    if (!listing) return;

    const { data: versions } = await supabase
      .from('listing_versions')
      .select('version_number')
      .eq('listing_id', listingId)
      .order('version_number', { ascending: false })
      .limit(1);

    const nextVersion = (versions?.[0]?.version_number || 0) + 1;

    await supabase.from('listing_versions').insert({
      listing_id: listingId,
      version_number: nextVersion,
      snapshot_data: {
        base: listing.base_data,
        channels: listing.listing_channels,
        images: listing.listing_images,
      },
      seo_score: listing.seo_score,
    });
  }
}
```

#### 4.2 Update ListingWizard with State Restoration
**File:** `components/CreateListing/ListingWizard.tsx`

Add to component:
```typescript
const [resumeListingId, setResumeListingId] = useState<string | null>(null);
const stateManager = new WizardStateManager();

useEffect(() => {
  // Check URL params for resume
  const params = new URLSearchParams(window.location.search);
  const resumeId = params.get('resume');

  if (resumeId) {
    stateManager.resume(resumeId).then(state => {
      if (state) {
        // Restore exact state
        setActiveStep(parseInt(state.lastStep));
        setDraft(state.data);
        setResumeListingId(resumeId);

        // Restore scroll position
        setTimeout(() => {
          window.scrollTo({ top: state.scrollAnchor, behavior: 'smooth' });
        }, 100);
      }
    });
  }
}, []);

const handleSaveDraft = async () => {
  const state: WizardState = {
    listingId: resumeListingId || undefined,
    lastStep: activeStep.toString(),
    activeChannelTab: currentChannelTab,
    scrollAnchor: window.scrollY,
    timestamps: {},
    data: {
      base: draft,
      channels: channelOverrides,
      images: draft.images || [],
      seo: draft.seo || {},
      validators: validationResults,
    },
  };

  const listingId = await stateManager.save(userId, state);
  setResumeListingId(listingId);

  toast.success('Draft saved successfully!');
};
```

### Deliverables
- [ ] WizardStateManager class created
- [ ] State save implementation added
- [ ] State resume implementation added
- [ ] Scroll position restoration working
- [ ] Version snapshot system created

---

## Phase 5: Testing & Polish (Week 5-6)

### Goal
Ensure system reliability and user-friendly experience.

### Tasks

#### 5.1 Validator Tests
**File:** `tests/validators.test.ts`

```typescript
import { ChannelValidator } from '@/lib/validators/channel-validators';
import { Channel, ListingBase, ChannelOverride } from '@/lib/types/channels';

describe('ChannelValidator', () => {
  const shopifyChannel: Channel = {
    id: '1',
    name: 'Shopify',
    slug: 'shopify',
    config: { fields: [] },
    validationRules: {
      title: { required: true, maxLength: 70 },
      images: { min: 1 },
    },
    exportFormat: 'csv',
  };

  const baseData: ListingBase = {
    title: 'Test Product',
    description: 'Test description',
    price: 29.99,
    category: 'test',
    images: ['image1.jpg'],
  };

  test('validates title requirement', () => {
    const validator = new ChannelValidator(shopifyChannel);
    const result = validator.validate({ ...baseData, title: '' });

    expect(result.isReady).toBe(false);
    expect(result.errors).toContain('Title is required');
  });

  test('validates title max length', () => {
    const validator = new ChannelValidator(shopifyChannel);
    const longTitle = 'a'.repeat(80);
    const result = validator.validate({ ...baseData, title: longTitle });

    expect(result.isReady).toBe(false);
    expect(result.errors[0]).toContain('max length');
  });

  test('validates minimum images', () => {
    const validator = new ChannelValidator(shopifyChannel);
    const result = validator.validate({ ...baseData, images: [] });

    expect(result.isReady).toBe(false);
    expect(result.errors[0]).toContain('images required');
  });
});
```

#### 5.2 Exporter Tests
**File:** `tests/exporters.test.ts`

```typescript
import { ShopifyExporter } from '@/lib/exporters/shopify-exporter';

describe('ShopifyExporter', () => {
  const exporter = new ShopifyExporter();

  const mockListing = {
    base: {
      title: 'Test Product',
      description: 'Test description',
      price: 29.99,
    },
    images: [
      { url: 'https://example.com/image1.jpg' },
      { url: 'https://example.com/image2.jpg' },
    ],
    channels: [],
  };

  test('generates valid CSV', async () => {
    const result = await exporter.generate(mockListing, {});

    expect(result.contentType).toBe('text/csv');
    expect(result.content).toContain('Handle,Title,Body (HTML)');
    expect(result.content).toContain('Test Product');
  });

  test('validates required fields', () => {
    const invalid = { ...mockListing, base: { ...mockListing.base, title: '' } };
    const result = exporter.validate(invalid, {});

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Title is required');
  });
});
```

#### 5.3 API Route Updates
Update all API routes to use new schema:
- `/api/listings` - CRUD for new listings table
- `/api/listings/[id]` - Single listing operations
- `/api/channels` - Fetch available channels
- `/api/seo/*` - SEO Brain endpoints
- `/api/export` - Export generation

#### 5.4 Help Documentation
**File:** `docs/USER_GUIDE.md`

Create comprehensive user guide covering:
- Multi-channel workflow
- Base vs. override content strategy
- Keyword optimization tips
- Export formats for each platform
- Troubleshooting common validation errors

### Deliverables
- [ ] Validator test suite created
- [ ] Exporter test suite created
- [ ] All API routes updated
- [ ] User guide documentation written
- [ ] Migration checklist completed

---

## Rollout Strategy

### Pre-Migration Checklist
- [ ] Backup production database
- [ ] Test migration on staging environment
- [ ] Verify all existing listings can be migrated
- [ ] Prepare rollback plan

### Migration Steps
1. **Maintenance Mode:** Enable maintenance page
2. **Database Backup:** Full backup of current state
3. **Run Migration:** Execute Phase 0 SQL scripts
4. **Data Verification:** Confirm all data migrated correctly
5. **Deploy Code:** Push new application code
6. **Smoke Tests:** Test critical flows
7. **Enable Access:** Disable maintenance mode
8. **Monitor:** Watch for errors/issues

### Rollback Plan
If critical issues occur:
1. Restore database from backup
2. Revert code deployment
3. Notify users of temporary rollback
4. Fix issues in staging
5. Retry migration

---

## Success Metrics

### Technical Metrics
- Zero data loss during migration
- All existing listings accessible in new system
- API response times < 500ms
- Export generation < 2 seconds
- SEO Brain response < 5 seconds

### User Experience Metrics
- Wizard completion rate > 80%
- Average SEO score > 75
- Export success rate > 95%
- Draft save/resume success rate > 99%

### Business Metrics
- Support multiple channels per listing
- Reduce time-to-export by 50%
- Increase listing quality (SEO scores)
- Enable expansion to new platforms

---

## Timeline Summary

| Phase | Duration | Key Deliverables |
|-------|----------|------------------|
| Phase 0 | Week 1-2 | Database migration complete |
| Phase 1 | Week 2-3 | Multi-channel wizard live |
| Phase 2 | Week 3-4 | SEO Brain operational |
| Phase 3 | Week 4 | All exporters functional |
| Phase 4 | Week 5 | State management complete |
| Phase 5 | Week 5-6 | Testing & documentation done |

**Total Duration:** 5-6 weeks

---

## Risk Assessment

### High Risk
- **Data Migration:** Loss of existing listings
  - *Mitigation:* Multiple backups, staging tests, phased rollout

- **API Rate Limits:** OpenAI quota exhaustion
  - *Mitigation:* Implement caching, request queuing, fallback options

### Medium Risk
- **Channel API Changes:** Platform requirements evolve
  - *Mitigation:* Abstract exporters, version channel configs

- **Performance:** Large listings slow down wizard
  - *Mitigation:* Pagination, lazy loading, background processing

### Low Risk
- **User Confusion:** New workflow differs from Etsy-only
  - *Mitigation:* Onboarding tour, contextual help, migration guide

---

## Support & Maintenance

### Post-Migration Support
- Dedicated support channel for migration issues
- Daily monitoring of error logs
- Weekly review of user feedback
- Monthly review of success metrics

### Ongoing Maintenance
- Quarterly updates to channel configurations
- Monthly SEO prompt optimization
- Continuous exporter improvements
- Regular security updates

---

## Conclusion

This migration transforms Snap2Listing from a single-platform tool into a comprehensive multi-channel listing platform. The phased approach ensures minimal disruption while delivering incremental value. With proper execution, this will position Snap2Listing as the go-to solution for sellers managing inventory across multiple e-commerce platforms.

**Ready to begin Phase 0!** 🚀
