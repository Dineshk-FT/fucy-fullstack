/*eslint-disable*/
import React from 'react';
import { styled } from '@mui/material/styles';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import CircleRoundedIcon from '@mui/icons-material/CircleRounded';
import AddModal from '../../../../ui-component/Modal/AddModal';
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
import DraggableTreeItem from './DraggableItem';
import { DerivationTableOpen, DsTableOpen, TsTableOpen } from '../../../../store/slices/CurrentIdSlice';
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

const selector = (state) => ({
  addNode: state.addCyberNode,
  getModels: state.getModels,
  getModelById: state.getModelById,
  nodes: state.nodes,
  model: state.model,
  getSidebarNode: state.getSidebarNode,
  assets: state.assets,
  damageScenarios: state.damageScenarios,
  threatScenarios: state.threatScenarios,
  getAssets: state.getAssets,
  getThreatScenario: state.getThreatScenario,
  getDamageScenarios: state.getDamageScenarios
});

// ==============================|| SIDEBAR MENU Card ||============================== //

const BrowserCard = () => {
  const color = ColorTheme();
  const classes = useStyles();
  const dispatch = useDispatch();
  const {
    addNode,
    getModels,
    nodes,
    model,
    getModelById,
    getSidebarNode,
    assets,
    damageScenarios,
    threatScenarios,
    getAssets,
    getDamageScenarios,
    getThreatScenario
  } = useStore(selector);
  const { modelId } = useSelector((state) => state?.pageName);
  const { selectedBlock } = useSelector((state) => state?.canvas);

  const handleClick = async (id, name) => {
    const get_api = {
      assets: getAssets,
      damage: getDamageScenarios,
      threat: getThreatScenario
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
      default:
        break;
    }
  };

  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  // console.log('damageScenarios', damageScenarios);
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

  // console.log('assets', assets);
  useEffect(() => {
    getModelById(modelId);
  }, [modelId]);
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
            <TreeItem
              key={model?._id}
              nodeId={model?._id}
              // label={getLabel('DriveFileMoveIcon', modal?.name)}
              label={getTitleLabel('ModelIcon', model?.name, model?._id)}
              // onClick={handleNavigate}
              sx={{
                '& .Mui-selected': {
                  backgroundColor: 'none !important'
                }
              }}
            >
              <TreeItem
                key={assets?.id}
                nodeId={assets?.id}
                label={assets?.name}
                onClick={() => handleClick(model?._id, 'assets')}
                // onDragStart={(e) => onDragStart(e, assets)}
              >
                {assets?.Details &&
                  assets?.Details.map((detail) => (
                    <DraggableTreeItem
                      key={detail?.nodeId}
                      nodeId={detail?.nodeId}
                      label={detail?.name}
                      onDragStart={(e) => onDragStart(e, detail)}
                      sx={{ backgroundColor: selectedBlock?.id === detail?.nodeId ? 'wheat' : 'inherit' }}
                    >
                      {detail?.props.map((pr) => {
                        // console.log('pr', pr);
                        const Details = {
                          label: `Loss of ${pr.name} of ${detail?.name}`,
                          type: 'attack_tree_node',
                          dragged: true
                        };
                        return (
                          <DraggableTreeItem
                            key={pr?.id}
                            nodeId={pr?.id}
                            // onDragStart={(e) => onDragStart(e, Details)}
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
              </TreeItem>
              <TreeItem
                key={damageScenarios?.id}
                nodeId={damageScenarios?.id}
                label={damageScenarios?.name}
                onClick={() => handleClick(model?._id, 'damage')}
                sx={{
                  ml: -2
                }}
              >
                {damageScenarios?.subs?.map((sub) => (
                  <TreeItem
                    key={sub?._id}
                    nodeId={sub._id}
                    label={sub?.name}
                    onClick={() => handleOpenTable(sub?.name)}
                    sx={{
                      ml: -2
                    }}
                  >
                    {sub.name === 'Damage Scenarios Derivations' &&
                      sub?.Derivations &&
                      sub?.Derivations.map((derivation) => (
                        <TreeItem
                          key={derivation?._id}
                          nodeId={derivation._id}
                          label={derivation?.name}
                          sx={{
                            ml: -2
                          }}
                        ></TreeItem>
                      ))}
                    {sub.name === 'Damage Scenarios - Collection & Impact Ratings' &&
                      sub?.Details &&
                      sub?.Details.map((detail) => (
                        <TreeItem
                          key={detail?._id}
                          nodeId={detail._id}
                          label={detail?.Name}
                          sx={{
                            ml: -2
                          }}
                        ></TreeItem>
                      ))}
                  </TreeItem>
                ))}
              </TreeItem>
              <TreeItem
                key={threatScenarios?.id}
                nodeId={threatScenarios?.id}
                label={threatScenarios?.name}
                onClick={() => handleClick(model?._id, 'threat')}
                sx={{
                  ml: -2
                }}
              >
                {/* {.map((ls) => (
                            <TreeItem
                              key={ls?.id}
                              nodeId={ls.id}
                              label={`[${ls?.id}] ${ls?.name}`}
                              sx={{
                                ml: -2
                              }}
                            ></TreeItem>
                          ))} */}
              </TreeItem>
            </TreeItem>
          </TreeView>
        </CardContent>
      </CardStyle>
      {open && <AddModal open={open} handleClose={handleClose} />}
    </>
  );
};

export default BrowserCard;
