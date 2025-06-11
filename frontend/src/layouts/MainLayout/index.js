/* eslint-disable */
import React, { lazy, Suspense, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';
import { styled, useTheme } from '@mui/material/styles';
import { AppBar, Box, CssBaseline, Toolbar } from '@mui/material';

// project imports
import Breadcrumbs from '../../components/extended/Breadcrumbs';
import Header from './Header';
import Sidebar from './Sidebar';
import FadeInDiv from '../../components/FadeInDiv';
import InitialModal from '../../components/Modal/InitialModal';
import Customization from '../Customization';
import navigation from '../../menu-items';
import { drawerWidth, getNavbarHeight } from '../../themes/constant';
import ColorTheme from '../../themes/ColorTheme';
import { SET_MENU } from '../../store/actions/actions';

// assets
import { ArrowSquareDown } from 'iconsax-react';
import { navbarSlide } from '../../store/slices/CurrentIdSlice';
import HeaderSection from '../../Website/pages/Landing/HeaderSection';
import useStore from '../../store/Zustand/store';
import { shallow } from 'zustand/shallow';
import FloatingHelper from '../FloatingHelper';

const selector = (state) => ({
  isCollapsed: state.isCollapsed
});

const Footer = lazy(() => import('../../Website/components/Footer'));

// ==============================|| MAIN LAYOUT ||============================== //
const Main = styled('main', {
  shouldForwardProp: (prop) => prop !== 'open' && prop !== 'isclose' && prop !== 'color' && prop !== 'draweropenstr'
})(({ theme, open, isclose, color, draweropenstr }) => {
  const drawerOpen = draweropenstr === 'true';

  return {
    ...theme.typography.mainContent,
    background: color?.canvaSurroundsBG,
    marginTop: getNavbarHeight(isclose),
    paddingLeft: drawerOpen ? 'auto' : '2rem',
    marginRight: 0,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create('margin', {
      easing: open ? theme.transitions.easing.easeOut : theme.transitions.easing.sharp,
      duration: open ? theme.transitions.duration.enteringScreen : theme.transitions.duration.leavingScreen
    }),
    [theme.breakpoints.down('md')]: {
      marginLeft: open ? '20px' : '0',
      padding: '16px'
    },
    [theme.breakpoints.down('sm')]: {
      marginLeft: open ? '10px' : '0',
      padding: '16px',
      marginRight: '10px'
    }
  };
});

const MainLayout = ({ children }) => {
  const { isCollapsed } = useStore(selector, shallow);
  const color = ColorTheme();
  const theme = useTheme();

  const dispatch = useDispatch();

  const { opened: leftDrawerOpened } = useSelector((state) => state.customization);
  const { isNavbarClose, isDark } = useSelector((state) => state.currentId);
  const { isCanvasPage, initialDialogOpen } = useSelector((state) => state.canvas);

  const handleLeftDrawerToggle = useCallback(() => {
    dispatch({ type: SET_MENU, opened: !leftDrawerOpened });
  }, [dispatch, leftDrawerOpened]);

  const handleNavbarSlide = () => dispatch(navbarSlide());

  // If home page
  if (isCanvasPage === 'home') {
    return (
      <FadeInDiv>
        <HeaderSection />
        <Box>
          {children}
          <Outlet />
        </Box>
        <Suspense fallback={<div>Loading Footer...</div>}>
          <Footer />
        </Suspense>
      </FadeInDiv>
    );
  }

  return (
    <>
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <CssBaseline />
        <AppBar
          enableColorOnDark
          position="fixed"
          color="inherit"
          elevation={0}
          sx={{
            bgcolor: color?.navBG,
            height: isNavbarClose ? '0px' : getNavbarHeight(isCollapsed),
            borderBottom: `1px solid ${color?.title}`,
            transition: leftDrawerOpened ? theme.transitions.create('width') : 'none',
            zIndex: 1300
          }}
        >
          {!isNavbarClose && (
            <Toolbar
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                py: 0,
                overflow: 'visible',
                zIndex: 1300
              }}
            >
              <Header />
            </Toolbar>
          )}
          {isNavbarClose && (
            <Box display="flex" justifyContent="end" onClick={handleNavbarSlide}>
              <ArrowSquareDown size="20" color={isDark ? 'white' : 'black'} />
            </Box>
          )}
        </AppBar>

        <Sidebar draweropen={leftDrawerOpened} drawerToggle={handleLeftDrawerToggle} />

        <Main theme={theme} open={leftDrawerOpened} isclose={isCollapsed} color={color} draweropenstr={String(leftDrawerOpened)}>
          <Breadcrumbs separator={<ArrowSquareDown size="12" />} navigation={navigation} icon title rightAlign />
          <Customization />
          <FloatingHelper />
          <Outlet />
        </Main>
      </Box>

      {initialDialogOpen && <InitialModal />}
    </>
  );
};

export default React.memo(MainLayout);
