import React, { useState } from 'react';
import EditContent from '../../../../ui-component/Drawer/EditContent';
import useStore from '../../../../Zustand/store';
import { useParams } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedBlock } from '../../../../store/slices/CanvasSlice';

const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
  model: state.model,
  setNodes: state.setNodes,
  setEdges: state.setEdges,
  getModelById: state.getModelById,
  updateModel: state.updateModel,
  getModels: state.getModels
});
const MenuCard = () => {
  const dispatch = useDispatch();
  const { getModels, nodes, edges, setEdges, setNodes, model, getModelById, updateModel } = useStore(selector);
  const { id } = useParams();
  const { selectedBlock } = useSelector((state) => state?.canvas);
  const setSelectedElement = (node) => dispatch(setSelectedBlock(node));

  const [details, setDetails] = useState({
    name: '',
    properties: []
  });

  const RefreshAPI = () => {
    getModelById(id);
    getModels();
  };

  return (
    <>
      <EditContent
        setSelectedElement={setSelectedElement}
        selectedElement={selectedBlock}
        nodes={nodes}
        edges={edges}
        setEdges={setEdges}
        setNodes={setNodes}
        details={details}
        setDetails={setDetails}
        model={model}
        updateModel={updateModel}
        RefreshAPI={RefreshAPI}
      />
    </>
  );
};

export default MenuCard;
