import React, { useState } from 'react';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import ColorTheme from '../../../../store/ColorTheme';
import { NavLink } from 'react-router-dom';
import InfoIcon from '@mui/icons-material/Info';
import Tooltip from '@mui/material/Tooltip';
import AttackIcon from '../../../../assets/icons/attack.png';
import ItemIcon from '../../../../assets/icons/item.png';
import DamageIcon from '../../../../assets/icons/damage.png';
import ThreatIcon from '../../../../assets/icons/threat.png';
import CybersecurityIcon from '../../../../assets/icons/cybersecurity.png';
import RiskIcon from '../../../../assets/icons/risk.png';
import SelectProject from '../../../../ui-component/Modal/SelectProject';
import useStore from '../../../../Zustand/store';
import AddModal from '../../../../ui-component/Modal/AddModal';

const imageComponents = {
  AttackIcon,
  ItemIcon,
  DamageIcon,
  ThreatIcon,
  CybersecurityIcon,
  RiskIcon
};

const selector = (state) => ({
  Modals: state.Modals,
  getModals: state.getModals
});
export default function LeftSection() {
  const color = ColorTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const { Modals, getModals } = useStore(selector);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [open, setOpen] = useState({
    New: false,
    Open: false
  });

  const menuItems = [
    {
      name: 'File',
      options: [
        { label: 'New', action: () => handleOpen('New') },
        { label: 'Open', action: () => handleOpen('Open') },
        { label: 'Save', action: () => console.log('Save') },
        { label: 'Exit', action: () => console.log('Exit') }
      ]
    },
    {
      name: 'Edit',
      options: [
        { label: 'Undo', action: () => console.log('Undo') },
        { label: 'Redo', action: () => console.log('Redo') },
        { label: 'Cut', action: () => console.log('Cut') },
        { label: 'Copy', action: () => console.log('Copy') },
        { label: 'Paste', action: () => console.log('Paste') }
      ]
    },
    {
      name: 'View',
      options: [
        { label: 'Zoom In', action: () => console.log('Zoom In') },
        { label: 'Zoom Out', action: () => console.log('Zoom Out') },
        { label: 'Full Screen', action: () => console.log('Full Screen') }
      ]
    },
    {
      name: 'Select',
      options: [
        { label: 'Select All', action: () => console.log('Select All') },
        { label: 'Deselect All', action: () => console.log('Deselect All') }
      ]
    },
    {
      name: 'Insert',
      options: [
        { label: 'Image', action: () => console.log('Image') },
        { label: 'Table', action: () => console.log('Table') },
        { label: 'Link', action: () => console.log('Link') }
      ]
    },
    {
      icon: <InfoIcon />,
      options: [
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
      ]
    },
    {
      name: 'Library',
      options: [
        { label: 'Component', action: () => console.log('Image') },
        { label: 'System', action: () => console.log('Table') }
      ]
    }
  ];

  const getImageLabel = (item) => {
    const Image = imageComponents[item?.icon];
    const maxLength = 40;
    const isLongLabel = item?.label.length > maxLength;
    const displayLabel = isLongLabel ? `${item.label.slice(0, maxLength)}...` : item.label;

    return (
      <Box display="flex" alignItems="center" justifyContent="flex-start" gap={2}>
        {Image ? <img src={Image} alt={item.label} style={{ height: '20px', width: '20px' }} /> : null}
        <Tooltip title={item.label} arrow disableHoverListener={!isLongLabel}>
          <Typography variant="body2" sx={{ fontSize: 12, color: 'black', fontFamily: 'Inter' }}>
            {displayLabel}
          </Typography>
        </Tooltip>
      </Box>
    );
  };

  const handleMenuOpen = (event, index) => {
    setAnchorEl(event.currentTarget);
    setSelectedMenu(index);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMenu(null);
  };

  const handleOpen = (name) => {
    setOpen((state) => ({
      ...state,
      [`${name}`]: true
    }));
  };

  const handleClose = () => {
    setOpen({
      New: false,
      Open: false
    });
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <NavLink to="/home" style={{ fontSize: 16, fontWeight: 600, color: color?.logo, textDecoration: 'none' }}>
        FUCY TECH
      </NavLink>
      {menuItems.map((item, index) => (
        <Box key={index}>
          <ClickAwayListener onClickAway={handleMenuClose}>
            <div>
              {item.name ? (
                <Typography
                  variant="h6"
                  component="div"
                  sx={{
                    cursor: 'pointer',
                    color: color?.title,
                    mx: 0.5,
                    px: 0.5,
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.08)',
                      p: 0.5
                    }
                  }}
                  onMouseEnter={(e) => handleMenuOpen(e, index)}
                >
                  {item.name}
                </Typography>
              ) : (
                <Box
                  sx={{
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    color: color?.title,
                    mx: 0.5,
                    px: 0.5,
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.08)',
                      p: 0.5
                    }
                  }}
                  onMouseEnter={(e) => handleMenuOpen(e, index)}
                >
                  {item.icon}
                </Box>
              )}
              <Menu
                anchorEl={selectedMenu === index ? anchorEl : null}
                open={selectedMenu === index && Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left'
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left'
                }}
                MenuListProps={{
                  onMouseLeave: handleMenuClose // Close menu when mouse leaves
                }}
                sx={{
                  pointerEvents: 'none'
                }}
                PaperProps={{
                  sx: { pointerEvents: 'auto' } // Allows menu to respond to mouse events
                }}
              >
                {item.options.map((option, i) => (
                  <MenuItem
                    key={i}
                    onClick={() => {
                      option.action && option.action(); // Ensure option.action exists before invoking
                      handleMenuClose();
                    }}
                  >
                    {item.icon ? getImageLabel(option) : option.label}
                  </MenuItem>
                ))}
              </Menu>
            </div>
          </ClickAwayListener>
        </Box>
      ))}
      {open?.Open && <SelectProject open={open?.Open} handleClose={handleClose} Modals={Modals} />}
      {open?.New && <AddModal getModals={getModals} open={open?.New} handleClose={handleClose} />}
    </Box>
  );
}
