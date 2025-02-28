import * as React from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Box,
  TextField,
  Slide
} from '@mui/material';
import useStore from '../../Zustand/store';
import { shallow } from 'zustand/shallow';
import toast, { Toaster } from 'react-hot-toast';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const selector = (state) => ({
  updateModelName: state.updateModelName,
  model: state.model,
  getModels: state.getModels
});

export default function RenameProject({ open, handleClose, Models }) {
  const { updateModelName, model, getModels } = useStore(selector, shallow);
  const notify = (message, status) => toast[status](message);

  // State for the new name, initialized with the current model name
  const [newName, setNewName] = React.useState('');

  // Sync newName with model.name when model changes or dialog opens
  React.useEffect(() => {
    setNewName(model?.name || '');
  }, [model, open]);

  // Handle input change
  const handleInputChange = (e) => {
    setNewName(e.target.value);
  };

  // Handle rename button click
  const handleRename = () => {
    if (!newName) {
      notify('New name is required', 'error');
      return;
    }

    const existingModel = Models.find((m) => m.id === model?.id); // Check based on ID
    if (!existingModel) {
      notify('Model not found', 'error');
      return;
    }

    // Call updateModelName with specified parameters
    updateModelName({ 'model-id': model?._id, name: newName })
      .then((res) => {
        if (res) {
          notify('Model renamed successfully', 'success');
          getModels(); // Refresh models in the store
          window.location.reload(); // Refresh the page
          handleClose(); // Close dialog
        } else {
          notify('Rename failed', 'error');
        }
      })
      .catch(() => notify('An error occurred', 'error'));
  };

  return (
    <React.Fragment>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle sx={{ fontSize: 18, fontFamily: 'Inter', pb: 0 }}>{'Rename Project'}</DialogTitle>
        <DialogTitle sx={{ fontSize: 14, fontFamily: 'italic', pt: 0, pb: 1 }}>
          {'Provide the new name for your project.'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, my: 1 }}>
              {/* Current Name (Disabled) */}
              <TextField
                value={model?.name || ''}
                id="current-name"
                label="Current Name"
                variant="outlined"
                disabled
                sx={{ width: '300px' }}
              />
              {/* New Name (Editable by default) */}
              <TextField
                value={newName}
                id="new-name"
                label="New Name"
                variant="outlined"
                onChange={handleInputChange}
                autoFocus // Automatically focus on this field when dialog opens
                sx={{ width: '300px' }}
              />
            </Box>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" color="error" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleRename}>
            Rename
          </Button>
        </DialogActions>
      </Dialog>
      <Toaster position="top-right" reverseOrder={false} />
    </React.Fragment>
  );
}