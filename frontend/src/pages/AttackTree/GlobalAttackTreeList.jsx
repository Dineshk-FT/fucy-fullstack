import { TreeItem, TreeView } from '@mui/x-tree-view';
import React from 'react';
import DraggableTreeItem from '../../components/custom/DraggableTreeItem';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const GlobalAttackTreeList = ({ globalAttackTrees }) => {
  //   console.log('globalAttackTrees', globalAttackTrees);
  const onDragStart = (event, item) => {
    const parseFile = JSON.stringify(item);
    event.dataTransfer.setData('application/Library', parseFile);
    event.dataTransfer.effectAllowed = 'move';
  };
  return (
    <>
      <TreeView
        aria-label="file system navigator"
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
        defaultExpanded={['Global Attack Trees']}
      >
        <TreeItem
          nodeId="Global Attack Trees"
          label={<span style={{ fontWeight: 'bold', fontSize: '1rem' }}>Global Attack Trees</span>}
          sx={{ marginTop: 2 }}
        >
          {globalAttackTrees?.map((item) => (
            <DraggableTreeItem
              sx={{ mt: 1, '& .MuiTreeItem-iconContainer': { display: 'none' } }}
              draggable={true}
              key={item.id}
              nodeId={item.id}
              label={item.attackTreeName}
              //   icon={<img src={item.icon} alt={item.label} height={20} width={20} />}
              onDragStart={(e) => onDragStart(e, item)}
            />
          ))}
        </TreeItem>
      </TreeView>
    </>
  );
};

export default GlobalAttackTreeList;
