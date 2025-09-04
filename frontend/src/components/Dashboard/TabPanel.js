/*eslint-disable*/
import React from 'react';
import PropTypes from 'prop-types';
import { Fade, Box, Grow } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ColorTheme from '../../themes/ColorTheme';

const TabPanel = ({ children, value, index, ...other }) => {
  const theme = useTheme();
  const colors = ColorTheme();
  const isActive = value === index;

  return (
    <div
      role="tabpanel"
      hidden={!isActive}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      <Fade
        in={isActive}
        timeout={theme.transitions.duration.enteringScreen}
        mountOnEnter
        unmountOnExit
      >
        <Box
          sx={{
            p: { xs: 1.5, sm: 2, md: 3 },
            opacity: isActive ? 1 : 0,
            transition: theme.transitions.create('opacity', {
              duration: theme.transitions.duration.enteringScreen,
            }),
          }}
        >
          <Grow in={isActive} timeout={theme.transitions.duration.enteringScreen}>
            <div>{children}</div>
          </Grow>
        </Box>
      </Fade>
    </div>
  );
};

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
  other: PropTypes.object
};

export default TabPanel;