/*eslint-disable*/
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import React from 'react';
import { makeStyles } from '@mui/styles';
import WarningIcon from '@mui/icons-material/Warning';
import useStore from '../../Zustand/store';
import { shallow } from 'zustand/shallow';

const useStyles = makeStyles((theme) => ({
  MenuItem: {
    fontSize: '15px',
    fontWeight: 600,
    gap: 3,
    color: '#000'
  }
}));

const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges
});

const SaveModal = ({ open, handleClose, handleSave }) => {
  const { nodes, edges } = useStore(selector, shallow);
  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: { width: 400, borderRadius: 3, padding: 2 }
        }}
        aria-labelledby="save-dialog-title"
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="warning" />
          <Typography variant="h4" fontWeight="bold">
            Unsaved Changes
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Typography variant="body1" color="text.primary">
            You have made changes. Do you want to save them before exiting?
          </Typography>
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'flex-end', padding: 2 }}>
          <Button onClick={handleClose} variant="outlined" color="error">
            Discard
          </Button>
          <Button onClick={() => handleSave({ nodes, edges })} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SaveModal;
