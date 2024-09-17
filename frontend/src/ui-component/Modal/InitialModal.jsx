/*eslint-disable*/
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, MenuItem, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CloseInitialDialog } from '../../store/slices/CanvasSlice';
import { makeStyles } from '@mui/styles';
import SelectProject from './SelectProject';
import AddModal from './AddModal';
import useStore from '../../Zustand/store';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import PaperComponent from './PaperComponent';

const useStyles = makeStyles((theme) => ({
  MenuItem: {
    fontSize: '15px',
    fontWeight: 600,
    gap: 3
  }
}));

const selector = (state) => ({
  Modals: state.Modals,
  getModals: state.getModals
});

const InitialModal = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { Modals, getModals } = useStore(selector);
  const [open, setOpen] = useState({
    New: false,
    Open: false
  });
  const { initialDialogOpen } = useSelector((state) => state?.canvas);

  const onClose = () => {
    dispatch(CloseInitialDialog());
  };

  const handleClose = () => {
    setOpen({
      New: false,
      Open: false
    });
    onClose();
  };
  const handleClick = (name) => {
    setOpen((state) => ({
      ...state,
      [`${name}`]: true
    }));
  };

  return (
    <>
      <Dialog open={initialDialogOpen} onClose={onClose} PaperComponent={PaperComponent} aria-labelledby="draggable-dialog-title">
        <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
          <Typography variant="h4" color="primary">
            Project Menu
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            <MenuItem className={classes.MenuItem} onClick={() => handleClick('Open')}>
              <ArrowRightAltIcon color="dark" /> Open Existing Project
            </MenuItem>
            <MenuItem className={classes.MenuItem} onClick={() => handleClick('New')}>
              <ArrowRightAltIcon color="dark" /> Add a New Project
            </MenuItem>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={onClose} variant="outlined" color="error">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      {open?.Open && <SelectProject open={open?.Open} handleClose={handleClose} Modals={Modals} />}
      {open?.New && <AddModal getModals={getModals} open={open?.New} handleClose={handleClose} />}
    </>
  );
};

export default InitialModal;
