import { DialogTitle, Typography } from '@mui/material';
import React from 'react';

const DialogCommonTitle = ({ icon, title }) => {
  return (
    <>
      <DialogTitle id="draggable-dialog-title" display="flex" alignItems="center" gap={1}>
        <img src={icon} alt="damage" height="20px" width="20px" />
        <Typography color="primary" sx={{ fontSize: 16, fontWeight: 700 }}>
          {title}
        </Typography>
      </DialogTitle>
    </>
  );
};

export default DialogCommonTitle;
