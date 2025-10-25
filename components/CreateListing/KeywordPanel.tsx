'use client';

import { useState } from 'react';
import { Box, Stack, Button, Typography, Chip, Alert, Divider, CircularProgress } from '@mui/material';

interface KeywordPanelProps {
  title: string;
  description: string;
  category: string;
  onInsertTitle: (text: string) => void;
  onInsertDescription: (text: string) => void;
}

type ScoredKeyword = { keyword: string; score: number };

export default function KeywordPanel({ title, description, category, onInsertTitle, onInsertDescription }: KeywordPanelProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [grouped, setGrouped] = useState<Record<string, ScoredKeyword[]>>({});
  const [autosuggests, setAutosuggests] = useState<ScoredKeyword[]>([]);

  const scoreList = (arr: string[] = []) => {
    const n = Math.max(1, arr.length);
    return arr.map((kw, i) => ({ keyword: kw, score: Math.max(40, Math.round(100 - (i * 60) / (n - 1 || 1))) }));
  };

  const generate = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/seo/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productTitle: title, productDescription: description, category }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.error || 'Failed to generate keywords');
      const groupedRaw: Record<string, string[]> = data.data.grouped || {};
      const autosRaw: string[] = data.data.autosuggests || [];
      const scored: Record<string, ScoredKeyword[]> = {};
      Object.entries(groupedRaw).forEach(([k, v]) => (scored[k] = scoreList(v as string[])));
      setGrouped(scored);
      setAutosuggests(scoreList(autosRaw));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const renderGroup = (label: string, items: ScoredKeyword[] = []) => (
    <Box key={label}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>{label}</Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {items
          .slice()
          .sort((a, b) => b.score - a.score)
          .map((kw) => (
            <Chip
              key={`${label}-${kw.keyword}`}
              label={`${kw.keyword} (${kw.score})`}
              size="small"
              sx={{ mb: 1, bgcolor: kw.score >= 80 ? 'success.light' : kw.score >= 60 ? 'warning.light' : undefined }}
              onClick={() => onInsertTitle(kw.keyword)}
              onDelete={() => onInsertDescription(kw.keyword)}
            />
          ))}
      </Stack>
    </Box>
  );

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="h6" fontWeight={700}>SEO Keywords</Typography>
        <Button variant="outlined" size="small" onClick={generate} disabled={loading || !title}>
          {loading ? <CircularProgress size={16} /> : 'Generate Keywords'}
        </Button>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Click a chip to insert into Title. Remove icon inserts into Description. Based on your current title and description.
      </Typography>
      {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}
      {!loading && Object.keys(grouped).length === 0 && autosuggests.length === 0 && (
        <Alert severity="info">Generate keywords to see suggestions grouped by category.</Alert>
      )}
      <Stack spacing={2}>
        {Object.entries(grouped).map(([k, v]) => renderGroup(k, v as ScoredKeyword[]))}
        {autosuggests.length > 0 && (
          <Box>
            <Divider sx={{ my: 1 }} />
            {renderGroup('Autosuggests', autosuggests)}
          </Box>
        )}
      </Stack>
    </Box>
  );
}
