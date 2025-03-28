/*eslint-disable*/
import React, { useEffect, useState } from 'react';
import KeyboardBackspaceRoundedIcon from '@mui/icons-material/KeyboardBackspaceRounded';
import { useDispatch, useSelector } from 'react-redux';
import { closeAll } from '../../store/slices/CurrentIdSlice';
import { Box, Grid, Paper, Typography } from '@mui/material';
import AttackBlock from '../AttackSceneCanvas';
import Properties from './Properties';
import Levels from '../AttackSceneCanvas/Levels';
import { Resizable } from 'react-resizable';
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

  // State to track the split percentage (0-100)
  const [splitPercentage, setSplitPercentage] = useState(75); // Initial 75% for left panel
  const [isResizing, setIsResizing] = useState(false);

  const handleBack = () => {
    dispatch(closeAll());
    getAssets(model?._id);
  };

  useEffect(() => {
    getCyberSecurityScenario(model?._id);
  }, []);

  const handleResizeStart = () => {
    setIsResizing(true);
  };

  const handleResize = (event, { size }) => {
    const containerWidth = event.currentTarget.parentElement.offsetWidth;
    const newPercentage = (size.width / containerWidth) * 100;
    setSplitPercentage(Math.min(Math.max(newPercentage, 20), 80)); // Keep between 25% and 75%
  };

  const handleResizeStop = () => {
    setIsResizing(false);
  };

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '76svh', maxHeight: '80svh' }}>
        {!isLevelOpen && (
          <Box display="flex" alignItems="center" gap={1} mx={1} mb={1.5}>
            <Typography sx={{ color: color?.title, fontWeight: 600, fontSize: '16px' }}>{attackScene?.Name}</Typography>
          </Box>
        )}
        <Paper elevation={3}>
          <Box sx={{ display: 'flex', height: isCollapsed ? '85svh' : '76svh', position: 'relative' }}>
            {/* Left Panel - AttackBlock */}
            <Box
              sx={{
                width: `${splitPercentage}%`,
                height: '100%',
                overflow: 'hidden',
                transition: isResizing ? 'none' : 'width 0.2s ease'
              }}
            >
              <AttackBlock attackScene={attackScene} color={color} />
            </Box>

            {/* Resize Handle */}
            <Box
              sx={{
                width: '6px',
                height: '100%',
                backgroundColor: isResizing ? color?.primary : 'transparent',
                cursor: 'col-resize',
                '&:hover': {
                  backgroundColor: color?.primary
                }
              }}
              onMouseDown={handleResizeStart}
            />

            {/* Right Panel - Properties */}
            <Box
              sx={{
                width: `${100 - splitPercentage}%`,
                height: '100%',
                borderLeft: `1px solid ${color?.border}`,
                backgroundColor: color?.canvasBG,
                color: color?.title,
                overflow: 'auto',
                transition: isResizing ? 'none' : 'width 0.2s ease'
              }}
            >
              <Properties color={color} />
              <GlobalAttackTreeList globalAttackTrees={globalAttackTrees} />
            </Box>

            {/* Invisible resize tracker */}
            {isResizing && (
              <Box
                sx={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 9999,
                  cursor: 'col-resize'
                }}
                onMouseMove={(e) => {
                  if (isResizing) {
                    const container = e.currentTarget.parentElement;
                    const containerRect = container.getBoundingClientRect();
                    const newWidth = e.clientX - containerRect.left;
                    const newPercentage = (newWidth / containerRect.width) * 100;
                    setSplitPercentage(Math.min(Math.max(newPercentage, 20), 80));
                  }
                }}
                onMouseUp={handleResizeStop}
                onMouseLeave={handleResizeStop}
              />
            )}
          </Box>
        </Paper>
      </Box>
    </>
  );
};

export default AttackTree;
