/* eslint-disable */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Handle, NodeResizer, Position, useReactFlow } from 'reactflow';
import { shallow } from 'zustand/shallow';
import { useDispatch, useSelector } from 'react-redux';
import useThrottle from '../../../hooks/useThrottle';
import useStore from '../../../store/Zustand/store';
import { setAnchorEl, setDetails, setSelectedBlock } from '../../../store/slices/CanvasSlice';

const selector = (state) => ({
  nodes: state.nodes,
  setSelectedElement: state.setSelectedElement,
  setPropertiesOpen: state.setPropertiesOpen,
  deleteNode: state.deleteNode,
  getAssets: state.getAssets,
  assets: state.assets,
  model: state.model
});

const CarImageNode = ({ id, data, isConnectable }) => {
  const dispatch = useDispatch();
  const { nodes, setSelectedElement, setPropertiesOpen } = useStore(selector, shallow);
  const { setNodes } = useReactFlow();
  const { selectedBlock } = useSelector((state) => state?.canvas);
  
  const [dimensions, setDimensions] = useState({
    width: data?.style?.width || 1000,  
    height: data?.style?.height || 750   
  });
  
  // Update dimensions when data changes
  useEffect(() => {
    if (data?.style?.width && data.style.width !== dimensions.width) {
      setDimensions(prev => ({ ...prev, width: data.style.width }));
    }
    if (data?.style?.height && data.style.height !== dimensions.height) {
      setDimensions(prev => ({ ...prev, height: data.style.height }));
    }
  }, [data?.style?.width, data?.style?.height]);
  
  const [isHovered, setIsHovered] = useState(false);
  const isSelected = selectedBlock?.id === id;
  const bgColor = isSelected ? '#784be8' : '#A9A9A9';
  const [value, setValue] = useState(data?.label || '');
  const isMounted = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const throttledResize = useThrottle((newWidth, newHeight) => {
    // Remove the minimum size constraints here as they're already handled by NodeResizer
    setDimensions({ width: newWidth, height: newHeight });
    
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id 
          ? { 
              ...node, 
              data: { 
                ...node.data, 
                style: { 
                  ...node.data.style, 
                  width: newWidth, 
                  height: newHeight 
                } 
              },
              style: {
                ...node.style,
                width: newWidth,
                height: newHeight
              }
            } 
          : node
      )
    );
  }, 16); // ~60fps

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

  const handleClick = (e) => {
    e.stopPropagation();
    dispatch(setSelectedBlock({ 
      id, 
      type: 'carImage', 
      data: { 
        ...data, 
        style: { 
          ...data.style, 
          width: dimensions.width, 
          height: dimensions.height 
        } 
      } 
    }));
    handleInfoClick(true);
  };

  // Import the car blueprint image
  const carImage = require('../../../assets/images/others/CarBluePrint.png');

  return (
    <div 
      className="car-image-node" 
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: '100%',
        height: '100%',
        border: `2px solid ${isSelected ? '#784be8' : 'transparent'}`,
        borderRadius: '5px',
        backgroundColor: 'transparent',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative',
        boxSizing: 'border-box',
        padding: '10px'
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick(e)}
    >
      <NodeResizer 
        minWidth={200}
        minHeight={150}
        isVisible={isSelected}
        onResize={handleResize}
        onResizeEnd={() => {}}
        color="#ff0071"
        handleStyle={{
          width: '10px',
          height: '10px',
          border: '2px solid #ff0071',
          borderRadius: '50%',
          backgroundColor: 'white',
          transform: 'translate(-50%, -50%)',
          zIndex: 10
        }}
        lineStyle={{
          borderColor: '#ff0071',
          borderWidth: '1px',
          borderStyle: 'dashed'
        }}
      />
      
      <div 
        style={{ 
          width: '100%', 
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          backgroundImage: `url(${carImage})`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundClip: 'padding-box',
          padding: '10px',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.2s ease-in-out',
          backgroundColor: 'transparent'
        }}
      >
        {value && (
          <div style={{
            position: 'absolute',
            bottom: '5px',
            left: 0,
            right: 0,
            textAlign: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            padding: '2px 0',
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#333'
          }}>
            {value}
          </div>
        )}
      </div>
      
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        style={{ 
          background: bgColor,
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          border: '2px solid white'
        }}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        style={{ 
          background: bgColor,
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          border: '2px solid white'
        }}
        isConnectable={isConnectable}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        style={{ 
          background: bgColor,
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          border: '2px solid white'
        }}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={{ 
          background: bgColor,
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          border: '2px solid white'
        }}
        isConnectable={isConnectable}
      />
    </div>
  );
};

export default CarImageNode;
