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
  Paper,
  CircularProgress,
  FormLabel,
} from '@mui/material';
import { shallow } from 'zustand/shallow';
import { useParams } from 'react-router';
import toast, { Toaster } from 'react-hot-toast';
import useStore from '../../store/Zustand/store';
import ColorTheme from '../../themes/ColorTheme';
import Draggable from 'react-draggable';
import DialogCommonTitle from './DialogCommonTitle';
import { AttackIcon } from '../../assets/icons';

function PaperComponent(props) {
  const nodeRef = React.useRef(null);
  return (
    <Draggable nodeRef={nodeRef} handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} ref={nodeRef} />
    </Draggable>
  );
}

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const selector = (state) => ({
  model: state.model,
  addAttackScene: state.addAttackScene,
  getAttackScenario: state.getAttackScenario,
});

export default React.memo(function CommonModal({ open, handleClose, name }) {
  const color = ColorTheme();
  const { id } = useParams();
  const { model, addAttackScene, getAttackScenario } = useStore(selector, shallow);
  const [templateDetails, setTemplateDetails] = useState({ name: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback((e) => {
    setTemplateDetails((prev) => ({ ...prev, name: e.target.value }));
  }, []);

  const handleCreate = useCallback(() => {
    if (!templateDetails.name.trim()) {
      toast.error('Name is required');
      return;
    }

    setLoading(true);
    const newScene = {
      modelId: model?._id,
      type: name === 'Attack' ? 'attack' : 'attack_trees',
      name: templateDetails.name.trim(),
    };

    addAttackScene(newScene)
      .then((res) => {
        if (!res.error) {
          toast.success('Added successfully');
          getAttackScenario(model?._id);
          setTemplateDetails({ name: '' });
          handleClose();
        } else {
          toast.error(res?.error ?? 'Something went wrong');
        }
      })
      .catch(() => {
        toast.error('Something went wrong');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [addAttackScene, getAttackScenario, model?._id, name, templateDetails, handleClose]);

  return (
    <>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        PaperComponent={PaperComponent}
        onClose={handleClose}
        aria-labelledby="common-modal-dialog-title"
        maxWidth="sm"
        sx={{
          '& .MuiPaper-root': {
            background: color?.modalBg,
            width: '475px',
            borderRadius: '8px',
          },
        }}
      >
        <DialogCommonTitle icon={AttackIcon} title={`Add New ${name}`} />
        <DialogContent sx={{ p: 2 }}>
          <DialogContentText id="common-modal-dialog-description">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <FormLabel sx={{ fontWeight: 600, color: color?.title, mb: 1 }} required>
                  Name
                </FormLabel>
                <TextField
                  name="name"
                  value={templateDetails.name}
                  onChange={handleChange}
                  variant="outlined"
                  placeholder={`Enter ${name.toLowerCase()} name`}
                  size="small"
                  fullWidth
                  required
                  aria-label="Name"
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
            Add
          </Button>
        </DialogActions>
      </Dialog>
      <Toaster position="top-right" reverseOrder={false} />
    </>
  );
});