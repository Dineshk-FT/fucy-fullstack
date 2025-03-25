/*eslint-disable*/
import React, { useMemo } from 'react';
import { styled } from '@mui/material/styles';
import { Box, Card, CardContent, ClickAwayListener, MenuItem, Paper, Popper, Typography, TextField, Tooltip } from '@mui/material';
import { useEffect, useState } from 'react';
import CircleRoundedIcon from '@mui/icons-material/CircleRounded';
import ColorTheme from '../../../../store/ColorTheme';
import { useDispatch, useSelector } from 'react-redux';
import useStore from '../../../../Zustand/store';
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
import DraggableTreeItem from './DraggableItem';
import { closeAll, setAttackScene, setPreviousTab, setTableOpen } from '../../../../store/slices/CurrentIdSlice';
import { setTitle } from '../../../../store/slices/PageSectionSlice';
import { threatType } from '../../../../ui-component/Table/constraints';
import SelectNodeList from '../../../../ui-component/Modal/SelectNodeList';
import { openAddNodeTab, setAnchorEl, setDetails, setEdgeDetails, setSelectedBlock } from '../../../../store/slices/CanvasSlice';
import CommonModal from '../../../../ui-component/Modal/CommonModal';
import DocumentDialog from '../../../../ui-component/DocumentDialog/DocumentDialog';
import toast from 'react-hot-toast';
import { getNavbarHeight } from '../../../../store/constant';

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
  initialNodes: state.initialNodes,
  initialEdges: state.initialEdges,
  setInitialNodes: state.setInitialNodes,
  setInitialEdges: state.setInitialEdges,
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
  setNodes: state.setNodes,
  setEdges: state.setEdges,
  getCatalog: state.getCatalog,
  update: state.updateAssets,
  setSaveModal: state.setSaveModal,
  isSaveModalOpen: state.isSaveModalOpen
});

// Function to shorten loss names
const shortenLossName = (name) => {
  const lossMap = {
    Availability: 'Avail',
    Integrity: 'Int',
    Authenticity: 'Auth',
    Authorization: 'Authz',
    'Non Repudiation': 'Non-rep',
    Confidentiality: 'Conf'
  };
  return lossMap[name] || name;
};

// Function to get full loss names for tooltip
const getFullLossNames = (props) => {
  return props.map((prop) => `Loss of ${prop.name}`).join(', ');
};

// Function to get shortened loss names for display
const getShortenedLossNames = (props) => {
  return props.length > 0 ? `Loss of ${props.map((prop) => shortenLossName(prop.name)).join(', ')}` : 'No Losses';
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
    initialNodes,
    initialEdges,
    setInitialNodes,
    setInitialEdges,
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
    setNodes,
    setEdges,
    getCatalog,
    update,
    isSaveModalOpen,
    setSaveModal,
    isDark
  } = useStore(selector);
  const { currentTab, tableOpen, previousTab } = useSelector((state) => state?.currentId);
  const { modelId } = useSelector((state) => state?.pageName);
  const drawerwidth = 370;
  const { selectedBlock, drawerwidthChange } = useSelector((state) => state?.canvas);
  const [anchorItemEl, setAnchorItemEl] = useState(null);
  const [openItemRight, setOpenItemRight] = useState(false);
  const [openNodelist, setOpenNodelist] = useState(false);
  const [openAttackModal, setOpenAttackModal] = useState(false);
  const [subName, setSubName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentName, setCurrentName] = useState('');
  const [openDocumentDialog, setOpenDocumentDialog] = useState(false);
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
    dispatch(openAddNodeTab());
    setOpenItemRight(false);
  };

  const handleCloseItem = () => {
    setOpenItemRight(false);
    setAnchorItemEl(null);
  };

  const handleClick = async (event, ModelId, name, id) => {
    event.stopPropagation();
    setClickedItem(id);
    if (name === 'assets') {
      dispatch(setPreviousTab(name));
      dispatch(closeAll());
    } else {
      handleCloseItem();
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

  const handleOpenAttackTree = (e, scene, name) => {
    e.stopPropagation();
    if (name === 'Attack Trees') {
      dispatch(setTableOpen('Attack Trees Canvas'));
      dispatch(setAttackScene(scene));
    }
  };

  const handleNodes = (e) => {
    e.preventDefault();
    setAnchorItemEl(e.currentTarget);
    setOpenItemRight((prev) => !prev);
  };

  const handleContext = (e, name) => {
    e.preventDefault();
    if (name === 'Attack' || name === 'Attack Trees') {
      setOpenAttackModal(true);
      setSubName(name);
    }
  };

  const handleAttackTreeClose = () => {
    setOpenAttackModal(false);
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
    return subs?.map((sub) => (
      <TreeItem
        key={sub.id}
        nodeId={sub.id}
        label={getLabel('TopicIcon', sub.name, null, sub.id)}
        onClick={(e) => handleOpenTable(e, sub.id, sub.name)}
        onContextMenu={(e) => contextMenuHandler && contextMenuHandler(e, sub.name)}
      >
        {additionalMapping && additionalMapping(sub)}
      </TreeItem>
    ));
  };

  const renderTreeItems = (data, type) => {
    if (!data) return null;

    switch (type) {
      case 'assets': {
        const edgesDetail = data.Details?.filter((detail) => detail?.nodeId?.includes('reactflow__edge')) || [];
        const nodesDetail = data.Details?.filter((detail) => !detail?.nodeId?.includes('reactflow__edge')) || [];
        // console.log('edges', edges);

        return renderTreeItem(
          data,
          (e) => handleClick(e, model?._id, 'assets', data.id),
          handleNodes,

          <>
            {/* Nodes Section */}
            {nodesDetail?.length > 0 && (
              <DraggableTreeItem
                nodeId="nodes_section"
                // label="Nodes"
                label={getLabel('TopicIcon', 'Components', null, 'nodes_section')}
                onClick={(e) => {
                  e.stopPropagation();
                  setClickedItem('nodes_section');
                }}
                className={classes.template}
              >
                {nodesDetail?.map((detail, i) =>
                  detail?.name?.length ? (
                    <DraggableTreeItem
                      key={detail.nodeId}
                      nodeId={detail.nodeId}
                      label={
                        <Tooltip title={detail.name} disableHoverListener={drawerwidthChange >= drawerwidth}>
                          <Box
                            sx={{
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              maxWidth: 'fit-content'
                            }}
                          >
                            {i + 1}.{' '}
                            <Typography component="span" noWrap>
                              {detail.name}
                            </Typography>
                          </Box>
                        </Tooltip>
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        setClickedItem(detail.nodeId);
                        dispatch(setSelectedBlock({ id: detail?.nodeId, name: detail.name }));
                        const selected = nodes.find((node) => node.id === detail?.nodeId);
                        // console.log('selected', selected);
                        dispatch(
                          setAnchorEl({
                            type: 'node',
                            value: selected?.id
                          })
                        );
                        dispatch(
                          setDetails({
                            name: selected?.data?.label ?? '',
                            properties: selected?.properties ?? [],
                            isAsset: selected?.isAsset ?? false
                          })
                        );
                      }}
                      onDragStart={(e) => onDragStart(e, detail)}
                    >
                      {detail?.props?.map((prop) => (
                        <DraggableTreeItem
                          key={prop.id}
                          nodeId={prop.id}
                          onClick={(e) => e.stopPropagation()}
                          label={
                            <Tooltip title={getFullLossNames(detail.props)} disableHoverListener={drawerwidthChange >= drawerwidth}>
                              <div className={classes.lossItem}>
                                <CircleRoundedIcon sx={{ color: isDark == true ? '#FF6D6D' : '#FF5555', fontSize: 14 }} />
                                <Typography variant="body2" className={classes.labelTypo}>
                                  {getShortenedLossNames(detail.props)}
                                </Typography>
                              </div>
                            </Tooltip>
                          }
                        />
                      ))}
                    </DraggableTreeItem>
                  ) : null
                )}
              </DraggableTreeItem>
            )}

            {/* Edges Section */}
            {edgesDetail?.length > 0 && (
              <DraggableTreeItem
                nodeId="edges_section"
                // label="Edges/Connectors"
                label={getLabel('TopicIcon', 'Connectors', null, 'edges_section')}
                onClick={(e) => {
                  e.stopPropagation();
                  setClickedItem('edges_section');
                }}
                className={classes.template}
              >
                {edgesDetail?.map((detail, i) =>
                  detail?.name?.length ? (
                    <DraggableTreeItem
                      key={detail.nodeId}
                      nodeId={detail.nodeId}
                      label={
                        <Tooltip title={detail.name} disableHoverListener={drawerwidthChange >= drawerwidth}>
                          <Box
                            sx={{
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              maxWidth: 'fit-content',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            {i + 1}.{' '}
                            <Typography component="span" noWrap>
                              {detail.name}
                            </Typography>
                          </Box>
                        </Tooltip>
                      }
                      onClick={(e) => {
                        // console.log('detail', detail);
                        e.stopPropagation();
                        setClickedItem(detail?.nodeId);
                        dispatch(setSelectedBlock({ id: detail?.nodeId, name: detail.name }));
                        const selected = edges.find((edge) => edge.id === detail?.nodeId);
                        // console.log('selected', selected);
                        dispatch(
                          setAnchorEl({
                            type: 'edge',
                            value: `rf__edge-${selected.id}`
                          })
                        );
                        dispatch(
                          setEdgeDetails({
                            name: selected?.data?.label ?? '',
                            properties: selected?.properties ?? [],
                            isAsset: selected?.isAsset ?? false,
                            style: selected?.style ?? {},
                            startPoint: selected?.markerStart.color ?? '#000000',
                            endPoint: selected?.markerEnd?.color ?? '#000000'
                          })
                        );
                      }}
                      onDragStart={(e) => onDragStart(e, detail)}
                    >
                      {detail?.props?.map((prop) => (
                        <DraggableTreeItem
                          key={prop.id}
                          nodeId={prop.id}
                          onClick={(e) => e.stopPropagation()}
                          label={
                            <Tooltip title={getFullLossNames(detail.props)} disableHoverListener={drawerwidthChange >= drawerwidth}>
                              <div className={classes.lossItem}>
                                <CircleRoundedIcon sx={{ color: isDark == true ? '#FF6D6D' : '#FF5555', fontSize: 14 }} />
                                <Typography variant="body2" className={classes.labelTypo}>
                                  {getShortenedLossNames(detail.props)}
                                </Typography>
                              </div>
                            </Tooltip>
                          }
                        />
                      ))}
                    </DraggableTreeItem>
                  ) : null
                )}
              </DraggableTreeItem>
            )}
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
            if (sub.name === 'Damage Scenarios - Collection & Impact Ratings') {
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
          renderSubItems(data.subs, handleOpenTable, null, (sub) => {
            let key = 0;
            return sub.name === 'Threat Scenarios'
              ? sub.Details?.flatMap((detail) => {
                  return detail.Details?.flatMap((nodeDetail) =>
                    nodeDetail.props?.map((prop, i) => {
                      key++;
                      const label = `[TS${key.toString().padStart(3, '0')}] ${threatType(prop?.name)} of ${nodeDetail?.node} leads to  ${
                        detail?.damage_name
                      } [${detail?.id}]`;

                      const Details = {
                        label,
                        type: 'default',
                        dragged: true,
                        nodeId: nodeDetail.nodeId,
                        threatId: prop.id,
                        damageId: detail?.rowId,
                        key: `TS${key.toString().padStart(3, '0')}`
                      };

                      return (
                        <DraggableTreeItem
                          draggable={true}
                          key={prop.id.concat(detail.rowId)}
                          nodeId={prop.id.concat(detail.rowId)}
                          label={getLabel('TopicIcon', label, key, prop.id.concat(detail.rowId))}
                          onDragStart={(e) => onDragStart(e, Details)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      );
                    })
                  );
                })
              : sub.Details?.map((detail, i) => {
                  const label = `[TSD${(i + 1).toString().padStart(3, '0')}] ${detail?.name}`;

                  return (
                    <TreeItem
                      key={detail.id}
                      nodeId={detail.id}
                      label={getLabel('TopicIcon', label, i + 1, detail.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  );
                });
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
                  label={getLabel('DangerousIcon', at_scene.Name, i + 1, at_scene.ID)}
                  draggable
                  onDragStart={(e) => onDragStart(e, Details)}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <TreeItem
                  key={at_scene.ID}
                  nodeId={at_scene.ID}
                  label={getLabel('DangerousIcon', at_scene.Name, i + 1, at_scene.ID)}
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
            <Popper
              id="basic-popper"
              open={openItemRight}
              anchorEl={anchorItemEl}
              placement="right"
              sx={{ zIndex: 1400 }}
              modifiers={[
                {
                  name: 'offset',
                  options: {
                    offset: [-10, -50]
                  }
                }
              ]}
            >
              <ClickAwayListener onClickAway={handleCloseItem}>
                <Paper
                  className={classes.paper}
                  sx={{
                    marginTop: '4rem',
                    marginLeft: '3.1rem',
                    background: isDark == true ? 'rgba(30,30,30,0.95)' : 'rgba(255,255,255,0.95)',
                    color: color?.sidebarContent,
                    border: 'none',
                    borderRadius: '10px',
                    padding: '10px',
                    cursor: 'pointer',
                    backdropFilter: 'blur(8px)'
                  }}
                >
                  <MenuItem
                    onClick={handleAddNewNode}
                    sx={{
                      fontSize: '13px',
                      fontFamily: "'Poppins', sans-serif",
                      color: color?.sidebarContent,
                      borderRadius: '6px',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background:
                          isDark == true
                            ? 'linear-gradient(90deg, rgba(100,181,246,0.15) 0%, rgba(100,181,246,0.05) 100%)'
                            : 'linear-gradient(90deg, rgba(33,150,243,0.08) 0%, rgba(33,150,243,0.02) 100%)',
                        transform: 'scale(1.02)',
                        boxShadow: isDark == true ? '0 2px 6px rgba(0,0,0,0.4)' : '0 2px 6px rgba(0,0,0,0.1)'
                      }
                    }}
                  >
                    Create new
                  </MenuItem>
                </Paper>
              </ClickAwayListener>
            </Popper>
          </TreeView>
        </CardContent>
      </CardStyle>
      <CommonModal open={openAttackModal} handleClose={handleAttackTreeClose} name={subName} />
      <SelectNodeList open={openNodelist} handleClose={() => setOpenNodelist(false)} />
    </>
  );
};

export default BrowserCard;
