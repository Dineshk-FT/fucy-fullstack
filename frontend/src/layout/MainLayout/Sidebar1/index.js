/*eslint-disable*/

import React, { useState, useEffect, createContext } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import { Box, Drawer, useMediaQuery, IconButton } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
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
import { drawerWidth, navbarHeight } from '../../../store/constant';
import ColorTheme from '../../../store/ColorTheme';
import useStore from '../../../Zustand/store';
import { clearProperties } from '../../../store/slices/PageSectionSlice';
import MenuCard from '../Sidebar/MenuCard/index1';
import CancelTwoToneIcon from '@mui/icons-material/CancelTwoTone';
import { ClosePropertiesTab } from '../../../store/slices/CanvasSlice';

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

const Sidebar = ({ drawerOpen, drawerToggle, window }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const color = ColorTheme();
  const { template, fetchModels, models } = useStore(selector);
  const theme = useTheme();
  const { isNavbarClose } = useSelector((state) => state.currentId);
  const { Properties } = useSelector((state) => state?.pageName);
  const matchUpMd = useMediaQuery(theme.breakpoints.up('md'));
  const notify = (message, status) => toast[status](message);
  const { propertiesTabOpen } = useSelector((state) => state?.canvas);
  // State to track the width of the ResizableBox
  const [sidebarWidth, setSidebarWidth] = useState(drawerOpen ? 330 : 0);

  useEffect(() => {
    fetchModels();
    dispatch(clearProperties());
  }, []);

  // console.log('sidebarWidth', sidebarWidth);

  const handleResize = (event, { size }) => {
    setSidebarWidth(size.width);
  };

  const handleDrawerToggle = () => {
    setSidebarWidth(drawerOpen ? 0 : 330);
    drawerToggle();
    console.log('Drawer open:', !drawerOpen.open);
  };

  const drawer = (
    <>
      <Box>
        <Box sx={{ display: 'flex', pt: 1, px: 1, mx: 'auto' }}>
          <Box display="flex" alignItems="center" justifyContent="start">
            <svg width="82" height="25" viewBox="0 0 92 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M10.987 31.5841C4.92849 31.5841 0 26.626 0 20.5323C0 14.4385 4.92899 9.48041 10.987 9.48041C17.045 9.48041 21.974 14.4385 21.974 20.5323C21.974 26.626 17.0459 31.5841 10.987 31.5841ZM10.987 10.536C5.50765 10.536 1.04938 15.0196 1.04938 20.5318C1.04938 26.044 5.50765 30.5275 10.987 30.5275C16.4663 30.5275 20.9251 26.0429 20.9251 20.5308C20.9251 15.0186 16.4673 10.536 10.987 10.536Z"
                fill={theme.palette.primary.main}
              />
              <path
                d="M18.96 21.0225C18.6182 19.7483 15.4851 19.6108 13.6203 20.0779C12.6437 20.3235 11.6456 20.6428 10.6162 20.8265C11.3697 21.4989 12.1788 22.135 13.34 22.2932C16.2211 22.6842 18.0112 21.775 18.96 21.0225Z"
                fill={theme.palette.primary.main}
              />
              <path
                d="M13.34 22.2932C12.1764 22.135 11.3697 21.4989 10.6162 20.8265C9.45013 19.7857 8.41298 18.6579 6.37723 19.0823C3.14069 19.7572 2.71488 23.6081 5.21404 26.0828C6.28706 27.2131 7.66455 28.0041 9.17779 28.3586C10.691 28.7132 12.2742 28.616 13.7333 28.079C15.1924 27.5419 16.4641 26.5883 17.3925 25.3352C18.3209 24.0819 18.8656 22.5835 18.96 21.0235C18.0112 21.775 16.221 22.6842 13.34 22.2932Z"
                fill={theme.palette.secondary.main}
              />
              <path
                d="M15.034 13.9586C14.6301 14.8295 18.2304 15.7957 18.6611 18.6879C18.8687 15.8409 15.5335 12.882 15.034 13.9586Z"
                fill={theme.palette.primary.main}
              />
              <path
                d="M7.46619 17.5935C8.11524 17.3231 8.42345 16.5746 8.15463 15.9217C7.8858 15.2688 7.14167 14.9587 6.49262 15.2292C5.84357 15.4996 5.53536 16.2481 5.80418 16.9011C6.07306 17.5539 6.81714 17.8639 7.46619 17.5935Z"
                fill={theme.palette.secondary.main}
              />
              <path
                d="M10.3549 14.08C10.6585 13.7746 10.6585 13.2795 10.3549 12.9741C10.0513 12.6687 9.55909 12.6687 9.25551 12.9741C8.95194 13.2795 8.95194 13.7746 9.25551 14.08C9.55909 14.3854 10.0513 14.3854 10.3549 14.08Z"
                fill={theme.palette.primary.main}
              />
              <path
                d="M13.1014 9.05206C14.2245 5.7149 13.4696 3.04871 11.1614 1.78241C9.58359 2.10513 8.647 2.87335 8.12549 3.93383C11.2204 3.68185 13.1844 5.63041 13.1014 9.05206Z"
                fill={theme.palette.primary.main}
              />
              <path
                d="M25.6983 6.13641C20.1389 4.1294 16.6304 4.81756 16.0786 9.39055C19.2648 12.6973 22.474 11.1146 25.6983 6.13641Z"
                fill={theme.palette.primary.main}
              />
              <path
                d="M21.2765 4.32541C21.5343 3.21728 21.6681 1.90776 21.6881 0.41748C15.9226 1.70883 13.3224 4.17658 15.2839 8.33846C15.3816 8.36203 15.4754 8.38119 15.5696 8.40085C16.0281 5.14422 18.0463 3.93835 21.2765 4.32541Z"
                fill={theme.palette.primary.main}
              />
            </svg>
          </Box>
        </Box>
      </Box>
      <BrowserView>
        <PerfectScrollbar
          component="div"
          style={{
            paddingLeft: '16px',
            paddingRight: '16px',
          }}
        >
          <BrowserCard template={template} models={models} />
          {propertiesTabOpen && (
            <Box mx={1} display="flex">
              <Box>
                <MenuCard />
              </Box>
              <Box mt={2} sx={{ cursor: 'pointer' }} onClick={() => dispatch(ClosePropertiesTab())}>
                <CancelTwoToneIcon />
              </Box>
            </Box>
          )}
        </PerfectScrollbar>
        <IconButton
          onClick={handleDrawerToggle}
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            color: color?.iconColor,
            zIndex: 1400,
            '&:hover': { transform: 'scale(1.1)' },
            transition: 'transform 0.2s ease'
          }}
        >
          {drawerOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
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
            <IconButton
              onClick={handleDrawerToggle}
              sx={{
                position: 'absolute',
                left: '0px',
                top: 0,
                marginTop: `${navbarHeight}px`,
                color: color?.iconColor,
                zIndex: 1400,
                '&:hover': { transform: 'scale(1.1)' },
                transition: 'transform 0.2s ease'
              }}
            >
              {drawerOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>
          )}

          <Drawer
            container={container}
            variant={matchUpMd ? 'persistent' : 'temporary'}
            anchor="left"
            open={drawerOpen}
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
