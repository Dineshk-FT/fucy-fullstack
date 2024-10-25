import React from 'react';
import { Box, Typography, Button, Container, Grid } from '@mui/material';
import { makeStyles } from '@mui/styles';
import ideas from '../../../assets/images/others/nextidea.jpg';

const useStyles = makeStyles((theme) => ({
  section: {
    background: 'linear-gradient(135deg, #e3f2fd 0%, #f8f9fa 100%)',
    padding: theme.spacing(4, 3),
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  footer: {
    backgroundColor: '#000',
    padding: theme.spacing(4),
    maxWidth: 'inherit',
  },
  head: {
    fontSize: 50,
    fontWeight: 700,
    [theme.breakpoints.down('md')]: {
      fontSize: 40,
    },
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
  },
  button: {
    backgroundColor: 'black',
    color: 'white',
    fontSize: 23,
    padding: theme.spacing(1.5, 4), // Adjusted padding for a better button size
    borderRadius: 4,
    transition: 'background-color 0.3s, color 0.3s, transform 0.2s',
    '&:hover': {
      backgroundColor: 'white',
      color: 'black',
      boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)',
      transform: 'scale(1.05)', // Added scale effect on hover
    },
  },
  image: {
    width: '100%',
    height: 'auto', // Changed to auto for responsive behavior
    borderRadius: 8,
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
  },
  subhead: {
    fontSize: 24,
    fontWeight: 600,
    color: '#444',
    margin: theme.spacing(2, 0),
  },
  paragraph: {
    fontSize: 20,
    textAlign: 'justify', // Changed to justify for a cleaner look
  },
}));

export default function CyberSecuritySection() {
  const classes = useStyles();
  return (
    <Box>
      <Grid container className={classes.section} spacing={2} display="flex" justifyContent="space-evenly">
        <Grid item xs={12} md={6} lg={4}>
          <Box component="img" src={ideas} alt="Cybersecurity Innovation" className={classes.image} />
        </Grid>
        <Grid item lg={5} md={6} xs={12}>
          <Box className={classes.content}>
            <Typography variant="h3" component="h1" className={classes.subhead} gutterBottom>
              Revolutionizing Automotive Cybersecurity
            </Typography>
            <Typography variant="body1" paragraph className={classes.paragraph}>
              Fucy Tech is a cutting-edge, cloud-based Cybersecurity Management System (CSMS) tailored specifically for the automotive industry. Our platform accelerates and guides cybersecurity engineering processes, ensuring your organization remains compliant and proactive in the face of evolving threats.            </Typography>
            <Typography variant="h4" className={classes.subhead}>
              The Next Big Step in Cybersecurity Innovation
            </Typography>
            <Typography variant="body1" paragraph className={classes.paragraph}>
              In a cyber-physical system, cybersecurity requires systems engineering. The right hardware needs to be matched with the right software via the right interface.            </Typography>
            <Button className={classes.button}>Learn More About Us</Button>
          </Box>
        </Grid>
      </Grid>
      <Container className={classes.footer}>
        <Typography color="white" variant="h6" textAlign="center" className={classes.head}>
          Automotive cybersecurity compliance made simple.
        </Typography>
      </Container>
    </Box>
  );
}
