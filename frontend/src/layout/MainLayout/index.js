/* eslint-disable*/
import React, { lazy, Suspense, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';
import { styled, useTheme } from '@mui/material/styles';
import { AppBar, Box, CssBaseline, Toolbar, useMediaQuery, Typography, Tooltip } from '@mui/material';

// project imports
import Breadcrumbs from '../../ui-component/extended/Breadcrumbs';
import Header from './Header';
import Sidebar1 from './Sidebar1';

import navigation from '../../menu-items';
import { drawerWidth, getNavbarHeight } from '../../store/constant';
import ColorTheme from '../../store/ColorTheme';
import { SET_MENU } from '../../store/actions';

// assets
import { IconChevronRight } from '@tabler/icons';
import { ArrowSquareDown } from 'iconsax-react';
import { navbarSlide } from '../../store/slices/CurrentIdSlice';
import HeaderSection from '../../views/Landing/HeaderSection';
import FadeInDiv from '../../ui-component/FadeInDiv';
import Header1 from './Header1';
import InitialModal from '../../ui-component/Modal/InitialModal';
import { ItemIcon, AttackIcon, DamageIcon, ThreatIcon, CybersecurityIcon, RiskIcon } from '../../assets/icons';
import useStore from '../../Zustand/store';

import Customization from '../Customization';

const selector = (state) => ({
  setClickedItem: state.setClickedItem,
  isCollapsed: state.isCollapsed
});

const Footer = lazy(() => import('../../views/Landing/Footer'));
// styles
const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' && prop !== 'isclose' })(
  ({ theme, open, isclose, color, draweropenstr }) => {
    const draweropen = Boolean(draweropenstr);
    // console.log('color', color)
    // console.log('isclose', isclose)
    return {
      ...theme.typography.mainContent,
      background: color?.canvaSurroundsBG,
      marginTop: getNavbarHeight(isclose),
      paddingLeft: !draweropen ? '2rem' : 'auto',
      // border: '1px solid gray',
      maxWidth: 'auto',
      // minHeight: isclose ? `100svh` : `93svh`,
      // height:!isNavbarClose ? `80svh`:`auto`,
      marginRight: 0,
      ...(!open && {
        borderRadius: 0,
        // borderBottomRightRadius: 0,
        transition: theme.transitions.create('margin', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen
        }),
        [theme.breakpoints.up('md')]: {
          // marginLeft: -drawerWidth,
          width: `calc(100% - ${drawerWidth}px)`,
          marginTop: getNavbarHeight(isclose)
        },
        [theme.breakpoints.down('md')]: {
          // marginLeft: '20px',
          width: `calc(100% - ${drawerWidth}px)`,
          paddingLeft: !draweropen ? '1.5rem' : 'auto',
          padding: '16px 16px 16px auto'
        },
        [theme.breakpoints.down('sm')]: {
          marginLeft: '10px',
          width: `calc(100% - ${drawerWidth}px)`,
          paddingLeft: !draweropen ? '1.5rem' : 'auto',
          padding: '16px 16px 16px auto',
          marginRight: '10px'
        }
      }),
      ...(open && {
        transition: theme.transitions.create('margin', {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen
        }),
        marginLeft: 0,
        // borderBottomLeftRadius: 0,
        // borderBottomRightRadius: 0,
        borderRadius: 0,
        width: `calc(100% - ${drawerWidth}px)`,
        [theme.breakpoints.down('md')]: {
          marginLeft: '20px'
        },
        [theme.breakpoints.down('sm')]: {
          marginLeft: '10px'
        }
      })
    };
  }
);

// ==============================|| MAIN LAYOUT ||============================== //

const MainLayout = ({ children }) => {
  const { setClickedItem, isCollapsed } = useStore(selector);
  const color = ColorTheme();
  // console.log('color main', color)
  const theme = useTheme();
  const matchDownMd = useMediaQuery(theme.breakpoints.down('lg'));

  // Handle left drawer
  const leftDrawerOpened = useSelector((state) => state?.customization?.opened);
  const { isNavbarClose, isDark } = useSelector((state) => state?.currentId);
  const { isCanvasPage } = useSelector((state) => state?.canvas);

  const dispatch = useDispatch();
  const handleLeftDrawerToggle = useCallback(() => {
    dispatch({ type: SET_MENU, opened: !leftDrawerOpened });
  }, [dispatch, leftDrawerOpened]);

  const handleClick = (item) => {
    setClickedItem(item); // Dispatch the action to store the clicked item
  };

  if (isCanvasPage === 'home')
    return (
      <>
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
      </>
    );

  const imageComponents = {
    AttackIcon,
    ItemIcon,
    DamageIcon,
    ThreatIcon,
    CybersecurityIcon,
    RiskIcon
  };

  return (
    <>
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <CssBaseline />
        {/* header */}
        <AppBar
          enableColorOnDark
          position="fixed"
          color="inherit"
          elevation={0}
          sx={{
            bgcolor: color?.navBG,
            height: !isNavbarClose ? getNavbarHeight(isCollapsed) : '0px',
            transition: leftDrawerOpened ? theme.transitions.create('width') : 'none',
            borderBottom: `1px solid ${color?.title}`,
            zIndex: 1300
          }}
        >
          {/* ----------------- Navbar ------------------- */}
          <Toolbar
            sx={{
              display: isNavbarClose ? 'none' : 'flex',
              transition: 'display 0.8s',
              justifyContent: 'space-between',
              py: 0,
              overflow: 'visible',
              zIndex: 1300
              // borderBottom: `0.2px solid ${color?.title}`
            }}
          >
            <Header1 />
          </Toolbar>

          {isNavbarClose && (
            <Box display="flex" justifyContent="end" onClick={() => dispatch(navbarSlide())}>
              <ArrowSquareDown size="20" color={isDark ? 'white' : 'black'} />
            </Box>
          )}
        </AppBar>

        {/*-------------------- drawer/sidebar ---------------------*/}
        <Sidebar1 draweropen={leftDrawerOpened} drawerToggle={handleLeftDrawerToggle} />

        {/* -------------------- main content -------------------------*/}
        <Main theme={theme} open={leftDrawerOpened} isclose={isCollapsed} color={color} draweropenstr={leftDrawerOpened.toString()}>
          {/* breadcrumb */}
          <Breadcrumbs separator={IconChevronRight} navigation={navigation} icon title rightAlign />
          <Customization />
          <Outlet />
        </Main>
      </Box>
      <InitialModal />
    </>
  );
};

export default React.memo(MainLayout);
