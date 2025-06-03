/*eslint-disable*/
import React, { useCallback, useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  FormControlLabel,
  Checkbox,
  Divider,
  Box,
  CircularProgress,
  Tooltip
} from '@mui/material';
import { useSelector } from 'react-redux';
import useStore from '../../store/Zustand/store';
import { shallow } from 'zustand/shallow';
import { base64ToBlob } from './Base64Convert';

const selector = (state) => ({
  template: state.assets.template,
  image: state?.assets?.image,
  generateDocument: state.generateDocument,
  nodes: state.nodes,
  canvasImage: state.canvasImage
});

const items = [
  { id: 1, name: 'Item Definition', icon: 'ItemIcon' },
  {
    id: 2,
    name: 'Damage Scenarios and Impact Ratings',
    icon: 'DamageIcon',
    subs: [{ id: 22, name: 'Damage Scenarios - Impact Ratings' }]
  },
  {
    id: 3,
    name: 'Threat Scenarios',
    icon: 'ThreatIcon',
    subs: [{ id: 32, name: 'Derived Threat Scenarios' }]
  },
  {
    id: 4,
    name: 'Attack Path Analysis and Attack Feasibility Rating',
    icon: 'AttackIcon',
    subs: [{ id: 41, name: 'Attack' }]
  },
  {
    id: '5',
    name: 'CyberSecurity Goals, Claims and Requirements',
    icon: 'CybersecurityIcon',
    subs: [
      { id: 51, name: 'Cybersecurity Goals' },
      { id: 53, name: 'Cybersecurity Requirements' },
      { id: 52, name: 'Cybersecurity Controls' },
      { id: 54, name: 'Cybersecurity Claims' }
    ]
  },
  {
    id: 8,
    name: 'Risk Determination and Risk Treatment Decision',
    icon: 'RiskIcon',
    subs: [{ id: 81, name: 'Threat Assessment & Risk Treatment' }]
  }
];

const DocumentDialog = ({ open, onClose }) => {
  const { template, generateDocument, nodes, canvasImage, image } = useStore(selector, shallow);
  const { modelId } = useSelector((state) => state?.pageName);
  const { isDark } = useSelector((state) => state.currentId);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Reset selected items when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedItems([]);
    }
  }, [open]);

  // Handle checkbox changes
  const handleCheckboxChange = useCallback((id) => {
    setSelectedItems((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }, []);

  // Handle document download
  const handleDownload = async () => {
    setIsGenerating(true);
    const formData = new FormData();
    formData.append('model-id', modelId);
    formData.append('threatScenariosTable', selectedItems.includes(31) || selectedItems.includes(32) ? 1 : 0);
    formData.append('attackTreatScenariosTable', selectedItems.includes(41) || selectedItems.includes(42) ? 1 : 0);
    formData.append('damageScenariosTable', selectedItems.includes(21) || selectedItems.includes(22) ? 1 : 0);
    formData.append('riskTreatmentTable', selectedItems.includes(81) ? 1 : 0);
    formData.append('cyberSecurityGoals', selectedItems.includes(51) || selectedItems.includes(5) ? 1 : 0);
    formData.append(
      'cyberSecurityRequirements',
      selectedItems.includes(52) || selectedItems.includes(51) || selectedItems.includes(5) ? 1 : 0
    );
    formData.append('cyberSecurityControls', selectedItems.includes(53) || selectedItems.includes(5) ? 1 : 0);
    formData.append('cyberSecurityClaims', selectedItems.includes(54) || selectedItems.includes(5) ? 1 : 0);

    if (selectedItems.includes(1)) {
      if (image) {
        const blob = base64ToBlob(image);
        if (blob) {
          formData.append('image', blob, 'itemModelImage.png');
        } else {
          console.error('Failed to convert base64 image to Blob.');
          setIsGenerating(false);
          return;
        }
      } else {
        console.warn('No image available for Item Definition.');
        setIsGenerating(false);
        return;
      }
    }

    try {
      const response = await generateDocument(formData);
      if (response instanceof Blob) {
        // Download the file
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'document-report.docx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error during document generation:', error);
    } finally {
      setIsGenerating(false);
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
          color: isDark ? '#E0E0E0' : '#333333',
          borderRadius: '12px',
          boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.5)' : '0 4px 16px rgba(0,0,0,0.1)',
          width: '100%',
          maxWidth: '450px',
          minWidth: '320px',
          backdropFilter: 'blur(4px)'
        }
      }}
    >
      <DialogTitle
        sx={{
          fontSize: '1.4rem',
          fontWeight: 600,
          textAlign: 'center',
          backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
          color: isDark ? '#64B5F6' : '#2196F3',
          padding: '12px 16px',
          borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
          fontFamily: "'Poppins', sans-serif"
        }}
      >
        Document Report
      </DialogTitle>
      <DialogContent
        sx={{
          padding: '16px',
          backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
          maxHeight: '60vh',
          overflowY: 'auto'
        }}
      >
        <Typography
          variant="subtitle1"
          gutterBottom
          sx={{
            fontSize: '0.95rem',
            fontWeight: 500,
            color: isDark ? '#B0BEC5' : '#616161',
            marginBottom: '12px',
            fontFamily: "'Poppins', sans-serif"
          }}
        >
          Select items to add in the report and click on download:
        </Typography>
        <Divider sx={{ my: 1, backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {items.map((item) => (
            <Box key={item.id}>
              {item.subs ? (
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 600,
                    fontSize: '1rem',
                    color: isDark ? '#E0E0E0' : '#333333',
                    mb: 0.5,
                    fontFamily: "'Poppins', sans-serif"
                  }}
                >
                  {item.name}
                </Typography>
              ) : (
                <Tooltip title={item.name} arrow>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleCheckboxChange(item.id)}
                        disabled={item.id === 1 && isGenerating}
                        sx={{
                          color: isDark ? '#64B5F6' : '#2196F3',
                          '&.Mui-checked': { color: isDark ? '#64B5F6' : '#2196F3' },
                          padding: '4px'
                        }}
                      />
                    }
                    label={
                      <Typography
                        sx={{
                          fontSize: '0.9rem',
                          color: isDark ? '#E0E0E0' : '#333333',
                          fontFamily: "'Poppins', sans-serif"
                        }}
                      >
                        {item.name}
                      </Typography>
                    }
                    sx={{ marginLeft: '-4px' }}
                  />
                </Tooltip>
              )}
              {item.subs && (
                <Box sx={{ pl: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {item.subs.map((sub) => (
                    <Tooltip key={sub.id} title={sub.name} arrow>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedItems.includes(sub.id)}
                            onChange={() => handleCheckboxChange(sub.id)}
                            disabled={isGenerating}
                            sx={{
                              color: isDark ? '#64B5F6' : '#2196F3',
                              '&.Mui-checked': { color: isDark ? '#64B5F6' : '#2196F3' },
                              padding: '4px'
                            }}
                          />
                        }
                        label={
                          <Typography
                            sx={{
                              fontSize: '0.85rem',
                              color: isDark ? '#E0E0E0' : '#333333',
                              fontFamily: "'Poppins', sans-serif"
                            }}
                          >
                            {sub.name}
                          </Typography>
                        }
                        sx={{ marginLeft: '-4px' }}
                      />
                    </Tooltip>
                  ))}
                </Box>
              )}
              <Divider sx={{ my: 1, backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }} />
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions
        sx={{
          padding: '12px 16px',
          borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
          backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
          justifyContent: 'space-between'
        }}
      >
        <Button
          onClick={onClose}
          disabled={isGenerating}
          sx={{
            padding: '6px 12px',
            fontSize: '0.85rem',
            border: `1px solid ${isDark ? '#64B5F6' : '#2196F3'}`,
            background: isDark ? 'rgba(100,181,246,0.1)' : 'rgba(33,150,243,0.1)',
            color: isDark ? '#E0E0E0' : '#333333',
            borderRadius: '6px',
            fontFamily: "'Poppins', sans-serif",
            textTransform: 'none',
            transition: 'all 0.2s ease',
            '&:hover': {
              background: isDark ? 'rgba(100,181,246,0.2)' : 'rgba(33,150,243,0.2)',
              transform: 'scale(1.03)'
            },
            '&:disabled': {
              opacity: 0.6,
              cursor: 'not-allowed'
            }
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleDownload}
          disabled={isGenerating || selectedItems.length === 0}
          sx={{
            padding: '6px 12px',
            fontSize: '0.85rem',
            border: `1px solid ${isDark ? '#42A5F5' : '#1976D2'}`,
            background: isDark ? '#64B5F6' : '#2196F3',
            color: '#FFFFFF',
            borderRadius: '6px',
            fontFamily: "'Poppins', sans-serif",
            textTransform: 'none',
            transition: 'all 0.2s ease',
            '&:hover': {
              background: isDark ? '#42A5F5' : '#1976D2',
              transform: 'scale(1.03)'
            },
            '&:disabled': {
              opacity: 0.6,
              background: isDark ? '#616161' : '#B0BEC5',
              borderColor: isDark ? '#616161' : '#B0BEC5'
            }
          }}
        >
          {isGenerating ? (
            <>
              <CircularProgress size={14} sx={{ color: '#FFFFFF', mr: 1 }} />
              Generating...
            </>
          ) : (
            'Download'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DocumentDialog;
