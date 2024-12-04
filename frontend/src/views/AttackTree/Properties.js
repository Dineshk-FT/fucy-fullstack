import React from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import EventIcon from '@mui/icons-material/Event';
import OrIcon from '@mui/icons-material/HelpOutline';
import AndIcon from '@mui/icons-material/Equalizer';
import VoteIcon from '@mui/icons-material/HowToVote';
import TransferIcon from '@mui/icons-material/TransferWithinAStation';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { TreeView } from '@mui/x-tree-view/TreeView';
import DraggableTreeItem from '../../layout/MainLayout/Sidebar/BrowserCard/DraggableItem';

const Properties = () => {
  const gates = [
    {
      label: 'Event',
      nodeId: 'Event',
      icon: <EventIcon />
    },
    {
      label: 'OR Gate',
      nodeId: 'OR Gate',
      icon: <OrIcon />
    },
    {
      label: 'AND Gate',
      nodeId: 'AND Gate',
      icon: <AndIcon />
    },
    {
      label: 'Voting Gate',
      nodeId: 'Voting Gate',
      icon: <VoteIcon />
    },
    {
      label: 'Transfer Gate',
      nodeId: 'Transfer Gate',
      icon: <TransferIcon />
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
          label={<span style={{ fontWeight: 'bold', fontSize: '1rem' }}>Attack Tree</span>}
          style={{ paddingTop: 6 }}
        >
          {gates.map((item) => (
            <DraggableTreeItem
              style={{ paddingTop: 12 }}
              draggable={true}
              key={item.nodeId}
              nodeId={item.nodeId}
              label={item.label}
              icon={item.icon}
              onDragStart={(e) => onDragStart(e, { label: item.label })}
            />
          ))}
        </TreeItem>
      </TreeView>
    </>
  );
};

export default Properties;
