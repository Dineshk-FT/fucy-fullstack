import * as React from 'react';
import { makeStyles } from '@mui/styles';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import ColorTheme from '../../../../themes/ColorTheme';
import AttackIcon from '../../../../assets/icons/attack.png';
import ItemIcon from '../../../../assets/icons/item.png';
import DamageIcon from '../../../../assets/icons/damage.png';
import ThreatIcon from '../../../../assets/icons/threat.png';
import CybersecurityIcon from '../../../../assets/icons/cybersecurity.png';
import RiskIcon from '../../../../assets/icons/risk.png';
import { Typography } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import { useDispatch, useSelector } from 'react-redux';
import { changeMode, navbarSlide } from '../../../../store/slices/CurrentIdSlice';
import { ArrowSquareDown, ArrowSquareUp } from 'iconsax-react';

const imageComponents = {
  AttackIcon,
  ItemIcon,
  DamageIcon,
  ThreatIcon,
  CybersecurityIcon,
  RiskIcon
};

const useStyles = makeStyles((theme) => ({
  tab: {
    borderBottom: 1,
    display: 'flex',
    borderColor: 'transparent !important',
    [theme.breakpoints.down('md')]: {
      width: '96%'
    },
    [theme.breakpoints.down('sm')]: {
      width: '90%'
    },
    [theme.breakpoints.down('xs')]: {
      width: '80%'
    }
  }
}));

export default function MenuList() {
  const classes = useStyles();
  const color = ColorTheme();
  const dispatch = useDispatch();
  const [value, setValue] = React.useState('1');
  const { isDark, isNavbarClose } = useSelector((state) => state?.currentId);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  const handleChangeMode = () => {
    dispatch(changeMode());
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
    // {
    //     label: 'User Authorization',
    //     value: '9'
    // }
    // {
    //     label: 'Collaboration',
    //     value: '10'
    // },
    // {
    //     label: 'Project Management',
    //     value: '11'
    // },
    // {
    //     label: 'Reports',
    //     value: '12'
    // }
  ];

  const getImageLabel = (item) => {
    // console.log('item?.icon', item?.icon);
    const Image = imageComponents[item?.icon];
    // console.log('Image', Image);
    return (
      <div>
        {Image ? <img src={Image} alt={item.label} style={{ height: '20px', width: '20px' }} /> : null}
        <Typography variant="body2" sx={{ fontSize: 12, color: color?.tabContentClr, fontFamily: 'Inter' }}>
          {item?.label}
        </Typography>
      </div>
    );
  };

  return (
    <Box sx={{ width: '100%', typography: 'body1', mt: 2 }}>
      <TabContext value={value}>
        <Box className={classes?.tab}>
          <TabList
            sx={{
              border: `2px solid ${color?.tabBorder}`,
              width: '100%',
              '& .MuiTabs-scroller': {
                overflowX: 'auto !important',
                scrollbarWidth: 'none',
                background: color?.tabBG,
                marginRight: { sm: '2rem', md: '2rem', lg: '1rem' },
                '& .Mui-selected': {
                  // background: ColorTheme.selectedTab,
                  // border: '2px solid red',
                  color: `${color?.tabContentClr} !important`
                },
                '& .MuiTabs-indicator ': {
                  backgroundColor: `${color?.selectedTab} !important`
                  //   display:'none'
                },
                '& .MuiButtonBase-root': {
                  // color:'black'
                }
              }
            }}
            onChange={handleChange}
            aria-label="lab API tabs example"
          >
            {tabs.map((item, i) => (
              <Tab key={i} label={getImageLabel(item)} value={item?.value} sx={{ width: item?.label.length < 25 ? '200px' : '300px' }} />
            ))}
          </TabList>
          <Box sx={{ width: '10%' }} display="flex" flexDirection="column" gap={2} alignItems="center" justifyContent="center">
            <Box onClick={handleChangeMode} sx={{ cursor: 'pointer' }}>
              {isDark ? <NightsStayIcon sx={{ color: 'white' }} /> : <LightModeIcon />}
            </Box>
            <Box onClick={() => dispatch(navbarSlide())}>
              {!isNavbarClose ? (
                <ArrowSquareUp size="20" color={color?.iconColor} />
              ) : (
                <ArrowSquareDown size="20" color={color?.iconColor} />
              )}
            </Box>
          </Box>
        </Box>
        {tabs.map((item, i) => (
          <TabPanel
            key={i}
            value={item?.value}
            sx={{ overflow: 'auto', scrollbarWidth: 'none', color: color?.tabContentClr, fontFamily: 'Inter' }}
          >
            {item?.label}
          </TabPanel>
        ))}
      </TabContext>
    </Box>
  );
}
