import React from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/system';

const Image = styled('img')({
  width: '70px',
  height: '70px',
  objectFit: 'contain', 
  marginBottom: '15px',
});

const CardContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#ffffff',
  borderRadius: '20px',
  border: `2px solid #333`,
  width: '320px', 
  height: '220px',  
  padding: '30px 20px', 
  textAlign: 'center',
  color: '#333',
  boxShadow: `0 10px 30px rgba(0, 0, 0, 0.2)`, 
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-5px)', 
    boxShadow: `0 15px 45px rgba(0, 0, 0, 0.3)`,
  },
  [theme.breakpoints.down('sm')]: {
    width: '90%', 
    height: 'auto', 
    padding: '20px 15px', 
  },
}));

const CircleFeature = ({ icon, text, subtitle, bgColor }) => {
  return (
    <CardContainer sx={{ background: bgColor, height: '200px' }}>
      <Image src={icon} alt={text} />
      <Typography variant="h6" sx={{ fontWeight: 600, marginTop: 1 }}>
        {text}
      </Typography>
      {subtitle && (
        <Typography variant="body2" sx={{ marginTop: 1, color: '#777' }}>
          {subtitle}
        </Typography>
      )}
    </CardContainer>
  );
};

export default CircleFeature;
