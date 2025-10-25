import { Card, Stack, Typography, Box } from '@mui/material';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  gradient: string;
  change?: {
    value: number;
    period: string;
  };
  onClick?: () => void;
}

export function StatCard({
  label,
  value,
  icon,
  gradient,
  change,
  onClick
}: StatCardProps) {
  return (
    <Card
      onClick={onClick}
      sx={{
        borderRadius: 3,
        background: gradient,
        color: 'white',
        p: 3,
        height: '100%',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: 6,
        } : {},
      }}
    >
      <Stack spacing={2}>
        <Box sx={{ fontSize: 48 }}>{icon}</Box>
        <Box>
          <Typography variant="h3" fontWeight={800}>
            {value}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
            {label}
          </Typography>
          {change && (
            <Typography
              variant="caption"
              sx={{
                opacity: 0.8,
                display: 'block',
                mt: 0.5,
                fontWeight: 600,
              }}
            >
              {change.value > 0 ? '↑' : '↓'} {Math.abs(change.value)}% vs {change.period}
            </Typography>
          )}
        </Box>
      </Stack>
    </Card>
  );
}
