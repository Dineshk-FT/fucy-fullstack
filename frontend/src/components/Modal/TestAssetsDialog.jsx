/* eslint-disable */
import React, { useState, useEffect } from 'react';
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
  InputLabel,
  IconButton,
  Tab,
  Tabs,
  Chip,
  Paper,
  Divider
} from '@mui/material';
import toast from 'react-hot-toast';
import { createPortal } from 'react-dom';
import { ADD_CALL } from '../../services/api';
import { configuration } from '../../services/baseApiService';
import DeleteIcon from '@mui/icons-material/Delete';
import { nanoid } from 'nanoid';
import useStore from '../../store/Zustand/store';
import { useDispatch, useSelector } from 'react-redux';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import { useNavigate } from 'react-router';
import { setModelId } from '../../store/slices/PageSectionSlice';
import { closeAll } from '../../store/slices/CurrentIdSlice';

const systemInputPromptDefault = `You are an automotive cybersecurity architect. Based on the given system name, generate a JSON list of the most important system inputs required to perform a Threat Analysis and Risk Assessment (TARA) according to ISO/SAE 21434. Provide 5–6 key inputs with short, realistic example values that reflect the technical elements, operational context, and dependencies of the system and its ecosystem.`;

const damageScenarioPromptDefault = `Generate 2 damage scenarios for the system according to ISO/SAE 21434 Clause 15.
Each damage scenario must include:
- Name: short, descriptive name
- Description: detailed explanation of the scenario with threat reasoning (CWE → CAPEC → MITRE ATT&CK)
- Cyber losses: list of affected security properties (Integrity, Confidentiality, Availability, Authenticity)
- Impact ratings: Safety, Financial, Operational, Privacy impacts (Severe/Major/Moderate/Minor/Negligible)
- Affected component: reference to actual component from the system architecture

Use the RAG knowledge base to incorporate real threat intelligence from CWE, CAPEC, and MITRE ATT&CK.`;

const selector = (state) => ({
  getSystemInputs: state.getSystemInputs,
  systemInputs: state.systemInputs,
  assets: state.assets,
  damageScenarios: state.damageScenarios,
  getDamageScenarios: state.getDamageScenarios
});

const TestAssetsDialog = ({ open, handleClose, modelMeta }) => {
  const [activeTab, setActiveTab] = useState(0); // 0 = Assets, 1 = Damage Scenarios
  const [fieldsVisible, setFieldsVisible] = useState(false);
  const [manualFields, setManualFields] = useState([]);
  const [formValues, setFormValues] = useState({ systemName: '' });
  const [systemInputPrompt, setSystemInputPrompt] = useState(systemInputPromptDefault);
  const [damagePrompt, setDamagePrompt] = useState(damageScenarioPromptDefault);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [damageResult, setDamageResult] = useState(null);

  const { userDetails } = useSelector((state) => state?.userDetails);
  const { systemInputs, getSystemInputs, assets, damageScenarios, getDamageScenarios } = useStore(selector);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setFieldsVisible(false);
      setManualFields([]);
      setFormValues({ systemName: '' });
      setSystemInputPrompt(systemInputPromptDefault);
      setDamagePrompt(damageScenarioPromptDefault);
      setResult(null);
      setDamageResult(null);
      setActiveTab(0);
    }
  }, [open]);

  // Update form values when system inputs are fetched
  useEffect(() => {
    if (systemInputs?.length) {
      const inputMap = systemInputs.reduce((acc, { label, value }) => {
        acc[label] = value;
        return acc;
      }, {});
      setFormValues((prev) => ({ ...prev, ...inputMap }));
    }
  }, [systemInputs]);

  const handleAddManualField = (e) => {
    e.stopPropagation();
    setFieldsVisible(true);
    setManualFields((prev) => [...prev, { id: nanoid(), label: '', value: '' }]);
  };

  const handleManualChange = (id, field, value, e) => {
    e.stopPropagation();
    setManualFields((prev) => prev.map((f) => (f.id === id ? { ...f, [field]: value } : f)));
  };

  const handleRemoveField = (id, isManual = false) => {
    if (isManual) {
      setManualFields((prev) => prev.filter((field) => field.id !== id));
    } else {
      setFormValues((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
      useStore.setState((state) => ({
        systemInputs: state.systemInputs.filter((field) => field.label !== id)
      }));
    }
  };

  const handleChange = (field) => (event) => {
    event.stopPropagation();
    setFormValues((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSystemInputs = async (e) => {
    e.stopPropagation();
    setLoading(true);
    await getSystemInputs(formValues.systemName, systemInputPrompt);
    setLoading(false);
    setFieldsVisible(true);
  };

  const renderDynamicFields = () => {
    const fetchedFields = systemInputs?.map(({ label }) => (
      <React.Fragment key={label}>
        <Grid item xs={4}>
          <InputLabel sx={{ color: '#000', fontWeight: 600 }}>{label.charAt(0).toUpperCase() + label.slice(1)}</InputLabel>
        </Grid>
        <Grid item xs={7}>
          <TextField fullWidth variant="outlined" value={formValues[label] || ''} onChange={handleChange(label)} />
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
          <TextField fullWidth placeholder="Label" value={label} onChange={(e) => handleManualChange(id, 'label', e.target.value, e)} />
        </Grid>
        <Grid item xs={7}>
          <TextField fullWidth placeholder="Value" value={value} onChange={(e) => handleManualChange(id, 'value', e.target.value, e)} />
        </Grid>
        <Grid item xs={1}>
          <IconButton onClick={() => handleRemoveField(id, true)} color="error">
            <DeleteIcon />
          </IconButton>
        </Grid>
      </React.Fragment>
    ));

    return [...(fetchedFields || []), ...manualInputFields];
  };

  const onClose = (e) => {
    e.stopPropagation();
    setFieldsVisible(false);
    setManualFields([]);
    setFormValues({ systemName: '' });
    setSystemInputPrompt(systemInputPromptDefault);
    setDamagePrompt(damageScenarioPromptDefault);
    setResult(null);
    setDamageResult(null);
    setActiveTab(0);
    handleClose();
  };
  // Generate Assets (Item Definition)
  const handleGenerateAssets = async (e) => {
    e.stopPropagation();
    try {
      setGenerating(true);

      const payload = {
        modelId: modelMeta?.modelId,
        itemDefinitionPrompt: 'Generate item definition based on the provided system inputs',
        systemName: formValues.systemName,
        createdBy: userDetails?.username,
        ...manualFields.reduce((acc, { label, value }) => {
          if (label.trim()) acc[label] = value;
          return acc;
        }, {}),
        ...systemInputs?.reduce((acc, { label, value }) => {
          if (label.trim()) acc[label] = value;
          return acc;
        }, {})
      };

      const response = await fetch(`${configuration.apiBaseUrl}v1/generate/model`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': sessionStorage.getItem('user-id')
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Server error: ${response.status}`);
      }

      const res = await response.json();

      if (res.error) {
        throw new Error(res.error);
      }

      if (res.message?.toLowerCase().includes('error')) {
        throw new Error(res.message);
      }
      setResult(res?.message || res?.data || 'Item definition generated successfully');
      toast.success('✅ Item definition generated successfully');

      // Refresh assets data
      if (modelMeta?.modelId) {
        navigate(`/Models/${res?.model_id}`);
        dispatch(setModelId(res?.model_id));
        await useStore.getState().getModels();
        dispatch(closeAll());
        onClose(e);
      }
    } catch (err) {
      console.error('Generation error:', err);
      toast.error(err.message || 'Generation failed');
      setResult(`Error: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  // Generate Damage Scenarios
  const handleGenerateDamageScenarios = async () => {
    try {
      // Check if assets exist first
      if (!assets?.Details?.length && !assets?.template?.nodes?.length) {
        toast.error('Please generate Item Definition first before creating Damage Scenarios.');
        return;
      }

      setGenerating(true);

      const payload = {
        modelId: modelMeta?.modelId,
        systemName: modelMeta?.systemName || formValues.systemName,
        damageScenarioPrompt: damagePrompt,
        template: JSON.stringify(assets?.template || {}),
        use_rag: true // Enable RAG enhancement
      };

      // console.log('Sending damage scenario payload:', payload);

      const response = await fetch(`${configuration.apiBaseUrl}v1/generate/damage-scenarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': sessionStorage.getItem('user-id')
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Server error: ${response.status}`);
      }

      const res = await response.json();

      if (res.error) {
        throw new Error(res.error);
      }

      if (res.message?.toLowerCase().includes('error')) {
        throw new Error(res.message);
      }

      setDamageResult(res?.scenarios || res);
      toast.success(res.message || '✅ Damage Scenarios generated successfully');

      // Refresh damage scenarios data
      if (modelMeta?.modelId) {
        await getDamageScenarios(modelMeta.modelId);
      }
    } catch (err) {
      console.error('Damage scenario generation error:', err);
      toast.error(err.message || 'Damage scenario generation failed');
      setDamageResult(`Error: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  // Check if assets are generated
  const hasAssets = assets?.Details?.length > 0 || assets?.template?.nodes?.length > 0;

  return (
    <>
      <Dialog open={open} onClose={onClose} sx={{ '& .MuiPaper-root': { maxWidth: 800, minWidth: 600 } }} disablePortal>
        <DialogTitle>
          <Typography variant="h4" color="primary">
            AI-Assisted Generation
          </Typography>
          <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)} sx={{ mt: 2 }}>
            <Tab label="Item Definition (Assets)" />
            <Tab
              label="Damage Scenarios"
              icon={hasAssets ? <CheckCircleIcon fontSize="small" color="success" /> : <PendingIcon fontSize="small" color="warning" />}
              iconPosition="end"
            />
          </Tabs>
        </DialogTitle>

        <DialogContent dividers>
          {/* Tab 0: Assets Generation */}
          {activeTab === 0 && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <InputLabel>System Name</InputLabel>
                </Grid>
                <Grid item xs={8}>
                  <TextField
                    fullWidth
                    value={formValues.systemName}
                    onChange={(e) => {
                      e.stopPropagation();
                      setFormValues({ ...formValues, systemName: e.target.value });
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    label="System Input Prompt"
                    value={systemInputPrompt}
                    onChange={(e) => {
                      e.stopPropagation();
                      setSystemInputPrompt(e.target.value);
                    }}
                  />
                </Grid>

                {/* Uncomment to enable manual field addition */}
                {/* <Grid item xs={12} display="flex" justifyContent="space-between" sx={{ mt: 1 }}>
                  <Button variant="outlined" onClick={handleAddManualField}>
                    Add Manual Field
                  </Button>
                  <Button variant="contained" onClick={handleSystemInputs} disabled={!formValues.systemName.trim()}>
                    {loading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Get System Inputs'}
                  </Button>
                </Grid> */}

                {fieldsVisible && (
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                      System Input Fields
                    </Typography>
                    <Grid container spacing={1}>
                      {renderDynamicFields()}
                    </Grid>
                  </Grid>
                )}

                {result && (
                  <Grid item xs={12}>
                    <Box
                      sx={{
                        bgcolor: '#f8f8f8',
                        mt: 2,
                        p: 2,
                        borderRadius: 2,
                        maxHeight: 200,
                        overflowY: 'auto'
                      }}
                    >
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}

          {/* Tab 1: Damage Scenarios Generation */}
          {activeTab === 1 && (
            <Box>
              {!hasAssets ? (
                <Paper sx={{ p: 3, bgcolor: '#fff3e0', textAlign: 'center' }}>
                  <Typography variant="body1" color="warning.main">
                    ⚠️ No assets found. Please generate Item Definition first before creating Damage Scenarios.
                  </Typography>
                  <Button variant="outlined" sx={{ mt: 2 }} onClick={() => setActiveTab(0)}>
                    Go to Item Definition
                  </Button>
                </Paper>
              ) : (
                <>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    System: <strong>{modelMeta?.systemName || formValues.systemName}</strong>
                    {assets?.Details?.length > 0 && <Chip label={`${assets.Details.length} components`} size="small" sx={{ ml: 1 }} />}
                  </Typography>

                  <TextField
                    fullWidth
                    multiline
                    minRows={4}
                    label="Damage Scenario Prompt (Optional)"
                    value={damagePrompt}
                    onChange={(e) => {
                      e.stopPropagation();
                      setDamagePrompt(e.target.value);
                    }}
                    helperText="Customize the prompt to guide damage scenario generation. Leave empty to use default."
                    sx={{ mb: 2 }}
                  />

                  {damageResult && (
                    <Box
                      sx={{
                        bgcolor: '#f8f8f8',
                        mt: 2,
                        p: 2,
                        borderRadius: 2,
                        maxHeight: 300,
                        overflowY: 'auto'
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                        Generated Damage Scenarios:
                      </Typography>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {typeof damageResult === 'string' ? damageResult : JSON.stringify(damageResult, null, 2)}
                      </Typography>
                    </Box>
                  )}
                </>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          {activeTab === 0 ? (
            <Button variant="contained" onClick={handleGenerateAssets} disabled={!formValues.systemName.trim() || generating}>
              {generating ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Generate Assets'}
            </Button>
          ) : (
            <Button variant="contained" onClick={handleGenerateDamageScenarios} disabled={!hasAssets || generating} color="secondary">
              {generating ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Generate Damage Scenarios'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {createPortal(
        <Backdrop
          open={generating}
          sx={{
            color: '#fff',
            zIndex: 2000,
            flexDirection: 'column',
            gap: 2
          }}
        >
          <CircularProgress color="inherit" />
          <Typography>{activeTab === 0 ? 'Generating Item Definition...' : 'Generating Damage Scenarios with RAG...'}</Typography>
        </Backdrop>,
        document.body
      )}
    </>
  );
};

export default TestAssetsDialog;
