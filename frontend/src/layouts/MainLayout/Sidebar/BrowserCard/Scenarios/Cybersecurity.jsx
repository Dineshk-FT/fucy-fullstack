/* eslint-disable */
import React, { useCallback } from 'react';
import { TreeItem } from '@mui/x-tree-view';

export function CybersecurityControlsTreeItem({
  nodeId,
  label,
  onDragStart,
  draggable,
  children,
  controlData, // Additional cybersecurity control data
  ...props
}) {
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
    <TreeItem nodeId={nodeId} label={label} ref={ref} draggable={draggable} {...props}>
      {children}
    </TreeItem>
  );
}
