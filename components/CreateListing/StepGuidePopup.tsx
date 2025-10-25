'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  Stack,
  IconButton,
  alpha,
  Fade,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';

interface StepGuidePopupProps {
  stepKey: string;
  title: string;
  description: string;
}

export default function StepGuidePopup({ stepKey, title, description }: StepGuidePopupProps) {
  const [visible, setVisible] = useState(false);
  const storageKey = `guide-dismissed-${stepKey}`;

  useEffect(() => {
    // Check if user has dismissed this guide before
    const dismissed = localStorage.getItem(storageKey);
    if (!dismissed) {
      setVisible(true);
    }
  }, [storageKey]);

  const handleGotIt = () => {
    localStorage.setItem(storageKey, 'true');
    setVisible(false);
  };

  const handleRemindLater = () => {
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <Fade in={visible}>
      <Card
        sx={{
          mb: 3,
          background: `linear-gradient(135deg, ${alpha('#9C27B0', 0.1)} 0%, ${alpha('#2196F3', 0.1)} 100%)`,
          border: `2px solid ${alpha('#9C27B0', 0.3)}`,
          borderRadius: 3,
          boxShadow: 4,
          position: 'relative',
        }}
      >
        <IconButton
          onClick={handleRemindLater}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: 'text.secondary',
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>

        <Box sx={{ p: 3 }}>
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <LightbulbOutlinedIcon
              sx={{
                color: 'secondary.main',
                fontSize: 32,
                mt: 0.5,
              }}
            />
            <Box flex={1}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                {title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {description}
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  onClick={handleGotIt}
                  variant="contained"
                  size="small"
                  sx={{
                    textTransform: 'none',
                    borderRadius: 2,
                    fontWeight: 600,
                  }}
                >
                  Got it
                </Button>
                <Button
                  onClick={handleRemindLater}
                  variant="text"
                  size="small"
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  Remind me later
                </Button>
              </Stack>
            </Box>
          </Stack>
        </Box>
      </Card>
    </Fade>
  );
}
