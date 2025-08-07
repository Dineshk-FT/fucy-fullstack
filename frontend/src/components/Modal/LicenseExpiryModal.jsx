import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import { clearLicenseWarning } from '../../store/slices/UserDetailsSlice';

const LicenseExpiryModal = () => {
  const dispatch = useDispatch();
  const licenseWarning = useSelector((state) => {
    return state.userDetails.licenseWarning || { show: false, message: '' };
  });
    
  const handleClose = () => {
    dispatch(clearLicenseWarning());
  };

  if (!licenseWarning.show || !licenseWarning.message) {
    return null;
  }

  return (
    <Dialog
      open={licenseWarning.show}
      onClose={handleClose}
      aria-labelledby="license-expiry-dialog"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="license-expiry-dialog" sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}>
        License Expiration Notice
      </DialogTitle>
      <DialogContent sx={{ mt: 2, mb: 1 }}>
        <Typography variant="body1">
          {licenseWarning.message}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary" variant="contained">
          I Understand
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LicenseExpiryModal;
