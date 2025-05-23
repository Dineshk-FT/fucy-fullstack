import React from 'react';
import { Typography, Tooltip } from '@mui/material';
import { useStyles } from './styles'; // Adjust the import path as needed

const Label = React.memo(
  ({ icon, name, index, id, ids, onClick, isDark, clickedItem, iconComponents, drawerwidthChange, drawerWidth, handleOpenTable }) => {
    const classes = useStyles();
    const IconComponent = iconComponents[icon];

    return (
      <Tooltip title={name} disableHoverListener={drawerwidthChange >= drawerWidth}>
        <div>
          <div
            className={classes.labelRoot}
            style={{
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
            onKeyDown={(e) => e.key === 'Enter' && handleOpenTable(e, id, name)}
            onClick={(e) => onClick && onClick(e)}
          >
            {IconComponent && <IconComponent color={isDark ? '#64B5F6' : '#2196F3'} sx={{ fontSize: 18, opacity: 0.9 }} />}
            <Typography variant="body2" ml={1} className={classes.labelTypo} noWrap>
              {index && `${index}. `}
              {name}
              {ids && ids?.length > 0 && ` [${ids?.length}]`}
            </Typography>
          </div>
        </div>
      </Tooltip>
    );
  }
);

export default Label;
