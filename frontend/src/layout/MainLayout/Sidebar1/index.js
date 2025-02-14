/*eslint-disable*/

import React, { useState, useEffect, createContext } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import { Box, Drawer, useMediaQuery, IconButton } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { BrowserView, MobileView } from 'react-device-detect';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from '@mui/styles';
import toast, { Toaster } from 'react-hot-toast';
import LogoSection from '../LogoSection';
import BrowserCard from '../Sidebar/BrowserCard/index';
import { drawerWidth, navbarHeight } from '../../../store/constant';
import ColorTheme from '../../../store/ColorTheme';
import useStore from '../../../Zustand/store';
import { clearProperties } from '../../../store/slices/PageSectionSlice';
import MenuCard from '../Sidebar/MenuCard/index1';
import CancelTwoToneIcon from '@mui/icons-material/CancelTwoTone';
import { ClosePropertiesTab, setDrawerwidth } from '../../../store/slices/CanvasSlice';

export const ToasterContext = createContext();

const useStyles = makeStyles(() => ({
  icon: {
    fontSize: 24,
    position: 'absolute',
    right: 0,
    cursor: 'pointer',
    zIndex: 1400
  }
}));

const selector = (state) => ({
  template: state.template,
  models: state.Models,
  fetchModels: state.getModels
});

const Sidebar = ({ draweropen, drawerToggle, window }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const color = ColorTheme();
  const { template, fetchModels, models } = useStore(selector);
  const theme = useTheme();
  const { isNavbarClose } = useSelector((state) => state.currentId);
  const matchUpMd = useMediaQuery(theme.breakpoints.up('md'));
  const notify = (message, status) => toast[status](message);
  // State to track the width of the ResizableBox
  const [sidebarWidth, setSidebarWidth] = useState(draweropen ? 400 : 0);

  useEffect(() => {
    fetchModels();
    dispatch(clearProperties());
  }, []);

  const handleResize = (event, { size }) => {
    setSidebarWidth(size.width);
    dispatch(setDrawerwidth(size.width));
  };

  const handleDrawerToggle = () => {
    setSidebarWidth(draweropen ? 0 : 370);
    dispatch(setDrawerwidth(draweropen ? 0 : 370));
    drawerToggle();
  };

  const drawer = (
    <>
      <BrowserView>
        <PerfectScrollbar component="div" style={{ paddingRight: '40px', paddingLeft: '15px', paddingTop: '15px' }}>
          <BrowserCard template={template} models={models} />
        </PerfectScrollbar>
        <IconButton
          onClick={handleDrawerToggle}
          sx={{
            position: 'absolute',
            border: `1px solid ${color?.title}`,
            margin: 1,
            padding: '0px',
            width: '0.8em',
            height: '0.8em',
            top: 0,
            right: 0,
            color: color?.iconColor,
            zIndex: 1400,
            '&:hover': { transform: 'scale(1.1)' },
            transition: 'transform 0.2s ease'
          }}
        >
          {draweropen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </BrowserView>
      <MobileView>
        <Box sx={{ px: 2 }}>
          <MenuCard />
        </Box>
      </MobileView>
    </>
  );

  const container = window !== undefined ? () => window.document.body : undefined;
  const values = { notify };

  return (
    <ToasterContext.Provider value={values}>
      <ResizableBox
        width={sidebarWidth}
        height={Infinity}
        axis="x"
        minConstraints={[250, 0]}
        maxConstraints={[650, Infinity]}
        onResize={handleResize}
        handle={
          <span
            className="custom-handle"
            style={{
              position: 'absolute',
              right: '-8px',
              top: 0,
              bottom: 0,
              cursor: 'ew-resize',
              width: '10px',
              backgroundColor: 'transparent'
            }}
          />
        }
        handleSize={[8, Infinity]}
      >
        <Box
          component="nav"
          sx={{
            flexShrink: { md: 0 },
            width: sidebarWidth,
            background: color?.sidebarBG,
            mt: !draweropen ? navbarHeight : '0px'
          }}
          aria-label="mailbox folders"
        >
          {!draweropen && (
            <IconButton
              onClick={handleDrawerToggle}
              sx={{
                position: 'absolute',
                border: `1px solid ${color?.title}`,
                padding: '0px',
                width: '0.8em',
                height: '0.8em',
                left: '0px',
                top: 0,
                marginTop: `${navbarHeight}px`,
                color: color?.iconColor,
                zIndex: 1400,
                '&:hover': { transform: 'scale(1.1)' },
                transition: 'transform 0.2s ease'
              }}
            >
              {draweropen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>
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
                  top: !isNavbarClose ? navbarHeight : '0px'
                }
              },
              '& .MuiCardContent-root': {
                padding: '0px'
              }
            }}
            ModalProps={{ keepMounted: true }}
            color="inherit"
          >
            {drawer}
          </Drawer>
          <Toaster position="top-right" reverseOrder={false} />
        </Box>
      </ResizableBox>
    </ToasterContext.Provider>
  );
};

Sidebar.propTypes = {
  // draweropen: PropTypes.bool,
  drawerToggle: PropTypes.func,
  window: PropTypes.object
};

export default Sidebar;
