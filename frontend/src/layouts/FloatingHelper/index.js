/* eslint-disable */
import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';

// Material-UI
import { Tooltip, Fab, Box, Popper, Paper, Typography, ClickAwayListener } from '@mui/material';
import { ExpandMore, ChevronRight } from '@mui/icons-material';
import LiveHelpIcon from '@mui/icons-material/LiveHelp';
import { TreeItem, TreeView } from '@mui/x-tree-view';
import useStore from '../../store/Zustand/store';
import { helpData } from './HelpData';

const selector = (state) => ({
  getGuides: state.getGuides,
  guides: state.guides
});

const FloatingHelper = () => {
  const { getGuides, guides } = useStore(selector);
  const [open, setOpen] = useState(false);
  const buttonRef = useRef(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [questionAnchor, setQuestionAnchor] = useState(null);

  useEffect(() => {
    getGuides();
  }, []);

  useEffect(() => {
    if (guides && guides.length > 0) {
      const updateHelpDataWithUrls = (data) => {
        Object.entries(data).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach((item) => {
              // Compare by removing the file extension from guide.name
              const matchedGuide = guides.find((guide) => {
                const guideNameWithoutExtension = guide.name.replace(/\.(mp4|webm)$/i, '');
                return guideNameWithoutExtension === item.id;
              });

              if (matchedGuide) {
                item.gif = matchedGuide.url;
              }
            });
          } else if (typeof value === 'object') {
            updateHelpDataWithUrls(value);
          }
        });
      };

      updateHelpDataWithUrls(helpData);
    }
  }, [guides]);

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  const handleQuestionClick = (event, question) => {
    event.stopPropagation();
    setSelectedQuestion(question);
    setQuestionAnchor(event.currentTarget);
  };

  const handleCloseGifPopper = () => {
    setSelectedQuestion(null);
    setQuestionAnchor(null);
  };

  const renderTreeItems = (data, parentId = '') => {
    let nodeCounter = 0;
    const generateNodeId = () => `${parentId}-${++nodeCounter}`;

    return Object.entries(data).map(([key, value], index) => {
      const nodeId = `${parentId}-${index}`;

      if (Array.isArray(value)) {
        return (
          <TreeItem nodeId={nodeId} label={key} key={nodeId}>
            {value.map((question, i) => {
              const childId = `${nodeId}-${i}`;
              return (
                <TreeItem
                  nodeId={childId}
                  key={question.id}
                  label={
                    <Box
                      onClick={(e) => handleQuestionClick(e, question)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <Box component="span" sx={{ mr: 1 }}>
                        •
                      </Box>
                      <Typography variant="body2">{question.label}</Typography>
                    </Box>
                  }
                />
              );
            })}
          </TreeItem>
        );
      } else if (typeof value === 'object') {
        return (
          <TreeItem nodeId={nodeId} label={key} key={nodeId}>
            {renderTreeItems(value, nodeId)}
          </TreeItem>
        );
      } else {
        return null;
      }
    });
  };

  return (
    <>
      <Tooltip title="Need help?">
        <Fab
          color="primary"
          onClick={handleToggle}
          ref={buttonRef}
          size="small"
          sx={{
            position: 'fixed',
            bottom: '18mm',
            right: 10,
            zIndex: 1200,
            zIndex: 1300
          }}
        >
          <LiveHelpIcon />
        </Fab>
      </Tooltip>

      <Popper open={open} anchorEl={buttonRef.current} placement="top-end" sx={{ zIndex: 1300 }}>
        <Draggable handle=".drag-handle">
          <Paper
            sx={{
              width: 300,
              maxHeight: 400,
              overflowY: 'auto',
              p: 2
            }}
          >
            <Box
              className="drag-handle"
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'move',
                mb: 1
              }}
            >
              <Typography variant="h6">Helper</Typography>
            </Box>
            <TreeView defaultCollapseIcon={<ExpandMore />} defaultExpandIcon={<ChevronRight />} sx={{ flexGrow: 1 }}>
              {renderTreeItems(helpData)}
            </TreeView>
          </Paper>
        </Draggable>
      </Popper>

      <Popper open={!!selectedQuestion} anchorEl={questionAnchor} placement="right-start" sx={{ zIndex: 1400 }}>
        <ClickAwayListener onClickAway={handleCloseGifPopper}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              {selectedQuestion?.label}
            </Typography>
            {selectedQuestion?.gif && (
              <video src={selectedQuestion?.gif} controls autoPlay muted style={{ maxWidth: 800, maxHeight: 800 }} />
            )}
          </Paper>
        </ClickAwayListener>
      </Popper>
    </>
  );
};

export default FloatingHelper;
