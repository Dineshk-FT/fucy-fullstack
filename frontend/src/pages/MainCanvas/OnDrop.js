import { v4 as uid } from 'uuid';

export const onDrop = (event, createGroup, reactFlowInstance, dragAdd, dragAddNode) => {
  event.preventDefault();
  const file = event.dataTransfer.getData('application/parseFile');
  const template = event.dataTransfer.getData('application/template');
  const group = event.dataTransfer.getData('application/group');
  const dragItem = event.dataTransfer.getData('application/dragItem');
  const parsedDragItem = dragItem ? JSON.parse(dragItem) : null;
  let parsedNode;
  let parsedTemplate;
  let parsedNodeItem;
  const position = reactFlowInstance.screenToFlowPosition({
    x: event.clientX,
    y: event.clientY
  });

  const dropType = parsedDragItem ? 'dragItem' : file ? 'file' : group ? 'group' : 'template';

  switch (dropType) {
    case 'dragItem':
      parsedNodeItem = parsedDragItem;
      break;
    case 'file':
      parsedNode = JSON.parse(file);
      break;
    case 'group':
      createGroup(position);
      break;
    case 'template':
      parsedTemplate = JSON.parse(template);
      break;
    default:
      console.error('Unsupported drop type');
  }

  if (parsedNode) {
    const newNode = {
      id: uid(),
      type: parsedNode.type,
      isAsset: false,
      position,
      properties: parsedNode.properties,
      width: parsedNode?.width,
      height: parsedNode?.height,
      data: {
        label: parsedNode.data['label'],
        style: {
          backgroundColor: parsedNode?.data?.style?.backgroundColor ?? '#dadada',
          borderRadius: '8px',
          boxShadow: isDark == true ? '0 2px 6px rgba(0,0,0,0.4)' : '0 2px 6px rgba(0,0,0,0.1)',
          fontFamily: "'Poppins', sans-serif",
          fontSize: '14px',
          padding: '8px 12px',
          ...style
        }
      }
    };
    dragAdd(newNode);
  }

  if (parsedNodeItem) {
    const newNode = {
      id: parsedNodeItem.id,
      type: parsedNodeItem.type,
      position,
      data: {
        label: parsedNodeItem.name,
        nodeId: parsedNodeItem.nodeId,
        style: {
          backgroundColor: parsedNodeItem?.data?.style?.backgroundColor ?? '#dadada',
          borderRadius: '8px',
          boxShadow: isDark == true ? '0 2px 6px rgba(0,0,0,0.4)' : '0 2px 6px rgba(0,0,0,0.1)',
          fontFamily: "'Poppins', sans-serif",
          fontSize: '14px',
          padding: '8px 12px',
          ...style
        }
      },
      properties: parsedNodeItem.props || []
    };
    dragAdd(newNode);
  }

  if (parsedTemplate) {
    let newNodes = [];
    let newEdges = [];
    const randomId = Math.floor(Math.random() * 1000);
    const randomPos = Math.floor(Math.random() * 500);

    parsedTemplate['nodes'].map((node) => {
      newNodes.push({
        id: `${node.id + randomId}`,
        data: {
          ...node?.data,
          style: {
            backgroundColor: node.data['bgColor'],
            borderRadius: '8px',
            boxShadow: isDark == true ? '0 2px 6px rgba(0,0,0,0.4)' : '0 2px 6px rgba(0,0,0,0.1)',
            fontFamily: "'Poppins', sans-serif",
            fontSize: '14px',
            padding: '8px 12px',
            ...style
          }
        },
        type: node.type,
        isAsset: false,
        position: {
          x: node['position']['x'] + randomPos,
          y: node['position']['y'] + randomPos
        },
        properties: node.properties,
        parentId: node.parentId ? `${node.parentId + randomId}` : null,
        extent: node?.extent ? node?.extent : null
      });
    });

    parsedTemplate['edges'].map((edge) =>
      newEdges.push({
        id: uid(),
        source: `${edge.source + randomId}`,
        target: `${edge.target + randomId}`,
        ...edgeOptions
      })
    );

    dragAddNode(newNodes, newEdges);
  }
};
