import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Divider } from '@mui/material';

const ConfirmDeleteDialog = ({ open, onClose, onConfirm, type }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle variant="h4" color="primary">
        Confirm Deletion
      </DialogTitle>
      <Divider />
      <DialogContent>Are you sure you want to delete this {type == 'attack' ? 'Attack' : 'Attack Tree'} ?</DialogContent>
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
