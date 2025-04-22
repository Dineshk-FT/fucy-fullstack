/*eslint-disable*/
import React from 'react';
import { Box, Tooltip, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import { makeStyles } from '@mui/styles';
import * as Icons from '@mui/icons-material';
import {
  AttackIcon,
  ItemIcon,
  DamageIcon,
  ThreatIcon,
  CybersecurityIcon,
  SystemIcon,
  CatalogIcon,
  RiskIcon,
  DocumentIcon,
  ReportIcon,
  LayoutIcon,
  ModelIcon
} from '../../../../assets/icons'; // adjust path if needed
import useStore from '../../../../Zustand/store';
import { drawerWidth } from '../../../../store/constant';

const useStyles = makeStyles((theme) => ({
  labelRoot: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: 'fit-content',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer'
  },
  labelTypo: {
    fontSize: '14px',
    fontWeight: 500
  },
  title: {
    cursor: 'pointer'
  },
  parentLabelTypo: {
    fontWeight: 600,
    fontSize: '16px'
  }
}));

const iconComponents = {
  ...Icons
};

const imageComponents = {
  AttackIcon,
  ItemIcon,
  DamageIcon,
  ThreatIcon,
  CybersecurityIcon,
  SystemIcon,
  CatalogIcon,
  RiskIcon,
  DocumentIcon,
  ReportIcon,
  LayoutIcon,
  ModelIcon
};

const selector = (state) => ({
  clickedItem: state.clickedItem
});

const LabelItem = ({ type = 'icon', icon, name, id, index, ids, onClick }) => {
  const classes = useStyles();
  const { clickedItem } = useStore(selector);
  const { drawerwidthChange } = useSelector((state) => state.canvas);
  const { isDark } = useSelector((state) => state.currentId); // adjust path
  const color = useSelector((state) => state.theme?.color); // adjust path

  const background =
    clickedItem === id
      ? isDark
        ? 'linear-gradient(90deg, rgba(100,181,246,0.25) 0%, rgba(100,181,246,0.08) 100%)'
        : 'linear-gradient(90deg, rgba(33,150,243,0.15) 0%, rgba(33,150,243,0.03) 100%)'
      : 'transparent';

  const boxShadow = clickedItem === id ? (isDark ? '0 3px 8px rgba(0,0,0,0.5)' : '0 3px 8px rgba(0,0,0,0.1)') : 'none';

  const iconColor = isDark ? '#64B5F6' : '#2196F3';

  const renderIcon = () => {
    if (type === 'image') {
      const Image = imageComponents[icon];
      return Image ? <img src={Image} alt={name} style={{ height: 20, width: 20, filter: isDark ? 'invert(1)' : 'none' }} /> : null;
    } else {
      const IconComponent = iconComponents[icon];
      return IconComponent ? <IconComponent sx={{ fontSize: 18, opacity: 0.9 }} htmlColor={iconColor} /> : null;
    }
  };

  const getTypography = () => {
    if (type === 'title') {
      return (
        <Typography
          variant="body2"
          ml={1.25}
          className={classes.labelTypo}
          fontSize={'18px !important'}
          fontWeight={600}
          noWrap
          sx={{ letterSpacing: '0.5px' }}
        >
          {name}
        </Typography>
      );
    } else if (type === 'image') {
      return (
        <Typography variant="body2" ml={1} className={classes.parentLabelTypo} noWrap>
          {name}
        </Typography>
      );
    } else {
      return (
        <Typography variant="body2" ml={1} className={classes.labelTypo} noWrap>
          {index && `${index}. `}
          {name}
          {ids && ids.length ? ` [${ids.length}]` : ''}
        </Typography>
      );
    }
  };

  return (
    <Tooltip title={name} disableHoverListener={drawerwidthChange >= drawerWidth}>
      <div>
        <Box
          color={color?.sidebarContent}
          className={type === 'title' ? classes.title : classes.labelRoot}
          sx={{
            background,
            boxShadow
          }}
          tabIndex={0}
          onClick={onClick}
          onKeyDown={(e) => e.key === 'Enter' && onClick?.(e)}
        >
          {renderIcon()}
          {getTypography()}
        </Box>
      </div>
    </Tooltip>
  );
};

export default LabelItem;
