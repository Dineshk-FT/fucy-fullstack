import React, { useCallback, useState } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Typography,
  CircularProgress,
} from '@mui/material';
import { shallow } from 'zustand/shallow';
import { v4 as uid } from 'uuid';
import toast, { Toaster } from 'react-hot-toast';
import useStore from '../../store/Zustand/store';
import { useParams } from 'react-router';
import { updatedModelState } from '../../utils/Constraints';
import PaperComponent from './PaperComponent';
import NodeList from '../../views/NodeList/NodeList';
import ColorTheme from '../../themes/ColorTheme';

const selector = (state) => ({
  getModelById: state.getModelById,
  model: state.model,
  setNodes: state.setNodes,
  nodes: state.nodes,
  edges: state.edges,
  updateModel: state.updateModel,
});

export default React.memo(function SelectNodeList({ open, handleClose }) {
  const color = ColorTheme();
  const { id } = useParams();
  const { model, nodes, edges, setNodes, getModelById, updateModel } = useStore(selector, shallow);
  const [selected, setSelected] = useState({});
  const [loading, setLoading] = useState(false);

  const handleAdd = useCallback(() => {
    if (!selected?.id) {
      toast.error('Please select a node');
      return;
    }

    setLoading(true);
    const nodeDetails = {
      ...selected,
      id: uid(),
      position: { x: 495, y: 250 },
      data: {
        ...selected.data,
        style: {
          backgroundColor: '#dadada',
          fontSize: '12px',
          fontFamily: 'Inter',
          fontStyle: 'normal',
          textAlign: 'center',
          color: 'black',
          fontWeight: 500,
          textDecoration: 'none',
          borderColor: 'gray',
          borderWidth: '2px',
          borderStyle: 'solid',
        },
      },
    };

    const updatedNodes = [...nodes, nodeDetails];
    setNodes(updatedNodes);

    updateModel(updatedModelState(model, updatedNodes, edges))
      .then((res) => {
        if (res.data) {
          toast.success('Node added successfully');
          getModelById(id);
          setSelected({});
          handleClose();
        } else {
          toast.error('Update failed');
        }
      })
      .catch(() => {
        toast.error('Something went wrong');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selected, nodes, model, edges, setNodes, updateModel, getModelById, id, handleClose]);

  const onClose = useCallback(() => {
    setSelected({});
    handleClose();
  }, [handleClose]);

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        PaperComponent={PaperComponent}
        aria-labelledby="select-node-list-dialog-title"
        aria-describedby="select-node-list-dialog-description"
        maxWidth="sm"
        sx={{
          '& .MuiPaper-root': {
            background: color?.modalBg,
            width: '475px',
            borderRadius: '8px',
          },
        }}
      >
        <DialogTitle sx={{ fontSize: 18, fontFamily: 'Inter', p: 2, cursor: 'move' }}>
          Select Node
        </DialogTitle>
        <DialogContent sx={{ p: 2, maxHeight: 300, overflow: 'auto' }}>
          <DialogContentText id="select-node-list-dialog-description">
            <Typography variant="body2" sx={{ mb: 1, color: color?.sidebarContent }}>
              Select a node to add to your model.
            </Typography>
            <NodeList setSelected={setSelected} />
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            variant="outlined"
            color="error"
            onClick={onClose}
            disabled={loading}
            sx={{ textTransform: 'none', minWidth: '80px' }}
          >
            Close
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAdd}
            disabled={loading || !selected?.id}
            sx={{ textTransform: 'none', minWidth: '80px' }}
            startIcon={loading && <CircularProgress size={16} />}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
      <Toaster position="top-right" reverseOrder={false} />
    </>
  );
});