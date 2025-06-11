import React, { useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  CircularProgress
} from '@mui/material';
import toast, { Toaster } from 'react-hot-toast';
import ColorTheme from '../../themes/ColorTheme';

export default React.memo(function SelectCyberGoals({
  riskTreatment,
  type,
  details,
  open,
  handleClose,
  selectedScenes,
  setSelectedScenes,
  updateRiskTreatment,
  selectedRow,
  refreshAPI,
  model
}) {
  const color = ColorTheme();
  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    const getCybersecurity = () => {
      const matchingDetail = riskTreatment['Details'].find((detail) => detail.threat_key === selectedRow.threat_key);
      return type.includes('Goals')
        ? matchingDetail?.cybersecurity?.cybersecurity_goals || []
        : matchingDetail?.cybersecurity?.cybersecurity_claims || [];
    };
    setSelectedScenes(getCybersecurity());
  }, [selectedRow, riskTreatment, type, setSelectedScenes]);

  const handleChange = useCallback(
    (scene) => {
      setSelectedScenes((prev) => (prev.some((s) => s.ID === scene.ID) ? prev.filter((s) => s.ID !== scene.ID) : [...prev, scene]));
    },
    [setSelectedScenes]
  );

  const handleClick = useCallback(() => {
    if (!selectedScenes.length) {
      toast.error('Please select at least one item');
      return;
    }

    setLoading(true);
    const payload = {
      cyberDetails: selectedScenes.map((scene) => scene.ID),
      threatId: selectedRow.ID,
      type: type.includes('Goals') ? 'cybersecurity_goals' : 'cybersecurity_claims',
      threatKey: selectedRow?.threat_key,
      'model-id': model?._id
    };

    updateRiskTreatment(payload)
      .then((res) => {
        if (!res.error) {
          toast.success(res.message ?? 'Selection updated successfully');
          setLoading(false);
          refreshAPI();
          handleClose();
        } else {
          toast.error(res.error ?? 'Update failed');
        }
      })
      .catch(() => {
        toast.error('Something went wrong');
      });
  }, [updateRiskTreatment, selectedScenes, selectedRow, model, handleClose]);

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="select-cyber-goals-dialog-title"
        aria-describedby="select-cyber-goals-dialog-description"
        maxWidth="md"
        sx={{
          '& .MuiPaper-root': {
            background: color?.modalBg,
            width: '600px',
            height: '400px',
            borderRadius: '8px'
          }
        }}
      >
        <DialogTitle variant="h4" color="primary" sx={{ fontSize: 18, fontFamily: 'Inter', p: 2 }}>
          Select {type.includes('Goals') ? 'Cybersecurity Goals' : 'Cybersecurity Claims'}
        </DialogTitle>
        <DialogContent sx={{ p: 2, overflow: 'auto' }}>
          <DialogContentText id="select-cyber-goals-dialog-description">
            <FormGroup>
              {details?.map((detail) => (
                <FormControlLabel
                  key={detail?.ID}
                  sx={{
                    my: -0.5,
                    '& .MuiTypography-root': {
                      fontSize: '14px',
                      color: color?.sidebarContent
                    }
                  }}
                  control={
                    <Checkbox
                      size="small"
                      checked={selectedScenes.some((s) => s.ID === detail.ID)}
                      onChange={() => handleChange(detail)}
                      aria-label={`Select ${detail?.Name}`}
                    />
                  }
                  label={detail?.Name}
                />
              ))}
            </FormGroup>
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
            Close
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleClick}
            disabled={loading || !selectedScenes.length}
            sx={{ textTransform: 'none', minWidth: '80px' }}
            startIcon={loading && <CircularProgress size={16} />}
          >
            Okay
          </Button>
        </DialogActions>
      </Dialog>
      <Toaster position="top-right" reverseOrder={false} />
    </>
  );
});
