# Channel-First Flow Architecture

## Visual Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                        HEADER CARD                              │
│  • Title: "Create Multi-Channel Listing"                       │
│  • Step chip (only shown after workflow starts)                │
│  • Progress bar (only shown after workflow starts)             │
│  • Action buttons: Auto-Optimize, Save Draft, Exit             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              📍 CHANNEL SELECTOR (Always Visible)               │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  💡 StepGuidePopup: "Choose Your Sales Channels"         │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  [Channel Cards Grid]                                          │
│  ☐ Amazon  ☐ Etsy  ☐ Shopify  ☐ eBay  ☐ TikTok               │
│                                                                 │
│  ✅ 2 channels selected                                        │
│                                                                 │
│  [Start Creating Listing] ← Disabled until ≥1 channel selected │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ (User clicks "Start Creating Listing")
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│           📊 CHANNEL RULES SUMMARY (Sticky Display)            │
├─────────────────────────────────────────────────────────────────┤
│  Listing for 2 channels                                        │
│  ┌──────────────┐  ┌──────────────┐                           │
│  │   Amazon     │  │    Etsy      │                            │
│  │ Title: 200ch │  │ Title: 140ch │                            │
│  │ Desc: 2000ch │  │ Desc: 500ch  │                            │
│  │ Images: 5+   │  │ Images: 1+   │                            │
│  └──────────────┘  └──────────────┘                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    🔢 WORKFLOW STEPPER                          │
├─────────────────────────────────────────────────────────────────┤
│  ① Upload  →  ② Details  →  ③ Optimize  →  ④ Images  →       │
│  ⑤ Video  →  ⑥ Review                                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  📄 STEP CONTENT AREA                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  💡 StepGuidePopup: (Contextual per step)                │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  [Active Step Component]                                       │
│  • UploadStep (Step 1)                                         │
│  • GenericDetailsStep (Step 2)                                │
│  • BaseOverridesEditor (Step 3)                               │
│  • ImagesStep (Step 4)                                        │
│  • VideoStep (Step 5)                                         │
│  • ReviewStep (Step 6)                                        │
│                                                                 │
│  [Back]                                    [Continue/Save] →   │
└─────────────────────────────────────────────────────────────────┘
```

## State Flow Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                    INITIAL STATE                                 │
│  activeStep = 0                                                  │
│  channelsConfirmed = false                                       │
│  selectedChannelIds = []                                         │
└──────────────────────────────────────────────────────────────────┘
                              │
                              │ User selects channels
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│               CHANNELS SELECTED (Not Confirmed)                  │
│  activeStep = 0                                                  │
│  channelsConfirmed = false                                       │
│  selectedChannelIds = ["amazon", "etsy"]                         │
│                                                                  │
│  UI State:                                                       │
│  • ChannelSelector visible with selected channels               │
│  • "Start Creating Listing" button ENABLED                      │
│  • Stepper HIDDEN                                                │
│  • Step content HIDDEN                                           │
│  • Progress bar HIDDEN                                           │
└──────────────────────────────────────────────────────────────────┘
                              │
                              │ Click "Start Creating Listing"
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│            WORKFLOW ACTIVATED (Step 1: Upload)                   │
│  activeStep = 1                                                  │
│  channelsConfirmed = true                                        │
│  selectedChannelIds = ["amazon", "etsy"]                         │
│                                                                  │
│  UI State:                                                       │
│  • ChannelSelector still visible (but compact)                  │
│  • ChannelRulesSummary appears (sticky)                         │
│  • Stepper VISIBLE (showing 6 steps)                            │
│  • Step content shows UploadStep                                │
│  • Progress bar VISIBLE (0%)                                     │
│  • Step chip shows "Step 1 of 6"                                │
└──────────────────────────────────────────────────────────────────┘
                              │
                              │ Complete each step
                              ▼
                    Steps 2, 3, 4, 5, 6...
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                FINAL STEP (Step 6: Review)                       │
│  activeStep = 6                                                  │
│  channelsConfirmed = true                                        │
│  Progress bar: 100%                                              │
│                                                                  │
│  UI State:                                                       │
│  • ReviewStep shows complete listing preview                    │
│  • "Save & Export" button available                             │
│  • Can export per channel format                                │
└──────────────────────────────────────────────────────────────────┘
                              │
                              │ Save Complete
                              ▼
                    Redirect to /app/listings
```

## Conditional Rendering Logic

### Header Progress Bar
```typescript
{activeStep > 0 && (
  <LinearProgress value={progressPercentage} />
)}
// Only shows after workflow starts
```

### Step Chip
```typescript
{activeStep > 0 && (
  <Chip label={`Step ${activeStep} of 6`} />
)}
// Hidden during channel selection phase
```

### Channel Rules Summary
```typescript
{channelsConfirmed && selectedChannelIds.length > 0 && (
  <ChannelRulesSummary channels={getSelectedChannels()} />
)}
// Only appears AFTER "Start Creating Listing" is clicked
```

### Stepper
```typescript
{channelsConfirmed && (
  <Paper>
    <Stepper activeStep={activeStep - 1}>
      {/* 6 steps */}
    </Stepper>
  </Paper>
)}
// Completely hidden until channels are confirmed
```

### Step Content Area
```typescript
{channelsConfirmed && (
  <Paper>
    {activeStep === 1 && <UploadStep />}
    {activeStep === 2 && <GenericDetailsStep />}
    {activeStep === 3 && <BaseOverridesEditor />}
    {activeStep === 4 && <ImagesStep />}
    {activeStep === 5 && <VideoStep />}
    {activeStep === 6 && <ReviewStep />}
  </Paper>
)}
// Only renders after channels confirmed
```

## User Journey

### Phase 1: Channel Selection
```
1. User lands on page
2. Sees prominent ChannelSelector at top
3. Guide popup explains: "Choose Your Sales Channels"
4. User clicks channel cards to select
5. Success message: "✓ 2 channels selected"
6. "Start Creating Listing" button becomes enabled
7. User clicks button
```

### Phase 2: Workflow Execution
```
8. Page smoothly scrolls to workflow section
9. Stepper slides down with animation
10. ChannelRulesSummary fades in below selector
11. Progress bar initializes at 0%
12. UploadStep content fades in
13. User uploads image
14. Progress updates to ~17%
15. GenericDetailsStep appears (Step 2)
16. ... continues through all 6 steps
17. Final ReviewStep (100% progress)
18. User saves and exports
```

### Phase 3: Dynamic Channel Management
```
• User can change channel selection during workflow
• If all channels deselected:
  - channelsConfirmed resets to false
  - activeStep resets to 0
  - Stepper and content disappear
  - Back to channel selection phase
```

## Key Design Decisions

### Why Channel-First?
1. **Sets context**: Platform requirements determine the entire flow
2. **Prevents rework**: No need to re-optimize after adding channels
3. **Clear commitment**: User makes explicit choice before investing time
4. **Better UX**: Disabled steps communicate requirements upfront

### Why Separate from Stepper?
1. **Visual hierarchy**: Channel selection is foundational, not "just another step"
2. **Always accessible**: Users can see/modify channels without navigating steps
3. **Clearer intent**: "Start Creating Listing" is an explicit action
4. **State management**: Easier to handle "no channels selected" vs "step 0"

### Why Conditional Rendering?
1. **Reduces clutter**: Empty stepper with disabled steps looks broken
2. **Guides attention**: Focus on channel selection first
3. **Performance**: Don't render unused components
4. **Semantic correctness**: Progress bar at 0% before starting is confusing

## Props & State Mapping

| State Variable | Initial | After Selection | After Confirm | At Step 3 |
|----------------|---------|-----------------|---------------|-----------|
| `activeStep` | 0 | 0 | 1 | 3 |
| `channelsConfirmed` | false | false | true | true |
| `selectedChannelIds` | [] | ["amazon"] | ["amazon"] | ["amazon"] |
| `channelOverrides` | [] | [] | [{...}] | [{...}] |

## Component Visibility Matrix

| Component | activeStep=0 | channelsConfirmed=false | channelsConfirmed=true |
|-----------|--------------|-------------------------|------------------------|
| ChannelSelector | ✅ | ✅ | ✅ (read-only mode) |
| Start Button | ✅ | ✅ | ❌ (hidden) |
| ChannelRulesSummary | ❌ | ❌ | ✅ |
| Stepper | ❌ | ❌ | ✅ |
| Progress Bar | ❌ | ❌ | ✅ |
| Step Content | ❌ | ❌ | ✅ |
| Step Chip | ❌ | ❌ | ✅ |

---

**Architecture Type**: Pre-workflow Gate Pattern  
**Complexity**: Medium  
**User Clarity**: High ⭐  
**Maintainability**: High ⭐
