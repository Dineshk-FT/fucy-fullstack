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
  addAttackScene: state.addAttackScene
});

export default function Event(props) {
  const { update, model, addAttackScene, getAttackScenario, attacks } = useStore(selector, shallow);
  const [inputValue, setInputValue] = useState(props.data.label);
  const [openDialog, setOpenDialog] = useState(false);  // State to control the dialog visibility

  // Open the dialog on double-click
  const handleOpenDialog = (e) => {
    e.preventDefault();
    setOpenDialog(true);  // Show the dialog
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);  // Close the dialog
  };

  const handleClick = () => {
    const details = {
      modelId: model?._id,
      type: 'attack',
      attackId: props.id,
      name: inputValue
    };
    addAttackScene(details).then((res) => {
      if (res) {
        getAttackScenario(model?._id);
        setOpenDialog(false);  // Close dialog on successful conversion
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

  const calculateMinWidth = (text) => {
    // Adjust multiplier and base width to suit your design
    const baseWidth = 50;
    return baseWidth + text.length;
  };

  const minWidth = calculateMinWidth(inputValue);

  return (
    <>
      <NodeResizer lineStyle={{ backgroundColor: bgColor, borderWidth: '2px' }} minWidth={minWidth} minHeight={60} />
      <Handle type="target" position={Position.Top} />
      <Box
        onDoubleClick={handleOpenDialog}  // Open the dialog on double-click
        display="flex"
        alignItems="center"
        sx={{
          p: 2,
          color: 'gray',
          position: 'relative',
          minWidth: minWidth,
          maxWidth: '100%', // Ensures it doesn't overflow the container
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
            fontWeight: 600
          }}
        >
          {props?.id?.slice(0, 5)}
        </Typography>
        <input
          variant="outlined"
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            update(props?.id, e.target.value);
          }}
          style={{
            width: `${Math.max(inputValue.length * 10, minWidth)}px`, // Dynamically adjust width
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '4px',
            textAlign: 'center',
            outline: 'none',
            padding: 0, // Removes padding
            marginTop: '15px',
            fontSize: '1rem', // Matches Typography size
            color: 'inherit' // Inherits text color
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
