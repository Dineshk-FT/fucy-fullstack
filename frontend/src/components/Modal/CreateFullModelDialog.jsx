/* eslint-disable */
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  Backdrop,
  Grid,
  Alert
} from '@mui/material';
import toast from 'react-hot-toast';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router';
import { useDispatch } from 'react-redux';
import { setModelId } from '../../store/slices/PageSectionSlice';
import { closeAll } from '../../store/slices/CurrentIdSlice';

const CreateFullModelDialog = ({ open, handleClose, generateFullModel }) => {
  const [systemName, setSystemName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleGenerate = async (e) => {
    e?.stopPropagation();

    if (!systemName.trim()) {
      setError('Please enter a system name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await generateFullModel({ systemName: systemName.trim() });

      if (result?.error) {
        throw new Error(result.error);
      }

      if (result?.model_id) {
        toast.success('Full model generated successfully!');
        navigate(`/Models/${result.model_id}`);
        dispatch(setModelId(result.model_id));
        dispatch(closeAll());
        handleClose();
      } else {
        throw new Error('No model ID returned');
      }
    } catch (err) {
      console.error('Generation error:', err);
      setError(err.message || 'Failed to generate full model');
      toast.error(err.message || 'Failed to generate full model');
    } finally {
      setLoading(false);
    }
  };

  const handleSystemNameChange = (e) => {
    e.stopPropagation();
    setSystemName(e.target.value);
    if (error) setError(null);
  };

  const onClose = (e) => {
    e?.stopPropagation();
    setSystemName('');
    setError(null);
    handleClose();
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} sx={{ '& .MuiPaper-root': { maxWidth: 500, minWidth: 400 } }} disablePortal>
        <DialogTitle>
          <Typography variant="h4" color="primary">
            Create Full Model
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Generate a complete TARA model including Item Definition and Damage Scenarios
          </Typography>
        </DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="System Name"
                placeholder="e.g., Advanced Driver Assistance System"
                value={systemName}
                onChange={handleSystemNameChange}
                disabled={loading}
                autoFocus
              />
            </Grid>
            {error && (
              <Grid item xs={12}>
                <Alert severity="error">{error}</Alert>
              </Grid>
            )}
            <Grid item xs={12}>
              <Typography variant="caption" color="textSecondary">
                This will generate:
                <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                  <li>Item Definition (system architecture with components and data flows)</li>
                  <li>Damage Scenarios (with impact ratings)</li>
                </ul>
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleGenerate} disabled={!systemName.trim() || loading} color="primary">
            {loading ? 'Generating...' : 'Generate Full Model'}
          </Button>
        </DialogActions>
      </Dialog>

      {loading &&
        createPortal(
          <Backdrop
            open={loading}
            sx={{
              color: '#fff',
              zIndex: 2000,
              flexDirection: 'column',
              gap: 2
            }}
          >
            <CircularProgress color="inherit" />
            <Typography>Generating Full Model with AI...</Typography>
            <Typography variant="caption">This may take a moment</Typography>
          </Backdrop>,
          document.body
        )}
    </>
  );
};

export default CreateFullModelDialog;
