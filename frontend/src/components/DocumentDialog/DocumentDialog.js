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
  {
    id: 1,
    name: 'Item Definition',
    icon: 'ItemIcon',
    subs: [
      { id: 11, name: 'Item Definition Diagram (Template)' },
      { id: 12, name: 'Asset Identification Table' }
    ]
  },
  {
    id: 2,
    name: 'Damage Scenarios and Impact Ratings',
    icon: 'DamageIcon',
    subs: [{ id: 21, name: 'Damage Scenarios - Impact Ratings' }]
  },
  {
    id: 3,
    name: 'Threat Scenarios',
    icon: 'ThreatIcon',
    subs: [{ id: 31, name: 'Derived Threat Scenarios' }]
  },
  {
    id: 4,
    name: 'Attack Path Analysis and Attack Feasibility Rating',
    icon: 'AttackIcon',
    subs: [
      { id: 41, name: 'Attack Path Analysis' },
      { id: 42, name: 'Attack Trees Diagrams' }
    ]
  },
  {
    id: 5,
    name: 'CyberSecurity Goals, Claims and Requirements',
    icon: 'CybersecurityIcon',
    subs: [
      { id: 51, name: 'Cybersecurity Goals' },
      { id: 52, name: 'Cybersecurity Requirements' },
      { id: 53, name: 'Cybersecurity Controls' },
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

// ==========================================
// UPDATED HELPER: Sanitize Nodes
// Forces data.style into root style and translates HTML CSS to SVG attributes
// ==========================================
const sanitizeNodes = (nodesToSanitize) => {
  if (!nodesToSanitize || !Array.isArray(nodesToSanitize)) return [];

  return nodesToSanitize.map((node) => {
    const sanitizedNode = { ...node };
    if (!sanitizedNode.data) sanitizedNode.data = {};
    if (!sanitizedNode.style) sanitizedNode.style = {};

    // Process Group Nodes specifically for styling
    if (sanitizedNode.type === 'group') {
      const customStyle = sanitizedNode.data.style || {};

      // 1. Merge data styles into root style
      sanitizedNode.style = {
        ...sanitizedNode.style,
        ...customStyle
      };

      // 2. Translate HTML CSS attributes to SVG-friendly attributes
      // This guarantees that even strict SVG generators will render the colors/borders
      if (customStyle.backgroundColor || customStyle.background) {
        // Extract raw color if background is rgba/hex
        const bg = customStyle.backgroundColor || customStyle.background;
        sanitizedNode.style.fill = bg.includes('rgba') ? '#f6efef' : bg; // safe fallback
      }

      if (customStyle.borderColor) {
        sanitizedNode.style.stroke = customStyle.borderColor;
      }

      if (customStyle.borderWidth) {
        // Remove 'px' and parse to integer
        sanitizedNode.style.strokeWidth = parseInt(customStyle.borderWidth, 10) || 2;
      }

      if (customStyle.borderStyle) {
        if (customStyle.borderStyle.includes('dashed')) {
          sanitizedNode.style.strokeDasharray = '8,4';
        } else if (customStyle.borderStyle.includes('dotted')) {
          sanitizedNode.style.strokeDasharray = '4,4';
        }
      }
    }

    return sanitizedNode;
  });
};

// ==========================================
// UPDATED HELPER: Sanitize Edges
// Normalizes shorthand handles and PRESERVES marker colors
// ==========================================
const sanitizeEdges = (edgesToSanitize) => {
  if (!edgesToSanitize || !Array.isArray(edgesToSanitize)) return [];

  const validHandles = ['top', 'bottom', 'left', 'right'];

  return edgesToSanitize.map((edge) => {
    const sanitizedEdge = { ...edge };
    if (!sanitizedEdge.data) sanitizedEdge.data = {};
    if (!sanitizedEdge.style) sanitizedEdge.style = {};

    // 1. Fallback label logic for edges missing a name
    if (!sanitizedEdge.data.label || sanitizedEdge.data.label.trim() === '') {
      sanitizedEdge.data.label = 'connect';
    }

    // 2. Normalize handles (e.g. "t" -> "top")
    const normalizeHandle = (handle, isSource) => {
      if (!handle) return isSource ? 'bottom' : 'top'; // Safe defaults
      const h = handle.toString().toLowerCase();
      if (validHandles.includes(h)) return h;
      if (h === 't') return 'top';
      if (h === 'b') return 'bottom';
      if (h === 'l') return 'left';
      if (h === 'r') return 'right';
      return isSource ? 'bottom' : 'top';
    };

    sanitizedEdge.sourceHandle = normalizeHandle(edge.sourceHandle, true);
    sanitizedEdge.targetHandle = normalizeHandle(edge.targetHandle, false);

    if (sanitizedEdge.data.sourceHandle) {
      sanitizedEdge.data.sourceHandle = normalizeHandle(sanitizedEdge.data.sourceHandle, true);
    }
    if (sanitizedEdge.data.targetHandle) {
      sanitizedEdge.data.targetHandle = normalizeHandle(sanitizedEdge.data.targetHandle, false);
    }

    // 3. PRESERVE Marker Objects so the SVG generator can read the color
    if (edge.markerEnd) {
      sanitizedEdge.markerEnd = typeof edge.markerEnd === 'object' ? { ...edge.markerEnd } : { type: edge.markerEnd };
    }

    if (edge.markerStart) {
      sanitizedEdge.markerStart = typeof edge.markerStart === 'object' ? { ...edge.markerStart } : { type: edge.markerStart };
    }

    return sanitizedEdge;
  });
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

  const allItemIds = getAllItemIds();
  const isAllSelected = allItemIds.length > 0 && allItemIds.every((id) => selectedItems.includes(id));

  const handleCheckboxChange = useCallback((e, id) => {
    e.stopPropagation();

    setSelectedItems((prev) => {
      let newSelected = [...prev];
      const isSelected = newSelected.includes(id);

      if (isSelected) {
        newSelected = newSelected.filter((item) => item !== id);
        const parentItem = items.find((i) => i.id === id);
        if (parentItem && parentItem.subs) {
          const childIds = parentItem.subs.map((s) => s.id);
          newSelected = newSelected.filter((item) => !childIds.includes(item));
        }
        const parentOfChild = items.find((i) => i.subs && i.subs.some((s) => s.id === id));
        if (parentOfChild) {
          newSelected = newSelected.filter((item) => item !== parentOfChild.id);
        }
      } else {
        newSelected.push(id);
        const parentItem = items.find((i) => i.id === id);
        if (parentItem && parentItem.subs) {
          parentItem.subs.forEach((sub) => {
            if (!newSelected.includes(sub.id)) newSelected.push(sub.id);
          });
        }
        const parentOfChild = items.find((i) => i.subs && i.subs.some((s) => s.id === id));
        if (parentOfChild) {
          const allChildrenSelected = parentOfChild.subs.every((sub) => newSelected.includes(sub.id));
          if (allChildrenSelected && !newSelected.includes(parentOfChild.id)) {
            newSelected.push(parentOfChild.id);
          }
        }
      }
      return newSelected;
    });
  }, []);

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

  useEffect(() => {
    const fetchData = async () => {
      if (open) {
        setSelectedItems([]);
        setIsLoading(true);
        try {
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
      return { width: node.width || 100, height: node.height || 100 };
    }
    const styleWidth = node.data?.style?.width ? parseInt(node.data.style.width, 10) : null;
    const styleHeight = node.data?.style?.height ? parseInt(node.data.style.height, 10) : null;
    let w = styleWidth || node.width || 150;
    let h = styleHeight || node.height || 60;

    // UPDATED: Include 'group' nodes in the padding logic alongside default and Event nodes
    if (node.type === 'default' || node.type === 'Event' || node.type === 'group') {
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
      const { width, height } = getNodeSize(node);
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + width);
      maxY = Math.max(maxY, y + height);
    });
    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    const padding = 80;
    return {
      width: Math.max(contentWidth + padding * 2, 800),
      height: Math.max(contentHeight + padding * 2, 600)
    };
  }

  const handleDownload = async (e) => {
    e.stopPropagation();
    setIsGenerating(true);

    await updateIconsWithPNG({
      attackIcon: AttackIcon,
      cybersecurityIcon: CybersecurityIcon
    });

    try {
      const safeNodes = sanitizeNodes(nodes); // Apply group styling protections
      const safeEdges = sanitizeEdges(edges); // Apply missing label and port protections

      const { width, height } = calculateDiagramSize(safeNodes);

      const svgString = generateDiagramSVG(safeNodes, safeEdges, getRectOfNodes, getTransformForBounds, width, height);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });

      const formData = new FormData();
      formData.append('model-id', modelId);

      formData.append('damageScenariosTable', selectedItems.includes(2) || selectedItems.includes(21) ? 1 : 0);
      formData.append('threatScenariosTable', selectedItems.includes(3) || selectedItems.includes(31) ? 1 : 0);
      formData.append(
        'attackTreatScenariosTable',
        selectedItems.includes(4) || selectedItems.includes(41) || selectedItems.includes(42) ? 1 : 0
      );
      formData.append('cyberSecurityGoals', selectedItems.includes(5) || selectedItems.includes(51) ? 1 : 0);
      formData.append('cyberSecurityRequirements', selectedItems.includes(5) || selectedItems.includes(52) ? 1 : 0);
      formData.append('cyberSecurityControls', selectedItems.includes(5) || selectedItems.includes(53) ? 1 : 0);
      formData.append('cyberSecurityClaims', selectedItems.includes(5) || selectedItems.includes(54) ? 1 : 0);
      formData.append('riskTreatmentTable', selectedItems.includes(8) || selectedItems.includes(81) ? 1 : 0);

      if (selectedItems.includes(1) || selectedItems.includes(11)) {
        formData.append('svg', svgBlob, 'itemModelImage.svg');
      }

      formData.append('assetIdentificationTable', selectedItems.includes(1) || selectedItems.includes(12) ? 1 : 0);

      // Attack Trees
      if ((selectedItems.includes(4) || selectedItems.includes(42)) && Array.isArray(attacktrees)) {
        attacktrees.forEach((tree, index) => {
          try {
            const rawTreeNodes = tree?.templates?.nodes || [];
            const safeTreeNodes = sanitizeNodes(rawTreeNodes); // Protect Attack Tree nodes

            const rawTreeEdges = tree?.templates?.edges || [];
            const safeTreeEdges = sanitizeEdges(rawTreeEdges); // Protect Attack Tree edges

            const overallRating = tree?.overall_rating;

            if (!safeTreeNodes || safeTreeNodes.length === 0) {
              console.warn(`Tree ${index} has no nodes, skipping`);
              return;
            }

            const { width: contentWidth, height: contentHeight } = calculateDiagramSize(safeTreeNodes);
            const MAX_PDF_WIDTH = 1200;
            const MAX_PDF_HEIGHT = 800;

            let finalWidth = contentWidth;
            let finalHeight = contentHeight;

            if (contentWidth > MAX_PDF_WIDTH || contentHeight > MAX_PDF_HEIGHT) {
              const widthRatio = MAX_PDF_WIDTH / contentWidth;
              const heightRatio = MAX_PDF_HEIGHT / contentHeight;
              const scale = Math.min(widthRatio, heightRatio) * 0.9;
              finalWidth = Math.floor(contentWidth * scale);
              finalHeight = Math.floor(contentHeight * scale);
            }

            const svgStringTree = generateDiagramAttackTree(safeTreeNodes, safeTreeEdges, overallRating, attacks, requirements);
            if (!svgStringTree || !svgStringTree.includes('<svg')) {
              console.error(`Invalid SVG generated for tree ${index}`);
              return;
            }

            const svgBlobTree = new Blob([svgStringTree], { type: 'image/svg+xml' });
            formData.append(`attackTrees`, svgBlobTree, `attackTree_${index}.svg`);
          } catch (error) {
            console.error(`Error generating SVG for attack tree ${index}:`, error);
          }
        });
      }

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
            <CircularProgress size={24} sx={{ color: isDark ? '#64B5F6' : '#2196F3' }} />
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
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedItems.includes(item.id)}
                          onChange={(e) => handleCheckboxChange(e, item.id)}
                          disabled={isGenerating}
                          indeterminate={!selectedItems.includes(item.id) && item.subs.some((sub) => selectedItems.includes(sub.id))}
                          sx={{
                            color: isDark ? '#64B5F6' : '#2196F3',
                            '&.Mui-checked': { color: isDark ? '#64B5F6' : '#2196F3' },
                            padding: '4px'
                          }}
                        />
                      }
                      label={
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 600,
                            fontSize: '1rem',
                            color: isDark ? '#E0E0E0' : '#333333',
                            fontFamily: "'Poppins', sans-serif",
                            cursor: 'pointer',
                            userSelect: 'none'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCheckboxChange(e, item.id);
                          }}
                        >
                          {item.name}
                        </Typography>
                      }
                      sx={{ marginLeft: '-4px' }}
                    />
                  ) : (
                    <Tooltip title={item.name} arrow>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedItems.includes(item.id)}
                            onChange={(e) => handleCheckboxChange(e, item.id)}
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
                              fontSize: '0.9rem',
                              color: isDark ? '#E0E0E0' : '#333333',
                              fontFamily: "'Poppins', sans-serif",
                              cursor: 'pointer',
                              userSelect: 'none'
                            }}
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
                          '& .MuiFormControlLabel-label': { flex: 1 }
                        }}
                      />
                    </Tooltip>
                  )}
                  {item.subs && (
                    <Box sx={{ pl: '28px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
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
                                  cursor: 'pointer',
                                  userSelect: 'none'
                                }}
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
                              '& .MuiFormControlLabel-label': { flex: 1 }
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
            '&:disabled': { opacity: 0.6, cursor: 'not-allowed' }
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
