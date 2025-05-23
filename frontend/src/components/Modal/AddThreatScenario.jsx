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
import DialogCommonTitle from './DialogCommonTitle';
import { ThreatIcon } from '../../assets/icons';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const selector = (state) => ({
  addScene: state.addThreatScene,
  getThreatScenario: state.getThreatScenario,
});

export default React.memo(function AddThreatScenarios({ open, handleClose, id }) {
  const color = ColorTheme();
  const { addScene, getThreatScenario } = useStore(selector, shallow);
  const [templateDetails, setTemplateDetails] = useState({
    name: '',
    Description: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setTemplateDetails((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleCreate = useCallback(() => {
    if (!templateDetails.name.trim()) {
      toast.error('Name is required');
      return;
    }

    setLoading(true);
    const details = {
      name: templateDetails.name.trim(),
      Description: templateDetails.Description.trim(),
      'model-id': id,
    };

    addScene(details)
      .then((res) => {
        if (res) {
          toast.success(res?.message ?? 'Threat scenario created');
          getThreatScenario(id);
          setTemplateDetails({ name: '', Description: '' });
          handleClose();
        }
      })
      .catch(() => {
        toast.error('Something went wrong');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [addScene, getThreatScenario, id, templateDetails, handleClose]);

  return (
    <>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        PaperComponent={PaperComponent}
        aria-labelledby="add-threat-scenario-dialog-title"
        aria-describedby="add-threat-scenario-dialog-description"
        maxWidth="sm"
        sx={{
          '& .MuiPaper-root': {
            background: color?.modalBg,
            width: '475px',
            borderRadius: '8px',
          },
        }}
      >
        <DialogCommonTitle icon={ThreatIcon} title="Add Threat Scenario" />
        <DialogContent sx={{ p: 2 }}>
          <DialogContentText id="add-threat-scenario-dialog-description">
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
                  name="Description"
                  value={templateDetails.Description}
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
            disabled={loading || !templateDetails.name.trim()}
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