import { Box, Grid, Paper, Typography } from '@mui/material';
import { styled } from '@mui/system';
import React from 'react';
import { Gauge } from '@mui/x-charts';
import { BarChart } from '@mui/x-charts';
import { PieChart } from '@mui/x-charts';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  // textAlign: 'left',
  color: theme.palette.text.secondary,
  height: '30svh',
  display: 'flex',
  flexDirection: 'column'
}));

const props = {
  minWidth: 250,
  maxWidth: 500,
  height: 300,
  xAxis: [{ data: ['A', 'B', 'C'], scaleType: 'band' }]
};
// const data = [
//     {
//         space: 4,
//         title: 'Threat Review Completion rate',
//         value:60
//     }
// ]
const DashBoard = () => {
  return (
    <>
      <Box sx={{ flexGrow: 1, mt: 20, mx: 5 }}>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Item elevation={2}>
              <Typography align="left">Threat Review Completion rate</Typography>
              <Box alignSelf="center" display="grid" height="inherit" sx={{ placeItems: 'center' }}>
                <Gauge width={150} height={150} value={60} />
              </Box>
            </Item>
          </Grid>
          <Grid item xs={4}>
            <Item elevation={2}>
              <Typography align="left">Risk Treatement Completion rate</Typography>
              <Box alignSelf="center" display="grid" height="inherit" sx={{ placeItems: 'center' }}>
                <Gauge width={150} height={150} value={10} />
              </Box>
            </Item>
          </Grid>
          <Grid item xs={4}>
            <Item elevation={2}>
              <Typography align="left">Threat validation Completion rate</Typography>
              <Box alignSelf="center" display="grid" height="inherit" sx={{ placeItems: 'center' }}>
                <Gauge width={150} height={150} value={20} />
              </Box>
            </Item>
          </Grid>
          <Grid item xs={8}>
            <Item elevation={2}>
              <Typography align="left">Residual Risk from Threats</Typography>
            </Item>
          </Grid>
          <Grid item xs={4}>
            <Item elevation={2}>
              <Typography align="left">Vulnerability Distribution</Typography>
              <Box alignSelf="center" display="flex" flexDirection="column" height="inherit" justifyContent="center">
                <Typography fontSize={35} color="black" fontWeight={700}>
                  0
                </Typography>
                <Typography fontSize={13}>Vulnerabilies</Typography>
              </Box>
            </Item>
          </Grid>
          <Grid item xs={4}>
            <Item elevation={2}>
              <Typography align="left">Top 5 Weakness</Typography>
              <BarChart
                {...props}
                series={[
                  { data: [2400, 1398, 9800], label: 'simple label' },
                  { data: [500, 2398, 4300], label: (location) => `${location} label` }
                ]}
              />
            </Item>
          </Grid>
          <Grid item xs={4}>
            <Item elevation={2}>
              <Typography align="left">Project Aggregated Risks</Typography>
            </Item>
          </Grid>
          <Grid item xs={4}>
            <Item elevation={2}>
              <Typography align="left">Cybersecurity Information Events</Typography>
              <PieChart
                {...props}
                series={[
                  {
                    data: [
                      { id: 0, value: 10, label: (location) => `${location}+A` },
                      { id: 1, value: 15, label: (location) => `${location}+B` },
                      { id: 2, value: 20, label: (location) => `${location}+C` }
                    ],
                    type: 'pie',
                    arcLabel: 'label'
                  }
                ]}
              />
            </Item>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default DashBoard;
