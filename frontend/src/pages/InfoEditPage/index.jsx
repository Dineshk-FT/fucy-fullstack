/*eslint-disable*/
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Button, Box, TextField, CircularProgress, FormLabel, IconButton } from '@mui/material';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { shallow } from 'zustand/shallow';
import toast, { Toaster } from 'react-hot-toast';
import JoditEditor from 'jodit-react';

import useStore from '../../store/Zustand/store';
import ColorTheme from '../../themes/ColorTheme';

const selector = (state) => ({
  updateModelName: state.updateModelName,
  model: state.model,
  getModelById: state.getModelById
});

export default React.memo(function InfoEditPage({ onClose }) {
  const color = ColorTheme();
  const { updateModelName, model, getModelById } = useStore(selector, shallow);

  const [newName, setNewName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [intro, setIntro] = useState('');
  const [scope, setScope] = useState('');
  const [loading, setLoading] = useState(false);

  // Refs for Jodit editors
  const editorRefs = useRef({
    purpose: null,
    intro: null,
    scope: null
  });

  useEffect(() => {
    setNewName(model?.name || '');
    setPurpose(model?.report_info?.purpose || '');
    setIntro(model?.report_info?.intro || '');
    setScope(model?.report_info?.scope || '');
  }, [model]);

  const handleSave = useCallback(() => {
    if (!newName.trim()) {
      toast.error('Name is required');
      return;
    }

    // Get current values from state (Jodit updates state directly)
    if (
      newName.trim() === model?.name &&
      purpose === model?.report_info?.purpose &&
      intro === model?.report_info?.intro &&
      scope === model?.report_info?.scope
    ) {
      toast.error('No changes detected');
      return;
    }

    const payload = { 'model-id': model?._id };

    if (newName.trim() !== model?.name) payload.name = newName.trim();
    if (purpose !== model?.report_info?.purpose) payload.purpose = purpose;
    if (intro !== model?.report_info?.intro) payload.intro = intro;
    if (scope !== model?.report_info?.scope) payload.scope = scope;

    setLoading(true);
    updateModelName(payload)
      .then((res) => {
        if (res) {
          toast.success('Project updated successfully');
          getModelById(model?._id);
        } else {
          toast.error('Update failed');
        }
      })
      .catch(() => toast.error('An error occurred'))
      .finally(() => setLoading(false));
  }, [newName, purpose, intro, scope, model, updateModelName, getModelById]);

  // Jodit configuration - optimized for table support
  const joditConfig = {
    height: 200,
    width: '100%',
    toolbar: true,
    toolbarAdaptive: false,
    spellcheck: true,
    enter: 'div',
    defaultMode: '1',
    toolbarButtonSize: 'middle',
    showCharsCounter: false,
    showWordsCounter: false,
    showXPathInStatusbar: false,
    askBeforePasteHTML: false,
    askBeforePasteFromWord: false,
    disablePlugins: ['paste', 'stat'],
    buttons: [
      'source',
      '|',
      'bold',
      'italic',
      'underline',
      'strikethrough',
      '|',
      'superscript',
      'subscript',
      '|',
      'ul',
      'ol',
      'outdent',
      'indent',
      '|',
      'font',
      'fontsize',
      'brush',
      'paragraph',
      '|',
      'image',
      'table',
      'link',
      '|',
      'align',
      'undo',
      'redo',
      '|',
      'hr',
      'eraser',
      'copyformat',
      '|',
      'fullsize',
      'print',
      'about'
    ],
    buttonsMD: [
      'source',
      '|',
      'bold',
      'italic',
      'underline',
      '|',
      'ul',
      'ol',
      '|',
      'font',
      'fontsize',
      'brush',
      'paragraph',
      '|',
      'table',
      'link',
      '|',
      'align',
      'undo',
      'redo',
      '|',
      'fullsize'
    ],
    buttonsXS: ['bold', 'italic', 'underline', '|', 'ul', 'ol', '|', 'table', 'link', '|', 'undo', 'redo'],
    table: {
      enable: true,
      insert: true,
      delete: true,
      edit: true,
      merge: true,
      split: true,
      autofocus: true,
      allowCellSelection: true,
      allowRowSelection: true,
      allowColumnSelection: true,
      selectionCellStyle: 'border: 2px dashed #3498db; background-color: #f0f8ff;',
      tableProperties: {
        border: '1',
        borderStyle: 'solid',
        borderColor: '#ddd',
        cellpadding: '4',
        cellspacing: '0'
      },
      tableCellProperties: {
        border: '1',
        borderStyle: 'solid',
        borderColor: '#ddd',
        padding: '4px'
      }
    },
    events: {
      beforeCommand: (command) => {
        if (command === 'table') {
          // Custom table insertion logic if needed
        }
      },
      afterInit: (editor) => {
        // Custom initialization
      }
    },
    style: {
      table: {
        'border-collapse': 'collapse',
        width: '100%',
        margin: '10px 0'
      },
      'table th': {
        border: '2px solid #2c3e50',
        padding: '8px',
        'background-color': '#ecf0f1',
        'font-weight': 'bold',
        'text-align': 'center'
      },
      'table td': {
        border: '1px solid #bdc3c7',
        padding: '6px',
        'text-align': 'left'
      },
      'table tr:hover': {
        'background-color': '#f5f5f5'
      }
    },
    placeholder: 'Start typing here...',
    uploader: {
      insertImageAsBase64URI: true
    },
    language: 'en',
    direction: 'ltr'
  };

  const renderEditor = (fieldName, label, value, onChange) => (
    <Box>
      <FormLabel sx={{ fontWeight: 600 }}>{label}</FormLabel>
      <Box
        sx={{
          mt: 0.5,
          border: '1px solid #ccc',
          borderRadius: 1,
          overflow: 'hidden',
          '& .jodit-container': {
            border: 'none !important',
            borderRadius: '4px !important'
          },
          '& .jodit-workplace': {
            minHeight: '120px',
            border: 'none !important'
          },
          '& .jodit-wysiwyg': {
            minHeight: '120px',
            padding: '8px !important'
          },
          '& table': {
            borderCollapse: 'collapse !important',
            width: '100% !important',
            margin: '10px 0 !important',
            '& th': {
              border: '2px solid #2c3e50 !important',
              padding: '8px !important',
              backgroundColor: '#ecf0f1 !important',
              fontWeight: 'bold !important',
              textAlign: 'center !important'
            },
            '& td': {
              border: '1px solid #bdc3c7 !important',
              padding: '6px !important',
              textAlign: 'left !important'
            },
            '& tr:hover': {
              backgroundColor: '#f5f5f5 !important'
            }
          }
        }}
      >
        <JoditEditor
          ref={(el) => {
            if (el) {
              editorRefs.current[fieldName] = el;
            }
          }}
          value={value}
          config={joditConfig}
          tabIndex={1}
          onBlur={(newContent) => {
            // Update state when editor loses focus
            onChange(newContent);
          }}
          onChange={(newContent) => {
            // Optional: update on every change (can be performance heavy)
            // onChange(newContent);
          }}
        />
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        position: 'relative',
        borderRadius: 2,
        mt: 1,
        p: 2,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}
    >
      {/* Close Icon */}
      <IconButton onClick={onClose} disabled={loading} sx={{ position: 'absolute', top: -4, right: 8 }}>
        <HighlightOffIcon fontSize="normal" color="error" />
      </IconButton>

      {/* Name (Plain TextField) */}
      <Box>
        <FormLabel sx={{ fontWeight: 600 }} required>
          Name
        </FormLabel>
        <TextField value={newName} onChange={(e) => setNewName(e.target.value)} fullWidth size="small" placeholder="Enter project name" />
      </Box>

      {/* Rich Text Fields with Jodit Editor */}
      {renderEditor('purpose', 'Purpose', purpose, setPurpose)}
      {renderEditor('intro', 'Introduction', intro, setIntro)}
      {renderEditor('scope', 'Scope', scope, setScope)}

      {/* Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
        <Button variant="contained" onClick={handleSave} disabled={loading} startIcon={loading && <CircularProgress size={16} />}>
          Save
        </Button>
      </Box>

      <Toaster position="top-right" />
    </Box>
  );
});
