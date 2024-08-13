/*eslint-disable*/
import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  // MarkerType,
  Controls,
  MiniMap,
  Panel
} from 'reactflow';
import '../index.css';
import 'reactflow/dist/style.css';
// import { v4 as uid } from "uuid";
import useStore from '../../Zustand/store';
import { shallow } from 'zustand/shallow';
// import { useSelector } from 'react-redux';
import { Button } from '@mui/material';
import { useParams } from 'react-router';
import { v4 as uid } from 'uuid';
import CyberGoal from '../../ui-component/custom/CyberGoal';
import CyberRequire from '../../ui-component/custom/CyberRequire';

const selector = (state) => ({
  nodes: state.cyberNodes,
  edges: state.cyberEdges,
  onNodesChange: state.onCyberNodesChange,
  onEdgesChange: state.onCyberEdgesChange,
  onConnect: state.onCyberConnect,
  addNode: state.addCyberNode,
  setNodes: state.setCyberNodes,
  setEdges: state.setCyberEdges,
  modal: state.modal,
  getModalById: state.getModalById,
  update: state.updateModal
});

//Edge line styling
const connectionLineStyle = { stroke: 'black' };
const edgeOptions = {
  type: 'straight',
  // markerEnd: {
  //   type: MarkerType.ArrowClosed,
  //   width: 20,
  //   height: 20,
  //   color: "black",
  // },
  // markerStart: {
  //   type: MarkerType.ArrowClosed,
  //   width: 20,
  //   height: 20,
  //   color: "#FF0072",
  // },
  animated: false,
  style: {
    stroke: 'gray'
  }
};

const nodetypes = {
  cyber_goal: CyberGoal,
  cyber_require: CyberRequire
};
// const flowKey = "example-flow";

export default function CyberSecurityBlock() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    setNodes,
    setEdges,
    getModalById
    // modal,
    // update
  } = useStore(selector, shallow);
  // const dispatch = useDispatch();
  const { id } = useParams();
  // const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  useEffect(() => {
    setNodes([]);
    setEdges([]);
    getModalById(id);
  }, [id]);

  // console.log('nodes', nodes);

  const handleSave = () => {
    // const mod = {...modal};
    // const selected = mod?.scenarios[4]?.subs[1]
    // selected.template = {
    //   id:uid(),
    //   nodes:nodes,
    //   edges:edges,
    // }
    // console.log('mod', mod)
    // update(mod);
  };

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      // const file = event.dataTransfer.getData("application/parseFile");
      const cyber = event.dataTransfer.getData('application/cyber');
      // console.log('cyber', cyber);
      // console.log('cyber', cyber);
      let parsedNode;
      // let parsedTemplate;
      if (cyber) {
        parsedNode = JSON.parse(cyber);
      }

      // if (typeof parsedNode === 'undefined' || !parsedNode || typeof parsedTemplate === 'undefined' || !parsedTemplate) {
      //   return;
      // }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY
      });
      if (parsedNode) {
        const newNode = {
          id: uid(),
          position,
          type: 'default',
          width: 300,
          height: 70,
          data: {
            label: parsedNode,
            style: {
              backgroundColor: 'transparent',
              fontSize: '16px',
              fontFamily: 'Inter',
              fontStyle: 'normal',
              fontWeight: 500,
              textAlign: 'center',
              color: 'white',
              textDecoration: 'none',
              borderColor: 'black',
              borderWidth: '2px',
              borderStyle: 'solid'
            }
          }
        };
        // const newNode = {
        //   id: uid(),
        //   type: parsedNode.type,
        //   position,
        //   properties: parsedNode.properties,
        //   width: parsedNode?.width,
        //   height: parsedNode?.height,
        //   data: {
        //     label: parsedNode.data['label'],
        //     style: {
        //       backgroundColor: parsedNode.data['bgColor'],
        //       fontSize: '16px',
        //       fontFamily: 'Inter',
        //       fontStyle: 'normal',
        //       fontWeight: 500,
        //       textAlign: 'center',
        //       color: 'white',
        //       textDecoration: 'none',
        //       borderColor: 'black',
        //       borderWidth: '2px',
        //       borderStyle: 'solid'
        //     }
        //   }
        // };
        addNode(newNode);
        // console.log('newNode', newNode);
      }

      // if (parsedTemplate) {
      //   let newNodes = [];
      //   let newEdges = [];
      //   const randomId = Math.floor(Math.random() * 1000);
      //   const randomPos = Math.floor(Math.random() * 500);

      //   parsedTemplate["nodes"].map((node) => {
      //     newNodes.push({
      //       id: `${node.id + randomId}`,
      //       data: node.data,
      //       type: node.type,
      //       position: {
      //         x: node["position"]["x"] + randomPos,
      //         y: node["position"]["y"] + randomPos,
      //       },
      //       properties: node.properties,
      //     });
      //   });

      //   parsedTemplate["edges"].map((edge) =>
      //     newEdges.push({
      //       id: uid(),
      //       source: `${edge.source + randomId}`,
      //       target: `${edge.target + randomId}`,
      //       ...edgeOptions,
      //     })
      //   );

      //   // dragAddNode(newNodes, newEdges);
      // }
    },
    [reactFlowInstance]
  );
  // console.log('nodes', nodes);
  return (
    <div style={{ height: '100%', background: 'white' }}>
      <ReactFlowProvider>
        {/* <div className="reactflow-wrapper" ref={reactFlowWrapper}> */}
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodetypes}
          connectionLineStyle={connectionLineStyle}
          defaultEdgeOptions={edgeOptions}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          fitView
        >
          <Panel
            position="top-left"
            style={{
              display: 'flex',
              gap: 5,
              background: 'white'
              // marginLeft: "2rem",
              // marginTop: "2rem",
            }}
          >
            <Button variant="outlined" onClick={handleSave}>
              Add
            </Button>
          </Panel>
          <MiniMap />
          <Controls />
        </ReactFlow>
        {/* </div> */}
      </ReactFlowProvider>
    </div>
  );
}
