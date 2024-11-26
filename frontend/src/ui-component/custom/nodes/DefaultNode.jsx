/*eslint-disable*/
import React, { useState } from 'react';
import { Handle, NodeResizer, NodeToolbar, Position, useReactFlow } from 'reactflow';
import useStore from '../../../Zustand/store';
import { updatedModelState } from '../../../utils/Constraints';
import { useParams } from 'react-router';
import { ClickAwayListener, Dialog, DialogActions, DialogContent } from '@mui/material';

const selector = (state) => ({
  model: state.model,
  nodes: state.nodes,
  edges: state.edges,
  updateModel: state.updateModel,
  getModelById: state.getModelById
});
export default function DefaultNode({ id, data, isConnectable, type }) {
  const { id: mainId } = useParams();
  const { model, nodes, edges, updateModel, getModelById } = useStore(selector);
  const { setNodes } = useReactFlow();
  const [isVisible, setIsVisible] = useState(false);
  const [isCrossVisible, setIsCrossVisible] = useState(false);

  const onNodeClick = () => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
    setIsVisible(false);
  };

  const handleDelete = () => {
    const mod = JSON.parse(JSON.stringify(model));
    const Nodestate = JSON.parse(JSON.stringify(nodes));
    const edgeState = JSON.parse(JSON.stringify(edges));
    const filteredNode = Nodestate.filter((node) => node.id !== id);
    const filteredEdge = edgeState.filter((edge) => edge.source !== id && edge.target !== id);
    updateModel(updatedModelState(mod, filteredNode, filteredEdge))
      .then((res) => {
        // console.log('res', res);
        getModelById(mainId); 
        setIsVisible(false);
      })
      .catch((err) => {
        console.log('err', err);
      });
  };
  
  return (
    <>
      <NodeResizer />
      <ClickAwayListener onClickAway={() => setIsCrossVisible(false)}>
        <div
          role="button"
          tabIndex={0}
          className={`my-custom-node ${type}`}
          style={data?.style}
          onMouseEnter={() => setIsCrossVisible(true)}
          onMouseLeave={() => setIsCrossVisible(false)}
        >
          <Handle className="handle" id="a" position={Position.Top} isConnectable={isConnectable} />
          {/* <Handle className="handle" type="target" id="ab" style={{ left: 10 }} position={Position.Top} isConnectable={isConnectable} /> */}
          <Handle className="handle" id="b" position={Position.Left} isConnectable={isConnectable} />
          <div>{data?.label}</div>
          <Handle className="handle" id="c" position={Position.Bottom} isConnectable={isConnectable} />
          <Handle className="handle" id="d" position={Position.Right} isConnectable={isConnectable} />
          <div>{data?.label}</div>
          {isCrossVisible && (
            <div
              className="delete-icon"
              onClick={(e) => {
                e.stopPropagation();
                setIsVisible(true);
              }}
              style={{
                position: 'absolute',
                width: '20px',
                height: '19px',
                top: '-12px',
                right: '-12px',
                background: '#f83e3e',
                border: 'none',
                borderRadius: '50%',
                fontSize: '0.8rem',
                color: 'white',
                cursor: 'pointer',
              }}
            >
              x
            </div>
          )}
        </div>
      </ClickAwayListener>

      <Dialog open={isVisible} onClose={() => setIsVisible(false)}>
        <DialogContent style={{paddingBottom: '5px'}}>
          <p style={{margin: '0px'}}>Do you want to delete this node from the canvas or permanently?</p>
        </DialogContent>
        <DialogActions style={{display: 'flex', justifyContent: 'space-around'}}>
            <button
              onClick={onNodeClick}
              style={{
                padding: '6px',
                fontSize: '0.8rem',
                border: '1px solid #007bff',
                background: '#007bff',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              Delete from Canvas
            </button>
            <button
              onClick={handleDelete}
              style={{
                padding: '6px',
                fontSize: '0.8rem',
                border: '1px solid #dc3545',
                background: '#dc3545',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              Delete Permanently
            </button>
        </DialogActions>
      </Dialog>
    </>
  );
}















// /*eslint-disable*/
// import React, { useState } from 'react';
// import { Handle, NodeResizer, NodeToolbar, Position, useReactFlow } from 'reactflow';
// import useStore from '../../../Zustand/store';
// import { updatedModelState } from '../../../utils/Constraints';
// import { useParams } from 'react-router';
// import { ClickAwayListener } from '@mui/material';

// const selector = (state) => ({
//   model: state.model,
//   nodes: state.nodes,
//   edges: state.edges,
//   updateModel: state.updateModel,
//   getModelById: state.getModelById
// });
// export default function DefaultNode({ id, data, isConnectable, type }) {
//   const { id: mainId } = useParams();
//   const { model, nodes, edges, updateModel, getModelById } = useStore(selector);
//   // console.log('model', model);
//   const { setNodes } = useReactFlow();
//   const [isVisible, setIsVisible] = useState(false);
//   const [isHovered, setIsHovered] = useState(false);

//   const onNodeClick = () => {
//     setNodes((nodes) => nodes.filter((node) => node.id !== id));
//   };

//   const handleDelete = () => {
//     const mod = JSON.parse(JSON.stringify(model));
//     const Nodestate = JSON.parse(JSON.stringify(nodes));
//     const edgeState = JSON.parse(JSON.stringify(edges));
//     const filteredNode = Nodestate.filter((node) => node.id !== id);
//     const filteredEdge = edgeState.filter((edge) => edge.source !== id && edge.target !== id);
//     updateModel(updatedModelState(mod, filteredNode, filteredEdge))
//       .then((res) => {
//           // console.log('res', res);
//         getModelById(mainId);
//       })
//       .catch((err) => {
//         console.log('err', err);
//       });
//     setIsVisible(false);
//   };

//   return (
//     <>
//     <NodeResizer />
//     <ClickAwayListener onClickAway={() => setIsVisible(false)}>
//       <div
//         className={`my-custom-node ${type}`}
//         onMouseEnter={() => setIsHovered(true)}
//         onMouseLeave={() => setIsHovered(false)}
//         style={{
//           position: 'relative',
//           border: '1px solid #ddd',
//           borderRadius: '6px',
//           padding: '8px',
//           backgroundColor: '#fff',
//           boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
//           display: 'flex',
//           flexDirection: 'column',
//           alignItems: 'center',
//           gap: '8px',
//         }}
//       >
//         {/* Handles */}
//         <Handle id="a" position={Position.Top} isConnectable={isConnectable} />
//         <Handle id="b" position={Position.Left} isConnectable={isConnectable} />
//         <div style={{ fontSize: '0.9rem', textAlign: 'center' }}>{data?.label || "Default Node"}</div>
//         <Handle id="c" position={Position.Bottom} isConnectable={isConnectable} />
//         <Handle id="d" position={Position.Right} isConnectable={isConnectable} />

//         {/* Cross Icon */}
//         {isHovered && (
//           <button
//             onClick={() => setIsVisible((prev) => !prev)}
//             style={{
//               position: 'absolute',
//               top: '-12px',
//               right: '-12px',
//               background: '#f83e3e',
//               border: 'none',
//               borderRadius: '50%',
//               fontSize: '1rem',
//               color: 'white',
//               cursor: 'pointer',
//             }}
//           >
//             ×
//           </button>
//         )}

//         {/* Delete Menu */}
//         {isVisible && (
//           <div
//             style={{
//               position: 'absolute',
//               top: 'calc(100% + 5px)',
//               left: '50%',
//               transform: 'translate(-50%, -0%)',
//               right: 0,
//               background: '#f9f9f9',
//               border: '1px solid #ccc',
//               boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
//               padding: '8px',
//               zIndex: 10000,
//               display: 'flex',
//               flexDirection: 'column',
//               gap: '4px',
//               width: '90px',
//             }}
//           >
//             <button
//               onClick={onNodeClick}
//               style={{
//                 padding: '3px',
//                 fontSize: '0.4rem',
//                 border: '1px solid #007bff',
//                 borderRadius: '4px',
//                 background: '#007bff',
//                 color: '#fff',
//                 cursor: 'pointer',
//               }}
//             >
//               Delete from Canvas
//             </button>
//             <button
//               onClick={handleDelete}
//               style={{
//                 padding: '3px',
//                 fontSize: '0.4rem',
//                 border: '1px solid #dc3545',
//                 borderRadius: '4px',
//                 background: '#dc3545',
//                 color: '#fff',
//                 cursor: 'pointer',
//               }}
//             >
//               Delete Permanently
//             </button>
//           </div>
//         )}
//       </div>
//     </ClickAwayListener>
//     </>
//   );
// }
