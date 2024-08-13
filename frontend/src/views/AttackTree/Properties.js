import React from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { TreeView } from '@mui/x-tree-view/TreeView';
import { v4 as uid } from 'uuid';
import useStore from '../../Zustand/store';
import { shallow } from 'zustand/shallow';

const selector = (state) => ({
  addAttackNode: state.addAttackNode
});
const Properties = () => {
  const { addAttackNode } = useStore(selector, shallow);
  const handleAdd = (e, name) => {
    // console.log('clicked',e)
    // console.log('name', name);
    const newNode = {
      id: uid(),
      type: `${name}`,
      position: {
        x: 50,
        y: 200
      },
      data: {
        label: name
      }
    };
    addAttackNode(newNode);
  };
  return (
    <>
      <TreeView
        aria-label="file system navigator"
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
        defaultExpandedItems={['Attack Tree']}
      >
        <TreeItem nodeId="Attack Tree" label="Attack Tree">
          <TreeItem nodeId="Event" label="Event" onClick={(e) => handleAdd(e, 'Event')}></TreeItem>
          <TreeItem nodeId="OR Gate" label="OR Gate" onClick={(e) => handleAdd(e, 'OR Gate')}></TreeItem>
          <TreeItem nodeId="AND Gate" label="AND Gate" onClick={(e) => handleAdd(e, 'AND Gate')}></TreeItem>
          <TreeItem nodeId="Voting Gate" label="Voting Gate" onClick={(e) => handleAdd(e, 'Voting Gate')}></TreeItem>
          <TreeItem nodeId="Transfer Gate" label="Transfer Gate" onClick={(e) => handleAdd(e, 'Transfer Gate')}></TreeItem>
        </TreeItem>
      </TreeView>
    </>
  );
};

export default Properties;
