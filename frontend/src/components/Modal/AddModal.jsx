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
import { useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import useStore from '../../store/Zustand/store';
import { closeAll } from '../../store/slices/CurrentIdSlice';
import { setModelId } from '../../store/slices/PageSectionSlice';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const selector = (state) => ({
  create: state.createModel,
});

export default React.memo(function AddModel({ open, handleClose, getModels }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userDetails } = useSelector((state) => state?.userDetails);
  const { create } = useStore(selector, shallow);
  const [templateDetails, setTemplateDetails] = useState({ name: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback((e) => {
    setTemplateDetails((prev) => ({ ...prev, name: e.target.value }));
  }, []);

  const handleCreate = useCallback(() => {
    if (!templateDetails.name.trim()) {
      toast.error('Name is required');
      return;
    }

    setLoading(true);
    const newModel = { name: templateDetails.name.trim() };

    create(newModel, userDetails?.username)
      .then((res) => {
        if (res) {
          toast.success(res.message ?? 'Model created successfully');
          navigate(`/Models/${res?.model_id}`);
          dispatch(setModelId(res?.model_id));
          dispatch(closeAll());
          getModels();
          handleClose();
          setTemplateDetails({ name: '' });
        }
      })
      .catch(() => {
        toast.error('Something went wrong');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [create, userDetails?.username, navigate, dispatch, getModels, handleClose, templateDetails]);

  return (
    <>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-labelledby="add-model-dialog-title"
        aria-describedby="add-model-dialog-description"
        maxWidth="sm"
        sx={{
          '& .MuiPaper-root': {
            width: '475px',
            borderRadius: '8px',
          },
        }}
      >
        <DialogTitle sx={{ fontSize: 18, fontFamily: 'Inter', pb: 0 }}>
          Add Project
        </DialogTitle>
        <DialogTitle sx={{ fontSize: 14, fontStyle: 'italic', pt: 0, pb: 1 }}>
          Name of your project to create a new model.
        </DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          <DialogContentText id="add-model-dialog-description">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <FormLabel sx={{ fontWeight: 600, mb: 1 }} required>
                  Name
                </FormLabel>
                <TextField
                  name="name"
                  value={templateDetails.name}
                  onChange={handleChange}
                  variant="outlined"
                  placeholder="Enter project name"
                  size="small"
                  fullWidth
                  required
                  aria-label="Project name"
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
            disabled={loading || !templateDetails.name.trim()}
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