//
import React from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { TreeView } from '@mui/x-tree-view/TreeView';
import DraggableTreeItem from '../../layout/MainLayout/Sidebar/BrowserCard/DraggableItem';

const Properties = () => {
  const gates = [
    {
      label: 'Event',
      nodeId: 'Event'
    },
    {
      label: 'OR Gate',
      nodeId: 'OR Gate'
    },
    {
      label: 'AND Gate',
      nodeId: 'AND Gate'
    },
    {
      label: 'Voting Gate',
      nodeId: 'Voting Gate'
    },
    {
      label: 'Transfer Gate',
      nodeId: 'Transfer Gate'
    }
  ];

  const onDragStart = (event, item) => {
    // console.log('event', event);
    // console.log('item', item);
    const parseFile = JSON.stringify(item);
    event.dataTransfer.setData('application/cyber', parseFile);
    event.dataTransfer.effectAllowed = 'move';
  };
  return (
    <>
      <TreeView
        aria-label="file system navigator"
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
        defaultExpanded={['Attack Tree']}
      >
        <TreeItem nodeId="Attack Tree" label="Attack Tree">
          {gates.map((item) => (
            <DraggableTreeItem
              draggable={true}
              key={item?.nodeId}
              nodeId={item?.nodeId}
              label={item?.label}
              onDragStart={(e) => onDragStart(e, { label: item?.label })}
            />
          ))}
        </TreeItem>
      </TreeView>
    </>
  );
};

export default Properties;
