import React from 'react';
import AddNewNode from '../../../ui-component/Modal/AddNewNode';
import { Box, Divider } from '@mui/material';
import MenuCard from '../Sidebar/MenuCard/index1';
import { useSelector } from 'react-redux';
export default function RightDrawer() {
  const { propertiesTabOpen, addNodeTabOpen } = useSelector((state) => state?.canvas);

  return (
    <React.Fragment>
      <Box
        sx={{
          backgroundColor: '#e3e3e3',
          position: 'sticky',
          float: 'right',
          // left: '50rem',
          transition: 'width 0.8s',
          width: 350,
          height: 'fit-content',
          maxHeight: '85svh',
          overflow: 'auto',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column'
          // pr:1
        }}
      >
        {addNodeTabOpen && <AddNewNode />}
        {addNodeTabOpen && propertiesTabOpen && <Divider sx={{ borderBottom: '2px solid black', my: 1, mx: 2 }} />}
        {propertiesTabOpen && (
          <Box m={2}>
            <MenuCard />
          </Box>
        )}
      </Box>
    </React.Fragment>
  );
}
