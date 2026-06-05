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
import generateDiagramSVG from '../../utils/generateDiagramSVG';
import { getRectOfNodes, getTransformForBounds } from 'reactflow';
import generateDiagramAttackTree from '../../utils/generateDiagramAttackTrees';
import { updateIconsWithPNG } from '../../utils/generateDiagramAttackTrees';
import { AttackIcon, CybersecurityIcon } from '../../assets/icons';

const selector = (state) => ({
  model_id: state.model?._id,
  template: state.assets.template,
  image: state?.assets?.image,
  getAssets: state.getAssets,
  getAttackScenario: state.getAttackScenario,
  generateDocument: state.generateDocument,
  nodes: state.nodes,
  edges: state.edges,
  canvasImage: state.canvasImage,
  attacktrees: state.attackScenarios['subs'][1]['scenes'],
  attacks: state.attackScenarios['subs'][0]['scenes'],
  requirements: state.cybersecurity['subs'][1]['scenes']
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
    subs: [
      { id: 41, name: 'Attack' },
      { id: 42, name: 'Attack Trees' }
    ]
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

// Flatten all item IDs for "Select All" functionality
const getAllItemIds = () => {
  const ids = [];
  items.forEach((item) => {
    ids.push(item.id);
    if (item.subs) {
      item.subs.forEach((sub) => ids.push(sub.id));
    }
  });
  return ids;
};

const DocumentDialog = ({ open, onClose }) => {
  const {
    template,
    generateDocument,
    nodes,
    canvasImage,
    image,
    edges,
    attacktrees,
    attacks,
    requirements,
    getAssets,
    getAttackScenario,
    model_id
  } = useStore(selector, shallow);
  const { modelId } = useSelector((state) => state?.pageName);
  const { isDark } = useSelector((state) => state.currentId);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate if all items are selected
  const allItemIds = getAllItemIds();
  const isAllSelected = allItemIds.length > 0 && allItemIds.every((id) => selectedItems.includes(id));

  // Handle checkbox changes
  const handleCheckboxChange = useCallback((e, id) => {
    // Don't prevent default - let the checkbox work normally
    // But stop propagation to prevent parent handlers
    e.stopPropagation();

    setSelectedItems((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }, []);

  // Handle "Select All" checkbox
  const handleSelectAll = useCallback(
    (e) => {
      e.stopPropagation();

      if (isAllSelected) {
        setSelectedItems([]);
      } else {
        setSelectedItems([...allItemIds]);
      }
    },
    [isAllSelected, allItemIds]
  );

  // Reset selected items and fetch data when dialog opens
  useEffect(() => {
    const fetchData = async () => {
      if (open) {
        setSelectedItems([]);
        setIsLoading(true);
        try {
          // Call both functions to cache the states
          await Promise.all([getAssets(modelId), getAttackScenario(modelId)]);
        } catch (error) {
          console.error('Error fetching data for document dialog:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [open, modelId, getAssets, getAttackScenario]);

  const getNodeSize = (node) => {
    if (['AND Gate', 'OR Gate', 'Voting Gate', 'Transfer Gate'].includes(node.type)) {
      return { width: 100, height: 100 };
    }

    const styleWidth = node.data?.style?.width ? parseInt(node.data.style.width, 10) : null;
    const styleHeight = node.data?.style?.height ? parseInt(node.data.style.height, 10) : null;

    let w = styleWidth || node.width || 150;
    let h = styleHeight || node.height || 60;

    // Account for Event/default nodes which might be larger
    if (node.type === 'default' || node.type === 'Event') {
      w += 30;
      h += 30;
    }

    return { width: w, height: h };
  };

  function calculateDiagramSize(nodes) {
    if (!nodes || nodes.length === 0) {
      return { width: 1000, height: 800 };
    }

    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    nodes.forEach((node) => {
      const x = node.positionAbsolute?.x || node.position?.x || 0;
      const y = node.positionAbsolute?.y || node.position?.y || 0;
      const { width, height } = getNodeSize(node); // Use your getNodeSize function

      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + width);
      maxY = Math.max(maxY, y + height);
    });

    // Calculate ACTUAL content bounds, not padding-based
    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;

    // Add reasonable padding (not too much)
    const padding = 80;

    return {
      width: Math.max(contentWidth + padding * 2, 800), // Min 800, based on content
      height: Math.max(contentHeight + padding * 2, 600) // Min 600, based on content
    };
  }

  // Handle document download
  const handleDownload = async (e) => {
    e.stopPropagation();
    setIsGenerating(true);

    // ✅ Ensure icons are ready BEFORE any SVG export
    await updateIconsWithPNG({
      attackIcon: AttackIcon,
      cybersecurityIcon: CybersecurityIcon
    });

    try {
      // ✅ Step 1: Generate SVG dynamically for DOCX
      const { width, height } = calculateDiagramSize(nodes);
      const svgString = generateDiagramSVG(nodes, edges, getRectOfNodes, getTransformForBounds, width, height);

      const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });

      // ✅ Step 2: Build FormData
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
        formData.append('svg', svgBlob, 'itemModelImage.svg');
        formData.append('assetIdentificationTable', 1);
      }

      // ============================================
      //  ATTACK TREES → Generate SVG for each tree
      // ============================================
      // In DocumentDialog.js handleDownload function:
      if (selectedItems.includes(42) && Array.isArray(attacktrees)) {
        attacktrees.forEach((tree, index) => {
          try {
            const treeNodes = tree?.templates?.nodes || [];
            const treeEdges = tree?.templates?.edges || [];
            const overallRating = tree?.overall_rating;

            if (!treeNodes || treeNodes.length === 0) {
              console.warn(`Tree ${index} has no nodes, skipping`);
              return;
            }

            // Calculate content-based dimensions
            const { width: contentWidth, height: contentHeight } = calculateDiagramSize(treeNodes);

            // Cap dimensions for PDF
            const MAX_PDF_WIDTH = 1200;
            const MAX_PDF_HEIGHT = 800;

            let finalWidth = contentWidth;
            let finalHeight = contentHeight;

            // Scale down if too large
            if (contentWidth > MAX_PDF_WIDTH || contentHeight > MAX_PDF_HEIGHT) {
              const widthRatio = MAX_PDF_WIDTH / contentWidth;
              const heightRatio = MAX_PDF_HEIGHT / contentHeight;
              const scale = Math.min(widthRatio, heightRatio) * 0.9; // 90% for padding

              finalWidth = Math.floor(contentWidth * scale);
              finalHeight = Math.floor(contentHeight * scale);
            }

            const svgString = generateDiagramAttackTree(
              treeNodes,
              treeEdges,
              finalWidth,
              finalHeight,
              overallRating,
              attacks,
              requirements
            );

            // Validate SVG
            if (!svgString || !svgString.includes('<svg')) {
              console.error(`Invalid SVG generated for tree ${index}`);
              return;
            }

            const svgBlobTree = new Blob([svgString], { type: 'image/svg+xml' });
            formData.append(`attackTrees`, svgBlobTree, `attackTree_${index}.svg`);
          } catch (error) {
            console.error(`Error generating SVG for attack tree ${index}:`, error);
          }
        });
      }

      // ✅ Step 3: Send request to generate .docx
      const response = await generateDocument(formData);

      if (response instanceof Blob) {
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
        {isLoading && (
          <CircularProgress
            size={16}
            sx={{
              color: isDark ? '#64B5F6' : '#2196F3',
              marginLeft: '10px'
            }}
          />
        )}
      </DialogTitle>
      <DialogContent
        sx={{
          padding: '16px',
          backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
          maxHeight: '60vh',
          overflowY: 'auto'
        }}
      >
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <CircularProgress
              size={24}
              sx={{
                color: isDark ? '#64B5F6' : '#2196F3'
              }}
            />
            <Typography
              sx={{
                ml: 2,
                color: isDark ? '#E0E0E0' : '#333333',
                fontFamily: "'Poppins', sans-serif"
              }}
            >
              Loading data...
            </Typography>
          </Box>
        ) : (
          <>
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

            {/* Select All Checkbox */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  disabled={isGenerating}
                  indeterminate={!isAllSelected && selectedItems.length > 0}
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
                    fontWeight: 600,
                    color: isDark ? '#E0E0E0' : '#333333',
                    fontFamily: "'Poppins', sans-serif"
                  }}
                >
                  Select All
                </Typography>
              }
              sx={{ marginLeft: '-4px', mb: 1 }}
            />

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
                            onChange={(e) => handleCheckboxChange(e, item.id)}
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
                              fontFamily: "'Poppins', sans-serif",
                              // Change to pointer cursor to indicate it's clickable
                              cursor: 'pointer',
                              // Prevent text selection
                              userSelect: 'none'
                            }}
                            // Add onClick handler to the Typography itself
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCheckboxChange(e, item.id);
                            }}
                          >
                            {item.name}
                          </Typography>
                        }
                        sx={{
                          marginLeft: '-4px',
                          // Make the entire FormControlLabel clickable
                          '& .MuiFormControlLabel-label': {
                            flex: 1
                          }
                        }}
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
                                onChange={(e) => handleCheckboxChange(e, sub.id)}
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
                                  fontFamily: "'Poppins', sans-serif",
                                  // Change to pointer cursor to indicate it's clickable
                                  cursor: 'pointer',
                                  // Prevent text selection
                                  userSelect: 'none'
                                }}
                                // Add onClick handler to the Typography itself
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCheckboxChange(e, sub.id);
                                }}
                              >
                                {sub.name}
                              </Typography>
                            }
                            sx={{
                              marginLeft: '-4px',
                              // Make the entire FormControlLabel clickable
                              '& .MuiFormControlLabel-label': {
                                flex: 1
                              }
                            }}
                          />
                        </Tooltip>
                      ))}
                    </Box>
                  )}
                  <Divider sx={{ my: 1, backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }} />
                </Box>
              ))}
            </Box>
          </>
        )}
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
          disabled={isGenerating || isLoading}
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
          disabled={isGenerating || selectedItems.length === 0 || isLoading}
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
