import React from 'react';
import { DialogTitle, Typography } from '@mui/material';
import ColorTheme from '../../themes/ColorTheme';

export default React.memo(function DialogCommonTitle({ icon, title }) {
  const color = ColorTheme();

  return (
    <DialogTitle
      id="draggable-dialog-title"
      sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, bgcolor: color?.modalBg }}
    >
      <img src={icon} alt={title} height="18px" width="18px" />
      <Typography sx={{ fontSize: 16, fontWeight: 700, color: color?.title, fontFamily: 'Inter' }}>
        {title}
      </Typography>
    </DialogTitle>
  );
});