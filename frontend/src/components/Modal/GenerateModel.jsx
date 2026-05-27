/*eslint-disable*/
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
import { ADD_CALL } from '../../services/api';
import { configuration } from '../../services/baseApiService';

const selector = (state) => ({
  getSystemInputs: state.getSystemInputs,
  systemInputs: state.systemInputs
});

const GenerateModel = ({ open, handleClose }) => {
  const { systemInputs, getSystemInputs } = useStore(selector);
  const { userDetails } = useSelector((state) => state?.userDetails);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [step, setStep] = useState(0);
  const [formValues, setFormValues] = useState({ systemName: '' });
  const [stepResult, setStepResult] = useState(null);
  const [modelMeta, setModelMeta] = useState({
    modelId: null,
    template: null,
    systemName: null
  });

  // console.log('modelMeta', modelMeta);

  // 🔑 Base prompts (default values)
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

  const [promptValues, setPromptValues] = useState(basePrompts);
  const propmt = `You are an automotive cybersecurity architect. Based on the given system name, generate a JSON list of the most important system inputs required to perform a Threat Analysis and Risk Assessment (TARA) according to ISO/SAE 21434. Provide 5–6 key inputs with short, realistic example values that reflect the technical elements, operational context, and dependencies of the system and its ecosystem.`;

  const [systemInputPrompt, setSystemInputPrompt] = useState(propmt);

  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [fieldsVisible, setFieldsVisible] = useState(false);
  const [manualFields, setManualFields] = useState([]);

  const handleChange = (field) => (event) => {
    setFormValues((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handlePromptChange = (field) => (event) => {
    setPromptValues((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const onClose = (e) => {
    e.stopPropagation();
    setStep(0);
    setStepResult(null);
    setFormValues({ systemName: '' });
    setPromptValues(basePrompts);
    setSystemInputPrompt(propmt);
    setManualFields([]);
    setFieldsVisible(false);
    handleClose();
  };

  const handleAddManualField = (e) => {
    if (e?.stopPropagation) e.stopPropagation();
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
    await getSystemInputs(formValues.systemName, systemInputPrompt);
    setLoading(false);
    setFieldsVisible(true);
  };

  const mergedFormValues = () => ({
    createdBy: userDetails?.username,
    ...formValues,
    ...manualFields.reduce((acc, { label, value }) => {
      if (label.trim()) acc[label] = value;
      return acc;
    }, {}),
    ...promptValues
  });

  const handleGenerateStep = async (e) => {
    e.stopPropagation();
    setGenerating(true);
    try {
      if (step === 1) {
        const itemDef_res = await ADD_CALL(mergedFormValues(), `${configuration.apiBaseUrl}v1/generate/model`);

        setStepResult(itemDef_res?.message);

        // 1. Declare saveResponse outside the block so it's accessible later
        let saveResponse;

        // 🆕 Save the template immediately before navigation
        if (itemDef_res?.template && itemDef_res?.asset_id) {
          try {
            const formData = new FormData();
            formData.append('model-id', itemDef_res?.model_id);
            formData.append('template', JSON.stringify(itemDef_res.template));
            formData.append('assetId', itemDef_res.asset_id);

            // 2. Assign to the outer variable (remove 'const')
            saveResponse = await fetch(`${configuration.apiBaseUrl}v1/update/assets`, {
              method: 'POST',
              body: formData,
              headers: {
                'user-id': userDetails?.username || 'system'
              }
            });

            if (!saveResponse?.error) {
              toast.success('✅ Template saved with details');
            } else {
              console.warn('Auto-save completed with warning');
            }
          } catch (saveError) {
            console.error('Auto-save failed:', saveError);
            toast.error('Auto-save failed, but model was created');
          }
        }

        // 3. This will now safely evaluate!
        // (If it didn't enter the try block, saveResponse is undefined,
        // !undefined?.error is true, so it safely navigates).
        if (!saveResponse?.error) {
          // Now navigate and update state
          navigate(`/Models/${itemDef_res?.model_id}`);
          dispatch(setModelId(itemDef_res?.model_id));
          dispatch(closeAll());

          // Update state object with values
          setModelMeta({
            modelId: itemDef_res?.model_id,
            template: itemDef_res?.template,
            systemName: itemDef_res?.system_name,
            assetId: itemDef_res?.asset_id
          });

          toast.success('✅ Item Definition generated successfully');
        }
      } else if (step === 2) {
        const res = await ADD_CALL(
          {
            modelId: modelMeta.modelId,
            damageScenarioPrompt: promptValues.damageScenarioPrompt,
            template: JSON.stringify(modelMeta.template),
            systemName: modelMeta.systemName
          },
          `${configuration.apiBaseUrl}v1/generate/damage-scenarios`
        );
        setStepResult(res?.message);
        toast.success('✅ Damage Scenarios generated successfully');
      } else if (step === 3) {
        const res = await ADD_CALL(
          {
            modelId: modelMeta.modelId,
            threatScenarioPrompt: promptValues.threatScenarioPrompt
          },
          `${configuration.apiBaseUrl}v1/generate/full-threat-scenario`
        );
        setStepResult(res?.message);
        toast.success('✅ Threat + Derived Threat Scenarios generated successfully');
      } else if (step === 4) {
        const res = await ADD_CALL(
          {
            modelId: modelMeta.modelId,
            attackscenarioPrompt: promptValues.attackscenarioPrompt
          },
          `${configuration.apiBaseUrl}v1/generate/full-attack-scenario`
        );
        setStepResult(res?.message);
        toast.success('✅ Full Attack Pipeline executed successfully');
      } else if (step === 5) {
        await ADD_CALL(
          {
            modelId: modelMeta.modelId,
            cybersecurityPrompt: promptValues.cybersecurityPrompt,
            systemName: modelMeta.systemName
          },
          `${configuration.apiBaseUrl}v1/generate/cybersecurity-artifacts`
        );
        toast.success('✅ Cybersecurity Artifacts generated successfully');
        onClose();
        return;
      }

      setStep((prev) => prev + 1);
    } catch (err) {
      console.error('Error in step generation:', err);
      toast.error(err.message || 'Step failed');
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
          <TextField fullWidth placeholder="Label" value={label} onChange={(e) => handleManualChange(id, 'label', e.target.value)} />
        </Grid>
        <Grid item xs={7}>
          <TextField fullWidth placeholder="Value" value={value} onChange={(e) => handleManualChange(id, 'value', e.target.value)} />
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
      <Dialog open={open} onClose={onClose} sx={{ '& .MuiPaper-root': { maxWidth: 700, minWidth: 500 } }}>
        <DialogTitle>
          <Typography variant="h4" color="primary">
            Create With AI
          </Typography>
        </DialogTitle>

        <DialogContent dividers>
          {step === 0 && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <InputLabel>System Name</InputLabel>
                </Grid>
                <Grid item xs={8}>
                  <TextField fullWidth value={formValues.systemName} onChange={handleChange('systemName')} />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    label="System Input Prompt"
                    value={systemInputPrompt}
                    onChange={(e) => setSystemInputPrompt(e.target.value)}
                  />
                </Grid>

                {/* <Grid item xs={12} display="flex" justifyContent="space-between">
                  <Button variant="outlined" onClick={handleAddManualField}>
                    Add Field
                  </Button>
                  <Button variant="contained" onClick={handleSystemInputs} disabled={!formValues.systemName.trim()}>
                    {loading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Get Fields'}
                  </Button>
                </Grid> */}

                {/* {fieldsVisible && renderDynamicFields()} */}
              </Grid>
            </Box>
          )}

          {step > 0 && (
            <Box>
              {/* Prompt input for each step */}
              {step === 1 && (
                <TextField
                  fullWidth
                  multiline
                  minRows={4}
                  label="Item Definition Prompt"
                  value={promptValues.itemDefinitionPrompt}
                  onChange={handlePromptChange('itemDefinitionPrompt')}
                />
              )}
              {step === 2 && (
                <TextField
                  fullWidth
                  multiline
                  minRows={4}
                  label="Damage Scenario Prompt"
                  value={promptValues.damageScenarioPrompt}
                  onChange={handlePromptChange('damageScenarioPrompt')}
                />
              )}
              {step === 3 && (
                <TextField
                  fullWidth
                  multiline
                  minRows={4}
                  label="Threat Scenario Prompt"
                  value={promptValues.threatScenarioPrompt}
                  onChange={handlePromptChange('threatScenarioPrompt')}
                />
              )}
              {step === 4 && (
                <>
                  <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    label="Threat Scenario Prompt (Optional Override)"
                    value={promptValues.threatScenarioPrompt}
                    onChange={handlePromptChange('threatScenarioPrompt')}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    label="Attack Scenario Prompt"
                    value={promptValues.attackscenarioPrompt}
                    onChange={handlePromptChange('attackscenarioPrompt')}
                  />
                </>
              )}
              {step === 5 && (
                <TextField
                  fullWidth
                  multiline
                  minRows={4}
                  label="Cybersecurity Prompt"
                  value={promptValues.cybersecurityPrompt}
                  onChange={handlePromptChange('cybersecurityPrompt')}
                />
              )}

              {stepResult && (
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
                    {JSON.stringify(stepResult, null, 2)}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          {step === 0 ? (
            <Button variant="contained" disabled={!formValues?.systemName} onClick={() => setStep(1)}>
              Next
            </Button>
          ) : (
            <Button variant="contained" onClick={handleGenerateStep}>
              {step === 6 ? 'Finish' : 'Continue'}
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
          <Typography>Processing step {step} ...</Typography>
        </Backdrop>,
        document.body
      )}
    </>
  );
};

export default GenerateModel;
