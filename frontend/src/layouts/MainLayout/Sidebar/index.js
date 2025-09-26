/*eslint-disable*/
import React, { useState, useEffect, createContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTheme, alpha } from '@mui/material/styles';
import { Box, Drawer, useMediaQuery, IconButton, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { BrowserView, MobileView } from 'react-device-detect';
import 'react-resizable/css/styles.css';
import { useDispatch, useSelector } from 'react-redux';
import toast, { Toaster } from 'react-hot-toast';
import useStore from '../../../store/Zustand/store';
import { clearProperties } from '../../../store/slices/PageSectionSlice';
import BrowserCard from './BrowserCard';
import { setDrawerwidth } from '../../../store/slices/CanvasSlice';
import { getNavbarHeight } from '../../../themes/constant';
import ColorTheme from '../../../themes/ColorTheme';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { sidebarSteps } from '../../../utils/Steps';
import AutoGuidePopper from '../../../components/Poppers/AutoGuidePopper';

// Custom resize handle component with improved styling and hit area
const ResizeHandle = styled('div')(({ theme }) => ({
  position: 'absolute',
  right: -4, // Extend the hit area
  top: 0,
  bottom: 0,
  width: 12, // Wider hit area
  cursor: 'ew-resize',
  zIndex: 1000,
  '&::after': {
    content: '""',
    position: 'absolute',
    right: 4, // Position the visual handle
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: 'transparent',
    transition: 'background-color 0.2s ease',
  },
  '&:hover::after, &:active::after': {
    backgroundColor: theme.palette.primary.main,
  },
}));

const StyledScrollbar = styled(PerfectScrollbar)(({ theme }) => ({
  padding: theme.spacing(1, 1.5, 1, 1.5),
  height: 'calc(100% - 16px)',
  '& .ps__rail-y': {
    '&:hover, &:active': {
      backgroundColor: 'transparent',
    },
  },
  '& .ps__thumb-y': {
    backgroundColor: alpha(theme.palette.primary.main, 0.4),
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.6),
    },
  },
}));

export const ToasterContext = createContext();

const selector = (state) => ({
  template: state.template,
  models: state.Models,
  fetchModels: state.getModels,
  isCollapsed: state.isCollapsed
}); // Use shallow equality for better memoization

const Sidebar = ({ draweropen, drawerToggle, window }) => {
  const dispatch = useDispatch();
  const color = ColorTheme();
  const { template, fetchModels, models, isCollapsed } = useStore(selector);
  const theme = useTheme();
  const isNavbarClose = useSelector((state) => state.currentId.isNavbarClose);
  const matchUpMd = useMediaQuery(theme.breakpoints.up('md'));
  const notify = (message, status) => toast[status](message);
  // State to track the width of the ResizableBox
  const [sidebarWidth, setSidebarWidth] = useState(draweropen ? 400 : 0);
  const [runTour, setRunTour] = useState(false);

  useEffect(() => {
    fetchModels();
    dispatch(clearProperties());
  }, []);

  const handleResize = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const startX = e.clientX;
    const startWidth = sidebarWidth;
    
    const onMouseMove = (moveEvent) => {
      moveEvent.preventDefault();
      const newWidth = startWidth + moveEvent.clientX - startX;
      const constrainedWidth = Math.max(250, Math.min(newWidth, 650));
      setSidebarWidth(constrainedWidth);
      dispatch(setDrawerwidth(constrainedWidth));
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };

    // Prevent text selection during resize
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'ew-resize';

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp, { once: true });
  };

  const handleDrawerToggle = (e) => {
    e.stopPropagation();
    setSidebarWidth(draweropen ? 0 : 370);
    dispatch(setDrawerwidth(draweropen ? 0 : 370));
    drawerToggle();
  };

  // Memoize static drawer structure
  const drawer = useMemo(
    () => (
      <>
        <BrowserView>
          <StyledScrollbar>
            <Box sx={{ pr: 0.5 }}>
              <BrowserCard
                template={template}
                models={models}
                isCollapsed={isCollapsed}
                isNavbarClose={isNavbarClose}
                sidebarWidth={sidebarWidth}
              />
            </Box>
          </StyledScrollbar>
          <Tooltip title={draweropen ? 'Collapse sidebar' : 'Expand sidebar'} arrow>
            <IconButton
              onClick={handleDrawerToggle}
              sx={{
                position: 'absolute',
                border: `1px solid ${alpha(color?.title, 0.2)}`,
                backgroundColor: color?.sidebarBG,
                boxShadow: theme.shadows[2],
                p: 0.5,
                width: 24,
                height: 24,
                top: 16,
                right: 8,
                color: color?.iconColor,
                zIndex: 1400,
                '&:hover': { 
                  transform: 'translateX(-2px)',
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  borderColor: theme.palette.primary.main,
                },
                transition: theme.transitions.create(['transform', 'background-color', 'border-color'], {
                  duration: theme.transitions.duration.shorter,
                  easing: theme.transitions.easing.easeInOut,
                }),
              }}
            >
              {draweropen ? 
                <ChevronLeftIcon fontSize="small" /> : 
                <ChevronRightIcon fontSize="small" />
              }
            </IconButton>
          </Tooltip>
        </BrowserView>
        {/* <MobileView>
          <Box sx={{ px: 2 }}>
            <MenuCard />
          </Box>
        </MobileView> */}
      </>
    ),
    []
  );

  const container = window !== undefined ? () => window.document.body : undefined;
  const values = { notify };

  return (
    <>
      <AutoGuidePopper steps={sidebarSteps} runTour={runTour} setRunTour={setRunTour} />

      <ToasterContext.Provider value={values}>
        <div
          style={{
            width: sidebarWidth,
            height: '100%',
            position: 'relative',
            transition: theme.transitions.create('width', {
              duration: theme.transitions.duration.standard,
              easing: theme.transitions.easing.easeInOut,
            }),
          }}
        >
          <ResizeHandle 
            onMouseDown={handleResize}
            onDoubleClick={() => {
              const newWidth = sidebarWidth < 500 ? 500 : 370;
              setSidebarWidth(newWidth);
              dispatch(setDrawerwidth(newWidth));
            }}
          />
          <Box
            component="nav"
            sx={{
              flexShrink: { md: 0 },
              width: sidebarWidth,
              height: '100%',
              background: color?.sidebarBG,
              mt: !draweropen ? getNavbarHeight(isCollapsed) : '0px',
              borderRight: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              boxShadow: theme.shadows[2],
              transition: theme.transitions.create(['width', 'margin'], {
                duration: theme.transitions.duration.standard,
                easing: theme.transitions.easing.easeInOut,
              }),
              '&:hover': {
                boxShadow: theme.shadows[4],
              },
            }}
            aria-label="mailbox folders"
          >
            {!draweropen && (
              <Tooltip title="Expand sidebar" arrow>
                <IconButton
                  onClick={handleDrawerToggle}
                  sx={{
                    position: 'absolute',
                    border: `1px solid ${alpha(color?.title, 0.2)}`,
                    backgroundColor: color?.sidebarBG,
                    boxShadow: theme.shadows[2],
                    p: 0.5,
                    width: 24,
                    height: 24,
                    left: 4,
                    top: 16,
                    marginTop: `${getNavbarHeight(isCollapsed)}px`,
                    color: color?.iconColor,
                    zIndex: 1400,
                    '&:hover': { 
                      transform: 'translateX(2px)',
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      borderColor: theme.palette.primary.main,
                    },
                    transition: theme.transitions.create(['transform', 'background-color', 'border-color'], {
                      duration: theme.transitions.duration.shorter,
                      easing: theme.transitions.easing.easeInOut,
                    }),
                  }}
                >
                  <ChevronRightIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            <Drawer
              container={container}
              variant={matchUpMd ? 'persistent' : 'temporary'}
              anchor="left"
              open={draweropen}
              id="sidebar_drawer"
              onClose={handleDrawerToggle} // Use handleDrawerToggle here
              sx={{
                '& .MuiDrawer-paper': {
                  height: '-webkit-fill-available',
                  width: sidebarWidth, // Apply the dynamic width
                  background: color?.sidebarBG,
                  color: theme.palette.text.primary,
                  [theme.breakpoints.up('md')]: {
                    top: !isNavbarClose ? getNavbarHeight(isCollapsed) : '0px'
                  }
                },
                '& .MuiCardContent-root': {
                  padding: '0px',
                  flexGrow: 1
                }
              }}
              ModalProps={{ keepMounted: true }}
              color="inherit"
            >
              {drawer}
            </Drawer>
            <Toaster position="top-right" reverseOrder={false} />
          </Box>
        </div>
      </ToasterContext.Provider>
    </>
  );
};

Sidebar.propTypes = {
  // draweropen: PropTypes.bool,
  drawerToggle: PropTypes.func,
  window: PropTypes.object
};

export default React.memo(Sidebar);
