# Create Listing Components Architecture

## Component Hierarchy

```
ListingWizard.tsx (Main Container)
│
├── Header Card
│   ├── Title + Step Counter
│   ├── Action Buttons (Auto-Optimize, Save Draft, Exit)
│   └── Progress Bar (Linear with %)
│
├── ChannelRulesSummary.tsx (Shows after Step 1)
│   └── Channel Rules Cards
│       ├── Platform Name
│       ├── Title Max Length
│       ├── Description Max Length
│       └── Image Requirements
│
├── Stepper (MUI)
│   └── 7 Steps with Labels
│
└── Step Content Paper
    ├── StepGuidePopup.tsx (Per Step)
    │   ├── Title
    │   ├── Description
    │   └── Actions (Got it / Remind me later)
    │
    └── Step Components
        │
        ├── Step 1: ChannelSelector.tsx
        │   ├── Channel Grid Cards
        │   │   ├── Checkbox
        │   │   ├── Channel Name + Icon
        │   │   ├── Description
        │   │   └── Constraint Chips
        │   └── Success Feedback Box
        │
        ├── Step 2: UploadStep.tsx
        │   ├── Image Upload Zone
        │   ├── Short Description Field
        │   └── Category/Price Inputs
        │
        ├── Step 3: GenericDetailsStep.tsx
        │   ├── Product Image Preview Card
        │   ├── Title TextField
        │   ├── Description TextField (multiline)
        │   ├── Quantity Input
        │   └── SKU Input (optional)
        │
        ├── Step 4: BaseOverridesEditor.tsx
        │   ├── Base Content Tab
        │   │   ├── Base Title
        │   │   └── Base Description
        │   └── Channel-Specific Tabs
        │       ├── Channel Title Override
        │       ├── Channel Description Override
        │       ├── Tags Input
        │       └── Bullets/Features
        │
        ├── Step 5: ImagesStep.tsx
        │   ├── Original Image Display
        │   ├── AI Generation Options
        │   └── Generated Images Grid
        │
        ├── Step 6: VideoStep.tsx
        │   ├── Video Generation Button
        │   ├── Video Preview (if generated)
        │   └── Skip Option
        │
        └── Step 7: ReviewStep.tsx
            ├── Complete Listing Preview
            ├── Images Carousel
            ├── Video Player (if exists)
            └── Export/Save Buttons
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      ListingWizard State                        │
├─────────────────────────────────────────────────────────────────┤
│ • activeStep: 1-7                                               │
│ • selectedChannelIds: string[]                                  │
│ • channels: Channel[]                                           │
│ • uploadedImage: string                                         │
│ • shortDescription: string                                      │
│ • baseData: ListingBase                                         │
│ • channelOverrides: ChannelOverride[]                           │
│ • generatedImages: GeneratedImage[]                             │
│ • generatedVideo: GeneratedVideo | undefined                    │
│ • listingId: string | undefined                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
         ┌────────────────────────────────────┐
         │     Step 1: Select Channels        │
         │  Updates: selectedChannelIds       │
         │           channels                 │
         └────────────────────────────────────┘
                              │
                              ▼
         ┌────────────────────────────────────┐
         │   Step 2: Upload Product Image     │
         │  Updates: uploadedImage            │
         │           shortDescription         │
         │           category, price          │
         │  Initializes: baseData             │
         └────────────────────────────────────┘
                              │
                              ▼
         ┌────────────────────────────────────┐
         │   Step 3: Review Details           │
         │  Updates: baseData.title           │
         │           baseData.description     │
         │           baseData.quantity        │
         │           baseData.sku             │
         └────────────────────────────────────┘
                              │
                              ▼
         ┌────────────────────────────────────┐
         │   Step 4: Optimize Content         │
         │  Updates: baseData (base fields)   │
         │           channelOverrides         │
         │  API Call: /api/seo/draft          │
         └────────────────────────────────────┘
                              │
                              ▼
         ┌────────────────────────────────────┐
         │   Step 5: Generate Images          │
         │  Updates: generatedImages          │
         │           baseData.images          │
         │  API Call: Image generation        │
         └────────────────────────────────────┘
                              │
                              ▼
         ┌────────────────────────────────────┐
         │   Step 6: Create Video             │
         │  Updates: generatedVideo           │
         │           baseData.video           │
         │  API Call: Video generation        │
         └────────────────────────────────────┘
                              │
                              ▼
         ┌────────────────────────────────────┐
         │   Step 7: Review & Export          │
         │  Action: Save to DB                │
         │  API Call: /api/listings/save      │
         │  Updates: listingId                │
         │  Navigate: /app/listings           │
         └────────────────────────────────────┘
```

## Props Interface Reference

### ChannelRulesSummary
```typescript
interface ChannelRulesSummaryProps {
  channels: Channel[];
}
```

### StepGuidePopup
```typescript
interface StepGuidePopupProps {
  stepKey: string;          // Unique key for localStorage
  title: string;            // Popup heading
  description: string;      // Help text
}
```

### ChannelSelector
```typescript
interface ChannelSelectorProps {
  selectedChannels: string[];
  onSelectionChange: (channelIds: string[]) => void;
  onChannelsLoaded?: (channels: Channel[]) => void;
}
```

### GenericDetailsStep
```typescript
interface GenericDetailsStepProps {
  productImageUrl: string;
  productName?: string;
  category_path?: string;
  shortDescription?: string;
  onNext: (data: {
    title: string;
    description: string;
    quantity: number;
    sku?: string;
  }) => void;
  onBack: () => void;
}
```

### BaseOverridesEditor
```typescript
interface BaseOverridesEditorProps {
  baseData: ListingBase;
  channels: Channel[];
  overrides: ChannelOverride[];
  onBaseChange: (base: ListingBase) => void;
  onOverrideChange: (channelId: string, override: Partial<ChannelOverride>) => void;
  activeChannelId?: string;
  onActiveChannelChange: (id: string | null) => void;
}
```

### ImagesStep
```typescript
interface ImagesStepProps {
  channelSlugs: string[];
  originalImage: string;
  productName: string;
  onNext: (images: GeneratedImage[]) => void;
  onBack: () => void;
}
```

### VideoStep
```typescript
interface VideoStepProps {
  originalImage: string;
  generatedImages: GeneratedImage[];
  productName: string;
  onNext: (video?: GeneratedVideo) => void;
  onBack: () => void;
}
```

### ReviewStep
```typescript
interface ReviewStepProps {
  title: string;
  description: string;
  tags: string[];
  price: number;
  images: GeneratedImage[];
  video?: GeneratedVideo;
  onBack: () => void;
  onSave: () => void;
}
```

## Type Definitions

### Core Types
```typescript
// Channel representation
interface Channel {
  id: string;
  slug: string;
  name: string;
  exportFormat: 'csv' | 'api';
  config: {
    description?: string;
  };
  validationRules: {
    title?: { maxLength: number };
    description?: { maxLength: number };
    images?: { min: number; max?: number };
  };
}

// Base listing data
interface ListingBase {
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  quantity: number;
  sku?: string;
  materials?: string[];
  originalImage?: string;
  video?: string;
}

// Channel-specific overrides
interface ChannelOverride {
  channelId: string;
  channelSlug: string;
  title?: string;
  description?: string;
  tags?: string[];
  bullets?: string[];
}

// Generated content types
interface GeneratedImage {
  id: string;
  url: string;
  type?: string;
}

interface GeneratedVideo {
  id: string;
  url: string;
  duration?: number;
}
```

## Styling Constants

### Color Variables
```typescript
const CHANNEL_COLORS = {
  shopify: '#96BF48',
  ebay: '#E53238',
  'facebook-ig': '#1877F2',
  amazon: '#FF9900',
  etsy: '#F16521',
  tiktok: '#000000',
};

const GRADIENT_PRIMARY = 'linear-gradient(135deg, #2196F3 0%, #9C27B0 100%)';
const GRADIENT_SUCCESS = 'linear-gradient(135deg, #4CAF50 0%, #2196F3 100%)';
```

### Spacing & Radius
```typescript
const BORDER_RADIUS = {
  sm: 8,   // rounded-2
  md: 12,  // rounded-3
  lg: 16,  // rounded-4
};

const SPACING = {
  card: 4,      // 32px
  section: 3,   // 24px
  elements: 2,  // 16px
};
```

## Event Handlers Reference

| Handler | Description | Triggered By |
|---------|-------------|--------------|
| `handleChannelsSelected()` | Proceeds to step 2, initializes overrides | Step 1 Continue |
| `handleUploadComplete(data)` | Stores image/desc, initializes baseData | Step 2 Upload |
| `handleDetailsComplete(data)` | Updates baseData with form values | Step 3 Form Submit |
| `handleAutoOptimize()` | Calls SEO API, updates all content | Step 4 Auto-Optimize Button |
| `handleContentComplete()` | Proceeds to images step | Step 4 Continue |
| `handleImagesComplete(images)` | Stores generated images | Step 5 Continue |
| `handleVideoComplete(video?)` | Stores optional video | Step 6 Continue/Skip |
| `handleSaveListing(status)` | Saves to DB, navigates away | Step 7 Save |
| `handleSaveDraft()` | Quick save at any step | Save Draft Button |
| `handleExit()` | Optional save and navigate to listings | Exit Button |

## localStorage Keys

- `guide-dismissed-step-1` through `guide-dismissed-step-7`
  - Values: `"true"` (dismissed) or not set (show popup)

---

**Component Count**: 9 main components + 2 new utilities  
**Total Lines of Code**: ~1,500 (including styling)  
**Dependencies**: Material-UI, React, Next.js
