import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import ContentPage from './Content';
import { useDispatch } from 'react-redux';
import { changePage } from '../../../store/slices/PageSectionSlice';

export default function AboutPage() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(changePage('about'));
  }, []);
  return (
    <Box sx={{ mt: 1 }}>
      <ContentPage />
    </Box>
  );
}
