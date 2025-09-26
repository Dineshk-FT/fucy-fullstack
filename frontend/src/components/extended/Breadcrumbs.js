import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Box, Card, Divider, Grid, Typography } from '@mui/material';
import MuiBreadcrumbs from '@mui/material/Breadcrumbs';

// project imports
import config from '../../config';
import { gridSpacing } from '../../themes/constant';

// assets
import { IconTallymark1 } from '@tabler/icons';
import AccountTreeTwoToneIcon from '@mui/icons-material/AccountTreeTwoTone';
import HomeIcon from '@mui/icons-material/Home';
import HomeTwoToneIcon from '@mui/icons-material/HomeTwoTone';

const linkSX = (theme) => ({
  display: 'inline-flex',
  color: theme.palette.text.primary,
  textDecoration: 'none',
  alignItems: 'center',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  padding: theme.spacing(0.5, 1.5),
  borderRadius: '8px',
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  position: 'relative',
  overflow: 'hidden',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
    opacity: 0,
    transition: 'opacity 0.3s ease',
    zIndex: 0,
  },
  '&:hover': {
    color: theme.palette.primary.contrastText,
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    zIndex: 1,
    '&:before': {
      opacity: 1,
    },
    '& .MuiSvgIcon-root': {
      transform: 'scale(1.1) translateX(2px)',
    }
  },
  '&:active': {
    transform: 'translateY(0)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  '&.Mui-disabled': {
    backgroundColor: theme.palette.action.disabledBackground,
    color: theme.palette.text.disabled,
    pointerEvents: 'none',
    boxShadow: 'none',
  },
  '& > *': {
    position: 'relative',
    zIndex: 1,
  }
});

// ==============================|| BREADCRUMBS ||============================== //

const Breadcrumbs = ({ card, divider, icon, icons, maxItems, navigation, rightAlign, separator, title, titleBottom, ...others }) => {
  const theme = useTheme();

  const iconStyle = (theme) => ({
    marginRight: theme.spacing(1),
    width: '1.1rem',
    height: '1.1rem',
    color: 'inherit',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    flexShrink: 0,
    'a:hover &': {
      transform: 'scale(1.15)'
    }
  });

  const [main, setMain] = useState();
  const [item, setItem] = useState();

  // set active item state
  const getCollapse = (menu) => {
    if (menu.children) {
      menu.children.filter((collapse) => {
        if (collapse.type === 'collapse') {
          getCollapse(collapse);
        } else if (collapse.type === 'item') {
          if (document.location.pathname === config.basename + collapse.url) {
            setMain(menu);
            setItem(collapse);
          }
        }
        return false;
      });
    }
  };

  useEffect(() => {
    navigation?.items?.forEach((menu) => {
      if (menu.type === 'group') {
        getCollapse(menu);
      }
    });
  }, [navigation]);

  // item separator with animation
  const Separator = () => (
    <Box 
      component="span" 
      sx={{
        mx: 1,
        display: 'inline-flex',
        alignItems: 'center',
        color: theme.palette.text.disabled,
        '& svg': {
          transition: 'all 0.3s ease',
          opacity: 0.7,
          '&:hover': {
            transform: 'rotate(90deg)',
            opacity: 1,
            color: theme.palette.primary.main
          }
        }
      }}
    >
      {separator && typeof separator === 'function' ? 
        React.createElement(separator, { stroke: 1.5, size: '1rem' }) : 
        <IconTallymark1 stroke={1.5} size="1rem" />
      }
    </Box>
  );

  let mainContent;
  let itemContent;
  let breadcrumbContent = <Typography />;
  let itemTitle = '';
  let CollapseIcon;
  let ItemIcon;

  // collapse item
  if (main && main.type === 'collapse') {
    CollapseIcon = main.icon || AccountTreeTwoToneIcon;
    mainContent = (
      <Typography 
        component={Link} 
        to="#" 
        variant="subtitle1" 
        sx={linkSX}
        aria-label={`Navigate to ${main.title}`}
      >
        {icons && <CollapseIcon style={iconStyle} aria-hidden="true" />}
        {main.title}
      </Typography>
    );
  }

  // items
  if (item && item.type === 'item') {
    itemTitle = item.title;
    ItemIcon = item.icon || AccountTreeTwoToneIcon;
    itemContent = (
      <Typography
        variant="subtitle1"
        sx={{
          display: 'flex',
          textDecoration: 'none',
          alignContent: 'center',
          alignItems: 'center',
          color: 'grey.500'
        }}
      >
        {icons && <ItemIcon style={iconStyle} />}
        {itemTitle}
      </Typography>
    );

    if (item.breadcrumbs !== false) {
      breadcrumbContent = (
        <Card
          elevation={card === false ? 0 : 2}
          sx={{
            marginBottom: card === false ? 0 : theme.spacing(gridSpacing),
            border: 'none',
            background: card === false ? 'transparent' : theme.palette.background.paper,
            borderRadius: '12px',
            overflow: 'visible',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: theme.shadows[4],
              transform: 'translateY(-2px)'
            },
            '&:before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              borderTopLeftRadius: 'inherit',
              borderTopRightRadius: 'inherit',
              opacity: 0.9,
              transition: 'all 0.3s ease'
            }
          }}
          {...others}
        >
          <Box sx={{ 
            p: 2.5, 
            pl: card === false ? 0 : 2.5,
            backgroundColor: theme.palette.background.default,
            borderRadius: 1,
            '@media (max-width: 600px)': {
              p: 1.5,
              pl: card === false ? 0 : 1.5,
            }
          }}>
            <Grid
              container
              direction={rightAlign ? 'row' : 'column'}
              justifyContent={rightAlign ? 'space-between' : 'flex-start'}
              alignItems={rightAlign ? 'center' : 'flex-start'}
              spacing={1}
            >
              {title && !titleBottom && (
                <Grid item>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 700,
                      color: theme.palette.getContrastText(theme.palette.background.paper),
                      textShadow: `0 2px 4px ${theme.palette.action.hover}`,
                      display: 'inline-block',
                      lineHeight: 1.3,
                      background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateX(2px)'
                      },
                      '@media (max-width: 600px)': {
                        fontSize: '1.5rem',
                        lineHeight: 1.2
                      }
                    }}
                  >
                    {item.title}
                  </Typography>
                </Grid>
              )}
              <Grid item>
                <MuiBreadcrumbs
                  sx={{
                    '& .MuiBreadcrumbs-separator': {
                      display: 'none' // Hide default separator
                    },
                    '& .MuiBreadcrumbs-ol': {
                      flexWrap: 'wrap',
                      gap: '4px',
                      '& > li': {
                        display: 'flex',
                        alignItems: 'center',
                        '&:not(:last-child)::after': {
                          content: '""',
                          display: 'inline-block',
                          width: '16px',
                          height: '16px',
                          backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23999\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'M5 12h14M12 5l7 7-7 7\'/%3E%3C/svg%3E")',
                          backgroundSize: 'contain',
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'center',
                          margin: '0 4px',
                          opacity: 0.7,
                          transition: 'all 0.3s ease'
                        }
                      }
                    },
                    '& .MuiBreadcrumbs-li:last-child .MuiTypography-root': {
                      color: theme.palette.primary.contrastText,
                      fontWeight: 600,
                      backgroundColor: theme.palette.primary.main,
                      padding: theme.spacing(0.5, 1.5),
                      borderRadius: '8px',
                      boxShadow: `0 2px 4px ${theme.palette.primary.main}40`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: `0 4px 8px ${theme.palette.primary.main}60`,
                        backgroundColor: theme.palette.primary.dark
                      }
                    },
                    '@media (max-width: 600px)': {
                      '& .MuiBreadcrumbs-ol': {
                        '& > li:not(:last-child) span': {
                          display: 'none' // Hide text on mobile, show only icons
                        },
                        '& > li:last-child span': {
                          display: 'inline' // Always show current page text
                        }
                      }
                    }
                  }}
                  aria-label="Breadcrumb navigation"
                  maxItems={maxItems || 5}
                  itemsAfterCollapse={2}
                  itemsBeforeCollapse={1}
                  separator={<Separator />}
                >
                  <Typography 
                    component={Link} 
                    to="/" 
                    color="inherit" 
                    variant="subtitle1" 
                    sx={linkSX}
                    aria-label="Go to dashboard"
                  >
                    {icons && <HomeTwoToneIcon sx={iconStyle} aria-hidden="true" />}
                    {icon && <HomeIcon sx={{ ...iconStyle, mr: 0 }} aria-hidden="true" />}
                    {!icon && 'Dashboard'}
                  </Typography>
                  {mainContent}
                  {itemContent}
                </MuiBreadcrumbs>
              </Grid>
              {title && titleBottom && (
                <Grid item>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 700,
                      color: theme.palette.getContrastText(theme.palette.background.paper),
                      textShadow: `0 2px 4px ${theme.palette.action.hover}`,
                      display: 'inline-block',
                      lineHeight: 1.3,
                      background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateX(2px)'
                      },
                      '@media (max-width: 600px)': {
                        fontSize: '1.5rem',
                        lineHeight: 1.2
                      }
                    }}
                  >
                    {item.title}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Box>
          {card === false && divider !== false && <Divider sx={{ borderColor: theme.palette.primary.main, mb: gridSpacing }} />}
        </Card>
      );
    }
  }

  return breadcrumbContent;
};

Breadcrumbs.propTypes = {
  card: PropTypes.bool,
  divider: PropTypes.bool,
  icon: PropTypes.bool,
  icons: PropTypes.bool,
  maxItems: PropTypes.number,
  navigation: PropTypes.object,
  rightAlign: PropTypes.bool,
  separator: PropTypes.oneOfType([PropTypes.func]),
  title: PropTypes.bool,
  titleBottom: PropTypes.bool
};

export default React.memo(Breadcrumbs);
