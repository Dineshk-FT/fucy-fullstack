import React, { useState } from 'react';
import { TextField, Box, Typography, Container, Autocomplete } from '@mui/material';
import Button from '../../../components/Buttons/Button';
import ColorTheme from '../../../themes/ColorTheme';
import toast, { Toaster } from 'react-hot-toast';
import useStore from '../../../store/Zustand/store';
import { shallow } from 'zustand/shallow';

const hearAboutUsOptions = ['Google Search', 'LinkedIn', 'Friend or Colleague', 'Social Media', 'Advertisement', 'Event or Conference'];

const selector = (state) => ({
  submitContactForm: state.submitContactForm
});
function ContactForm() {
  // Extract the API action from your Zustand store
  const { submitContactForm } = useStore(selector, shallow);

  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    email: '',
    hearAboutUs: '',
    message: ''
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
    const toastId = toast.loading('Sending your message...');

    try {
      // Use the global store action instead of inline fetch
      const response = await submitContactForm(formData);

      toast.success(response.message || 'Message sent successfully!', { id: toastId });

      // Clear the form state on success
      setFormData({ name: '', companyName: '', email: '', hearAboutUs: '', message: '' });
    } catch (error) {
      toast.error(error.message || 'Failed to connect to the server.', { id: toastId });
    }
  };

  return (
    <Container maxWidth="sm">
      <Toaster position="top-center" reverseOrder={false} />

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }} display="flex" flexDirection="column">
        <Typography variant="h4" gutterBottom color={ColorTheme()?.logo} align="center" fontSize={25}>
          Contact us to learn more about Fucy Tech.
        </Typography>

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
          label="Company Name"
          name="companyName"
          value={formData.companyName}
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

        <Autocomplete
          freeSolo
          options={hearAboutUsOptions}
          value={formData.hearAboutUs}
          onInputChange={(event, newInputValue) => {
            setFormData((prevState) => ({
              ...prevState,
              hearAboutUs: newInputValue
            }));
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              required
              fullWidth
              label="How did you hear about us?"
              name="hearAboutUs"
              margin="normal"
              variant="outlined"
            />
          )}
        />

        <TextField
          fullWidth
          label="Message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          margin="normal"
          variant="outlined"
          multiline
          rows={4}
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
            py: 1.5
          }}
          pulse
        >
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
        <Typography variant="body2">
          Mantri Commercio, Tower A, 5th Floor, Survey No. 39/5, Outer Ring Road, Kariyammana Agrahara, Devarabeesanahalli (Bellandur)
          Bengaluru, Karnataka 560103
        </Typography>
      </Box>
    </Container>
  );
}

export default ContactForm;
