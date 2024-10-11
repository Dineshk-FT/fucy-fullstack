/*eslint-disable*/
import { Box } from '@mui/material';
import React from 'react';
import { Handle, Position, NodeResizer, useReactFlow } from 'reactflow';
import useStore from '../../Zustand/store';
import { RatingColor } from '../Table/constraints';

const selector = (state) => ({
  model: state?.model
});
const AttackTreeNode = ({ data, isConnectable, type, id }) => {
  const { model } = useStore(selector);
  const { getNodes, getEdges } = useReactFlow();
  const nodes = getNodes();
  const edges = getEdges();
  const selected = edges.filter((ed) => ed.source === id).map((item) => item.target);
  const result = nodes.filter((obj) => selected.includes(obj.id));
  const merged = model?.scenarios[3]?.subs[0].scenes
    .filter((obj1) => result.some((obj2) => obj1?.ID === obj2?.data?.nodeId))
    .map((item) => item['Attack Feasabilities Rating']);

  function calculateAverageLevel(arr) {
    const levelMapping = {
      '': 0,
      Low: 1,
      Medium: 2,
      High: 3
    };
    const reverseMapping = {
      0: 'Low',
      1: 'Low',
      2: 'Medium',
      3: 'High'
    };

    const numericValues = arr.filter((value) => value in levelMapping).map((value) => levelMapping[value]);

    if (numericValues.length === 0) {
      return 'Low';
    }
    const average = numericValues.reduce((sum, num) => sum + num, 0) / numericValues.length;
    return reverseMapping[Math.round(average)];
  }

  const bgColor = RatingColor(calculateAverageLevel(merged));

  // console.log('bgColor', bgColor);
  return (
    <>
      <Box display="flex" flexDirection="column" alignItems="center">
        {/* <NodeResizer /> */}
        <div
          className={`my-custom-node ${type}`}
          style={{
            ...data?.style
          }}
        >
          <Handle className="handle" type="target" position={Position.Top} isConnectable={isConnectable} />
          <div>{data?.label}</div>
        </div>
        <Box
          my={1}
          sx={{
            width: 100,
            height: 100,
            borderRadius: 50,
            border: '1px solid black',
            bgcolor: bgColor,
            color: 'black',
            alignContent: 'center',
            textAlign: 'center'
          }}
        >
          {id?.slice(0, 5)}
        </Box>
        <Handle className="handle" type="range" position={Position.Bottom} isConnectable={isConnectable} />
      </Box>
    </>
  );
};

export default AttackTreeNode;
