/*eslint-disable*/
import React, { useMemo, useRef } from 'react';
import { styled } from '@mui/material/styles';
import { Box, Card, CardContent, ClickAwayListener, MenuItem, Paper, Popper, Typography, TextField, Tooltip } from '@mui/material';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TreeView } from '@mui/x-tree-view/TreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ControlPointIcon from '@mui/icons-material/ControlPoint';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
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
  ModelIcon,
  ConfidentialityIcon,
  IntegrityIcon,
  AuthenticityIcon,
  AuthorizationIcon,
  Non_repudiationIcon,
  AvailabilityIcon
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
import { Avatar, AvatarGroup } from '@mui/material';
import ColorTheme from '../../../../themes/ColorTheme';
import ConfirmDeleteDialog from '../../../../components/Modal/ConfirmDeleteDialog';
import { getNodeDetails } from '../../../../utils/Constraints';
import { getNavbarHeight } from '../../../../themes/constant';
import DocumentDialog from '../../../../components/DocumentDialog/DocumentDialog';
import CommonModal from '../../../../components/Modal/CommonModal';
import { threatType } from '../../../../components/Table/constraints';
import useStore from '../../../../store/Zustand/store';
import RenderedTreeItems from './RenderedTreeItems';
import EditName from './EditName';
import EditProperties from '../../../../components/Poppers/EditProperties';

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

const CardStyle = styled(Card)(({ theme, isCollapsed, isNavbarClose, isDark }) => ({
  marginBottom: '16px', // Reduced margin for a tighter layout
  overflow: 'hidden',
  position: 'relative',
  height: isNavbarClose ? '100vh' : `calc(95vh - ${getNavbarHeight(isCollapsed)}px)`,
  border: 'none',
  borderRadius: '12px', // Slightly smaller border radius
  background:
    isDark == true
      ? 'linear-gradient(145deg, rgba(30,30,30,0.9) 0%, rgba(20,20,20,0.85) 100%)'
      : 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(245,245,245,0.9) 100%)',
  backdropFilter: 'blur(12px)', // Reduced blur for performance
  boxShadow: isDark == true ? '0 6px 20px rgba(0,0,0,0.5)' : '0 6px 20px rgba(0,0,0,0.15)',
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
  attackNodes: state.attackNodes,
  attackEdges: state.attackEdges,
  initialAttackNodes: state.initialAttackNodes,
  initialAttackEdges: state.initialAttackEdges,
  model: state.model,
  assets: state.assets,
  damageScenarios: state.damageScenarios,
  threatScenarios: state.threatScenarios,
  getAssets: state.getAssets,
  getThreatScenario: state.getThreatScenario,
  getDamageScenarios: state.getDamageScenarios,
  getAttackScenario: state.getAttackScenario,
  attackScenarios: state.attackScenarios,
  getRiskTreatment: state.getRiskTreatment,
  getCyberSecurityScenario: state.getCyberSecurityScenario,
  cybersecurity: state.cybersecurity,
  systemDesign: state.systemDesign,
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
  updateAttack: state.updateAttackScenario,
  getGlobalAttackTrees: state.getGlobalAttackTrees,
  deleteAttacks: state.deleteAttacks,
  setIsNodePasted: state.setIsNodePasted
});

const Properties = {
  Confidentiality: ConfidentialityIcon,
  Integrity: IntegrityIcon,
  Authenticity: AuthenticityIcon,
  Authorization: AuthorizationIcon,
  'Non-repudiation': Non_repudiationIcon,
  Availability: AvailabilityIcon
};

// ==============================|| SIDEBAR MENU Card ||============================== //

const BrowserCard = ({ isCollapsed, isNavbarClose }) => {
  const color = ColorTheme();
  const classes = useStyles();
  const dispatch = useDispatch();
  const {
    getModels,
    nodes,
    edges,
    attackNodes,
    attackEdges,
    initialAttackNodes,
    initialAttackEdges,
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
    cybersecurity,
    systemDesign,
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
    updateAttack,
    isDark,
    getGlobalAttackTrees,
    deleteAttacks,
    setIsNodePasted
  } = useStore(selector);
  const { modelId } = useSelector((state) => state?.pageName);
  const [count, setCount] = useState({
    node: 1,
    data: 1
  });
  const drawerwidth = 370;
  const { selectedBlock, drawerwidthChange, anchorEl, details } = useSelector((state) => state?.canvas);
  const { attackScene } = useSelector((state) => state?.currentId);
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

  const [deleteScene, setDeleteScene] = useState({
    type: '',
    id: ''
  });

  // console.log('assets', assets);

  const handleOpenDocumentDialog = () => {
    setOpenDocumentDialog(true);
  };

  const handleCloseDocumentDialog = () => {
    setOpenDocumentDialog(false);
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    setCurrentName(e.target.value);
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

  const handleAddNewNode = (e) => {
    e.stopPropagation();
    const nodeDetail = getNodeDetails('default', 'Node', count.node);
    const list = [...nodes, nodeDetail];
    setNodes(list);
    setCount((prev) => ({ ...prev, node: prev.node + 1 }));
    // dispatch(openAddNodeTab());
  };

  const handleAddDataNode = (e) => {
    e.stopPropagation();
    const nodeDetail = getNodeDetails('data', 'Data', count.data);
    const list = [...nodes, nodeDetail];
    setNodes(list);
    setCount((prev) => ({ ...prev, data: prev.data + 1 }));
    // dispatch(openAddDataNodeTab());
  };

  const handleClick = async (event, ModelId, name, id) => {
    event.stopPropagation();
    setClickedItem(id);
    if (name === 'assets') {
      dispatch(setPreviousTab(name));
      dispatch(closeAll());
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

  const handleOpenTable = (e, id, name) => {
    e.stopPropagation();
    setClickedItem(id);
    if (name !== 'Attack Trees' && !name.includes('UNICE') && name !== 'Vulnerability Analysis') {
      dispatch(setTableOpen(name));
      dispatch(setTitle(name));
    }
    dispatch(setPreviousTab(name));
  };

  // handle the attack template comparision & pre-save before switching the attack tree
  const handleOpenAttackTree = (e, scene, name) => {
    e.stopPropagation();
    const prevSceneId = attackScene?.ID;
    if (name === 'Attack Trees') {
      if (
        JSON.stringify(attackNodes) !== JSON.stringify(initialAttackNodes) ||
        JSON.stringify(attackEdges) !== JSON.stringify(initialAttackEdges)
      ) {
        const template = {
          nodes: attackNodes,
          edges: attackEdges
        };
        const threatNode = attackNodes?.find((node) => node?.type === 'default' && node?.threatId) ?? {};
        const { threatId = '', damageId = '', key = '' } = threatNode;
        const details = {
          modelId: model?._id,
          type: 'attack_trees',
          id: prevSceneId,
          templates: JSON.stringify(template),
          threatId: threatId ?? '',
          damageId: damageId ?? '',
          key: key ?? ''
        };

        updateAttack(details)
          .then((res) => {
            if (!res.error) {
              // console.log('res', res);
              notify('Saved Successfully', 'success');
              getAttackScenario(model?._id);
              getCyberSecurityScenario(model?._id);
              setTimeout(() => {
                dispatch(setAttackScene(scene));
              }, 300);
            } else {
              notify(res?.error ?? 'Something Went Wrong', 'error');
            }
          })
          .catch((err) => {
            if (err) {
              notify('Something Went Wrong', 'error');
            }
          });

        // handleSave(prevSceneId);
      } else {
        dispatch(setAttackScene(scene));
      }
      // console.log('later');
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
      <Tooltip title={name} disableHoverListener={drawerwidthChange >= drawerwidth}>
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

  const getImageLabel = (icon, name, id) => {
    const Image = imageComponents[icon];
    return (
      <Tooltip title={name} disableHoverListener={drawerwidthChange >= drawerwidth}>
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
        >
          {Image && <img src={Image} alt={name} style={{ height: '20px', width: '20px', filter: isDark == true ? 'invert(1)' : 'none' }} />}
          <Typography variant="body2" ml={1} className={classes.parentLabelTypo} noWrap>
            {name}
          </Typography>
        </div>
      </Tooltip>
    );
  };

  const getLabel = (icon, name, index, id) => {
    const IconComponent = iconComponents[icon];
    return (
      <Tooltip title={name} disableHoverListener={drawerwidthChange >= drawerwidth}>
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
        >
          {IconComponent && <IconComponent color={isDark == true ? '#64B5F6' : '#2196F3'} sx={{ fontSize: 18, opacity: 0.9 }} />}
          <Typography variant="body2" ml={1} className={classes.labelTypo} noWrap>
            {index && `${index}. `}
            {name}
          </Typography>
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
        console.log('res', res);
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

  const renderTreeItem = (data, onClick, contextMenuHandler, children) => (
    <TreeItem
      key={data.id}
      nodeId={data.id}
      label={getImageLabel(data.icon, data.name, data.id)}
      onClick={onClick}
      onContextMenu={contextMenuHandler}
      className={classes.treeItem}
    >
      {children}
    </TreeItem>
  );

  const renderSubItems = (subs, handleOpenTable, contextMenuHandler, additionalMapping) => {
    return subs?.map((sub) =>
      sub.name === 'Attack' || sub.name === 'Attack Trees' ? (
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
              <Box>{getLabel('TopicIcon', sub.name, null, sub.id)}</Box>
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
          onClick={(e) => handleOpenTable(e, sub.id, sub.name)}
          // onContextMenu={(e) => contextMenuHandler && contextMenuHandler(e, sub.name)}
        >
          {additionalMapping && additionalMapping(sub)}
        </TreeItem>
      ) : (
        <TreeItem
          key={sub.id}
          nodeId={sub.id}
          label={getLabel('TopicIcon', sub.name, null, sub.id)}
          onClick={(e) => handleOpenTable(e, sub.id, sub.name)}
          onContextMenu={(e) => contextMenuHandler && contextMenuHandler(e, sub.name)}
        >
          {additionalMapping && additionalMapping(sub)}
        </TreeItem>
      )
    );
  };

  const renderTreeItems = (data, type) => {
    if (!data) return null;

    switch (type) {
      case 'assets': {
        const edgesDetail = data.Details?.filter((detail) => detail?.nodeId?.includes('reactflow__edge')) || [];
        const nodesDetail = data.Details?.filter((detail) => !detail?.nodeId?.includes('reactflow__edge') && detail.type !== 'data') || [];
        const dataDetail = data.Details?.filter((detail) => detail.type === 'data') || [];

        const renderProperties = (properties, detail, type) => {
          // console.log('properties', properties);
          if (!properties || properties.length === 0) return null;

          // Extract names for processing
          const propertyNames = properties.map((prop) => prop.name);

          const displayedProperties = propertyNames;
          return (
            <Tooltip
              title={
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'start',
                    padding: '8px'
                  }}
                >
                  {propertyNames?.map((name, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <Avatar sx={{ width: 18, height: 18 }}>
                        <img src={Properties[name]} alt={name} width="100%" />
                      </Avatar>
                      <Typography variant="body2" sx={{ color: 'white' }}>
                        {name}
                      </Typography>
                    </div>
                  ))}
                </div>
              }
              arrow
            >
              <div
                style={{
                  backgroundColor: '#d7e6ff',
                  borderRadius: '50%',
                  width: 24,
                  height: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 'medium',
                  color: '#2196F3'
                }}
                onClick={() => handlePropertiesTab(detail, type)}
              >
                +{displayedProperties.length}
              </div>
            </Tooltip>
          );
        };

        const renderSection = (nodeId, label, details, type) => {
          const shouldShowAddIcon = (nodeId === 'nodes_section' && hovered.node) || (nodeId === 'data_section' && hovered.data);

          if (!details.length) return null;
          return (
            <DraggableTreeItem
              nodeId={nodeId}
              label={
                nodeId === 'nodes_section' || nodeId === 'data_section' ? (
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    onMouseEnter={() =>
                      setHovered((state) => ({
                        ...state,
                        node: nodeId === 'nodes_section' ? true : state.node,
                        data: nodeId === 'data_section' ? true : state.data
                      }))
                    }
                    onMouseLeave={() =>
                      setHovered((state) => ({
                        ...state,
                        node: nodeId === 'nodes_section' ? false : state.node,
                        data: nodeId === 'data_section' ? false : state.data
                      }))
                    }
                  >
                    <Box>{getLabel('TopicIcon', label, null, nodeId)}</Box>
                    {shouldShowAddIcon && (
                      <Box onClick={handleAddNode(nodeId === 'nodes_section' ? 'default' : 'data')}>
                        <ControlPointIcon color="primary" sx={{ fontSize: 18 }} />
                      </Box>
                    )}
                  </Box>
                ) : (
                  getLabel('TopicIcon', label, null, nodeId)
                )
              }
              onClick={(e) => {
                e.stopPropagation();
                setClickedItem(nodeId);
              }}
              className={classes.template}
            >
              {details?.map((detail, i) => {
                // console.log('detail', detail);
                return detail?.name?.length && detail?.props?.length > 0 ? (
                  <DraggableTreeItem
                    key={detail.nodeId}
                    nodeId={detail.nodeId}
                    data={detail.nodeId}
                    sx={{
                      background: selectedBlock?.id === detail?.nodeId ? 'wheat' : 'inherit'
                    }}
                    label={
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Tooltip title={detail?.name} disableHoverListener={drawerwidthChange >= drawerwidth}>
                          <span>
                            <EditName detail={detail} index={i} onUpdate={handleSave} />
                          </span>
                        </Tooltip>
                        {renderProperties(detail?.props, detail, type)}
                      </Box>
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      setClickedItem(detail.nodeId);
                      dispatch(setSelectedBlock({ id: detail?.nodeId, name: detail.name }));
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      setClickedItem(detail.nodeId);
                      dispatch(setSelectedBlock({ id: detail?.nodeId, name: detail.name }));
                    }}
                    onContextMenu={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setClickedItem(detail.nodeId);
                      dispatch(setSelectedBlock({ id: detail?.nodeId, name: detail.name }));
                      const selected = (type === 'node' ? nodes : edges).find((item) => item.id === detail?.nodeId);
                      dispatch(
                        setAnchorEl({
                          type: type,
                          value: type === 'edge' ? `rf__edge-${selected.id}` : selected?.id
                        })
                      );
                      dispatch(
                        type === 'edge'
                          ? setEdgeDetails({
                              name: selected?.data?.label ?? '',
                              properties: selected?.properties ?? [],
                              isAsset: selected?.isAsset ?? false,
                              style: selected?.style ?? {},
                              startPoint: selected?.markerStart?.color ?? '#000000',
                              endPoint: selected?.markerEnd?.color ?? '#000000'
                            })
                          : setDetails({
                              name: selected?.data?.label ?? '',
                              properties: selected?.properties ?? [],
                              isAsset: selected?.isAsset ?? false
                            })
                      );
                    }}
                    onDragStart={(e) => onDragStart(e, detail)}
                  />
                ) : null;
              })}
            </DraggableTreeItem>
          );
        };

        return renderTreeItem(
          data,
          (e) => handleClick(e, model?._id, 'assets', data.id),
          handleNodes,
          <>
            {renderSection('nodes_section', 'Components', nodesDetail, 'node')}
            {renderSection('data_section', 'Data', dataDetail, 'data')}
            {renderSection('edges_section', 'Connectors', edgesDetail, 'edge')}
          </>
        );
      }

      case 'damageScenarios':
        return renderTreeItem(
          data,
          (e) => handleClick(e, model?._id, 'damage', data.id),
          null,
          renderSubItems(data.subs, handleOpenTable, null, (sub) => {
            if (sub.name === 'Damage Scenarios Derivations') {
              return sub.Derivations?.map((derivation, i) => (
                <TreeItem
                  onClick={(e) => e.stopPropagation()}
                  key={derivation.id}
                  nodeId={derivation.id}
                  label={getLabel('TopicIcon', derivation.name, i + 1, derivation.id)}
                />
              ));
            }
            if (sub.name === 'Damage Scenarios - Impact Ratings') {
              return sub.Details?.map((detail, i) => (
                <TreeItem
                  onClick={(e) => e.stopPropagation()}
                  key={detail._id}
                  nodeId={detail._id}
                  label={getLabel('DangerousIcon', detail.Name, i + 1, detail._id)}
                />
              ));
            }
          })
        );

      case 'threatScenarios':
        return renderTreeItem(
          data,
          (e) => handleClick(e, model?._id, 'threat', data.id),
          null,
          renderSubItems(data?.subs, handleOpenTable, null, (sub) => {
            let key = 0;
            return sub.Details?.flatMap((detail, i) =>
              (sub.name === 'Threat Scenarios'
                ? detail?.Details?.flatMap((nodeDetail) =>
                    nodeDetail?.props?.map((prop) => {
                      key++;
                      return {
                        label: `[TS${key.toString().padStart(3, '0')}] ${threatType(prop?.name)} of ${nodeDetail?.node} leads to ${
                          detail?.damage_name
                        } [${detail?.id}]`,
                        nodeId: prop.id.concat(detail?.rowId),
                        extraProps: {
                          threatId: prop?.id,
                          damageId: detail?.rowId
                        }
                      };
                    })
                  )
                : [
                    {
                      label: `[TSD${(i + 1).toString().padStart(3, '0')}] ${detail?.name}`,
                      nodeId: detail?.id,
                      extraProps: {}
                    }
                  ]
              ).map(({ label, nodeId, extraProps }) => (
                <DraggableTreeItem
                  draggable={true}
                  key={nodeId}
                  nodeId={nodeId}
                  label={getLabel('TopicIcon', label, key || i + 1, nodeId)}
                  onDragStart={(e) => onDragStart(e, { label, type: 'default', dragged: true, nodeId, ...extraProps })}
                  onClick={(e) => e.stopPropagation()}
                />
              ))
            );
          })
        );

      case 'attackScenarios':
        return renderTreeItem(
          data,
          (e) => handleClick(e, model?._id, 'attack', data.id),
          null,
          renderSubItems(data.subs, handleOpenTable, handleContext, (sub) =>
            sub.scenes?.map((at_scene, i) => {
              const Details = { label: at_scene.Name, nodeId: at_scene.ID, type: 'Event', dragged: true };

              return sub.name === 'Attack' ? (
                <DraggableTreeItem
                  key={at_scene.ID}
                  nodeId={at_scene.ID}
                  label={
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      onMouseEnter={() => setHovered((state) => ({ ...state, id: at_scene?.ID }))}
                      onMouseLeave={() => setHovered((state) => ({ ...state, id: '' }))}
                    >
                      <Box>{getLabel('DangerousIcon', at_scene.Name, i + 1, at_scene.ID)}</Box>
                      {hovered.id === at_scene?.ID && (
                        <Box
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDeleteModal(sub?.type, at_scene);
                          }}
                        >
                          <DeleteForeverIcon color="error" sx={{ fontSize: 19 }} />
                        </Box>
                      )}
                    </Box>
                  }
                  draggable
                  onDragStart={(e) => onDragStart(e, Details)}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <TreeItem
                  key={at_scene.ID}
                  nodeId={at_scene.ID}
                  label={
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      onMouseEnter={() => setHovered((state) => ({ ...state, id: at_scene?.ID }))}
                      onMouseLeave={() => setHovered((state) => ({ ...state, id: '' }))}
                    >
                      <Box>{getLabel('DangerousIcon', at_scene.Name, i + 1, at_scene.ID)}</Box>
                      {hovered.id === at_scene?.ID && (
                        <Box
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDeleteModal(sub?.type, at_scene);
                          }}
                        >
                          <DeleteForeverIcon color="error" sx={{ fontSize: 19 }} />
                        </Box>
                      )}
                    </Box>
                  }
                  onClick={(e) => handleOpenAttackTree(e, at_scene, sub.name)}
                />
              );
            })
          )
        );
      case 'riskTreatment':
        return renderTreeItem(
          data,
          (e) => handleClick(e, model?._id, 'risks', data.id),
          null,
          renderSubItems(data.subs, handleOpenTable, null, (sub) => {
            return sub.Derivations?.map((derivation) => (
              <TreeItem
                onClick={(e) => e.stopPropagation()}
                key={derivation.id}
                nodeId={derivation.id}
                label={getLabel('TopicIcon', derivation.name, null, derivation.id)}
              />
            ));
          })
        );
      case 'cybersecurity':
        return renderTreeItem(
          data,
          (e) => handleClick(e, model?._id, 'cybersecurity', data.id),
          null,
          renderSubItems(data.subs, handleOpenTable, null, (sub) => {
            return sub.scenes?.map((scene) => (
              <TreeItem
                onClick={(e) => e.stopPropagation()}
                key={scene.ID}
                nodeId={scene.ID}
                label={getLabel('TopicIcon', scene.Name, null, scene.ID)}
              />
            ));
          })
        );

      case 'catalog':
        return renderTreeItem(
          data,
          (e) => handleClick(e, model?._id, 'catalog', data.id),
          null,
          renderSubItems(data.subs, handleOpenTable, null, (sub) => {
            return sub.subs_scenes?.map((scene) => (
              <TreeItem
                key={scene.id}
                nodeId={scene.id}
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
        );

      case 'documents':
        return renderTreeItem(
          data,
          (e) => {
            e.stopPropagation();
            handleOpenDocumentDialog();
          },
          null,
          null
        );

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
      <DocumentDialog open={openDocumentDialog} onClose={handleCloseDocumentDialog} />

      <CardStyle
        isCollapsed={isCollapsed}
        isNavbarClose={isNavbarClose}
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
        <CardContent sx={{ p: 2, color: color?.sidebarContent, height: '100%', overflowY: 'auto' }}>
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
                    onChange={handleInputChange}
                    onBlur={handleBlur}
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
                  <Box onDoubleClick={handleDoubleClick}>{getTitleLabel('ModelIcon', currentName, model?._id)}</Box>
                )
              }
              sx={{ '& .Mui-selected': { backgroundColor: 'transparent !important' } }}
            >
              {scenarios.map(({ name, scene }) => renderTreeItems(scene, name))}
            </TreeItem>
          </TreeView>
        </CardContent>
      </CardStyle>
      <CommonModal open={openModal?.attack} handleClose={handleAttackTreeClose} name={subName} />
      {anchorElId && (
        <EditProperties
          anchorEl={anchorElId}
          handleSaveEdit={handleSave}
          handleClosePopper={handleClosePopper}
          setDetails={setDetails}
          details={details}
          dispatch={dispatch}
          nodes={nodes}
          setNodes={setNodes}
          edges={edges}
          setEdges={setEdges}
        />
      )}
      <ConfirmDeleteDialog
        open={openModal?.delete}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteAttack}
        type={deleteScene?.type}
      />
    </>
  );
};

export default BrowserCard;
