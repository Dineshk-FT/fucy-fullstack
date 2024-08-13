import React from 'react';
import { Box, Typography, Button, Container, Grid } from '@mui/material';
import { makeStyles } from '@mui/styles';
// import ideas from "../../../assets/images/others/Ideas.webp";
import ideas from '../../../assets/images/others/nextidea.jpg';

const useStyles = makeStyles((theme) => ({
  footer: {
    backgroundColor: '#000',
    padding: theme.spacing(4),
    maxWidth: 'inherit'
  },
  head: {
    fontSize: 50,
    [theme.breakpoints.down('md')]: {
      fontSize: 40
    }
  },
  content: {
    // width:'auto'
    display: 'flex',
    flexDirection: 'column',
    gap: 15
  },
  button: {
    backgroundColor: 'black',
    color: 'white',
    fontSize: 23,
    padding: '8px 20px',
    width: 'fit-content',
    '&:hover': {
      backgroundColor: 'white',
      color: 'black',
      boxShadow: '0px 0px 5px gray'
    }
  }
}));

export default function CyberSecuritySection() {
  const classes = useStyles();
  return (
    <Box>
      <Grid container sx={{ my: 8, px: 8 }} display="flex" justifyContent="space-evenly">
        <Grid item xs={12} md={6} lg={6}>
          <Box component="img" src={ideas} alt="Cybersecurity Innovation" sx={{ width: '100%', height: '100%', borderRadius: 2 }} />
        </Grid>
        <Grid item lg={5} md={4} xs={12}>
          <Box className={classes.content}>
            <Typography variant="h3" component="h1" className={classes.head} gutterBottom fontWeight={700}>
              The Next Big Step in Cybersecurity Innovation
            </Typography>
            <Typography variant="body1" paragraph fontSize={20} sx={{ textWrap: 'balance', mx: 1 }}>
              In a cyber-physical system, cybersecurity is no longer a software engineering task - it requires systems engineering. The
              right hardware needs to be matched with the right software via the right interface. The system design must be planned before
              the first line of code is written.
            </Typography>
            <Button className={classes.button}>Learn More About Us</Button>
          </Box>
        </Grid>
      </Grid>
      <Container className={classes.footer}>
        <Typography color="white" variant="h6" textAlign="center" className={classes.head}>
          Automotive cybersecurity compliance made simple .
        </Typography>
      </Container>
    </Box>
  );
}
