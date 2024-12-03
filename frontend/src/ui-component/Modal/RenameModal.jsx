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
  rename: state.renameModel,
  model: state.model,
});

export default function RenameProject({ open, handleClose, Models }) {
  const { 
    rename, 
    model 
    } = useStore(selector, shallow);
  const notify = (message, status) => toast[status](message);

  const [renameDetails, setRenameDetails] = React.useState({
    currentName: model.name,
    newName: ''
  });

  const handleRename = () => {
    const { currentName, newName } = renameDetails;

    if (!currentName || !newName) {
      notify('Both fields are required', 'error');
      return;
    }

    const existingModel = Models.find((model) => model.name === currentName);
    if (!existingModel) {
      notify('Model not found', 'error');
      return;
    }

    rename(existingModel.id, newName)
      .then((res) => {
        if (res.success) {
          notify(res.message || 'Model renamed successfully', 'success');
          handleClose();
        } else {
          notify(res.message || 'Rename failed', 'error');
        }
      })
      .catch(() => notify('An error occurred', 'error'));

    setRenameDetails({ currentName: '', newName: '' });
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
        <DialogTitle sx={{ fontSize: 14, fontFamily: 'italic', pt: 0, pb: 1 }}>{'Provide the current and new names for your project.'}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, my: 1 }}>
              <TextField
                value={renameDetails.currentName}
                id="current-name"
                label="Current Name"
                variant="outlined"
                disabled
                onChange={(e) => setRenameDetails({ ...renameDetails, currentName: e.target.value })}
                sx={{ width: '300px' }}
              />
              <TextField
                value={renameDetails.newName}
                id="new-name"
                label="New Name"
                variant="outlined"
                onChange={(e) => setRenameDetails({ ...renameDetails, newName: e.target.value })}
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
