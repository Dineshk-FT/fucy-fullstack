import React, { useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { useDispatch } from 'react-redux';
import { changePage } from '../../store/slices/PageSectionSlice';
import { makeStyles } from '@mui/styles';
import WorkSubmissionForm from './WorkForm';

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

export default function ContactPage() {
  const classes = useStyles();
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(changePage('contact'));
  }, []);
  return (
    <Box sx={{ marginTop: '6rem' }}>
      <Box textAlign="center" my={4}>
        <Typography variant="h3" align="left" gutterBottom fontWeight={700} className={classes.head}>
          Work Submission
        </Typography>
      </Box>
      <WorkSubmissionForm />
    </Box>
  );
}
