/*eslint-disable*/
import React, { useState } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  InputLabel,
  Box,
  TextField,
  Slide
} from '@mui/material';
import useStore from '../../Zustand/store';
import { shallow } from 'zustand/shallow';
// import { v4 as uid } from 'uuid';
import toast, { Toaster } from 'react-hot-toast';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const selector = (state) => ({
  addScene: state.addcybersecurityScene,
  model: state.model,
  getCyberSecurityScenario: state.getCyberSecurityScenario
});

const notify = (message, status) => toast[status](message);
export default function AddCyberSecurityModal({ open, handleClose, name, id, type }) {
  const { addScene, model, getCyberSecurityScenario } = useStore(selector, shallow);
  const [templateDetails, setTemplateDetails] = useState({
    Name: '',
    Description: ''
  });

  // console.log('name', name);
  const handleCreate = () => {
    const details = {
      modelId: model?._id,
      type: type,
      name: templateDetails?.Name,
      description: templateDetails?.Description
    };
    // console.log('cyber', cyber)
    // console.log('details', details);
    addScene(details)
      .then((res) => {
        // console.log('res', res);
        if (!res.error) {
          // setTimeout(() => {
          getCyberSecurityScenario(model?._id);
          notify(res.message ?? 'Deleted successfully', 'success');
          handleClose();
          setTemplateDetails({
            name: '',
            Description: ''
          });
          // }, 500);
        } else {
          notify(res?.error ?? 'Something went wrong', 'error');
        }
      })
      .catch((err) => {
        if (err) notify('Something went wrong', 'error');
      });
  };
  return (
    <React.Fragment>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
        sx={{
          '& .MuiPaper-root': {
            // background:'#999999',
            width: 475
          }
        }}
      >
        <DialogTitle variant="h4" color="primary">
          Add {name}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, my: 1 }}>
              <InputLabel sx={{ fontWeight: 600, color: '#000' }}>Name :</InputLabel>
              <TextField
                id="outlined-basic"
                // label="Name"
                value={templateDetails?.Name}
                variant="outlined"
                placeholder="Name"
                onChange={(e) => setTemplateDetails({ ...templateDetails, Name: e.target.value })}
              />
              <InputLabel sx={{ fontWeight: 600, color: '#000' }}>Description :</InputLabel>
              <TextField
                id="outlined-multiline-static"
                // label="Multiline"
                value={templateDetails?.Description}
                multiline
                rows={4}
                placeholder="Description"
                onChange={(e) => setTemplateDetails({ ...templateDetails, Description: e.target.value })}

                // defaultValue="Default Value"
              />
            </Box>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" color="error" onClick={handleClose}>
            cancel
          </Button>
          <Button variant="contained" color="primary" onClick={handleCreate}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
      <Toaster position="top-right" reverseOrder={false} />
    </React.Fragment>
  );
}
