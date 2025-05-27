import React from 'react';
import { Box, Tooltip, IconButton } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import RestoreIcon from '@mui/icons-material/Restore';
import GridOnIcon from '@mui/icons-material/GridOn';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import DownloadIcon from '@mui/icons-material/Download';

export default function CanvasToolbar({
  isDark,
  Color,
  // isChanged,
  onRestore,
  handleSaveToModel,
  onSelectionClick,
  selectedNodes,
  handleGroupDrag,
  undo,
  redo,
  undoStack,
  assets,
  redoStack,
  handleDownload
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 0.5,
        background: Color.tabBorder,
        backdropFilter: 'blur(4px)',
        borderRadius: '6px',
        padding: '2px 4px',
        boxShadow: isDark == true ? '0 2px 6px rgba(0,0,0,0.4)' : '0 2px 6px rgba(0,0,0,0.1)'
      }}
    >
      <Tooltip title="Restore">
        <IconButton
          onClick={() => onRestore(assets?.template)}
          sx={{
            color: isDark == true ? '#64B5F6' : '#2196F3',
            padding: '4px',
            '&:hover': {
              background:
                isDark == true
                  ? 'linear-gradient(90deg, rgba(100,181,246,0.15) 0%, rgba(100,181,246,0.03) 100%)'
                  : 'linear-gradient(90deg, rgba(33,150,243,0.08) 0%, rgba(33,150,243,0.02) 100%)',
              transform: 'scale(1.1)',
              boxShadow: isDark == true ? '0 2px 6px rgba(0,0,0,0.4)' : '0 2px 6px rgba(0,0,0,0.1)',
              filter: isDark == true ? 'drop-shadow(0 0 6px rgba(100,181,246,0.25))' : 'drop-shadow(0 0 6px rgba(33,150,243,0.15))'
            },
            '&:focus': {
              outline: `2px solid ${isDark == true ? '#64B5F6' : '#2196F3'}`,
              outlineOffset: '2px'
            }
          }}
          tabIndex={0}
          aria-label="Restore canvas"
        >
          <RestoreIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Save">
        <IconButton
          onClick={handleSaveToModel}
          sx={{
            color: isDark == true ? '#64B5F6' : '#2196F3',
            // color: isChanged ? '#FF3131' : '#32CD32',
            padding: '4px',
            '&:hover': {
              background:
                isDark == true
                  ? 'linear-gradient(90deg, rgba(100,181,246,0.15) 0%, rgba(100,181,246,0.03) 100%)'
                  : 'linear-gradient(90deg, rgba(33,150,243,0.08) 0%, rgba(33,150,243,0.02) 100%)',
              transform: 'scale(1.1)',
              boxShadow: isDark == true ? '0 2px 6px rgba(0,0,0,0.4)' : '0 2px 6px rgba(0,0,0,0.1)',
              filter: isDark == true ? 'drop-shadow(0 0 6px rgba(100,181,246,0.25))' : 'drop-shadow(0 0 6px rgba(33,150,243,0.15))'
            },
            '&:focus': {
              outline: `2px solid ${isDark == true ? '#64B5F6' : '#2196F3'}`,
              outlineOffset: '2px'
            }
          }}
          tabIndex={0}
          aria-label="Save canvas"
        >
          <SaveIcon sx={{ fontSize: 19 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Group Selected Nodes">
        <IconButton
          onClick={(e) => onSelectionClick(e, selectedNodes)}
          onDragStart={(e) => handleGroupDrag(e)}
          draggable={true}
          sx={{
            color: isDark == true ? '#64B5F6' : '#2196F3',
            padding: '4px',
            '&:hover': {
              background:
                isDark == true
                  ? 'linear-gradient(90deg, rgba(100,181,246,0.15) 0%, rgba(100,181,246,0.03) 100%)'
                  : 'linear-gradient(90deg, rgba(33,150,243,0.08) 0%, rgba(33,150,243,0.02) 100%)',
              transform: 'scale(1.1)',
              boxShadow: isDark == true ? '0 2px 6px rgba(0,0,0,0.4)' : '0 2px 6px rgba(0,0,0,0.1)',
              filter: isDark == true ? 'drop-shadow(0 0 6px rgba(100,181,246,0.25))' : 'drop-shadow(0 0 6px rgba(33,150,243,0.15))'
            },
            '&:focus': {
              outline: `2px solid ${isDark == true ? '#64B5F6' : '#2196F3'}`,
              outlineOffset: '2px'
            }
          }}
          tabIndex={0}
          aria-label="Group selected nodes"
        >
          <GridOnIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Undo">
        <span>
          <IconButton
            onClick={undo}
            disabled={undoStack.length === 0}
            sx={{
              color: undoStack.length === 0 ? (isDark == true ? '#616161' : '#B0BEC5') : isDark == true ? '#64B5F6' : '#2196F3',
              padding: '4px',
              '&:hover': {
                background:
                  undoStack.length === 0
                    ? 'transparent'
                    : isDark == true
                    ? 'linear-gradient(90deg, rgba(100,181,246,0.15) 0%, rgba(100,181,246,0.03) 100%)'
                    : 'linear-gradient(90deg, rgba(33,150,243,0.08) 0%, rgba(33,150,243,0.02) 100%)',
                transform: undoStack.length === 0 ? 'none' : 'scale(1.1)',
                boxShadow: undoStack.length === 0 ? 'none' : isDark == true ? '0 2px 6px rgba(0,0,0,0.4)' : '0 2px 6px rgba(0,0,0,0.1)',
                filter:
                  undoStack.length === 0
                    ? 'none'
                    : isDark == true
                    ? 'drop-shadow(0 0 6px rgba(100,181,246,0.25))'
                    : 'drop-shadow(0 0 6px rgba(33,150,243,0.15))'
              },
              '&:focus': {
                outline: undoStack.length === 0 ? 'none' : `2px solid ${isDark == true ? '#64B5F6' : '#2196F3'}`,
                outlineOffset: '2px'
              }
            }}
            tabIndex={0}
            aria-label="Undo action"
          >
            <UndoIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Redo">
        <span>
          <IconButton
            onClick={redo}
            disabled={redoStack.length === 0}
            sx={{
              color: redoStack.length === 0 ? (isDark == true ? '#616161' : '#B0BEC5') : isDark == true ? '#64B5F6' : '#2196F3',
              padding: '4px',
              '&:hover': {
                background:
                  redoStack.length === 0
                    ? 'transparent'
                    : isDark == true
                    ? 'linear-gradient(90deg, rgba(100,181,246,0.15) 0%, rgba(100,181,246,0.03) 100%)'
                    : 'linear-gradient(90deg, rgba(33,150,243,0.08) 0%, rgba(33,150,243,0.02) 100%)',
                transform: redoStack.length === 0 ? 'none' : 'scale(1.1)',
                boxShadow: redoStack.length === 0 ? 'none' : isDark == true ? '0 2px 6px rgba(0,0,0,0.4)' : '0 2px 6px rgba(0,0,0,0.1)',
                filter:
                  redoStack.length === 0
                    ? 'none'
                    : isDark == true
                    ? 'drop-shadow(0 0 6px rgba(100,181,246,0.25))'
                    : 'drop-shadow(0 0 6px rgba(33,150,243,0.15))'
              },
              '&:focus': {
                outline: redoStack.length === 0 ? 'none' : `2px solid ${isDark == true ? '#64B5F6' : '#2196F3'}`,
                outlineOffset: '2px'
              }
            }}
            tabIndex={0}
            aria-label="Redo action"
          >
            <RedoIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Download as PNG">
        <IconButton
          onClick={handleDownload}
          sx={{
            color: isDark == true ? '#64B5F6' : '#2196F3',
            padding: '4px',
            '&:hover': {
              background:
                isDark == true
                  ? 'linear-gradient(90deg, rgba(100,181,246,0.15) 0%, rgba(100,181,246,0.03) 100%)'
                  : 'linear-gradient(90deg, rgba(33,150,243,0.08) 0%, rgba(33,150,243,0.02) 100%)',
              transform: 'scale(1.1)',
              boxShadow: isDark == true ? '0 2px 6px rgba(0,0,0,0.4)' : '0 2px 6px rgba(0,0,0,0.1)',
              filter: isDark == true ? 'drop-shadow(0 0 6px rgba(100,181,246,0.25))' : 'drop-shadow(0 0 6px rgba(33,150,243,0.15))'
            },
            '&:focus': {
              outline: `2px solid ${isDark == true ? '#64B5F6' : '#2196F3'}`,
              outlineOffset: '2px'
            }
          }}
          tabIndex={0}
          aria-label="Download canvas as PNG"
        >
          <DownloadIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
