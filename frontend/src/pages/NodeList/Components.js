import React, { useEffect, useState } from 'react';
/* eslint-disable */
// import {
// Button,Drawer,
//  IconButton } from "@mui/material";
import Box from '@mui/material/Box';
import useStore from '../../Zustand/store';
import AddIcon from '@mui/icons-material/Add';
// import AddComponentNew from "./AddComponentNew";
// import RemoveIcon from "@mui/icons-material/Remove";
import {
  CardEdit,
  KyberNetwork,
  ArrowUp,
  ArrowDown,
  ExportSquare,
  I3DCubeScan,
  People,
  UserRemove,
  UserTag,
  AudioSquare,
  Profile2User,
  Danger,
  Car,
  TheGraph
} from 'iconsax-react';
import AddNewNode from '../../ui-component/Modal/AddNewNode';
import { Avatar, Typography } from '@mui/material';
import ColorTheme from '../../themes/ColorTheme';
import { shallow } from 'zustand/shallow';

const selector = (state) => ({
  sidebarNodes: state.sidebarNodes,
  getSidebarNode: state.getSidebarNode,
  deleteNode: state.deleteNode
  // getComponent: state.getComponent
});

const iconComponents = {
  CardEdit,
  KyberNetwork,
  I3DCubeScan,
  Car,
  People,
  UserRemove,
  UserTag,
  AudioSquare,
  Profile2User,
  Danger,
  ArrowDown,
  ArrowUp,
  ExportSquare,
  TheGraph
};

const Components = () => {
  const [open, setOpen] = useState(false);
  const { sidebarNodes, getSidebarNode } = useStore(selector, shallow);
  const color = ColorTheme();

  const [hoveredItem, setHoveredItem] = useState(null);
  const [hoveredPosition, setHoveredPosition] = useState({ top: 0, left: 0 });
  const handleMouseEnter = (event, item) => {
    const rect = event.target.getBoundingClientRect();
    // console.log('rect', rect)
    setHoveredPosition({ top: rect.top - 50 });
    setHoveredItem(item);
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
  };
  //To drag a element the data can be retrieved by using the setData's key
  const onDragStart = (event, item) => {
    const parseFile = JSON.stringify(item);
    event.dataTransfer.setData('application/parseFile', parseFile);
    event.dataTransfer.effectAllowed = 'move';
  };

  const getListContent = (item) => {
    // console.log('item', item)
    if (item.nodes) {
      return item?.nodes.map((node) => (
        <ul key={node?.id} style={{ marginLeft: '-1rem' }}>
          <li draggable onDragStart={(event) => onDragStart(event, node)} style={{ listStyle: 'none' }}>
            {node?.data['label']}
          </li>
        </ul>
      ));
    } else {
      return null;
    }
  };

  useEffect(() => {
    getSidebarNode();
    // getComponent();
  }, []);

  // open & closing fn for Dialog
  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const Icon = ({ name, ...rest }) => {
    const IconComponent = iconComponents[name];
    return IconComponent ? <IconComponent {...rest} style={{ padding: 4 }} /> : null;
  };

  function stringAvatar(name) {
    if (name.split(' ')[1]) {
      return { children: `${name.split(' ')[0][0]}${name.split(' ')[1][0]}` };
    }
    return {
      children: `${name.split(' ')[0][0]}`
    };
  }

  return (
    <>
      <Box
        component="nav"
        aria-label="sidebar"
        sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, overflowX: 'hidden' }}
      >
        {sidebarNodes.map((item, i) => (
          <div
            key={i}
            className={`dndnode`}
            style={{
              display: 'flex',
              placeItems: 'center',
              flexDirection: 'column',
              margin: '1.8rem 0',
              gap: 1
            }}
            //   style={{
            //     border: `0.5px solid ${item?.data?.bgColor}`,
            //     boxShadow: `0px 0px 5px ${item?.data?.bgColor}`,
            //   }}
            // onDragStart={(event) => onDragStart(event, item)}
            onMouseEnter={(e) => handleMouseEnter(e, item)}
            onMouseLeave={handleMouseLeave}
          >
            {item?.icon ? (
              <Icon name={item?.icon} color="black" />
            ) : (
              <Avatar {...stringAvatar(item?.name)} variant="rounded" sx={{ width: 56, height: 56 }} />
            )}
            <Typography variant="p" fontSize="12px" width={80} align="center" color={'#1d97fc'}>
              {' '}
              {item?.name}
            </Typography>
            {hoveredItem === item && (
              <div className="modal" style={{ top: hoveredPosition.top, backgroundColor: color?.leftbarBG }}>
                {getListContent(item)}
              </div>
            )}
          </div>
        ))}
        <AddIcon sx={{ fontSize: 20, color: 'blue', cursor: 'pointer' }} onClick={handleOpen} />
      </Box>
      <AddNewNode open={open} handleClose={handleClose} getSidebarNode={getSidebarNode} />
    </>
  );
};

export default Components;
