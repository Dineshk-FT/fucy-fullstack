import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import useStore from '../../Zustand/store';
import { shallow } from 'zustand/shallow';
import { Box, Menu, MenuItem, TextField } from '@mui/material';

const selector = (state) => ({
  update: state.updateAttackNode,
  getModels: state.getModels,
  model: state.model,
  updateModel: state.updateModel
});

export default function Event(props) {
  const { update, model, updateModel, getModels } = useStore(selector, shallow);
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
    const mod = { ...model };
    const Scene = mod?.scenarios[3]?.subs[0]?.scenes;
    const selected = mod?.scenarios[3]?.subs[0]?.scenes.find((item) => item.id === props?.id);
    if (!selected) {
      Scene.push({ id: props.id, name: inputValue });
      console.log('mod', mod);
      updateModel(mod).then((res) => {
        if (res) {
          getModels();
        }
      });
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    update(props?.id, value);
  };

  return (
    <>
      <Handle type="target" position={Position.Top} />
      <Box onContextMenu={handleOpenModal} sx={{ p: 2, border: '1px dashed grey', minWidth: 100, color: 'gray' }}>
        <TextField value={inputValue} onChange={handleChange} variant="outlined" fullWidth />
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
