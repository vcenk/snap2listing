import { Box, Typography, Button, Stack } from '@mui/material';
import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Box
      sx={{
        textAlign: 'center',
        py: 8,
        px: 3,
      }}
    >
      <Stack spacing={2} alignItems="center">
        {icon && (
          <Box sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.5 }}>
            {icon}
          </Box>
        )}
        <Typography variant="h4" color="text.secondary">
          {title}
        </Typography>
        {description && (
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500 }}>
            {description}
          </Typography>
        )}
        {action && (
          <Button variant="contained" onClick={action.onClick} sx={{ mt: 2 }}>
            {action.label}
          </Button>
        )}
      </Stack>
    </Box>
  );
}
