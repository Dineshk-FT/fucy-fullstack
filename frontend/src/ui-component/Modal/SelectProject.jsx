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

export default function SelectProject({ open, handleClose, Models }) {
  const [selectedModel, setSelectedModel] = React.useState(null);
  const navigate = useNavigate();

  const handleModelClick = (id) => {
    setSelectedModel(id);
  };
  const handleClick = () => {
    navigate(`/Models/${selectedModel}`);
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
          color="primary"
        >
          {'Select the Project to View'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <List>
              {Models?.map((model) => (
                <ListItemButton
                  key={model?._id}
                  button
                  selected={selectedModel === model?._id}
                  onClick={() => handleModelClick(model?._id)}
                  sx={{
                    backgroundColor: selectedModel === model?._id ? 'primary.main' : 'inherit',
                    color: selectedModel === model?._id ? 'white' : 'inherit',
                    '&:hover': {
                      backgroundColor: selectedModel === model?._id ? 'primary.dark' : 'action.hover'
                    }
                  }}
                >
                  <ListItemText primary={model?.name} />
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
