/* eslint-disable */
import React from 'react';
import { TextField, Button, Box, Typography, Container } from '@mui/material';
import ColorTheme from '../../store/ColorTheme';

function WorkSubmissionForm() {
  const handleSubmit = (event) => {
    event.preventDefault();
    // Extract values from the form and process them (e.g., sending data to an API)
    console.log('Work submission form submitted!');
  };

  return (
    <Container maxWidth="md">
      <Box component="form" sx={{ mt: 4 }} display="flex" flexDirection="column">
        <Typography variant="h4" gutterBottom color={ColorTheme()?.logo} align="center" fontSize={25}>
        Hit us with your work.
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Share your projects, ideas, or any work you'd like us to see. We're always excited to collaborate and explore new opportunities!
        </Typography>
      </Box>
      <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2}>
        <TextField required fullWidth label="Name" margin="normal" variant="outlined" />
        <TextField required fullWidth label="Email" margin="normal" variant="outlined" />
        <TextField fullWidth label="Project Title" margin="normal" variant="outlined" />
        <TextField 
          required 
          fullWidth 
          label="Project Description" 
          margin="normal" 
          variant="outlined" 
          multiline 
          rows={4} 
        />
        <TextField 
          fullWidth 
          label="Link to your work (e.g., GitHub, Behance)" 
          margin="normal" 
          variant="outlined" 
        />
        <Button 
          type="submit" 
          fullWidth 
          variant="contained" 
          color="primary" 
          sx={{ mt: 2, width: 'fit-content', alignSelf: 'center' }}
        >
          Submit
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

export default WorkSubmissionForm;
