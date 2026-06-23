import React, { useState } from 'react';
import { TextField, Box, Typography, Grid, Autocomplete } from '@mui/material';
import Button from '../../../../components/Buttons/Button';
import { makeStyles } from '@mui/styles';
import toast, { Toaster } from 'react-hot-toast';

import { shallow } from 'zustand/shallow';
import useStore from '../../../../store/Zustand/store';

const hearAboutUsOptions = ['Google Search', 'LinkedIn', 'Friend or Colleague', 'Social Media', 'Advertisement', 'Event or Conference'];

const selector = (state) => ({
  submitContactForm: state.submitContactForm
});

const useStyles = makeStyles((theme) => ({
  head: {
    borderBottom: '1px solid black',
    pb: 3,
    fontSize: 30,
    [theme.breakpoints.down('md')]: {
      fontSize: 20,
      textAlign: 'center'
    }
  }
}));

function ContactForm() {
  const classes = useStyles();

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
    <Box my={6}>
      <Toaster position="top-center" reverseOrder={false} />

      <Typography variant="h4" align="left" gutterBottom className={classes.head} fontWeight={700} mx={10}>
        Contact us to learn more.
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, mx: 6 }}>
        <Grid container spacing={2}>
          {/* First Column */}
          <Grid item xs={12} md={6}>
            <TextField
              required
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              margin="normal"
              variant="outlined"
              sx={{ mb: 2 }}
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
              sx={{ mb: 2 }}
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
              sx={{ mb: 2 }}
            />
          </Grid>

          {/* Second Column */}
          <Grid item xs={12} md={6}>
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
                  sx={{ mb: 2 }}
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
              rows={5}
              sx={{ mb: 3 }}
            />
          </Grid>
        </Grid>

        <Box sx={{ textAlign: 'center' }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{
              width: '300px',
              py: 1.5,
              fontSize: '1rem'
            }}
            pulse
          >
            Send
          </Button>
        </Box>
      </Box>

      <Box sx={{ mt: 4, textAlign: 'center', color: 'text.secondary' }} display="flex" flexDirection="column" gap={1.5}>
        <Typography variant="body2">
          This site is protected by reCAPTCHA and the Google <a href="https://policies.google.com/privacy">Privacy Policy</a> and{' '}
          <a href="https://policies.google.com/terms">Terms of Service</a> apply.
        </Typography>
        <Typography variant="body2" style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
          Mantri Commercio, Tower A, 5th Floor, Survey No. 39/5, Outer Ring Road, Kariyammana Agrahara, Devarabeesanahalli (Bellandur)
          Bengaluru, Karnataka 560103
        </Typography>
      </Box>
    </Box>
  );
}

export default ContactForm;
