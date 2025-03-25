/*eslint-disable*/
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Slide,
  Select,
  MenuItem,
  Typography
} from '@mui/material';
import React, { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import useStore from '../../Zustand/store';
import { useDispatch } from 'react-redux';
import { setAttackScene, setTableOpen } from '../../store/slices/CurrentIdSlice';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});
const notify = (message, status) => toast[status](message);

const selector = (state) => ({
  create: state.createPropmt,
  modelId: state.model?._id,
  getAttackScenario: state.getAttackScenario,
  globalAttackTrees: state.globalAttackTrees,
  addAIAttackTree: state.addAIAttackTree
});
const PromptModal = ({ handleClose, open, refreshAPI }) => {
  const { create, modelId, getAttackScenario, globalAttackTrees, addAIAttackTree } = useStore(selector);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [selectedAttackTree, setSelectedAttackTree] = useState(null);
  // console.log('selectedAttackTree', selectedAttackTree);

  const handleCreate = () => {
    if (!selectedAttackTree) {
      notify('Please select an attack tree', 'error');
      return;
    }

    setLoading(true);
    const newAttackTree = {
      modelId: modelId,
      aiAttackId: selectedAttackTree.id
    };

    addAIAttackTree(newAttackTree)
      .then((res) => {
        // console.log('res', res);
        if (!res.error) {
          notify(res.message ?? 'Attack tree created successfully', 'success');
          getAttackScenario(modelId);
          handleClose();
          setTimeout(() => {
            dispatch(setTableOpen('Attack Trees Canvas'));
            dispatch(setAttackScene(res?.scene[0]));
          }, 1000);
        } else {
          notify(res.error ?? 'Error while Generating the Requested Attack', 'error');
        }
      })
      .catch((err) => {
        console.log('err', err);
        notify('Something Went Wrong', 'error');
      })
      .finally(() => {
        setLoading(false);
      });

    setSelectedAttackTree(null);
  };

  return (
    <React.Fragment>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
      >
        {loading ? (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={4}>
            <CircularProgress />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Generating Response...
            </Typography>
          </Box>
        ) : (
          <>
            <DialogTitle sx={{ fontSize: 18, fontFamily: 'Inter', pb: 0 }}>{'Select an Attack Tree'}</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-slide-description">
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, my: 1 }}>
                  <Select
                    value={selectedAttackTree ? selectedAttackTree.id : ''}
                    onChange={(e) => {
                      const selectedTree = globalAttackTrees.find((tree) => tree.id === e.target.value);
                      setSelectedAttackTree(selectedTree ? { id: selectedTree.id, attackTreeName: selectedTree.attackTreeName } : null);
                    }}
                    displayEmpty
                    sx={{ width: '300px' }}
                  >
                    <MenuItem value="" disabled>
                      Select Attack Tree
                    </MenuItem>
                    {globalAttackTrees.map((tree) => (
                      <MenuItem key={tree.id} value={tree.id}>
                        {tree.attackTreeName}
                      </MenuItem>
                    ))}
                  </Select>
                </Box>
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button variant="outlined" color="error" onClick={handleClose} disabled={loading}>
                Cancel
              </Button>
              <Button variant="contained" onClick={handleCreate} disabled={loading}>
                Create
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      <Toaster position="top-right" reverseOrder={false} />
    </React.Fragment>
  );
};

export default PromptModal;
