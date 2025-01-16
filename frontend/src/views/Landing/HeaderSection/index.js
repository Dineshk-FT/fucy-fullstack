/* eslint-disable */
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { useDispatch } from 'react-redux';
import { changeCanvasPage } from '../../../store/slices/CanvasSlice';
import { makeStyles } from '@mui/styles';
import { products, cybersecurityServices, consulting, academy, contact } from './dropdown-options-data';
import { AppBar, Toolbar, Box, Typography, MenuItem, Menu, IconButton, Drawer, List, ListItem, ListItemText } from '@mui/material';
import { display } from '@mui/system';

// const services = [
//   'TARA Automation',
//   'Vulnerability Management',
//   'Cybersecurity Monitoring',
//   'Manufacturing Software',
//   'Consulting Service'
// ];

const useStyles = makeStyles((theme) => ({
  title: {
    marginRight: '60px',
    fontSize: '30px',
    fontFamily: 'Inter',
    fontWeight: '900',
    color: 'white',
    [theme.breakpoints.down('sm')]: {
      textAlign: 'center'
    }
  },
  navbarLayout: {
    display: 'flex',
    justifyContent: 'center',
    [theme.breakpoints.down('sm')]: {
      justifyContent: 'space-around'
    }
  },
  navbarMobileLayout: {
    display: 'block',
    [theme.breakpoints.down('sm')]: {
      display: 'space-around'
    }
  },
  navlink: {
    textDecoration: 'none',
    color: 'white',
    fontSize: 14,
    lineHeight: '23px',
    '&.active': {
      borderBottom: '2px solid red'
    }
  },
  dropdown: {
    color: 'white',
    fontSize: 14,
    marginLeft: '3px',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer'
  },
  dropdownActive: {
    color: 'red'
  },
  links: {
    display: 'flex',
    gap: 20,
    marginRight: 40,
    [theme.breakpoints.down('md')]: {
      display: 'none'
    }
  },
  productsContainer: {
    display: 'flex',
    padding: '10px 20px',
    [theme.breakpoints.down('sm')]: {
      display: 'block',
      width: '100%', // Make sure it takes full width on smaller screens
      padding: '5px 10px'
    }
  },
  // productsContainer: {
  //   display: 'grid',
  //   gridTemplateColumns: '1fr 1fr', // Two columns
  //   gridTemplateRows: 'auto', // Auto height
  //   gap: '10px', // Space between items
  //   padding: '10px 20px',
  // },
  productColumn: {
    display: 'flex',
    flexDirection: 'column',
    marginRight: '30px',
    [theme.breakpoints.down('sm')]: {
      display: 'block',
      marginRight: 0 // Remove margin for smaller screens
    }
  },
  productCloumnSub: {
    marginLeft: '10px',
    [theme.breakpoints.down('sm')]: {
      display: 'block',
      marginLeft: '0' // Align to the left on smaller screens
    }
  },
  productHeader: {
    fontWeight: 'bold',
    fontSize: '16px',
    marginBottom: '8px',
    textDecoration: 'underline'
  },
  menuIcon: {
    color: 'white',
    [theme.breakpoints.up('md')]: {
      display: 'none'
    }
  },
  mobileMenu: {
    width: 250,
    color: 'black'
  },
  subNested: {
    paddingLeft: theme.spacing(6)
  },
  closeButton: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: '8px',
    cursor: 'pointer'
  }
}));

export default function Header() {
  const classes = useStyles();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // const [anchorElCSMS, setAnchorElCSMS] = useState(null); // CSMS Dropdown anchor
  const [anchorElCybersecurity, setAnchorElCybersecurity] = useState(null); // Cybersecurity Dropdown anchor
  const [anchorElProducts, setAnchorElProducts] = useState(null); // Products Dropdown anchor
  const [anchorElConsulting, setAnchorElConsulting] = useState(null);
  const [anchorElAcademy, setAnchorElAcademy] = useState(null);
  const [anchorElContact, setAnchorElContact] = useState(null);
  const [draweropen, setDrawerOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState({});

  const links = [
    { name: 'Home', path: '/home' },
    { name: 'Dashboard', path: '/dashboard' },
    // { name: 'CSMS Solutions', dropdown: true, options: services },
    { name: 'Products', dropdown: true, options: products },
    { name: 'Services', dropdown: true, options: cybersecurityServices },
    { name: 'Consulting', dropdown: true, options: consulting },
    { name: 'Academy', dropdown: true, options: academy },
    { name: 'Contact Us', dropdown: true, options: contact },
    { name: 'About Us', path: '/about' },
    { name: 'Career', path: '/career' }
    // { name: 'Contact', path: '/contact' }
  ];

  const handleClose = (name) => {
    const link = links.find((link) => link.name === name);

    if (link) {
      // If the link has a path, navigate to it
      if (link.path) {
        navigate(link.path, { replace: true });
      }
    }
    // Handle specific cases without a direct path
    else if (name === 'TARA Tool') {
      dispatch(changeCanvasPage('canvas'));
      navigate('/Models', { replace: true });
    } else if (name === 'Business Enquiry') {
      navigate('/contact', { replace: true });
    } else if (name === 'Hit Us with Your Work') {
      navigate('/work', { replace: true });
    }
    // setAnchorElCSMS(null);
    setAnchorElCybersecurity(null);
    setAnchorElProducts(null);
    setAnchorElConsulting(null);
    setAnchorElAcademy(null);
    setAnchorElContact(null);
    setOpenMenus({});
  };

  const toggleDrawer = (open) => {
    setDrawerOpen(open);
  };

  const handleToggle = (menu) => {
    setOpenMenus((prevOpenMenus) => ({
      ...prevOpenMenus,
      [menu]: !prevOpenMenus[menu]
    }));
  };

  // const handleClickCSMS = (event) => {
  //   setAnchorElCSMS(event.currentTarget); // Open CSMS dropdown
  // };

  const handleClickCybersecurity = (event) => {
    setAnchorElCybersecurity(event.currentTarget); // Open Cybersecurity dropdown
  };

  const handleClickProducts = (event) => {
    setAnchorElProducts(event.currentTarget); // Open Products dropdown
  };

  const handleClickConsulting = (event) => {
    setAnchorElConsulting(event.currentTarget);
  };

  const handleClickAcademy = (event) => {
    setAnchorElAcademy(event.currentTarget);
  };
  const handleClickContactUs = (event) => {
    setAnchorElContact(event.currentTarget);
  };

  return (
    <>
      <AppBar position="fixed" style={{ background: 'rgba(0, 0, 0, 0.9)' }}>
        <Toolbar className={classes.navbarLayout}>
          <Typography variant="h5" className={classes.title}>
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
                  {
                    // link.name === 'CSMS Solutions' ? (
                    //   <Typography className={classes.dropdown} onClick={handleClickCSMS}>
                    //     {link.name} {Boolean(anchorElCSMS) ? <ArrowDropUpIcon className={classes.dropdownActive} /> : <ArrowDropDownIcon />}
                    //   </Typography>
                    // ) :
                    link.name === 'Services' ? (
                      <Typography className={classes.dropdown} onClick={handleClickCybersecurity}>
                        {link.name}{' '}
                        {Boolean(anchorElCybersecurity) ? <ArrowDropUpIcon className={classes.dropdownActive} /> : <ArrowDropDownIcon />}
                      </Typography>
                    ) : link.name === 'Products' ? (
                      <Typography className={classes.dropdown} onClick={handleClickProducts}>
                        {link.name}{' '}
                        {Boolean(anchorElProducts) ? <ArrowDropUpIcon className={classes.dropdownActive} /> : <ArrowDropDownIcon />}
                      </Typography>
                    ) : link.name === 'Consulting' ? (
                      <Typography className={classes.dropdown} onClick={(event) => handleClickConsulting(event, link.name)}>
                        {link.name}{' '}
                        {Boolean(anchorElConsulting) ? <ArrowDropUpIcon className={classes.dropdownActive} /> : <ArrowDropDownIcon />}
                      </Typography>
                    ) : link.name === 'Academy' ? (
                      <Typography className={classes.dropdown} onClick={(event) => handleClickAcademy(event, link.name)}>
                        {link.name}{' '}
                        {Boolean(anchorElAcademy) ? <ArrowDropUpIcon className={classes.dropdownActive} /> : <ArrowDropDownIcon />}
                      </Typography>
                    ) : (
                      <Typography className={classes.dropdown} onClick={(event) => handleClickContactUs(event, link.name)}>
                        {link.name}{' '}
                        {Boolean(anchorElContact) ? <ArrowDropUpIcon className={classes.dropdownActive} /> : <ArrowDropDownIcon />}
                      </Typography>
                    )
                  }
                </Box>
              )
            )}
          </Box>

          {/* Hamburger Icon for Mobile */}
          <IconButton edge="end" className={classes.menuIcon} aria-label="menu" onClick={() => toggleDrawer(true)}>
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer anchor="right" open={draweropen} onClose={() => toggleDrawer(false)}>
        <Box className={classes.mobileMenu} role="presentation">
          <IconButton onClick={() => toggleDrawer(false)}>
            <CloseIcon style={{ color: 'black' }} />
          </IconButton>
          <List>
            {links.map((link, index) => (
              <ListItem button key={index} style={{ display: 'block' }}>
                <ListItemText
                  primary={link.name}
                  onClick={() => {
                    if (link.dropdown) {
                      handleToggle(link.name);
                    } else {
                      navigate(link.path);
                    }
                  }}
                />
                {/* {link.dropdown && (
                  <IconButton
                    onClick={() => handleToggle(link.name)}
                    style={{ padding: '0', marginLeft: '8px' }}
                  >
                    {openMenus[link.name] ? (
                    <ArrowDropUpIcon />
                    ) : (
                    <ArrowDropDownIcon />
                  )}
                  </IconButton>
                )} */}
                {link.dropdown && openMenus[link.name] && (
                  <List>
                    {link.options.map((option, idx) => {
                      if (typeof option === 'string') {
                        return (
                          <ListItem button key={idx} onClick={() => handleClose(option)}>
                            <ListItemText primary={option} />
                          </ListItem>
                        );
                      }
                      return Object.entries(option).map(([key, subOptions]) => (
                        <div key={key}>
                          <ListItem disabled>{key}</ListItem>
                          {Array.isArray(subOptions) &&
                            subOptions.map((subOption, subIdx) => (
                              <ListItem button key={subIdx} onClick={() => handleClose(subOption)}>
                                <ListItemText primary={subOption.name || subOption} />
                              </ListItem>
                            ))}
                        </div>
                      ));
                    })}
                  </List>
                )}
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* CSMS Solutions Dropdown */}
      {/* <Menu id="csms-menu" anchorEl={anchorElCSMS} keepMounted open={Boolean(anchorElCSMS)} onClose={() => handleClose(null)}>
        {services.map((option, idx) => (
          <MenuItem key={idx} onClick={() => handleClose(option)}>
            {option}
          </MenuItem>
        ))}
      </Menu> */}

      {/* Cybersecurity Dropdown */}
      <Menu
        id="cybersecurity-menu"
        anchorEl={anchorElCybersecurity}
        keepMounted
        open={Boolean(anchorElCybersecurity)}
        onClose={() => handleClose(null)}
      >
        <div className={classes.productsContainer}>
          {cybersecurityServices.map((service, index) => {
            const serviceName = Object.keys(service)[0];
            const serviceOptions = service[serviceName];

            return (
              <div className={classes.productColumn} key={index}>
                <Typography className={classes.productHeader}>{serviceName}</Typography>
                {Array.isArray(serviceOptions)
                  ? // Handling options with nested structure (like Cybersecurity)
                    serviceOptions.map((subService, idx) => {
                      if (typeof subService === 'object') {
                        const subServiceName = Object.keys(subService)[0];
                        const subServiceOptions = subService[subServiceName];

                        return (
                          <div key={idx}>
                            <MenuItem disabled>{subServiceName}</MenuItem>
                            {Array.isArray(subServiceOptions) &&
                              subServiceOptions.map((option, optionIdx) => {
                                if (typeof option === 'string') {
                                  // Render simple string options
                                  return (
                                    <MenuItem key={optionIdx} onClick={() => handleClose(option)}>
                                      {option}
                                    </MenuItem>
                                  );
                                } else if (option && option.name) {
                                  // Render option with sub-options
                                  return (
                                    <div key={optionIdx}>
                                      <MenuItem disabled>{option.name}</MenuItem>
                                      {option.subOptions &&
                                        option.subOptions.map((subOption, subOptionIdx) => (
                                          <MenuItem
                                            key={subOptionIdx}
                                            onClick={() => handleClose(subOption)}
                                            className={classes.productCloumnSub}
                                          >
                                            {subOption}
                                          </MenuItem>
                                        ))}
                                    </div>
                                  );
                                }
                              })}
                          </div>
                        );
                      } else {
                        // If subService is a simple string, render it directly
                        return (
                          <MenuItem key={idx} onClick={() => handleClose(subService)}>
                            {subService}
                          </MenuItem>
                        );
                      }
                    })
                  : // Handling simpler structures like Functional Safety and SDV
                    serviceOptions &&
                    serviceOptions.map((option, idx) => (
                      <MenuItem key={idx} onClick={() => handleClose(option)}>
                        {option}
                      </MenuItem>
                    ))}
              </div>
            );
          })}
        </div>
      </Menu>

      {/* Products Dropdown */}
      <Menu id="products-menu" anchorEl={anchorElProducts} keepMounted open={Boolean(anchorElProducts)} onClose={() => handleClose(null)}>
        <div className={classes.productsContainer}>
          {products.map((product, index) => {
            const productName = Object.keys(product)[0];
            const productOptions = product[productName];

            return (
              <div className={classes.productColumn} key={index}>
                <Typography className={classes.productHeader}>{productName}</Typography>
                {productOptions.map((option, idx) => {
                  if (typeof option === 'string') {
                    // Render simple options
                    return (
                      <MenuItem key={idx} onClick={() => handleClose(option)}>
                        {option}
                      </MenuItem>
                    );
                  } else {
                    // Render option with sub-options
                    return (
                      <div key={idx}>
                        <MenuItem disabled>{option.name}</MenuItem>
                        {option.subOptions &&
                          option.subOptions.map((subOption, subIdx) => (
                            <MenuItem key={subIdx} onClick={() => handleClose(subOption)} className={classes.productCloumnSub}>
                              {subOption}
                            </MenuItem>
                          ))}
                      </div>
                    );
                  }
                })}
              </div>
            );
          })}
        </div>
      </Menu>

      {/* Consulting Dropdown */}
      <Menu
        id="consulting-menu"
        anchorEl={anchorElConsulting}
        keepMounted
        open={Boolean(anchorElConsulting)}
        onClose={() => handleClose(null)}
      >
        <div className={classes.productsContainer}>
          {consulting.map((option, idx) => (
            <div key={idx} className={classes.productColumn}>
              <MenuItem disabled>{option.name}</MenuItem>
              {option.subOptions.map((subOption, subIdx) => (
                <MenuItem key={subIdx} onClick={() => handleClose(subOption)}>
                  {subOption}
                </MenuItem>
              ))}
            </div>
          ))}
        </div>
      </Menu>

      {/* Academy Dropdown */}
      <Menu id="academy-menu" anchorEl={anchorElAcademy} keepMounted open={Boolean(anchorElAcademy)} onClose={() => handleClose(null)}>
        {academy.map((option, idx) => (
          <MenuItem key={idx} onClick={() => handleClose(option)}>
            {option}
          </MenuItem>
        ))}
      </Menu>

      {/* Contact Us Dropdown */}
      <Menu id="contact-menu" anchorEl={anchorElContact} keepMounted open={Boolean(anchorElContact)} onClose={() => handleClose(null)}>
        {contact.map((option, idx) => (
          <MenuItem key={idx} onClick={() => handleClose(option)}>
            {option}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
