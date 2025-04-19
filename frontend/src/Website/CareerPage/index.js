import React, { useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { useDispatch } from 'react-redux';
import { changePage } from '../../store/slices/PageSectionSlice';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  head: {
    borderBottom: '1px solid black',
    pb: 2,
    margin: '1svh 10svh',
    fontSize: 25,
    [theme.breakpoints.down('md')]: {
      textAlign: 'center'
    }
  }
}));

export default function CareerPage() {
  const classes = useStyles();
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(changePage('career'));
  }, []);
  return (
    <Box sx={{ height: '70svh', marginTop: '6rem' }}>
      <Box textAlign="center" my={4}>
        <Typography variant="h3" align="left" gutterBottom fontWeight={700} className={classes.head}>
          No Open Position At This Time
        </Typography>
      </Box>
      <Box my={4} bgcolor="grey.100" p={4}>
        <Typography textAlign="center" variant="h5" gutterBottom>
          Why Join Us?
        </Typography>
        <ul style={{ display: 'grid', placeContent: 'center', gap: 10 }}>
          <li>Hold a key role and contribute directly to the core business in a fast-growing technology startup</li>
          <li>Competitive compensation package including company equity</li>
          <li>Flexible working hours</li>
        </ul>
      </Box>
    </Box>
  );
}
