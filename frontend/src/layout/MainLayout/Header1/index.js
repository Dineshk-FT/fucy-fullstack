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
        bgcolor: color?.navBG,
        overflow: 'visible', // Prevent clipping of dropdown
        zIndex: 1300 // Ensure Header1 is above Sidebar
      }}
    >
      <LeftSection />
      <RightSection />
    </Box>
  );
};

export default Header1;