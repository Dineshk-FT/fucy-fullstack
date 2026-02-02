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
  IconButton
} from '@mui/material';
import toast from 'react-hot-toast';
import { createPortal } from 'react-dom';
import { ADD_CALL } from '../../services/api';
import { configuration } from '../../services/baseApiService';
import DeleteIcon from '@mui/icons-material/Delete';
import { nanoid } from 'nanoid';
import useStore from '../../store/Zustand/store';

const basePrompts = {
  itemDefinitionPrompt: `Define the Item according to ISO/SAE 21434.
Include: item name, purpose, operational description, boundaries, interfaces, assumptions, dependencies, stakeholders, and a system diagram.`,

  damageScenarioPrompt: `Generate damage scenarios for the system.
Include: name, description, affected component, cyber losses (CIAA), and impact ratings (Safety, Financial, Operational, Privacy).`,

  threatScenarioPrompt: `Generate threat scenarios using STRIDE categories.
Each should include: targeted component, attack vector, attacker goal, and related damage scenario.`,

  attackscenarioPrompt: `Generate attack trees for critical threat scenarios.
Rules: root = threat scenario, must include at least one AND/OR gate, events connect through gates, not directly.`,

  cybersecurityPrompt: `Generate cybersecurity goals and mitigations for each scenario.
Each goal should link to a damage/threat/attack scenario and include objectives (CIAA) and possible countermeasures.`
};

const systemInputPromptDefault = `You are an automotive cybersecurity architect. Based on the given system name, generate a JSON list of the most important system inputs required to perform a Threat Analysis and Risk Assessment (TARA) according to ISO/SAE 21434. Provide 5–6 key inputs with short, realistic example values that reflect the technical elements, operational context, and dependencies of the system and its ecosystem.`;

const selector = (state) => ({
  getSystemInputs: state.getSystemInputs,
  systemInputs: state.systemInputs,
  assets: state.assets,
  damageScenarios: state.damageScenarios,
  threatScenarios: state.threatScenarios,
  attackScenarios: state.attackScenarios,
  cybersecurity: state.cybersecurity
});

const ScenarioAIModal = ({ open, handleClose, scenarioType, modelMeta }) => {
  const [step, setStep] = useState(0);
  const [promptValue, setPromptValue] = useState('');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);

  // for item definition extra step
  const [fieldsVisible, setFieldsVisible] = useState(false);
  const [manualFields, setManualFields] = useState([]);
  const [formValues, setFormValues] = useState({ systemName: '' });
  const [systemInputPrompt, setSystemInputPrompt] = useState(systemInputPromptDefault);
  const [loading, setLoading] = useState(false);

  const { systemInputs, getSystemInputs, assets, damageScenarios, threatScenarios, attackScenarios, cybersecurity } = useStore(selector);

  // default prompt setup
  useEffect(() => {
    if (!scenarioType) return;
    const defaultPromptMap = {
      item: basePrompts.itemDefinitionPrompt,
      damage: basePrompts.damageScenarioPrompt,
      threat: basePrompts.threatScenarioPrompt,
      attack: basePrompts.attackscenarioPrompt,
      cybersecurity: basePrompts.cybersecurityPrompt
    };
    setPromptValue(defaultPromptMap[scenarioType] || '');
    setStep(0);
    setFormValues({ systemName: '' });
    setManualFields([]);
    setFieldsVisible(false);
    setSystemInputPrompt(systemInputPromptDefault);
    setResult(null);
  }, [scenarioType]);

  // field management (like GenerateModel)
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

  useEffect(() => {
    if (systemInputs?.length) {
      const inputMap = systemInputs.reduce((acc, { label, value }) => {
        acc[label] = value;
        return acc;
      }, {});
      setFormValues((prev) => ({ ...prev, ...inputMap }));
    }
  }, [systemInputs]);

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

  // config
  const scenarioConfig = {
    item: {
      label: 'Item Definition Prompt',
      api: `${configuration.apiBaseUrl}v1/generate/item-definition`,
      payload: () => ({
        modelId: modelMeta?.modelId,
        itemDefinitionPrompt: promptValue,
        systemName: formValues.systemName,
        ...manualFields.reduce((acc, { label, value }) => {
          if (label.trim()) acc[label] = value;
          return acc;
        }, {}),
        ...systemInputs?.reduce((acc, { label, value }) => {
          if (label.trim()) acc[label] = value;
          return acc;
        }, {})
      }),
      successMsg: '✅ Item definition generated successfully'
    },
    damage: {
      label: 'Damage Scenario Prompt',
      api: `${configuration.apiBaseUrl}v1/generate/damage-scenarios`,
      payload: () => ({
        modelId: modelMeta?.modelId,
        damageScenarioPrompt: promptValue,
        template: JSON.stringify(modelMeta?.template ?? {}),
        systemName: modelMeta?.systemName
      }),
      successMsg: '✅ Damage Scenarios generated successfully'
    },
    threat: {
      label: 'Threat Scenario Prompt',
      api: `${configuration.apiBaseUrl}v1/generate/full-threat-scenario`,
      payload: () => ({
        modelId: modelMeta?.modelId,
        threatScenarioPrompt: promptValue
      }),
      successMsg: '✅ Threat + Derived Threat Scenarios generated successfully'
    },
    attack: {
      label: 'Attack Scenario Prompt',
      api: `${configuration.apiBaseUrl}v1/generate/full-attack-scenario`,
      payload: () => ({
        modelId: modelMeta?.modelId,
        attackscenarioPrompt: promptValue
      }),
      successMsg: '✅ Full Attack Pipeline executed successfully'
    },
    cybersecurity: {
      label: 'Cybersecurity Prompt',
      api: `${configuration.apiBaseUrl}v1/generate/cybersecurity-artifacts`,
      payload: () => ({
        modelId: modelMeta?.modelId,
        cybersecurityPrompt: promptValue,
        systemName: modelMeta?.systemName
      }),
      successMsg: '✅ Cybersecurity Artifacts generated successfully'
    }
  };

  const handleGenerate = async () => {
    const config = scenarioConfig[scenarioType];
    if (!config) return;

    // 🔹 Dependency Validation
    switch (scenarioType) {
      case 'damage':
        if (!assets?.Details?.length) {
          toast.error('Please generate Item Definition first before creating Damage Scenarios.');
          return;
        }
        break;

      case 'threat':
        if (!damageScenarios.subs[0]?.Details?.length) {
          toast.error('Please generate Damage Scenarios first before creating Threat Scenarios.');
          return;
        }
        break;

      case 'attack':
        if (!threatScenarios?.subs[0]?.Details?.length) {
          toast.error('Please generate Threat Scenarios first before creating Attack Scenarios.');
          return;
        }
        break;

      case 'cybersecurity':
        if (!attackScenarios?.subs[0]?.scenes?.length) {
          toast.error('Please generate Attack Scenarios first before creating Cybersecurity Artifacts.');
          return;
        }
        break;

      default:
        break;
    }

    try {
      setGenerating(true);
      const res = await ADD_CALL(config.payload(), config.api);
      setResult(res?.message);
      toast.success(config.successMsg);

      // ✅ After successful generation, update store data
      if (modelMeta?.modelId) {
        switch (scenarioType) {
          case 'item':
            await useStore.getState().getAssets(modelMeta.modelId);
            break;
          case 'damage':
            await useStore.getState().getDamageScenarios(modelMeta.modelId);
            break;
          case 'threat':
            await useStore.getState().getThreatScenario(modelMeta.modelId);
            break;
          case 'attack':
            await useStore.getState().getAttackScenario(modelMeta.modelId);
            break;
          case 'cybersecurity':
            await useStore.getState().getCyberSecurityScenario(modelMeta.modelId);
            break;
          default:
            break;
        }
      }
    } catch (err) {
      toast.error(err.message || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const onClose = (e) => {
    e.stopPropagation();
    setPromptValue('');
    setResult(null);
    setStep(0);
    setManualFields([]);
    setFieldsVisible(false);
    setFormValues({ systemName: '' });
    setSystemInputPrompt(systemInputPromptDefault);
    handleClose();
  };

  if (!scenarioType) return null;

  const { label } = scenarioConfig[scenarioType];

  return (
    <>
      <Dialog open={open} onClose={onClose} sx={{ '& .MuiPaper-root': { maxWidth: 700, minWidth: 500 } }}>
        <DialogTitle>
          <Typography variant="h4" color="primary">
            {`Create ${scenarioType?.charAt(0).toUpperCase() + scenarioType.slice(1)} With AI`}
          </Typography>
        </DialogTitle>

        <DialogContent dividers>
          {scenarioType === 'item' ? (
            step === 0 ? (
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

                  <Grid item xs={12} display="flex" justifyContent="space-between">
                    <Button variant="outlined" onClick={handleAddManualField}>
                      Add Field
                    </Button>
                    <Button variant="contained" onClick={handleSystemInputs} disabled={!formValues.systemName.trim()}>
                      {loading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Get Fields'}
                    </Button>
                  </Grid>

                  {fieldsVisible && renderDynamicFields()}
                </Grid>
              </Box>
            ) : (
              <TextField
                fullWidth
                multiline
                minRows={4}
                label={label}
                value={promptValue}
                onChange={(e) => {
                  e.stopPropagation();
                  setPromptValue(e.target.value);
                }}
              />
            )
          ) : (
            <>
              <TextField
                fullWidth
                multiline
                minRows={4}
                label={label}
                value={promptValue}
                onChange={(e) => {
                  e.stopPropagation();
                  setPromptValue(e.target.value);
                }}
              />
              {result && (
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
                    {JSON.stringify(result, null, 2)}
                  </Typography>
                </Box>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          {scenarioType === 'item' ? (
            step === 0 ? (
              <Button
                variant="contained"
                onClick={() => setStep(1)}
                disabled={!formValues.systemName.trim() && manualFields.length === 0 && !systemInputs?.length}
              >
                Next
              </Button>
            ) : (
              <Button variant="contained" onClick={handleGenerate} disabled={!promptValue.trim()}>
                Generate
              </Button>
            )
          ) : (
            <Button variant="contained" onClick={handleGenerate} disabled={!promptValue.trim()}>
              Generate
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
          <Typography>Generating {scenarioType} ...</Typography>
        </Backdrop>,
        document.body
      )}
    </>
  );
};

export default ScenarioAIModal;
