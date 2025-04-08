import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Divider, Typography } from '@mui/material';

const ConfirmDeleteDialog = ({ open, onClose, onConfirm, name }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle variant="h4" color="primary">
        Confirm Deletion
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ display: 'flex' }}>
        Are you sure you want to delete{' '}
        <Typography variant="h5" ml={0.5}>
          {name}
        </Typography>
        ?
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined" color="primary">
          Cancel
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDeleteDialog;
