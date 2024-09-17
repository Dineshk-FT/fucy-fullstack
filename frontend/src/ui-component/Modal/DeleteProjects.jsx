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
import toast, { Toaster } from 'react-hot-toast';

export default function DeleteProject({ open, handleClose, Models, deleteModels }) {
  const [selectedModels, setSelectedModels] = React.useState([]);
  const notify = (message, status) => toast[status](message);
  const navigate = useNavigate();

  const handleModelClick = (id) => {
    setSelectedModels((prevSelected) =>
      prevSelected.includes(id) ? prevSelected.filter((modelId) => modelId !== id) : [...prevSelected, id]
    );
  };
  const handleDelete = () => {
    deleteModels(selectedModels)
      .then((res) => {
        if (res) {
          notify(res.message ?? 'Model deleted successfully', 'success');
          handleClose();
        }
      })
      .catch((err) => {
        console.log('err', err);
        notify('Something Went Wrong', 'error');
        handleClose();
      });
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
          {'Select the Projects to Delete'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <List>
              {Models?.map((model) => (
                <ListItemButton
                  key={model?._id}
                  button
                  selected={selectedModels.includes(model?._id)}
                  onClick={() => handleModelClick(model?._id)}
                  sx={{
                    backgroundColor: selectedModels.includes(model?._id) ? '#fd5c63 !important' : 'inherit',
                    color: selectedModels.includes(model?._id) ? 'white !important' : 'blacl !important',
                    '&:hover': {
                      backgroundColor: selectedModels.includes(model?._id) ? 'darkred !important' : 'action.hover',
                      color: selectedModels.includes(model?._id) ? 'white !important' : 'inherit'
                    }
                  }}
                >
                  <ListItemText sx={{ '& .MuiTypography-root': { color: 'inherit !important' } }} primary={model?.name} />
                </ListItemButton>
              ))}
            </List>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" color="warning" onClick={handleClose}>
            Close
          </Button>
          <Button variant="contained" onClick={handleDelete} autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
