import React from 'react';
import { Popper, Paper, Typography, Button, ClickAwayListener } from '@mui/material';

const AutoSavePopper = ({ open, anchorRef, handleClose, handleSave }) => {
  //   const [open, setOpen] = useState(false);
  //   const anchorRef = useRef(null);

  //   const handleToggle = () => {
  //     setOpen((prev) => !prev);
  //   };

  //   const handleClose = () => {
  //     setOpen(false);
  //   };

  const handleAutoSaveChoice = () => {
    handleSave();
    handleClose();
  };

  return (
    <div>
      <Popper open={open} anchorEl={anchorRef.current} placement="bottom-start" disablePortal>
        <ClickAwayListener onClickAway={handleClose}>
          <Paper sx={{ p: 2, maxWidth: 250 }}>
            <Typography variant="subtitle1">Do you want to save the changes?</Typography>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <Button variant="contained" size="small" onClick={handleAutoSaveChoice}>
                Yes
              </Button>
              <Button variant="outlined" size="small" onClick={handleClose}>
                No
              </Button>
            </div>
          </Paper>
        </ClickAwayListener>
      </Popper>
    </div>
  );
};

export default AutoSavePopper;
