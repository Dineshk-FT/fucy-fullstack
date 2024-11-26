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
    alignItems: 'center'
  }
}));

const CardStyle = styled(Card)(() =>
  // { theme }
  ({
    // background: theme.palette.primary.light,
    marginBottom: '22px',
    overflow: 'hidden',
    position: 'relative',
    height: '70vh',
    // boxShadow: 'inset 0px 0px 7px gray',
    border: '1px solid gray',
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
  layouts: state.layouts
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
    layouts
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

  // console.log('attackScenarios', attackScenarios);

  const handleClick = async (id, name) => {
    if (name === 'assets') {
      dispatch(closeAll());
    }
    const get_api = {
      assets: getAssets,
      damage: getDamageScenarios,
      threat: getThreatScenario,
      attack: getAttackScenario
    };
    await get_api[name](id);
  };

  const handleOpenTable = (name) => {
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

  const handleOpenAttackTree = (scene, name) => {
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

  const handleAddNewNode = () => {
    // dispatch(drawerOpen());
    dispatch(openAddNodeTab());
    setOpenItemRight(false);
  };

  const handleOpenSelectNode = () => {
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

  console.log('assets', assets);

  const getTitleLabel = (icon, name, id) => {
    const Image = imageComponents[icon];
    return (
      <Box color={color?.sidebarContent} className={classes.title}>
        {Image ? <img src={Image} alt={name} style={{ height: '18px', width: '18px' }} /> : null}
        <Typography variant="body2" ml={0.5} mt={0.5} className={classes.labelTypo} color="inherit">
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

  const renderTreeItems = (data, type) => {
    if (!data) return null;

    switch (type) {
      case 'assets':
        return (
          <TreeItem
            key={data.id}
            nodeId={data.id}
            label={getImageLabel(data.icon, data.name)}
            onClick={() => handleClick(model?._id, 'assets')}
            onContextMenu={handleNodes}
            sx={{ ml: -1 }}
          >
            {data.Details?.map((detail) => (
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
            ))}
          </TreeItem>
        );

      case 'damageScenarios':
        return (
          <TreeItem
            key={data.id}
            nodeId={data.id}
            label={getImageLabel(data.icon, data.name)}
            onClick={() => handleClick(model?._id, 'damage')}
            sx={{ ml: -1 }}
          >
            {data.subs?.map((sub) => (
              <TreeItem key={sub._id} nodeId={sub._id} label={getLabel('TopicIcon', sub.name)} onClick={() => handleOpenTable(sub.name)}>
                {sub.name === 'Damage Scenarios Derivations' &&
                  sub.Derivations?.map((derivation) => (
                    <TreeItem key={derivation.id} nodeId={derivation.id} label={getLabel('TopicIcon', derivation.name)} />
                  ))}
                {sub.name === 'Damage Scenarios - Collection & Impact Ratings' &&
                  sub.Details?.map((detail) => (
                    <TreeItem key={detail._id} nodeId={detail._id} label={getLabel('DangerousIcon', detail.Name)} />
                  ))}
              </TreeItem>
            ))}
          </TreeItem>
        );

      case 'threatScenarios':
        return (
          <TreeItem
            key={data.id}
            nodeId={data.id}
            label={getImageLabel(data.icon, data.name)}
            onClick={() => handleClick(model?._id, 'threat')}
            sx={{ ml: -1 }}
          >
            {data.subs?.map((sub) => (
              <TreeItem key={sub._id} nodeId={sub._id} label={getLabel('TopicIcon', sub.name)} onClick={() => handleOpenTable(sub.name)}>
                {sub.name === 'Threat Scenarios' &&
                  sub.Details?.map((detail) =>
                    detail.Details?.map((nodeDetail) =>
                      nodeDetail.props?.map((prop) => {
                        const label = `[${prop.id.slice(0, 6)}] ${threatType(prop.name)} for the loss of ${prop.name} of ${
                          nodeDetail.node
                        } for Damage Scene ${nodeDetail.nodeId.slice(0, 6)}`;

                        const Details = {
                          label: label,
                          type: 'default',
                          dragged: true
                        };
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
                  )}
              </TreeItem>
            ))}
          </TreeItem>
        );
      case 'attackScenarios':
        return (
          <TreeItem
            key={data.id}
            nodeId={data.id}
            label={getImageLabel(data.icon, data.name)}
            onClick={() => handleClick(model?._id, 'attack')}
            sx={{ ml: -1 }}
          >
            {data?.subs?.map((sub) => (
              <TreeItem
                key={sub._id || sub?.id}
                nodeId={sub._id || sub?.id}
                label={getLabel('TopicIcon', sub.name)}
                onClick={() => handleOpenTable(sub.name)}
                onContextMenu={(e) => handleContext(e, sub?.name)}
              >
                {/* {sub?.scenes?.map((detail) => (
                  <TreeItem
                    key={detail.ID}
                    nodeId={detail.ID}
                    onClick={() => handleOpenAttackTree(detail, sub?.name)}
                    label={getLabel('DangerousIcon', detail.Name)}
                  />
                ))} */}
                {sub?.scenes?.map((at_scene) => {
                  const Details = {
                    label: at_scene?.Name,
                    nodeId: at_scene?.ID,
                    type: 'Event',
                    dragged: true
                  };
                  return sub?.name == 'Attack' ? (
                    <DraggableTreeItem
                      key={at_scene?.ID}
                      nodeId={at_scene?.ID}
                      label={getLabel('DangerousIcon', at_scene?.Name)}
                      draggable={true}
                      onDragStart={(e) => onDragStart(e, Details)}
                    />
                  ) : (
                    <TreeItem
                      key={at_scene?.ID}
                      nodeId={at_scene?.ID}
                      label={getLabel('DangerousIcon', at_scene?.Name)}
                      // onDoubleClick={() => handleOpenActionTree(at_scene, sub?.name)}
                      onClick={() => handleOpenAttackTree(at_scene, sub?.name)}
                    ></TreeItem>
                  );
                })}
              </TreeItem>
            ))}
          </TreeItem>
        );

      default:
        return (
          <TreeItem
            key={data.id}
            nodeId={data.id}
            label={getImageLabel(data.icon, data.name)}
            onClick={() => handleClick(model?._id, data.name)}
            sx={{ ml: -1 }}
          >
            {data?.subs?.map((sub) => (
              <TreeItem
                key={sub._id || sub?.id}
                nodeId={sub._id || sub?.id}
                label={getLabel('TopicIcon', sub.name)}
                onClick={() => handleOpenTable(sub.name)}
              >
                {sub?.Details?.map((detail) => (
                  <TreeItem key={detail._id} nodeId={detail._id} label={getLabel('DangerousIcon', detail.name)} />
                ))}
              </TreeItem>
            ))}
          </TreeItem>
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
