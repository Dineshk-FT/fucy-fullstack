/*eslint-disable*/
import * as React from 'react';
import { Select, MenuItem, Box, Typography } from '@mui/material';

const fontFamily = [
  { value: 'serif', label: 'Serif', preview: 'serif' },
  { value: 'sans-serif', label: 'Sans Serif', preview: 'sans-serif' },
  { value: 'monospace', label: 'Monospace', preview: 'monospace' },
  { value: 'cursive', label: 'Cursive', preview: 'cursive' },
  { value: 'fantasy', label: 'Fantasy', preview: 'fantasy' },
  { value: 'system-ui', label: 'System UI', preview: 'system-ui' },
  { value: 'Inter', label: 'Inter', preview: 'sans-serif' }
];

export default function FontSelector({ font, handleChange, handleInputClick }) {
  return (
    <Select
      value={font}
      onChange={(e) => handleChange(e, 'font')}
      onClick={handleInputClick}
      sx={{
        minWidth: 165,
        height: '36px',
        '& .MuiSelect-select': {
          display: 'flex',
          alignItems: 'center',
          padding: '8px 12px'
        }
      }}
      MenuProps={{
        PaperProps: {
          sx: {
            maxHeight: 300,
            '& .MuiMenuItem-root': {
              minHeight: 'auto'
            }
          }
        }
      }}
    >
      {fontFamily?.map((fontItem) => (
        <MenuItem key={fontItem.value} value={fontItem.value}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <Box
              sx={{
                fontFamily: fontItem.preview,
                fontSize: '14px',
                flexGrow: 1
              }}
            >
              {fontItem.label}
            </Box>
            <Box
              sx={{
                fontFamily: fontItem.preview,
                fontSize: '12px',
                color: 'text.secondary',
                ml: 1
              }}
            >
              Aa
            </Box>
          </Box>
        </MenuItem>
      ))}
    </Select>
  );
}
