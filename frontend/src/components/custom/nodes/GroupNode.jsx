/*eslint-disable*/
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Handle, NodeResizer, Position, useReactFlow } from 'reactflow';
import { shallow } from 'zustand/shallow';
import { useDispatch, useSelector } from 'react-redux';
import useThrottle from '../../../hooks/useThrottle';
import useStore from '../../../store/Zustand/store';
import { iconStyle } from '../../../themes/constant';
import EditIcon from '@mui/icons-material/Edit';
import DetailsIcon from '@mui/icons-material/Details';
import { setAnchorEl, setDetails, setSelectedBlock } from '../../../store/slices/CanvasSlice';
import DeleteDialog from './DeleteDialog';
import UnSavedDialog from './UnSavedDialog';
import CloseIcon from '@mui/icons-material/Close';

const selector = (state) => ({
  nodes: state.nodes,
  setSelectedElement: state.setSelectedElement,
  setPropertiesOpen: state.setPropertiesOpen,
  deleteNode: state.deleteNode,
  getAssets: state.getAssets,
  assets: state.assets,
  model: state.model
});

const CustomGroupNode = ({ data, id, isConnectable }) => {
  const dispatch = useDispatch();
  const { nodes, setSelectedElement, setPropertiesOpen, deleteNode, getAssets, assets, model } = useStore(selector, shallow);
  const { setNodes } = useReactFlow();
  const { selectedBlock } = useSelector((state) => state?.canvas);
  const [dimensions, setDimensions] = useState({
    width: data?.style?.width || 200,
    height: data?.style?.height || 200
  });
  const [isVisible, setIsVisible] = useState(false);
  const isSelected = selectedBlock?.id === id;
  const bgColor = isSelected ? '#784be8' : '#A9A9A9';
  const [value, setValue] = useState(data?.label || '');
  const [isUnsavedDialogVisible, setIsUnsavedDialogVisible] = useState(false);
  const isMounted = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false; // Set to false when component unmounts
    };
  }, []);

  const fontSize = Math.max(12, Math.min(dimensions.width / 10, 30));

  const throttledResize = useThrottle((newWidth, newHeight) => {
    setDimensions({ width: newWidth, height: newHeight });

    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, style: { ...node.data.style, width: newWidth, height: newHeight } } } : node
      )
    );
  }, 50);

  const handleResize = useCallback(
    (_, { width: newWidth, height: newHeight }) => {
      requestAnimationFrame(() => {
        throttledResize(newWidth, newHeight);
      });
    },
    [throttledResize]
  );

  useEffect(() => {
    setValue(data?.label || '');
  }, [data?.label]);

  const handleChange = (e) => {
    const val = e.target.value;
    setValue(val);
    setNodes(nodes.map((node) => (node.id === id ? { ...node, data: { ...node.data, label: val } } : node)));
  };

  const onNodeClick = () => {
    setNodes((nodes) => nodes?.filter((node) => node.id !== id));
    setIsVisible(false);
  };
  // console.log('data.style', data.style);
  const handleInfoClick = (open) => {
    setPropertiesOpen(open);
    const selectedNode = nodes.find((node) => node.id === id);
    const { isAsset, properties } = selectedNode;
    dispatch(setSelectedBlock({ id, data }));
    dispatch(setAnchorEl({ type: 'node', value: id }));
    setSelectedElement(selectedNode);
    dispatch(
      setDetails({
        name: data?.label ?? '',
        properties: properties ?? [],
        isAsset: isAsset ?? false
      })
    );
  };

  const handleDelete = useCallback(() => {
    if (!assets?._id || !model?._id) {
      console.error('Missing assetId or modelId');
      return;
    }
    // Close dialogs immediately
    if (isMounted.current) {
      setIsUnsavedDialogVisible(false);
      setIsVisible(false);
    }
    deleteNode({ assetId: assets._id, nodeId: id })
      .then(() => {
        if (isMounted.current) {
          // Remove node from canvas immediately
          setNodes((nodes) => nodes.filter((node) => node.id !== id));
          // Fetch updated assets (optional, depending on your app's needs)
          getAssets(model._id);
        }
      })
      .catch((err) => {
        if (isMounted.current) {
          console.error('Delete node error:', err);
          alert('Failed to delete node. Please try again.');
        }
      })
      .finally(() => {
        if (isMounted.current) {
          setIsUnsavedDialogVisible(false);
          setIsVisible(false);
        }
      });
  }, [assets, model, id, deleteNode, getAssets, setNodes]);

  const handlePermanentDeleteClick = () => {
    if (nodes.length > originalNodes.length) {
      setIsUnsavedDialogVisible(true);
    } else {
      handleDelete();
    }
  };
  const handleUnsavedDialogClose = () => setIsUnsavedDialogVisible(false);
  const handleUnsavedDialogContinue = () => handleDelete();

  return (
    <div
      style={{
        height: dimensions.height,
        width: dimensions.width,
        transition: 'width 0.2s ease, height 0.2s ease',
        backgroundColor: data?.style?.backgroundColor ?? 'transparent',
        borderColor: data?.style?.borderColor ?? 'gray',
        borderStyle: data?.style?.borderStyle ?? 'solid',
        opacity: data?.style?.opacity ?? 1,
        borderRadius: data?.style?.borderRadius ?? 4
      }}
    >
      <input
        type="text"
        value={value}
        onChange={handleChange}
        style={{
          fontSize: `${fontSize}px`,
          fontWeight: 600,
          marginTop: '0.5rem',
          textAlign: 'center',
          border: 'none',
          background: 'transparent',
          outline: 'none',
          minWidth: 100,
          width: '100%',
          color: data?.style?.color ?? '#000000',
          fontWeight: data?.style?.fontWeight ?? 500,
          fontStyle: data?.style?.fontStyle ?? 'normal',
          textDecoration: data?.style?.textDecoration ?? 'none',
          fontFamily: data?.style?.fontFamily ?? 'Inter',
          textAlign: data?.style?.textAlign ?? 'center'
        }}
      />

      <NodeResizer onResize={handleResize} />
      <Handle style={{ backgroundColor: bgColor }} id="a" position={Position.Top} isConnectable={isConnectable} />
      <Handle style={{ backgroundColor: bgColor }} id="b" position={Position.Left} isConnectable={isConnectable} />
      <Handle style={{ backgroundColor: bgColor }} id="c" position={Position.Bottom} isConnectable={isConnectable} />
      <Handle style={{ backgroundColor: bgColor }} id="d" position={Position.Right} isConnectable={isConnectable} />
      <div
        onClick={(e) => {
          e.stopPropagation();
          handleInfoClick(false);
        }}
        style={{ ...iconStyle, left: '-12px', display: isSelected ? 'flex' : 'none' }}
      >
        <EditIcon sx={{ fontSize: '0.9rem', mb: 0.1 }} />
      </div>
      <div
        onClick={(e) => {
          e.stopPropagation();
          handleInfoClick(true);
        }}
        style={{ ...iconStyle, left: '12px', display: isSelected ? 'flex' : 'none' }}
      >
        <DetailsIcon sx={{ fontSize: '0.9rem', mb: 0.3 }} />
      </div>
      <div
        className="delete-icon"
        onClick={(e) => {
          e.stopPropagation();
          setIsVisible(true);
        }}
        style={{
          ...iconStyle,
          right: '-12px',
          background: '#f83e3e',
          border: 'none',
          display: isSelected ? 'flex' : 'none'
        }}
      >
        <CloseIcon sx={{ fontSize: '0.9rem' }} />
      </div>
      <div
        className="my-group-node"
        style={{
          position: 'relative'
        }}
      >
        <div
          style={{
            color: 'black',
            textShadow: 'none',
            fontWeight: 600,
            height: 'inherit',
            width: 'inherit'
          }}
        />
      </div>
      <DeleteDialog
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        onNodeClick={onNodeClick}
        handlePermanentDeleteClick={handlePermanentDeleteClick}
      />
      <UnSavedDialog
        isUnsavedDialogVisible={isUnsavedDialogVisible}
        handleUnsavedDialogClose={handleUnsavedDialogClose}
        handleUnsavedDialogContinue={handleUnsavedDialogContinue}
      />
    </div>
  );
};

export default CustomGroupNode;
