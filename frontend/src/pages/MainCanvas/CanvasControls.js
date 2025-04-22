import React, { useCallback, useMemo } from 'react';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { ZoomIn, ZoomOut, FitScreen } from '@mui/icons-material';
import { useReactFlow } from 'reactflow';

export const ZoomControls = ({ isDark, zoomLevel, setZoomLevel, reactFlowInstance }) => {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  const updateZoom = useCallback(
    (fn, delay) => {
      fn({ duration: delay });
      setTimeout(() => setZoomLevel(reactFlowInstance.getZoom()), delay);
    },
    [reactFlowInstance, setZoomLevel]
  );

  const onZoomIn = () => updateZoom(zoomIn, 300);
  const onZoomOut = () => updateZoom(zoomOut, 300);
  const onFitView = () =>
    updateZoom(
      () =>
        fitView({
          padding: 0.2,
          includeHiddenNodes: true,
          minZoom: 0.5,
          maxZoom: 2,
          duration: 500
        }),
      500
    );

  const styles = useMemo(
    () => ({
      wrapper: {
        display: 'flex',
        gap: 0.5,
        background: isDark ? 'rgba(30, 30, 30, 0.7)' : 'rgba(245, 245, 245, 0.7)',
        backdropFilter: 'blur(4px)',
        borderRadius: '6px',
        padding: '2px 4px',
        boxShadow: isDark ? '0 2px 6px rgba(0,0,0,0.4)' : '0 2px 6px rgba(0,0,0,0.1)',
        alignItems: 'center'
      },
      iconButton: {
        color: isDark ? '#64B5F6' : '#2196F3',
        padding: '4px',
        '&:hover': {
          background: isDark
            ? 'linear-gradient(90deg, rgba(100,181,246,0.15) 0%, rgba(100,181,246,0.03) 100%)'
            : 'linear-gradient(90deg, rgba(33,150,243,0.08) 0%, rgba(33,150,243,0.02) 100%)',
          transform: 'scale(1.1)',
          boxShadow: isDark ? '0 2px 6px rgba(0,0,0,0.4)' : '0 2px 6px rgba(0,0,0,0.1)',
          filter: isDark ? 'drop-shadow(0 0 6px rgba(100,181,246,0.25))' : 'drop-shadow(0 0 6px rgba(33,150,243,0.15))'
        },
        '&:focus': {
          outline: `2px solid ${isDark ? '#64B5F6' : '#2196F3'}`,
          outlineOffset: '2px'
        }
      },
      zoomText: {
        fontFamily: "'Poppins', sans-serif",
        fontSize: '11px',
        fontWeight: 500,
        color: isDark ? '#E0E0E0' : '#333333',
        alignSelf: 'center',
        padding: '0 6px'
      }
    }),
    [isDark]
  );

  const buttons = [
    { label: 'Zoom In', icon: <ZoomIn sx={{ fontSize: 18 }} />, onClick: onZoomIn },
    { label: 'Zoom Out', icon: <ZoomOut sx={{ fontSize: 18 }} />, onClick: onZoomOut },
    { label: 'Fit View', icon: <FitScreen sx={{ fontSize: 18 }} />, onClick: onFitView }
  ];

  return (
    <Box sx={styles.wrapper}>
      {buttons.map(({ label, icon, onClick }) => (
        <Tooltip title={label} key={label}>
          <IconButton onClick={onClick} sx={styles.iconButton} aria-label={label.toLowerCase()}>
            {icon}
          </IconButton>
        </Tooltip>
      ))}
      <Typography sx={styles.zoomText}>{Math.round(zoomLevel * 100)}%</Typography>
    </Box>
  );
};
