/* eslint-disable */
import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import useStore from '../../Zustand/store';
import AddIcon from '@mui/icons-material/Add';
import AddNewNode from '../../ui-component/Modal/AddNewNode';
import { Avatar, Button, Typography } from '@mui/material';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import ColorTheme from '../../store/ColorTheme';
import { makeStyles } from '@mui/styles';
import AddNewComponentLibrary from '../../ui-component/Modal/AddNewComponentLibrary';

const useStyles = makeStyles(() => ({
  paper: {
    // color: '#1d97fc',
    // padding: '5px',
    // border: '1px solid #1e88e5',
    // boxShadow: '0px 0px 4px 2px #90caf9'
    pointerEvents: 'auto',
    background: '#E5E4E2',
    border: '1px solid',
    borderRadius: 0,
    marginLeft: '1.0rem',
    zIndex: 1300
  }
}));

const selector = (state) => ({
  sidebarNodes: state.sidebarNodes,
  getSidebarNode: state.getSidebarNode,
  deleteNode: state.deleteNode
  // getComponent: state.getComponent
});

const Components = () => {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState({});
  const { sidebarNodes, getSidebarNode } = useStore(selector);
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

  useEffect(() => {
    getSidebarNode();
  }, []);

  const handleOpen = (item) => {
    setOpen(true);
    setSelectedItem(item);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedItem({});
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
            <Avatar {...stringAvatar(item?.name)} variant="rounded" sx={{ width: 56, height: 56 }} />
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
                      <MenuList autoFocusItem={openModal}>
                        {item?.nodes?.map((node) => (
                          <MenuItem draggable onDragStart={(event) => onDragStart(event, node)} key={node?.id} onClick={handleMouseLeave}>
                            {node?.data['label']}
                          </MenuItem>
                        ))}
                        {/* <MenuItem>
                          <Button onClick={() => handleOpen(item)} variant="outlined" fullWidth>
                            + Add
                          </Button>
                        </MenuItem> */}
                      </MenuList>
                    </ClickAwayListener>
                  </Paper>
                </Grow>
              )}
            </Popper>
          </Box>
        ))}
        {/* <AddIcon sx={{ fontSize: 20, color: 'blue', cursor: 'pointer' }} onClick={() => setOpenAdd(true)} /> */}
      </Box>
      <AddNewNode open={open} handleClose={handleClose} getSidebarNode={getSidebarNode} selectedItem={selectedItem} />
      <AddNewComponentLibrary open={openAdd} handleClose={() => setOpenAdd(false)} />
    </>
  );
};

export default Components;
