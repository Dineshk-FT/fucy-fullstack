/* eslint-disable */
import React, { useCallback, useMemo } from 'react';
import { Box, Tooltip, Typography, Avatar } from '@mui/material';
import ControlPointIcon from '@mui/icons-material/ControlPoint';
import { useDispatch } from 'react-redux';
import { setAnchorEl, setEdgeDetails, setDetails, setSelectedBlock } from '../../../../../store/slices/CanvasSlice';
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
    const details = data.Details || [];
    return {
      edgesDetail: details.filter((d) => d.nodeId?.includes('reactflow__edge')),
      nodesDetail: details.filter((d) => !d.nodeId?.includes('reactflow__edge') && d.type !== 'data'),
      dataDetail: details.filter((d) => d.type === 'data')
    };
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
    (props = [], detail, type) => {
      if (!props.length) return null;

      const propertyNames = props.map((prop) => prop.name);
      return (
        <Tooltip
          arrow
          title={
            <Box display="flex" flexDirection="column" alignItems="flex-start" p={1}>
              {propertyNames.map((name, i) => (
                <Box key={i} display="flex" alignItems="center" gap={1} mb={0.5}>
                  <Avatar sx={{ width: 18, height: 18 }}>
                    <img src={Properties[name]} alt={name} width="100%" />
                  </Avatar>
                  <Typography variant="body2" sx={{ color: 'white' }}>
                    {name}
                  </Typography>
                </Box>
              ))}
            </Box>
          }
        >
          <Box
            role="button"
            tabIndex={0}
            onClick={() => handlePropertiesTab(detail, type)}
            onKeyDown={(e) => ['Enter', ' '].includes(e.key) && handlePropertiesTab(detail, type)}
            sx={{
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
          >
            +{propertyNames.length}
          </Box>
        </Tooltip>
      );
    },
    [handlePropertiesTab, Properties]
  );

  const handleContextMenu = useCallback(
    (e, detail, type) => {
      e.preventDefault();
      e.stopPropagation();

      setClickedItem(detail.nodeId);
      dispatch(setSelectedBlock({ id: detail.nodeId, name: detail.name }));

      const target = (type === 'edge' ? edges : nodes).find((item) => item.id === detail.nodeId);
      dispatch(setAnchorEl({ type, value: type === 'edge' ? `rf__edge-${target.id}` : target.id }));

      if (type === 'edge') {
        dispatch(
          setEdgeDetails({
            name: target?.data?.label || '',
            properties: target?.properties || [],
            isAsset: target?.isAsset || false,
            style: target?.style || {},
            startPoint: target?.markerStart?.color || '#000000',
            endPoint: target?.markerEnd?.color || '#000000'
          })
        );
      } else {
        dispatch(
          setDetails({
            name: target?.data?.label || '',
            properties: target?.properties || [],
            isAsset: target?.isAsset || false
          })
        );
      }
    },
    [dispatch, edges, nodes, setClickedItem]
  );

  const renderSection = useCallback(
    (sectionId, label, details, type) => {
      const isNodeSection = sectionId === 'nodes_section';
      const isDataSection = sectionId === 'data_section';
      const showAdd = (isNodeSection && hovered.node) || (isDataSection && hovered.data);

      return (
        <MemoizedDraggableTreeItem
          nodeId={sectionId}
          label={
            isNodeSection || isDataSection ? (
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                onMouseEnter={() => setHovered((s) => ({ ...s, node: isNodeSection || s.node, data: isDataSection || s.data }))}
                onMouseLeave={() =>
                  setHovered((s) => ({ ...s, node: isNodeSection ? false : s.node, data: isDataSection ? false : s.data }))
                }
              >
                <Box>{getLabel('TopicIcon', label, null, sectionId)}</Box>
                {showAdd && (
                  <Box onClick={handleAddNode(isNodeSection ? 'default' : 'data')}>
                    <ControlPointIcon color="primary" sx={{ fontSize: 18 }} />
                  </Box>
                )}
              </Box>
            ) : (
              getLabel('TopicIcon', label, null, sectionId)
            )
          }
          onClick={(e) => {
            e.stopPropagation();
            setClickedItem(sectionId);
          }}
          className={classes.template}
        >
          {details?.map(
            (detail, i) =>
              detail.name?.length &&
              detail.props?.length > 0 && (
                <MemoizedDraggableTreeItem
                  key={detail.nodeId}
                  nodeId={detail.nodeId}
                  data={detail.nodeId}
                  sx={{ background: selectedBlock?.id === detail.nodeId ? 'wheat' : 'inherit' }}
                  label={
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Tooltip title={detail.name} disableHoverListener={drawerwidthChange >= drawerWidth}>
                        <span>
                          <MemoizedEditName detail={detail} index={i} onUpdate={handleSave} />
                        </span>
                      </Tooltip>
                      {renderProperties(detail.props, detail, type)}
                    </Box>
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    setClickedItem(detail.nodeId);
                    dispatch(setSelectedBlock({ id: detail.nodeId, name: detail.name }));
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setClickedItem(detail.nodeId);
                    dispatch(setSelectedBlock({ id: detail.nodeId, name: detail.name }));
                  }}
                  onContextMenu={(e) => handleContextMenu(e, detail, type)}
                  onDragStart={(e) => onDragStart(e, detail)}
                />
              )
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
      renderProperties,
      handleSave,
      onDragStart,
      dispatch,
      handleContextMenu
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
