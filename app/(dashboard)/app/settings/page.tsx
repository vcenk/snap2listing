'use client';

import {
  Box,
  Typography,
  Paper,
  Stack,
  TextField,
  Button,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/context';
import { supabase } from '@/lib/supabase/client';
import { getPlanById } from '@/config/pricing';

export default function SettingsPage() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [planId, setPlanId] = useState('free');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      // Set email from auth user
      setEmail(user.email || '');

      // Fetch name and plan from users table
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('name, plan_id')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setName(data.name || '');
        setPlanId(data.plan_id || 'free');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setSaving(true);
    setMessage('');

    try {
      const { error } = await supabase
        .from('users')
        .update({ name })
        .eq('id', user.id);

      if (error) throw error;

      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setMessage('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!email) return;

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      alert('✅ Password reset email sent! Check your inbox.');
    } catch (error: any) {
      console.error('Password reset error:', error);
      alert('❌ Failed to send password reset email.');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h2" mb={4}>
        Settings
      </Typography>

      <Stack spacing={4}>
        {/* Profile Settings */}
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Profile Settings
          </Typography>
          <Divider sx={{ my: 3 }} />
          <Stack spacing={3}>
            {message && (
              <Alert severity={message.includes('success') ? 'success' : 'error'}>
                {message}
              </Alert>
            )}
            <TextField
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              disabled={saving}
            />
            <TextField
              label="Email"
              type="email"
              value={email}
              fullWidth
              disabled
              helperText="Email cannot be changed"
            />
            <Box>
              <Button
                variant="contained"
                onClick={handleSaveProfile}
                disabled={saving}
                startIcon={saving ? <CircularProgress size={20} /> : null}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </Stack>
        </Paper>

        {/* Password */}
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Password
          </Typography>
          <Divider sx={{ my: 3 }} />
          <Typography variant="body1" color="text.secondary" paragraph>
            Change your password to keep your account secure.
          </Typography>
          <Button variant="outlined" onClick={handleChangePassword}>
            Change Password
          </Button>
        </Paper>

        {/* Subscription */}
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Subscription
          </Typography>
          <Divider sx={{ my: 3 }} />
          <Alert severity="info" sx={{ mb: 2 }}>
            You are currently on the <strong>{getPlanById(planId)?.name || 'Free'}</strong> plan.
          </Alert>
          <Typography variant="body1" color="text.secondary" paragraph>
            {planId === 'free' ? (
              'Start creating with a paid plan'
            ) : (
              `Monthly billing: $${getPlanById(planId)?.price || 0}.00`
            )}
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button variant="contained" href="/app/billing">
              View Billing
            </Button>
            {planId !== 'free' && (
              <Button variant="outlined" color="error">
                Cancel Subscription
              </Button>
            )}
          </Stack>
        </Paper>

        {/* Danger Zone */}
        <Paper sx={{ p: 4, borderColor: 'error.main', border: '1px solid' }}>
          <Typography variant="h4" gutterBottom color="error">
            Danger Zone
          </Typography>
          <Divider sx={{ my: 3 }} />
          <Typography variant="body1" color="text.secondary" paragraph>
            Permanently delete your account and all associated data. This action cannot be undone.
          </Typography>
          <Button variant="outlined" color="error">
            Delete Account
          </Button>
        </Paper>
      </Stack>
    </Box>
  );
}
