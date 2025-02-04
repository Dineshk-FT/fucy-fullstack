/* eslint-disable*/
import { lazy, Suspense } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';
import { styled, useTheme } from '@mui/material/styles';
import { AppBar, Box, CssBaseline, Toolbar, useMediaQuery, Typography, Tooltip } from '@mui/material';

// project imports
import Breadcrumbs from '../../ui-component/extended/Breadcrumbs';
import Header from './Header';
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
import { ItemIcon, AttackIcon, DamageIcon, ThreatIcon, CybersecurityIcon, RiskIcon } from '../../assets/icons';
import useStore from '../../Zustand/store';

// import Customization from '../Customization';

// const items = [
//   {
//     name: 'ItemIcon',
//     id: 1
//   },
//   {
//     name: 'DamageIcon',
//     id: 2
//   },
//   {
//     name: 'ThreatIcon',
//     id: 3
//   },
//   {
//     name: 'AttackIcon',
//     id: 4
//   },
//   {
//     name: 'RiskIcon',
//     id: 8
//   },
//   {
//     name: 'CybersecurityIcon',
//     id: 5
//   },
// ]

const selector = (state) => ({
  setClickedItem: state.setClickedItem
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
      marginTop: navbarHeight,
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
          marginTop: isclose ? `0` : navbarHeight
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
  const { setClickedItem } = useStore(selector);
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

  // const getImageLabel = (item) => {
  //   const Image = imageComponents[item?.name];
  //   const isLongLabel = item?.label.length > 40;
  //   const displayLabel = isLongLabel ? `${item.label.slice(0, 40)}...` : item.label;

  //   return (
  //     <Box display="flex" alignItems="center" gap={2}>
  //       {Image && <img src={Image} alt={item.label} style={{ height: '14px', width: '14px' }} />}
  //       <Tooltip title={item.label} arrow disableHoverListener={!isLongLabel}>
  //         <Typography variant="body2" sx={{ fontSize: 12, color: 'black', fontFamily: 'Inter', color: color?.title }}>
  //           {displayLabel}
  //         </Typography>
  //       </Tooltip>
  //     </Box>
  //   );
  // };

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
            height: !isNavbarClose ? navbarHeight : '0px',
            transition: leftDrawerOpened ? theme.transitions.create('width') : 'none',
            borderBottom: `1px solid ${color?.title}`
          }}
        >
          {/* ----------------- Navbar ------------------- */}
          <Toolbar
            sx={{
              display: isNavbarClose ? 'none' : 'flex',
              transition: 'display 0.8s',
              justifyContent: 'space-between',
              py: 0
              // borderBottom: `0.2px solid ${color?.title}`
            }}
          >
            {/* <Header handleLeftDrawerToggle={handleLeftDrawerToggle} /> */}
            <Header1 />
          </Toolbar>
          {/* <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              gap: 2,
              px: 4,
              fontSize: '11px', 
              '& *': {
                fontSize: '11px'
              }
            }}
          >
            {items.map((icon, index) => {
              const name = icon.name
              return (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  cursor: 'pointer',
                  fontSize: 'inherit',
                  transition: 'background-color 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                    borderRadius: '4px'
                  }
                }}
                onClick={() => handleClick(icon.id)} // Handle click event to dispatch action
              >
                {getImageLabel({
                  name,
                  label: [
                    'Item Definition',
                    'Damage Scenarios',
                    'Threat Scenarios',
                    'Attack Path Analysis',
                    'Risk Treatment',
                    'Cybersecurity Goals'
                  ][index]
                })}
              </Box>
            )})}
          </Box> */}
          {isNavbarClose && (
            <Box display="flex" justifyContent="end" onClick={() => dispatch(navbarSlide())}>
              <ArrowSquareDown size="20" color={isDark ? 'white' : 'black'} />
            </Box>
          )}
        </AppBar>

        {/*-------------------- drawer/sidebar ---------------------*/}
        <Sidebar1 draweropen={leftDrawerOpened} drawerToggle={handleLeftDrawerToggle} />

        {/* -------------------- main content -------------------------*/}
        <Main theme={theme} open={leftDrawerOpened} isclose={isNavbarClose} color={color} draweropenstr={leftDrawerOpened.toString()}>
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
