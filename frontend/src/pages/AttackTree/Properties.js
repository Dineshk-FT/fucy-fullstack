/*eslint-disable*/
import React from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { TreeView } from '@mui/x-tree-view/TreeView';
import DraggableTreeItem from '../../layouts/MainLayout/Sidebar/BrowserCard/DraggableItem';
import { ANDGateIcon, EventIcon, ORGateIcon, TransferGateIcon, VotingGateIcon } from '../../assets/icons';

const Properties = () => {
  const gates = [
    {
      label: 'Event',
      nodeId: 'Event',
      icon: EventIcon
    },
    {
      label: 'OR Gate',
      nodeId: 'OR Gate',
      icon: ORGateIcon
    },
    {
      label: 'AND Gate',
      nodeId: 'AND Gate',
      icon: ANDGateIcon
    },
    {
      label: 'Voting Gate',
      nodeId: 'Voting Gate',
      icon: VotingGateIcon
    },
    {
      label: 'Transfer Gate',
      nodeId: 'Transfer Gate',
      icon: TransferGateIcon
    }
  ];

  const onDragStart = (event, item) => {
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
        <TreeItem
          nodeId="Attack Tree"
          label={<span style={{ fontWeight: 'bold', fontSize: '1rem' }}>Attack Tree Library</span>}
          style={{ paddingTop: 6 }}
        >
          {gates.map((item) => (
            <DraggableTreeItem
              style={{ paddingTop: 12 }}
              draggable={true}
              key={item.nodeId}
              nodeId={item.nodeId}
              label={item.label}
              icon={<img src={item.icon} alt={item.label} height={20} width={20} />}
              onDragStart={(e) => onDragStart(e, { label: item.label })}
            />
          ))}
        </TreeItem>
      </TreeView>
    </>
  );
};

export default Properties;
