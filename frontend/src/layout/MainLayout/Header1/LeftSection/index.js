/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { 
  Tooltip, 
  Typography, 
  Box, 
  Popper, 
  Paper 
} from '@mui/material';
import { 
  Add as AddIcon, 
  FolderOpen as OpenIcon, 
  Delete as DeleteIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  ContentCut as CutIcon,
  ContentCopy as CopyIcon,
  ContentPaste as PasteIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Fullscreen as FullscreenIcon,
  LibraryBooks as LibraryIcon,
  Image as ImageIcon,
  TableChart as TableIcon,
  Link as LinkIcon,
  SelectAll as SelectAllIcon,
  DeselectOutlined as DeselectIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import ColorTheme from '../../../../store/ColorTheme';
import { ItemIcon, AttackIcon, DamageIcon, ThreatIcon, CybersecurityIcon, RiskIcon } from '../../../../assets/icons';
import SelectProject from '../../../../ui-component/Modal/SelectProject';
import useStore from '../../../../Zustand/store';
import AddModel from '../../../../ui-component/Modal/AddModal';
import Components from '../../../../views/NodeList';
import TemplateList from '../../../../views/Libraries';
import DeleteProject from '../../../../ui-component/Modal/DeleteProjects';

const MenuItemBox = styled(Box)(({ theme, isactive }) => ({
  padding: '10px 16px',
  cursor: 'pointer',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  transition: 'all 0.2s ease',
  gap: theme.spacing(1.5),
  position: 'relative',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    transform: 'translateX(2px)',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: isactive ? '4px' : '0',
    backgroundColor: theme.palette.primary.main,
    borderRadius: '0 8px 8px 0',
    transition: 'width 0.2s ease',
  }
}));

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
      name: 'Project',
      options: [
        { label: 'New', action: () => handleOpen('New'), icon: AddIcon, shortcut: '⌘N' },
        { label: 'Open', action: () => handleOpen('Open'), icon: OpenIcon, shortcut: '⌘O' },
        { label: 'Delete', action: () => handleOpen('Delete'), icon: DeleteIcon, shortcut: '⌘D' }
      ]
    },
    {
      name: 'Edit',
      options: [
        { label: 'Undo', action: () => console.log('Undo'), icon: UndoIcon, shortcut: '⌘Z' },
        { label: 'Redo', action: () => console.log('Redo '), icon: RedoIcon, shortcut: '⌘Y' },
        { label: 'Cut', action: () => console.log('Cut'), icon: CutIcon, shortcut: '⌘X' },
        { label: 'Copy', action: () => console.log('Copy'), icon: CopyIcon, shortcut: '⌘C' },
        { label: 'Paste', action: () => console.log('Paste'), icon: PasteIcon, shortcut: '⌘V' }
      ]
    },
    {
      name: 'View',
      options: [
        { label: 'Zoom In', action: () => console.log('Zoom In'), icon: ZoomInIcon, shortcut: '⌘+' },
        { label: 'Zoom Out', action: () => console.log('Zoom Out'), icon: ZoomOutIcon, shortcut: '⌘-' },
        { label: 'Full Screen', action: () => console.log('Full Screen'), icon: FullscreenIcon, shortcut: '⌘F' }
      ]
    },
    {
      name: 'Select',
      options: [
        { label: 'Select All', action: () => console.log('Select All'), icon: SelectAllIcon },
        { label: 'Deselect All', action: () => console.log('Deselect All'), icon: DeselectIcon }
      ]
    },
    {
      name: 'Insert',
      options: [
        { label: 'Image', action: () => console.log('Image'), icon: ImageIcon },
        { label: 'Table', action: () => console.log('Table'), icon: TableIcon },
        { label: 'Link', action: () => console.log('Link'), icon: LinkIcon }
      ]
    },
    {
      name: 'Library',
      options: [
        {
          label: 'System',
          icon: LibraryIcon,
          subLevel: (
            <Box>
              <TemplateList />
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
          subLevel: (
            <Box>
              <Components />
            </Box>
          )
        },
      ]
    },
  ];

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

  const getMenuItemContent = (option) => {
    const Icon = option.icon;
    const isLongLabel = option.label.length > 40;
    const displayLabel = isLongLabel ? `${option.label.slice(0, 40)}...` : option.label;

    return (
      <Box display="flex" alignItems="center" gap={1.5}>
        {Icon && <Icon sx={{ fontSize: 18, color: color?.textPrimary }} />}
        <Tooltip title={option.label} arrow disableHoverListener={!isLongLabel}>
          <Typography 
            variant="body2" 
            sx={{ 
              fontSize: 12, 
              color: color?.textPrimary, 
              fontFamily: 'Inter' 
            }}
          >
            {displayLabel}
          </Typography>
        </Tooltip>
      </Box>
    );
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
            { item.name}
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
                minWidth: '200px'
              }}
            >
              {item.options.map((option, i) => (
                <MenuItemBox
                  key={i}
                  isactive={selectedSubMenu === i}
                  onMouseEnter={option.subLevel ? (e) => handleSubMenuOpen(e, i) : undefined}
                  onClick={() => {
                    option.action && option.action();
                    handleMenuClose();
                  }}
                >
                  {getMenuItemContent(option)}
                  
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
                          minWidth: '200px'
                        }}
                      >
                        {option.subLevel}
                      </Paper>
                    </Popper>
                  )}
                </MenuItemBox>
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
