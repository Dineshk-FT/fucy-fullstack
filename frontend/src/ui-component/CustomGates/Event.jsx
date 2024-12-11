/*eslint-disable*/
import React, { useCallback, useState } from 'react';
import { Handle, Position, NodeResizer } from 'reactflow';
import useStore from '../../Zustand/store';
import { shallow } from 'zustand/shallow';
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, Typography } from '@mui/material';
import { RatingColor } from '../Table/constraints';

const selector = (state) => ({
  update: state.updateAttackNode,
  getAttackScenario: state.getAttackScenario,
  model: state.model,
  attacks: state.attackScenarios['subs'][0],
  addAttackScene: state.addAttackScene,
});

export default function Event(props) {
  const { update, model, addAttackScene, getAttackScenario, attacks } = useStore(selector, shallow);
  const [inputValue, setInputValue] = useState(props.data.label);
  const [openDialog, setOpenDialog] = useState(false);
  const [nodeDimensions, setNodeDimensions] = useState({ width: 150, height: 60 }); // Default node dimensions

  // Open the dialog on double-click
  const handleOpenDialog = (e) => {
    e.preventDefault();
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleClick = () => {
    const details = {
      modelId: model?._id,
      type: 'attack',
      attackId: props.id,
      name: inputValue,
    };
    addAttackScene(details).then((res) => {
      if (res) {
        getAttackScenario(model?._id);
        setOpenDialog(false);
      }
    });
  };

  const getBgColor = useCallback(() => {
    const color = attacks?.scenes?.find((sub) => sub?.ID === props?.id || sub?.ID === props?.data?.nodeId);
    if (color) {
      return RatingColor(color['Attack Feasibilities Rating']);
    } else {
      return 'grey';
    }
  }, [attacks, props?.id, props?.data?.nodeId]);

  const bgColor = getBgColor();

  // Calculate font size dynamically based on node dimensions
  const calculateFontSize = () => {
    const baseFontSize = 14; // Base font size
    return Math.max(baseFontSize, (nodeDimensions.width + nodeDimensions.height) / 15);
  };

  const fontSize = calculateFontSize();
  const inputPadding = 5; // Padding inside the input box

  return (
    <>
      <NodeResizer
        lineStyle={{ backgroundColor: bgColor, borderWidth: '2px' }}
        minWidth={100}
        minHeight={60}
        onResize={(event, params) => {
          setNodeDimensions({ width: params.width, height: params.height });
        }}
      />
      <Handle type="target" position={Position.Top} />
      <Box
        onDoubleClick={handleOpenDialog}
        display="flex"
        alignItems="center"
        justifyContent="center"
        sx={{
          p: 2,
          color: 'gray',
          position: 'relative',
          minWidth: `${nodeDimensions.width}px`,
          minHeight: `${nodeDimensions.height}px`,
          maxWidth: '100%',
          height: 'inherit',
          width: 'inherit',
        }}
      >
        <Typography
          variant="body2"
          sx={{
            position: 'absolute',
            top: 4,
            left: 4,
            backgroundColor: '#000',
            color: '#fff',
            borderRadius: '12px',
            padding: '2px 8px',
            fontSize: '10px',
            fontWeight: 600,
          }}
        >
          {props?.id?.slice(0, 5)}
        </Typography>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            update(props?.id, e.target.value);
          }}
          style={{
            width: `${nodeDimensions.width - 20}px`, // Adjust width relative to node size
            height: `${fontSize * 2}px`, // Height proportional to font size
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '4px',
            textAlign: 'center',
            outline: 'none',
            fontSize: `${fontSize}px`, // Dynamically adjust font size
            color: 'inherit',
            padding: `${inputPadding}px`, // Consistent padding
            border: '1px solid #ccc',
          }}
        />
      </Box>

      <Handle type="source" position={Position.Bottom} />

      {/* Dialog for converting to Attack */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Convert to Attack</DialogTitle>
        <DialogContent>
          <Typography variant="body1">Are you sure you want to convert this node to an attack?</Typography>
          <TextField
            label="Attack Name"
            variant="outlined"
            fullWidth
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleClick} color="primary">
            Convert
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
