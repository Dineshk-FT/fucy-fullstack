// AssetsTreeSection.jsx
/*eslint-disable*/
import React, { useCallback, useMemo } from 'react';
import { Box, Tooltip, Typography, Avatar } from '@mui/material';
import ControlPointIcon from '@mui/icons-material/ControlPoint';
import { useDispatch } from 'react-redux';
import { setAnchorEl, setEdgeDetails, setDetails, setSelectedBlock } from '../../../../../store/slices/CanvasSlice'; // adjust path to your Redux actions
import DraggableTreeItem from '../DraggableItem';
import EditName from '../EditName';
import {
  ConfidentialityIcon,
  IntegrityIcon,
  AuthenticityIcon,
  AuthorizationIcon,
  Non_repudiationIcon,
  AvailabilityIcon
} from '../../../../../assets/icons';

const MemoizedDraggableTreeItem = React.memo(DraggableTreeItem);
const MemoizedEditName = React.memo(EditName);

const ItemDefinition = ({
  data,
  hovered,
  setHovered,
  handleAddNode,
  handlePropertiesTab,
  handleClick,
  handleNodes,
  getLabel,
  setClickedItem,
  onDragStart,
  drawerwidthChange,
  drawerWidth,
  selectedBlock,
  model,
  classes,
  nodes,
  edges,
  handleSave,
  renderTreeItem
}) => {
  const dispatch = useDispatch();

  const { edgesDetail, nodesDetail, dataDetail } = useMemo(() => {
    const edgesDetail = data.Details?.filter((detail) => detail?.nodeId?.includes('reactflow__edge')) || [];
    const nodesDetail = data.Details?.filter((detail) => !detail?.nodeId?.includes('reactflow__edge') && detail.type !== 'data') || [];
    const dataDetail = data.Details?.filter((detail) => detail.type === 'data') || [];
    return { edgesDetail, nodesDetail, dataDetail };
  }, [data.Details]);
  const Properties = useMemo(
    () => ({
      Confidentiality: ConfidentialityIcon,
      Integrity: IntegrityIcon,
      Authenticity: AuthenticityIcon,
      Authorization: AuthorizationIcon,
      'Non-repudiation': Non_repudiationIcon,
      Availability: AvailabilityIcon
    }),
    []
  );

  const renderProperties = useCallback(
    (properties, detail, type) => {
      if (!properties || properties.length === 0) return null;
      const propertyNames = properties.map((prop) => prop.name);
      return (
        <Tooltip
          title={
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'start', padding: '8px' }}>
              {propertyNames.map((name, index) => (
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
            role="button"
            tabIndex={0}
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
              color: '#2196F3',
              cursor: 'pointer'
            }}
            onClick={() => handlePropertiesTab(detail, type)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handlePropertiesTab(detail, type);
              }
            }}
          >
            +{propertyNames.length}
          </div>
        </Tooltip>
      );
    },
    [handlePropertiesTab]
  );

  const renderSection = useCallback(
    (nodeId, label, details, type) => {
      const shouldShowAddIcon = (nodeId === 'nodes_section' && hovered.node) || (nodeId === 'data_section' && hovered.data);

      return (
        <MemoizedDraggableTreeItem
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
          {details?.map((detail, i) =>
            detail?.name?.length && detail?.props?.length > 0 ? (
              <MemoizedDraggableTreeItem
                key={detail.nodeId}
                nodeId={detail.nodeId}
                data={detail.nodeId}
                sx={{ background: selectedBlock?.id === detail?.nodeId ? 'wheat' : 'inherit' }}
                label={
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Tooltip title={detail?.name} disableHoverListener={drawerwidthChange >= drawerWidth}>
                      <span>
                        <MemoizedEditName detail={detail} index={i} onUpdate={handleSave} />
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
                  e.preventDefault();
                  e.stopPropagation();
                  setClickedItem(detail.nodeId);
                  dispatch(setSelectedBlock({ id: detail?.nodeId, name: detail.name }));
                  const selected = (type === 'node' ? nodes : edges).find((item) => item.id === detail?.nodeId);
                  dispatch(setAnchorEl({ type, value: type === 'edge' ? `rf__edge-${selected.id}` : selected?.id }));
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
            ) : null
          )}
        </MemoizedDraggableTreeItem>
      );
    },
    [
      hovered,
      getLabel,
      handleAddNode,
      setHovered,
      setClickedItem,
      classes.template,
      selectedBlock?.id,
      drawerwidthChange,
      drawerWidth,
      handleSave,
      onDragStart,
      nodes,
      edges
    ]
  );

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
};

export default React.memo(ItemDefinition);
