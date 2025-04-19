/* eslint-disable */
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import useStore from '../../store/Zustand/store';
import AddIcon from '@mui/icons-material/Add';
import { Avatar, Button, Fab, Typography } from '@mui/material';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import ColorTheme from '../../themes/ColorTheme';
import { makeStyles } from '@mui/styles';
import AddNewComponentLibrary from '../../components/Modal/AddNewComponentLibrary';
import { useDispatch } from 'react-redux';
import { setSelectedNodeGroupId } from '../../store/slices/PageSectionSlice';
import { openAddNodeTab } from '../../store/slices/CanvasSlice';
import { Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

const useStyles = makeStyles(() => ({
  paper: {
    zIndex: 1400,
    pointerEvents: 'auto',
    cursor: 'grab',
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
  sidebarNodes: state.sidebarNodes
});

const Components = ({ openDialog, setOpenDialog }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [openAdd, setOpenAdd] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  const { sidebarNodes } = useStore(selector);
  const color = ColorTheme();

  const handleMouseEnter = (event, item) => {
    setHoveredItem(item);
    setAnchorEl(event.currentTarget);
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
    setAnchorEl(null);
  };

  const onDragStart = (event, item) => {
    const parseFile = JSON.stringify(item);
    event.dataTransfer.setData('application/parseFile', parseFile);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleOpen = (item) => {
    dispatch(openAddNodeTab());
    dispatch(setSelectedNodeGroupId(item?._id));
  };

  function stringAvatar(name) {
    const nameParts = name.split(' ');
    const initials =
      nameParts.length > 1 ? `${nameParts[0][0].toUpperCase()}${nameParts[1][0].toUpperCase()}` : `${nameParts[0][0].toUpperCase()}`;
    return { children: initials };
  }

  const handleCloseDialog = () => {
    setOpenDialog(false); // Close the dialog when the user clicks the close button
  };

  return (
    <Dialog open={openDialog} onClose={handleCloseDialog}>
      <DialogTitle>Components</DialogTitle>
      <DialogContent>
        <Box
          component="nav"
          aria-label="sidebar"
          sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: 2,
            overflowX: 'auto',
            borderRadius: '8px',
            justifyContent: 'flex-start',
            paddingBottom: '20px',
          }}
        >
        {sidebarNodes?.map((item, i) => (
          <Box
            key={i}
            display="flex"
            flexDirection="column"
            alignItems="center"
            onMouseEnter={(e) => handleMouseEnter(e, item)}
            onMouseLeave={handleMouseLeave}
            sx={{ cursor: 'pointer' }}
          >
            <Avatar
              {...stringAvatar(item?.name)}
              variant="rounded"
              sx={{
                width: 25,
                height: 25,
                fontSize: '12px',
                '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.1)' }
              }}
            />
            <Typography variant="body2" color={'#1d97fc'} noWrap sx={{ fontSize: '10px' }}>
              {item?.name}
            </Typography>
            <Popper
              open={Boolean(anchorEl) && hoveredItem === item}
              anchorEl={anchorEl}
              placement="bottom"
              transition
              disablePortal={false}
              sx={{ zIndex: 1500, '&:hover': { cursor: 'grab' } }}
            >
              {({ TransitionProps }) => (
                <Grow
                  {...TransitionProps}
                  style={{
                    transformOrigin: 'top center'
                  }}
                >
                  <Paper
                    sx={{
                      backgroundColor: color?.leftbarBG,
                      zIndex: 1500,
                      '&:hover': { cursor: 'grab' }
                    }}
                    className={classes.paper}
                  >
                    <ClickAwayListener onClickAway={handleMouseLeave}>
                      <MenuList autoFocusItem={hoveredItem === item}>
                        {item?.nodes?.map((node) => (
                          <MenuItem draggable onDragStart={(event) => onDragStart(event, node)} key={node?.id} onClick={handleMouseLeave} sx={{'&:hover': { cursor: 'grab' }}}>
                            {node?.data['label']}
                          </MenuItem>
                        ))}
                        <MenuItem>
                          <Button
                            sx={{
                              margin: 0,
                            }}
                            onClick={() => handleOpen(item)}
                            variant="outlined"
                          >
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
          aria-label="add"
          onClick={() => setOpenAdd(true)}
          sx={{
            background: 'transparent',
            boxShadow: 'none',
            color: '#2196f3',
            border: '2px solid #2196f3',
            width: '30px',
            height: '30px',
            minHeight: '30px',
            '&:hover': { color: 'white' }
          }}
        >
          <AddIcon />
        </Fab>
      </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDialog} color="primary">
          Close
        </Button>
      </DialogActions>
      <AddNewComponentLibrary open={openAdd} handleClose={() => setOpenAdd(false)} />
    </Dialog>
  );
};

export default Components;
