import React from 'react';
import { TextField, Button, Box, Typography, Container } from '@mui/material';
import ColorTheme from '../../themes/ColorTheme';

function ContactForm() {
  return (
    <Container maxWidth="sm">
      <Box component="form" sx={{ mt: 4 }} display="flex" flexDirection="column">
        <Typography variant="h4" gutterBottom color={ColorTheme()?.logo} align="center" fontSize={25}>
          Contact us to learn more about Fucy Tech.
        </Typography>
        <TextField required fullWidth label="Name" margin="normal" variant="outlined" />
        <TextField required fullWidth label="Company Name" margin="normal" variant="outlined" />
        <TextField required fullWidth label="Email" margin="normal" variant="outlined" />
        <TextField required fullWidth label="How did you hear about us?" margin="normal" variant="outlined" />
        <TextField fullWidth label="Message" margin="normal" variant="outlined" multiline rows={4} />
        <Button type="submit" fullWidth variant="contained" color="primary" sx={{ mt: 2, width: 'fit-content', alignSelf: 'center' }}>
          Send
        </Button>
      </Box>
      <Box sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }} display="flex" flexDirection="column" gap={3} my={2}>
        <Typography variant="body2">
          This site is protected by reCAPTCHA and the Google <a href="https://policies.google.com/privacy">Privacy Policy</a> and{' '}
          <a href="https://policies.google.com/terms">Terms of Service</a> apply.
        </Typography>
        <Typography variant="body2" fontSize={23} fontWeight={600}>
          Fucy Tech.
        </Typography>
        <Typography variant="body2">Troy, Michigan 48098, United States.</Typography>
      </Box>
    </Container>
  );
}

export default ContactForm;
