/* eslint-disable*/
import React from 'react';
import Box from '@mui/material/Box';
import { ArrowSquareDown, ArrowSquareUp } from 'iconsax-react';
import ColorTheme from '../../../../store/ColorTheme';
import { useDispatch, useSelector } from 'react-redux';
import LightModeIcon from '@mui/icons-material/LightMode';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import { changeMode, navbarSlide } from '../../../../store/slices/CurrentIdSlice';

export default function RightSection() {
  const color = ColorTheme();
  const dispatch = useDispatch();
  const { isDark, isNavbarClose } = useSelector((state) => state?.currentId);
  const handleChangeMode = () => {
    dispatch(changeMode());
  };
  return (
    <>
      <Box display="flex" gap={2} alignItems="center" justifyContent="center">
        <Box onClick={handleChangeMode} sx={{ cursor: 'pointer' }}>
          {isDark ? <NightsStayIcon sx={{ color: 'white' }} /> : <LightModeIcon />}
        </Box>
        {/* <Box onClick={() => dispatch(navbarSlide())}>
          {!isNavbarClose ? <ArrowSquareUp size="20" color={color?.iconColor} /> : <ArrowSquareDown size="20" color={color?.iconColor} />}
        </Box> */}
      </Box>
    </>
  );
}
