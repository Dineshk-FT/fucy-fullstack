/*eslint-disable*/
import React, { useMemo } from 'react';
import { styled } from '@mui/material/styles';
import { Box, Card, CardContent, ClickAwayListener, MenuItem, Paper, Popper, Typography, TextField } from '@mui/material';
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
import {
  attackTableOpen,
  AttackTreePageOpen,
  closeAll,
  DerivationTableOpen,
  drawerOpen,
  DsTableOpen,
  setAttackScene,
  TsTableOpen,
  cyberTableOpen,
  riskTreatmentTableOpen
} from '../../../../store/slices/CurrentIdSlice';
import { setTitle } from '../../../../store/slices/PageSectionSlice';
import { threatType } from '../../../../ui-component/Table/constraints';
import SelectNodeList from '../../../../ui-component/Modal/SelectNodeList';
import { openAddNodeTab } from '../../../../store/slices/CanvasSlice';
import CommonModal from '../../../../ui-component/Modal/CommonModal';
import DocumentDialog from '../../../../ui-component/DocumentDialog/DocumentDialog';

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

const CardStyle = styled(Card)(() => ({
  marginBottom: '22px',
  overflow: 'hidden',
  position: 'relative',
  height: '80vh',
  border: '1px solid gray',
  borderRadius: '0px',
  '&:after': {
    content: '""',
    position: 'absolute',
    borderRadius: '50%',
    top: '-105px',
    right: '-96px'
  }
}));

const selector = (state) => ({
  getModels: state.getModels,
  getModelById: state.getModelById,
  nodes: state.nodes,
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
  setNodes: state.setNodes
});

// ==============================|| SIDEBAR MENU Card ||============================== //

const BrowserCard = () => {
  const color = ColorTheme();
  const classes = useStyles();
  const dispatch = useDispatch();
  const {
    getModels,
    nodes,
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
    setNodes
  } = useStore(selector);
  const { modelId } = useSelector((state) => state?.pageName);
  const { selectedBlock } = useSelector((state) => state?.canvas);
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
    event.stopPropagation();
    setClickedItem(id);
    if (name === 'assets') {
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
      cybersecurity: getCyberSecurityScenario
    };
    await get_api[name](ModelId);
  };

  const handleOpenTable = (e, id, name) => {
    // console.log('name', name);
    e.stopPropagation();
    setClickedItem(id);
    switch (true) {
      case name.includes('Derivations'):
        dispatch(DerivationTableOpen());
        break;
      case name.includes('Collection & Impact Ratings'):
        dispatch(DsTableOpen());
        break;
      case name.includes('Threat Scenarios'):
        dispatch(TsTableOpen());
        dispatch(setTitle(name));
        break;
      case name === 'Attack':
        dispatch(attackTableOpen());
        break;
      case name.includes('Threat Assessment'):
        dispatch(riskTreatmentTableOpen());
        dispatch(setTitle(name));
        break;
      case name === 'CyberSecurity Requirements':
        dispatch(cyberTableOpen());
        dispatch(setTitle(name));
      default:
        break;
    }
  };

  const handleOpenAttackTree = (e, scene, name) => {
    setNodes([]);
    e.stopPropagation();
    if (name === 'Attack Trees') {
      dispatch(AttackTreePageOpen());
      dispatch(setAttackScene(scene));
    }
  };

  const handleNodes = (e) => {
    e.preventDefault();
    setAnchorItemEl(e.currentTarget);
    setOpenItemRight((prev) => !prev);
  };

  const handleOpenSelectNode = (e) => {
    e.stopPropagation();
    setOpenNodelist(true);
    setOpenItemRight(false);
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
      <Box color={color?.sidebarContent} className={classes.title}>
        {Image ? <img src={Image} alt={name} style={{ height: '18px', width: '18px' }} /> : null}
        <Typography variant="body2" ml={0.5} mt={0.5} className={classes.labelTypo} color="inherit" fontSize={'14px !important'}>
          {name}
        </Typography>
      </Box>
    );
  };

  const getImageLabel = (icon, name) => {
    const Image = imageComponents[icon];
    return (
      <div className={classes.labelRoot}>
        {Image ? <img src={Image} alt={name} style={{ height: '18px', width: '18px' }} /> : null}
        <Typography variant="body2" ml={0.5} className={classes.labelTypo}>
          {name}
        </Typography>
      </div>
    );
  };
  const getLabel = (icon, name, index) => {
    const IconComponent = iconComponents[icon];
    return (
      <div className={classes.labelRoot}>
        {IconComponent ? <IconComponent color="inherit" sx={{ fontSize: 16 }} /> : null}
        <Typography variant="body2" ml={0.5} className={classes.labelTypo}>
          {index && `${index}. `}
          {name}
        </Typography>
      </div>
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
          data.Details?.map((detail) => (
            <DraggableTreeItem
              key={detail.nodeId}
              nodeId={detail.nodeId}
              label={detail.name}
              onClick={(e) => {
                e.stopPropagation(), setClickedItem(detail.nodeId);
              }}
              onDragStart={(e) => onDragStart(e, detail)}
              sx={{ backgroundColor: selectedBlock?.id === detail.nodeId ? 'wheat' : 'inherit' }}
            >
              {detail.props?.map((prop) => (
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
              ))}
            </DraggableTreeItem>
          ))
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
                      const label = `[TS${key.toString().padStart(3, '0')}] ${threatType(prop.name)} for the loss of ${prop.name} of ${
                        nodeDetail.node
                      } for Damage Scene ${detail?.id}`;

                      const Details = {
                        label,
                        type: 'default',
                        dragged: true,
                        nodeId: nodeDetail.nodeId,
                        threatId: prop.id,
                        damageId: detail?.rowId
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
              : null;
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

      <CardStyle sx={{ overflowY: 'auto', backgroundColor: color?.sidebarInnerBG }}>
        <CardContent sx={{ p: 2, color: color?.sidebarContent }}>
          <TreeView
            aria-label="file system navigator"
            expanded={clickedItem}
            onClick={handleTitleClick}
            defaultCollapseIcon={<ExpandMoreIcon sx={{ color: 'inherit' }} />}
            defaultExpandIcon={<ChevronRightIcon sx={{ color: 'inherit' }} />}
          >
            <TreeItem
              key={model?._id}
              nodeId={model?._id}
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
                  <MenuItem onClick={handleOpenSelectNode}>Components</MenuItem>
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
