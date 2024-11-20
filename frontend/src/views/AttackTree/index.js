/*eslint-disable*/
import React, { useState } from 'react';
import KeyboardBackspaceRoundedIcon from '@mui/icons-material/KeyboardBackspaceRounded';
import { useDispatch, useSelector } from 'react-redux';
import { closeAll } from '../../store/slices/CurrentIdSlice';
import { Box, Grid, Paper, Typography } from '@mui/material';
import AttackBlock from '../AttackSceneCanvas';
import Properties from './Properties';
import Levels from '../AttackSceneCanvas/Levels';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';

const AttackTree = () => {
  const { attackScene, isLevelOpen } = useSelector((state) => state?.currentId);
  const dispatch = useDispatch();

  // State to track the sidebar width
  const [sidebarWidth, setSidebarWidth] = useState(750); // Initial width of the sidebar

  const handleBack = () => {
    dispatch(closeAll());
  };

  // Update the width when resizing
  const handleResize = (event, { size }) => {
    setSidebarWidth(size.width);
  };

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        {!isLevelOpen && (
          <Box display="flex" alignItems="center" gap={1} my={1}>
            <KeyboardBackspaceRoundedIcon sx={{ float: 'left', cursor: 'pointer', ml: 1 }} onClick={handleBack} />
            <Typography variant="h4">Attack Tree </Typography>
          </Box>
        )}
        <Paper elevation={3} sx={{ height: '83svh' }}>
          <Grid container sx={{ height: 'inherit' }}>
            {/* <ResizableBox
              width={sidebarWidth}
              height={Infinity}
              axis="x"
              minConstraints={[500, 0]}
              maxConstraints={[750, Infinity]}
              onResize={handleResize}
              handle={
                <span
                  className="custom-handle"
                  style={{
                    position: 'absolute',
                    right: '-5px',
                    top: 0,
                    bottom: 0,
                    cursor: 'ew-resize',
                    width: '10px',
                    backgroundColor: 'transparent',
                  }}
                />
              }
              handleSize={[10, Infinity]}
            > */}
            <Grid item sx={{ flexGrow: 1 }}>
              {!isLevelOpen ? attackScene && <AttackBlock attackScene={attackScene} /> : <Levels />}
            </Grid>
            {/* </ResizableBox> */}
            <Grid
              item
              sx={{ borderLeft: '1px solid black', height: '100%' }} // Fill the ResizableBox
            >
              <Properties />
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </>
  );
};

export default AttackTree;
