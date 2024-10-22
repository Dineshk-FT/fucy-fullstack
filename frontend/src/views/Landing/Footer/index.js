import React from 'react';
import { Box, Typography, Link } from '@mui/material';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import FadeInDiv from '../../../ui-component/FadeInDiv';

export default function Footer() {
  return (
    <FadeInDiv>
      <Box
        component="footer"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '20px',
          backgroundColor: 'transparent',
          borderTop: '1px solid #e0e0e0'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mb: 2
          }}
        >
          <Link href="/home" underline="none" sx={{ mx: 2 }} color="black">
            Home
          </Link>
          <Link href="/about" underline="none" sx={{ mx: 2 }} color="black">
            About Us
          </Link>
          <Link href="contact" underline="none" sx={{ mx: 2 }} color="black">
            Contact
          </Link>
          <Link href="#" underline="none" sx={{ mx: 2 }} color="black">
            Privacy Policy
          </Link>
        </Box>
        <Link href="https://www.linkedin.com/company/fucytech/" target="_blank" rel="noopener">
          <LinkedInIcon fontSize="large" color="primary" />
        </Link>
        <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 2 }}>
          © 2024 Fucy Tech, Inc. - All Rights Reserved.
        </Typography>
      </Box>
    </FadeInDiv>
  );
}
