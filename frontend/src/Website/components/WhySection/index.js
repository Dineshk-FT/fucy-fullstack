import { Box, Typography, Card, CardContent, Grid } from '@mui/material';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import BarChartIcon from '@mui/icons-material/BarChart';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';

import React from 'react';

function WhyChooseFucyTech() {
  const features = [
    {
      icon: <AutoGraphIcon fontSize="large" sx={{ color: '#4a90e2' }} />,
      title: 'Automated Risk Management',
      description:
        'Our automated engine features constantly updated threat libraries, simplifying the complexities of risk management and allowing for more effective responses to emerging threats.',
    },
    {
      icon: <BarChartIcon fontSize="large" sx={{ color: '#4a90e2' }} />,
      title: 'Lifecycle Metrics Tracking',
      description:
        'Monitor key metrics throughout your project’s lifecycle to visualize and quantify enterprise risk, ensuring that you can address issues proactively.',
    },
    {
      icon: <IntegrationInstructionsIcon fontSize="large" sx={{ color: '#4a90e2' }} />,
      title: 'Seamless Integration',
      description:
        'Fucy Tech integrates effortlessly with your enterprise’s existing PLM, ALM, and other engineering tools, creating a cohesive workflow that enhances productivity.',
    },
  ];

  return (
    <Box sx={{ py: 8, px: 8, background: 'linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)' }}>
      <Typography variant="h4" align="center" sx={{ fontSize: 32, fontWeight: 700, mb: 4, color: '#333' }}>
        Why Choose Fucy Tech?
      </Typography>
      <Grid container spacing={4} justifyContent="center">
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: 6,
                borderRadius: 4,
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 10,
                },
                backgroundColor: '#fff',
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <Box sx={{ mb: 2 }}>{feature.icon}</Box>
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
  );
}

export default React.memo(WhyChooseFucyTech);
