import React, { useState } from 'react';
import EditContent from '../../../../ui-component/Drawer/EditContent';
import useStore from '../../../../Zustand/store';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedBlock } from '../../../../store/slices/CanvasSlice';

const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
  model: state.model,
  setNodes: state.setNodes,
  setEdges: state.setEdges,
  assets: state.assets,
  update: state.updateAssets,
  getAssets: state.getAssets,
  getDamageScenarios: state.getDamageScenarios
});
const MenuCard = () => {
  const dispatch = useDispatch();
  const { nodes, edges, setEdges, setNodes, model, assets, update, getAssets, getDamageScenarios } = useStore(selector);
  const { selectedBlock } = useSelector((state) => state?.canvas);
  const setSelectedElement = (node) => dispatch(setSelectedBlock(node));

  const [details, setDetails] = useState({
    name: '',
    properties: []
  });

  const RefreshAPI = () => {
    getAssets(model?._id);
    getDamageScenarios(model?._id);
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
        RefreshAPI={RefreshAPI}
        assets={assets}
        update={update}
      />
    </>
  );
};

export default MenuCard;
