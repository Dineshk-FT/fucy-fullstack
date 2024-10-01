/* eslint-disable*/
import { lazy, Suspense } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';
import { styled, useTheme } from '@mui/material/styles';
import { AppBar, Box, CssBaseline, Toolbar, useMediaQuery } from '@mui/material';

// project imports
import Breadcrumbs from '../../ui-component/extended/Breadcrumbs';
import Header from './Header';
import Sidebar from './Sidebar';
import Sidebar1 from './Sidebar1';

import navigation from '../../menu-items';
import { navbarHeight, drawerWidth } from '../../store/constant';
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

// import Customization from '../Customization';

const Footer = lazy(() => import('../../views/Landing/Footer'));
// styles
const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(({ theme, open, isclose, color, drawerOpen }) => {
  // console.log('color', color)
  // console.log('isclose', isclose)
  return {
    ...theme.typography.mainContent,
    background: color?.canvaSurroundsBG,
    marginTop: navbarHeight,
    paddingLeft: !drawerOpen ? '2rem' : 'auto',
    // border: '1px solid gray',
    maxWidth: 'auto', // minHeight:'inherit',
    minHeight: isclose == true ? `100svh` : `93svh`,
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
        marginTop: isclose == true ? `0` : navbarHeight
      },
      [theme.breakpoints.down('md')]: {
        // marginLeft: '20px',
        width: `calc(100% - ${drawerWidth}px)`,
        paddingLeft: !drawerOpen ? '1.5rem' : 'auto',
        padding: '16px 16px 16px auto'
      },
      [theme.breakpoints.down('sm')]: {
        marginLeft: '10px',
        width: `calc(100% - ${drawerWidth}px)`,
        paddingLeft: !drawerOpen ? '1.5rem' : 'auto',
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
});

// ==============================|| MAIN LAYOUT ||============================== //

const MainLayout = ({ children }) => {
  const color = ColorTheme();
  // console.log('color main', color)
  const theme = useTheme();
  const matchDownMd = useMediaQuery(theme.breakpoints.down('lg'));

  // Handle left drawer
  const leftDrawerOpened = useSelector((state) => state?.customization?.opened);
  const { isNavbarClose, isDark } = useSelector((state) => state?.currentId);
  const { isCanvasPage } = useSelector((state) => state?.canvas);

  // useEffect(() => {
  //   dispatch({ type: SET_MENU, opened: !matchDownMd });
  // }, [matchDownMd]);

  const dispatch = useDispatch();
  const handleLeftDrawerToggle = () => {
    dispatch({ type: SET_MENU, opened: !leftDrawerOpened });
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

  return (
    <>
      <Box sx={{ display: 'flex', height: '80svh' }}>
        <CssBaseline />
        {/* header */}
        <AppBar
          enableColorOnDark
          position="fixed"
          color="inherit"
          elevation={0}
          sx={{
            bgcolor: color?.navBG,
            height: !isNavbarClose ? navbarHeight : '0px',
            transition: leftDrawerOpened ? theme.transitions.create('width') : 'none'
          }}
        >
          {/* ----------------- Navbar ------------------- */}
          <Toolbar sx={{ display: isNavbarClose ? 'none' : 'flex', transition: 'display 0.8s', justifyContent: 'space-between' }}>
            {/* <Header handleLeftDrawerToggle={handleLeftDrawerToggle} /> */}
            <Header1 />
          </Toolbar>
          {isNavbarClose && (
            <Box display="flex" justifyContent="end" onClick={() => dispatch(navbarSlide())}>
              <ArrowSquareDown size="20" color={isDark ? 'white' : 'black'} />
            </Box>
          )}
        </AppBar>

        {/*-------------------- drawer/sidebar ---------------------*/}
        {/* <Sidebar drawerOpen={leftDrawerOpened} drawerToggle={handleLeftDrawerToggle} /> */}
        <Sidebar1 drawerOpen={leftDrawerOpened} drawerToggle={handleLeftDrawerToggle} />

        {/* -------------------- main content -------------------------*/}
        <Main theme={theme} open={leftDrawerOpened} isclose={isNavbarClose} color={color} drawerOpen={leftDrawerOpened}>
          {/* breadcrumb */}
          <Breadcrumbs separator={IconChevronRight} navigation={navigation} icon title rightAlign />
          <Outlet />
        </Main>
      </Box>
      <InitialModal />
    </>
  );
};

export default MainLayout;
