/* eslint-disable */
import React from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import LeftSection from './LeftSection';
import RightSection from './RightSection';

// Memoised outside the component — created once, never recreated on re-render
const MemoLeftSection = React.memo(LeftSection, (prevProps, nextProps) => {
  return JSON.stringify(prevProps) === JSON.stringify(nextProps);
});

const Header = () => {
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        overflow: 'visible',
        zIndex: 1300,
        // Responsive horizontal padding
        px: { xs: 1, sm: 1.5, md: 2 },
        // Ensure a sensible minimum height on mobile
        minHeight: { xs: 48, sm: 56 },
        boxSizing: 'border-box'
      }}
    >
      {/* Left section — centred on desktop, left-aligned on tablet/mobile */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          justifyContent: isTablet ? 'flex-start' : 'center',
          alignItems: 'center',
          minWidth: 0, // lets children truncate rather than overflow
          overflow: 'visible'
        }}
      >
        <MemoLeftSection />
      </Box>

      {/* Right section — never shrinks, sits flush to the right edge */}
      <Box sx={{ flexShrink: 0 }}>
        <RightSection />
      </Box>
    </Box>
  );
};

export default React.memo(Header);
