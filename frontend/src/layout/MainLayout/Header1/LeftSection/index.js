/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { Tooltip, Typography, Box, Popper, Paper } from '@mui/material';
import ColorTheme from '../../../../store/ColorTheme';
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
  deleteModels: state.deleteModels,
  getSidebarNode: state.getSidebarNode,
  getTemplates: state.getTemplates
});

export default function LeftSection() {
  const color = ColorTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const { Models, getModels, deleteModels, getSidebarNode, getTemplates } = useStore(selector);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [open, setOpen] = useState({
    New: false,
    Open: false,
    Delete: false
  });
  const [subMenuAnchorEl, setSubMenuAnchorEl] = useState(null);
  const [selectedSubMenu, setSelectedSubMenu] = useState(null);

  useEffect(() => {
    getSidebarNode();
    getTemplates();
  }, []);

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
      name: 'Library',
      options: [
        {
          label: 'System',
          // action: () => console.log('System'),
          subLevel: (
            <Box>
              <TemplateList />
              {/* <Components /> */}
            </Box>
          )
        }
      ]
    },
    {
      name: 'Components',
      options: [
        {
          label: 'Create Component',
          // action: () => console.log('Component'),
          subLevel: (
            <Box>
              <Components />
            </Box>
          )
        },
      ]
    },
    // {
    //   icon: <InfoIcon sx={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}/>,

    //   options: [
    //     {
    //       label: 'Item Definition',
    //       value: '1',
    //       icon: 'ItemIcon'
    //     },
    //     {
    //       label: 'Damage Scenarios',
    //       value: '3',
    //       icon: 'DamageIcon'
    //     },
    //     {
    //       label: 'Threat Scenarios',
    //       value: '4',
    //       icon: 'ThreatIcon'
    //     },
    //     {
    //       label: 'Attack Path Analysis',
    //       value: '5',
    //       icon: 'AttackIcon'
    //     },
    //     {
    //       label: 'Risk Treatment and Determination',
    //       value: '6',
    //       icon: 'RiskIcon'
    //     },
    //     {
    //       label: 'Cybersecurity Goals and Requirements',
    //       value: '7',
    //       icon: 'CybersecurityIcon'
    //     }
    //   ]
    // }
  ];

  const getImageLabel = (item) => {
    const Image = imageComponents[item?.icon];
    const isLongLabel = item?.label.length > 40;
    const displayLabel = isLongLabel ? `${item.label.slice(0, 40)}...` : item.label;

    return (
      <Box display="flex" alignItems="center" gap={2}>
        {Image && <img src={Image} alt={item.label} style={{ height: '20px', width: '20px' }} />}
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
    setOpen({ New: false, Open: false, Delete: false });
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {menuItems.map((item, index) => (
        <Box key={index}>
          <Typography
            variant="h6"
            component="div"
            sx={{
              cursor: 'pointer',
              color: color?.title,
              mx: 0.5,
              px: 0.5,
              transition: 'background-color 0.3s, box-shadow 0.3s',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                borderRadius: '4px'
              }
            }}
            onMouseEnter={(e) => handleMenuOpen(e, index)}
          >
            {item.name || <Box>{item.icon}</Box>}
          </Typography>
          <Popper
            open={selectedMenu === index && Boolean(anchorEl)}
            anchorEl={anchorEl}
            placement="bottom-start"
            onMouseLeave={handleMenuClose}
            sx={{ zIndex: 1200 }}
          >
            <Paper
              sx={{
                background: color?.sidebarBG,
                color: `${color?.sidebarContent} !important`,
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '8px',
                display: item.icon ? 'flex' : 'block',
                flexDirection: item.icon ? 'row' : 'column',
                gap: item.icon ? 2 : 0,
                flexWrap: item.icon ? 'nowrap' : 'wrap',
              }}
            >
              {item.options.map((option, i) => (
                <Box
                  key={i}
                  sx={{
                    padding: item.icon ? '0px':'5px 8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.1)' }
                  }}
                  onMouseEnter={option.subLevel ? (e) => handleSubMenuOpen(e, i) : undefined}
                  onClick={() => {
                    option.action && option.action();
                    handleMenuClose();
                  }}
                >
                  {item.icon ? (
                    getImageLabel(option)
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{
                        color: color?.textPrimary,
                        fontSize: '14px',
                        fontFamily: 'Inter',
                        fontWeight: 500,
                        paddingX: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      {option.label}
                    </Typography>
                  )}
                  {option.subLevel && (
                    <Popper
                      open={selectedSubMenu === i && Boolean(subMenuAnchorEl)}
                      anchorEl={subMenuAnchorEl}
                      placement="right-start"
                      disablePortal={false}
                      sx={{
                        zIndex: 1300,
                        mx: 2,
                        borderRadius: 1
                      }}
                    >
                      <Paper
                        sx={{
                          pointerEvents: 'auto',
                          background: color?.sidebarBG,
                          color: color?.sidebarContent,
                          border: '1px solid #d1d1d1',
                          borderRadius: 1,
                          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                          padding: 1,
                          minWidth: '150px'
                        }}
                      >
                        {option.subLevel}
                      </Paper>
                    </Popper>
                  )}
                </Box>
              ))}
            </Paper>
          </Popper>
        </Box>
      ))}
      {open?.Open && <SelectProject open={open?.Open} handleClose={handleClose} Models={Models} />}
      {open?.New && <AddModel getModels={getModels} open={open?.New} handleClose={handleClose} />}
      {open?.Delete && <DeleteProject Models={Models} open={open?.Delete} handleClose={handleClose} deleteModels={deleteModels} />}
    </Box>
  );
}
