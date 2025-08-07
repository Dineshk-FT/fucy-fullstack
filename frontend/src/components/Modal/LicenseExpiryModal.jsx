import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import { clearLicenseWarning } from '../../store/slices/UserDetailsSlice';

const LicenseExpiryModal = () => {
  const dispatch = useDispatch();
  const licenseWarning = useSelector((state) => {
    console.log('Redux state changed:', state.userDetails);
    return state.userDetails.licenseWarning || { show: false, message: '' };
  });
  
  console.log('LicenseExpiryModal - Current licenseWarning state:', licenseWarning);
  
  // Log when component re-renders
  React.useEffect(() => {
    console.log('LicenseExpiryModal - Component rendered with:', { licenseWarning });
  }, [licenseWarning]);

  const handleClose = () => {
    console.log('Closing license warning modal');
    dispatch(clearLicenseWarning());
  };

  if (!licenseWarning.show || !licenseWarning.message) {
    console.log('LicenseExpiryModal - Not showing: show=', licenseWarning.show, 'message=', licenseWarning.message);
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
