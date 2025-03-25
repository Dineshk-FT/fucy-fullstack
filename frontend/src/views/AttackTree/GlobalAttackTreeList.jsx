import { TreeItem, TreeView } from '@mui/x-tree-view';
import React from 'react';
import DraggableTreeItem from '../../layout/MainLayout/Sidebar/BrowserCard/DraggableItem';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const GlobalAttackTreeList = ({ globalAttackTrees }) => {
  //   console.log('globalAttackTrees', globalAttackTrees);
  return (
    <>
      <TreeView
        aria-label="file system navigator"
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
        defaultExpanded={['Attack Tree']}
      >
        <TreeItem
          nodeId="Global Attack Trees"
          label={<span style={{ fontWeight: 'bold', fontSize: '1rem' }}>Global Attack Trees</span>}
          style={{ paddingTop: 6 }}
        >
          {globalAttackTrees?.map((item) => (
            <DraggableTreeItem
              style={{ paddingTop: 12 }}
              draggable={true}
              key={item.id}
              nodeId={item.id}
              label={item.attackTreeName}
              //   icon={<img src={item.icon} alt={item.label} height={20} width={20} />}
              //   onDragStart={(e) => onDragStart(e, { label: item.attackTreeName })}
            />
          ))}
        </TreeItem>
      </TreeView>
    </>
  );
};

export default GlobalAttackTreeList;
