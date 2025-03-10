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
  TextField,
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
  getAttackScenario: state.getAttackScenario
});
const PromptModal = ({ handleClose, open, refreshAPI }) => {
  const { create, modelId, getAttackScenario } = useStore(selector);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [templateDetails, setTemplateDetails] = useState({ name: '' });

  const handleCreate = () => {
    setLoading(true);
    const newAttackTree = {
      modelId: modelId,
      promptKey: templateDetails?.name
    };

    create(newAttackTree, modelId)
      .then((res) => {
        if (res) {
          notify(res.message ?? 'Attack tree created successfully', 'success');
          getAttackScenario(modelId);
          handleClose();
          setTimeout(() => {
            dispatch(setTableOpen('Attack Trees Canvas'));
            dispatch(setAttackScene(res?.scene?.ID));
          }, 1000);
        }
      })
      .catch((err) => {
        console.log('err', err);
        notify('Something Went Wrong', 'error');
      })
      .finally(() => {
        setLoading(false);
      });

    setTemplateDetails({ name: '' });
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
            <DialogTitle sx={{ fontSize: 18, fontFamily: 'Inter', pb: 0 }}>{'Give Name for the Attack Tree'}</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-slide-description">
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, my: 1 }}>
                  <TextField
                    value={templateDetails?.name}
                    id="outlined-basic"
                    label="Name"
                    variant="outlined"
                    onChange={(e) => setTemplateDetails({ ...templateDetails, name: e.target.value })}
                    sx={{ width: '300px' }}
                  />
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
