import React from 'react'
import { Handle, Position } from 'reactflow';

const AttackTreeNode = ({data,isConnectable}) => {
  return (
    <>
    <div
    className={`attack_tree_node`}
    // style={{ 
    //   backgroundColor:`${data['bgColor']}`
    //   }}
  >
    <Handle
      className="handle"
      type="target"
      position={Position.Top}
      isConnectable={isConnectable}
    />
      <div>{data?.label}</div>
    <Handle
      className="handle"
      type="range"
      position={Position.Bottom}
      isConnectable={isConnectable}
    />
  </div>
</>
  )
}

export default AttackTreeNode