import React, { forwardRef, useState } from 'react';
import { Paper } from '@mui/material';
import Draggable from 'react-draggable';
import { Resizable } from 'react-resizable';
import ColorTheme from '../../themes/ColorTheme';

const PaperComponent = forwardRef(({ height = 400, ...props }, ref) => {
  const color = ColorTheme();
  const [size, setSize] = useState({ width: 475, height });

  const onResize = (event, { size: newSize }) => {
    setSize(newSize);
  };

  return (
    <Draggable
      handle="#draggable-dialog-title"
      cancel={'[class*="MuiDialogContent-root"], [class*="react-resizable-handle"]'}
    >
      <Resizable
        width={size.width}
        height={size.height}
        onResize={onResize}
        minConstraints={[300, 200]}
        maxConstraints={[800, 600]}
      >
        <Paper
          ref={ref}
          {...props}
          sx={{
            width: size.width,
            height: size.height,
            overflow: 'auto',
            bgcolor: color?.modalBg,
            borderRadius: '8px',
          }}
        />
      </Resizable>
    </Draggable>
  );
});

export default React.memo(PaperComponent);