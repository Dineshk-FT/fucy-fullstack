import React from 'react'
import { Handle, Position } from 'reactflow';
import { closeAll } from '../../store/slices/CurrentIdSlice';
import { useDispatch } from 'react-redux';

const LevelNode = ({data,isConnectable}) => {
    const dispatch = useDispatch();
  return (
    <>
    <div
    className={`level_node`}
    onDoubleClick={()=>dispatch(closeAll())}
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

export default LevelNode