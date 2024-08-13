import * as React from 'react';
import Box from '@mui/material/Box';

const fontFamily=[
    'serif',
    'sans-serif',
    'monospace',
    'cursive',
    'fantasy',
    'system-ui',
    'Inter',
]
export default function FontSelector({font,handleChange }) {


  return (
      <Box sx={{ minWidth: 120}}>
        {/* eslint-disable-next-line */}
      <select type='select'
      onChange={(e)=>handleChange(e,'font')} 
      value={font}
      style={{
        width: '120px',
        height: '21px',
      }}>

      { fontFamily?.map(it=>(
        <option key={it} value={it}>{it}</option>
     )) } 

      </select>
    </Box>
  );
}