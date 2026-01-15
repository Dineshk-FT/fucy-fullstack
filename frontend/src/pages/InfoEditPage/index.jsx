/*eslint-disable*/
import React, { useCallback, useEffect, useState } from 'react';
import { Button, Box, TextField, CircularProgress, FormLabel, IconButton } from '@mui/material';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { shallow } from 'zustand/shallow';
import toast, { Toaster } from 'react-hot-toast';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

import useStore from '../../store/Zustand/store';
import ColorTheme from '../../themes/ColorTheme';

const selector = (state) => ({
  updateModelName: state.updateModelName,
  model: state.model,
  getModelById: state.getModelById
});

const quillModules = {
  toolbar: [
    ['bold', 'italic', 'underline'],
    [{ color: [] }, { background: [] }], // 👈 text color + highlight
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link'],
    ['clean']
  ]
};

export default React.memo(function InfoEditPage({ onClose }) {
  const color = ColorTheme();
  const { updateModelName, model, getModelById } = useStore(selector, shallow);

  const [newName, setNewName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [intro, setIntro] = useState('');
  const [scope, setScope] = useState('');
  const [loading, setLoading] = useState(false);

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

  const renderEditor = (label, value, onChange) => (
    <Box>
      <FormLabel sx={{ fontWeight: 600 }}>{label}</FormLabel>
      <Box
        sx={{
          mt: 0.5,
          border: '1px solid #ccc',
          borderRadius: 1,
          '& .ql-toolbar': {
            borderTopLeftRadius: 4,
            borderTopRightRadius: 4
          },
          '& .ql-container': {
            borderBottomLeftRadius: 4,
            borderBottomRightRadius: 4,
            minHeight: 120,
            resize: 'vertical', // 👈 enables manual resize
            overflow: 'auto' // 👈 required for resize to work
          }
        }}
      >
        <ReactQuill theme="snow" value={value} onChange={onChange} modules={quillModules} />
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

      {/* Rich Text Fields */}
      {renderEditor('Purpose', purpose, setPurpose)}
      {renderEditor('Introduction', intro, setIntro)}
      {renderEditor('Scope', scope, setScope)}

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
