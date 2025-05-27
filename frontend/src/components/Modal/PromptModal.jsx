/*eslint-disable*/
import React, { useCallback, useState } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Box,
  TextField,
  Slide,
  CircularProgress,
  Typography,
  FormLabel
} from '@mui/material';
import { shallow } from 'zustand/shallow';
import toast, { Toaster } from 'react-hot-toast';
import useStore from '../../store/Zustand/store';
import { useDispatch } from 'react-redux';
import { setAttackScene, setTableOpen } from '../../store/slices/CurrentIdSlice';
import ColorTheme from '../../themes/ColorTheme';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const selector = (state) => ({
  create: state.createPropmt,
  modelId: state.model?._id,
  getAttackScenario: state.getAttackScenario,
  getGlobalAttackTrees: state.getGlobalAttackTrees
});

export default React.memo(function PromptModal({ handleClose, open, refreshAPI }) {
  const color = ColorTheme();
  const dispatch = useDispatch();
  const { create, modelId, getAttackScenario, getGlobalAttackTrees } = useStore(selector, shallow);
  const [templateDetails, setTemplateDetails] = useState({ name: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback((e) => {
    setTemplateDetails((prev) => ({ ...prev, name: e.target.value }));
  }, []);

  const handleCreate = useCallback(() => {
    if (!templateDetails.name.trim()) {
      toast.error('Prompt is required');
      return;
    }

    setLoading(true);
    const newAttackTree = {
      modelId,
      promptKey: templateDetails.name.trim()
    };

    create(newAttackTree, modelId)
      .then((res) => {
        if (!res.error && res.status !== 500) {
          toast.success(res.message ?? 'Attack tree created successfully');
          getAttackScenario(modelId);
          getGlobalAttackTrees(modelId);
          dispatch(setTableOpen('Attack Trees Canvas'));
          dispatch(setAttackScene(res?.scene));
          setTemplateDetails({ name: '' });
          handleClose();
        } else {
          toast.error(res.error ?? `${res?.data} ,Try using a different name` ?? 'Error creating attack tree');
        }
      })
      .catch((err) => {
        // console.log('err', err);
        toast.error('Something went wrong');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [create, modelId, getAttackScenario, getGlobalAttackTrees, dispatch, templateDetails, handleClose]);

  return (
    <>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-labelledby="prompt-modal-dialog-title"
        aria-describedby="prompt-modal-dialog-description"
        maxWidth="sm"
        sx={{
          '& .MuiPaper-root': {
            background: color?.modalBg,
            width: '475px',
            borderRadius: '8px'
          }
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4 }}>
            <CircularProgress />
            <Typography variant="h6" sx={{ mt: 2, color: color?.title }}>
              Generating Attack Tree...
            </Typography>
          </Box>
        ) : (
          <>
            <DialogTitle sx={{ fontSize: 18, fontFamily: 'Inter', p: 2 }}>Create Attack Tree</DialogTitle>
            <DialogContent sx={{ p: 2 }}>
              <DialogContentText id="prompt-modal-dialog-description">
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <FormLabel sx={{ fontWeight: 600, color: color?.title, mb: 1 }} required>
                      Prompt
                    </FormLabel>
                    <TextField
                      value={templateDetails.name}
                      onChange={handleChange}
                      variant="outlined"
                      placeholder="Enter prompt for attack tree"
                      size="small"
                      fullWidth
                      required
                      aria-label="Prompt"
                      sx={{ bgcolor: color?.inputBg }}
                    />
                  </Box>
                </Box>
              </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ p: 2, gap: 1 }}>
              <Button
                variant="outlined"
                color="error"
                onClick={handleClose}
                disabled={loading}
                sx={{ textTransform: 'none', minWidth: '80px' }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleCreate}
                disabled={loading || !templateDetails.name.trim()}
                sx={{ textTransform: 'none', minWidth: '80px' }}
                startIcon={loading && <CircularProgress size={16} />}
              >
                Create
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      <Toaster position="top-right" reverseOrder={false} />
    </>
  );
});
