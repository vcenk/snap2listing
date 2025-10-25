'use client';

import {
  Box,
  Button,
  TextField,
  Typography,
  Stack,
  Paper,
  Divider,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/lib/auth/context';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import FacebookIcon from '@mui/icons-material/Facebook';
import GoogleIcon from '@mui/icons-material/Google';
import TwitterIcon from '@mui/icons-material/Twitter';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

export default function SignupPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!agreedToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password, name);
      // User will be redirected after email verification
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        position: 'relative',
        p: 2,
      }}
    >
      {/* Floating orbs */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: { xs: 200, md: 400 },
          height: { xs: 200, md: 400 },
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '10%',
          right: '10%',
          width: { xs: 250, md: 500 },
          height: { xs: 250, md: 500 },
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />

      {/* Back to Home Button */}
      <Button
        component={Link}
        href="/"
        startIcon={<ArrowBackIcon />}
        sx={{
          position: 'absolute',
          top: 20,
          left: 20,
          color: 'white',
          textTransform: 'none',
          fontWeight: 600,
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        Back to Home
      </Button>

      {/* Signup Card */}
      <Paper
        elevation={24}
        sx={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 480,
          width: '100%',
          p: { xs: 4, sm: 5 },
          borderRadius: 4,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <Stack spacing={3}>
          {/* Header */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                mb: 1,
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Get Started Free
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Create your Snap2Listing account today
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSignup}>
            <Stack spacing={2.5}>
              <TextField
                placeholder="Full Name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
                required
                autoComplete="name"
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: '#764ba2' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: '#F9FAFB',
                    '&:hover': {
                      backgroundColor: '#F3F4F6',
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'white',
                    },
                  },
                }}
              />

              <TextField
                placeholder="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                required
                autoComplete="email"
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: '#764ba2' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: '#F9FAFB',
                    '&:hover': {
                      backgroundColor: '#F3F4F6',
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'white',
                    },
                  },
                }}
              />

              <TextField
                placeholder="Password (min 6 characters)"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                required
                autoComplete="new-password"
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: '#764ba2' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: '#F9FAFB',
                    '&:hover': {
                      backgroundColor: '#F3F4F6',
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'white',
                    },
                  },
                }}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    disabled={loading}
                    icon={<CheckCircleOutlineIcon />}
                    checkedIcon={<CheckCircleOutlineIcon />}
                    sx={{
                      color: '#764ba2',
                      '&.Mui-checked': {
                        color: '#764ba2',
                      },
                    }}
                  />
                }
                label={
                  <Typography variant="body2" color="text.secondary">
                    I agree to the{' '}
                    <Link
                      href="/terms"
                      style={{
                        color: '#764ba2',
                        textDecoration: 'none',
                        fontWeight: 600,
                      }}
                    >
                      Terms of Service
                    </Link>
                    {' '}and{' '}
                    <Link
                      href="/privacy"
                      style={{
                        color: '#764ba2',
                        textDecoration: 'none',
                        fontWeight: 600,
                      }}
                    >
                      Privacy Policy
                    </Link>
                  </Typography>
                }
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                sx={{
                  py: 1.75,
                  borderRadius: 2,
                  fontWeight: 700,
                  fontSize: '1rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5568d3 0%, #654096 100%)',
                    boxShadow: '0 12px 32px rgba(102, 126, 234, 0.4)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                {loading ? (
                  <>
                    <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                    Creating Account...
                  </>
                ) : (
                  'CREATE ACCOUNT'
                )}
              </Button>
            </Stack>
          </form>

          <Divider sx={{ my: 1 }}>
            <Typography variant="body2" color="text.secondary">
              or sign up with
            </Typography>
          </Divider>

          {/* Social Signup Buttons */}
          <Stack direction="row" spacing={2} justifyContent="center">
            <IconButton
              sx={{
                width: 50,
                height: 50,
                border: '2px solid #F3F4F6',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: '#3b5998',
                  backgroundColor: 'rgba(59, 89, 152, 0.05)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <FacebookIcon sx={{ color: '#3b5998', fontSize: 24 }} />
            </IconButton>
            <IconButton
              sx={{
                width: 50,
                height: 50,
                border: '2px solid #F3F4F6',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: '#DB4437',
                  backgroundColor: 'rgba(219, 68, 55, 0.05)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <GoogleIcon sx={{ color: '#DB4437', fontSize: 24 }} />
            </IconButton>
            <IconButton
              sx={{
                width: 50,
                height: 50,
                border: '2px solid #F3F4F6',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: '#1DA1F2',
                  backgroundColor: 'rgba(29, 161, 242, 0.05)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <TwitterIcon sx={{ color: '#1DA1F2', fontSize: 24 }} />
            </IconButton>
          </Stack>

          {/* Sign In Link */}
          <Typography variant="body2" textAlign="center" color="text.secondary" sx={{ mt: 2 }}>
            Already have an account?{' '}
            <Link
              href="/login"
              style={{
                color: '#764ba2',
                textDecoration: 'none',
                fontWeight: 700,
              }}
            >
              SIGN IN
            </Link>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
