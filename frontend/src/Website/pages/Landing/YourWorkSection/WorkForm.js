/* eslint-disable */
import React, { useState } from 'react';
import { TextField, Box, Typography, Container } from '@mui/material';
import Button from '../../../../components/Buttons/Button';
import ColorTheme from '../../../../themes/ColorTheme';
import toast, { Toaster } from 'react-hot-toast';
import { shallow } from 'zustand/shallow';
import useStore from '../../../../store/Zustand/store';

const selector = (state) => ({
  submitWorkForm: state.submitWorkForm
});
function WorkSubmissionForm() {
  const { submitWorkForm } = useStore(selector, shallow);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    projectTitle: '',
    projectDescription: '',
    workLink: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const toastId = toast.loading('Submitting your work...');

    try {
      const response = await submitWorkForm(formData);

      toast.success(response.message || 'Work submitted successfully!', { id: toastId });

      // Clear the form state on success
      setFormData({
        name: '',
        email: '',
        projectTitle: '',
        projectDescription: '',
        workLink: ''
      });
    } catch (error) {
      toast.error(error.message || 'Failed to submit the form.', { id: toastId });
    }
  };

  return (
    <Container maxWidth="md">
      <Toaster position="top-center" reverseOrder={false} />

      <Box component="form" sx={{ mt: 4 }} display="flex" flexDirection="column">
        <Typography variant="h4" gutterBottom color={ColorTheme()?.logo} align="center" fontSize={25}>
          Hit us with your work.
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Share your projects, ideas, or any work you'd like us to see. We're always excited to collaborate and explore new opportunities!
        </Typography>
      </Box>

      <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2}>
        <TextField
          required
          fullWidth
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          margin="normal"
          variant="outlined"
        />
        <TextField
          required
          fullWidth
          type="email"
          label="Email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          margin="normal"
          variant="outlined"
        />
        <TextField
          fullWidth
          label="Project Title"
          name="projectTitle"
          value={formData.projectTitle}
          onChange={handleChange}
          margin="normal"
          variant="outlined"
        />
        <TextField
          required
          fullWidth
          label="Project Description"
          name="projectDescription"
          value={formData.projectDescription}
          onChange={handleChange}
          margin="normal"
          variant="outlined"
          multiline
          rows={4}
        />
        <TextField
          fullWidth
          label="Link to your work (e.g., GitHub, Behance)"
          name="workLink"
          value={formData.workLink}
          onChange={handleChange}
          margin="normal"
          variant="outlined"
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{
            mt: 2,
            width: 'fit-content',
            alignSelf: 'center',
            px: 4,
            py: 1.5,
            fontSize: '1rem'
          }}
          pulse
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
        {/* <Typography variant="body2">Troy, Michigan 48098, United States.</Typography> */}
        <Typography variant="body2">
          Mantri Commercio, Tower A, 5th Floor, Survey No. 39/5, Outer Ring Road, Kariyammana Agrahara, Devarabeesanahalli (Bellandur)
          Bengaluru, Karnataka 560103
        </Typography>
      </Box>
    </Container>
  );
}

export default WorkSubmissionForm;
