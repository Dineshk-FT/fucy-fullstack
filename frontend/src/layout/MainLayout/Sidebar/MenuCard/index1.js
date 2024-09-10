import React, { useState } from 'react';
import EditContent from '../../../../ui-component/Drawer/EditContent';
import useStore from '../../../../Zustand/store';
import { useParams } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedBlock } from '../../../../store/slices/CanvasSlice';

const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
  modal: state.modal,
  setNodes: state.setNodes,
  setEdges: state.setEdges,
  getModalById: state.getModalById,
  updateModal: state.updateModal,
  getModals: state.getModals
});
const MenuCard = () => {
  const dispatch = useDispatch();
  const { getModals, nodes, edges, setEdges, setNodes, modal, getModalById, updateModal } = useStore(selector);
  const { id } = useParams();
  const { selectedBlock } = useSelector((state) => state?.canvas);
  const setSelectedElement = (node) => dispatch(setSelectedBlock(node));

  const [details, setDetails] = useState({
    name: '',
    properties: []
  });

  const RefreshAPI = () => {
    getModalById(id);
    getModals();
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
        modal={modal}
        updateModal={updateModal}
        RefreshAPI={RefreshAPI}
      />
    </>
  );
};

export default MenuCard;
