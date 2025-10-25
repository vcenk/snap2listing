'use client';

import { createTheme } from '@mui/material/styles';

// Light mode only theme with custom colors and typography
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#5B7CFA',
      light: '#7B95FB',
      dark: '#4863D9',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#FF8A5C',
      light: '#FFA47D',
      dark: '#E66F41',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#66C2A5',
      light: '#85D0B8',
      dark: '#4FA88A',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#F6C85F',
      light: '#F8D47F',
      dark: '#E5B443',
      contrastText: '#111827',
    },
    error: {
      main: '#E57373',
      light: '#EF9A9A',
      dark: '#D44646',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F7F9FC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#111827',
      secondary: '#4B5563',
    },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
    fontSize: 16,
    body1: {
      fontSize: '1.125rem', // 18px
      lineHeight: 1.65,
    },
    body2: {
      fontSize: '1rem', // 16px
      lineHeight: 1.65,
    },
    h1: {
      fontSize: '2.75rem', // 44px
      fontWeight: 600,
      lineHeight: 1.25,
    },
    h2: {
      fontSize: '2rem', // 32px
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.5rem', // 24px
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '1.25rem', // 20px
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.125rem', // 18px
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1rem', // 16px
      fontWeight: 600,
      lineHeight: 1.4,
    },
  },
  shape: {
    borderRadius: 14,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontSize: '1rem',
          fontWeight: 500,
          minHeight: 44, // Accessibility: minimum touch target
          paddingLeft: 24,
          paddingRight: 24,
          paddingTop: 10,
          paddingBottom: 10,
          '&:focus-visible': {
            outline: '3px solid #5B7CFA',
            outlineOffset: 2,
          },
        },
        sizeLarge: {
          fontSize: '1.125rem',
          minHeight: 48,
          paddingLeft: 32,
          paddingRight: 32,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          minWidth: 44,
          minHeight: 44,
          '&:focus-visible': {
            outline: '3px solid #5B7CFA',
            outlineOffset: 2,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '&:focus-within': {
              outline: '3px solid #5B7CFA',
              outlineOffset: 2,
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 14,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 14,
        },
        rounded: {
          borderRadius: 14,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&:focus-visible': {
            outline: '3px solid #5B7CFA',
            outlineOffset: 2,
          },
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          '&:focus-visible': {
            outline: '3px solid #5B7CFA',
            outlineOffset: 2,
            borderRadius: 4,
          },
        },
      },
    },
    MuiGrid: {
      styleOverrides: {
        root: {
          width: '100%',
          maxWidth: '100%',
        },
        item: {
          maxWidth: '100%',
        },
      },
    },
  },
  spacing: 8, // Base spacing unit (8px)
});
