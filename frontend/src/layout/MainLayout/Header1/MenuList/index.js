/*eslint-disable*/
import * as React from 'react';
import { makeStyles } from '@mui/styles';
import { Box, Tabs, Tab, Typography, Tooltip } from '@mui/material';
import ColorTheme from '../../../../store/ColorTheme';
import AttackIcon from '../../../../assets/icons/attack.png';
import ItemIcon from '../../../../assets/icons/item.png';
import DamageIcon from '../../../../assets/icons/damage.png';
import ThreatIcon from '../../../../assets/icons/threat.png';
import CybersecurityIcon from '../../../../assets/icons/cybersecurity.png';
import RiskIcon from '../../../../assets/icons/risk.png';

const imageComponents = {
  AttackIcon,
  ItemIcon,
  DamageIcon,
  ThreatIcon,
  CybersecurityIcon,
  RiskIcon
};

const useStyles = makeStyles(() => ({
  tab: {
    borderBottom: 1,
    display: 'flex',
    borderColor: 'transparent !important'
    // flexDirection: 'column'
  }
}));

function a11yProps(index) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`
  };
}

export default function MenuList() {
  const classes = useStyles();
  const color = ColorTheme();
  const [value, setValue] = React.useState('1');
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const tabs = [
    {
      label: 'Item Definition',
      value: '1',
      icon: 'ItemIcon'
    },
    {
      label: 'Damage Scenarios',
      value: '3',
      icon: 'DamageIcon'
    },
    {
      label: 'Threat Scenarios',
      value: '4',
      icon: 'ThreatIcon'
    },
    {
      label: 'Attack Path Analysis',
      value: '5',
      icon: 'AttackIcon'
    },
    {
      label: 'Risk Treatment and Determination',
      value: '6',
      icon: 'RiskIcon'
    },
    {
      label: 'Cybersecurity Goals and Requirements',
      value: '7',
      icon: 'CybersecurityIcon'
    }
  ];

  const getImageLabel = (item) => {
    const Image = imageComponents[item?.icon];
    const maxLength = 20;
    const isLongLabel = item?.label.length > maxLength;
    const displayLabel = isLongLabel ? `${item.label.slice(0, maxLength)}...` : item.label;

    return (
      <Box display="flex" alignItems="center" justifyContent="flex-start" gap={2}>
        {Image ? <img src={Image} alt={item.label} style={{ height: '20px', width: '20px' }} /> : null}
        <Tooltip title={item.label} arrow disableHoverListener={!isLongLabel}>
          <Typography variant="body2" sx={{ fontSize: 12, color: color?.tabContentClr, fontFamily: 'Inter' }}>
            {displayLabel}
          </Typography>
        </Tooltip>
      </Box>
    );
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'background.paper', display: 'flex', width: '100%' }}>
      <Tabs
        orientation="vertical"
        variant="scrollable"
        value={value}
        onChange={handleChange}
        aria-label="Vertical tabs example"
        sx={{ borderRight: 1, borderColor: 'divider', width: '100%' }}
      >
        {tabs.map((item, i) => (
          <Tab key={i} label={getImageLabel(item)} value={item.value} {...a11yProps(i)} sx={{ flexGrow: 1, alignSelf: 'flex-start' }} />
        ))}
      </Tabs>
    </Box>
  );
}
