/*eslint-disable*/
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
  getModelById: state.getModelById
});

export default React.memo(function RenameProject({ open, handleClose, Models }) {
  const color = ColorTheme();
  const { updateModelName, model, getModelById } = useStore(selector, shallow);

  const [newName, setNewName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [intro, setIntro] = useState('');
  const [scope, setScope] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setNewName(model?.name || '');
    setPurpose(model?.report_info?.purpose || '');
    setIntro(model?.report_info?.intro || '');
    setScope(model?.report_info?.scope || '');
  }, [model, open]);

  const handleRename = useCallback(
    (e) => {
      if (!newName.trim()) {
        toast.error('New name is required');
        return;
      }

      if (
        newName.trim() === model?.name &&
        purpose === model?.report_info?.purpose &&
        intro === model?.report_info?.intro &&
        scope === model?.report_info?.scope
      ) {
        toast.error('No changes detected');
        return;
      }

      const payload = {
        'model-id': model?._id
      };

      if (newName.trim() !== model?.name) payload.name = newName.trim();
      if (purpose !== model?.report_info?.purpose) payload.purpose = purpose;
      if (intro !== model?.report_info?.intro) payload.intro = intro;
      if (scope !== model?.report_info?.scope) payload.scope = scope;

      setLoading(true);
      updateModelName(payload)
        .then((res) => {
          if (res) {
            toast.success('Model updated successfully');
            getModelById(model?._id);
            handleClose(e);
          } else {
            toast.error('Update failed');
          }
        })
        .catch(() => toast.error('An error occurred'))
        .finally(() => setLoading(false));
    },
    [newName, purpose, intro, scope, model, updateModelName, handleClose, getModelById]
  );

  return (
    <>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        maxWidth="sm"
        sx={{
          '& .MuiPaper-root': {
            background: color?.modalBg,
            width: '475px',
            borderRadius: '8px'
          }
        }}
      >
        <DialogTitle sx={{ fontSize: 18, fontFamily: 'Inter', p: 2 }} color="primary">
          Update Project
        </DialogTitle>

        <DialogContent sx={{ p: 2 }}>
          <DialogContentText>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Current Name
              <Box>
                <FormLabel sx={{ fontWeight: 600 }}>Current Name</FormLabel>
                <TextField value={model?.name || ''} fullWidth size="small" disabled />
              </Box> */}

              {/* New Name */}
              <Box>
                <FormLabel sx={{ fontWeight: 600 }} required>
                  Name
                </FormLabel>
                <TextField
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  fullWidth
                  size="small"
                  placeholder="Enter project name"
                />
              </Box>

              {/* Purpose */}
              <Box>
                <FormLabel sx={{ fontWeight: 600 }}>Purpose</FormLabel>
                <TextField value={purpose} onChange={(e) => setPurpose(e.target.value)} fullWidth size="small" multiline rows={2} />
              </Box>

              {/* Introduction */}
              <Box>
                <FormLabel sx={{ fontWeight: 600 }}>Introduction</FormLabel>
                <TextField value={intro} onChange={(e) => setIntro(e.target.value)} fullWidth size="small" multiline rows={2} />
              </Box>

              {/* Scope */}
              <Box>
                <FormLabel sx={{ fontWeight: 600 }}>Scope</FormLabel>
                <TextField value={scope} onChange={(e) => setScope(e.target.value)} fullWidth size="small" multiline rows={2} />
              </Box>
            </Box>
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} color="error" variant="outlined" disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleRename} variant="contained" disabled={loading} startIcon={loading && <CircularProgress size={16} />}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Toaster position="top-right" />
    </>
  );
});
