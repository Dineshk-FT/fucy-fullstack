import React, { useCallback } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Divider, Typography } from '@mui/material';
import ColorTheme from '../../themes/ColorTheme';

export default React.memo(function ConfirmDeleteDialog({ open, onClose, onConfirm, name }) {
  const color = ColorTheme();

  const handleConfirm = useCallback(() => {
    onConfirm();
    onClose();
  }, [onConfirm, onClose]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="confirm-delete-dialog-title"
      maxWidth="sm"
      sx={{
        '& .MuiPaper-root': {
          background: color?.modalBg,
          width: '475px',
          borderRadius: '8px'
        }
      }}
    >
      <DialogTitle id="confirm-delete-dialog-title" sx={{ fontSize: 18, fontFamily: 'Inter', color: color?.title }}>
        Confirm Deletion
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ display: 'flex', alignItems: 'center', p: 2, color: color?.sidebarContent }}>
        Are you sure you want to delete
        <Typography variant="h4" sx={{ ml: 0.8, color: color?.title }}>
          {name}
        </Typography>
        ?
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" color="primary" sx={{ textTransform: 'none', minWidth: '80px' }}>
          Cancel
        </Button>
        <Button onClick={handleConfirm} color="error" variant="contained" sx={{ textTransform: 'none', minWidth: '80px' }}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
});
