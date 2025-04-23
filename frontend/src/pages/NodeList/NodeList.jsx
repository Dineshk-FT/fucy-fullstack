import React, { useEffect } from 'react';
import useStore from '../../Zustand/store';
import { TreeItem, TreeView } from '@mui/x-tree-view';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Typography } from '@mui/material';
import { shallow } from 'zustand/shallow';

const selector = (state) => ({
  sidebarNodes: state.sidebarNodes,
  getSidebarNode: state.getSidebarNode
});
const NodeList = ({ setSelected }) => {
  const { sidebarNodes, getSidebarNode } = useStore(selector, shallow);

  const handleSelect = (node) => {
    setSelected(node);
  };
  //   console.log('sidebarNodes', sidebarNodes);
  useEffect(() => {
    getSidebarNode();
  }, []);
  return (
    <>
      <TreeView
        sx={{ color: 'black' }}
        aria-label="file system navigator"
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
      >
        {sidebarNodes?.map((item) => (
          <TreeItem key={item?._id} nodeId={item?._id} label={<Typography variant="h4">{item?.name}</Typography>}>
            {item?.nodes?.map((node) => (
              <TreeItem key={node?.id} nodeId={node?.id} label={node?.data.label} onClick={() => handleSelect(node)} />
            ))}
          </TreeItem>
        ))}
      </TreeView>
    </>
  );
};

export default NodeList;
