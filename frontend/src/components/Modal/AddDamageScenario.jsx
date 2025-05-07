/*eslint-disable*/
import React, { useCallback, useState } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  Button,
  Box,
  TextField,
  Slide,
  CircularProgress,
  FormLabel,
} from '@mui/material';
import { shallow } from 'zustand/shallow';
import toast, { Toaster } from 'react-hot-toast';
import useStore from '../../store/Zustand/store';
import ColorTheme from '../../themes/ColorTheme';
import PaperComponent from './PaperComponent';
import { DamageIcon } from '../../assets/icons';
import DialogCommonTitle from './DialogCommonTitle';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const selector = (state) => ({
  addDamageScene: state.addDamageScene,
  getDamageScenarios: state.getDamageScenarios,
});

const notify = (message, status) => toast[status](message);

export default React.memo(function AddDamageScenarios({ open, handleClose, model, rows }) {
  const color = ColorTheme();
  const { addDamageScene, getDamageScenarios } = useStore(selector, shallow);
  const [templateDetails, setTemplateDetails] = useState({
    Name: '',
    'Description/ Scalability': '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setTemplateDetails((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleCreate = useCallback(() => {
    if (!templateDetails.Name.trim()) {
      notify('Name is required', 'error');
      return;
    }

    setLoading(true);
    const details = {
      'model-id': model?._id,
      Name: templateDetails.Name.trim(),
      Description: templateDetails['Description/ Scalability'].trim(),
    };

    addDamageScene(details)
      .then((res) => {
        if (res.message) {
          notify(res.message, 'success');
          getDamageScenarios(model?._id);
          setTemplateDetails({ Name: '', 'Description/ Scalability': '' });
          handleClose();
        } else {
          notify('Something went wrong', 'error');
        }
      })
      .catch(() => {
        notify('Something went wrong', 'error');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [addDamageScene, getDamageScenarios, model?._id, templateDetails, handleClose]);

  return (
    <>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        PaperComponent={PaperComponent}
        aria-labelledby="add-damage-scenario-dialog-title"
        aria-describedby="add-damage-scenario-dialog-description"
        maxWidth="sm"
        sx={{
          '& .MuiPaper-root': {
            background: color?.modalBg,
            width: '475px',
            borderRadius: '8px',
          },
        }}
      >
        <DialogCommonTitle icon={DamageIcon} title="Add Damage Scenario" />
        <DialogContent sx={{ p: 2 }}>
          <DialogContentText id="add-damage-scenario-dialog-description">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <FormLabel sx={{ fontWeight: 600, color: color?.title, mb: 1 }} required>
                  Name
                </FormLabel>
                <TextField
                  name="Name"
                  value={templateDetails.Name}
                  onChange={handleChange}
                  variant="outlined"
                  placeholder="Enter name"
                  size="small"
                  fullWidth
                  required
                  aria-label="Name"
                  sx={{ bgcolor: color?.inputBg }}
                />
              </Box>
              <Box>
                <FormLabel sx={{ fontWeight: 600, color: color?.title, mb: 1 }}>
                  Description
                </FormLabel>
                <TextField
                  name="Description/ Scalability"
                  value={templateDetails['Description/ Scalability']}
                  onChange={handleChange}
                  variant="outlined"
                  placeholder="Enter description"
                  size="small"
                  multiline
                  rows={4}
                  fullWidth
                  aria-label="Description"
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
            disabled={loading || !templateDetails.Name.trim()}
            sx={{ textTransform: 'none', minWidth: '80px' }}
            startIcon={loading && <CircularProgress size={16} />}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
      <Toaster position="top-right" reverseOrder={false} />
    </>
  );
});