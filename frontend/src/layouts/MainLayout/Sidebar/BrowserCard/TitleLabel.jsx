import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import { useStyles } from './styles'; // Adjust the import path as needed

const TitleLabel = React.memo(
  ({ icon, name, id, isDark, clickedItem, handleTitleClick, imageComponents, drawerwidthChange, drawerWidth, color }) => {
    const classes = useStyles();
    const Image = imageComponents[icon];

    return (
      <Tooltip title={name} disableHoverListener={drawerwidthChange >= drawerWidth}>
        <Box
          color={color?.sidebarContent}
          className={classes.title}
          sx={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: 'fit-content',
            display: 'flex',
            alignItems: 'center',
            background:
              clickedItem === id
                ? isDark
                  ? 'linear-gradient(90deg, rgba(100,181,246,0.25) 0%, rgba(100,181,246,0.08) 100%)'
                  : 'linear-gradient(90deg, rgba(33,150,243,0.15) 0%, rgba(33,150,243,0.03) 100%)'
                : 'transparent',
            boxShadow: clickedItem === id ? (isDark ? '0 3px 8px rgba(0,0,0,0.5)' : '0 3px 8px rgba(0,0,0,0.1)') : 'none'
          }}
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleTitleClick(e)}
        >
          {Image && <img src={Image} alt={name} style={{ height: '20px', width: '20px', filter: isDark ? 'invert(1)' : 'none' }} />}
          <Typography
            variant="body2"
            ml={1.25}
            className={classes.labelTypo}
            color="inherit"
            fontSize={'18px !important'}
            fontWeight={600}
            noWrap
            sx={{ letterSpacing: '0.5px' }}
          >
            {name}
          </Typography>
        </Box>
      </Tooltip>
    );
  }
);

export default TitleLabel;
