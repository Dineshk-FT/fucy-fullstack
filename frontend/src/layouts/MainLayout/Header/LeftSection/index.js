/* eslint-disable */
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Box,
  Tooltip,
  Typography,
  IconButton,
  Collapse,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  FolderOpen as FolderOpenIcon,
  Delete as DeleteIcon,
  Backspace as BackspaceIcon,
  TableChart as TableIcon,
  LibraryBooks as LibraryBooksIcon,
  CreateNewFolderOutlined as CreateNewFolderOutlinedIcon,
  CreateNewFolder as NewFolderIcon,
  DriveFileRenameOutline as RenameIcon,
  PlaylistAdd as AddListIcon,
  AccountTree as TreeIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Help as HelpIcon,
  Dashboard as DashboardIcon,
  DirectionsCar as DirectionsCarIcon
} from '@mui/icons-material';
import AutoModeIcon from '@mui/icons-material/AutoMode';
import TemplateList from '../../../../pages/Libraries';
import Components from '../../../../pages/NodeList';
import SelectProject from '../../../../components/Modal/SelectProject';
import AddModel from '../../../../components/Modal/AddModal';
import RenameProject from '../../../../components/Modal/RenameModal';
import DeleteProject from '../../../../components/Modal/DeleteProjects';
import LibraryModal from '../../../../components/Modal/LibraryModal';
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
import VehicleTARADialog from '../../../../components/VehicleTARADialog';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router';
import GenerateModel from '../../../../components/Modal/GenerateModel';
import DashboardDialog from '../../../../components/Dashboard';
import ScenarioAIModal from '../../../../components/Modal/ScenarioAIModal';
import ConfirmDeleteDialog from '../../../../components/Modal/ConfirmDeleteDialog';
import TestAssetsDialog from '../../../../components/Modal/TestAssetsDialog';

const notify = (message, status) => toast[status](message);

const selector = (state) => ({
  Models: state.Models,
  model: state.model,
  getModels: state.getModels,
  getModelById: state.getModelById,
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
  setOpenSave: state.setOpenSave,
  assets: state.assets,
  clearModel: state.clearModel,
  autoGenerateRiskTreatement: state.autoGenerateRiskTreatement,
  getRiskTreatment: state.getRiskTreatment,
  getDamageScenarios: state.getDamageScenarios,
  getThreatScenarios: state.getThreatScenario,
  getAttackScenarios: state.getAttackScenario,
  getCybersecurity: state.getCyberSecurityScenario,
  clearDamageScenario: state.clearDamageScenario,
  clearThreatScenario: state.clearThreatScenario,
  clearAttackScenario: state.clearAttackScenario,
  clearCybersecurity: state.clearCybersecurity,
  clearRiskTreatment: state.clearRiskTreatment
});

const LeftSection = () => {
  const { isDark } = useSelector((state) => state?.currentId);
  const color = ColorTheme();
  const [taraDialogOpen, setTaraDialogOpen] = useState(false);
  const {
    Models,
    model,
    getModels,
    getModelById,
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
    setOpenSave,
    assets,
    convertToLibrary,
    clearModel,
    autoGenerateRiskTreatement,
    getRiskTreatment,
    getDamageScenarios,
    getThreatScenarios,
    getAttackScenarios,
    getCybersecurity,
    clearRiskTreatment,
    clearThreatScenario,
    clearAttackScenario,
    clearDamageScenario,
    clearCybersecurity
  } = useStore(selector, shallow);

  const categories = [
    'Powertrain / Electric Drive Domain',
    'Energy & Charging Systems',
    'Chassis & Vehicle Dynamics',
    'ADAS & Autonomous Driving',
    'Infotainment & Connectivity',
    'Body Control & Comfort',
    'Cybersecurity',
    'Uncategorized'
  ];

  const [activeTab, setActiveTab] = useState('Project');
  const [openModal, setOpenModal] = useState({
    New: false,
    NewAI: false,
    Rename: false,
    Open: false,
    Delete: false,
    Library: false,
    AttackModal: false,
    AIModal: false
  });

  const [clearConfig, setClearConfig] = useState({
    open: false,
    name: '',
    onConfirm: null
  });
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Uncategorized');
  const [isLoading, setIsLoading] = useState(false);
  const [openTemplateDialog, setOpenTemplateDialog] = useState(false);
  const [openComponentsDialog, setOpenComponentsDialog] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [openAttackModal, setOpenAttackModal] = useState(false);
  const [subName, setSubName] = useState('');
  const [exportAnchorEl, setExportAnchorEl] = useState(null);
  const [hoveredTab, setHoveredTab] = useState(null);
  const [openDashboard, setOpenDashboard] = useState(false);
  const hoverTimeoutRef = useRef(null);
  const [scenarioType, setScenarioType] = useState(null);
  const [openScenarioModal, setOpenScenarioModal] = useState(false);
  const [openTestAssets, setOpenTestAssets] = useState(false);

  // Define clearable items configuration
  const clearableItems = {
    model: {
      name: () => `"${model?.name || 'the current model'}"`,
      handler: () => clearModel(model?._id),
      refresh: () => getModelById(model?._id),
      successMessage: (res) => res?.message ?? 'Model cleared successfully'
    },
    'damage-scenarios': {
      name: 'all damage scenarios',
      handler: () => clearDamageScenario(model?._id),
      refresh: () => getDamageScenarios(model?._id),
      successMessage: (res) => res?.message ?? 'Damage scenarios cleared successfully'
    },
    'threat-scenarios': {
      name: 'all threat scenarios',
      handler: () => clearThreatScenario(model?._id),
      refresh: () => getThreatScenarios(model?._id),
      successMessage: (res) => res?.message ?? 'Threat scenarios cleared successfully'
    },
    'attack-scenarios': {
      name: 'all attack scenarios',
      handler: () => clearAttackScenario(model?._id),
      refresh: () => getAttackScenarios(model?._id),
      successMessage: (res) => res?.message ?? 'Attack scenarios cleared successfully'
    },
    cybersecurity: {
      name: 'all cybersecurity data',
      handler: () => clearCybersecurity(model?._id),
      refresh: () => getCybersecurity(model?._id),
      successMessage: (res) => res?.message ?? 'Cybersecurity data cleared successfully'
    },
    'risk-treatment': {
      name: 'all risk treatment data',
      handler: () => clearRiskTreatment(model?._id),
      refresh: () => getRiskTreatment({ modelId: model?._id }),
      successMessage: (res) => res?.message ?? 'Risk treatment data cleared successfully'
    }
  };

  // Generic clear handler factory
  const createClearHandler = useCallback(
    (itemKey) => {
      const item = clearableItems[itemKey];
      if (!item) return null;

      return async () => {
        try {
          const res = await item.handler();
          if (!res?.error) {
            notify(item.successMessage(res), 'success');
            if (item.refresh) await item.refresh();
          } else {
            notify(res?.error ?? `Failed to clear ${item.name}`, 'error');
          }
        } catch (err) {
          console.error(`Error clearing ${itemKey}:`, err);
          notify('Something went wrong', 'error');
        }
      };
    },
    [
      model?._id,
      clearModel,
      clearDamageScenario,
      clearThreatScenario,
      clearAttackScenario,
      clearCybersecurity,
      clearRiskTreatment,
      getModelById,
      getDamageScenarios,
      getThreatScenarios,
      getAttackScenarios,
      getCybersecurity,
      getRiskTreatment
    ]
  );

  // Unified function to open clear dialog
  const openClearDialog = useCallback(
    (itemKey, event) => {
      if (event?.stopPropagation) event?.stopPropagation?.();
      const item = clearableItems[itemKey];
      if (!item) return;

      const itemName = typeof item.name === 'function' ? item.name() : item.name;
      const handler = createClearHandler(itemKey);

      setClearConfig({
        open: true,
        name: itemName,
        onConfirm: () => {
          handler();
          setClearConfig((prev) => ({ ...prev, open: false }));
        }
      });
    },
    [createClearHandler]
  );

  const closeClearDialog = useCallback(() => {
    setClearConfig((prev) => ({ ...prev, open: false }));
  }, []);

  const handleOpenTestAssets = useCallback((e) => {
    if (e?.stopPropagation) e?.stopPropagation?.();
    setOpenTestAssets(true);
  }, []);

  const handleCloseTestAssets = useCallback((e) => {
    if (e?.stopPropagation) e?.stopPropagation?.();
    setOpenTestAssets(false);
  }, []);

  const handleOpenScenarioAI = (type, e) => {
    if (e?.stopPropagation) e?.stopPropagation?.();
    setScenarioType(type);
    setOpenScenarioModal(true);
  };

  const handleClearDamageScenario = (e) => {
    if (e?.stopPropagation) e?.stopPropagation?.();
    clearDamageScenario(model?._id)
      .then((res) => {
        // console.log('res', res);
        if (!res.error) {
          notify(res?.message ?? 'Cleared successfully', 'success');
          getDamageScenarios(model._id);
        }
      })
      .catch((err) => {
        console.log('err', err);
      });
  };

  const handleCloseScenarioAI = (e) => {
    if (e?.stopPropagation) e?.stopPropagation?.();
    setOpenScenarioModal(false);
    setScenarioType(null);
  };

  const handleModalInteraction = (e) => {
    e.stopPropagation();
    // e.preventDefault();
    e.nativeEvent.stopImmediatePropagation();
  };

  const handleMouseEnter = useCallback((tabName) => {
    clearTimeout(hoverTimeoutRef.current);
    setHoveredTab(tabName);
  }, []);

  const handleMouseLeave = useCallback(
    (e) => {
      e?.stopPropagation?.();
      // Only hide the hovered tab if no modal is open
      if (!openModal.Open && !openModal.Delete && !openModal.Library) {
        hoverTimeoutRef.current = setTimeout(() => setHoveredTab(null), 2000);
      }
    },
    [openModal.Open, openModal.Delete, openModal.Library]
  );

  const handleTabWrapperMouseEnter = useCallback((e, tabName) => {
    e?.stopPropagation?.();
    clearTimeout(hoverTimeoutRef.current);
    setHoveredTab(tabName);
  }, []);

  const handleDropdownMouseEnter = useCallback((e, tabName) => {
    e?.stopPropagation?.();
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
      e?.stopPropagation?.();
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
    e?.stopPropagation?.();
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
        // console.log('File selected:', file.name);

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

  const handleTabChange = useCallback(
    (e, tabName) => {
      e?.stopPropagation?.();
      if (isChanged || isAttackChanged) {
        setOpenSave(true);
        return;
      }
      dispatch(setPreviousTab(tabName));
      setActiveTab(tabName);
      const actions = {
        'Item Definition': handleModelDefinationClick,
        'Damage Scenarios': (e) => handleClick(e, 'Damage Scenarios (DS) Derivations', '2'),
        'Threat Scenarios': (e) => handleClick(e, 'Threat Scenarios', '3'),
        'Attack Path': handleAttackTableClick,
        Cybersecurity: (e) => handleClick(e, 'Cybersecurity Goals', '5'),
        'Risk Determination & Treatment': (e) => handleClick(e, 'Threat Assessment & Risk Treatment', '8')
      };
      actions[tabName]?.();
    },
    [dispatch, isChanged, isAttackChanged]
  );

  const handleToggleCollapse = useCallback(
    (e) => {
      e?.stopPropagation?.();
      setCollapsed((prev) => !prev);
    },
    [setCollapsed]
  );
  // Replace handleClear and handleClearDamageClick with this unified approach
  const handleClearModel = useCallback(() => {
    clearModel(model._id)
      .then((res) => {
        if (!res.error) {
          notify(res.message ?? 'Cleared successfully', 'success');
          getModelById(model._id);
        }
      })
      .catch((err) => {
        console.log('err', err);
        if (err) notify('Something went wrong', 'error');
      });
  }, [clearModel, model?._id, getModelById]);

  const handleClearDamage = useCallback(async () => {
    try {
      const res = await clearDamageScenario(model?._id);
      if (!res.error) {
        notify(res?.message ?? 'Cleared successfully', 'success');
        getDamageScenarios(model._id);
      } else {
        notify(res?.error ?? 'Failed to clear damage scenarios', 'error');
      }
    } catch (err) {
      console.log('err', err);
      notify('Something went wrong', 'error');
    }
  }, [clearDamageScenario, model?._id, getDamageScenarios]);

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
    (e, name, number) => {
      e?.stopPropagation?.();
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
    // console.log('modalKey', modalKey);
    if (e?.stopPropagation) e?.stopPropagation?.();
    if (isChanged) {
      setOpenSave(true);
      handleMouseLeave(e);
      return;
    }
    setAnchorEl(e.currentTarget);
    setOpenModal((prev) => ({ ...prev, [modalKey]: true }));
  };

  const handleLibraryAdded = useCallback(() => {
    // Refresh the library list when a new library is added
    getModels(); // Assuming this refreshes the library list
  }, [getModels]);

  const handleCategoryChange = useCallback((event) => {
    event.stopPropagation();
    setSelectedCategory(event.target.value);
  }, []);

  const handleCategoryDialogOpen = useCallback(() => {
    setCategoryDialogOpen(true);
  }, []);

  const handleCategoryDialogClose = useCallback((e) => {
    e?.stopPropagation?.();
    setCategoryDialogOpen(false);
  }, []);

  const handleConvertToLibrary = useCallback(
    async (e) => {
      e?.stopPropagation?.();
      handleCategoryDialogOpen();
    },
    [handleCategoryDialogOpen]
  );

  const handleGenerateRisk = (e) => {
    e?.stopPropagation?.();
    autoGenerateRiskTreatement({ modelId: model._id })
      .then((res) => {
        // console.log('res', res);
        if (res.status === 200) {
          notify(res.message ?? 'Risk Treatement generated successfully', 'success');
          getRiskTreatment({ modelId: model._id });
        } else {
          notify('Something went wrong', 'error');
        }
      })
      .catch((err) => {
        if (err) notify('Something went wrong', 'error');
      });
  };

  const confirmConvertToLibrary = useCallback(async () => {
    if (!model?._id) {
      console.error('No active model to convert');
      notify('No active model to convert', 'error');
      return;
    }

    try {
      // Update the model with the selected category before converting to library
      const updatedModel = { ...model, category: selectedCategory };
      useStore.setState({ model: updatedModel });

      const result = await useStore.getState().convertToLibrary(model._id);
      if (result?.success) {
        notify(`Successfully converted "${result.modelName}" to library in category "${selectedCategory}"`, 'success');
        await getModels();
      } else if (result?.error) {
        notify(result.error, 'error');
      }
    } catch (error) {
      console.error('Failed to convert model:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error converting to library';
      notify(errorMessage, 'error');
    } finally {
      handleCategoryDialogClose();
    }
  }, [model, selectedCategory, getModels]);

  const tabs = useMemo(
    () => [
      {
        name: 'Dashboard',
        options: [
          {
            label: 'Open Dashboard',
            icon: () => <DashboardIcon style={{ color: '#1e88e5', width: 24, height: 24 }} />,
            action: () => setOpenDashboard(true)
          }
        ]
      },
      {
        name: 'Project',
        options: [
          { label: 'New', icon: NewFolderIcon, action: (e) => handleOpenModal('New', e) },
          { label: 'Edit Info', icon: RenameIcon, action: (e) => handleOpenModal('Rename', e) },
          { label: 'Open', icon: FolderOpenIcon, action: (e) => handleOpenModal('Open', e) },
          { label: 'Clear Model', icon: BackspaceIcon, action: (e) => openClearDialog('model', e) },
          { label: 'Delete', icon: DeleteIcon, action: (e) => handleOpenModal('Delete', e) },
          { label: 'Export', icon: Export, action: handleExportClick },
          { label: 'Import', icon: Import, action: handleImportClick },
          {
            label: 'Vehicle TARA',
            icon: DirectionsCarIcon,
            action: (e) => {
              e?.stopPropagation();
              setTaraDialogOpen(true);
            }
          },
          { label: 'Create With AI', icon: AutoModeIcon, action: (e) => handleOpenModal('NewAI', e) }
        ]
      },
      {
        name: 'Library',
        options: [
          { label: 'Open', icon: LibraryBooksIcon, action: (e) => handleOpenModal('Library', e) },
          { label: 'Make Library', icon: CreateNewFolderOutlinedIcon, action: handleConvertToLibrary, disabled: !model?._id }
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
          },
          { label: 'Create With AI', icon: AutoModeIcon, action: (e) => handleOpenScenarioAI('item', e) },
          {
            label: 'Test Assets',
            icon: () => (
              <img
                src="https://img.icons8.com/ios-filled/24/1e88e5/test-passed.png"
                alt="test assets"
                style={{
                  width: 24,
                  height: 24
                }}
              />
            ),
            action: handleOpenTestAssets
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
            action: (e) => handleClick(e, 'Damage Scenarios (DS) Derivations')
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
            action: (e) => handleClick(e, 'Damage Scenarios - Impact Ratings')
          },
          { label: 'Create With AI', icon: AutoModeIcon, action: (e) => handleOpenScenarioAI('damage', e) },
          { label: 'Clear Damage Scenarios', icon: DeleteIcon, action: (e) => openClearDialog('damage-scenarios', e) }
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
            action: (e) => handleClick(e, 'Threat Scenarios')
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
            action: (e) => handleClick(e, 'Derived Threat Scenarios')
          },
          { label: 'Create With AI', icon: AutoModeIcon, action: (e) => handleOpenScenarioAI('threat', e) },
          { label: 'Clear Threat Scenarios', icon: DeleteIcon, action: (e) => openClearDialog('threat-scenarios', e) }
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
          },
          { label: 'Create With AI', icon: AutoModeIcon, action: (e) => handleOpenScenarioAI('attack', e) },
          { label: 'Clear Attack Scenarios', icon: DeleteIcon, action: (e) => openClearDialog('attack-scenarios', e) }
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
            action: (e) => handleClick(e, 'Cybersecurity Goals')
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
            action: (e) => handleClick(e, 'Cybersecurity Requirements')
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
            action: (e) => handleClick(e, 'Cybersecurity Controls')
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
            action: (e) => handleClick(e, 'Cybersecurity Claims')
          },
          { label: 'Create With AI', icon: AutoModeIcon, action: (e) => handleOpenScenarioAI('cybersecurity', e) },
          { label: 'Clear Cybersecurity', icon: DeleteIcon, action: (e) => openClearDialog('cybersecurity', e) }
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
            action: (e) => handleClick(e, 'Threat Assessment & Risk Treatment')
          },
          {
            label: 'Auto Generate',
            icon: () => (
              <img
                src="https://img.icons8.com/?size=100&id=48129&format=png&color=000000"
                style={{
                  width: 24,
                  height: 24,
                  filter: 'invert(47%) sepia(82%) hue-rotate(189deg) saturate(614%) brightness(92%)'
                }}
              />
            ),
            action: (e) => handleGenerateRisk(e)
          },
          { label: 'Clear Risk Treatment', icon: DeleteIcon, action: (e) => openClearDialog('risk-treatment', e) }
        ]
      }
    ],
    [
      handleAddNewNode,
      handleGroupDrag,
      handleClick,
      handleAttackTableClick,
      handleContext,
      handleAttackTreeClick,
      handleOpenScenarioAI,
      openClearDialog
    ]
  );

  const handleCloseModal = useCallback((e, modalKey) => {
    if (e) e?.stopPropagation?.();
    setOpenModal((prev) => ({ ...prev, [modalKey]: false }));
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
      fontSize: '12px',
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
      onClick={handleModalInteraction}
      onMouseDown={handleModalInteraction}
      onFocus={handleModalInteraction}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        zIndex: 1001, // Ensure it's above React Flow
        pointerEvents: 'auto' // Ensure it captures events
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
        {tabs?.map((tab) => (
          <Box
            key={tab.name}
            sx={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
            onMouseEnter={(e) => handleTabWrapperMouseEnter(e, tab.name)}
            onMouseLeave={handleMouseLeave}
            onClick={handleModalInteraction}
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
                onMouseEnter={(e) => handleDropdownMouseEnter(e, tab.name)}
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

      {/* Category Selection Dialog */}
      <Dialog
        open={categoryDialogOpen}
        onClose={handleCategoryDialogClose}
        disablePortal // Add this
      >
        <DialogTitle variant="h4" color="primary">
          Select Category
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2, minWidth: 300 }}>
            <InputLabel id="category-select-label">Category</InputLabel>
            <Select
              labelId="category-select-label"
              value={selectedCategory}
              label="Category"
              onChange={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleCategoryChange(e);
              }}
              onOpen={(e) => {
                if (e) {
                  e.stopPropagation();
                  e.preventDefault();
                }
              }}
              onClose={(e) => {
                if (e) {
                  e.stopPropagation();
                  e.preventDefault();
                }
              }}
              sx={{ mt: 1 }}
              MenuProps={{
                disablePortal: true,
                disableScrollLock: true,
                onClick: (e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  e.nativeEvent.stopImmediatePropagation();
                },
                onMouseDown: (e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  e.nativeEvent.stopImmediatePropagation();
                }
              }}
            >
              {categories?.map((category) => (
                <MenuItem
                  key={category}
                  value={category}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    e.nativeEvent.stopImmediatePropagation();
                  }}
                >
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleCategoryDialogClose();
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              confirmConvertToLibrary();
            }}
            variant="contained"
            color="primary"
          >
            Convert to Library
          </Button>
        </DialogActions>
      </Dialog>

      <VehicleTARADialog open={taraDialogOpen} onClose={() => setTaraDialogOpen(false)} />
      <TestAssetsDialog
        open={openTestAssets}
        handleClose={handleCloseTestAssets}
        modelMeta={{
          modelId: model?._id,
          systemName: model?.name
        }}
      />
      {/* Project Modals */}
      <AddModel
        getModels={getModels}
        open={openModal.New}
        handleClose={(e) => handleCloseModal(e, 'New')}
        disablePortal
        style={{ position: 'fixed' }}
      />
      <GenerateModel open={openModal.NewAI} handleClose={(e) => handleCloseModal(e, 'NewAI')} />
      <ScenarioAIModal
        open={openScenarioModal}
        handleClose={handleCloseScenarioAI}
        scenarioType={scenarioType}
        modelMeta={{
          modelId: model?._id,
          template: assets?.template,
          systemName: model?.name
        }}
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

      <LibraryModal
        open={openModal.Library}
        handleClose={(e) => handleCloseModal(e, 'Library')}
        Models={Models}
        isLoading={isLoading}
        anchorEl={anchorEl}
        disablePortal
        style={{ position: 'fixed' }}
        onLibraryAdded={handleLibraryAdded}
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
        <PromptModal
          open={openModal?.AIModal}
          handleClose={(e) => {
            e?.stopPropagation?.();
            setOpenModal((prev) => ({ ...prev, AIModal: false }));
          }}
        />
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

      <DashboardDialog
        open={openDashboard}
        onClose={() => setOpenDashboard(false)}
        modelId={model?._id}
        projectData={{
          components: model?.components || [],
          threats: model?.threats || [],
          risks: model?.risks || [],
          controls: model?.controls || []
        }}
      />
      {/* Single ConfirmDeleteDialog for all clear operations */}
      {clearConfig?.open && (
        <ConfirmDeleteDialog
          open={clearConfig.open}
          onClose={closeClearDialog}
          onConfirm={clearConfig.onConfirm}
          name={clearConfig.name}
          mode="clear"
        />
      )}
    </Box>
  );
};

export default React.memo(LeftSection);
