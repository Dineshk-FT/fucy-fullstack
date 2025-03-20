/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { Box, Tooltip, Typography, IconButton } from '@mui/material';
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
  // New imports for more specific icons
  CreateNewFolder as NewFolderIcon, // For new project
  DriveFileRenameOutline as RenameIcon, // For rename
  Assessment as AssessmentIcon, // For analysis/risk
  Warning as WarningIcon, // For threats/damage
  Star as StarIcon, // For ratings
  Security as SecurityIcon, // For cybersecurity
  PlaylistAdd as AddListIcon, // For adding attacks
  AccountTree as TreeIcon, // For attack trees
  Build as BuildIcon, // For system/components
  Assignment as AssignmentIcon, // For requirements/claims
  Shield as ShieldIcon, // For controls
  ReportProblem as ReportIcon, // For derivation
  ListAlt as ListAltIcon, // For detailed tables
  Group as GroupIcon
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
import { openAddNodeTab } from '../../../../store/slices/CanvasSlice';
import { useDispatch } from 'react-redux';
import { closeAll, setPreviousTab, setTableOpen } from '../../../../store/slices/CurrentIdSlice';
import CommonModal from '../../../../ui-component/Modal/CommonModal';
import { setTitle } from '../../../../store/slices/PageSectionSlice';
import PromptModal from '../../../../ui-component/Modal/PromptModal';

const LeftSection = () => {
  const selector = (state) => ({
    Models: state.Models,
    model: state.model,
    getModels: state.getModels,
    deleteModels: state.deleteModels,
    getSidebarNode: state.getSidebarNode,
    getTemplates: state.getTemplates,
    setClickedItem: state.setClickedItem,
    getAttackScenario: state.getAttackScenario,
    attackScenarios: state.attackScenarios
  });

  const color = ColorTheme();
  const { Models, model, getModels, deleteModels, getSidebarNode, getTemplates, setClickedItem, getAttackScenario, attackScenarios } =
    useStore(selector);
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

  useEffect(() => {
    getSidebarNode();
    getTemplates();
    if (model?._id) {
      getAttackScenario(model._id);
    }
  }, [model?._id]);

  const handleAddNewNode = (e) => {
    dispatch(openAddNodeTab());
  };

  const handleSystemTabClick = () => setOpenTemplateDialog(true);
  const handleComponentsTabClick = () => setOpenComponentsDialog(true);

  const handleTabChange = (tabName) => {
    dispatch(setPreviousTab(tabName));
    setActiveTab(tabName);
    const actions = {
      'Model Definition & Assets': handleModelDefinationClick,
      'Threat Scenarios': () => handleClick('Threat Scenarios'),
      'Damage Scenarios': () => handleClick('Damage Scenarios Derivations'),
      'Attack Path': handleAttackTableClick,
      CyberSecurity: () => handleClick('Cybersecurity Goals'),
      'Risk Determination & Treatment': () => handleClick('Threat Assessment & Risk Treatment')
    };
    actions[tabName]?.();
  };

  const handleContext = (name, event) => {
    if (name === 'Attack') {
      setOpenAttackModal(true);
      setSubName(name);
    } else if (name === 'Attack Trees') {
      setOpenAttackModal(true);
      setSubName(name);
    } else if (name === 'create with AI') {
      setOpenModal((prev) => ({ ...prev, AIModal: true }));
    }
  };

  const handleAttackTreeClose = () => {
    setOpenAttackModal(false);
  };

  const handleClick = (name) => {
    dispatch(setPreviousTab(name));
    dispatch(setTitle(name));
    dispatch(setTableOpen(name));
  };

  const handleModelDefinationClick = () => {
    setClickedItem(model?._id);
    dispatch(closeAll());
  };

  const handleAttackTreeClick = async (e) => {
    setIsLoading(true);
    setAnchorEl(e.currentTarget);
    if (model?._id) {
      await getAttackScenario(model._id);
      setOpenModal((prev) => ({ ...prev, AttackModal: true }));
    }
    setIsLoading(false);
  };

  const handleAttackTableClick = () => {
    dispatch(setPreviousTab('Attack'));
    if (model?._id) {
      setClickedItem(model._id);
      dispatch(setTitle('Attack')); // Changed from 'Attack-Table' to 'Attack'
      dispatch(setTableOpen('Attack')); // Changed from 'Attack-Table' to 'Attack'
    }
  };

  const handleGroupDrag = (event) => {
    const parseFile = JSON.stringify('');
    event.dataTransfer.setData('application/group', parseFile);
    event.dataTransfer.effectAllowed = 'move';
  };

  const tabs = [
    {
      name: 'Project',
      options: [
        { label: 'New', icon: NewFolderIcon, action: () => setOpenModal({ ...openModal, New: true }) }, // New folder for new project
        { label: 'Rename', icon: RenameIcon, action: () => setOpenModal({ ...openModal, Rename: true }) }, // Specific rename icon
        { label: 'Open', icon: FolderOpenIcon, action: () => setOpenModal({ ...openModal, Open: true }) }, // Open folder
        { label: 'Delete', icon: DeleteIcon, action: () => setOpenModal({ ...openModal, Delete: true }) } // Trash bin
        // { label: 'Undo', icon: UndoIcon, action: () => console.log('Undo') }, // Undo arrow
        // { label: 'Redo', icon: RedoIcon, action: () => console.log('Redo') }, // Redo arrow
        // { label: 'Cut', icon: CutIcon, action: () => console.log('Cut') }, // Scissors
        // { label: 'Copy', icon: CopyIcon, action: () => console.log('Copy') }, // Copy sheets
        // { label: 'Paste', icon: PasteIcon, action: () => console.log('Paste') }, // Clipboard paste
        // { label: 'Select All', icon: SelectAllIcon, action: () => console.log('Select All') }, // Check all
        // { label: 'Deselect All', icon: DeselectIcon, action: () => console.log('Deselect All') } // Uncheck all
      ]
    },
    {
      name: 'Model Definition & Assets',
      options: [
        { label: 'New',
          icon: () => (
            <img
              src="https://img.icons8.com/?size=100&id=dviuFeWyguPJ&format=png&color=000000"
              style={{ width: 24, height: 24 }}
            />
          ),  
          action: handleAddNewNode 
        }, // Plus for new model
        { 
          label: 'System', 
          icon: () => (
            <img
              src="https://img.icons8.com/?size=100&id=107141&format=png&color=000000"
              style={{ width: 24, height: 24 }}
            />
          ), 
          action: handleSystemTabClick 
        }, // Wrench for system
        { label: 'Components', 
          icon: () => (
            <img
              src="https://img.icons8.com/?size=100&id=Vp7Zc5Nc7vav&format=png&color=000000"
              style={{ width: 24, height: 24 }}
            />
          ), 
          action: handleComponentsTabClick 
        }, // List for components
        {
          label: 'Group',
          icon: () => (
            <img
              src="https://img.icons8.com/?size=100&id=41480&format=png&color=000000"
              style={{ width: 24, height: 24 }}
            />
          ),
          action: handleGroupDrag
        }
      ]
    },
    {
      name: 'Damage Scenarios',
      options: [
        { label: 'Derivation Table', 
          icon: () => (
            <img
              src="https://img.icons8.com/?size=100&id=bCEo3v0j2MJ7&format=png&color=000000"
              style={{ width: 24, height: 24 }}
            />
          ),
          action: () => handleClick('Damage Scenarios Derivations') 
        }, // Report for derivation
        { 
          label: 'Impact Rating Table', 
          icon: () => (
            <img
              src="https://img.icons8.com/?size=100&id=Imv4VIewVo4o&format=png&color=000000"
              style={{ width: 24, height: 24 }}
            />
          ),
          action: () => handleClick('Damage Scenarios - Collection & Impact Ratings') 
        } // Star for rating
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
              style={{ width: 24, height: 24 }}
            />
          ),
          action: () => handleClick('Threat Scenarios') 
        } // Warning for threats
      ]
    },
    {
      name: 'Attack Path',
      options: [
        { label: 'Attack Table', icon: TableIcon, action: handleAttackTableClick }, // Table for attack data
        { label: 'Add Attack', icon: AddListIcon, action: (e) => handleContext('Attack', e) }, // Add list for attacks
        { label: 'Attack Trees', icon: TreeIcon, action: handleAttackTreeClick }, // Tree for attack trees
        { label: 'Add Attack Tree', icon: AddListIcon, action: (e) => handleContext('Attack Trees', e) }, // Playlist add for trees
        { label: 'create with AI', icon: AddListIcon, action: (e) => handleContext('create with AI', e) } // Playlist add for trees
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
              style={{ width: 24, height: 24 }}
            />
          ),
          action: () => handleClick('Cybersecurity Goals') 
        }, // Shield for goals
        { 
          label: 'Requirements', 
          icon: () => (
            <img
              src="https://img.icons8.com/?size=100&id=h88n73Ss5iTI&format=png&color=000000"
              style={{ width: 24, height: 24 }}
            />
          ), 
          action: () => handleClick('Cybersecurity Requirements') 
        }, // Document for requirements
        { 
          label: 'Controls', 
          icon: () => (
            <img
              src="https://img.icons8.com/?size=100&id=vFqlDrzMYOT0&format=png&color=000000"
              style={{ width: 24, height: 24 }}
            />
          ), 
          action: () => handleClick('Cybersecurity Controls') 
        }, // Stronger shield for controls
        { 
          label: 'Claims', 
          icon: () => (
            <img
              src="https://img.icons8.com/?size=100&id=40886&format=png&color=000000"
              style={{ width: 24, height: 24 }}
            />
          ), 
          action: () => handleClick('Cybersecurity Claims') 
        } // Assessment for claims
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
              style={{ width: 24, height: 24 }}
            />
          ),
          action: () => handleClick('Threat Assessment & Risk Treatment') 
        } // Assessment for risk
      ]
    }
  ];

  const handleCloseNewModal = () => setOpenModal((prev) => ({ ...prev, New: false }));
  const handleCloseOpenModal = () => setOpenModal((prev) => ({ ...prev, Open: false }));
  const handleCloseDeleteModal = () => setOpenModal((prev) => ({ ...prev, Delete: false }));
  const handleCloseRenameModal = () => setOpenModal((prev) => ({ ...prev, Rename: false }));
  const handleCloseAttackModal = () => setOpenModal((prev) => ({ ...prev, AttackModal: false }));

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-evenly', backgroundColor: 'transparent', padding: '4px', paddingTop: '8px' }}>
        {tabs.map((tab) => (
          <Typography
            key={tab.name}
            onClick={() => handleTabChange(tab.name)}
            sx={{
              cursor: 'pointer',
              fontSize: '12px',
              color: activeTab === tab.name ? 'blue' : color.title,
              fontWeight: activeTab === tab.name ? 'bold' : 'normal',
              margin: '0 8px',
              padding: '2px 4px',
              borderBottom: activeTab === tab.name ? '2px solid blue' : 'none',
              paddingBottom: activeTab === tab.name ? '2px' : '0px',
              '&:hover': { color: 'blue' }
            }}
          >
            {tab.name}
          </Typography>
        ))}
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-evenly',
          padding: '6px',
          borderRadius: '10px',
          backgroundColor: color.canvasBG,
          border: '1px solid #ddd',
          gap: '5px',
          // width: { xs: '350px', sm: '500px', md: 'auto', lg: 'auto' },
          width: { xs: '700px', sm: '800px', md: '1000px', lg: '1250px' },
          height: { xs: '50px', sm: '50px', md: 'inherit', lg: 'auto' },
          overflow: 'auto',
          my: 0.4
        }}
      >
        {tabs
          .find((tab) => tab.name === activeTab)
          ?.options.map((option, index) => {
            const Icon = option.icon;
            return (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: '100px'
                }}
                draggable={option.label === 'Group'} // Make only the Group option draggable
                onDragStart={option.label === 'Group' ? handleGroupDrag : undefined} // Handle drag start
              >
                {option.label && (
                  <>
                    <Tooltip title={option.label}>
                      <IconButton
                        onClick={option.action}
                        sx={{
                          padding: '6px',
                          fontSize: '12px',
                          color: color.title,
                          backgroundColor: color?.sidebarBG,
                          border: '1px solid #ddd',
                          '&:hover': { backgroundColor: color.sidebarBG }
                        }}
                      >
                        <Icon fontSize="medium" />
                      </IconButton>
                    </Tooltip>
                    <Typography
                      sx={{
                        marginTop: '4px',
                        fontSize: '10px',
                        textAlign: 'center',
                        color: color.title
                      }}
                    >
                      {option.label}
                    </Typography>
                  </>
                )}
              </Box>
            );
          })}
      </Box>

      {openModal.New && <AddModel getModels={getModels} open={openModal.New} handleClose={handleCloseNewModal} />}
      {openModal.Rename && <RenameProject open={openModal.Rename} handleClose={handleCloseRenameModal} Models={Models} />}
      {openModal.Open && <SelectProject open={openModal.Open} handleClose={handleCloseOpenModal} Models={Models} />}
      {openModal.Delete && (
        <DeleteProject
          open={openModal.Delete}
          model={model}
          handleClose={handleCloseDeleteModal}
          Models={Models}
          deleteModels={deleteModels}
          getModels={getModels}
        />
      )}
      {openModal.AIModal && (
        <PromptModal open={openModal?.AIModal} handleClose={() => setOpenModal((pre) => ({ ...pre, AIModal: false }))} />
      )}
      <TemplateList openDialog={openTemplateDialog} setOpenDialog={setOpenTemplateDialog} />
      <Components openDialog={openComponentsDialog} setOpenDialog={setOpenComponentsDialog} />
      {openAttackModal && <CommonModal open={openAttackModal} handleClose={handleAttackTreeClose} name={subName} />}
      {openModal.AttackModal && (
        <AttackTreeRibbonModal
          open={openModal.AttackModal}
          handleClose={handleCloseAttackModal}
          isLoading={isLoading}
          anchorEl={anchorEl}
          attackScenarios={attackScenarios}
          getAttackScenario={getAttackScenario}
        />
      )}
    </Box>
  );
};

export default LeftSection;
