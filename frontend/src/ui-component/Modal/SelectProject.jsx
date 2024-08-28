/* eslint-disable */
import * as React from 'react';
import {
  List,
  ListItemButton,
  ListItemText,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button
} from '@mui/material';
import { useNavigate } from 'react-router';

export default function SelectProject({ open, handleClose, Modals }) {
  const [selectedModal, setSelectedModal] = React.useState(null);
  const navigate = useNavigate();

  const handleModalClick = (id) => {
    setSelectedModal(id);
  };
  const handleClick = () => {
    navigate(`/Models/${selectedModal}`);
    handleClose();
  };
  return (
    <React.Fragment>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        sx={{
          '& .MuiPaper-root': {
            width: '-webkit-fill-available'
          }
        }}
      >
        <DialogTitle
          id="alert-dialog-title"
          sx={{
            fontSize: 20,
            fontFamily: 'Inter',
            fontWeight: 600
          }}
        >
          {'Select the Project to View'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <List>
              {Modals?.map((modal) => (
                <ListItemButton
                  key={modal?._id}
                  button
                  selected={selectedModal === modal?._id}
                  onClick={() => handleModalClick(modal?._id)}
                  sx={{
                    backgroundColor: selectedModal === modal?._id ? 'primary.main' : 'inherit',
                    color: selectedModal === modal?._id ? 'white' : 'inherit',
                    '&:hover': {
                      backgroundColor: selectedModal === modal?._id ? 'primary.dark' : 'action.hover'
                    }
                  }}
                >
                  <ListItemText primary={modal?.name} />
                </ListItemButton>
              ))}
            </List>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" color="warning" onClick={handleClose}>
            close
          </Button>
          <Button variant="contained" onClick={handleClick} autoFocus>
            Open
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
