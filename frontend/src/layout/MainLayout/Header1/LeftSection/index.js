/* eslint-disable */
import React, { useState } from 'react';
import { Tooltip, Typography, Box, ClickAwayListener, Popper, Paper } from '@mui/material';
import ColorTheme from '../../../../store/ColorTheme';
import { NavLink } from 'react-router-dom';
import { ItemIcon, AttackIcon, DamageIcon, ThreatIcon, CybersecurityIcon, RiskIcon } from '../../../../assets/icons';
import InfoIcon from '@mui/icons-material/Info';
import SelectProject from '../../../../ui-component/Modal/SelectProject';
import useStore from '../../../../Zustand/store';
import AddModel from '../../../../ui-component/Modal/AddModal';
import Components from '../../../../views/NodeList';
import TemplateList from '../../../../views/Libraries';
import DeleteProject from '../../../../ui-component/Modal/DeleteProjects';

const imageComponents = {
  AttackIcon,
  ItemIcon,
  DamageIcon,
  ThreatIcon,
  CybersecurityIcon,
  RiskIcon
};

const selector = (state) => ({
  Models: state.Models,
  getModels: state.getModels,
  deleteModels: state.deleteModels
});

export default function LeftSection() {
  const color = ColorTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const { Models, getModels, deleteModels } = useStore(selector);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [open, setOpen] = useState({
    New: false,
    Open: false,
    Delete: false
  });
  const [subMenuAnchorEl, setSubMenuAnchorEl] = useState(null);
  const [selectedSubMenu, setSelectedSubMenu] = useState(null);

  const menuItems = [
    {
      name: 'File',
      options: [
        { label: 'New', action: () => handleOpen('New') },
        { label: 'Open', action: () => handleOpen('Open') },
        { label: 'Delete', action: () => handleOpen('Delete') }
        // { label: 'Save', action: () => console.log('Save') },
        // { label: 'Exit', action: () => console.log('Exit') }
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
        {
          label: 'Component',
          // action: () => console.log('Component'),
          subLevel: (
            <Box mt={2}>
              <Components />
            </Box>
          )
        },
        {
          label: 'System',
          // action: () => console.log('System'),
          subLevel: (
            <Box mt={2}>
              {/* <TemplateList /> */}
              <Components />
            </Box>
          )
        }
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
    setSubMenuAnchorEl(null);
    setSelectedSubMenu(null);
  };

  const handleSubMenuOpen = (event, subIndex) => {
    setSubMenuAnchorEl(event.currentTarget);
    setSelectedSubMenu(subIndex);
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
      Open: false,
      Delete: false
    });
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <NavLink to="/home" style={{ fontSize: 16, fontWeight: 600, color: color?.logo, textDecoration: 'none' }}>
        FUCY TECH
      </NavLink>
      {menuItems.map((item, index) => (
        <Box key={index}>
          {/* <ClickAwayListener onClickAway={handleMenuClose}> */}
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
            <Popper
              open={selectedMenu === index && Boolean(anchorEl)}
              anchorEl={anchorEl}
              placement="bottom-start"
              disablePortal={false}
              onMouseLeave={handleMenuClose}
              sx={{
                zIndex: 1200
              }}
            >
              <Paper sx={{ pointerEvents: 'auto', background: '#E5E4E2', border: '1px solid', borderRadius: 0 }}>
                {item.options.map((option, i) => (
                  <Box
                    key={i}
                    sx={{
                      padding: '8px 16px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.08)'
                      }
                    }}
                    onMouseEnter={option.subLevel ? (e) => handleSubMenuOpen(e, i) : undefined}
                    onClick={() => {
                      option.action && option.action(); // Ensure option.action exists before invoking
                      // handleMenuClose();
                    }}
                  >
                    {item.icon ? getImageLabel(option) : option.label}
                    {option.subLevel && (
                      <Popper
                        open={selectedSubMenu === i && Boolean(subMenuAnchorEl)}
                        anchorEl={subMenuAnchorEl}
                        placement="right-start"
                        disablePortal={false}
                        sx={{
                          zIndex: 1300,
                          width: '100px',
                          mx: 2
                        }}
                      >
                        <Paper sx={{ pointerEvents: 'auto', background: '#E5E4E2', border: '1px solid', borderRadius: 0 }}>
                          {option.subLevel}
                        </Paper>
                      </Popper>
                    )}
                  </Box>
                ))}
              </Paper>
            </Popper>
          </div>
          {/* </ClickAwayListener> */}
        </Box>
      ))}
      {open?.Open && <SelectProject open={open?.Open} handleClose={handleClose} Models={Models} />}
      {open?.New && <AddModel getModels={getModels} open={open?.New} handleClose={handleClose} />}
      {open?.Delete && <DeleteProject Models={Models} open={open?.Delete} handleClose={handleClose} deleteModels={deleteModels} />}
    </Box>
  );
}
