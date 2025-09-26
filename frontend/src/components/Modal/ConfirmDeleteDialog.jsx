import React, { useCallback } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Divider, Typography, Box } from '@mui/material';
import { WarningAmber as WarningIcon } from '@mui/icons-material';
import ColorTheme from '../../themes/ColorTheme';

export default React.memo(function ConfirmDeleteDialog({ open, onClose, onConfirm, name, mode }) {
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
      maxWidth="xs"
      sx={{
        '& .MuiPaper-root': {
          background: color?.modalBg,
          width: 420,
          borderRadius: '12px',
          boxShadow: '0px 8px 24px rgba(0,0,0,0.15)'
        }
      }}
    >
      <DialogTitle
        id="confirm-delete-dialog-title"
        sx={{
          fontSize: 20,
          fontWeight: 600,
          fontFamily: 'Inter',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          color: color?.title
        }}
      >
        <WarningIcon sx={{ color: 'error.main', fontSize: 26 }} />
        Confirm {mode === 'clear' ? 'Clear' : 'Delete'}
      </DialogTitle>

      <Divider sx={{ borderBottomWidth: 2, borderColor: color?.border || 'divider' }} />

      <DialogContent sx={{ py: 3, px: 3 }}>
        <Typography variant="body1" sx={{ color: color?.sidebarContent, fontSize: 15 }}>
          Are you sure you want to{' '}
          <Box component="span" sx={{ fontWeight: 600, color: color?.title }}>
            {mode === 'clear' ? 'clear' : 'delete'} {name}
          </Box>
          ? This action cannot be undone.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1.5 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          color="inherit"
          sx={{
            textTransform: 'none',
            minWidth: 90,
            borderColor: color?.border || 'grey.400',
            '&:hover': { backgroundColor: 'grey.100' }
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          color="error"
          variant="contained"
          sx={{
            textTransform: 'none',
            minWidth: 90,
            fontWeight: 500,
            boxShadow: 'none',
            '&:hover': { backgroundColor: 'error.dark' }
          }}
        >
          {mode === 'clear' ? 'Clear' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
});
