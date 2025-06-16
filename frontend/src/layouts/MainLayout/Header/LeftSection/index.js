/* eslint-disable */
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Box, Tooltip, Typography, IconButton, Collapse, Menu, MenuItem } from '@mui/material';
import {
  FolderOpen as FolderOpenIcon,
  Delete as DeleteIcon,
  TableChart as TableIcon,
  CreateNewFolder as NewFolderIcon,
  DriveFileRenameOutline as RenameIcon,
  PlaylistAdd as AddListIcon,
  AccountTree as TreeIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Help as HelpIcon
} from '@mui/icons-material';
import pdfFile from '../../../../assets/PDF/FucyTech-Doc.pdf';
import TemplateList from '../../../../pages/Libraries';
import Components from '../../../../pages/NodeList';
import SelectProject from '../../../../components/Modal/SelectProject';
import AddModel from '../../../../components/Modal/AddModal';
import RenameProject from '../../../../components/Modal/RenameModal';
import DeleteProject from '../../../../components/Modal/DeleteProjects';
import useStore from '../../../../store/Zustand/store';
import AttackTreeRibbonModal from '../../../../components/Modal/AttackTreeRibbonModal';
import ColorTheme from '../../../../themes/ColorTheme';
import { openAddNodeTab, openAddDataNodeTab } from '../../../../store/slices/CanvasSlice';
import { useDispatch, useSelector } from 'react-redux';
import { closeAll, setPreviousTab, setTableOpen } from '../../../../store/slices/CurrentIdSlice';
import CommonModal from '../../../../components/Modal/CommonModal';
import { setModelId, setTitle } from '../../../../store/slices/PageSectionSlice';
import PromptModal from '../../../../components/Modal/PromptModal';
import { shallow } from 'zustand/shallow';
import { Export, Import } from 'iconsax-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router';

const notify = (message, status) => toast[status](message);

const selector = (state) => ({
  Models: state.Models,
  model: state.model,
  getModels: state.getModels,
  deleteModels: state.deleteModels,
  getSidebarNode: state.getSidebarNode,
  getTemplates: state.getTemplates,
  setClickedItem: state.setClickedItem,
  getAttackScenario: state.getAttackScenario,
  attackScenarios: state.attackScenarios,
  isCollapsed: state.isCollapsed,
  setCollapsed: state.setCollapsed,
  exportProject: state.exportProject,
  importProject: state.importProject,
  isChanged: state.isChanged,
  isAttackChanged: state.isAttackChanged,
  setOpenSave: state.setOpenSave
});

const LeftSection = () => {
  const { isDark } = useSelector((state) => state?.currentId);
  const color = ColorTheme();
  const {
    Models,
    model,
    getModels,
    deleteModels,
    getSidebarNode,
    getTemplates,
    setClickedItem,
    getAttackScenario,
    attackScenarios,
    isCollapsed,
    setCollapsed,
    exportProject,
    importProject,
    isChanged,
    isAttackChanged,
    setOpenSave
  } = useStore(selector, shallow);

  const [activeTab, setActiveTab] = useState('Project');
  const [openModal, setOpenModal] = useState({
    New: false,
    Rename: false,
    Open: false,
    Delete: false,
    AttackModal: false,
    AIModal: false
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [openTemplateDialog, setOpenTemplateDialog] = useState(false);
  const [openComponentsDialog, setOpenComponentsDialog] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [openAttackModal, setOpenAttackModal] = useState(false);
  const [subName, setSubName] = useState('');
  const [exportAnchorEl, setExportAnchorEl] = useState(null);
  const [hoveredTab, setHoveredTab] = useState(null);
  const hoverTimeoutRef = useRef(null);

  const handleMouseEnter = useCallback((tabName) => {
    clearTimeout(hoverTimeoutRef.current);
    setHoveredTab(tabName);
  }, []);

  const handleMouseLeave = useCallback(() => {
    // Only hide the hovered tab if no modal is open
    if (!openModal.Open && !openModal.Delete) {
      hoverTimeoutRef.current = setTimeout(() => setHoveredTab(null), 2000);
    }
  }, [openModal.Open, openModal.Delete]);

  const handleTabWrapperMouseEnter = useCallback((tabName) => {
    clearTimeout(hoverTimeoutRef.current);
    setHoveredTab(tabName);
  }, []);

  const handleDropdownMouseEnter = useCallback((tabName) => {
    clearTimeout(hoverTimeoutRef.current);
    setHoveredTab(tabName);
  }, []);

  useEffect(() => () => clearTimeout(hoverTimeoutRef.current), []);

  useEffect(() => {
    getSidebarNode();
    getTemplates();
    if (model?._id) {
      getAttackScenario(model._id);
    }
  }, [model?._id, getSidebarNode, getTemplates, getAttackScenario]);

  const handleAddNewNode = useCallback(
    (e, name) => {
      e.stopPropagation();
      name == 'node' ? dispatch(openAddNodeTab()) : dispatch(openAddDataNodeTab());
    },
    [dispatch]
  );

  const handleSystemTabClick = useCallback(() => setOpenTemplateDialog(true), []);
  const handleComponentsTabClick = useCallback(() => setOpenComponentsDialog(true), []);

  const handleExportClick = (event) => {
    setExportAnchorEl(event.currentTarget);
  };

  const handleExportClose = (e) => {
    e.stopPropagation();
    setExportAnchorEl(null);
  };

  const handleExportJSON = () => {
    exportProject({ modelId: model?._id })
      .then((res) => {
        if (!res.error) {
          notify(res?.message ?? 'Exported Successfully', 'success');
          if (res.download_url) {
            window.open(res.download_url, '_blank');
          }
        } else {
          notify(res?.error ?? 'something went wrong', 'error');
        }
      })
      .catch((err) => notify(err?.message ?? 'something went wrong', 'error'));
    handleExportClose();
  };

  const handleExportPDF = () => {
    handleExportClose();
  };

  const handleImportClick = () => {
    const fileInput = document.createElement('input');
    const userId = sessionStorage.getItem('user-id');
    fileInput.type = 'file';
    fileInput.accept = '.bson';

    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        console.log('File selected:', file.name);

        try {
          const response = await importProject({ userId: userId, file: file });

          if (!response.error) {
            if (response.new_model_id) {
              notify('Import successfull', 'success');
              navigate(`/Models/${response.new_model_id}`);
              dispatch(setModelId(response.new_model_id));
              dispatch(closeAll());
              getModels();
            } else {
              notify(response?.error ?? 'Import failed', 'error');
            }
          } else {
            console.error('Import failed:', response.error);
            notify('Import failed', 'error');
          }
        } catch (error) {
          console.error('Error uploading file:', error);
          notify('Error uploading file', 'error');
        }
      }
    };

    fileInput.click();
  };

  const handleHelpClick = useCallback(() => {
    const pdfUrl = pdfFile;
    window.open(pdfUrl, '_blank');
  }, []);

  const handleTabChange = useCallback(
    (e, tabName) => {
      e.stopPropagation();
      if (isChanged || isAttackChanged) {
        setOpenSave(true);
        return;
      }
      dispatch(setPreviousTab(tabName));
      setActiveTab(tabName);
      const actions = {
        'Item Definition': handleModelDefinationClick,
        'Damage Scenarios': () => handleClick('Damage Scenarios (DS) Derivations', '2'),
        'Threat Scenarios': () => handleClick('Threat Scenarios', '3'),
        'Attack Path': handleAttackTableClick,
        Cybersecurity: () => handleClick('Cybersecurity Goals', '5'),
        'Risk Determination & Treatment': () => handleClick('Threat Assessment & Risk Treatment', '8'),
        Help: handleHelpClick
      };
      actions[tabName]?.();
    },
    [dispatch, isChanged, isAttackChanged]
  );

  const handleToggleCollapse = useCallback(
    (e) => {
      e.stopPropagation();
      setCollapsed((prev) => !prev);
    },
    [setCollapsed]
  );

  const handleContext = useCallback((name, event) => {
    event.stopPropagation();
    if (name === 'Attack' || name === 'Attack Trees') {
      setOpenAttackModal(true);
      setSubName(name);
    } else if (name === 'AI Assistant') {
      setOpenModal((prev) => ({ ...prev, AIModal: true }));
    }
  }, []);

  const handleAttackTreeClose = useCallback(() => {
    setOpenAttackModal(false);
  }, []);

  const handleClick = useCallback(
    (name, number) => {
      if (isChanged || isAttackChanged) {
        setOpenSave(true);
        return;
      }
      setClickedItem(number);
      dispatch(setPreviousTab(name));
      dispatch(setTitle(name));
      dispatch(setTableOpen(name));
    },
    [dispatch, setClickedItem, isChanged, isAttackChanged]
  );

  const handleModelDefinationClick = useCallback(() => {
    setClickedItem('1');
    dispatch(closeAll());
  }, [dispatch, setClickedItem]);

  const handleAttackTreeClick = useCallback(
    async (e) => {
      setIsLoading(true);
      setAnchorEl(e.currentTarget);
      if (model?._id) {
        await getAttackScenario(model._id);
        setOpenModal((prev) => ({ ...prev, AttackModal: true }));
      }
      setIsLoading(false);
    },
    [model?._id, getAttackScenario]
  );

  const handleAttackTableClick = useCallback(() => {
    dispatch(setPreviousTab('Attack'));
    if (model?._id) {
      setClickedItem('4');
      dispatch(setTitle('Attack'));
      dispatch(setTableOpen('Attack'));
    }
  }, [dispatch, model?._id, setClickedItem]);

  const handleGroupDrag = useCallback((event) => {
    const parseFile = JSON.stringify('');
    event.dataTransfer.setData('application/group', parseFile);
    event.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleOpenModal = (modalKey, e) => {
    if (e?.stopPropagation) e.stopPropagation();
    setAnchorEl(e.currentTarget);
    setOpenModal((prev) => ({ ...prev, [modalKey]: true }));
  };

  const tabs = useMemo(
    () => [
      {
        name: 'Project',
        options: [
          { label: 'New', icon: NewFolderIcon, action: (e) => handleOpenModal('New', e) },
          { label: 'Rename', icon: RenameIcon, action: (e) => handleOpenModal('Rename', e) },
          { label: 'Open', icon: FolderOpenIcon, action: (e) => handleOpenModal('Open', e) },
          { label: 'Delete', icon: DeleteIcon, action: (e) => handleOpenModal('Delete', e) },
          { label: 'Export', icon: Export, action: handleExportClick },
          { label: 'Import', icon: Import, action: handleImportClick }
        ]
      },
      {
        name: 'Item Definition',
        options: [
          { label: 'New Data', icon: NewFolderIcon, action: (e) => handleAddNewNode(e, 'data') },
          {
            label: 'New Component',
            icon: () => (
              <img
                src="https://img.icons8.com/?size=100&id=dviuFeWyguPJ&format=png&color=000000"
                style={{
                  width: 24,
                  height: 24,
                  filter: 'invert(47%) sepia(82%) hue-rotate(189deg) saturate(614%) brightness(92%)'
                }}
              />
            ),
            action: (e) => handleAddNewNode(e, 'node')
          },
          {
            label: 'Group',
            icon: () => (
              <img
                src="https://img.icons8.com/?size=100&id=41480&format=png&color=000000"
                style={{
                  width: 24,
                  height: 24,
                  filter: 'invert(47%) sepia(82%) hue-rotate(189deg) saturate(614%) brightness(92%)'
                }}
              />
            ),
            action: handleGroupDrag
          }
        ]
      },
      {
        name: 'Damage Scenarios',
        options: [
          {
            label: 'Derivation Table',
            icon: () => (
              <img
                src="https://img.icons8.com/?size=100&id=bCEo3v0j2MJ7&format=png&color=000000"
                style={{
                  width: 24,
                  height: 24,
                  filter: 'invert(47%) sepia(82%) hue-rotate(189deg) saturate(614%) brightness(92%)'
                }}
              />
            ),
            action: () => handleClick('Damage Scenarios (DS) Derivations')
          },
          {
            label: 'Impact Rating Table',
            icon: () => (
              <img
                src="https://img.icons8.com/?size=100&id=Imv4VIewVo4o&format=png&color=000000"
                style={{
                  width: 24,
                  height: 24,
                  filter: 'invert(47%) sepia(82%) hue-rotate(189deg) saturate(614%) brightness(92%)'
                }}
              />
            ),
            action: () => handleClick('Damage Scenarios - Impact Ratings')
          }
        ]
      },
      {
        name: 'Threat Scenarios',
        options: [
          {
            label: 'Threat Table',
            icon: () => (
              <img
                src="https://img.icons8.com/?size=100&id=bCEo3v0j2MJ7&format=png&color=000000"
                style={{
                  width: 24,
                  height: 24,
                  filter: 'invert(47%) sepia(82%) hue-rotate(189deg) saturate(614%) brightness(92%)'
                }}
              />
            ),
            action: () => handleClick('Threat Scenarios')
          },
          {
            label: 'Derived Table',
            icon: () => (
              <img
                src="https://img.icons8.com/?size=100&id=Imv4VIewVo4o&format=png&color=000000"
                style={{
                  width: 24,
                  height: 24,
                  filter: 'invert(47%) sepia(82%) hue-rotate(189deg) saturate(614%) brightness(92%)'
                }}
              />
            ),
            action: () => handleClick('Derived Threat Scenarios')
          }
        ]
      },
      {
        name: 'Attack Path',
        options: [
          { label: 'Attack Table', icon: TableIcon, action: handleAttackTableClick },
          { label: 'Add Attack', icon: AddListIcon, action: (e) => handleContext('Attack', e) },
          { label: 'Attack Trees', icon: TreeIcon, action: handleAttackTreeClick },
          { label: 'Add Attack Tree', icon: AddListIcon, action: (e) => handleContext('Attack Trees', e) },
          { 
            label: 'AI Assistant', 
            icon: () => (
              <img
                src="https://img.icons8.com/ios-filled/24/1e88e5/artificial-intelligence.png"
                alt="ai assistant"
                style={{
                  width: 24,
                  height: 24
                }}
              /> 
            ), 
            action: (e) => handleContext('AI Assistant', e) 
          }
        ]
      },
      {
        name: 'Cybersecurity',
        options: [
          {
            label: 'Goals',
            icon: () => (
              <img
                src="https://img.icons8.com/ios-filled/24/1e88e5/goal.png"
                alt="goals"
                style={{
                  width: 24,
                  height: 24
                }}
              />
            ),
            action: () => handleClick('Cybersecurity Goals')
          },
          {
            label: 'Requirements',
            icon: () => (
              <img
                src="https://img.icons8.com/ios-filled/24/1e88e5/task-completed.png"
                alt="requirements"
                style={{
                  width: 24,
                  height: 24
                }}
              />
            ),
            action: () => handleClick('Cybersecurity Requirements')
          },
          {
            label: 'Controls',
            icon: () => (
              <img
                src="https://img.icons8.com/ios-filled/24/1e88e5/control-panel.png"
                alt="controls"
                style={{
                  width: 24,
                  height: 24
                }}
              />
            ),
            action: () => handleClick('Cybersecurity Controls')
          },
          {
            label: 'Claims',
            icon: () => (
              <img
                src="https://img.icons8.com/ios-filled/24/1e88e5/checked-2.png"
                alt="claims"
                style={{
                  width: 24,
                  height: 24
                }}
              />
            ),
            action: () => handleClick('Cybersecurity Claims')
          }
        ]
      },
      {
        name: 'Risk Determination & Treatment',
        options: [
          {
            label: 'Risk Table',
            icon: () => (
              <img
                src="https://img.icons8.com/?size=100&id=bCEo3v0j2MJ7&format=png&color=000000"
                style={{
                  width: 24,
                  height: 24,
                  filter: 'invert(47%) sepia(82%) hue-rotate(189deg) saturate(614%) brightness(92%)'
                }}
              />
            ),
            action: () => handleClick('Threat Assessment & Risk Treatment')
          }
        ]
      },
      {
        name: 'Help',
        options: [
          {
            label: 'Documentation',
            icon: HelpIcon,
            action: handleHelpClick
          }
        ]
      }
    ],
    [handleAddNewNode, handleGroupDrag, handleClick, handleAttackTableClick, handleContext, handleAttackTreeClick, handleHelpClick]
  );

  const handleCloseModal = useCallback((e, modalName) => {
    e.stopPropagation();
    setOpenModal((prev) => ({ ...prev, [modalName]: false }));
  }, []);

  const currentTabOptions = useMemo(() => tabs.find((tab) => tab.name === activeTab)?.options || [], [tabs, activeTab]);

  const buttonStyles = useMemo(
    () => ({
      padding: '6px',
      fontSize: '12px',
      color: '#1e88e5',
      background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
      border: 'none',
      borderRadius: '6px',
      transition: 'all 0.3s ease',
      '&:hover': {
        background: isDark
          ? 'linear-gradient(90deg, rgba(30,136,229,0.15) 0%, rgba(30,136,229,0.03) 100%)'
          : 'linear-gradient(90deg, rgba(30,136,229,0.08) 0%, rgba(30,136,229,0.02) 100%)',
        transform: 'scale(1.1)',
        boxShadow: isDark ? '0 2px 6px rgba(0,0,0,0.4)' : '0 2px 6px rgba(0,0,0,0.1)',
        filter: 'drop-shadow(0 0 6px rgba(30,136,229,0.15))'
      }
    }),
    [isDark]
  );

  const tabStyles = useMemo(
    () => ({
      cursor: 'pointer',
      fontSize: '13px',
      fontFamily: "'Poppins', sans-serif",
      fontWeight: 500,
      margin: '0 8px',
      padding: '4px 6px',
      borderRadius: '6px',
      transition: 'all 0.3s ease',
      '&:hover': {
        color: '#1e88e5',
        background: isDark
          ? 'linear-gradient(90deg, rgba(30,136,229,0.15) 0%, rgba(30,136,229,0.03) 100%)'
          : 'linear-gradient(90deg, rgba(30,136,229,0.08) 0%, rgba(30,136,229,0.02) 100%)',
        transform: 'scale(1.02)',
        boxShadow: isDark ? '0 2px 6px rgba(0,0,0,0.4)' : '0 2px 6px rgba(0,0,0,0.1)',
        filter: 'drop-shadow(0 0 6px rgba(30,136,229,0.15))'
      }
    }),
    [isDark]
  );

  const activeTabStyles = useMemo(
    () => ({
      fontWeight: 600,
      color: '#1e88e5',
      borderBottom: '2px solid #1e88e5',
      background: isDark
        ? 'linear-gradient(90deg, rgba(30,136,229,0.25) 0%, rgba(30,136,229,0.08) 100%)'
        : 'linear-gradient(90deg, rgba(30,136,229,0.15) 0%, rgba(30,136,229,0.03) 100%)',
      boxShadow: isDark ? '0 3px 8px rgba(0,0,0,0.5)' : '0 3px 8px rgba(0,0,0,0.1)'
    }),
    [isDark]
  );

  const renderOptionButton = useCallback(
    (option, index) => {
      const Icon = option.icon;
      const isFunction = typeof Icon === 'function';

      return (
        <Box
          key={index}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '70px',
            position: 'relative'
          }}
          draggable={option.label === 'Group'}
          onDragStart={option.label === 'Group' ? handleGroupDrag : undefined}
        >
          {option.label && (
            <>
              <Tooltip title={option.label}>
                <IconButton onClick={option.action} sx={buttonStyles}>
                  {isFunction ? (
                    <Icon />
                  ) : (
                    <Icon
                      fontSize="small"
                      sx={{
                        fontSize: 20,
                        color: '#1e88e5'
                      }}
                    />
                  )}
                </IconButton>
              </Tooltip>
              <Typography
                variant="caption"
                sx={{
                  mt: 0.5,
                  textAlign: 'center',
                  fontSize: '0.7rem',
                  color: color?.sidebarContent,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  width: '100%'
                }}
              >
                {option.label}
              </Typography>
            </>
          )}
        </Box>
      );
    },
    [buttonStyles, color?.sidebarContent, handleGroupDrag]
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          background: color.tabBorder,
          backdropFilter: 'blur(12px)',
          borderRadius: '10px',
          padding: '6px 8px',
          boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.5)' : '0 4px 16px rgba(0,0,0,0.15)',
          marginBottom: '6px',
          gap: '8px'
        }}
      >
        {tabs.map((tab) => (
          <Box
            key={tab.name}
            sx={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
            onMouseEnter={() => handleTabWrapperMouseEnter(tab.name)}
            onMouseLeave={handleMouseLeave}
          >
            <Box
              onClick={(e) => handleTabChange(e, tab.name)}
              sx={{
                cursor: 'pointer',
                ...tabStyles,
                ...(activeTab === tab.name ? activeTabStyles : {}),
                color: activeTab === tab.name ? '#1e88e5' : color?.sidebarContent,
                px: 1.5,
                py: 0.5,
                borderRadius: 1
              }}
            >
              {tab.name}
            </Box>
            {isCollapsed && hoveredTab === tab.name && tab.options?.length > 0 && (
              <Box
                onMouseEnter={() => handleDropdownMouseEnter(tab.name)}
                onMouseLeave={handleMouseLeave}
                sx={{
                  position: 'absolute',
                  top: 'calc(100% + 4px)',
                  left: 0,
                  zIndex: 1300,
                  background: color.tabBorder,
                  backdropFilter: 'blur(8px)',
                  borderRadius: '8px',
                  border: 'none',
                  p: 1.5,
                  boxShadow: (theme) => theme.shadows[8],
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))',
                  gap: 1.5,
                  width: 'max-content',
                  maxWidth: 300,
                  opacity: 1,
                  transition: 'opacity 0.2s ease, transform 0.2s ease',
                  pointerEvents: 'auto',
                  mt: 0.5
                }}
              >
                {tab.options.map(renderOptionButton)}
              </Box>
            )}
          </Box>
        ))}
        <IconButton
          onClick={handleToggleCollapse}
          size="small"
          sx={{
            ml: 1,
            color: '#1e88e5',
            '&:hover': {
              background: isDark ? 'rgba(30,136,229,0.15)' : 'rgba(30,136,229,0.08)'
            }
          }}
        >
          {isCollapsed ? <ExpandMoreIcon fontSize="small" /> : <ExpandLessIcon fontSize="small" />}
        </IconButton>
      </Box>
      <Collapse in={!isCollapsed}>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-evenly',
            padding: '8px',
            borderRadius: '8px',
            background: color.tabBorder,
            backdropFilter: 'blur(8px)',
            border: 'none',
            boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.5)' : '0 4px 12px rgba(0,0,0,0.15)',
            gap: '4px',
            width: { xs: '700px', sm: '800px', md: '1000px', lg: '1250px' },
            maxHeight: '85px',
            overflow: 'auto',
            my: 0.4
          }}
        >
          {currentTabOptions.map(renderOptionButton)}
        </Box>
      </Collapse>
      <Menu
        anchorEl={exportAnchorEl}
        open={Boolean(exportAnchorEl)}
        onClose={handleExportClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center'
        }}
        disablePortal
        disableScrollLock
        disableAutoFocus
        disableEnforceFocus
        style={{ position: 'fixed' }}
        MenuListProps={{
          'aria-labelledby': 'export-menu',
          onMouseEnter: () => clearTimeout(hoverTimeoutRef.current),
          onMouseLeave: handleMouseLeave
        }}
      >
        <MenuItem onClick={handleExportJSON}>Export as JSON</MenuItem>
        <MenuItem onClick={handleExportPDF}>Export as PDF</MenuItem>
      </Menu>

      {/* Project Modals */}
      <AddModel 
        getModels={getModels} 
        open={openModal.New} 
        handleClose={(e) => handleCloseModal(e, 'New')} 
        disablePortal
        style={{ position: 'fixed' }}
      />
      
      <RenameProject 
        open={openModal.Rename} 
        handleClose={(e) => handleCloseModal(e, 'Rename')} 
        Models={Models}
        disablePortal
        style={{ position: 'fixed' }}
      />
      
      <SelectProject
        open={openModal.Open}
        handleClose={(e) => handleCloseModal(e, 'Open')}
        Models={Models}
        anchorEl={anchorEl}
        color={color}
        isDark={isDark}
        disablePortal
        style={{ position: 'fixed' }}
      />
      
      <DeleteProject
        open={openModal.Delete}
        model={model}
        handleClose={(e) => handleCloseModal(e, 'Delete')}
        Models={Models}
        deleteModels={deleteModels}
        getModels={getModels}
        anchorEl={anchorEl}
        disablePortal
        style={{ position: 'fixed' }}
      />
      {openModal.AIModal && (
        <PromptModal open={openModal?.AIModal} handleClose={() => setOpenModal((prev) => ({ ...prev, AIModal: false }))} />
      )}
      {openTemplateDialog && <TemplateList openDialog={openTemplateDialog} setOpenDialog={setOpenTemplateDialog} />}
      {openComponentsDialog && <Components openDialog={openComponentsDialog} setOpenDialog={setOpenComponentsDialog} />}
      {openAttackModal && <CommonModal open={openAttackModal} handleClose={handleAttackTreeClose} name={subName} />}
      {openModal.AttackModal && (
        <AttackTreeRibbonModal
          open={openModal.AttackModal}
          handleClose={(e) => handleCloseModal(e, 'AttackModal')}
          isLoading={isLoading}
          anchorEl={anchorEl}
          attackScenarios={attackScenarios}
          getAttackScenario={getAttackScenario}
        />
      )}
    </Box>
  );
};

export default React.memo(LeftSection);