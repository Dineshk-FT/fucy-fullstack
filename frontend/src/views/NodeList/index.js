/* eslint-disable */
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import useStore from '../../Zustand/store';
import AddIcon from '@mui/icons-material/Add';
import { Avatar, Button, Fab, Typography } from '@mui/material';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import ColorTheme from '../../store/ColorTheme';
import { makeStyles } from '@mui/styles';
import AddNewComponentLibrary from '../../ui-component/Modal/AddNewComponentLibrary';
import { drawerOpen } from '../../store/slices/CurrentIdSlice';
import { useDispatch } from 'react-redux';
import { setSelectedNodeGroupId } from '../../store/slices/PageSectionSlice';
import { openAddNodeTab } from '../../store/slices/CanvasSlice';

const useStyles = makeStyles(() => ({
  paper: {
    marginLeft: '1.7rem',
    zIndex: 1400,
    pointerEvents: 'auto',
    background: '#f5f5f5',
    border: '1px solid #d1d1d1',
    borderRadius: '8px',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
    padding: '8px',
    minWidth: '150px',
    maxHeight: '300px',
    overflowY: 'auto',
    '&::-webkit-scrollbar': {
      width: '4px'
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      borderRadius: '10px'
    },
    '&::-webkit-scrollbar-track': {
      background: 'rgba(0, 0, 0, 0.1)'
    }
  }
}));

const selector = (state) => ({
  sidebarNodes: state.sidebarNodes,
  getSidebarNode: state.getSidebarNode
});

const Components = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [openModal, setOpenModal] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { sidebarNodes } = useStore(selector);
  const color = ColorTheme();

  const [hoveredItem, setHoveredItem] = useState(null);

  const handleMouseEnter = (event, item) => {
    setHoveredItem(item);
    setAnchorEl(event.currentTarget);
    setOpenModal(true);
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
    setOpenModal(false);
    setAnchorEl(null);
  };

  const onDragStart = (event, item) => {
    const parseFile = JSON.stringify(item);
    event.dataTransfer.setData('application/parseFile', parseFile);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleOpen = (item) => {
    // console.log('item', item);
    // dispatch(drawerOpen());
    dispatch(openAddNodeTab());
    dispatch(setSelectedNodeGroupId(item?._id));
  };

  function stringAvatar(name) {
    const nameParts = name.split(' ');
    const initials =
      nameParts.length > 1 ? `${nameParts[0][0].toUpperCase()}${nameParts[1][0].toUpperCase()}` : `${nameParts[0][0].toUpperCase()}`;
    return { children: initials };
  }

  return (
    <>
      <Box
        component="nav"
        aria-label="sidebar"
        sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, overflowX: 'hidden' }}
      >
        {sidebarNodes?.map((item, i) => (
          <Box
            key={i}
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap={1}
            onMouseEnter={(e) => handleMouseEnter(e, item)}
            onMouseLeave={handleMouseLeave}
          >
            <Avatar
              {...stringAvatar(item?.name)}
              variant="rounded"
              sx={{
                width: 56,
                height: 56,
                '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.1)' }
              }}
            />
            <Typography variant="h6" color={'#1d97fc'}>
              {item?.name}
            </Typography>
            <Popper open={openModal && hoveredItem === item} anchorEl={anchorEl} placement="right-start" transition disablePortal={false}>
              {({ TransitionProps }) => (
                <Grow
                  {...TransitionProps}
                  style={{
                    transformOrigin: 'left top'
                  }}
                >
                  <Paper onMouseLeave={handleMouseLeave} sx={{ backgroundColor: color?.leftbarBG }} className={classes?.paper}>
                    <ClickAwayListener onClickAway={handleMouseLeave}>
                      <MenuList autoFocusItem={openModal} sx={{ height: 'auto', maxHeight: 600, overflow: 'auto' }}>
                        {item?.nodes?.map((node) => (
                          <MenuItem draggable onDragStart={(event) => onDragStart(event, node)} key={node?.id} onClick={handleMouseLeave}>
                            {node?.data['label']}
                          </MenuItem>
                        ))}
                        <MenuItem>
                          <Button sx={{ margin: 0 }} onClick={() => handleOpen(item)} variant="outlined" fullWidth>
                            + Add
                          </Button>
                        </MenuItem>
                      </MenuList>
                    </ClickAwayListener>
                  </Paper>
                </Grow>
              )}
            </Popper>
          </Box>
        ))}
        <Fab
          size="small"
          color="primary"
          variant="outlined"
          aria-label="add"
          onClick={() => setOpenAdd(true)}
          sx={{
            mb: 1.5,
            width: '35px',
            height: '25px',
            background: 'transparent',
            color: '#2196f3',
            border: '2px solid #2196f3',
            '&:hover': {
              color: 'white'
            }
          }}
        >
          <AddIcon />
        </Fab>
        {/* <AddIcon sx={{ fontSize: 20, color: 'blue', cursor: 'pointer', my: 1, border: '1px solid' }} /> */}
      </Box>
      <AddNewComponentLibrary open={openAdd} handleClose={() => setOpenAdd(false)} />
    </>
  );
};

export default Components;
