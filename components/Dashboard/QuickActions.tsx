import { Paper, Typography, Stack, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import UploadIcon from '@mui/icons-material/Upload';
import BarChartIcon from '@mui/icons-material/BarChart';
import { listyboxGradients } from '@/lib/theme/podTheme';

interface QuickActionsProps {
  onCreateProduct?: () => void;
  onImportDesigns?: () => void;
  onViewAnalytics?: () => void;
}

export function QuickActions({
  onCreateProduct,
  onImportDesigns,
  onViewAnalytics,
}: QuickActionsProps) {
  return (
    <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
      <Typography variant="h6" fontWeight={700} gutterBottom>
        Quick Actions
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mt={2}>
        <Button
          variant="contained"
          size="large"
          startIcon={<AddIcon />}
          fullWidth
          onClick={onCreateProduct}
          sx={{
            background: listyboxGradients.purple,
            fontWeight: 700,
            py: 1.5,
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
            '&:hover': {
              background: listyboxGradients.purple,
              boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
            },
          }}
        >
          Create New Product
        </Button>
        <Button
          variant="contained"
          size="large"
          startIcon={<UploadIcon />}
          fullWidth
          onClick={onImportDesigns}
          sx={{
            background: listyboxGradients.pink,
            fontWeight: 700,
            py: 1.5,
            boxShadow: '0 4px 12px rgba(240, 147, 251, 0.3)',
            '&:hover': {
              background: listyboxGradients.pink,
              boxShadow: '0 6px 20px rgba(240, 147, 251, 0.4)',
            },
          }}
        >
          Import Designs
        </Button>
        <Button
          variant="contained"
          size="large"
          startIcon={<BarChartIcon />}
          fullWidth
          onClick={onViewAnalytics}
          sx={{
            background: listyboxGradients.blue,
            fontWeight: 700,
            py: 1.5,
            boxShadow: '0 4px 12px rgba(79, 172, 254, 0.3)',
            '&:hover': {
              background: listyboxGradients.blue,
              boxShadow: '0 6px 20px rgba(79, 172, 254, 0.4)',
            },
          }}
        >
          View Analytics
        </Button>
      </Stack>
    </Paper>
  );
}
