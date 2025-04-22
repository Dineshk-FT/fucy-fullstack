import React from 'react';
import { TextField, Button, Box, Typography, Grid } from '@mui/material';
import { makeStyles } from '@mui/styles';

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
  return (
    <Box my={6}>
      <Typography variant="h4" align="left" gutterBottom className={classes.head} fontWeight={700} mx={10}>
        Contact us to learn more.
      </Typography>
        <Box component="form" sx={{ mt: 1, mx: 6 }}>
          <Grid container spacing={2}>
            {/* First Column */}
            <Grid item xs={12} md={6}>
              <TextField required fullWidth label="Name" margin="normal" variant="outlined" sx={{ mb: 2 }} />
              <TextField required fullWidth label="Company Name" margin="normal" variant="outlined" sx={{ mb: 2 }} />
              <TextField required fullWidth label="Email" margin="normal" variant="outlined" sx={{ mb: 2 }} />
            </Grid>

            {/* Second Column */}
            <Grid item xs={12} md={6}>
              <TextField required fullWidth label="How did you hear about us?" margin="normal" variant="outlined" sx={{ mb: 2 }} />
              <TextField fullWidth label="Message" margin="normal" variant="outlined" multiline rows={5} sx={{ mb: 3 }} />
            </Grid>
          </Grid>

          <Box sx={{ textAlign: 'center' }}>
            <Button type="submit" variant="contained" color="primary" sx={{ width: '300px', px: 5, py: 1 }}>
              Send
            </Button>
          </Box>
        </Box>

      <Box sx={{ mt: 4, textAlign: 'center', color: 'text.secondary' }} display="flex" flexDirection="column" gap={1.5}>
        <Typography variant="body2">
          This site is protected by reCAPTCHA and the Google <a href="https://policies.google.com/privacy">Privacy Policy</a> and{' '}
          <a href="https://policies.google.com/terms">Terms of Service</a> apply.
        </Typography>
        <Typography variant="body2">Troy, Michigan 48098, United States.</Typography>
      </Box>
    </Box>
  );
}

export default ContactForm;
