import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  InputLabel,
  CircularProgress,
  Backdrop,
  IconButton
} from '@mui/material';
import { createPortal } from 'react-dom';
import useStore from '../../store/Zustand/store';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { setModelId } from '../../store/slices/PageSectionSlice';
import { closeAll } from '../../store/slices/CurrentIdSlice';
import DeleteIcon from '@mui/icons-material/Delete';
import { nanoid } from 'nanoid';

const selector = (state) => ({
  getSystemInputs: state.getSystemInputs,
  systemInputs: state.systemInputs,
  generateFullModel: state.generateFullModel
});

const GenerateModel = ({ open, handleClose }) => {
  const { systemInputs, getSystemInputs, generateFullModel } = useStore(selector);
  const { userDetails } = useSelector((state) => state?.userDetails);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [step, setStep] = useState(0); // 👈 step tracker
  const [formValues, setFormValues] = useState({ systemName: '' });
  const [systemInputPrompt, setSystemInputPrompt] = useState('');
  const [promptValues, setPromptValues] = useState({
    itemDefinitionPrompt: '',
    damageScenarioPrompt: '',
    threatScenarioPrompt: '',
    attackscenarioPrompt: '',
    cybersecurityPrompt: ''
  });

  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [fieldsVisible, setFieldsVisible] = useState(false);
  const [manualFields, setManualFields] = useState([]);

  const handleChange = (field) => (event) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handlePromptChange = (field) => (event) => {
    setPromptValues((prev) => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const onClose = () => {
    setStep(0);
    setFormValues({ systemName: '' });
    setPromptValues({
      itemDefinitionPrompt: '',
      damageScenarioPrompt: '',
      threatScenarioPrompt: '',
      attackscenarioPrompt: '',
      cybersecurityPrompt: ''
    });
    setSystemInputPrompt('');
    setManualFields([]);
    setFieldsVisible(false);
    handleClose();
  };

  const handleAddManualField = () => {
    setFieldsVisible(true);
    setManualFields((prev) => [...prev, { id: nanoid(), label: '', value: '' }]);
  };

  const handleManualChange = (id, field, value) => {
    setManualFields((prev) => prev.map((f) => (f.id === id ? { ...f, [field]: value } : f)));
  };

  const handleRemoveField = (key, isManual = false) => {
    if (isManual) {
      setManualFields((prev) => prev.filter((field) => field.id !== key));
    } else {
      setFormValues((prev) => {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      });
      useStore.setState((state) => ({
        systemInputs: state.systemInputs.filter((field) => field.label !== key)
      }));
    }
  };

  const handleSystemInputs = async () => {
    setLoading(true);
    await getSystemInputs(formValues.systemName, systemInputPrompt); // 👈 pass prompt too
    setLoading(false);
    setFieldsVisible(true);
  };

  const handleNext = () => {
    if (step === 0) {
      setStep(1);
    } else {
      handlegenerateFullModel();
    }
  };

  const handlegenerateFullModel = async () => {
    setGenerating(true);

    const mergedFormValues = {
      createdBy: userDetails?.username,
      ...formValues,
      ...manualFields.reduce((acc, { label, value }) => {
        if (label.trim()) acc[label] = value;
        return acc;
      }, {}),
      ...promptValues
    };

    try {
      const res = await generateFullModel(mergedFormValues);
      if (!res.error) {
        toast.success(res?.message ?? 'Generated Successfully');
        setTimeout(() => {
          navigate(`/Models/${res?.model?.model_id}`);
          dispatch(setModelId(res?.model?.model_id));
          dispatch(closeAll());
          onClose();
        }, 1000);
      } else {
        toast.error(res?.error ?? 'Something went wrong');
      }
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    if (systemInputs?.length) {
      const inputMap = systemInputs.reduce((acc, { label, value }) => {
        acc[label] = value;
        return acc;
      }, {});
      setFormValues((prev) => ({
        ...prev,
        ...inputMap
      }));
    }
  }, [systemInputs]);

  const renderDynamicFields = () => {
    const fetchedFields = systemInputs?.map(({ label }) => (
      <React.Fragment key={label}>
        <Grid item xs={4} display="flex" alignItems="center" gap={1}>
          <InputLabel sx={{ color: '#000', fontWeight: 600, flexGrow: 1 }}>
            {label.charAt(0).toUpperCase() + label.slice(1).replace(/([A-Z])/g, ' $1')}
          </InputLabel>
        </Grid>
        <Grid item xs={7}>
          <TextField
            fullWidth
            variant="outlined"
            sx={{ '& .MuiInputBase-input': { color: '#575757' } }}
            value={formValues[label] || ''}
            onChange={handleChange(label)}
          />
        </Grid>
        <Grid item xs={1}>
          <IconButton onClick={() => handleRemoveField(label)} color="error">
            <DeleteIcon />
          </IconButton>
        </Grid>
      </React.Fragment>
    ));

    const manualInputFields = manualFields.map(({ id, label, value }) => (
      <React.Fragment key={`manual-${id}`}>
        <Grid item xs={4}>
          <TextField
            fullWidth
            placeholder="Label"
            variant="outlined"
            value={label}
            onChange={(e) => handleManualChange(id, 'label', e.target.value)}
          />
        </Grid>
        <Grid item xs={7}>
          <TextField
            fullWidth
            placeholder="Value"
            variant="outlined"
            value={value}
            onChange={(e) => handleManualChange(id, 'value', e.target.value)}
          />
        </Grid>
        <Grid item xs={1}>
          <IconButton onClick={() => handleRemoveField(id, true)} color="error">
            <DeleteIcon />
          </IconButton>
        </Grid>
      </React.Fragment>
    ));

    return [...fetchedFields, ...manualInputFields];
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} sx={{ '& .MuiPaper-root': { maxWidth: 700 } }}>
        <DialogTitle>
          <Typography variant="h4" color="primary">
            Create With AI
          </Typography>
        </DialogTitle>

        <DialogContent dividers sx={{ bgcolor: '#f7f7f7' }}>
          {step === 0 && (
            <Box sx={{ mb: 3 }}>
              <Grid container spacing={2} alignItems="center">
                {/* System Name */}
                <Grid item xs={4}>
                  <InputLabel sx={{ color: '#000', fontWeight: 600 }}>System Name</InputLabel>
                </Grid>
                <Grid item xs={8}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    sx={{ '& .MuiInputBase-input': { color: '#575757' } }}
                    value={formValues.systemName}
                    onChange={handleChange('systemName')}
                  />
                </Grid>

                {/* System Input Prompt */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    label="System Input Prompt"
                    placeholder="Provide extra instructions for fetching system inputs..."
                    value={systemInputPrompt}
                    onChange={(e) => setSystemInputPrompt(e.target.value)}
                  />
                </Grid>

                {/* Buttons */}
                <Grid item xs={12} display="flex" justifyContent="space-between">
                  <Button variant="outlined" onClick={handleAddManualField} disabled={loading || !formValues.systemName.trim()}>
                    Add Field
                  </Button>

                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSystemInputs}
                    disabled={loading || !formValues.systemName.trim()}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Get Fields'}
                  </Button>
                </Grid>

                {fieldsVisible && renderDynamicFields()}
              </Grid>
            </Box>
          )}

          {step === 1 && (
            <Grid container spacing={2}>
              <Typography variant="h4" color="dark" mt={2} ml={2.5}>
                Enter Your Prompt
              </Typography>
              {[
                { key: 'itemDefinitionPrompt', label: 'Item Definition' },
                { key: 'damageScenarioPrompt', label: 'Damage Scenario' },
                { key: 'threatScenarioPrompt', label: 'Threat Scenario' },
                { key: 'attackscenarioPrompt', label: 'Attack Scenario' },
                { key: 'cybersecurityPrompt', label: 'Cybersecurity' }
              ].map(({ key, label }) => (
                <Grid item xs={12} key={key}>
                  <TextField fullWidth multiline minRows={3} label={label} value={promptValues[key]} onChange={handlePromptChange(key)} />
                </Grid>
              ))}
            </Grid>
          )}
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" color="error" onClick={onClose}>
            Cancel
          </Button>
          {step > 0 && (
            <Button variant="outlined" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
          <Button variant="contained" onClick={handleNext} disabled={step === 0 && !fieldsVisible}>
            {step === 0 ? 'Next' : 'Generate'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Backdrop when generating */}
      {typeof window !== 'undefined' &&
        createPortal(
          <Backdrop
            open={generating}
            sx={{
              color: '#fff',
              zIndex: 2000,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2
            }}
          >
            <CircularProgress color="inherit" />
            <Typography variant="body1">Generating Model ...</Typography>
          </Backdrop>,
          document.body
        )}
    </>
  );
};

export default GenerateModel;
