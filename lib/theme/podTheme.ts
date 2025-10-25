import { createTheme } from '@mui/material/styles';

// Listybox-inspired gradient system
export const listyboxGradients = {
  purple: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  pink: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  blue: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  green: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  orange: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  sunset: 'linear-gradient(135deg, #ff6a00 0%, #ee0979 100%)',
  ocean: 'linear-gradient(135deg, #2af598 0%, #009efd 100%)',
  royal: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
};

// Status color system
export const statusColors = {
  draft: '#95a5a6',
  pending: '#f39c12',
  published: '#27ae60',
  failed: '#e74c3c',
  processing: '#3498db',
  archived: '#7f8c8d',
};

// Create POD theme
export const podTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#667eea',
      light: '#8b9bf5',
      dark: '#4c5fd9',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#f093fb',
      light: '#f5b3fc',
      dark: '#e873f9',
      contrastText: '#ffffff',
    },
    success: {
      main: '#43e97b',
      light: '#6bed94',
      dark: '#2dd164',
      contrastText: '#ffffff',
    },
    info: {
      main: '#4facfe',
      light: '#72bdfe',
      dark: '#2b8cfe',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#fa709a',
      light: '#fb8bae',
      dark: '#f95585',
      contrastText: '#ffffff',
    },
    error: {
      main: '#ee0979',
      light: '#f13b91',
      dark: '#d00869',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#2c3e50',
      secondary: '#7f8c8d',
      disabled: '#bdc3c7',
    },
    divider: '#e9ecef',
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    h1: {
      fontWeight: 800,
      fontSize: '3rem',
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 800,
      fontSize: '2.5rem',
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 800,
      fontSize: '2rem',
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontWeight: 800,
      fontSize: '1.75rem',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 700,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h6: {
      fontWeight: 700,
      fontSize: '1.25rem',
      lineHeight: 1.5,
    },
    subtitle1: {
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.6,
    },
    subtitle2: {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      fontSize: '1rem',
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0 2px 4px rgba(0,0,0,0.05)',
    '0 4px 8px rgba(0,0,0,0.08)',
    '0 6px 12px rgba(0,0,0,0.10)',
    '0 8px 16px rgba(0,0,0,0.12)',
    '0 12px 24px rgba(0,0,0,0.15)',
    '0 16px 32px rgba(0,0,0,0.18)',
    '0 20px 40px rgba(0,0,0,0.20)',
    '0 24px 48px rgba(0,0,0,0.22)',
    '0 2px 4px rgba(0,0,0,0.05)',
    '0 4px 8px rgba(0,0,0,0.08)',
    '0 6px 12px rgba(0,0,0,0.10)',
    '0 8px 16px rgba(0,0,0,0.12)',
    '0 12px 24px rgba(0,0,0,0.15)',
    '0 16px 32px rgba(0,0,0,0.18)',
    '0 20px 40px rgba(0,0,0,0.20)',
    '0 24px 48px rgba(0,0,0,0.22)',
    '0 2px 4px rgba(0,0,0,0.05)',
    '0 4px 8px rgba(0,0,0,0.08)',
    '0 6px 12px rgba(0,0,0,0.10)',
    '0 8px 16px rgba(0,0,0,0.12)',
    '0 12px 24px rgba(0,0,0,0.15)',
    '0 16px 32px rgba(0,0,0,0.18)',
    '0 20px 40px rgba(0,0,0,0.20)',
    '0 24px 48px rgba(0,0,0,0.22)',
  ],
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 12,
          padding: '10px 24px',
        },
        sizeLarge: {
          padding: '14px 32px',
          fontSize: '1.125rem',
        },
        contained: {
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(0,0,0,0.20)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
        elevation1: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        },
        elevation2: {
          boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
        },
        elevation3: {
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 8,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
          },
        },
      },
    },
  },
});

// Hover effect presets
export const hoverEffects = {
  lift: {
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
    },
  },
  scale: {
    transition: 'transform 0.3s ease',
    '&:hover': {
      transform: 'scale(1.03)',
    },
  },
  glow: {
    transition: 'box-shadow 0.3s ease',
    '&:hover': {
      boxShadow: '0 0 20px rgba(102, 126, 234, 0.6)',
    },
  },
  subtle: {
    transition: 'all 0.2s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
    },
  },
};

export default podTheme;
