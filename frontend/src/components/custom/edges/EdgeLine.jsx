/*eslint-disable*/
import React, { useEffect, useState } from 'react';
import { BaseEdge, getBezierPath } from 'reactflow';

const EdgeLine = ({ id, source, sourceHandleId, target, targetHandleId, sourceX, sourceY, targetX, targetY }) => {
  const [sourcePos, setSourcePos] = useState({ x: sourceX, y: sourceY });
  const [targetPos, setTargetPos] = useState({ x: targetX, y: targetY });

  useEffect(() => {
    if (sourceHandleId) {
      const handleElement = document.querySelector(`[data-handleid="${sourceHandleId}"]`);
      if (handleElement) {
        const rect = handleElement.getBoundingClientRect();
        setSourcePos({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        });
      }
    }

    if (targetHandleId) {
      const handleElement = document.querySelector(`[data-handleid="${targetHandleId}"]`);
      if (handleElement) {
        const rect = handleElement.getBoundingClientRect();
        setTargetPos({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        });
      }
    }
  }, [sourceHandleId, targetHandleId]);

  const [edgePath] = getBezierPath({
    sourceX: sourcePos.x,
    sourceY: sourcePos.y,
    targetX: targetPos.x,
    targetY: targetPos.y
  });

  return <BaseEdge id={id} path={edgePath} style={{ stroke: 'black', strokeWidth: 2 }} />;
};

export default EdgeLine;
