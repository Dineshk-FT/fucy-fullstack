import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { styled } from '@mui/system';
import Team from '../../../assets/images/others/Team.webp';
import network from '../../../assets/images/others/network.webp';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles(() => ({
  section: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: 30,
    // justifyContent:'space-around',
    gap: 30
  }
}));
const Container = styled(Box)({
  backgroundColor: '#000',
  color: '#fff',
  padding: '2rem'
});

const Section = styled(Box)({
  marginBottom: '2rem'
});

const TeamImage = styled('img')({
  width: '100%',
  height: '100%',
  borderRadius: '8px'
});
const NetworkImage = styled('img')({
  width: '100%',
  height: '80%',
  borderRadius: '8px'
});

export default function CompliancePage() {
  const classes = useStyles();
  return (
    <Container>
      <Grid container spacing={6}>
        <Grid item xs={12} md={6} lg={6}>
          <Box className={classes.section} mx={6}>
            <Section>
              <Typography variant="h5" component="h2" color="white" fontSize={25}>
                Track threats and risks to elevate your brand.
              </Typography>
            </Section>
            <Section>
              <Typography variant="h5" component="h2" color="white" fontSize={25}>
                Manage metrics throughout the lifecycle of a project.
              </Typography>
            </Section>
            <Section>
              <Typography variant="h5" component="h2" color="white" fontSize={25}>
                Keep your product security risks up-to-date even after product launch.
              </Typography>
            </Section>
          </Box>
        </Grid>
        <Grid item xs={12} md={6} lg={6}>
          <TeamImage
            src={Team} // replace with actual image URL
            alt="Happy team"
          />
        </Grid>
        <Grid item xs={12} md={6} lg={6}>
          <NetworkImage
            src={network} // replace with actual image URL
            alt="City lights"
          />
        </Grid>
        <Grid item xs={12} md={6} lg={6}>
          <Section>
            <Typography variant="h5" component="h2" color="white" fontSize={25} mt={10}>
              Fucy Tech is a cloud-based CSMS that accelerates and guides cybersecurity engineering processes. Using our pre-built libraries
              and AI/ML engine, you no longer need to type the details in every cell.
            </Typography>
          </Section>
        </Grid>
      </Grid>
    </Container>
  );
}
