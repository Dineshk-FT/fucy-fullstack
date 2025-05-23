import React from 'react';
import { Box, Typography, Link } from '@mui/material';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import FadeInDiv from '../../../components/FadeInDiv';

const Footer = React.memo(function Footer() {
  return (
    <FadeInDiv>
      <Box
        component="footer"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '40px 20px',
          background: 'black',
          borderTop: '1px solid #e0e0e0',
          gap: '20px',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            flexWrap: 'wrap',
          }}
        >
          <Link href="/home" underline="hover" sx={{ fontSize: '14px', color: 'white' }}>
            Home
          </Link>
          <Link href="/about" underline="hover" sx={{ fontSize: '14px', color: 'white' }}>
            About Us
          </Link>
          <Link href="/contact" underline="hover" sx={{ fontSize: '14px', color: 'white' }}>
            Contact
          </Link>
          <Link href="/privacy-policy" underline="hover" sx={{ fontSize: '14px', color: 'white' }}>
            Privacy Policy
          </Link>
        </Box>

        <Box
          sx={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
          }}
        >
          <Link href="https://www.linkedin.com/company/fucytech/" target="_blank" rel="noopener">
            <LinkedInIcon fontSize="large" sx={{ color: '#0077b5', '&:hover': { color: '#005582' } }} />
          </Link>
          <Link href="https://twitter.com/fucytech" target="_blank" rel="noopener">
            <TwitterIcon fontSize="large" sx={{ color: '#1DA1F2', '&:hover': { color: '#0d8dd7' } }} />
          </Link>
        </Box>

        {/* Copyright Text */}
        <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 2, fontSize: '12px' }} component="footer" aria-label="Copyright">
          &copy; {new Date().getFullYear()} Fucy Tech. All rights reserved.
        </Typography>
      </Box>
    </FadeInDiv>
  );
});

export default Footer;