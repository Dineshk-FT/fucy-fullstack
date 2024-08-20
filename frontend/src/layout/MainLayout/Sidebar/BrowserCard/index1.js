/* eslint-disable */
// material-ui
import {
  styled
  // , useTheme
} from '@mui/material/styles';
import { Card, CardContent, Menu, MenuItem, Typography } from '@mui/material';
import { TreeView } from '@mui/x-tree-view/TreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AddIcon from '@mui/icons-material/Add';
import { useEffect, useState } from 'react';
import CircleRoundedIcon from '@mui/icons-material/CircleRounded';
import AddModal from '../../../../ui-component/Modal/AddModal';
import { v4 as uid } from 'uuid';
// import { useNavigate } from 'react-router';
import {
  AttackTreePageOpen,
  DsTableOpen,
  TsTableOpen,
  closeAll,
  cyberBlockOpen,
  cyberTableOpen,
  setAttackScene,
  DerivationTableOpen
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
// import ReportIcon from '@mui/icons-material/Report';
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
import { NavLink } from 'react-router-dom';
import DraggableTreeItem from './DraggableItem';
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
  // ReportIcon,
  DangerousIcon,
  BrightnessLowIcon,
  CalendarMonthIcon,
  ReceiptItem
};

const CardStyle = styled(Card)(() =>
  // { theme }
  ({
    // background: theme.palette.primary.light,
    marginBottom: '22px',
    overflow: 'hidden',
    position: 'relative',
    height: '40vh',
    boxShadow: 'inset 0px 0px 7px gray',
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
  }
}));

const selector = (state) => ({
  addNode: state.addCyberNode,
  getModals: state.getModals,
  nodes: state.attackNodes
});
// ==============================|| SIDEBAR MENU Card ||============================== //

const BrowserCard = ({ modals }) => {
  const color = ColorTheme();
  const { addNode, getModals, nodes } = useStore(selector);
  const classes = useStyles();
  // const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isCyberBlockOpen } = useSelector((state) => state?.currentId);
  const [name, setName] = useState('');
  const [ModalDetails, setModalDetails] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openCyberModal, setOpenCyberModal] = useState(false);
  const [openAttackModal, setOpenAttackModal] = useState(false);
  const openRight = Boolean(anchorEl);

  const isDragged = nodes.some(dragCheck);
  function dragCheck(node) {
    return node.dragged;
  }

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

  const threatType = (value) => {
    // console.log('value', value)
    switch (value) {
      case 'Integrity':
        return 'Tampering';
      case 'Confidentiality':
        return 'Information Disclosure';
      case 'Availability':
        return 'Denial';
      case 'Authenticity':
        return 'Spoofing';
      case 'Authorization':
        return 'Elevation of Privilage';
      case 'Non-repudiation':
        return 'Rejection';
      default:
        return '';
    }
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
  // const [Modal,setModal] = useState([]);
  const [open, setOpen] = useState(false);

  // console.log('template', template);

  useEffect(() => {
    setModalDetails(modals);
  }, [modals]);
  // const theme = useTheme();
  const handleOpenModal = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const handleNavigate = () => {
    // navigate(`/Modals/${id}`, { replace: true });
    dispatch(closeAll());
  };
  const handleSwicthDsTable = (name) => {
    if (name.includes('Derivations')) {
      dispatch(DerivationTableOpen());
    }
    if (name.includes('Collection & Impact Ratings')) {
      dispatch(DsTableOpen());
    }
    if (name.includes('Threat')) {
      dispatch(TsTableOpen());
    }
    // if (name.includes('CyberSecurity')) {
    //   dispatch(cyberBlockOpen());
    // }
  };

  // const handleSwicthTsTable = () => {
  //     // console.log('clicked');
  // };

  const handleOpenActionTree = () => {
    dispatch(AttackTreePageOpen());
  };

  const handleAttackTree = (at_scene) => {
    // console.log('at_scene', at_scene);
    dispatch(setAttackScene(at_scene));
  };

  const handleRightClick = (e, name) => {
    // console.log('e', e);
    e.preventDefault();
    if (name.toLowerCase().includes('cybersecurity')) {
      setAnchorEl(name);
    }
  };

  const onDragStart = (event, item) => {
    // console.log('event', event);
    // console.log('item', item);
    const parseFile = JSON.stringify(item);
    event.dataTransfer.setData('application/cyber', parseFile);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleDragStart = (event, req) => {
    // Initiating drag with req data
    onDragStart(event, req);
  };
  const handleAddComponent = (name, comp) => {
    // console.log('name', name);
    // console.log('comp', comp);
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
  const handleOpenTable = (name) => {
    // console.log('name', name)
    if (name.includes('CyberSecurity Controls')) {
      dispatch(cyberTableOpen());
    }
  };

  const handleAddAttack = (e, name) => {
    e.preventDefault();
    if (name === 'Attack') {
      setOpenAttackModal(true);
      // console.log('e', e);
      // console.log('name', name);
    }
  };
  return (
    <>
      <Typography variant="h4" sx={{ color: color?.tabContentClr }}>
        Projects
      </Typography>
      <CardStyle sx={{ overflowY: 'auto', backgroundColor: color?.sidebarInnerBG }}>
        <CardContent sx={{ p: 2, color: color?.sidebarContent }}>
          <TreeView
            aria-label="file system navigator"
            defaultCollapseIcon={<ExpandMoreIcon sx={{ color: 'inherit' }} />}
            defaultExpandIcon={<ChevronRightIcon sx={{ color: 'inherit' }} />}
          >
            {ModalDetails &&
              ModalDetails?.map((modal) => {
                // console.log('item', Object.values(modal?.scenarios))
                return (
                  <TreeItem
                    key={modal?._id}
                    nodeId={modal?._id}
                    // label={getLabel('DriveFileMoveIcon', modal?.name)}
                    label={getTitleLabel('ModelIcon', modal?.name, modal?._id)}
                    // onClick={handleNavigate}
                    sx={{
                      '& .Mui-selected': {
                        backgroundColor: 'none !important'
                      }
                    }}
                  >
                    {modal?.scenarios?.map((scene) => (
                      <TreeItem
                        key={scene?.name}
                        nodeId={scene?.id}
                        // label={getLabel('FolderIcon', scene?.name)}
                        label={getImageLabel(scene?.icon, scene?.name)}
                        sx={{
                          ml: -0.8,
                          '& .MuiTreeItem-label': {
                            fontSize: '12px',
                            fontWeight: 600,
                            my: 0.2
                          }
                        }}
                      >
                        {scene?.subs
                          ? !scene?.name.includes('Attack Path') &&
                            scene?.subs?.map((sub) => (
                              <TreeItem
                                key={`1${sub?.name}`}
                                nodeId={`1${sub?.name}`} //change to id
                                //   label={sub?.name}
                                label={getLabel('TopicIcon', sub?.name)}
                                onDoubleClick={() => handleSwicthDsTable(sub?.name)}
                                onClick={() => handleOpenTable(sub?.name)}
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
                                {sub?.name === 'Damage Scenarios - Collection & Impact Ratings' &&
                                  sub?.scenes?.map((dm_scene) => {
                                    // console.log('dm_scene', dm_scene)
                                    return (
                                      <TreeItem
                                        key={dm_scene?.id}
                                        nodeId={dm_scene?.id}
                                        label={getLabel('DangerousIcon', dm_scene?.name)}
                                        //   label={dm_scene?.name}
                                      >
                                        {/* {dm_scene?.cyberLosses.map((dm) => (
                                                                                  <TreeItem
                                                                                      key={dm?.name}
                                                                                      nodeId={dm?.name}
                                                                                      label={dm?.name}
                                                                                  ></TreeItem>
                                                                              ))} */}
                                      </TreeItem>
                                    );
                                  })}
                                {sub?.name === 'Threat Scenarios' &&
                                  sub?.losses?.map((dt) =>
                                    dt?.cyberLosses?.map((pr, prin) =>
                                      pr?.props?.map((pp, pin) => {
                                        const label = `[TS00${prin}${pin}] ${threatType(pp)} for the loss of ${pp} of ${
                                          pr?.name
                                        } for Damage Scene ${dt?.id}`;
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
                                          // <TreeItem
                                          //   key={`${dt?.id}${prin}${pin}`}
                                          //   nodeId={`${dt?.id}${prin}${pin}`}
                                          //   label={`[TS00${prin}${pin}] ${threatType(pp)} for the loss of ${pp} of ${
                                          //     pr?.name
                                          //   } for Damage Scene ${dt?.id}`}
                                          //   draggable
                                          // ></TreeItem>
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
                                            onCli
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
                            ))
                          : scene?.Details?.map((value, i) => (
                              <TreeItem key={`1${i}`} nodeId={`1${i}`} label={`[000${i}] ${value?.name}`}>
                                {value?.props.map((pr) => (
                                  <TreeItem
                                    key={value?.name}
                                    nodeId={value?.name}
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
                                        {`Loss of ${pr}`}
                                      </div>
                                    }
                                  ></TreeItem>
                                ))}
                              </TreeItem>
                            ))}
                        {scene?.name === 'Attack Path Analysis and Attack Feasability Rating' &&
                          scene?.subs?.map((sub) => {
                            // console.log('sub', sub)
                            return (
                              <TreeItem
                                key={`2${sub?.name}`}
                                nodeId={`2${sub?.name}`}
                                label={getLabel('SwipeRightAltIcon', sub?.name)}
                                onDoubleClick={handleOpenActionTree}
                                onContextMenu={(e) => handleAddAttack(e, sub?.name)}
                              >
                                {sub?.scenes?.map((at_scene) => {
                                  // console.log('sub?.name', sub?.name);
                                  return sub?.name == 'Attack' ? (
                                    <DraggableTreeItem
                                      key={at_scene?.id}
                                      itemId={at_scene?.id}
                                      label={at_scene?.name}
                                      draggable={true}
                                      onDragStart={(e) => onDragStart(e, { label: at_scene?.name })}
                                    />
                                  ) : (
                                    <TreeItem
                                      key={at_scene?.id}
                                      nodeId={at_scene?.id}
                                      label={at_scene?.name}
                                      onClick={() => handleAttackTree(at_scene)}
                                    ></TreeItem>
                                  );
                                })}
                              </TreeItem>
                            );
                          })}
                      </TreeItem>
                    ))}
                  </TreeItem>
                );
              })}
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
                  top: '22rem !important',
                  left: '14rem !important'
                }
              }}
            >
              <MenuItem onClick={() => openAddModal('Goals')}>Add Goals</MenuItem>
              <MenuItem onClick={() => openAddModal('Require')}>Add Requirements</MenuItem>
            </Menu>
            <TreeItem nodeId="add" icon={<AddIcon />} onClick={handleOpenModal} label={'Add'} className={classes.labelTypo} />
          </TreeView>
        </CardContent>
      </CardStyle>
      {open && <AddModal getModals={getModals} open={open} handleClose={handleClose} />}
      <CyberSecurityModal open={openCyberModal} handleClose={handleCloseCyberModal} name={name} />
      <CommonModal open={openAttackModal} handleClose={() => setOpenAttackModal(false)} getModals={getModals} />
    </>
  );
};

export default BrowserCard;
