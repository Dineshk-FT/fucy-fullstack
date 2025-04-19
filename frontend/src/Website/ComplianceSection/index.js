import React from 'react';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import { styled } from '@mui/system';
import { makeStyles } from '@mui/styles';
import Team from '../../assets/images/others/Team.webp';
import network from '../../assets/images/others/network.webp';

const useStyles = makeStyles((theme) => ({
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
  },
  head: {
    fontSize: 50,
    padding: theme.spacing(6),
    [theme.breakpoints.down('md')]: {
      fontSize: 40,
    },
  },
  keyFeatures: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: theme.spacing(4),
    margin: theme.spacing(4, 0),
  },
  featureCard: {
    backgroundColor: '#222',
    color: '#fff',
    borderRadius: 8,
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
    transition: 'transform 0.2s',
    '&:hover': {
      transform: 'scale(1.05)',
    },
  },
  featureTitle: {
    color: '#fff',
    fontSize: 18,
    paddingBottom: 6,
    fontWeight: 700,
    marginBottom: theme.spacing(1),
  },
}));

const Container = styled(Box)({
  backgroundColor: '#000',
  color: '#fff',
  padding: '2rem',
});

const Section = styled(Box)({
  marginBottom: '2rem',
});

const TeamImage = styled('img')({
  width: '100%',
  height: '100%',
  borderRadius: '8px',
});

const NetworkImage = styled('img')({
  width: '100%',
  height: '80%',
  borderRadius: '8px',
});



export default function CompliancePage() {
  const classes = useStyles();

  const features = [
    {
      title: 'TARA Automation',
      description:
        'Our Threat Analysis and Risk Assessment (TARA) automation streamlines the identification and management of potential vulnerabilities, enabling your team to focus on strategic decision-making.',
    },
    {
      title: 'Bill of Materials (BOM) Management',
      description:
        'Keep track of all components within your projects, ensuring that every part of your system meets security standards and is regularly assessed for vulnerabilities.',
    },
    {
      title: 'Cybersecurity Monitoring',
      description:
        'Continuous monitoring helps detect and respond to threats in real-time, safeguarding your products and data throughout their lifecycle.',
    },
  ];

  return (
    <Container>
      {/* Introduction Section */}
      <Grid container spacing={2} display="flex" justifyContent="space-evenly" alignItems="center">
        <Grid item xs={12} md={6} lg={6}>
          <Box className={classes.section}>
            <Section>
              <Typography variant="h5" component="h2" color="white" fontSize={20}>
                1. Track threats and risks to elevate your brand.
              </Typography>
            </Section>
            <Section>
              <Typography variant="h5" component="h2" color="white" fontSize={20}>
                2. Manage metrics throughout the lifecycle of a project.
              </Typography>
            </Section>
            <Section>
              <Typography variant="h5" component="h2" color="white" fontSize={20}>
                3. Keep your product security risks up-to-date even after product launch.
              </Typography>
            </Section>
            <Section>
              <Typography variant="h5" component="h2" color="white" fontSize={20}>
                4. Conduct regular vulnerability assessments to identify and mitigate emerging threats.
              </Typography>
            </Section>
            <Section>
              <Typography variant="h5" component="h2" color="white" fontSize={20}>
                5. Foster collaboration between teams to ensure a unified approach to cybersecurity across all departments.
              </Typography>
            </Section>
          </Box>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <TeamImage src={Team} alt="Happy team" />
        </Grid>
      </Grid>

      {/* Key Features Section */}
      <Typography variant="h4" component="h2" color="white" fontSize={40} fontWeight={600} textAlign="left" mt={6} mx={12}>
          Key Features
        </Typography>
      <Box sx={{ py: 8, px: 10, background: 'black' }}>
      <Grid container spacing={6} justifyContent="center">
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: 6,
                borderRadius: 0,
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 10,
                },
                backgroundColor: '#fff',
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <Typography variant="h6" component="h3" sx={{ fontSize: 16, fontWeight: 600, mb: 1, color: '#4a4a4a' }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#6c757d' }}>
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>

      {/* Additional Information Section */}
      <Typography color="white" variant="h6" textAlign="center" className={classes.head}>
        A New Era in Cybersecurity.
      </Typography>
      <Grid container spacing={6}  display="flex" justifyContent="space-evenly" alignItems="center">
        <Grid item xs={12} md={6} lg={5}>
          <NetworkImage src={network} alt="City lights" />
        </Grid>
        <Grid item xs={12} md={6} lg={6}>
          <Section>
            <Typography variant="h5" component="h2" color="white" fontSize={20}>
              In today’s cyber-physical landscape, cybersecurity transcends traditional software engineering; it requires a holistic systems engineering approach. The right hardware must work in tandem with the appropriate software through optimized interfaces. Fucy Tech ensures that your system design is strategically planned before any code is written, setting a strong foundation for secure product development.
            </Typography>
          </Section>
          <Section>
            <Typography variant="h5" component="h2" color="white" fontSize={20}>
              Fucy Tech is a cloud-based CSMS that accelerates and guides cybersecurity engineering processes. Using our pre-built libraries and AI/ML engine, you no longer need to type the details in every cell.
            </Typography>
          </Section>
        </Grid>
      </Grid>
    </Container>
  );
}
