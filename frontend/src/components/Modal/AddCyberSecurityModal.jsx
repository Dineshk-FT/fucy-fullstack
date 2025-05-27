/*eslint-disable*/
import React, { useCallback, useMemo, useState } from 'react';
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
import {
  CyberClaimsIcon,
  CyberControlsIcon,
  CyberGoalIcon,
  CyberRequireIcon,
} from '../../assets/icons';
import DialogCommonTitle from './DialogCommonTitle';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const selector = (state) => ({
  addScene: state.addcybersecurityScene,
  model: state.model,
  getCyberSecurityScenario: state.getCyberSecurityScenario,
});

const notify = (message, status) => toast[status](message);

export default React.memo(function AddCyberSecurityModal({ open, handleClose, name, id, type }) {
  const color = ColorTheme();
  const { addScene, model, getCyberSecurityScenario } = useStore(selector, shallow);
  const [templateDetails, setTemplateDetails] = useState({
    Name: '',
    Description: '',
  });
  const [loading, setLoading] = useState(false);

  const CommonIcon = useMemo(() => {
    const getIcon = {
      'Cybersecurity Goals': CyberGoalIcon,
      'Cybersecurity Requirements': CyberRequireIcon,
      'Cybersecurity Controls': CyberControlsIcon,
      'Cybersecurity Claims': CyberClaimsIcon,
    };
    return getIcon[name] || CyberGoalIcon;
  }, [name]);

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
      modelId: model?._id,
      type,
      name: templateDetails.Name.trim(),
      description: templateDetails.Description.trim(),
    };

    addScene(details)
      .then((res) => {
        if (!res.error) {
          getCyberSecurityScenario(model?._id);
          notify(res.message ?? 'Created successfully', 'success');
          setTemplateDetails({ Name: '', Description: '' });
          handleClose();
        } else {
          notify(res?.error ?? 'Something went wrong', 'error');
        }
      })
      .catch(() => {
        notify('Something went wrong', 'error');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [addScene, getCyberSecurityScenario, model?._id, templateDetails, handleClose, type]);

  return (
    <>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        PaperComponent={PaperComponent}
        aria-labelledby="add-cybersecurity-dialog-title"
        aria-describedby="add-cybersecurity-dialog-description"
        maxWidth="sm"
        sx={{
          '& .MuiPaper-root': {
            background: color?.modalBg,
            width: '475px',
            borderRadius: '8px',
          },
        }}
      >
        <DialogCommonTitle icon={CommonIcon} title={`Add ${name}`} />
        <DialogContent sx={{ p: 2 }}>
          <DialogContentText id="add-cybersecurity-dialog-description">
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