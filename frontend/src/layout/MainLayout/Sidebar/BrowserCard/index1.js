/* eslint-disable */
import { styled } from '@mui/material/styles';
import { Card, CardContent, ClickAwayListener, Menu, MenuItem, Paper, Popper, Typography } from '@mui/material';
import { TreeView } from '@mui/x-tree-view/TreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useEffect, useMemo, useState } from 'react';
import CircleRoundedIcon from '@mui/icons-material/CircleRounded';
import { v4 as uid } from 'uuid';
import {
  AttackTreePageOpen,
  DsTableOpen,
  TsTableOpen,
  closeAll,
  cyberBlockOpen,
  cyberTableOpen,
  setAttackScene,
  DerivationTableOpen,
  attackTableOpen,
  draweropen
} from '../../../../store/slices/CurrentIdSlice';
import { useDispatch, useSelector } from 'react-redux';
import CyberSecurityModal from '../../../../ui-component/Modal/CyberSecurityModal';
import { makeStyles } from '@mui/styles';
import BrightnessLowIcon from '@mui/icons-material/BrightnessLow';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import useStore from '../../../../Zustand/store';
import FolderIcon from '@mui/icons-material/Folder';
import DriveFileMoveIcon from '@mui/icons-material/DriveFileMove';
import TopicIcon from '@mui/icons-material/Topic';
import SwipeRightAltIcon from '@mui/icons-material/SwipeRightAlt';
import DangerousIcon from '@mui/icons-material/Dangerous';
import SecurityIcon from '@mui/icons-material/Security';
import { ReceiptItem } from 'iconsax-react';
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
import ColorTheme from '../../../../store/ColorTheme';
import { NavLink, useParams } from 'react-router-dom';
import DraggableTreeItem from './DraggableItem';
import CommonModal from '../../../../ui-component/Modal/CommonModal';
import AddNewNode from '../../../../ui-component/Modal/AddNewNode';
import SelectNodeList from '../../../../ui-component/Modal/SelectNodeList';
import { threatType } from '../../../../ui-component/Table/constraints';
import { setTitle } from '../../../../store/slices/PageSectionSlice';

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

const CardStyle = styled(Card)(() => ({
  marginBottom: '22px',
  overflow: 'hidden',
  position: 'relative',
  height: '50vh',
  boxShadow: 'inset 0px 0px 7px gray',
  '&:after': {
    content: '""',
    position: 'absolute',
    borderRadius: '50%',
    top: '-105px',
    right: '-96px'
  }
}));

const NavigationTag = styled(NavLink)(({ color }) => {
  return {
    textDecoration: 'none',
    display: 'flex',
    marginLeft: '-7px',
    color: color?.sidebarContent,

    '&.active': {
      color: 'red',
      backgroundColor: 'lightgray'
    }
  };
});

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
  }
}));

const selector = (state) => ({
  addNode: state.addCyberNode,
  getModels: state.getModels,
  getModelById: state.getModelById,
  nodes: state.nodes,
  model: state.model
});
// ==============================|| SIDEBAR MENU Card ||============================== //

const BrowserCard = ({ models }) => {
  const color = ColorTheme();
  const { id } = useParams();
  const { addNode, getModels, nodes, model, getModelById } = useStore(selector);
  const classes = useStyles();
  const dispatch = useDispatch();
  const { isCyberBlockOpen } = useSelector((state) => state?.currentId);
  const [name, setName] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [openNodelist, setOpenNodelist] = useState(false);
  const [openNewNode, setOpenNewNode] = useState(false);
  const [openCyberModal, setOpenCyberModal] = useState(false);
  const [openAttackModal, setOpenAttackModal] = useState(false);
  const [subName, setSubName] = useState('');
  // const [selectedItem, setSelectedItem] = useState({});
  const { selectedBlock } = useSelector((state) => state?.canvas);
  // const [selectedId, setSelectedId] = useState(null);
  const openRight = Boolean(anchorEl);
  const [anchorItemEl, setAnchorItemEl] = useState(null);
  const [openItemRight, setOpenItemRight] = useState(false);

  const isDragged = useMemo(() => nodes?.some(dragCheck), []);
  function dragCheck(node) {
    return node.dragged;
  }

  const handleNodes = (e, name) => {
    if (name === 'Item Definition') {
      e.preventDefault();
      // console.log('name', name);
      setAnchorItemEl(e.currentTarget);
      setOpenItemRight((prev) => !prev);
    }
  };

  // const handleOpen = (item) => {
  //   setOpen(true);
  //   setSelectedItem(item);
  // };

  // const handleClose = () => {
  //   setOpen(false);
  //   setSelectedItem({});
  // };

  const handleCloseItem = () => {
    setOpenItemRight(false);
    setAnchorItemEl(null);
  };

  useEffect(() => {
    getModelById(id);
  }, []);

  // console.log('selectedBlock', selectedBlock);
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
  const getTitleLabel = (icon, name, id) => {
    const Image = imageComponents[icon];
    return (
      <NavigationTag to={`/Models/${id}`} color={color}>
        {Image ? <img src={Image} alt={name} style={{ height: '18px', width: '18px' }} /> : null}
        <Typography variant="body2" ml={0.5} className={classes.labelTypo} color="inherit">
          {name}
        </Typography>
      </NavigationTag>
    );
  };

  const openAddModal = (name) => {
    // console.log('name', name);
    setAnchorEl(null);
    setName(name);
    setOpenCyberModal(true);
  };
  const handleCloseCyberModal = () => {
    setOpenCyberModal(false);
    setName('');
  };
  const handleCloseRight = () => {
    setAnchorEl(null);
  };

  const handleSwicthTable = (name) => {
    // console.log('name', name);
    if (name.includes('Derivations')) {
      dispatch(DerivationTableOpen());
    }
    if (name.includes('Collection & Impact Ratings')) {
      dispatch(DsTableOpen());
    }
    if (name.includes('Threat')) {
      dispatch(TsTableOpen());
      dispatch(setTitle(name));
    }
  };

  const handleOpenActionTree = (scene, sub) => {
    // console.log('scene', scene);
    // console.log('sub', sub);
    if (sub) {
      dispatch(AttackTreePageOpen());
      dispatch(setAttackScene(scene));
    }
    if (scene === 'Attack') {
      // console.log('first');
      dispatch(attackTableOpen());
    }
  };

  const handleSetAttackTreeScene = (at_scene, name) => {
    // console.log('at_scene', at_scene);
    // console.log('name', name);
    dispatch(setAttackScene(at_scene));
    if (name) {
      dispatch(AttackTreePageOpen());
    }
  };

  const handleRightClick = (e, name) => {
    // console.log('e', e);
    e.preventDefault();
    if (name.toLowerCase().includes('cybersecurity')) {
      setAnchorEl(e.currentTarget);
    }
  };

  const onDragStart = (event, item) => {
    // console.log('item', item);
    const parseFile = JSON.stringify(item);
    event.dataTransfer.setData('application/cyber', parseFile);
    event.dataTransfer.setData('application/dragItem', parseFile);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleDragStart = (event, req) => {
    // Initiating drag with req data
    onDragStart(event, req);
  };
  const handleAddComponent = (name, comp) => {
    if (isCyberBlockOpen) {
      const newNode = {
        id: uid(),
        type: `cyber_${name}`,
        position: {
          x: 100,
          y: 100
        },
        data: {
          label: comp?.name
        }
      };
      addNode(newNode);
    }
  };
  // const handleOpenTable = (name) => {
  //   // console.log('name', name)
  //   if (name.includes('CyberSecurity Controls')) {
  //     dispatch(cyberTableOpen());
  //   }
  // };

  const handleContext = (e, name) => {
    e.preventDefault();
    if (name === 'Attack' || name === 'Attack Trees') {
      setOpenAttackModal(true);
      setSubName(name);
    }
  };

  const handleAttackTreeClose = () => {
    setName('');
    setOpenAttackModal(false);
  };

  const handleAddNewNode = () => {
    dispatch(draweropen());
    // setOpenNewNode(true);
    setOpenItemRight(false);
  };

  const handleOpenSelectNode = () => {
    setOpenNodelist(true);
    setOpenItemRight(false);
  };

  return (
    <>
      <CardStyle
        sx={{
          overflowY: 'auto',
          backgroundColor: color?.sidebarInnerBG,
          borderRadius: 1,
          paddingY: 0,
          '&::-webkit-scrollbar': {
            width: '4px'
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '10px'
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(0, 0, 0, 0.1)'
          }
        }}
      >
        <CardContent sx={{ p: 2, color: color?.sidebarContent }}>
          <TreeView
            aria-label="file system navigator"
            defaultCollapseIcon={<ExpandMoreIcon sx={{ color: 'inherit' }} />}
            defaultExpandIcon={<ChevronRightIcon sx={{ color: 'inherit' }} />}
            sx={{
              '& .MuiTreeItem-root': { paddingY: 0.3 },
              '& .MuiTreeItem-label': { color: color?.sidebarContent },
              '& .css-i3pm3h-MuiTypography-root': { fontSize: 15, color: 'blue' },
              '& .css-170gy1o.active': { backgroundColor: 'rgba(33, 150, 243, 0.08)' },
              '& .css-6f3abp.active': { backgroundColor: 'rgba(33, 150, 243, 0.08)' }
            }}
          >
            <TreeItem
              key={model?._id}
              nodeId={model?._id}
              // label={getLabel('DriveFileMoveIcon', modal?.name)}
              label={getTitleLabel('ModelIcon', model?.name, model?._id)}
              // onClick={handleNavigate}
              sx={{
                '& .Mui-selected': {
                  backgroundColor: `${color?.highlight} !important`,
                  borderRadius: 1
                },
                '& .css-y33nt-MuiTypography-root': {
                  fontSize: '12px',
                  fontWeight: 500,
                  paddingY: 0.4,
                  color: color?.sidebarContent
                }
              }}
            >
              {model?.scenarios?.map((scene) => (
                <TreeItem
                  key={scene?.name}
                  nodeId={scene?.id}
                  // label={getLabel('FolderIcon', scene?.name)}
                  label={getImageLabel(scene?.icon, scene?.name)}
                  onContextMenu={(e) => handleNodes(e, scene?.name)}
                  sx={{
                    '& .MuiTreeItem-label': {
                      fontSize: '12px',
                      fontWeight: 500,
                      color: color?.sidebarContent
                    }
                  }}
                >
                  {scene?.subs &&
                    !scene?.name.includes('Attack Path') &&
                    scene?.subs?.map((sub) => (
                      <TreeItem
                        key={`1${sub?.name}`}
                        nodeId={`1${sub?.name}`} //change to id
                        //   label={sub?.name}
                        label={getLabel('TopicIcon', sub?.name)}
                        onClick={() => handleSwicthTable(sub?.name)} //change to onClick
                        sx={{ paddingY: 0.5, paddingLeft: 1 }}
                      >
                        {sub?.name === 'Damage Scenarios Derivations' &&
                          sub?.Details?.map((ls) => (
                            <TreeItem
                              key={ls?.id}
                              nodeId={ls.id}
                              label={`[${ls?.id}] ${ls?.name}`}
                              sx={{
                                ml: -2
                              }}
                            ></TreeItem>
                          ))}
                        {sub?.name === 'Damage Scenarios - Impact Ratings' &&
                          sub?.scenes?.map((dm_scene) => {
                            // console.log('dm_scene', dm_scene)
                            return (
                              <TreeItem
                                key={dm_scene?.id}
                                nodeId={dm_scene?.id}
                                label={getLabel('DangerousIcon', dm_scene?.Name)}
                                //   label={dm_scene?.name}
                              ></TreeItem>
                            );
                          })}
                        {sub?.name === 'Threat Scenarios' &&
                          sub?.losses?.map((dt) =>
                            dt?.cyberLosses?.map((pr, prin) =>
                              pr?.props?.map((pp, pin) => {
                                // console.log('pr', dt);
                                const label = `[TS00${prin}${pin}] ${threatType(pp)} for the loss of ${pp} of ${
                                  pr?.name
                                } for Damage Scene ${dt?.ID}`;
                                const Details = {
                                  label: label,
                                  type: 'default',
                                  dragged: true
                                };
                                return (
                                  <DraggableTreeItem
                                    draggable={!isDragged}
                                    key={`${dt?.id}${prin}${pin}`}
                                    nodeId={`${dt?.id}${prin}${pin}`}
                                    label={label}
                                    onDragStart={(e) => onDragStart(e, Details)}
                                  />
                                );
                              })
                            )
                          )}
                        {sub?.name === 'CyberSecurity Goals and Requirements' &&
                          sub?.subs?.map((s_sub) => (
                            <TreeItem
                              key={s_sub?.id}
                              nodeId={s_sub?.id}
                              label={s_sub?.name}
                              onContextMenu={(e) => handleRightClick(e, s_sub?.name)}
                            >
                              {s_sub?.name === 'CyberSecurity Goals' &&
                                s_sub.scenes.map((sce) => (
                                  <TreeItem
                                    key={sce?.id}
                                    nodeId={sce?.id}
                                    label={getLabel('BrightnessLowIcon', sce?.name)}
                                    onClick={() => handleAddComponent('goal', sce)}
                                    onDragStart={() => handleDragStart(e, sce)}
                                  ></TreeItem>
                                ))}
                              {s_sub?.name === 'CyberSecurity Requirements' &&
                                s_sub.scenes.map((sce) => (
                                  <TreeItem
                                    key={sce?.id}
                                    nodeId={sce?.id}
                                    label={getLabel('CalendarMonthIcon', sce?.name)}
                                    onClick={() => handleAddComponent('require', sce)}
                                    onDragStart={() => handleDragStart(e, sce)}
                                  ></TreeItem>
                                ))}
                            </TreeItem>
                          ))}

                        {sub?.name === 'Derived Threat Scenarios' &&
                          sub?.scenes?.map((th_scene, i) => {
                            return (
                              <TreeItem
                                key={`${th_scene?.id}${i}`}
                                nodeId={`${th_scene?.id}${i}`}
                                label={getLabel('ReportIcon', th_scene?.name)}
                              ></TreeItem>
                            );
                          })}
                        {sub?.name === 'CyberSecurity Controls' &&
                          sub?.scenes?.map((th_scene) => {
                            return (
                              <TreeItem
                                key={th_scene?.id}
                                nodeId={th_scene?.id}
                                //   label={th_scene?.name}
                                label={getLabel('SecurityIcon', th_scene?.name)}
                              ></TreeItem>
                            );
                          })}
                      </TreeItem>
                    ))}
                  {scene?.name === 'Item Definition' &&
                    scene?.Details?.map((value, i) => (
                      <DraggableTreeItem
                        key={`1${i}`}
                        nodeId={`1${i}`}
                        label={`[000${i}] ${value?.name}`}
                        onDragStart={(e) => onDragStart(e, value)}
                        sx={{ backgroundColor: selectedBlock?.id === value?.nodeId ? 'wheat' : 'inherit' }}
                      >
                        {value?.props.map((pr) => {
                          // console.log('pr', pr);
                          const Details = {
                            label: `Loss of ${pr.name} of ${value?.name}`,
                            type: 'attack_tree_node',
                            dragged: true
                          };
                          return (
                            <DraggableTreeItem
                              key={pr?.id}
                              nodeId={pr?.id}
                              onDragStart={(e) => onDragStart(e, Details)}
                              label={
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    marginLeft: '-31px',
                                    gap: 2
                                  }}
                                >
                                  <CircleRoundedIcon sx={{ color: 'red', fontSize: 13 }} />
                                  {`Loss of ${pr.name}`}
                                </div>
                              }
                            ></DraggableTreeItem>
                          );
                        })}
                      </DraggableTreeItem>
                    ))}
                  {scene?.name === 'Attack Path Analysis' &&
                    scene?.subs?.map((sub) => {
                      // console.log('sub', sub.scenes);
                      return (
                        <TreeItem
                          key={`2${sub?.name}`}
                          nodeId={`2${sub?.name}`}
                          label={getLabel('SwipeRightAltIcon', sub?.name)}
                          onClick={() => handleOpenActionTree(sub?.name)}
                          onContextMenu={(e) => handleContext(e, sub?.name)}
                        >
                          {sub?.scenes?.map((at_scene) => {
                            // console.log('sub?.name', sub?.name);
                            // console.log('at_scene', at_scene);
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
                                label={at_scene?.Name}
                                draggable={true}
                                onDragStart={(e) => onDragStart(e, Details)}
                              />
                            ) : (
                              <TreeItem
                                key={at_scene?.ID}
                                nodeId={at_scene?.ID}
                                label={at_scene?.Name}
                                // onDoubleClick={() => handleOpenActionTree(at_scene, sub?.name)}
                                onClick={() => handleSetAttackTreeScene(at_scene, sub?.name)}
                              ></TreeItem>
                            );
                          })}
                        </TreeItem>
                      );
                    })}
                </TreeItem>
              ))}
            </TreeItem>

            <Menu
              id="basic-menu"
              anchorEl={anchorEl}
              open={openRight}
              onClose={handleCloseRight}
              MenuListProps={{
                'aria-labelledby': 'basic-button'
              }}
              sx={{
                '& .MuiPaper-root': {
                  backgroundColor: color?.menuBG,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  borderRadius: 1
                }
              }}
            >
              <MenuItem onClick={() => openAddModal('Goals')}>Add Goals</MenuItem>
              <MenuItem onClick={() => openAddModal('Require')}>Add Requirements</MenuItem>
            </Menu>
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

      <CyberSecurityModal open={openCyberModal} handleClose={handleCloseCyberModal} name={name} />
      <CommonModal open={openAttackModal} handleClose={handleAttackTreeClose} getModels={getModels} name={subName} />
      {/* {openNewNode && (
        <AddNewNode
          open={openNewNode}
          handleClose={() => setOpenNewNode(false)}
          selectedItem={selectedItem}
          model={model}
          // id={selectedId}
        />
      )} */}
      <SelectNodeList open={openNodelist} handleClose={() => setOpenNodelist(false)} />
    </>
  );
};

export default BrowserCard;
