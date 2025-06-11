import React, { useCallback, useEffect, useState } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Box,
  TextField,
  Slide,
  CircularProgress,
  FormLabel
} from '@mui/material';
import { shallow } from 'zustand/shallow';
import toast, { Toaster } from 'react-hot-toast';
import useStore from '../../store/Zustand/store';
import ColorTheme from '../../themes/ColorTheme';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const selector = (state) => ({
  updateModelName: state.updateModelName,
  model: state.model,
  getModels: state.getModels
});

export default React.memo(function RenameProject({ open, handleClose, Models }) {
  const color = ColorTheme();
  const { updateModelName, model, getModels } = useStore(selector, shallow);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setNewName(model?.name || '');
  }, [model, open]);

  const handleInputChange = useCallback((e) => {
    setNewName(e.target.value);
  }, []);

  const handleRename = useCallback(
    (e) => {
      if (!newName.trim()) {
        toast.error('New name is required');
        return;
      }

      if (newName.trim() === model?.name) {
        toast.error('New name must be different');
        return;
      }

      const existingModel = Models.find((m) => m.id === model?.id);
      if (!existingModel) {
        toast.error('Model not found');
        return;
      }

      setLoading(true);
      updateModelName({ 'model-id': model?._id, name: newName.trim() })
        .then((res) => {
          if (res) {
            toast.success('Model renamed successfully');
            getModels();
            handleClose(e);
          } else {
            toast.error('Rename failed');
          }
        })
        .catch(() => {
          toast.error('An error occurred');
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [updateModelName, model, getModels, newName, Models, handleClose]
  );

  return (
    <>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-labelledby="rename-project-dialog-title"
        aria-describedby="rename-project-dialog-description"
        maxWidth="sm"
        sx={{
          '& .MuiPaper-root': {
            background: color?.modalBg,
            width: '475px',
            borderRadius: '8px'
          }
        }}
      >
        <DialogTitle sx={{ fontSize: 18, fontFamily: 'Inter', p: 2 }}>Rename Project</DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          <DialogContentText id="rename-project-dialog-description">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <FormLabel sx={{ fontWeight: 600, color: color?.title, mb: 1 }}>Current Name</FormLabel>
                <TextField
                  value={model?.name || ''}
                  variant="outlined"
                  size="small"
                  fullWidth
                  disabled
                  aria-label="Current project name"
                  sx={{ bgcolor: color?.inputBg }}
                />
              </Box>
              <Box>
                <FormLabel sx={{ fontWeight: 600, color: color?.title, mb: 1 }} required>
                  New Name
                </FormLabel>
                <TextField
                  value={newName}
                  onChange={handleInputChange}
                  variant="outlined"
                  placeholder="Enter new project name"
                  size="small"
                  fullWidth
                  autoFocus
                  required
                  aria-label="New project name"
                  sx={{ bgcolor: color?.inputBg }}
                />
              </Box>
            </Box>
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            variant="outlined"
            color="error"
            onClick={handleClose}
            disabled={loading}
            sx={{ textTransform: 'none', minWidth: '80px' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleRename}
            disabled={loading || !newName.trim() || newName.trim() === model?.name}
            sx={{ textTransform: 'none', minWidth: '80px' }}
            startIcon={loading && <CircularProgress size={16} />}
          >
            Rename
          </Button>
        </DialogActions>
      </Dialog>
      <Toaster position="top-right" reverseOrder={false} />
    </>
  );
});
