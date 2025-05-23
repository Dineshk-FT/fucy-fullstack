import React, { useCallback, useState } from 'react';
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
  FormLabel,
} from '@mui/material';
import { shallow } from 'zustand/shallow';
import toast, { Toaster } from 'react-hot-toast';
import useStore from '../../store/Zustand/store';
import ColorTheme from '../../themes/ColorTheme';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const selector = (state) => ({
  create: state.createComponent,
  getSidebarNode: state.getSidebarNode,
});

export default React.memo(function AddNewComponentLibrary({ open, handleClose }) {
  const color = ColorTheme();
  const { create, getSidebarNode } = useStore(selector, shallow);
  const [templateDetails, setTemplateDetails] = useState({ Name: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback((e) => {
    setTemplateDetails((prev) => ({ ...prev, Name: e.target.value }));
  }, []);

  const handleCreate = useCallback(() => {
    if (!templateDetails.Name.trim()) {
      toast.error('Name is required');
      return;
    }

    setLoading(true);
    create({ Name: templateDetails.Name.trim() })
      .then((res) => {
        if (res) {
          toast.success('Created successfully');
          getSidebarNode();
          setTemplateDetails({ Name: '' });
          handleClose();
        }
      })
      .catch(() => {
        toast.error('Something went wrong');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [create, getSidebarNode, templateDetails, handleClose]);

  return (
    <>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-labelledby="add-component-library-dialog-title"
        aria-describedby="add-component-library-dialog-description"
        maxWidth="sm"
        sx={{
          '& .MuiPaper-root': {
            background: color?.modalBg,
            width: '475px',
            borderRadius: '8px',
          },
        }}
      >
        <DialogTitle sx={{ fontSize: 18, fontFamily: 'Inter' }}>
          Add Component Library
        </DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          <DialogContentText id="add-component-library-dialog-description">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <FormLabel sx={{ fontWeight: 600, color: color?.title, mb: 1 }} required>
                  Name
                </FormLabel>
                <TextField
                  name="Name"
                  value={templateDetails.Name}
                  onChange={handleChange}
                  variant="outlined"
                  placeholder="Enter component name"
                  size="small"
                  fullWidth
                  required
                  aria-label="Component name"
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
            onClick={handleCreate}
            disabled={loading || !templateDetails.Name.trim()}
            sx={{ textTransform: 'none', minWidth: '80px' }}
            startIcon={loading && <CircularProgress size={16} />}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
      <Toaster position="top-right" reverseOrder={false} />
    </>
  );
});