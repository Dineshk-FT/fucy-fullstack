import PropTypes from 'prop-types';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Box, Drawer, useMediaQuery } from '@mui/material';

// third-party
import PerfectScrollbar from 'react-perfect-scrollbar';
import { BrowserView, MobileView } from 'react-device-detect';

// project imports
import LogoSection from '../LogoSection';
import MenuCard from './MenuCard';
import { drawerWidth, navbarHeight } from '../../../themes/constant';
import ColorTheme from '../../../themes/ColorTheme';
// import BrowserCard from './BrowserCard';
import BrowserCard from './BrowserCard/index1';
import useStore from '../../../Zustand/store';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearProperties } from '../../../store/slices/PageSectionSlice';

// ==============================|| SIDEBAR DRAWER ||============================== //

import shallow from 'zustand/shallow';
const selector = (state) => ({
  template: state.template,
  models: state.Models,
  fetchModels: state.getModels
}); // Use shallow equality for better memoization

const Sidebar = ({ draweropen, drawerToggle, window }) => {
  const dispatch = useDispatch();
  const { template, fetchModels, models } = useStore(selector, shallow);
  const theme = useTheme();
  const isNavbarClose = useSelector((state) => state.currentId.isNavbarClose);
  const Properties = useSelector((state) => state?.pageName?.Properties);
  const matchUpMd = useMediaQuery(theme.breakpoints.up('md'));

  useEffect(() => {
    fetchModels();
    dispatch(clearProperties());
  }, []);

  // Memoize static drawer structure
  const drawer = useMemo(() => (
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
            height: !matchUpMd ? 'calc(80vh - 56px)' : 'calc(80vh - 88px)',
            paddingLeft: '16px',
            paddingRight: '16px',
            marginTop: '1.4rem'
          }}
        >
          <BrowserCard template={template} models={models} />
          {Properties && Properties.length > 0 && <MenuCard properties={Properties} />}
        </PerfectScrollbar>
      </BrowserView>
      <MobileView>
        <Box sx={{ px: 2 }}>
          <MenuCard />
        </Box>
      </MobileView>
    </>
  ), [template, models, matchUpMd, Properties]);

  const container = window !== undefined ? () => window.document.body : undefined;

  return (
    <Box
      component="nav"
      sx={{
        flexShrink: { md: 0 },
        width: matchUpMd ? drawerWidth : 'auto',
        background: ColorTheme().sidebarBG,
        mt: !isNavbarClose ? navbarHeight : '0px'
      }}
      aria-label="mailbox folders"
    >
      <Drawer
        container={container}
        variant={matchUpMd ? 'persistent' : 'temporary'}
        anchor="left"
        open={draweropen ? true : false}
        onClose={drawerToggle}
        sx={{
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            // background: theme.palette.background.default,
            background: ColorTheme().sidebarBG,
            color: theme.palette.text.primary,
            borderRight: 'none',
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
    </Box>
  );
};

Sidebar.propTypes = {
  draweropen: PropTypes.bool,
  drawerToggle: PropTypes.func,
  window: PropTypes.object
};

export default Sidebar;
