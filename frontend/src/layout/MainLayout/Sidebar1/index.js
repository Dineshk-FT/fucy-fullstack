/*eslint-disable*/

import React, { useState, useEffect, createContext } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import { Box, Drawer, useMediaQuery } from '@mui/material';
import ArrowCircleLeftTwoToneIcon from '@mui/icons-material/ArrowCircleLeftTwoTone';
import ArrowCircleRightTwoToneIcon from '@mui/icons-material/ArrowCircleRightTwoTone';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { BrowserView, MobileView } from 'react-device-detect';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from '@mui/styles';
import toast, { Toaster } from 'react-hot-toast';
import LogoSection from '../LogoSection';
import BrowserCard from '../Sidebar/BrowserCard/index1';
import MenuCard from '../Sidebar/MenuCard';
import { drawerWidth, navbarHeight } from '../../../store/constant';
import ColorTheme from '../../../store/ColorTheme';
import useStore from '../../../Zustand/store';
import { clearProperties } from '../../../store/slices/PageSectionSlice';

export const ToasterContext = createContext();

const useStyles = makeStyles(() => ({
  icon: {
    fontSize: 24,
    position: 'absolute',
    top: 0,
    right: 0,
    cursor: 'pointer',
    zIndex: 1400
  }
}));

const selector = (state) => ({
  template: state.template,
  modals: state.Modals,
  fetchAPI: state.fetchAPI,
  fetchModals: state.getModals
});

const Sidebar = ({ drawerOpen, drawerToggle, window }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const color = ColorTheme();
  const { template, fetchAPI, fetchModals, modals } = useStore(selector);
  const theme = useTheme();
  const { isNavbarClose } = useSelector((state) => state.currentId);
  const { Properties } = useSelector((state) => state?.pageName);
  const matchUpMd = useMediaQuery(theme.breakpoints.up('md'));
  const notify = (message, status) => toast[status](message);

  // State to track the width of the ResizableBox
  const [sidebarWidth, setSidebarWidth] = useState(drawerOpen ? 240 : 60);

  useEffect(() => {
    fetchAPI();
    fetchModals();
    dispatch(clearProperties());
  }, []);

  // console.log('sidebarWidth', sidebarWidth);

  const handleResize = (event, { size }) => {
    setSidebarWidth(size.width);
  };

  const handleDrawerToggle = () => {
    if (drawerOpen) {
      setSidebarWidth(0); // Set width to 0 when closing
    } else {
      setSidebarWidth(240); // Set default width when opening (you can adjust the value as needed)
    }
    drawerToggle();
  };

  const drawer = (
    <>
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        <Box sx={{ display: 'flex', p: 2, mx: 'auto' }}>
          <LogoSection />
        </Box>
      </Box>
      <BrowserView>
        <PerfectScrollbar
          component="div"
          style={{
            paddingLeft: '16px',
            paddingRight: '16px',
            marginTop: '1.4rem'
          }}
        >
          <BrowserCard template={template} modals={modals} />
          {Properties && Properties?.length > 0 && <MenuCard properties={Properties} />}
        </PerfectScrollbar>
        <ArrowCircleLeftTwoToneIcon
          onClick={handleDrawerToggle} // Use handleDrawerToggle here
          className={classes.icon}
          sx={{ margin: '5px', color: color?.iconColor }}
        />
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
        minConstraints={[60, 0]}
        maxConstraints={[450, Infinity]}
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
            mt: !drawerOpen ? navbarHeight : '0px'
          }}
          aria-label="mailbox folders"
        >
          {!drawerOpen && (
            <ArrowCircleRightTwoToneIcon
              onClick={handleDrawerToggle} // Use handleDrawerToggle here
              className={classes.icon}
              sx={{ position: 'relative', left: '0px', marginTop: `${navbarHeight}px`, color: color?.iconColor }}
            />
          )}

          <Drawer
            container={container}
            variant={matchUpMd ? 'persistent' : 'temporary'}
            anchor="left"
            open={drawerOpen}
            onClose={handleDrawerToggle} // Use handleDrawerToggle here
            sx={{
              '& .MuiDrawer-paper': {
                width: sidebarWidth, // Apply the dynamic width
                background: color?.sidebarBG,
                color: theme.palette.text.primary,
                [theme.breakpoints.up('md')]: {
                  top: !isNavbarClose ? navbarHeight : '0px'
                }
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
  drawerOpen: PropTypes.bool,
  drawerToggle: PropTypes.func,
  window: PropTypes.object
};

export default Sidebar;
