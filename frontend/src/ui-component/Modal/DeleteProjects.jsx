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

export default function DeleteProject({ open, handleClose, Modals, deleteModels }) {
  const [selectedModels, setSelectedModels] = React.useState([]);
  const notify = (message, status) => toast[status](message);
  const navigate = useNavigate();

  const handleModalClick = (id) => {
    setSelectedModels((prevSelected) =>
      prevSelected.includes(id) ? prevSelected.filter((modalId) => modalId !== id) : [...prevSelected, id]
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
              {Modals?.map((modal) => (
                <ListItemButton
                  key={modal?._id}
                  button
                  selected={selectedModels.includes(modal?._id)}
                  onClick={() => handleModalClick(modal?._id)}
                  sx={{
                    backgroundColor: selectedModels.includes(modal?._id) ? '#fd5c63 !important' : 'inherit',
                    color: selectedModels.includes(modal?._id) ? 'white !important' : 'blacl !important',
                    '&:hover': {
                      backgroundColor: selectedModels.includes(modal?._id) ? 'darkred !important' : 'action.hover',
                      color: selectedModels.includes(modal?._id) ? 'white !important' : 'inherit'
                    }
                  }}
                >
                  <ListItemText sx={{ '& .MuiTypography-root': { color: 'inherit !important' } }} primary={modal?.name} />
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
