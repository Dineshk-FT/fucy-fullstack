/*eslint-disable*/
import React, { useCallback, useState } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  MenuItem,
  Typography,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { shallow } from 'zustand/shallow';
import useStore from '../../store/Zustand/store';
import { CloseInitialDialog } from '../../store/slices/CanvasSlice';
import PaperComponent from './PaperComponent';
import SelectProject from './SelectProject';
import AddModel from './AddModal';
import ColorTheme from '../../themes/ColorTheme';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';

const selector = (state) => ({
  Models: state.Models,
  getModels: state.getModels,
});

export default React.memo(function InitialModal() {
  const color = ColorTheme();
  const dispatch = useDispatch();
  const { Models, getModels } = useStore(selector, shallow);
  const { initialDialogOpen } = useSelector((state) => state?.canvas);
  const [open, setOpen] = useState({
    New: false,
    Open: false,
  });

  const handleClose = useCallback(() => {
    setOpen({ New: false, Open: false });
    dispatch(CloseInitialDialog());
  }, [dispatch]);

  const handleClick = useCallback((name) => {
    setOpen((prev) => ({ ...prev, [name]: true }));
  }, []);

  return (
    <>
      <Dialog
        open={initialDialogOpen}
        onClose={handleClose}
        PaperComponent={(props) => <PaperComponent {...props} height="fit-content" />}
        aria-labelledby="initial-dialog-title"
        maxWidth="sm"
        sx={{
          '& .MuiPaper-root': {
            background: color?.modalBg,
            width: '475px',
            borderRadius: '8px',
          },
        }}
      >
        <DialogTitle id="initial-dialog-title" sx={{ cursor: 'move', fontFamily: 'Inter', fontSize: 18 }}>
          Project Menu
        </DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          <DialogContentText>
            <MenuItem
              onClick={() => handleClick('Open')}
              sx={{
                fontSize: 15,
                fontWeight: 600,
                gap: 1,
                color: color?.title,
                py: 1,
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <ArrowRightAltIcon sx={{ color: color?.iconColor }} />
              Open Existing Project
            </MenuItem>
            <MenuItem
              onClick={() => handleClick('New')}
              sx={{
                fontSize: 15,
                fontWeight: 600,
                gap: 1,
                color: color?.title,
                py: 1,
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <ArrowRightAltIcon sx={{ color: color?.iconColor }} />
              Add a New Project
            </MenuItem>
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={handleClose}
            variant="outlined"
            color="error"
            sx={{ textTransform: 'none', minWidth: '80px' }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
      {open.Open && <SelectProject open={open.Open} handleClose={handleClose} Models={Models} />}
      {open.New && <AddModel getModels={getModels} open={open.New} handleClose={handleClose} />}
    </>
  );
});