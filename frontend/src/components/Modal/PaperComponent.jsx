import { forwardRef, useState } from 'react';
import { Paper } from '@mui/material';
import Draggable from 'react-draggable';
import { Resizable } from 'react-resizable';

const PaperComponent = forwardRef((props, ref) => {
  const [size, setSize] = useState({ width: 400, height: props.height ?? 400 });

  const onResize = (event, { size }) => {
    setSize(size);
  };

  return (
    <Draggable handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"], [class*="react-resizable-handle"]'}>
      <Resizable width={size.width} height={size.height} onResize={onResize} minConstraints={[300, 200]} maxConstraints={[800, 600]}>
        <Paper ref={ref} {...props} style={{ width: size.width, height: size.height, overflow: 'auto' }} />
      </Resizable>
    </Draggable>
  );
});

export default PaperComponent;
