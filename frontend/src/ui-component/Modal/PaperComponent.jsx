import { useState } from 'react';
import { Paper } from '@mui/material';
import Draggable from 'react-draggable';
import { Resizable } from 'react-resizable';

export default function PaperComponent(props) {
  const [size, setSize] = useState({ width: 400, height: 400 });

  const onResize = (event, { size }) => {
    setSize(size);
  };

  return (
    <Draggable handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"], [class*="react-resizable-handle"]'}>
      <Resizable width={size.width} height={size.height} onResize={onResize} minConstraints={[300, 200]} maxConstraints={[800, 600]}>
        <Paper {...props} style={{ width: size.width, height: size.height, overflow: 'auto' }} />
      </Resizable>
    </Draggable>
  );
}
