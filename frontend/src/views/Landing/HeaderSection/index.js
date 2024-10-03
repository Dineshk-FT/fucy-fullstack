/* eslint-disable */
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import { AppBar, Toolbar, Box, Typography, MenuItem, Menu, IconButton, Drawer, List, ListItem, ListItemText } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { makeStyles } from '@mui/styles';
import { useDispatch, useSelector } from 'react-redux';
import { changeCanvasPage } from '../../../store/slices/CanvasSlice';
import ColorTheme from '../../../store/ColorTheme';
import { textAlign } from '@mui/system';

// const services = [
//   'TARA Automation',
//   'Vulnerability Management',
//   'Cybersecurity Monitoring',
//   'Manufacturing Software',
//   'Consulting Service'
// ];

const products = [
  'Cybersecurity',
  'SDV',
  'Fuctional Safety',
];

// const links = [
//   { name: 'Home', path: '/home' },
//   { name: 'Dashboard', path: '/dashboard' },
//   { name: 'CSMS Solutions ', dropdown: true },
//   { name: 'About Us', path: '/about' },
//   { name: 'Career', path: '/career' },
//   { name: 'Contact', path: '/contact' }
// ];

const links = [
  { name: 'Home', path: '/home' },
  { name: 'Products', dropdown:true},
  { name: 'Services', path: '/services' },
  { name: 'Consulting', path: '/consulting' },
  { name: 'Academy', path: '/academy' },
  { name: 'Contact', path: '/contact' }
];

const useStyles = makeStyles((theme) => ({
  title: {
    flexGrow: 1,
    fontSize: '25px',
    fontFamily: 'Inter',
    [theme.breakpoints.down('sm')]: {
      textAlign: 'center'
    }
  },
  navlink: {
    textDecoration: 'none',
    color: 'white',
    fontSize: 16,
    lineHeight: '23px',

    '&.active': {
      borderBottom: '2px solid white'
    }
  },
  drawerlistItem: {
    margin: '9px 15px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  dropdown: {
    color: 'white',
    fontSize: 16,
    marginLeft: '3px',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer'
  },
  links: {
    display: 'flex',
    gap: 25,
    marginRight: 40,
    [theme.breakpoints.down('md')]: {
      display: 'none'
    }
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up('md')]: {
      display: 'none'
    }
  },
  drawerPaper: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)' // semi-transparent background
  },
  drawerList: {
    width: 250
  },
  listItem: {
    color: 'white' // Ensure list items are white
  },
  closeButton: {
    display: 'flex',
    justifyContent: 'flex-end'
    // padding: theme.spacing(1),
  }
}));

export default function Header() {
  const classes = useStyles();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { pageName } = useSelector((state) => state.pageName);

  const handleClose = (name) => {
    if (name === 'TARA Automation') {
      dispatch(changeCanvasPage('canvas'));
      navigate('/login', { replace: true });
    }
    if (name === 'Cybersecurity') {
      dispatch(changeCanvasPage('canvas'));
      navigate('/cybersecurity', { replace: true });
    }
    setAnchorEl(null);
    setMenuOpen(false);
    setDrawerOpen(false); 
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    setMenuOpen((prev) => !prev);
  };

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const drawer = (
    <div className={classes.drawerList} role="presentation">
      <div className={classes.closeButton}>
        <IconButton onClick={toggleDrawer(false)}>
          <CloseIcon style={{ color: 'white' }} />
        </IconButton>
      </div>
      <List>
        {links.map((link, index) => (
          <React.Fragment key={index}>
            {!link.dropdown ? (
              <ListItem button component={NavLink} to={link.path} className={classes.listItem}>
                <ListItemText
                  primary={link.name}
                  sx={{
                    '& .MuiTypography-root': {
                      color: 'white'
                    }
                  }}
                />
              </ListItem>
            ) : (
              <>
                <Box key={index} className={classes.listItem}>
                  <Typography onClick={handleClick} className={classes.drawerlistItem}>
                    {link.name} {menuOpen ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
                  </Typography>
                  <Menu id="simple-menu" anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
                    {products.map((service, index) => (
                      <MenuItem key={index} onClick={() => handleClose(service)}>
                        {service}
                      </MenuItem>
                    ))}
                  </Menu>
                </Box>
              </>
            )}
          </React.Fragment>
        ))}
      </List>
    </div>
  );

  return (
    <>
      <AppBar position="fixed" style={{ background: pageName === 'home' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.9)' }}>
        <Toolbar>
          <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu" onClick={toggleDrawer(true)}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title} color={ColorTheme()?.logo} >
            FUCY TECH
          </Typography>
          <Box className={classes.links}>
            {links.map((link, index) =>
              !link.dropdown ? (
                <NavLink key={index} className={classes.navlink} to={link.path}>
                  {link.name}
                </NavLink>
              ) : (
                <Box key={index}>
                  <Typography className={classes.dropdown} onClick={handleClick}>
                    {link.name} {menuOpen ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
                  </Typography>
                  <Menu id="simple-menu" anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
                    {products.map((service, index) => (
                      <MenuItem key={index} onClick={() => handleClose(service)}>
                        {service}
                      </MenuItem>
                    ))}
                  </Menu>
                </Box>
              )
            )}
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)} classes={{ paper: classes.drawerPaper }}>
        {drawer}
      </Drawer>
    </>
  );
}
