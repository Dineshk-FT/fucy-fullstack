import React, { useEffect, createContext } from 'react';
import PropTypes from 'prop-types';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Box, Drawer, useMediaQuery } from '@mui/material';
import ArrowCircleLeftTwoToneIcon from '@mui/icons-material/ArrowCircleLeftTwoTone';
import ArrowCircleRightTwoToneIcon from '@mui/icons-material/ArrowCircleRightTwoTone';
// third-party
import PerfectScrollbar from 'react-perfect-scrollbar';
import { BrowserView, MobileView } from 'react-device-detect';

// project imports
import LogoSection from '../LogoSection';
import { drawerWidth, navbarHeight } from '../../../store/constant';
import ColorTheme from '../../../store/ColorTheme';
// import BrowserCard from './BrowserCard';
import BrowserCard from '../Sidebar/BrowserCard/index1';
import MenuCard from '../Sidebar/MenuCard';
import useStore from '../../../Zustand/store';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from '@mui/styles';
import { clearProperties } from '../../../store/slices/PageSectionSlice';
import toast, { Toaster } from 'react-hot-toast';

export const ToasterContext = createContext();
const useStyles = makeStyles(() => ({
  icon: {
    fontSize: 24,
    position: 'absolute',
    top: 0,
    right: 0,
    cursor: 'pointer', // Indicate that it's clickable
    zIndex: 1400
    // margin: '5px'
  }
}));
// ==============================|| SIDEBAR DRAWER ||============================== //

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
  useEffect(() => {
    fetchAPI();
    fetchModals();
    dispatch(clearProperties());
  }, []);

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
            // marginTop: '3rem',
            // height: 'calc(80vh - 88px)',
            paddingLeft: '16px',
            paddingRight: '16px',
            marginTop: '1.4rem'
          }}
        >
          <BrowserCard template={template} modals={modals} />
          {Properties && Properties?.length > 0 && <MenuCard properties={Properties} />}
        </PerfectScrollbar>
        <ArrowCircleLeftTwoToneIcon onClick={drawerToggle} className={classes.icon} sx={{ margin: '5px', color: color?.iconColor }} />
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
      <Box
        component="nav"
        sx={{
          flexShrink: { md: 0 },
          width: drawerOpen ? drawerWidth : 'auto',
          background: color?.sidebarBG,
          mt: !drawerOpen ? navbarHeight : '0px'
        }}
        aria-label="mailbox folders"
      >
        {!drawerOpen && (
          <ArrowCircleRightTwoToneIcon
            onClick={drawerToggle}
            className={classes.icon}
            sx={{ position: 'relative', left: '0px', marginTop: `${navbarHeight}px`, color: color?.iconColor }}
          />
        )}

        <Drawer
          container={container}
          variant={matchUpMd ? 'persistent' : 'temporary'}
          anchor="left"
          open={drawerOpen}
          onClose={drawerToggle}
          sx={{
            transition: 'width 2s',
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              // background: theme.palette.background.default,
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
    </ToasterContext.Provider>
  );
};

Sidebar.propTypes = {
  drawerOpen: PropTypes.bool,
  drawerToggle: PropTypes.func,
  window: PropTypes.object
};

export default Sidebar;
