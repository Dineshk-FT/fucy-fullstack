/*eslint-disable*/
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import useStore from '../../Zustand/store';
import { shallow } from 'zustand/shallow';
import { Box, Menu, MenuItem, TextField } from '@mui/material';
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
  const [anchorEl, setAnchorEl] = useState(null);
  const openRight = Boolean(anchorEl);

  const handleOpenModal = (e) => {
    e.preventDefault();
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
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
      }
    });
  };

  const getBgColor = useCallback(() => {
    const color = attacks?.scenes?.find((sub) => sub?.ID === props?.id || sub?.ID === props?.data?.nodeId);
    if (color) {
      return RatingColor(color['Attack Feasibilities Rating']);
    } else {
      return 'gray';
    }
  }, []);

  const bgColor = getBgColor();

  // console.log('bgColor', bgColor);

  const handleChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    update(props?.id, value);
  };

  return (
    <>
      <Handle type="target" position={Position.Top} />
      <Box display="flex" flexDirection="column" alignItems="center">
        <Box
          onContextMenu={handleOpenModal}
          display="flex"
          alignItems="center"
          sx={{ p: 2, border: `1px solid ${bgColor}`, minWidth: 100, color: 'gray' }}
        >
          <TextField
            value={inputValue}
            onChange={handleChange}
            variant="outlined"
            fullWidth
            sx={{
              '& fieldset': {
                border: 'none'
              }
            }}
          />
        </Box>

        {/* {props?.id?.slice(0, 5)} */}
      </Box>
      <Handle type="source" position={Position.Bottom} />
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={openRight}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button'
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
      >
        <MenuItem onClick={handleClick}>Convert to Attack</MenuItem>
      </Menu>
    </>
  );
}
