import React, { useState } from 'react';
import { Box, TextField, Button, Alert, CircularProgress, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { resetPassword } from '../../../../services/api';
import { useSelector } from 'react-redux';

const ResetPassword = ({ onClose }) => {
  const { userDetails } = useSelector((state) => state?.userDetails);
  const [formData, setFormData] = useState({
    identifier: '',
    org: userDetails?.org || '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setMessage('');
    setError('');
  };

  const handleClickShowPassword = (field) => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field]
    });
  };

  const validateForm = () => {
    if (!formData.identifier || !formData.org || !formData.oldPassword || !formData.newPassword) {
      setError('All fields are required');
      return false;
    }

    if (formData.newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return false;
    }

    if (formData.oldPassword === formData.newPassword) {
      setError('New password must be different from current password');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const result = await resetPassword(formData.identifier, formData.org, formData.oldPassword, formData.newPassword);

      if (result.success) {
        setMessage('Password reset successfully! You can now log in with your new password.');
        // Reset form
        setFormData({
          identifier: '',
          org: '',
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        // Auto close after 2 seconds on success
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
      {message && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        margin="normal"
        required
        fullWidth
        id="identifier"
        label="Email or Username"
        name="identifier"
        autoComplete="username"
        value={formData.identifier}
        onChange={handleChange}
        disabled={loading}
        size="small"
      />

      <TextField
        margin="normal"
        required
        fullWidth
        id="org"
        label="Organization"
        name="org"
        autoComplete="organization"
        value={formData.org}
        onChange={handleChange}
        disabled={loading}
        size="small"
      />

      <TextField
        margin="normal"
        required
        fullWidth
        name="oldPassword"
        label="Current Password"
        type={showPasswords.oldPassword ? 'text' : 'password'}
        id="oldPassword"
        autoComplete="current-password"
        value={formData.oldPassword}
        onChange={handleChange}
        disabled={loading}
        size="small"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle current password visibility"
                onClick={() => handleClickShowPassword('oldPassword')}
                edge="end"
                size="small"
              >
                {showPasswords.oldPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          )
        }}
      />

      <TextField
        margin="normal"
        required
        fullWidth
        name="newPassword"
        label="New Password"
        type={showPasswords.newPassword ? 'text' : 'password'}
        id="newPassword"
        autoComplete="new-password"
        value={formData.newPassword}
        onChange={handleChange}
        disabled={loading}
        size="small"
        helperText="Must be at least 8 characters long"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle new password visibility"
                onClick={() => handleClickShowPassword('newPassword')}
                edge="end"
                size="small"
              >
                {showPasswords.newPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          )
        }}
      />

      <TextField
        margin="normal"
        required
        fullWidth
        name="confirmPassword"
        label="Confirm New Password"
        type={showPasswords.confirmPassword ? 'text' : 'password'}
        id="confirmPassword"
        autoComplete="new-password"
        value={formData.confirmPassword}
        onChange={handleChange}
        disabled={loading}
        size="small"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle confirm password visibility"
                onClick={() => handleClickShowPassword('confirmPassword')}
                edge="end"
                size="small"
              >
                {showPasswords.confirmPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          )
        }}
      />

      <Button type="submit" variant="contained" sx={{ mt: 3, mb: 1, float: 'right' }} disabled={loading} size="small">
        {loading ? (
          <>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            Resetting Password...
          </>
        ) : (
          'Reset Password'
        )}
      </Button>
    </Box>
  );
};

export default ResetPassword;
