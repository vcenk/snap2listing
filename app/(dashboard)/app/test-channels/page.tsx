'use client';

import { useState } from 'react';
import { Box, Button, Typography, Paper, Alert } from '@mui/material';

export default function TestChannelsPage() {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const testAPI = async () => {
    try {
      const response = await fetch('/api/channels');
      const data = await response.json();
      setResult(data);
      setError('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Channel API Test
      </Typography>

      <Button variant="contained" onClick={testAPI} sx={{ mb: 3 }}>
        Test /api/channels
      </Button>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error: {error}
        </Alert>
      )}

      {result && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Success: {result.success ? 'YES' : 'NO'}
          </Typography>
          <Typography variant="body1" gutterBottom>
            Channels Count: {result.channels?.length || 0}
          </Typography>
          <Typography variant="body2" component="pre" sx={{ mt: 2, overflow: 'auto' }}>
            {JSON.stringify(result, null, 2)}
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
