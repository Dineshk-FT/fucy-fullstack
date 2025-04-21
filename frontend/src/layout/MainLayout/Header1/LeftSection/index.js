/* eslint-disable */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Box, Tooltip, Typography, IconButton, Collapse } from '@mui/material';
import {
  Add as AddIcon,
  FolderOpen as FolderOpenIcon,
  Delete as DeleteIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  ContentCut as CutIcon,
  ContentCopy as CopyIcon,
  ContentPaste as PasteIcon,
  SelectAll as SelectAllIcon,
  Deselect as DeselectIcon,
  TableChart as TableIcon,
  Edit as EditIcon,
  CreateNewFolder as NewFolderIcon,
  DriveFileRenameOutline as RenameIcon,
  Assessment as AssessmentIcon,
  Warning as WarningIcon,
  Star as StarIcon,
  Security as SecurityIcon,
  PlaylistAdd as AddListIcon,
  AccountTree as TreeIcon,
  Build as BuildIcon,
  Assignment as AssignmentIcon,
  Shield as ShieldIcon,
  ReportProblem as ReportIcon,
  ListAlt as ListAltIcon,
  Group as GroupIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import TemplateList from '../../../../views/Libraries';
import Components from '../../../../views/NodeList';
import SelectProject from '../../../../ui-component/Modal/SelectProject';
import AddModel from '../../../../ui-component/Modal/AddModal';
import RenameProject from '../../../../ui-component/Modal/RenameModal';
import DeleteProject from '../../../../ui-component/Modal/DeleteProjects';
import useStore from '../../../../Zustand/store';
import AttackTreeRibbonModal from '../../../../ui-component/Modal/AttackTreeRibbonModal';
import ColorTheme from '../../../../store/ColorTheme';
import { openAddNodeTab, openAddDataNodeTab } from '../../../../store/slices/CanvasSlice';
import { useDispatch, useSelector } from 'react-redux';
import { closeAll, setPreviousTab, setTableOpen } from '../../../../store/slices/CurrentIdSlice';
import CommonModal from '../../../../ui-component/Modal/CommonModal';
import { setTitle } from '../../../../store/slices/PageSectionSlice';
import PromptModal from '../../../../ui-component/Modal/PromptModal';

const LeftSection = () => {
  const selector = useCallback(
    (state) => ({
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
      setCollapsed: state.setCollapsed
    }),
    []
  );

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
    setCollapsed
  } = useStore(selector);

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
  const [openAttackModal, setOpenAttackModal] = useState(false);
  const [subName, setSubName] = useState('');

  // console.log('left section rendered');
  useEffect(() => {
    getSidebarNode();
    getTemplates();
    if (model?._id) {
      getAttackScenario(model._id);
    }
  }, [model?._id, getSidebarNode, getTemplates, getAttackScenario]);

  const handleAddNewNode = useCallback(() => {
    dispatch(openAddNodeTab());
  }, [dispatch]);

  const handleAddDataNode = useCallback(() => {
    dispatch(openAddDataNodeTab());
  }, [dispatch]);

  const handleSystemTabClick = useCallback(() => setOpenTemplateDialog(true), []);
  const handleComponentsTabClick = useCallback(() => setOpenComponentsDialog(true), []);

  const handleTabChange = useCallback(
    (tabName) => {
      dispatch(setPreviousTab(tabName));
      setActiveTab(tabName);
      const actions = {
        'Item Definition': handleModelDefinationClick,
        'Damage Scenarios': () => handleClick('Damage Scenarios (DS) Derivations', '2'),
        'Threat Scenarios': () => handleClick('Threat Scenarios', '3'),
        'Attack Path': handleAttackTableClick,
        Cybersecurity: () => handleClick('Cybersecurity Goals', '5'),
        'Risk Determination & Treatment': () => handleClick('Threat Assessment & Risk Treatment', '8')
      };
      actions[tabName]?.();
    },
    [dispatch]
  );

  const handleToggleCollapse = useCallback(() => {
    setCollapsed((prev) => !prev);
  }, [setCollapsed]);

  const handleContext = useCallback((name, event) => {
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

  const tabs = useMemo(
    () => [
      {
        name: 'Project',
        options: [
          { label: 'New', icon: NewFolderIcon, action: () => setOpenModal((prev) => ({ ...prev, New: true })) },
          { label: 'Rename', icon: RenameIcon, action: () => setOpenModal((prev) => ({ ...prev, Rename: true })) },
          { label: 'Open', icon: FolderOpenIcon, action: () => setOpenModal((prev) => ({ ...prev, Open: true })) },
          { label: 'Delete', icon: DeleteIcon, action: () => setOpenModal((prev) => ({ ...prev, Delete: true })) }
        ]
      },
      {
        name: 'Item Definition',
        options: [
          { label: 'New Data', icon: NewFolderIcon, action: handleAddDataNode },
          {
            label: 'New Component',
            icon: () => (
              <img src="https://img.icons8.com/?size=100&id=dviuFeWyguPJ&format=png&color=000000" style={{ width: 24, height: 24 }} />
            ),
            action: handleAddNewNode
          },
          {
            label: 'Group',
            icon: () => <img src="https://img.icons8.com/?size=100&id=41480&format=png&color=000000" style={{ width: 24, height: 24 }} />,
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
              <img src="https://img.icons8.com/?size=100&id=bCEo3v0j2MJ7&format=png&color=000000" style={{ width: 24, height: 24 }} />
            ),
            action: () => handleClick('Damage Scenarios (DS) Derivations')
          },
          {
            label: 'Impact Rating Table',
            icon: () => (
              <img src="https://img.icons8.com/?size=100&id=Imv4VIewVo4o&format=png&color=000000" style={{ width: 24, height: 24 }} />
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
              <img src="https://img.icons8.com/?size=100&id=bCEo3v0j2MJ7&format=png&color=000000" style={{ width: 24, height: 24 }} />
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
            icon: () => <img src="https://img.icons8.com/?size=100&id=20884&format=png&color=000000" style={{ width: 24, height: 24 }} />,
            action: () => handleClick('Cybersecurity Goals')
          },
          {
            label: 'Requirements',
            icon: () => (
              <img src="https://img.icons8.com/?size=100&id=h88n73Ss5iTI&format=png&color=000000" style={{ width: 24, height: 24 }} />
            ),
            action: () => handleClick('Cybersecurity Requirements')
          },
          {
            label: 'Controls',
            icon: () => (
              <img src="https://img.icons8.com/?size=100&id=vFqlDrzMYOT0&format=png&color=000000" style={{ width: 24, height: 24 }} />
            ),
            action: () => handleClick('Cybersecurity Controls')
          },
          {
            label: 'Claims',
            icon: () => <img src="https://img.icons8.com/?size=100&id=40886&format=png&color=000000" style={{ width: 24, height: 24 }} />,
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
              <img src="https://img.icons8.com/?size=100&id=bCEo3v0j2MJ7&format=png&color=000000" style={{ width: 24, height: 24 }} />
            ),
            action: () => handleClick('Threat Assessment & Risk Treatment')
          }
        ]
      }
    ],
    [handleAddDataNode, handleAddNewNode, handleGroupDrag, handleClick, handleAttackTableClick, handleContext, handleAttackTreeClick]
  );

  const handleCloseModal = useCallback((modalName) => {
    setOpenModal((prev) => ({ ...prev, [modalName]: false }));
  }, []);

  const currentTabOptions = useMemo(() => tabs.find((tab) => tab.name === activeTab)?.options || [], [tabs, activeTab]);

  const buttonStyles = useMemo(
    () => ({
      padding: '6px',
      fontSize: '12px',
      color: isDark ? '#64b5f6' : '#2196f3',
      background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
      border: 'none',
      borderRadius: '6px',
      transition: 'all 0.3s ease',
      '&:hover': {
        background: isDark
          ? 'linear-gradient(90deg, rgba(100,181,246,0.15) 0%, rgba(100,181,246,0.03) 100%)'
          : 'linear-gradient(90deg, rgba(33,150,243,0.08) 0%, rgba(33,150,243,0.02) 100%)',
        transform: 'scale(1.1)',
        boxShadow: isDark ? '0 2px 6px rgba(0,0,0,0.4)' : '0 2px 6px rgba(0,0,0,0.1)',
        filter: isDark ? 'drop-shadow(0 0 6px rgba(100,181,246,0.25))' : 'drop-shadow(0 0 6px rgba(33,150,243,0.15))'
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
        color: isDark ? '#64b5f6' : '#2196f3',
        background: isDark
          ? 'linear-gradient(90deg, rgba(100,181,246,0.15) 0%, rgba(100,181,246,0.03) 100%)'
          : 'linear-gradient(90deg, rgba(33,150,243,0.08) 0%, rgba(33,150,243,0.02) 100%)',
        transform: 'scale(1.02)',
        boxShadow: isDark ? '0 2px 6px rgba(0,0,0,0.4)' : '0 2px 6px rgba(0,0,0,0.1)',
        filter: isDark ? 'drop-shadow(0 0 6px rgba(100,181,246,0.25))' : 'drop-shadow(0 0 6px rgba(33,150,243,0.15))'
      }
    }),
    [isDark]
  );

  const activeTabStyles = useMemo(
    () => ({
      fontWeight: 600,
      color: isDark ? '#64b5f6' : '#2196f3',
      borderBottom: isDark ? '2px solid #64b5f6' : '2px solid #2196f3',
      background: isDark
        ? 'linear-gradient(90deg, rgba(100,181,246,0.25) 0%, rgba(100,181,246,0.08) 100%)'
        : 'linear-gradient(90deg, rgba(33,150,243,0.15) 0%, rgba(33,150,243,0.03) 100%)',
      boxShadow: isDark ? '0 3px 8px rgba(0,0,0,0.5)' : '0 3px 8px rgba(0,0,0,0.1)'
    }),
    [isDark]
  );

  const renderOptionButton = useCallback(
    (option, index) => {
      const Icon = option.icon;
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
                  <Icon fontSize="small" sx={{ fontSize: 20 }} />
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
            color: isDark ? '#64b5f6' : '#2196f3',
            transition: 'all 0.3s ease',
            '&:hover': {
              background: isDark ? 'rgba(100,181,246,0.15)' : 'rgba(33,150,243,0.08)',
              transform: 'scale(1.1)',
              boxShadow: isDark ? '0 2px 6px rgba(0,0,0,0.4)' : '0 2px 6px rgba(0,0,0,0.1)'
            }
          }}
        >
          {isCollapsed ? <ExpandMoreIcon sx={{ fontSize: 22 }} /> : <ExpandLessIcon sx={{ fontSize: 22 }} />}
        </IconButton>

        <Box sx={{ display: 'flex', justifyContent: 'space-evenly', flexGrow: 1 }}>
          {tabs.map((tab) => (
            <Box key={tab.name} sx={{ position: 'relative', display: 'inline-block' }}>
              <Typography
                onClick={() => handleTabChange(tab.name)}
                sx={{
                  ...tabStyles,
                  ...(activeTab === tab.name ? activeTabStyles : {}),
                  color: activeTab === tab.name ? (isDark ? '#64b5f6' : '#2196f3') : color?.sidebarContent
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

      {openModal.New && <AddModel getModels={getModels} open={openModal.New} handleClose={() => handleCloseModal('New')} />}
      {openModal.Rename && <RenameProject open={openModal.Rename} handleClose={() => handleCloseModal('Rename')} Models={Models} />}
      {openModal.Open && <SelectProject open={openModal.Open} handleClose={() => handleCloseModal('Open')} Models={Models} />}
      {openModal.Delete && (
        <DeleteProject
          open={openModal.Delete}
          model={model}
          handleClose={() => handleCloseModal('Delete')}
          Models={Models}
          deleteModels={deleteModels}
          getModels={getModels}
        />
      )}
      {openModal.AIModal && (
        <PromptModal open={openModal?.AIModal} handleClose={() => setOpenModal((prev) => ({ ...prev, AIModal: false }))} />
      )}
      <TemplateList openDialog={openTemplateDialog} setOpenDialog={setOpenTemplateDialog} />
      <Components openDialog={openComponentsDialog} setOpenDialog={setOpenComponentsDialog} />
      {openAttackModal && <CommonModal open={openAttackModal} handleClose={handleAttackTreeClose} name={subName} />}
      {openModal.AttackModal && (
        <AttackTreeRibbonModal
          open={openModal.AttackModal}
          handleClose={() => handleCloseModal('AttackModal')}
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
