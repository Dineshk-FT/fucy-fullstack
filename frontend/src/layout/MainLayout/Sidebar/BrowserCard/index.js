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
import { openAddNodeTab, setAnchorEl, setDetails, setSelectedBlock } from '../../../../store/slices/CanvasSlice';
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

const useStyles = makeStyles((theme) => ({
  labelRoot: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 0),
    marginLeft: '-7px',
    color: 'inherit'
  },
  labelTypo: {
    fontSize: 12,
    fontWeight: 600,
    fontFamily: 'Inter',
    color: 'inherit'
  },
  paper: {
    background: '#E5E4E2',
    border: '1px solid',
    borderRadius: 0
  },
  title: {
    display: 'flex',
    marginLeft: '-7px',
    padding: '5px',
    alignItems: 'center'
  },
  treeItem: {
    marginLeft: -10,
    padding: 2
  }
}));

const CardStyle = styled(Card)(({ theme, isCollapsed, isNavbarClose }) => ({
  marginBottom: '22px',
  overflow: 'hidden',
  position: 'relative',
  height: isNavbarClose ? '100vh' : `calc(95vh - ${getNavbarHeight(isCollapsed)}px)`,
  border: '1px solid gray',
  borderRadius: '0px',
  '&:after': {
    content: '""',
    position: 'absolute',
    borderRadius: '50%',
    top: '-105px',
    right: '-96px'
  },
  [theme.breakpoints.down('sm')]: {
    marginBottom: '10px', // Reduce margin on smaller screens
  },
  [theme.breakpoints.down('xs')]: {
    marginBottom: '5px', // Further reduce margin on extra small screens
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
    setSaveModal
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
    // { name: 'systemDesign', scene: systemDesign },
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
    // console.log('name', name);
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

  // console.log('initialNodes', initialNodes);
  // console.log('nodes', nodes);
  // console.log('previousTab', previousTab);
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
      // setTimeout(() => {
      dispatch(setTableOpen('Attack Trees Canvas'));
      dispatch(setAttackScene(scene));
      // }, 500);
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

  // const isDragged = useMemo(() => nodes?.some(dragCheck), [nodes?.length]);
  // function dragCheck(node) {
  //   return node?.dragged;
  // }

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
            alignItems: 'center'
          }}
        >
          {Image && <img src={Image} alt={name} style={{ height: '18px', width: '18px' }} />}
          <Typography variant="body2" ml={0.5} mt={0.5} className={classes.labelTypo} color="inherit" fontSize={'14px !important'} noWrap>
            {name}
          </Typography>
        </Box>
      </Tooltip>
    );
  };

  const getImageLabel = (icon, name) => {
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
            alignItems: 'center'
          }}
        >
          {Image && <img src={Image} alt={name} style={{ height: '18px', width: '18px' }} />}
          <Typography variant="body2" ml={0.5} className={classes.labelTypo} noWrap>
            {name}
          </Typography>
        </div>
      </Tooltip>
    );
  };

  const getLabel = (icon, name, index) => {
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
            alignItems: 'center'
          }}
        >
          {IconComponent && <IconComponent color="inherit" sx={{ fontSize: 16 }} />}
          <Typography variant="body2" ml={0.5} className={classes.labelTypo} noWrap>
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
      label={getImageLabel(data.icon, data.name)}
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
        label={getLabel('TopicIcon', sub.name)}
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
      case 'assets':
        return renderTreeItem(
          data,
          (e) => handleClick(e, model?._id, 'assets', data.id),
          handleNodes,
          data.Details?.map((detail, i) => {
            // console.log('detail', detail);
            return detail?.name?.length ? (
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
                        maxWidth: 'fit-content' // Adjust width as needed
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
                  // if (!detail.nodeId.includes('edge')) {
                  // console.log('clicked', detail);

                  setClickedItem(detail.nodeId);
                  // }
                  dispatch(setSelectedBlock({ id: detail?.nodeId, name: detail.name }));
                  const selected = nodes.find((node) => node.id === detail?.nodeId) || edges.find((edge) => edge.id === detail?.nodeId);
                  dispatch(
                    setAnchorEl({
                      type: selected?.target ? 'edge' : 'node',
                      value: selected?.target ? `rf__edge-${selected.id}` : selected?.id
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
                sx={{
                  backgroundColor: selectedBlock?.id === detail.nodeId ? 'wheat' : 'inherit',
                  color: selectedBlock?.id === detail.nodeId ? '#000' : 'inherit'
                }}
              >
                {detail?.props?.map((prop) => {
                  // console.log('prop', prop);
                  return (
                    <DraggableTreeItem
                      key={prop.id}
                      nodeId={prop.id}
                      onClick={(e) => e.stopPropagation()}
                      label={
                        <div style={{ display: 'flex', alignItems: 'center', marginLeft: '-31px', gap: 2 }}>
                          <CircleRoundedIcon sx={{ color: 'red', fontSize: 13 }} />
                          {`Loss of ${prop.name}`}
                        </div>
                      }
                    />
                  );
                })}
              </DraggableTreeItem>
            ) : null;
          })
        );

      case 'damageScenarios':
        return renderTreeItem(
          data,
          (e) => handleClick(e, model?._id, 'damage', data.id),
          null,
          renderSubItems(data.subs, handleOpenTable, null, (sub) => {
            // console.log('sub.Derivations.length', sub?.Derivations?.length);
            if (sub.name === 'Damage Scenarios Derivations') {
              return sub.Derivations?.map((derivation, i) => (
                <TreeItem
                  onClick={(e) => e.stopPropagation()}
                  key={derivation.id}
                  nodeId={derivation.id}
                  label={getLabel('TopicIcon', derivation.name, i + 1)}
                />
              ));
            }
            if (sub.name === 'Damage Scenarios - Collection & Impact Ratings') {
              return sub.Details?.map((detail, i) => (
                <TreeItem
                  onClick={(e) => e.stopPropagation()}
                  key={detail._id}
                  nodeId={detail._id}
                  label={getLabel('DangerousIcon', detail.Name, i + 1)}
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
                  // console.log('detail', detail);
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
                          label={getLabel('TopicIcon', label, key)}
                          onDragStart={(e) => onDragStart(e, Details)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      );
                    })
                  );
                })
              : sub.Details?.map((detail, i) => {
                  // console.log('detail', detail);
                  const label = `[TSD${(i + 1).toString().padStart(3, '0')}] ${detail?.name}`;

                  return (
                    <TreeItem
                      key={detail.id}
                      nodeId={detail.id}
                      label={getLabel('TopicIcon', label, i + 1)}
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
                  label={getLabel('DangerousIcon', at_scene.Name, i + 1)}
                  draggable
                  onDragStart={(e) => onDragStart(e, Details)}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <TreeItem
                  key={at_scene.ID}
                  nodeId={at_scene.ID}
                  label={getLabel('DangerousIcon', at_scene.Name, i + 1)}
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
                label={getLabel('TopicIcon', derivation.name)}
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
              <TreeItem onClick={(e) => e.stopPropagation()} key={scene.ID} nodeId={scene.ID} label={getLabel('TopicIcon', scene.Name)} />
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
                label={getLabel('TopicIcon', scene.name)}
                onClick={(e) => handleOpenTable(e, scene.id, scene.name)}
              >
                {/* Render nested draggable TreeItems if present */}
                {scene.item_name?.map((subScene) => (
                  <DraggableTreeItem
                    key={subScene.id}
                    nodeId={subScene.id}
                    label={getLabel('SubTopicIcon', subScene.name)}
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
                label={getLabel('DangerousIcon', detail.name)}
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
        sx={{ backgroundColor: color?.sidebarInnerBG, scrollbarWidth: 'none' }}
      >
        <CardContent sx={{ p: 2, color: color?.sidebarContent, height: '100%', overflowY: 'auto' }}>
          <TreeView
            aria-label="file system navigator"
            expanded={clickedItem}
            onClick={handleTitleClick}
            defaultCollapseIcon={<ExpandMoreIcon sx={{ color: 'inherit' }} />}
            defaultExpandIcon={<ChevronRightIcon sx={{ color: 'inherit' }} />}
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
                      my: 0.6,
                      '& .MuiOutlinedInput-root': { fontSize: '13px' },
                      '& .MuiInputBase-input': { padding: '4px 14px' },
                      '& .MuiOutlinedInput-notchedOutline': { border: 'none !important' }
                    }}
                  />
                ) : (
                  <Box onDoubleClick={handleDoubleClick}>{getTitleLabel('ModelIcon', currentName, model?._id)}</Box>
                )
              }
              sx={{ '& .Mui-selected': { backgroundColor: 'none !important' } }}
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
                    background: `${color?.canvaSurroundsBG} !important`,
                    color: color?.sidebarContent,
                    border: '1px solid #ccc !important',
                    borderRadius: '8px !important',
                    padding: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <MenuItem onClick={handleAddNewNode}>Create new</MenuItem>
                  {/* <MenuItem onClick={handleOpenSelectNode}>Components</MenuItem> */}
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
