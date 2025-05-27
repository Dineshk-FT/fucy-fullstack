/* eslint-disable */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  importProject: state.importProject
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
    importProject
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
    // Implement your JSON export logic here
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
    // Implement your PDF export logic here
    // console.log('Exporting as PDF');
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

  // Add the help PDF handler
  const handleHelpClick = useCallback(() => {
    const pdfUrl = pdfFile;
    window.open(pdfUrl, '_blank');
    
  }, []);

  const handleTabChange = useCallback(
    (e, tabName) => {
      e.stopPropagation();
      dispatch(setPreviousTab(tabName));
      setActiveTab(tabName);
      const actions = {
        'Item Definition': handleModelDefinationClick,
        'Damage Scenarios': () => handleClick('Damage Scenarios (DS) Derivations', '2'),
        'Threat Scenarios': () => handleClick('Threat Scenarios', '3'),
        'Attack Path': handleAttackTableClick,
        Cybersecurity: () => handleClick('Cybersecurity Goals', '5'),
        'Risk Determination & Treatment': () => handleClick('Threat Assessment & Risk Treatment', '8'),
        Help: handleHelpClick // Add the help action
      };
      actions[tabName]?.();
    },
    [dispatch, handleHelpClick]
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
    } else if (name === 'create with AI') {
      setOpenModal((prev) => ({ ...prev, AIModal: true }));
    }
  }, []);

  const handleAttackTreeClose = useCallback(() => {
    setOpenAttackModal(false);
  }, []);

  const handleClick = useCallback(
    (name, number) => {
      setClickedItem(number);
      dispatch(setPreviousTab(name));
      dispatch(setTitle(name));
      dispatch(setTableOpen(name));
    },
    [dispatch, setClickedItem]
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
                  filter: 'invert(47%) sepia(82%) hue-rotate(189deg) saturate(614%) brightness(92%)' // Adjusted to approximate #1e88e5
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
          { label: 'create with AI', icon: AddListIcon, action: (e) => handleContext('create with AI', e) }
        ]
      },
      {
        name: 'Cybersecurity',
        options: [
          {
            label: 'Goals',
            icon: () => (
              <img
                src="https://img.icons8.com/?size=100&id=20884&format=png&color=000000"
                style={{
                  width: 24,
                  height: 24,
                  filter: 'invert(47%) sepia(82%) hue-rotate(189deg) saturate(614%) brightness(92%)'
                }}
              />
            ),
            action: () => handleClick('Cybersecurity Goals')
          },
          {
            label: 'Requirements',
            icon: () => (
              <img
                src="https://img.icons8.com/?size=100&id=h88n73Ss5iTI&format=png&color=000000"
                style={{
                  width: 24,
                  height: 24,
                  filter: 'invert(47%) sepia(82%) hue-rotate(189deg) saturate(614%) brightness(92%)'
                }}
              />
            ),
            action: () => handleClick('Cybersecurity Requirements')
          },
          {
            label: 'Controls',
            icon: () => (
              <img
                src="https://img.icons8.com/?size=100&id=vFqlDrzMYOT0&format=png&color=000000"
                style={{
                  width: 24,
                  height: 24,
                  filter: 'invert(47%) sepia(82%) hue-rotate(189deg) saturate(614%) brightness(92%)'
                }}
              />
            ),
            action: () => handleClick('Cybersecurity Controls')
          },
          {
            label: 'Claims',
            icon: () => (
              <img
                src="https://img.icons8.com/?size=100&id=40886&format=png&color=000000"
                style={{
                  width: 24,
                  height: 24,
                  filter: 'invert(47%) sepia(82%) hue-rotate(189deg) saturate(614%) brightness(92%)'
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
      color: '#1e88e5', // Darker blue color
      background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
      border: 'none',
      borderRadius: '6px',
      transition: 'all 0.3s ease',
      '&:hover': {
        background: isDark
          ? 'linear-gradient(90deg, rgba(30,136,229,0.15) 0%, rgba(30,136,229,0.03) 100%)' // Adjusted for #1e88e5
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
        color: '#1e88e5', // Darker blue color
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
      color: '#1e88e5', // Darker blue color
      borderBottom: '2px solid #1e88e5', // Darker blue border
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
            width: '70px'
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
                        color: '#1e88e5' // Darker blue color
                      }}
                    />
                  )}
                </IconButton>
              </Tooltip>
              <Typography
                sx={{
                  marginTop: '4px',
                  fontSize: '10px',
                  fontFamily: "'Poppins', sans-serif",
                  textAlign: 'center',
                  color: color?.sidebarContent
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
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center'
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
          marginBottom: '6px'
        }}
      >
        <IconButton
          onClick={handleToggleCollapse}
          sx={{
            padding: '4px',
            color: '#1e88e5', // Darker blue color
            transition: 'all 0.3s ease',
            '&:hover': {
              background: isDark ? 'rgba(30,136,229,0.15)' : 'rgba(30,136,229,0.08)',
              transform: 'scale(1.1)',
              boxShadow: isDark ? '0 2px 6px rgba(0,0,0,0.4)' : '0 2px 6px rgba(0,0,0,0.1)'
            }
          }}
        >
          {isCollapsed ? (
            <ExpandMoreIcon sx={{ fontSize: 22, color: '#1e88e5' }} />
          ) : (
            <ExpandLessIcon sx={{ fontSize: 22, color: '#1e88e5' }} />
          )}
        </IconButton>

        <Box sx={{ display: 'flex', justifyContent: 'space-evenly', flexGrow: 1 }}>
          {tabs.map((tab) => (
            <Box key={tab.name} sx={{ position: 'relative', display: 'inline-block' }}>
              <Typography
                onClick={(e) => handleTabChange(e, tab.name)}
                sx={{
                  ...tabStyles,
                  ...(activeTab === tab.name ? activeTabStyles : {}),
                  color: activeTab === tab.name ? '#1e88e5' : color?.sidebarContent
                }}
              >
                {tab.name}
              </Typography>

              {isCollapsed && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 'calc(100% + 2px)',
                    left: 0,
                    zIndex: 1300,
                    display: 'none',
                    background: color.tabBorder,
                    backdropFilter: 'blur(8px)',
                    borderRadius: '8px',
                    border: 'none',
                    padding: '8px',
                    boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.5)' : '0 4px 12px rgba(0,0,0,0.15)',
                    flexWrap: 'wrap',
                    justifyContent: 'space-evenly',
                    gap: '4px',
                    width: 'max-content',
                    maxWidth: '280px',
                    opacity: 0,
                    transition: 'opacity 0.3s ease-in-out',
                    '&:hover': { display: 'flex', opacity: 1 },
                    '.MuiTypography-root:hover + &': { display: 'flex', opacity: 1 }
                  }}
                >
                  {tab.options.map(renderOptionButton)}
                </Box>
              )}
            </Box>
          ))}
        </Box>
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
      {/* Export Menu */}
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
      >
        <MenuItem onClick={handleExportJSON}>Export as JSON</MenuItem>
        <MenuItem onClick={handleExportPDF}>Export as PDF</MenuItem>
      </Menu>

      {openModal.New && <AddModel getModels={getModels} open={openModal.New} handleClose={(e) => handleCloseModal(e, 'New')} />}
      {openModal.Rename && <RenameProject open={openModal.Rename} handleClose={(e) => handleCloseModal(e, 'Rename')} Models={Models} />}
      {openModal.Open && <SelectProject open={openModal.Open} handleClose={(e) => handleCloseModal(e, 'Open')} Models={Models} />}
      {openModal.Delete && (
        <DeleteProject
          open={openModal.Delete}
          model={model}
          handleClose={(e) => handleCloseModal(e, 'Delete')}
          Models={Models}
          deleteModels={deleteModels}
          getModels={getModels}
          anchorEl={anchorEl}
        />
      )}
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