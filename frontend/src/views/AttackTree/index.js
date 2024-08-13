/*eslint-disable*/
import React from 'react';
import KeyboardBackspaceRoundedIcon from '@mui/icons-material/KeyboardBackspaceRounded';
import { useDispatch, useSelector } from 'react-redux';
import { closeAll } from '../../store/slices/CurrentIdSlice';
import { Box, Grid, Paper } from '@mui/material';
import Home from '../AttackSceneCanvas';
import Properties from './Properties';
import Levels from '../AttackSceneCanvas/Levels';

const AttackTree = ({ modal }) => {
  // console.log('modal in attack tree', modal);
  const { attackScene, isLevelOpen } = useSelector((state) => state?.currentId);
  // console.log('attackScene', attackScene)
  const dispatch = useDispatch();

  const handleBack = () => {
    dispatch(closeAll());
  };
  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        {!isLevelOpen && <KeyboardBackspaceRoundedIcon sx={{ float: 'left', cursor: 'pointer', ml: 1 }} onClick={handleBack} />}
        <Paper elevation={3} sx={{ height: '83svh' }}>
          <Grid container sx={{ height: 'inherit' }}>
            <Grid item sx={{ border: '1px solid black' }} sm={8} md={8} lg={8}>
              {!isLevelOpen ? attackScene && <Home attackScene={attackScene} /> : <Levels />}
            </Grid>
            <Grid item sx={{ border: '1px solid black' }} sm={4} md={4} lg={4}>
              <Properties />
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </>
  );
};

export default AttackTree;
