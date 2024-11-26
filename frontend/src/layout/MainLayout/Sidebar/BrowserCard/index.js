/*eslint-disable*/
import React, { useMemo } from 'react';
import { styled } from '@mui/material/styles';
import { Box, Card, CardContent, ClickAwayListener, MenuItem, Paper, Popper, Typography } from '@mui/material';
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
  TsTableOpen
} from '../../../../store/slices/CurrentIdSlice';
import { setTitle } from '../../../../store/slices/PageSectionSlice';
import { threatType } from '../../../../ui-component/Table/constraints';
import SelectNodeList from '../../../../ui-component/Modal/SelectNodeList';
import { openAddNodeTab } from '../../../../store/slices/CanvasSlice';
import CommonModal from '../../../../ui-component/Modal/CommonModal';

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

const CardStyle = styled(Card)(() =>
  // { theme }
  ({
    // background: theme.palette.primary.light,
    marginBottom: '22px',
    overflow: 'hidden',
    position: 'relative',
    height: '80vh',
    // boxShadow: 'inset 0px 0px 7px gray',
    border: '1px solid gray',
    borderRadius: '0px',
    '&:after': {
      content: '""',
      position: 'absolute',
      // width: '157px',
      // height: '157px',
      // background: theme.palette.primary[200],
      borderRadius: '50%',
      top: '-105px',
      right: '-96px'
    }
  })
);

const selector = (state) => ({
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
  cybersecurity: state.cybersecurity,
  systemDesign: state.systemDesign,
  catalog: state.catalog,
  riskTreatment: state.riskTreatment,
  documents: state.documents,
  reports: state.reports,
  layouts: state.layouts,
  clickedItem: state.clickedItem,
  setClickedItem: state.setClickedItem
});

// ==============================|| SIDEBAR MENU Card ||============================== //

const BrowserCard = () => {
  const color = ColorTheme();
  const classes = useStyles();
  const dispatch = useDispatch();
  const {
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
    attackScenarios,
    cybersecurity,
    systemDesign,
    catalog,
    riskTreatment,
    documents,
    reports,
    layouts,
    clickedItem,
    setClickedItem
  } = useStore(selector);
  const { modelId } = useSelector((state) => state?.pageName);
  const { selectedBlock } = useSelector((state) => state?.canvas);
  const [anchorItemEl, setAnchorItemEl] = useState(null);
  const [openItemRight, setOpenItemRight] = useState(false);
  const [openNodelist, setOpenNodelist] = useState(false);
  const [openAttackModal, setOpenAttackModal] = useState(false);
  const [subName, setSubName] = useState('');

  useEffect(() => {
    getModelById(modelId);
    setClickedItem(modelId);
  }, [modelId]);

  const scenarios = [
    { name: 'assets', scene: assets },
    { name: 'damageScenarios', scene: damageScenarios },
    { name: 'threatScenarios', scene: threatScenarios },
    { name: 'attackScenarios', scene: attackScenarios },
    { name: 'cybersecurity', scene: cybersecurity },
    { name: 'systemDesign', scene: systemDesign },
    { name: 'catalog', scene: catalog },
    { name: 'riskTreatment', scene: riskTreatment },
    { name: 'documents', scene: documents },
    { name: 'reports', scene: reports },
    { name: 'layouts', scene: layouts }
  ];

  // const handleNodeToggle = (event, nodeIds) => {
  //   console.log('Expanded/collapsed:', nodeIds);
  //   // Handle expand/collapse logic here
  // };

  const handleTitleClick = (event) => {
    event.stopPropagation(); // Prevent propagation
    setClickedItem(modelId);
  };
  // console.log('attackScenarios', attackScenarios);

  const handleClick = async (event, ModelId, name, id) => {
    event.stopPropagation();
    setClickedItem(id);
    if (name === 'assets') {
      dispatch(closeAll());
    }
    const get_api = {
      assets: getAssets,
      damage: getDamageScenarios,
      threat: getThreatScenario,
      attack: getAttackScenario
    };
    await get_api[name](ModelId);
  };

  const handleOpenTable = (e, id, name) => {
    e.stopPropagation();
    setClickedItem(id);
    switch (true) {
      case name.includes('Derivations'):
        dispatch(DerivationTableOpen());
        break;
      case name.includes('Collection & Impact Ratings'):
        dispatch(DsTableOpen());
        break;
      case name.includes('Threat'):
        dispatch(TsTableOpen());
        dispatch(setTitle(name));
        break;
      case name === 'Attack':
        dispatch(attackTableOpen());
        break;
      default:
        break;
    }
  };

  const handleOpenAttackTree = (e, scene, name) => {
    e.stopPropagation();
    // console.log('scene', scene);
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

  const handleCloseItem = () => {
    setOpenItemRight(false);
    setAnchorItemEl(null);
  };

  const handleAddNewNode = (e) => {
    // dispatch(drawerOpen());
    e.stopPropagation();
    dispatch(openAddNodeTab());
    setOpenItemRight(false);
  };

  const handleOpenSelectNode = (e) => {
    e.stopPropagation();
    setOpenNodelist(true);
    setOpenItemRight(false);
  };
  // console.log('damageScenarios', damageScenarios);
  // console.log('threatScenarios', threatScenarios.subs[0].Details);
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
    // console.log('item', item);
    const parseFile = JSON.stringify(item);
    event.dataTransfer.setData('application/cyber', parseFile);
    event.dataTransfer.setData('application/dragItem', parseFile);
    event.dataTransfer.effectAllowed = 'move';
  };

  const isDragged = useMemo(() => nodes?.some(dragCheck), [nodes?.length]);
  function dragCheck(node) {
    return node?.dragged;
  }

  // console.log('assets', assets);

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
  const getLabel = (icon, name) => {
    const IconComponent = iconComponents[icon];
    return (
      <div className={classes.labelRoot}>
        {IconComponent ? <IconComponent color="inherit" sx={{ fontSize: 16 }} /> : null}
        <Typography variant="body2" ml={0.5} className={classes.labelTypo}>
          {name}
        </Typography>
      </div>
    );
  };

  // console.log('assets', assets);

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
              onDragStart={(e) => onDragStart(e, detail)}
              sx={{ backgroundColor: selectedBlock?.id === detail.nodeId ? 'wheat' : 'inherit' }}
            >
              {detail.props?.map((prop) => (
                <DraggableTreeItem
                  key={prop.id}
                  nodeId={prop.id}
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
            if (sub.name === 'Damage Scenarios Derivations') {
              return sub.Derivations?.map((derivation) => (
                <TreeItem key={derivation.id} nodeId={derivation.id} label={getLabel('TopicIcon', derivation.name)} />
              ));
            }
            if (sub.name === 'Damage Scenarios - Collection & Impact Ratings') {
              return sub.Details?.map((detail) => (
                <TreeItem key={detail._id} nodeId={detail._id} label={getLabel('DangerousIcon', detail.Name)} />
              ));
            }
          })
        );

      case 'threatScenarios':
        return renderTreeItem(
          data,
          (e) => handleClick(e, model?._id, 'threat', data.id),
          null,
          renderSubItems(data.subs, handleOpenTable, null, (sub) =>
            sub.name === 'Threat Scenarios'
              ? sub.Details?.flatMap((detail) =>
                  detail.Details?.flatMap((nodeDetail) =>
                    nodeDetail.props?.map((prop) => {
                      const label = `[${prop.id.slice(0, 6)}] ${threatType(prop.name)} for the loss of ${prop.name} of ${
                        nodeDetail.node
                      } for Damage Scene ${nodeDetail.nodeId.slice(0, 6)}`;
                      const Details = { label, type: 'default', dragged: true };

                      return (
                        <DraggableTreeItem
                          draggable={!isDragged}
                          key={prop.id}
                          nodeId={prop.id}
                          label={getLabel('TopicIcon', label)}
                          onDragStart={(e) => onDragStart(e, Details)}
                        />
                      );
                    })
                  )
                )
              : null
          )
        );

      case 'attackScenarios':
        return renderTreeItem(
          data,
          (e) => handleClick(e, model?._id, 'attack', data.id),
          null,
          renderSubItems(data.subs, handleOpenTable, handleContext, (sub) =>
            sub.scenes?.map((at_scene) => {
              const Details = { label: at_scene.Name, nodeId: at_scene.ID, type: 'Event', dragged: true };

              return sub.name === 'Attack' ? (
                <DraggableTreeItem
                  key={at_scene.ID}
                  nodeId={at_scene.ID}
                  label={getLabel('DangerousIcon', at_scene.Name)}
                  draggable
                  onDragStart={(e) => onDragStart(e, Details)}
                />
              ) : (
                <TreeItem
                  key={at_scene.ID}
                  nodeId={at_scene.ID}
                  label={getLabel('DangerousIcon', at_scene.Name)}
                  onClick={(e) => handleOpenAttackTree(e, at_scene, sub.name)}
                />
              );
            })
          )
        );

      default:
        return renderTreeItem(
          data,
          (e) => handleClick(e, model?._id, data.name, data.id),
          null,
          renderSubItems(data.subs, handleOpenTable, null, (sub) =>
            sub.Details?.map((detail) => <TreeItem key={detail._id} nodeId={detail._id} label={getLabel('DangerousIcon', detail.name)} />)
          )
        );
    }
  };

  return (
    <>
      {/* <Typography variant="h4" sx={{ color: color?.tabContentClr }}>
        Projects
      </Typography> */}
      <CardStyle sx={{ overflowY: 'auto', backgroundColor: color?.sidebarInnerBG }}>
        <CardContent sx={{ p: 2, color: color?.sidebarContent }}>
          <TreeView
            aria-label="file system navigator"
            expanded={clickedItem}
            // onNodeToggle={handleNodeToggle}
            onClick={handleTitleClick}
            defaultCollapseIcon={<ExpandMoreIcon sx={{ color: 'inherit' }} />}
            defaultExpandIcon={<ChevronRightIcon sx={{ color: 'inherit' }} />}
          >
            <TreeItem
              key={model?._id}
              nodeId={model?._id}
              label={getTitleLabel('ModelIcon', model?.name, model?._id)}
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
                    offset: [-10, -50] // Adjust these values as needed
                  }
                }
              ]}
            >
              <ClickAwayListener onClickAway={handleCloseItem}>
                <Paper className={classes.paper}>
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
