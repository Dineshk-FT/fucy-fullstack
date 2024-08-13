import React from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/system';

const Image = styled('img')({
  width: '80px',
  height: '80px',
  borderRadius: '8px'
});

const CircleFeature = ({ icon, text, bgColor }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: bgColor,
        borderRadius: '100%',
        width: 350,
        height: 350,
        textAlign: 'center',
        padding: 2,
        color: 'black'
      }}
    >
      <Image src={icon} alt={icon} />

      <Typography variant="body1" sx={{ marginTop: 2 }} fontSize={20} mx={10} fontWeight={700}>
        {text}
      </Typography>
    </Box>
  );
};

export default CircleFeature;
