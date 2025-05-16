/*eslint-disable*/
import React, { useState, useRef } from 'react';
import Draggable from 'react-draggable';

// material-ui
import { Tooltip, Fab, Box, Popper, Paper, Typography, ClickAwayListener } from '@mui/material';
import { ExpandMore, ChevronRight } from '@mui/icons-material';
import LiveHelpIcon from '@mui/icons-material/LiveHelp';
import { TreeItem, TreeView } from '@mui/x-tree-view';
const helpData = {
  'Item Definition': [
    { id: 'add_component', label: 'How to add a component/Data?', gif: 'https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/giphy.gif' },
    { id: 'delete_component', label: 'How to delete a component?', gif: 'https://media.giphy.com/media/26tPplGWjN0xLybiU/giphy.gif' },
    { id: 'assign_properties', label: 'How to assign Properties?', gif: 'https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/giphy.gif' }
  ],
  'Damage Scenarios and Impact Ratings': {
    'Damage Scenario (Ds) Derivations': [
      { id: 'add_derivation', label: 'How to add a derivation?', gif: 'https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/giphy.gif' },
      {
        id: 'checkbox_reason',
        label: 'Why i need to check the checkbox?',
        gif: 'https://media.giphy.com/media/26tPplGWjN0xLybiU/giphy.gif'
      }
    ],
    'Damage Scenario - Impact Ratings': [
      { id: 'add_impact', label: 'How to add an impact rating?', gif: 'https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/giphy.gif' },
      { id: 'delete_scene', label: 'How to delete a scene?', gif: 'https://media.giphy.com/media/26tPplGWjN0xLybiU/giphy.gif' },
      { id: 'add_losses', label: 'How to add cybersecurity losses?', gif: 'https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/giphy.gif' }
    ]
  },
  'Threat Scenarios': {
    'Threat Scenarios': [
      { id: 'add_threat', label: 'How to add a derivation?', gif: 'https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/giphy.gif' },
      { id: 'delete_threat', label: 'How to delete a derivation?', gif: 'https://media.giphy.com/media/26tPplGWjN0xLybiU/giphy.gif' }
    ],
    'Derived Threat Scenarios': [
      { id: 'add_derived_threat', label: 'How to add a derived scene?', gif: 'https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/giphy.gif' },
      {
        id: 'delete_derived_threat',
        label: 'How to delete a derived scene?',
        gif: 'https://media.giphy.com/media/26tPplGWjN0xLybiU/giphy.gif'
      },
      {
        id: 'update_derived_threat',
        label: 'How to update the derived scene',
        gif: 'https://media.giphy.com/media/26tPplGWjN0xLybiU/giphy.gif'
      }
    ]
  },
  'Attack Path Analysis': {
    Attacks: [
      { id: 'add_attack', label: 'How to add an attack?', gif: 'https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/giphy.gif' },
      { id: 'delete_attack', label: 'How to delete an attack?', gif: 'https://media.giphy.com/media/26tPplGWjN0xLybiU/giphy.gif' },
      { id: 'update_attack', label: 'How to assign values?', gif: 'https://media.giphy.com/media/26tPplGWjN0xLybiU/giphy.gif' },
      {
        id: 'use_attack',
        label: 'How to use the attacks in attack trees?',
        gif: 'https://media.giphy.com/media/26tPplGWjN0xLybiU/giphy.gif'
      }
    ],
    'Attack trees': [
      { id: 'add_attack_tree', label: 'How to add an attack tree?', gif: 'https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/giphy.gif' },
      {
        id: 'use_attack_tree',
        label: 'what are the component used in attack trees?',
        gif: 'https://media.giphy.com/media/26tPplGWjN0xLybiU/giphy.gif'
      }
    ]
  },
  'Goals, Claims and Requirements': {
    'Cybersecurity Goals,claims,controls & Requirements': [
      {
        id: 'add_cyber',
        label: 'How to add a goal/claim/control/requirement?',
        gif: 'https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/giphy.gif'
      },
      { id: 'use_cyber', label: 'Where can use these?', gif: 'https://media.giphy.com/media/26tPplGWjN0xLybiU/giphy.gif' }
    ]
  },
  'Risk Determination and Risk Treatment Decision': [
    { id: 'add_risk', label: 'How to a threat scene to view the risk?', gif: 'https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/giphy.gif' },
    {
      id: 'assign_cyber',
      label: 'How to assign cybersecurity Goals/claims?',
      gif: 'https://media.giphy.com/media/26tPplGWjN0xLybiU/giphy.gif'
    }
  ],

  Reporting: [
    { id: 'use_report', label: 'How to use it?', gif: 'https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/giphy.gif' },
    { id: 'download_report', label: 'How to download the data?', gif: 'https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/giphy.gif' }
  ]
};

// ==============================|| LIVE CUSTOMIZATION ||============================== //

const FloatingHelper = () => {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef(null); // Reference for Popper positioning
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [questionAnchor, setQuestionAnchor] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleToggle = (e) => {
    // e.stopProgation();
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
  function renderTreeItems(data, parentId = '') {
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
                      sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
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
        return <TreeItem nodeId={nodeId} label={value} key={nodeId} />;
      }
    });
  }

  return (
    <>
      <Draggable cancel="input,textarea,button" onStop={() => document.activeElement?.blur()}>
        <Box
          ref={buttonRef}
          sx={{
            position: 'fixed',
            bottom: '18mm',
            right: 10,
            zIndex: 1200,
            cursor: 'grab'
          }}
        >
          <Tooltip title="Help">
            <Fab
              component="div"
              onClick={handleToggle}
              size="small"
              variant="circular"
              color="light"
              sx={{
                borderRadius: 0,
                borderTopLeftRadius: '50%',
                borderBottomLeftRadius: '50%',
                borderTopRightRadius: '50%',
                borderBottomRightRadius: '4px'
              }}
            >
              {/* <Box component="img" src={ChatbotIcon} alt="chatbot" height="30px" width="30px" /> */}
              <LiveHelpIcon fontSize="medium" color="primary" />
            </Fab>
          </Tooltip>
        </Box>
      </Draggable>
      {/* Popper for chatbot messages */}
      <Popper open={open} anchorEl={buttonRef.current} placement="left-start" sx={{ zIndex: 1300 }}>
        <ClickAwayListener onClickAway={() => setOpen(false)}>
          <Paper sx={{ p: 2, width: 300, bgcolor: 'background.paper', boxShadow: 3, borderRadius: 2 }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
              How can I help?
            </Typography>

            <TreeView defaultCollapseIcon={<ExpandMore />} defaultExpandIcon={<ChevronRight />}>
              {renderTreeItems(helpData, 'root')}
            </TreeView>
          </Paper>
        </ClickAwayListener>
      </Popper>
      <Popper open={Boolean(selectedQuestion)} anchorEl={questionAnchor} placement="top-start" sx={{ zIndex: 1400 }}>
        <ClickAwayListener
          onClickAway={() => {
            if (!isDragging) handleCloseGifPopper();
          }}
        >
          <Draggable cancel="img,button" onStart={() => setIsDragging(true)} onStop={() => setIsDragging(false)}>
            <Paper
              sx={{
                p: 1,
                maxWidth: 300,
                cursor: 'move',
                borderRadius: 1,
                bgcolor: 'background.paper'
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                {selectedQuestion?.label}
              </Typography>
              <Box component="img" src={selectedQuestion?.gif} alt={selectedQuestion?.label} sx={{ width: '100%', borderRadius: 1 }} />
            </Paper>
          </Draggable>
        </ClickAwayListener>
      </Popper>
    </>
  );
};

export default React.memo(FloatingHelper);
