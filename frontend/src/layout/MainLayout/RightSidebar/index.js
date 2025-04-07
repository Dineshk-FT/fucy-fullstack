import React from 'react';
import AddNewNode from '../../../ui-component/Modal/AddNewNode';
import AddDataNode from '../../../ui-component/Modal/AddDataNode';
import { Box } from '@mui/material';
import MenuCard from '../Sidebar/MenuCard/index1';
import { useSelector } from 'react-redux';

export default function RightDrawer() {
  const { propertiesTabOpen, addNodeTabOpen, addDataNodeTab } = useSelector((state) => state?.canvas);

  const drawerStyles = {
    backgroundColor: '#f5f5f5',
    position: 'sticky',
    float: 'right',
    transition: 'width 0.8s',
    width: 250,
    height: 'fit-content',
    maxHeight: '85svh',
    overflow: 'auto',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '-1px 0px 10px gray'
  };

  return (
    <React.Fragment>
      <Box sx={drawerStyles}>
        {propertiesTabOpen && <MenuCard />}
        {addNodeTabOpen && <AddNewNode />}
        {addDataNodeTab && <AddDataNode />}
      </Box>
    </React.Fragment>
  );
}
