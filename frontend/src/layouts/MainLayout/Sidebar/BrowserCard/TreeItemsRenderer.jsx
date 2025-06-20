/*eslint-disable*/
import React, { useCallback, useEffect, useState } from 'react';
import DraggableTreeItem from './DraggableItem';
import { TreeItem } from '@mui/x-tree-view';
import { Avatar, Box, Tooltip, Typography } from '@mui/material';
import ControlPointIcon from '@mui/icons-material/ControlPoint';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditName from './EditName';
import { useDispatch, useSelector } from 'react-redux';
import useStore from '../../../../store/Zustand/store';
import { setAnchorEl, setDetails, setSelectedBlock, setEdgeDetails } from '../../../../store/slices/CanvasSlice';
import { shallow } from 'zustand/shallow';
import { getNodeDetails } from '../../../../utils/Constraints';
import {
  ConfidentialityIcon,
  IntegrityIcon,
  AuthenticityIcon,
  AuthorizationIcon,
  Non_repudiationIcon,
  AvailabilityIcon
} from '../../../../assets/icons';
import { drawerWidth } from '../../../../themes/constant';
import { threatType } from '../../../../components/Table/constraints';

const Properties = {
  Confidentiality: ConfidentialityIcon,
  Integrity: IntegrityIcon,
  Authenticity: AuthenticityIcon,
  Authorization: AuthorizationIcon,
  'Non-repudiation': Non_repudiationIcon,
  Availability: AvailabilityIcon
};

const selector = (state) => ({
  model: state.model,
  setNodes: state.setNodes,
  nodes: state.initialNodes,
  edges: state.edges,
  setSelectedThreatIds: state.setSelectedThreatIds
});

const TreeItemsRenderer = ({
  data,
  type,
  getLabel,
  getImageLabel,
  setClickedItem,
  classes,
  handleOpenTable,
  handleContext,
  handleOpenDeleteModal,
  handleOpenAttackTree,
  handleClick,
  handleSave
}) => {
  const dispatch = useDispatch();
  const [hovered, setHovered] = useState({
    node: false,
    data: false,
    attack: false,
    attack_rees: false,
    id: ''
  });
  const { model, setNodes, nodes, edges, setSelectedThreatIds } = useStore(selector, shallow);
  const [count, setCount] = useState({
    node: 1,
    data: 1
  });

  const { selectedBlock, drawerwidthChange } = useSelector((state) => state?.canvas);
  const onDragStart = (event, item) => {
    const parseFile = JSON.stringify(item);
    event.dataTransfer.setData('application/cyber', parseFile);
    event.dataTransfer.setData('application/dragItem', parseFile);
    event.dataTransfer.effectAllowed = 'move';
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
  const handleNodes = (e) => {
    e.preventDefault();
  };

  const handleAddNode = (type) => (e) => {
    e.stopPropagation();
    const nodeName = type === 'default' ? 'Node' : 'Data';
    const nodeType = type === 'data' ? 'data' : 'node';

    const nodeDetail = getNodeDetails(type, nodeName, count[nodeType]);
    setNodes([...nodes, nodeDetail]);
    setCount((prev) => ({ ...prev, [nodeType]: prev[nodeType] + 1 }));
  };

  const handleTreeItemClick = useCallback((e, handler, ...args) => {
    const isExpandIcon = e.target.closest('.MuiTreeItem-iconContainer') !== null;
    if (isExpandIcon) {
      e.stopPropagation();
      return;
    }
    handler?.(e, ...args);
  }, []);

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
          onClick={(e) => {
            setClickedItem(sub.id);
            handleTreeItemClick(e, handleOpenTable, sub.id, sub.name);
          }}
          // onContextMenu={(e) => contextMenuHandler && contextMenuHandler(e, sub.name)}
        >
          {additionalMapping && additionalMapping(sub)}
        </TreeItem>
      ) : (
        <TreeItem
          key={sub.id}
          nodeId={sub.id}
          label={getLabel('TopicIcon', sub.name, null, sub.id)}
          onClick={(e) => {
            setClickedItem(sub.id);
            handleTreeItemClick(e, handleOpenTable, sub.id, sub.name);
          }}
          onContextMenu={(e) => handleTreeItemClick(e, contextMenuHandler, sub.name)}
        >
          {additionalMapping && additionalMapping(sub)}
        </TreeItem>
      )
    );
  };

  const renderTreeItems = () => {
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
                        <Tooltip title={detail?.name} disableHoverListener={drawerwidthChange >= drawerWidth}>
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
            if (sub.name === 'Damage Scenarios (DS) Derivations') {
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
                        nodeId: nodeDetail?.nodeId,
                        extraProps: {
                          threatId: prop?.id,
                          damageId: detail?.rowId,
                          width: 150,
                          height: 60,
                          key: `TS${key.toString().padStart(3, '0')}`
                        }
                      };
                    })
                  )
                : [
                    {
                      label: `[TSD${(i + 1).toString().padStart(3, '0')}] ${detail?.name}`,
                      nodeId: detail?.id,
                      extraProps: { ...detail, nodeType: 'derived', width: 150, height: 60 }
                    }
                  ]
              ).map(({ label, nodeId, extraProps }) => {
                // console.log('extraProps', extraProps);
                const onClick = (e) => {
                  e.stopPropagation();
                  const ids = extraProps?.threat_ids ? extraProps?.threat_ids?.map((threat) => threat?.propId) : [];
                  setSelectedThreatIds(ids);
                };
                return (
                  <DraggableTreeItem
                    draggable={true}
                    key={nodeId}
                    nodeId={nodeId}
                    label={getLabel('TopicIcon', label, key || i + 1, nodeId, extraProps?.threat_ids, onClick)}
                    onDragStart={(e) => onDragStart(e, { label, type: 'default', dragged: true, nodeId, ...extraProps })}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedThreatIds([]);
                    }}
                  />
                );
              })
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
            setOpenDocumentDialog(true);
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
  return <>{renderTreeItems()}</>;
};

export default TreeItemsRenderer;
