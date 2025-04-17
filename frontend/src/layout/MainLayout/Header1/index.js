/* eslint-disable */
import React from 'react';
import { Box } from '@mui/material';
import LeftSection from './LeftSection';
import RightSection from './RightSection';
import ColorTheme from '../../../store/ColorTheme'; // Adjust path as needed

const Header1 = () => {
  const color = ColorTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        // background: color?.mode === 'dark'
        //   ? 'linear-gradient(145deg, rgba(30,30,30,0.9) 0%, rgba(20,20,20,0.85) 100%)'
        //   : 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(245,245,245,0.9) 100%)',
        // backdropFilter: 'blur(12px)',
        // boxShadow: color?.mode === 'dark'
        //   ? '0 4px 16px rgba(0,0,0,0.5)'
        //   : '0 4px 16px rgba(0,0,0,0.15)',
        overflow: 'visible', // Prevent clipping of dropdown
        zIndex: 1300, // Ensure Header1 is above Sidebar
        padding: '0 16px' // Add padding for spacing
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center', // Center the LeftSection
          alignItems: 'center'
        }}
      >
        <LeftSection />
      </Box>
      <RightSection />
    </Box>
  );
};

export default React.memo(Header1);
