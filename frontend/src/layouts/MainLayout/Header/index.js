/* eslint-disable */
import React from 'react';
import { Box } from '@mui/material';
import LeftSection from './LeftSection';
import RightSection from './RightSection';

// ✅ Move memo OUTSIDE the component — defined once, never recreated
const MemoLeftSection = React.memo(LeftSection, (prevProps, nextProps) => {
  return JSON.stringify(prevProps) === JSON.stringify(nextProps);
});

const Header = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        overflow: 'visible',
        zIndex: 1300,
        padding: '0 16px'
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <MemoLeftSection />
      </Box>
      <RightSection />
    </Box>
  );
};

export default React.memo(Header);
