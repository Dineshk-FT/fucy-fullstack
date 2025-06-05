/*eslint-disable*/
import React, { useCallback, useMemo, useRef } from 'react';
import { styled } from '@mui/material/styles';
import { Box, Card, CardContent, Typography, TextField, Tooltip, IconButton } from '@mui/material';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TreeView } from '@mui/x-tree-view/TreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ControlPointIcon from '@mui/icons-material/ControlPoint';
import {
  ItemIcon,
  AttackIcon,
  DamageIcon,
  ThreatIcon,
  CybersecurityIcon,
  CatalogIcon,
  SystemIcon,
  RiskIcon,
  DocumentIcon,
  ReportIcon,
  LayoutIcon,
  ModelIcon
} from '../../../../assets/icons';
import { makeStyles } from '@mui/styles';
import { ReceiptItem } from 'iconsax-react';
import BrightnessLowIcon from '@mui/icons-material/BrightnessLow';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import FolderIcon from '@mui/icons-material/Folder';
import DriveFileMoveIcon from '@mui/icons-material/DriveFileMove';
import TopicIcon from '@mui/icons-material/Topic';
import SwipeRightAltIcon from '@mui/icons-material/SwipeRightAlt';
import DangerousIcon from '@mui/icons-material/Dangerous';
import SecurityIcon from '@mui/icons-material/Security';
import DraggableTreeItem from './DraggableItem';
import { closeAll, setAttackScene, setPreviousTab, setTableOpen } from '../../../../store/slices/CurrentIdSlice';
import { setTitle } from '../../../../store/slices/PageSectionSlice';
import { clearAnchorEl, setAnchorEl, setDetails, setEdgeDetails, setSelectedBlock } from '../../../../store/slices/CanvasSlice';
import toast from 'react-hot-toast';
import ColorTheme from '../../../../themes/ColorTheme';
import ConfirmDeleteDialog from '../../../../components/Modal/ConfirmDeleteDialog';
import { getNodeDetails } from '../../../../utils/Constraints';
import { getNavbarHeight } from '../../../../themes/constant';
import DocumentDialog from '../../../../components/DocumentDialog/DocumentDialog';
import CommonModal from '../../../../components/Modal/CommonModal';
import useStore from '../../../../store/Zustand/store';
import EditProperties from '../../../../components/Poppers/EditProperties';
import { shallow } from 'zustand/shallow';
import AttackScenarios from './Scenarios/AttackScenarios';
import ThreatScenarios from './Scenarios/ThreatScenarios';
import ItemDefinition from './Scenarios/ItemDefinition';
import PublishIcon from '@mui/icons-material/Publish';
import CybersecurityExport from '../../../../components/Poppers/CybersecurityExport';

const imageComponents = {
  AttackIcon,
  ItemIcon,
  DamageIcon,
  ThreatIcon,
  CybersecurityIcon,
  SystemIcon,
  CatalogIcon,
  RiskIcon,
  DocumentIcon,
  ReportIcon,
  LayoutIcon,
  ModelIcon
};

const iconComponents = {
  SecurityIcon,
  DriveFileMoveIcon,
  FolderIcon,
  TopicIcon,
  SwipeRightAltIcon,
  DangerousIcon,
  BrightnessLowIcon,
  CalendarMonthIcon,
  ReceiptItem
};

const useStyles = makeStyles((theme, isDark) => ({
  labelRoot: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0.5, 1), // Reduced padding for compactness
    marginLeft: '-2px',
    color: 'inherit',
    transition: 'all 0.3s ease',
    borderRadius: '6px', // Slightly smaller border radius for a modern look
    '&:hover': {
      background:
        isDark == true
          ? 'linear-gradient(90deg, rgba(100,181,246,0.15) 0%, rgba(100,181,246,0.05) 100%)'
          : 'linear-gradient(90deg, rgba(33,150,243,0.08) 0%, rgba(33,150,243,0.02) 100%)',
      transform: 'scale(1.02)', // Subtle scale on hover
      boxShadow: isDark == true ? '0 2px 6px rgba(0,0,0,0.4)' : '0 2px 6px rgba(0,0,0,0.1)',
      filter: isDark == true ? 'drop-shadow(0 0 6px rgba(100,181,246,0.25))' : 'drop-shadow(0 0 6px rgba(33,150,243,0.15))'
    },
    '&:focus': {
      // Added focus state for accessibility
      outline: `2px solid ${theme.palette.mode === 'dark' ? '#64B5F6' : '#2196F3'}`,
      outlineOffset: '2px'
    }
  },
  labelTypo: {
    fontSize: 13, // Slightly smaller font size for body text
    fontWeight: 400, // Lighter weight for better hierarchy
    fontFamily: "'Poppins', sans-serif",
    color: 'inherit',
    lineHeight: 1.5, // Improved readability
    letterSpacing: '0.2px' // Subtle letter spacing for polish
  },
  parentLabelTypo: {
    fontSize: 14, // Slightly larger for parent items
    fontWeight: 500, // Medium weight for emphasis
    fontFamily: "'Poppins', sans-serif",
    color: 'inherit',
    lineHeight: 1.5,
    letterSpacing: '0.3px'
  },
  paper: {
    background: isDark == true ? 'rgba(30,30,30,0.95)' : 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(8px)', // Reduced blur for performance
    border: 'none',
    borderRadius: '10px',
    boxShadow: isDark == true ? '0 4px 12px rgba(0,0,0,0.5)' : '0 4px 12px rgba(0,0,0,0.15)',
    transition: 'all 0.3s ease'
  },
  title: {
    display: 'flex',
    marginLeft: '-2px',
    marginTop: '3px',
    padding: '8px', // Reduced padding for compactness
    alignItems: 'center',
    borderRadius: '6px',
    transition: 'all 0.3s ease',
    '&:hover': {
      background:
        isDark == true
          ? 'linear-gradient(90deg, rgba(100,181,246,0.15) 0%, rgba(100,181,246,0.05) 100%)'
          : 'linear-gradient(90deg, rgba(33,150,243,0.08) 0%, rgba(33,150,243,0.02) 100%)',
      transform: 'scale(1.02)',
      boxShadow: isDark == true ? '0 2px 6px rgba(0,0,0,0.4)' : '0 2px 6px rgba(0,0,0,0.1)',
      filter: isDark == true ? 'drop-shadow(0 0 6px rgba(100,181,246,0.25))' : 'drop-shadow(0 0 6px rgba(33,150,243,0.15))'
    },
    '&:focus': {
      outline: `2px solid ${isDark == true ? '#64B5F6' : '#2196F3'}`,
      outlineOffset: '2px'
    }
  },
  treeItem: {
    marginLeft: -6,
    padding: '4px 0', // Reduced padding for compactness
    '& .MuiTreeItem-content': {
      padding: '2px 6px', // Adjusted padding
      transition: 'all 0.3s ease'
    },
    '&:not(:last-child)': {
      borderBottom:
        isDark == true
          ? '1px solid rgba(255,255,255,0.05)' // Softer divider
          : '1px solid rgba(0,0,0,0.05)'
    }
  },
  lossItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px', // Reduced gap for compactness
    paddingLeft: '-4px',
    transition: 'all 0.3s ease',
    borderRadius: '6px',
    '&:hover': {
      background:
        isDark == true
          ? 'linear-gradient(90deg, rgba(100,181,246,0.15) 0%, rgba(100,181,246,0.05) 100%)'
          : 'linear-gradient(90deg, rgba(33,150,243,0.08) 0%, rgba(33,150,243,0.02) 100%)',
      transform: 'scale(1.02)',
      boxShadow: isDark == true ? '0 2px 6px rgba(0,0,0,0.4)' : '0 2px 6px rgba(0,0,0,0.1)',
      filter: isDark == true ? 'drop-shadow(0 0 6px rgba(100,181,246,0.25))' : 'drop-shadow(0 0 6px rgba(33,150,243,0.15))'
    },
    '&:focus': {
      outline: `2px solid ${isDark == true ? '#64B5F6' : '#2196F3'}`,
      outlineOffset: '2px'
    }
  },
  template: {
    marginRight: '2vw',
    // paddingLeft: '12px',
    transition: 'all 0.3s ease',
    borderRadius: '6px',
    '&:hover': {
      background:
        isDark == true
          ? 'linear-gradient(90deg, rgba(100,181,246,0.15) 0%, rgba(100,181,246,0.05) 100%)'
          : 'linear-gradient(90deg, rgba(33,150,243,0.08) 0%, rgba(33,150,243,0.02) 100%)',
      transform: 'scale(1.02)',
      boxShadow: isDark == true ? '0 2px 6px rgba(0,0,0,0.4)' : '0 2px 6px rgba(0,0,0,0.1)',
      filter: isDark == true ? 'drop-shadow(0 0 6px rgba(100,181,246,0.25))' : 'drop-shadow(0 0 6px rgba(33,150,243,0.15))'
    },
    '&:focus': {
      outline: `2px solid ${isDark == true ? '#64B5F6' : '#2196F3'}`,
      outlineOffset: '2px'
    }
  }
}));

const CardStyle = styled(Card, {
  shouldForwardProp: (prop) => prop !== '$iscollapsed' && prop !== '$isnavbarclose' && prop !== 'isDark'
})(({ theme, $iscollapsed, $isnavbarclose, isDark }) => ({
  marginBottom: '16px',
  overflow: 'hidden',
  position: 'relative',
  height: $isnavbarclose ? '100vh' : `calc(95vh - ${getNavbarHeight($iscollapsed)}px)`,
  border: 'none',
  borderRadius: '12px',
  background: isDark
    ? 'linear-gradient(145deg, rgba(30,30,30,0.9) 0%, rgba(20,20,20,0.85) 100%)'
    : 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(245,245,245,0.9) 100%)',
  backdropFilter: 'blur(12px)',
  boxShadow: isDark ? '0 6px 20px rgba(0,0,0,0.5)' : '0 6px 20px rgba(0,0,0,0.15)',
  [theme.breakpoints.down('sm')]: {
    marginBottom: '8px'
  },
  [theme.breakpoints.down('xs')]: {
    marginBottom: '4px'
  }
}));

const notify = (message, status) => toast[status](message);

const selector = (state) => ({
  getModels: state.getModels,
  getModelById: state.getModelById,
  nodes: state.nodes,
  edges: state.edges,
  model: state.model,
  assets: state.assets,
  damageScenarios: state.damageScenarios,
  threatScenarios: state.threatScenarios,
  getAssets: state.getAssets,
  getThreatScenario: state.getThreatScenario,
  getDamageScenarios: state.getDamageScenarios,
  getAttackScenario: state.getAttackScenario,
  attackScenarios: state.attackScenarios,
  attacktrees: state.attackScenarios['subs'][1]['scenes'] ?? [],
  getRiskTreatment: state.getRiskTreatment,
  getCyberSecurityScenario: state.getCyberSecurityScenario,
  cybersecurity: state.cybersecurity,
  subSystems: state.subSystems,
  catalog: state.catalog,
  riskTreatment: state.riskTreatment,
  documents: state.documents,
  reports: state.reports,
  layouts: state.layouts,
  clickedItem: state.clickedItem,
  setClickedItem: state.setClickedItem,
  update: state.updateAssets,
  updateModelName: state.updateModelName,
  setNodes: state.setNodes,
  setEdges: state.setEdges,
  getCatalog: state.getCatalog,
  getGlobalAttackTrees: state.getGlobalAttackTrees,
  deleteAttacks: state.deleteAttacks,
  setIsNodePasted: state.setIsNodePasted,
  setSelectedThreatIds: state.setSelectedThreatIds,
  isChanged: state.isChanged,
  setIsChanged: state.setIsChanged,
  isAttackChanged: state.isAttackChanged,
  setOpenSave: state.setOpenSave
});

// ==============================|| SIDEBAR MENU Card ||============================== //

const BrowserCard = ({ isCollapsed, isNavbarClose }) => {
  const color = ColorTheme();
  const classes = useStyles();
  const dispatch = useDispatch();
  const {
    getModels,
    nodes,
    edges,
    model,
    getModelById,
    assets,
    damageScenarios,
    threatScenarios,
    getAssets,
    getDamageScenarios,
    getThreatScenario,
    getAttackScenario,
    getRiskTreatment,
    getCyberSecurityScenario,
    attackScenarios,
    attacktrees,
    cybersecurity,
    subSystems,
    catalog,
    riskTreatment,
    documents,
    reports,
    layouts,
    clickedItem,
    setClickedItem,
    updateModelName,
    update,
    setNodes,
    setEdges,
    getCatalog,
    isDark,
    getGlobalAttackTrees,
    deleteAttacks,
    setIsNodePasted,
    setSelectedThreatIds,
    isChanged,
    isAttackChanged,
    setIsChanged,
    setOpenSave
  } = useStore(selector, shallow);
  const { modelId } = useSelector((state) => state?.pageName);
  const [count, setCount] = useState({
    node: 1,
    data: 1
  });
  const drawerWidth = 370;
  const { selectedBlock, drawerwidthChange, anchorEl, details } = useSelector((state) => state?.canvas);
  const { attackScene, previousTab } = useSelector((state) => state?.currentId);
  const [openModal, setOpenModal] = useState({
    attack: false,
    delete: false
  });
  const [subName, setSubName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentName, setCurrentName] = useState('');
  const [openDocumentDialog, setOpenDocumentDialog] = useState(false);
  const [hovered, setHovered] = useState({
    node: false,
    data: false,
    attack: false,
    attack_rees: false,
    id: ''
  });
  const anchorElId = document.querySelector(`[data="${anchorEl?.sidebar}"]`) || null;
  const [exportAnchor, setExportAnchor] = useState(null);
  const [deleteScene, setDeleteScene] = useState({
    type: '',
    id: ''
  });

  const handleopenCybersecurityExport = (e) => {
    e.stopPropagation();
    setExportAnchor(e.currentTarget);
  };
  const handleCloseExport = (e) => {
    e.stopPropagation();
    setExportAnchor(null);
  };
  const handleExport = (e) => {
    e.stopPropagation();
  };
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      updateModelName({ 'model-id': model?._id, name: currentName }).then((res) => {
        if (res) {
          getModels();
        }
      });
    }
  };

  const handleOpenDeleteModal = (type, scene) => {
    setDeleteScene({
      type: type,
      id: scene?.ID
    });
    setOpenModal((state) => ({ ...state, delete: true }));
  };

  const handleCloseDeleteModal = () => {
    setOpenModal((state) => ({ ...state, delete: false }));
    setDeleteScene({
      type: '',
      id: ''
    });
  };
  // console.log('deleteScene', deleteScene);
  // // console.log('attackScenarios', attackScenarios);
  // console.log('attacktrees', attacktrees);
  const handleDeleteAttack = () => {
    const details = {
      'model-id': model?._id,
      ...deleteScene
    };

    deleteAttacks(details)
      .then((res) => {
        if (!res.error) {
          notify(res?.message ?? 'Deleted Successfully', 'success');
          getAttackScenario(model?._id);
          handleCloseDeleteModal();
          if (deleteScene.type === 'attack_trees' && Array.isArray(attacktrees)) {
            const index = attacktrees.findIndex((tree) => tree.ID === deleteScene.id);
            if (index === -1) {
              dispatch(setAttackScene({}));
              return;
            }
            const nextTree = attacktrees[index + 1] || attacktrees[index - 1];
            if (nextTree) {
              dispatch(setAttackScene(nextTree));
            } else {
              dispatch(setTableOpen('Attack'));
              dispatch(setAttackScene({}));
            }
          }
        } else {
          notify(res?.error ?? 'Something went wrong', 'error');
        }
      })
      .catch((err) => {
        console.log('err', err);
        notify('Something went wrong', 'error');
      });
  };

  useEffect(() => {
    getModelById(modelId);
    getAssets(modelId);
    getAttackScenario(modelId);
    getDamageScenarios(modelId);
    getRiskTreatment(modelId);
    getThreatScenario(modelId);
    getCyberSecurityScenario(modelId);
    getCatalog(modelId);
    setClickedItem(modelId);
    getGlobalAttackTrees(modelId);
  }, [modelId]);

  useEffect(() => {
    setCurrentName(model?.name);
  }, [model]);

  const scenarios = [
    // { name: 'sub-systems', scene: subSystems },
    { name: 'assets', scene: assets },
    { name: 'damageScenarios', scene: damageScenarios },
    { name: 'threatScenarios', scene: threatScenarios },
    { name: 'attackScenarios', scene: attackScenarios },
    { name: 'cybersecurity', scene: cybersecurity },
    { name: 'catalog', scene: catalog },
    { name: 'riskTreatment', scene: riskTreatment },
    { name: 'documents', scene: documents },
    { name: 'reports', scene: reports },
    { name: 'layouts', scene: layouts }
  ];

  const handleTitleClick = (event) => {
    event.stopPropagation();
    setClickedItem(modelId);
  };

  const handleClick = async (event, ModelId, name, id) => {
    event.stopPropagation();
    setClickedItem(id);

    if (name === 'assets') {
      dispatch(setPreviousTab(name));
      dispatch(closeAll());

      if (isChanged) {
        return; // Don't call getAssets if there are unsaved changes
      }
    }

    const get_api = {
      assets: getAssets,
      damage: getDamageScenarios,
      threat: getThreatScenario,
      attack: getAttackScenario,
      risks: getRiskTreatment,
      cybersecurity: getCyberSecurityScenario,
      catalog: getCatalog
    };

    await get_api[name](ModelId);
  };

  // console.log('attackScene in sidebar', attackScene);

  const handleOpenTable = useCallback(
    (e, id, name) => {
      e.stopPropagation();
      dispatch(setAttackScene({}));
      if (isChanged || isAttackChanged) {
        setOpenSave(true);
        return;
      }
      setClickedItem(id);
      if (name !== 'Attack Trees' && !name.includes('UNICE') && name !== 'Vulnerability Analysis') {
        dispatch(setTableOpen(name));
        dispatch(setTitle(name));
      }
      dispatch(setPreviousTab(name));
    },
    [isChanged, isAttackChanged]
  );
  const handleTreeItemClick = useCallback((e, handler, ...args) => {
    const isExpandIcon = e.target.closest('.MuiTreeItem-iconContainer') !== null;
    if (isExpandIcon) {
      e.stopPropagation();
      return;
    }
    handler?.(e, ...args);
  }, []);

  // handle the attack template comparision & pre-save before switching the attack tree
  const handleOpenAttackTree = (e, scene, name) => {
    e.stopPropagation();
    if (isChanged || isAttackChanged) {
      setOpenSave(true);
      return;
    }
    if (name === 'Attack Trees') {
      dispatch(setAttackScene(scene));
      dispatch(setTableOpen('Attack Trees Canvas'));
    }
  };

  const handleNodes = (e) => {
    e.preventDefault();
  };

  const RefreshAPI = () => {
    getAssets(model?._id).catch((err) => {
      notify('Failed to fetch assets: ' + err.message, 'error');
    });
    getDamageScenarios(model?._id).catch((err) => {
      notify('Failed to fetch damage scenarios: ' + err.message, 'error');
    });
  };
  const handleContext = (e, name) => {
    e.preventDefault();
    if (name === 'Attack' || name === 'Attack Trees') {
      setOpenModal((state) => ({ ...state, attack: true }));
      setSubName(name);
    }
  };

  const handleAttackTreeClose = () => {
    setOpenModal((state) => ({ ...state, attack: false }));
  };

  const onDragStart = (event, item) => {
    const parseFile = JSON.stringify(item);
    event.dataTransfer.setData('application/cyber', parseFile);
    event.dataTransfer.setData('application/dragItem', parseFile);
    event.dataTransfer.effectAllowed = 'move';
  };

  const getTitleLabel = (icon, name, id) => {
    const Image = imageComponents[icon];
    return (
      <Tooltip title={name} disableHoverListener={drawerwidthChange >= drawerWidth}>
        <Box
          color={color?.sidebarContent}
          className={classes.title}
          sx={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: 'fit-content',
            display: 'flex',
            alignItems: 'center',
            background:
              clickedItem === id
                ? isDark == true
                  ? 'linear-gradient(90deg, rgba(100,181,246,0.25) 0%, rgba(100,181,246,0.08) 100%)'
                  : 'linear-gradient(90deg, rgba(33,150,243,0.15) 0%, rgba(33,150,243,0.03) 100%)'
                : 'transparent',
            boxShadow: clickedItem === id ? (isDark == true ? '0 3px 8px rgba(0,0,0,0.5)' : '0 3px 8px rgba(0,0,0,0.1)') : 'none'
          }}
          tabIndex={0} // Added for keyboard navigation
          onKeyDown={(e) => e.key === 'Enter' && handleTitleClick(e)}
        >
          {Image && <img src={Image} alt={name} style={{ height: '20px', width: '20px', filter: isDark == true ? 'invert(1)' : 'none' }} />}
          <Typography
            variant="body2"
            ml={1.25}
            className={classes.labelTypo}
            color="inherit"
            fontSize={'18px !important'} // Slightly larger for emphasis
            fontWeight={600}
            noWrap
            sx={{ letterSpacing: '0.5px' }}
          >
            {name}
          </Typography>
        </Box>
      </Tooltip>
    );
  };

  const getImageLabel = (icon, name, id, imported = false) => {
    // console.log('name', name);
    const Image = imageComponents[icon];
    return (
      <Tooltip title={name} disableHoverListener={drawerwidthChange >= drawerWidth}>
        <div
          className={classes.labelRoot}
          style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: 'fit-content',
            display: 'flex',
            alignItems: 'center',
            background:
              clickedItem === id
                ? isDark == true
                  ? 'linear-gradient(90deg, rgba(100,181,246,0.25) 0%, rgba(100,181,246,0.08) 100%)'
                  : 'linear-gradient(90deg, rgba(33,150,243,0.15) 0%, rgba(33,150,243,0.03) 100%)'
                : 'transparent',
            boxShadow: clickedItem === id ? (isDark == true ? '0 3px 8px rgba(0,0,0,0.5)' : '0 3px 8px rgba(0,0,0,0.1)') : 'none'
          }}
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleClick(e, model?._id, name.toLowerCase(), id)}
          onContextMenu={(e) => imported && (e.stopPropagation(), e.preventDefault(), handleopenCybersecurityExport(e))}
        >
          {Image && <img src={Image} alt={name} style={{ height: '20px', width: '20px', filter: isDark == true ? 'invert(1)' : 'none' }} />}
          <Typography variant="body2" ml={1} className={classes.parentLabelTypo} noWrap>
            {name}
          </Typography>
          {imported && (
            <Box ml="auto" display="flex" marginLeft={2}>
              <IconButton
                size="small"
                sx={{
                  '& .MuiSvgIcon-root': {
                    width: '0.8em'
                  }
                }}
                onClick={(e) => {
                  e.stopPropagation(); /* handle import */
                  handleopenCybersecurityExport(e);
                }}
              >
                <PublishIcon fontSize="small" color={isDark ? 'primary' : 'secondary'} />
              </IconButton>
            </Box>
          )}
        </div>
      </Tooltip>
    );
  };

  const getLabel = (icon, name, index, id, ids, onClick) => {
    // console.log('onClick', onClick);
    const IconComponent = iconComponents[icon];
    return (
      <Tooltip title={name} disableHoverListener={drawerwidthChange >= drawerWidth}>
        <div>
          <div
            className={classes.labelRoot}
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: 'fit-content',
              display: 'flex',
              alignItems: 'center',
              background:
                clickedItem === id
                  ? isDark == true
                    ? 'linear-gradient(90deg, rgba(100,181,246,0.25) 0%, rgba(100,181,246,0.08) 100%)'
                    : 'linear-gradient(90deg, rgba(33,150,243,0.15) 0%, rgba(33,150,243,0.03) 100%)'
                  : 'transparent',
              boxShadow: clickedItem === id ? (isDark == true ? '0 3px 8px rgba(0,0,0,0.5)' : '0 3px 8px rgba(0,0,0,0.1)') : 'none'
            }}
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleOpenTable(e, id, name)}
            onClick={(e) => onClick && onClick(e)}
          >
            {IconComponent && <IconComponent color={isDark == true ? '#64B5F6' : '#2196F3'} sx={{ fontSize: 18, opacity: 0.9 }} />}
            <Typography variant="body2" ml={1} className={classes.labelTypo} noWrap>
              {index && `${index}. `}
              {name}
              {ids && ids?.length > 0 && ` [${ids?.length}]`}
            </Typography>
          </div>
        </div>
      </Tooltip>
    );
  };

  const handlePropertiesTab = (detail, type) => {
    const selected = type === 'edge' ? edges.find((edge) => edge.id === detail?.nodeId) : nodes.find((node) => node.id === detail?.nodeId);
    const { isAsset = false, properties, id, data } = selected;
    dispatch(setSelectedBlock({ id, data }));
    dispatch(setAnchorEl({ type: 'sidebar', value: id }));
    dispatch(
      setDetails({
        name: data?.label ?? '',
        properties: properties ?? [],
        isAsset: isAsset ?? false
      })
    );
  };

  const handleAddNode = (type) => (e) => {
    e.stopPropagation();
    setIsChanged(true);
    const nodeName = type === 'default' ? 'Node' : 'Data';
    const nodeType = type === 'data' ? 'data' : 'node';

    const nodeDetail = getNodeDetails(type, nodeName, count[nodeType]);
    setNodes([...nodes, nodeDetail]);
    setCount((prev) => ({ ...prev, [nodeType]: prev[nodeType] + 1 }));
  };

  const handleClosePopper = () => {
    dispatch(clearAnchorEl());
  };
  const handleSave = () => {
    const template = {
      nodes: nodes,
      edges: edges
    };
    nodes.forEach((node) => {
      if (node.isCopied == true) {
        node.isCopied = false;
      }
    });
    setIsNodePasted(false);
    const details = {
      'model-id': model?._id,
      template: JSON.stringify(template),
      assetId: assets?._id
    };

    update(details)
      .then((res) => {
        // console.log('res', res);
        if (!res.error) {
          notify('Saved Successfully', 'success');
          handleClosePopper();
          RefreshAPI();
        } else {
          notify(res.error ?? 'Something went wrong', 'error');
        }
      })
      .catch((err) => {
        notify('Something went wrong', 'error');
      });
  };

  const renderTreeItem = (data, onClick, contextMenuHandler, children) => {
    return (
      <TreeItem
        key={data.id}
        nodeId={data.id}
        label={getImageLabel(data.icon, data.name, data.id, data.name === 'Goals, Claims and Requirements')}
        onClick={onClick}
        onContextMenu={contextMenuHandler}
        className={classes.treeItem}
      >
        {children}
      </TreeItem>
    );
  };

  const renderSubItems = (subs, handleOpenTable, contextMenuHandler, additionalMapping, imported = false) => {
    return subs?.map((sub) => {
      return sub.name === 'Attack' || sub.name === 'Attack Trees' ? (
        <TreeItem
          key={sub.id}
          nodeId={sub.id}
          label={
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              onMouseEnter={() => setHovered((state) => ({ ...state, [sub.type]: true }))}
              onMouseLeave={() => setHovered((state) => ({ ...state, [sub.type]: false }))}
            >
              <Box>{getLabel('TopicIcon', sub.name, null, sub.id, null, null, imported)}</Box>
              {hovered[sub.type] && (
                <Box
                  onClick={(e) => {
                    e.stopPropagation();
                    contextMenuHandler(e, sub.name);
                  }}
                >
                  <ControlPointIcon color="primary" sx={{ fontSize: 19 }} />
                </Box>
              )}
            </Box>
          }
          onClick={(e) => {
            setClickedItem(sub.id);
            handleTreeItemClick(e, handleOpenTable, sub.id, sub.name);
          }}
        >
          {additionalMapping && additionalMapping(sub)}
        </TreeItem>
      ) : (
        <TreeItem
          key={sub.id}
          nodeId={sub.id}
          label={
            <Box display="flex" alignItems="center">
              {getLabel('TopicIcon', sub.name, null, sub.id, null, null, imported)}
            </Box>
          }
          onClick={(e) => {
            setClickedItem(sub.id);
            handleTreeItemClick(e, handleOpenTable, sub.id, sub.name);
          }}
          onContextMenu={(e) => handleTreeItemClick(e, contextMenuHandler, sub.name)}
        >
          {additionalMapping && additionalMapping(sub)}
        </TreeItem>
      );
    });
  };

  const renderTreeItems = (data, type) => {
    if (!data) return null;

    switch (type) {
      case 'assets':
        return (
          <span id="item-definition">
            <ItemDefinition
              data={data}
              hovered={hovered}
              setHovered={setHovered}
              handleAddNode={handleAddNode}
              handlePropertiesTab={handlePropertiesTab}
              handleClick={handleClick}
              handleNodes={handleNodes}
              getLabel={getLabel}
              setClickedItem={setClickedItem}
              onDragStart={onDragStart}
              drawerwidthChange={drawerwidthChange}
              drawerWidth={drawerWidth}
              selectedBlock={selectedBlock}
              model={model}
              classes={classes}
              nodes={nodes}
              edges={edges}
              handleSave={handleSave}
              renderTreeItem={renderTreeItem}
            />
          </span>
        );

      case 'damageScenarios':
        return (
          <span id="damage-scene">
            {renderTreeItem(
              data,
              (e) => handleClick(e, model?._id, 'damage', data.id),
              null,
              renderSubItems(data.subs, handleOpenTable, null, (sub) => {
                if (sub.name === 'Damage Scenarios (DS) Derivations') {
                  return sub.Derivations?.map((derivation, i) => (
                    <TreeItem
                      onClick={(e) => e.stopPropagation()}
                      key={derivation?.id}
                      nodeId={derivation.id}
                      label={getLabel('TopicIcon', derivation.name, i + 1, derivation.id)}
                    />
                  ));
                }
                if (sub.name === 'Damage Scenarios - Impact Ratings') {
                  return sub.Details?.map((detail, i) => (
                    <TreeItem
                      onClick={(e) => e.stopPropagation()}
                      key={detail?._id}
                      nodeId={detail._id}
                      label={getLabel('DangerousIcon', detail.Name, i + 1, detail._id)}
                    />
                  ));
                }
              })
            )}
          </span>
        );

      case 'threatScenarios': {
        return (
          <span id="threat-scene">
            {renderTreeItem(
              data,
              (e) => handleClick(e, model?._id, 'threat', data.id),
              null,
              renderSubItems(data?.subs, handleOpenTable, null, (sub) => {
                return sub.Details?.flatMap((detail, i) => {
                  return (
                    <ThreatScenarios
                      key={detail?.id}
                      sub={sub}
                      detail={detail}
                      i={i}
                      setSelectedThreatIds={setSelectedThreatIds}
                      onDragStart={onDragStart}
                      getLabel={getLabel}
                    />
                  );
                });
              })
            )}
          </span>
        );
      }

      case 'attackScenarios':
        return (
          <span id="attack-scene">
            {renderTreeItem(
              data,
              (e) => handleClick(e, model?._id, 'attack', data.id),
              null,
              renderSubItems(data.subs, handleOpenTable, handleContext, (sub) =>
                sub.scenes?.map((at_scene, i) => {
                  return (
                    <AttackScenarios
                      key={at_scene?.ID}
                      sub={sub}
                      at_scene={at_scene}
                      i={i}
                      hovered={hovered}
                      setHovered={setHovered}
                      handleOpenDeleteModal={handleOpenDeleteModal}
                      onDragStart={onDragStart}
                      handleOpenAttackTree={handleOpenAttackTree}
                      getLabel={getLabel}
                    />
                  );
                })
              )
            )}
          </span>
        );
      case 'riskTreatment':
        return (
          <span id="risk-treatment">
            {renderTreeItem(
              data,
              (e) => handleClick(e, model?._id, 'risks', data.id),
              null,
              renderSubItems(data.subs, handleOpenTable, null, (sub) => {
                return sub.Derivations?.map((derivation) => (
                  <TreeItem
                    onClick={(e) => e.stopPropagation()}
                    key={derivation?.id}
                    nodeId={derivation.id}
                    label={getLabel('TopicIcon', derivation.name, null, derivation.id)}
                  />
                ));
              })
            )}
          </span>
        );
      case 'cybersecurity':
        return (
          <span id="cybersecurity">
            {renderTreeItem(
              data,
              (e) => handleClick(e, model?._id, 'cybersecurity', data.id),
              (e) => {
                e.stopPropagation();
                e.preventDefault();
                handleopenCybersecurityExport(e);
              },
              renderSubItems(
                data.subs,
                handleOpenTable,
                null,
                (sub) => {
                  return sub.scenes?.map((scene, i) => (
                    <TreeItem
                      onClick={(e) => e.stopPropagation()}
                      key={scene.ID}
                      nodeId={scene.ID}
                      label={getLabel('TopicIcon', scene.Name, i + 1, scene.ID)}
                    />
                  ));
                },
                true
              )
            )}
          </span>
        );

      case 'catalog':
        return (
          <span id="catalog">
            {renderTreeItem(
              data,
              (e) => handleClick(e, model?._id, 'catalog', data.id),
              null,
              renderSubItems(data.subs, handleOpenTable, null, (sub) => {
                return sub?.subs_scenes?.map((scene) => (
                  <TreeItem
                    key={scene.id}
                    nodeId={scene?.id}
                    label={getLabel('TopicIcon', scene.name, null, scene.id)}
                    onClick={(e) => handleOpenTable(e, scene.id, scene.name)}
                  >
                    {scene.item_name?.map((subScene) => (
                      <DraggableTreeItem
                        key={subScene.id}
                        nodeId={subScene.id}
                        label={getLabel('TopicIcon', subScene.name, null, subScene.id)}
                        draggable={true}
                        onClick={(e) => e.stopPropagation()}
                        onDragStart={(e) => onDragStart(e, subScene)}
                      />
                    ))}
                  </TreeItem>
                ));
              })
            )}
          </span>
        );

      case 'documents':
        return (
          <span id="reporting">
            {renderTreeItem(
              data,
              (e) => {
                e.stopPropagation();
                setOpenDocumentDialog(true);
              },
              null,
              null
            )}
          </span>
        );
      // case 'sub-systems':
      //   return renderTreeItem(
      //     data,
      //     (e) => {
      //       e.stopPropagation();
      //     },
      //     null,
      //     null
      //   );
      default:
        return renderTreeItem(
          data,
          (e) => handleClick(e, model?._id, data.name, data.id),
          null,
          renderSubItems(data.subs, handleOpenTable, null, (sub) =>
            sub.Details?.map((detail) => (
              <TreeItem
                onClick={(e) => e.stopPropagation()}
                key={detail._id}
                nodeId={detail._id}
                label={getLabel('DangerousIcon', detail.name, null, detail._id)}
              />
            ))
          )
        );
    }
  };

  return (
    <>
      {openDocumentDialog && <DocumentDialog open={openDocumentDialog} onClose={() => setOpenDocumentDialog(false)} />}

      <CardStyle
        $iscollapsed={isCollapsed}
        $isnavbarclose={isNavbarClose}
        sx={{
          background: color.tabBorder,
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '5px' // Thinner scrollbar
          },
          '&::-webkit-scrollbar-thumb': {
            background:
              isDark == true
                ? 'linear-gradient(90deg, rgba(100,181,246,0.3) 0%, rgba(100,181,246,0.1) 100%)'
                : 'linear-gradient(90deg, rgba(33,150,243,0.2) 0%, rgba(33,150,243,0.05) 100%)',
            borderRadius: '3px'
          }
        }}
      >
        <CardContent
          sx={{
            p: 2,
            color: color?.sidebarContent,
            height: '100%',
            overflowY: 'auto !important',
            scrollbarWidth: 'thin',
            '&::-webkit-scrollbar': {
              width: '5px' // Thinner scrollbar
            }
          }}
        >
          <TreeView
            aria-label="file system navigator"
            expanded={clickedItem}
            onClick={handleTitleClick}
            defaultCollapseIcon={
              <ExpandMoreIcon sx={{ color: isDark == true ? '#64B5F6' : '#2196F3', fontSize: 22, transition: 'transform 0.3s ease' }} />
            }
            defaultExpandIcon={
              <ChevronRightIcon sx={{ color: isDark == true ? '#64B5F6' : '#2196F3', fontSize: 22, transition: 'transform 0.3s ease' }} />
            }
            sx={{ height: '100%' }}
          >
            <TreeItem
              key={model?._id}
              nodeId={model?._id ?? 'model1'}
              label={
                isEditing ? (
                  <TextField
                    value={currentName}
                    onChange={(e) => setCurrentName(e.target.value)}
                    onBlur={() => setIsEditing(false)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    variant="outlined"
                    size="small"
                    sx={{
                      my: 0.5,
                      '& .MuiOutlinedInput-root': {
                        fontSize: '16px',
                        fontFamily: "'Poppins', sans-serif",
                        color: color?.sidebarContent,
                        background: isDark == true ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                        borderRadius: '8px'
                      },
                      '& .MuiInputBase-input': { padding: '5px 10px' },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: isDark == true ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'
                      }
                    }}
                  />
                ) : (
                  <Box onDoubleClick={() => setIsEditing(true)}>{getTitleLabel('ModelIcon', currentName, model?._id)}</Box>
                )
              }
              sx={{ '& .Mui-selected': { backgroundColor: 'transparent !important' } }}
            >
              {scenarios?.map(({ name, scene }) => renderTreeItems(scene, name))}
            </TreeItem>
          </TreeView>
        </CardContent>
      </CardStyle>
      {openModal?.attack && <CommonModal open={openModal?.attack} handleClose={handleAttackTreeClose} name={subName} />}
      {anchorElId && (
        <EditProperties
          anchorEl={anchorElId}
          handleSaveEdit={handleSave}
          handleClosePopper={handleClosePopper}
          setDetails={setDetails}
          details={details}
          dispatch={dispatch}
          setNodes={setNodes}
          setEdges={setEdges}
        />
      )}
      {openModal?.delete && (
        <ConfirmDeleteDialog
          open={openModal?.delete}
          onClose={handleCloseDeleteModal}
          onConfirm={handleDeleteAttack}
          type={deleteScene?.type}
        />
      )}
      {exportAnchor && <CybersecurityExport anchorEl={exportAnchor} handleClosePopper={handleCloseExport} onExport={handleExport} />}
    </>
  );
};

export default BrowserCard;
