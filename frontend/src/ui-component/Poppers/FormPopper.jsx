import { Button, ClickAwayListener, Paper, Popper, TextField } from '@mui/material';
import React from 'react';

const FormPopper = ({ anchorEl, handleClosePopper, editValue, setEditValue, handleSaveEdit, editingField, setIsPopperFocused }) => {
  return (
    <>
      <Popper
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        placement="bottom-start"
        modifiers={[
          {
            name: 'offset',
            options: {
              offset: [-80, 20] // Adjusts the offset [skidding, distance]
            }
          },
          {
            name: 'preventOverflow',
            options: {
              boundary: 'viewport' // Ensures Popper stays within the viewport
            }
          }
        ]}
        sx={{
          minWidth: 320,
          width: 'auto',
          boxShadow: '0px 0px 6px black',
          borderRadius: '10px'
        }}
      >
        <ClickAwayListener onClickAway={handleClosePopper}>
          <Paper sx={{ padding: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <TextField
              fullWidth
              value={editValue}
              onChange={(e) => {
                e.stopPropagation();
                setEditValue(e.target.value);
              }}
              onClick={(e) => e.stopPropagation()}
              onFocus={() => setIsPopperFocused(true)}
              onBlur={() => setIsPopperFocused(false)}
              label={`Edit ${editingField}`}
              size="small"
              multiline
              minRows={2} // Minimum number of rows
              maxRows={8} // Maximum number of rows (optional, adjust as needed)
            />

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={handleClosePopper}>Cancel</Button>
              <Button onClick={handleSaveEdit} color="primary" variant="contained">
                Update
              </Button>
            </div>
          </Paper>
        </ClickAwayListener>
      </Popper>
    </>
  );
};

export default FormPopper;
