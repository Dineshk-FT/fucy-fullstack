/* eslint-disable */
import React, { useCallback } from 'react';
import { TreeItem } from '@mui/x-tree-view';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles({
  root: {
    flexGrow: 1,
    maxWidth: 400
  }
});

export default function DraggableTreeItem({ nodeId, label, onDragStart }) {
  const ref = useCallback(
    (elt) => {
      if (elt) {
        elt.addEventListener('focusin', (e) => {
          e.stopImmediatePropagation();
        });
      }
    },
    [onDragStart]
  );

  return <TreeItem nodeId={nodeId} label={label} ref={ref} draggable={true} onDragStart={onDragStart} />;
}
