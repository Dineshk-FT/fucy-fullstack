import React from 'react';
import { Box, Typography } from '@mui/material';
import CircleFeature from './CircleFeature';
import scale from '../../../assets/images/icons/scale.png';
import pieChart from '../../../assets/images/icons/pie-chart.png';
import settings from '../../../assets/images/icons/settings.png';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  head: {
    borderBottom: '1px solid black',
    pb: 3,
    fontSize: 40,
    [theme.breakpoints.down('md')]: {
      fontSize: 20,
      textAlign: 'center'
    }
  }
}));
export default function WhyComponent() {
  const classes = useStyles();
  return (
    <Box sx={{ height: { lg: '80svh' } }}>
      <Typography variant="h3" align="left" gutterBottom className={classes.head} fontWeight={700} mx={10} my={2}>
        Why Fucy Tech?
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { lg: 'row', md: 'column', sm: 'column', xs: 'column' },
          justifyContent: 'space-around',
          alignItems: 'center',
          gap: 2,
          marginTop: 4
        }}
        mx={8}
      >
        <CircleFeature
          icon={scale}
          text="Automated engine with constantly updated threat libraries to simplify risk management."
          bgColor="#b0c4de"
        />
        <CircleFeature
          icon={pieChart}
          text="Track metrics throughout the lifecycle of your projects to visualize and quantify enterprise risk."
          bgColor="#98fb98"
        />
        <CircleFeature
          icon={settings}
          text="Integrate with your enterprise’s specific PLM/ALM and other engineering tools."
          bgColor="#deb887"
        />
      </Box>
    </Box>
  );
}
