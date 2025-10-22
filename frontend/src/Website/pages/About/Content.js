import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import Button from '../../../components/Buttons/Button';
// import { styled } from '@mui/system';
import Team from '../../../assets/images/others/Team.webp';
// import network from '../../assets/images/others/network.webp';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  content: {
    // width:'auto'
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 15,
    margin: '0 1rem'
  },
  button: {
    fontSize: '1.2rem',
    padding: '12px 32px',
    width: 'fit-content',
    borderRadius: '8px',
    textTransform: 'none',
    fontWeight: 600,
    transition: 'all 0.3s ease'
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 2
  },
  head: {
    fontSize: 50,
    [theme.breakpoints.down('md')]: {
      fontSize: 30,
      textAlign: 'center'
    }
  }
}));

export default function ContentPage() {
  const classes = useStyles();
  return (
    <Box>
      {/* 1st Block */}
      <Box>
        <Grid container sx={{ my: 8 }} display="flex" justifyContent="space-evenly">
          <Grid item lg={6}>
            <Box component="img" src='https://i.pinimg.com/564x/d8/42/82/d842824f28ab05d3ffb1a03f6e7e6297.jpg' alt="Cybersecurity Innovation" className={classes.image} />
          </Grid>
          <Grid item lg={5}>
            <Box className={classes.content}>
              <Typography variant="h3" component="h1" fontWeight={700} className={classes.head} mt={1}>
                Transforming Cyber Risk Management
              </Typography>
              <Typography variant="body1" paragraph fontSize={20} sx={{ textWrap: 'balance' }} textAlign="justify">
                We work with engineering and IT teams of Automotive Tier 1 suppliers and OEMs. We promote the Secure-by-design principle in
                cybersecurity and provide an automated and autonomous modeling environment built with threat libraries focused on
                cyber-physical systems.
              </Typography>
              <Button 
                variant="contained" 
                color="primary"
                className={classes.button}
                pulse
              >
                Schedule a Demo
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
      {/* 2nd Block */}
      <Box sx={{ bgcolor: '#EEEEEE' }}>
        <Grid container sx={{ my: 8 }} display="flex" justifyContent="space-evenly">
          <Grid item lg={6}>
            <Box className={classes.content}>
              <Typography variant="h3" component="h1" className={classes.head} fontWeight={700} mt={1}>
                {"We've been in your shoes."}
              </Typography>
              <Typography variant="body1" paragraph fontSize={20} sx={{ textWrap: 'balance' }} textAlign="justify">
                We have first hand experiences of the challenges of manually tracking risks to a product design and portfolio. With our
                expertise in field of product cybersecurity and our knowledge of ISO/SAE 21434, UNECE WP.29, and cybersecurity requirements
                from various automotive companies we can help carry your burden of navigating cybersecurity processes.
              </Typography>
            </Box>
          </Grid>
          <Grid item lg={5}>
            <Box component="img" src={Team} alt="Cybersecurity Innovation" className={classes.image} />
          </Grid>
        </Grid>
      </Box>
      {/* 3rd Block */}
      <Box>
        <Grid container sx={{ my: 8 }} display="flex" justifyContent="space-evenly">
          <Grid item lg={6}>
            <Box component="img" src='https://i.pinimg.com/564x/28/63/08/286308f8de514eb3acbbfcc0da9ec2ed.jpg' alt="Cybersecurity Innovation" className={classes.image} />
          </Grid>
          <Grid item lg={5}>
            <Box className={classes.content}>
              <Typography variant="h3" component="h1" className={classes.head} fontWeight={700} mt={1}>
                Mission Statement
              </Typography>
              <Typography variant="body1" paragraph fontSize={20} textAlign="justify">
                Our mission is to secure the connected world by promoting the secure-by-design principle for cybersecurity in
                cross-functional product engineering teams. Risks should guide design decisions for products that transform our livings, so
                that no matter who they are, they will not threaten our physical world.
              </Typography>
              <Button className={classes.button}>Contact</Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
