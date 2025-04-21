/* eslint-disable */
import React, { lazy, Suspense, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';
import { styled, useTheme } from '@mui/material/styles';
import { AppBar, Box, CssBaseline, Toolbar } from '@mui/material';
import Breadcrumbs from '../../ui-component/extended/Breadcrumbs';
import Header1 from './Header1';
import Sidebar1 from './Sidebar1';
import FadeInDiv from '../../ui-component/FadeInDiv';
import InitialModal from '../../ui-component/Modal/InitialModal';
import ColorTheme from '../../store/ColorTheme';
import Customization from '../Customization';
import navigation from '../../menu-items';
import { drawerWidth, getNavbarHeight } from '../../store/constant';
import { SET_MENU } from '../../store/actions';
import { navbarSlide } from '../../store/slices/CurrentIdSlice';
import { ArrowSquareDown } from 'iconsax-react';
import HeaderSection from '../../views/Landing/HeaderSection';
import useStore from '../../Zustand/store';

const Footer = lazy(() => import('../../views/Landing/Footer'));

const selector = (state) => ({
  isCollapsed: state.isCollapsed
});

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
  const { isCollapsed } = useStore(selector);
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
              <Header1 />
            </Toolbar>
          )}
          {isNavbarClose && (
            <Box display="flex" justifyContent="end" onClick={handleNavbarSlide}>
              <ArrowSquareDown size="20" color={isDark ? 'white' : 'black'} />
            </Box>
          )}
        </AppBar>

        <Sidebar1 draweropen={leftDrawerOpened} drawerToggle={handleLeftDrawerToggle} />

        <Main theme={theme} open={leftDrawerOpened} isclose={isCollapsed} color={color} draweropenstr={String(leftDrawerOpened)}>
          <Breadcrumbs separator={<ArrowSquareDown size="12" />} navigation={navigation} icon title rightAlign />
          <Customization />
          <Outlet />
        </Main>
      </Box>

      {initialDialogOpen && <InitialModal />}
    </>
  );
};

export default React.memo(MainLayout);
