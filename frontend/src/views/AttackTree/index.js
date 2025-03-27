/*eslint-disable*/
import React, { useEffect, useState } from 'react';
import KeyboardBackspaceRoundedIcon from '@mui/icons-material/KeyboardBackspaceRounded';
import { useDispatch, useSelector } from 'react-redux';
import { closeAll } from '../../store/slices/CurrentIdSlice';
import { Box, Grid, Paper, Typography } from '@mui/material';
import AttackBlock from '../AttackSceneCanvas';
import Properties from './Properties';
import Levels from '../AttackSceneCanvas/Levels';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';
import ColorTheme from '../../store/ColorTheme';
import useStore from '../../Zustand/store';
import GlobalAttackTreeList from './GlobalAttackTreeList';

const selector = (state) => ({
  getAssets: state.getAssets,
  model: state.model,
  getCyberSecurityScenario: state.getCyberSecurityScenario,
  isCollapsed: state.isCollapsed,
  globalAttackTrees: state.globalAttackTrees
});
const AttackTree = () => {
  const color = ColorTheme();
  const { getAssets, model, getCyberSecurityScenario, isCollapsed, globalAttackTrees } = useStore(selector);
  const { attackScene, isLevelOpen } = useSelector((state) => state?.currentId);
  const dispatch = useDispatch();

  // State to track the sidebar width
  const [sidebarWidth, setSidebarWidth] = useState(750); // Initial width of the sidebar
  const handleBack = () => {
    dispatch(closeAll());
    getAssets(model?._id);
  };

  useEffect(() => {
    getCyberSecurityScenario(model?._id);
  }, []);
  // Update the width when resizing
  const handleResize = (event, { size }) => {
    setSidebarWidth(size.width);
  };

  // console.log('attackScene', attackScene);
  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '76svh', maxHeight: '80svh' }}>
        {!isLevelOpen && (
          // <Box display="flex" alignItems="center" gap={1} my={1}>
          //   <KeyboardBackspaceRoundedIcon sx={{ float: 'left', cursor: 'pointer', ml: 1 }} onClick={handleBack} />
          //   <Typography variant="h4">{attackScene?.Name} </Typography>
          // </Box>
          <Box display="flex" alignItems="center" gap={1} mx={1} mb={1.5}>
            {/* <KeyboardBackspaceRoundedIcon sx={{ cursor: 'pointer', ml: 1, color: color?.title }} onClick={handleBack} /> */}
            <Typography sx={{ color: color?.title, fontWeight: 600, fontSize: '16px' }}>{attackScene?.Name}</Typography>
          </Box>
        )}
        <Paper elevation={3}>
          <Grid container sx={{ height: isCollapsed ? '85svh' : '76svh' }}>
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
            <Grid item xs={8} sx={{ flexGrow: 1, height: 'inherit' }}>
              <AttackBlock attackScene={attackScene} color={color} />
            </Grid>
            {/* </ResizableBox> */}
            <Grid
              item
              xs={4}
              sx={{ borderLeft: '1px solid black', height: '100%', backgroundColor: color?.canvasBG, color: color?.title }} // Fill the ResizableBox
            >
              <Properties color={color} />
              <GlobalAttackTreeList globalAttackTrees={globalAttackTrees} />
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </>
  );
};

export default AttackTree;
