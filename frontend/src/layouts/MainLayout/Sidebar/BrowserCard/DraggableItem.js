/* eslint-disable */
import React, { useCallback } from 'react';
import { TreeItem } from '@mui/x-tree-view';

export default function DraggableTreeItem({ nodeId, label, onDragStart, draggable, children, ...props }) {
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

  return (
    <TreeItem nodeId={nodeId} label={label} ref={ref} draggable={draggable} onDragStart={onDragStart} {...props}>
      {children}
    </TreeItem>
  );
}
