/*eslint-disable*/
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import React from 'react';
import { makeStyles } from '@mui/styles';
import PaperComponent from './PaperComponent';

const useStyles = makeStyles((theme) => ({
  MenuItem: {
    fontSize: '15px',
    fontWeight: 600,
    gap: 3,
    color: '#000'
  }
}));

const SaveModal = ({ open, handleClose, handleSave }) => {
  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        PaperComponent={(props) => <PaperComponent {...props} height="fit-content" />}
        aria-labelledby="draggable-dialog-title"
      >
        <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
          <Typography variant="h4" color="primary">
            You made some changes, Do you want to save them ?
          </Typography>
        </DialogTitle>
        <DialogContent></DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="outlined" color="error">
            Close
          </Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SaveModal;
