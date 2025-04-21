/*eslint-disable*/
import React, { useMemo, useRef } from 'react';
import { styled } from '@mui/material/styles';
import { Box, Card, CardContent, ClickAwayListener, MenuItem, Paper, Popper, Typography, TextField, Tooltip } from '@mui/material';
import { useEffect, useState } from 'react';
import ColorTheme from '../../../../themes/ColorTheme';
import { useDispatch, useSelector } from 'react-redux';
import useStore from '../../../../store/Zustand/store';
import { TreeView } from '@mui/x-tree-view/TreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
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
import { closeAll, setAttackScene, setPreviousTab, setTableOpen } from '../../../../store/slices/CurrentIdSlice';
import { setTitle } from '../../../../store/slices/PageSectionSlice';
import { clearAnchorEl, setAnchorEl, setDetails, setEdgeDetails, setSelectedBlock } from '../../../../store/slices/CanvasSlice';
import CommonModal from '../../../../components/Modal/CommonModal';
import DocumentDialog from '../../../../components/DocumentDialog/DocumentDialog';
import toast from 'react-hot-toast';
import { getNavbarHeight } from '../../../../themes/constant';
import { getNodeDetails } from '../../../../utils/Constraints';
import { Avatar, AvatarGroup } from '@mui/material';
import ConfirmDeleteDialog from '../../../../components/Modal/ConfirmDeleteDialog';
import EditProperties from '../../../../components/Poppers/EditProperties';
import RenderedTreeItems from './RenderedTreeItems';

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
  shouldForwardProp: (prop) => prop !== 'isDark' && prop !== 'isNavbarClose' && prop !== 'isCollapsed'
})(({ theme, isCollapsed, isNavbarClose, isDark }) => ({
  marginBottom: '22px',
  overflow: 'hidden',
  position: 'relative',
  height: isNavbarClose ? '100vh' : `calc(95vh - ${getNavbarHeight(isCollapsed)}px)`,
  boxShadow: 'inset 0px 0px 7px gray',
  '&:after': {
    content: '"',
    position: 'absolute',
    borderRadius: '50%',
    top: '-105px',
    right: '-96px'
  },
  '&::-webkit-scrollbar': {
    width: '5px'
  },
  '&::-webkit-scrollbar-thumb': {
    background: isDark
      ? 'linear-gradient(90deg, rgba(100,181,246,0.3) 0%, rgba(100,181,246,0.1) 100%)'
      : 'linear-gradient(90deg, rgba(33,150,243,0.2) 0%, rgba(33,150,243,0.05) 100%)'
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
  setAttackNodes: state.setAttackNodes,
  setAttackEdges: state.setAttackEdges,
  setInitialAttackNodes: state.setInitialAttackNodes,
  setInitialAttackEdges: state.setInitialAttackEdges,
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
  updateModelName: state.updateModelName,
  update: state.updateAssets,
  setNodes: state.setNodes,
  setEdges: state.setEdges,
  getCatalog: state.getCatalog,
  updateAttack: state.updateAttackScenario,
  getGlobalAttackTrees: state.getGlobalAttackTrees,
  deleteAttacks: state.deleteAttacks,
  setSelectedThreatIds: state.setSelectedThreatIds,
  setSelectedElement: state.setSelectedElement,
  setIsNodePasted: state.setIsNodePasted
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
    setAttackNodes,
    setAttackEdges,
    setInitialAttackNodes,
    setInitialAttackEdges,
    setSelectedThreatIds,
    setSelectedElement,
    setIsNodePasted
  } = useStore(selector);
  const { modelId } = useSelector((state) => state?.pageName);
  const drawerwidth = 370;
  const { drawerwidthChange, anchorEl, details } = useSelector((state) => state?.canvas);
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
  // console.log('anchorElId', anchorElId);
  // console.log('anchorEl?.sidebar', anchorEl?.sidebar);
  const [deleteScene, setDeleteScene] = useState({
    type: '',
    id: '',
    name: ''
  });

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
    // console.log('scene', scene);
    setDeleteScene({
      type: type,
      id: scene?.ID,
      name: scene?.Name
    });
    setOpenModal((state) => ({ ...state, delete: true }));
  };

  const handleCloseDeleteModal = () => {
    setOpenModal((state) => ({ ...state, delete: false }));
    setDeleteScene({
      type: '',
      id: '',
      name: ''
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

  // console.log('clickedItem', clickedItem);
  const handleOpenTable = (e, id, name) => {
    // console.log('id', id);
    e.stopPropagation();
    setClickedItem(id);
    if (name !== 'Attack Trees' && !name.includes('UNICE') && name !== 'Vulnerability Analysis') {
      dispatch(setTableOpen(name));
      dispatch(setTitle(name));
    }
    dispatch(setPreviousTab(name));
  };
  const handleOpenAttackTree = (e, scene, name) => {
    e.stopPropagation();
    const prevSceneId = attackScene?.ID;
    if (name === 'Attack Trees') {
      if (
        JSON.stringify(attackNodes) !== JSON.stringify(initialAttackNodes) ||
        JSON.stringify(attackEdges) !== JSON.stringify(initialAttackEdges)
      ) {
        // console.log(`✅ Changes detected! Saving scene ${sceneId}...`);
        const template = {
          nodes: attackNodes,
          edges: attackEdges
        };

        // console.log('template', template);
        // Extract threatId from nodes with type: "default"
        const threatNode = attackNodes?.find((node) => node?.type === 'default' && node?.threatId) ?? {};
        // if (!threatNode) {
        //   notify('Threat scenario is missing', 'error');
        //   return;
        // }
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
        setInitialAttackEdges(scene?.templates?.edges ?? []);
        setInitialAttackNodes(scene?.templates?.nodes ?? []);
        setAttackEdges(scene?.templates?.edges ?? []);
        setAttackNodes(scene?.templates?.nodes ?? []);
      }
      // console.log('later');
      dispatch(setTableOpen('Attack Trees Canvas'));
    }
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

  const RefreshAPI = () => {
    getAssets(model?._id).catch((err) => {
      notify('Failed to fetch assets: ' + err.message, 'error');
    });
    getDamageScenarios(model?._id).catch((err) => {
      notify('Failed to fetch damage scenarios: ' + err.message, 'error');
    });
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

  const getTitleLabel = (icon, name, id) => {
    const Image = imageComponents[icon];
    return (
      <Tooltip title={name} disableHoverListener={drawerwidthChange >= drawerwidth}>
        <div>
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
            {Image && (
              <img src={Image} alt={name} style={{ height: '20px', width: '20px', filter: isDark == true ? 'invert(1)' : 'none' }} />
            )}
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
        </div>
      </Tooltip>
    );
  };

  const getImageLabel = (icon, name, id) => {
    const Image = imageComponents[icon];
    return (
      <Tooltip title={name} disableHoverListener={drawerwidthChange >= drawerwidth}>
        <div>
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
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleClick(e, model?._id, name.toLowerCase(), id)}
          >
            {Image && (
              <img src={Image} alt={name} style={{ height: '20px', width: '20px', filter: isDark == true ? 'invert(1)' : 'none' }} />
            )}
            <Typography variant="body2" ml={1} className={classes.parentLabelTypo} noWrap>
              {name}
            </Typography>
          </Box>
        </div>
      </Tooltip>
    );
  };

  const getLabel = (icon, name, index, id, ids, onClick) => {
    // console.log('onClick', onClick);
    const IconComponent = iconComponents[icon];
    return (
      <Tooltip title={name} disableHoverListener={drawerwidthChange >= drawerwidth}>
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
              {ids && ids.length && ` [${ids.length}]`}
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
    setSelectedElement(selected);
    dispatch(
      setDetails({
        name: data?.label ?? '',
        properties: properties ?? [],
        isAsset: isAsset ?? false
      })
    );
  };

  const handleClosePopper = () => {
    dispatch(clearAnchorEl());
  };

  return (
    <>
      <DocumentDialog open={openDocumentDialog} onClose={handleCloseDocumentDialog} />

      <CardStyle
        isCollapsed={isCollapsed}
        isNavbarClose={isNavbarClose}
        isDark={isDark}
        sx={{
          background: color.tabBorder,
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '5px'
          },
          '&::-webkit-scrollbar-thumb': {
            background: isDark
              ? 'linear-gradient(90deg, rgba(100,181,246,0.3) 0%, rgba(100,181,246,0.1) 100%)'
              : 'linear-gradient(90deg, rgba(33,150,243,0.2) 0%, rgba(33,150,243,0.05) 100%)'
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
              {scenarios.map(({ name, scene }, i) => (
                <RenderedTreeItems
                  key={i}
                  data={scene}
                  type={name}
                  handlePropertiesTab={handlePropertiesTab}
                  getLabel={getLabel}
                  getImageLabel={getImageLabel}
                  setClickedItem={setClickedItem}
                  classes={classes}
                  hovered={hovered}
                  setHovered={setHovered}
                  drawerwidth={drawerwidth}
                  dispatch={dispatch}
                  setEdgeDetails={setEdgeDetails}
                  setDetails={setDetails}
                  onDragStart={onDragStart}
                  setSelectedThreatIds={setSelectedThreatIds}
                  handleOpenTable={handleOpenTable}
                  handleContext={handleContext}
                  handleOpenDeleteModal={handleOpenDeleteModal}
                  handleOpenAttackTree={handleOpenAttackTree}
                  handleClick={handleClick}
                  handleOpenDocumentDialog={handleOpenDocumentDialog}
                  handleSave={handleSave}
                />
              ))}
            </TreeItem>
          </TreeView>
        </CardContent>
      </CardStyle>
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
      <CommonModal open={openModal?.attack} handleClose={handleAttackTreeClose} name={subName} />
      <ConfirmDeleteDialog
        open={openModal?.delete}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteAttack}
        name={deleteScene?.name}
      />
    </>
  );
};

export default React.memo(BrowserCard);
