'use client';

import {
  Box,
  TextField,
  Typography,
  Stack,
  Button,
  Alert,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Switch,
  RadioGroup,
  Radio,
  FormLabel,
} from '@mui/material';
import { useState, useEffect } from 'react';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  ITEM_TYPES,
  WHO_MADE_OPTIONS,
  WHO_MADE_LABELS,
  WHAT_IS_IT_OPTIONS,
  WHAT_IS_IT_LABELS,
  WHEN_MADE_OPTIONS,
  WHEN_MADE_LABELS,
  type ItemType,
  type WhoMade,
  type WhatIsIt,
  type WhenMade,
} from '@/lib/types';
import {
  COMMON_MATERIALS,
  OCCASIONS,
  HOLIDAYS,
  RECIPIENTS,
  STYLES,
} from '@/lib/data/etsy-categories';

interface DetailsStepProps {
  productImageUrl: string;
  productName?: string;
  category_path: string;
  shortDescription?: string;
  onNext: (data: {
    title: string;
    tags: string[];
    description: string;
    quantity: number;
    sku?: string;
    item_type: ItemType;
    who_made: WhoMade;
    what_is_it: WhatIsIt;
    when_made: WhenMade;
    materials: string[];
    occasion?: string[];
    holiday?: string[];
    recipient?: string[];
    style?: string[];
    is_customizable: boolean;
    personalization_instructions?: string;
    personalization_char_limit?: number;
    processing_min: number;
    processing_max: number;
  }) => void;
  onBack: () => void;
}

export default function DetailsStep({
  productImageUrl,
  productName,
  category_path,
  shortDescription,
  onNext,
  onBack,
}: DetailsStepProps) {
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [newTag, setNewTag] = useState('');

  // Etsy Required Fields
  const [quantity, setQuantity] = useState(1);
  const [sku, setSku] = useState('');
  const [itemType, setItemType] = useState<ItemType>('physical');
  const [whoMade, setWhoMade] = useState<WhoMade>('i_did');
  const [whatIsIt, setWhatIsIt] = useState<WhatIsIt>('finished_product');
  const [whenMade, setWhenMade] = useState<WhenMade>('2020_2025');
  const [materials, setMaterials] = useState<string[]>([]);

  // Optional Fields
  const [occasion, setOccasion] = useState<string[]>([]);
  const [holiday, setHoliday] = useState<string[]>([]);
  const [recipient, setRecipient] = useState<string[]>([]);
  const [style, setStyle] = useState<string[]>([]);

  // Personalization
  const [isCustomizable, setIsCustomizable] = useState(false);
  const [personalizationInstructions, setPersonalizationInstructions] = useState('');
  const [personalizationCharLimit, setPersonalizationCharLimit] = useState<number | undefined>(undefined);

  // Processing Time
  const [processingMin, setProcessingMin] = useState(1);
  const [processingMax, setProcessingMax] = useState(3);

  useEffect(() => {
    generateText();
  }, []);

  const generateText = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/generate-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productImageUrl,
          productName,
          category: category_path,
          shortDescription,
        }),
      });
      const data = await response.json();
      setTitle(data.title);
      setTags(data.tags);
      setDescription(data.description);
      if (data.materials && data.materials.length > 0) {
        setMaterials(data.materials);
      }
    } catch (error) {
      console.error('Error generating text:', error);
      alert('Failed to generate text. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTag = (tagToDelete: string) => {
    setTags((tags || []).filter((tag) => tag !== tagToDelete));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !(tags || []).includes(newTag.trim())) {
      setTags([...(tags || []), newTag.trim()]);
      setNewTag('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || (tags || []).length === 0 || !description) {
      alert('Please fill in all required fields');
      return;
    }
    if ((tags || []).length > 13) {
      alert('Maximum 13 tags allowed');
      return;
    }
    if ((materials || []).length > 13) {
      alert('Maximum 13 materials allowed');
      return;
    }
    if (processingMin < 1 || processingMax < processingMin) {
      alert('Invalid processing time');
      return;
    }
    onNext({
      title,
      tags,
      description,
      quantity,
      sku: sku || undefined,
      item_type: itemType,
      who_made: whoMade,
      what_is_it: whatIsIt,
      when_made: whenMade,
      materials,
      occasion: occasion.length > 0 ? occasion : undefined,
      holiday: holiday.length > 0 ? holiday : undefined,
      recipient: recipient.length > 0 ? recipient : undefined,
      style: style.length > 0 ? style : undefined,
      is_customizable: isCustomizable,
      personalization_instructions: isCustomizable ? personalizationInstructions : undefined,
      personalization_char_limit: isCustomizable ? personalizationCharLimit : undefined,
      processing_min: processingMin,
      processing_max: processingMax,
    });
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <CircularProgress size={60} />
        <Typography variant="h5" sx={{ mt: 3 }}>
          AI is generating your listing details...
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          This usually takes 2-3 seconds
        </Typography>
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={4}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h4">Complete Listing Details</Typography>
          <Button
            startIcon={<RefreshIcon />}
            onClick={generateText}
            disabled={loading}
          >
            Regenerate AI Content
          </Button>
        </Stack>

        <Alert severity="info">
          Fill in all required fields. AI-generated content can be edited.
        </Alert>

        {/* Basic Info - Always Visible */}
        <Box>
          <Typography variant="h5" gutterBottom>Basic Information</Typography>
          <Stack spacing={3} sx={{ mt: 2 }}>
            {/* Title */}
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="subtitle1" fontWeight={600}>Title *</Typography>
                <Button size="small" startIcon={<RefreshIcon />} onClick={generateText}>
                  Regenerate
                </Button>
              </Stack>
              <TextField
                fullWidth
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                helperText={`${(title || '').length}/140 characters`}
                inputProps={{ maxLength: 140 }}
                required
              />
            </Box>

            {/* Description */}
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="subtitle1" fontWeight={600}>Description *</Typography>
                <Button size="small" startIcon={<RefreshIcon />} onClick={generateText}>
                  Regenerate
                </Button>
              </Stack>
              <TextField
                fullWidth
                multiline
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </Box>

            {/* Quantity & SKU */}
            <Stack direction="row" spacing={2}>
              <TextField
                label="Quantity *"
                type="number"
                required
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                inputProps={{ min: 1 }}
                sx={{ width: 150 }}
              />
              <TextField
                label="SKU (Optional)"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                helperText="Your unique product code"
                sx={{ flexGrow: 1 }}
              />
            </Stack>
          </Stack>
        </Box>

        {/* Etsy Required Fields */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Etsy Requirements</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={3}>
              {/* Item Type */}
              <FormControl fullWidth required>
                <FormLabel>Item Type *</FormLabel>
                <RadioGroup
                  row
                  value={itemType}
                  onChange={(e) => setItemType(e.target.value as ItemType)}
                >
                  {ITEM_TYPES.map((type) => (
                    <FormControlLabel
                      key={type}
                      value={type}
                      control={<Radio />}
                      label={type.charAt(0).toUpperCase() + type.slice(1)}
                    />
                  ))}
                </RadioGroup>
              </FormControl>

              {/* Who Made It */}
              <FormControl fullWidth required>
                <InputLabel>Who Made It? *</InputLabel>
                <Select
                  value={whoMade}
                  label="Who Made It? *"
                  onChange={(e) => setWhoMade(e.target.value as WhoMade)}
                >
                  {WHO_MADE_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>
                      {WHO_MADE_LABELS[option]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* What Is It */}
              <FormControl fullWidth required>
                <InputLabel>What Is It? *</InputLabel>
                <Select
                  value={whatIsIt}
                  label="What Is It? *"
                  onChange={(e) => setWhatIsIt(e.target.value as WhatIsIt)}
                >
                  {WHAT_IS_IT_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>
                      {WHAT_IS_IT_LABELS[option]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* When Made */}
              <FormControl fullWidth required>
                <InputLabel>When Was It Made? *</InputLabel>
                <Select
                  value={whenMade}
                  label="When Was It Made? *"
                  onChange={(e) => setWhenMade(e.target.value as WhenMade)}
                >
                  {WHEN_MADE_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>
                      {WHEN_MADE_LABELS[option]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Processing Time */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>Processing Time (Days) *</Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <TextField
                    label="Min"
                    type="number"
                    required
                    value={processingMin}
                    onChange={(e) => setProcessingMin(parseInt(e.target.value))}
                    inputProps={{ min: 1 }}
                    sx={{ width: 120 }}
                  />
                  <Typography>to</Typography>
                  <TextField
                    label="Max"
                    type="number"
                    required
                    value={processingMax}
                    onChange={(e) => setProcessingMax(parseInt(e.target.value))}
                    inputProps={{ min: processingMin }}
                    sx={{ width: 120 }}
                  />
                </Stack>
              </Box>
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* Tags & Materials */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Tags & Materials</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={3}>
              {/* Tags */}
              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Tags * (Max 13)
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {(tags || []).map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      onDelete={() => handleDeleteTag(tag)}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
                <Stack direction="row" spacing={1}>
                  <TextField
                    size="small"
                    placeholder="Add custom tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    disabled={(tags || []).length >= 13}
                    sx={{ flexGrow: 1 }}
                  />
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={handleAddTag}
                    disabled={(tags || []).length >= 13}
                  >
                    Add
                  </Button>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  {(tags || []).length}/13 tags used
                </Typography>
              </Box>

              {/* Materials */}
              <Autocomplete
                multiple
                options={COMMON_MATERIALS}
                value={materials || []}
                onChange={(event, newValue) => {
                  if (newValue.length <= 13) {
                    setMaterials(newValue);
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Materials (Max 13)"
                    helperText={`${(materials || []).length}/13 materials selected`}
                  />
                )}
              />
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* Optional Classifications */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Optional Classifications</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={3}>
              <Autocomplete
                multiple
                options={OCCASIONS}
                value={occasion || []}
                onChange={(event, newValue) => setOccasion(newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="Occasions" />
                )}
              />
              <Autocomplete
                multiple
                options={HOLIDAYS}
                value={holiday || []}
                onChange={(event, newValue) => setHoliday(newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="Holidays" />
                )}
              />
              <Autocomplete
                multiple
                options={RECIPIENTS}
                value={recipient || []}
                onChange={(event, newValue) => setRecipient(newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="Recipients" />
                )}
              />
              <Autocomplete
                multiple
                options={STYLES}
                value={style || []}
                onChange={(event, newValue) => setStyle(newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="Styles" />
                )}
              />
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* Personalization */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Personalization</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isCustomizable}
                    onChange={(e) => setIsCustomizable(e.target.checked)}
                  />
                }
                label="This item is customizable"
              />
              {isCustomizable && (
                <>
                  <TextField
                    label="Personalization Instructions"
                    placeholder="e.g., Tell buyers how to request customization..."
                    multiline
                    rows={3}
                    value={personalizationInstructions}
                    onChange={(e) => setPersonalizationInstructions(e.target.value)}
                    helperText="Explain what can be customized"
                  />
                  <TextField
                    label="Character Limit (Optional)"
                    type="number"
                    value={personalizationCharLimit || ''}
                    onChange={(e) => setPersonalizationCharLimit(e.target.value ? parseInt(e.target.value) : undefined)}
                    inputProps={{ min: 1 }}
                    helperText="Max characters for personalization text"
                    sx={{ width: 200 }}
                  />
                </>
              )}
            </Stack>
          </AccordionDetails>
        </Accordion>

        <Stack direction="row" justifyContent="space-between" pt={2}>
          <Button onClick={onBack} size="large">
            ← Back
          </Button>
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={!title || (tags || []).length === 0 || !description}
          >
            Continue →
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
