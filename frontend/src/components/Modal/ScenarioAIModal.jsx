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
  Backdrop
} from '@mui/material';
import toast from 'react-hot-toast';
import { createPortal } from 'react-dom';
import { ADD_CALL } from '../../services/api';
import { configuration } from '../../services/baseApiService';

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

const ScenarioAIModal = ({ open, handleClose, scenarioType, modelMeta }) => {
  const [promptValue, setPromptValue] = useState('');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);

  // Set default prompt whenever scenarioType changes
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
  }, [scenarioType]);

  const scenarioConfig = {
    item: {
      label: 'Item Definition Prompt',
      api: `${configuration.apiBaseUrl}v1/generate/item-definition`,
      payload: () => ({
        modelId: modelMeta?.modelId,
        itemDefinitionPrompt: promptValue,
        systemName: modelMeta?.systemName
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
    try {
      setGenerating(true);
      const res = await ADD_CALL(config.payload(), config.api);
      setResult(res);
      toast.success(config.successMsg);
    } catch (err) {
      toast.error(err.message || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const onClose = () => {
    setPromptValue('');
    setResult(null);
    handleClose();
  };

  if (!scenarioType) return null;

  const { label } = scenarioConfig[scenarioType];

  return (
    <>
      <Dialog open={open} onClose={onClose} sx={{ '& .MuiPaper-root': { maxWidth: 700, minWidth: 500 } }}>
        <DialogTitle>
          <Typography variant="h4" color="primary">
            {`Create ${scenarioType.charAt(0).toUpperCase() + scenarioType.slice(1)} With AI`}
          </Typography>
        </DialogTitle>

        <DialogContent dividers>
          <TextField fullWidth multiline minRows={4} label={label} value={promptValue} onChange={(e) => setPromptValue(e.target.value)} />
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
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleGenerate} disabled={!promptValue.trim()}>
            Generate
          </Button>
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
