/* eslint-disable */
import * as React from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Box,
  TextField,
  Slide
  // useTheme
} from '@mui/material';
import useStore from '../../Zustand/store';
import { shallow } from 'zustand/shallow';
import { ToasterContext } from '../../layout/MainLayout/Sidebar1';
import { useParams } from 'react-router';
import { v4 as uid } from 'uuid';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const selector = (state) => ({
  getModelById: state.getModelById,
  update: state.updateModel,
  model: state.model
});
export default function CommonModal({ open, handleClose, getModels, name }) {
  const { notify } = React.useContext(ToasterContext);
  const { id } = useParams();
  const { getModelById, update, model } = useStore(selector, shallow);
  const [templateDetails, setTemplateDetails] = React.useState({
    Name: ''
  });

  const handleCreate = () => {
    const mod = { ...model };
    let Scene;
    if (name === 'Attack') {
      Scene = mod?.scenarios[3]?.subs[0]?.scenes;
    }
    if (name === 'Attack Trees') {
      Scene = mod?.scenarios[3]?.subs[1]?.scenes;
    }
    const newScene = {
      ID: uid(),
      ...templateDetails
    };
    Scene.push(newScene);
    update(mod)
      .then((res) => {
        if (res) {
          setTimeout(() => {
            notify(res.data.message, 'success');
            getModels();
            getModelById(id);
            handleClose();
          }, 500);
        }
      })
      .catch((err) => {
        'err', err;
        notify('Something Went Wrong', 'error');
      });
    setTemplateDetails((state) => ({
      ...state,
      Name: ''
    }));
  };

  const onClose = () => {
    setTemplateDetails((state) => ({
      ...state,
      Name: ''
    }));
    handleClose();
  };
  return (
    <React.Fragment>
      <Dialog open={open} TransitionComponent={Transition} keepMounted onClose={onClose} aria-describedby="alert-dialog-slide-description">
        <DialogTitle sx={{ fontSize: 20, fontFamily: 'Inter' }}>{`Add New ${name}`}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, my: 1 }}>
              <TextField
                value={templateDetails?.Name}
                id="outlined-basic"
                label="Name"
                variant="outlined"
                onChange={(e) => setTemplateDetails({ ...templateDetails, Name: e.target.value })}
                sx={{
                  width: '300px'
                }}
              />
            </Box>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" color="error" onClick={onClose}>
            cancel
          </Button>
          <Button variant="contained" onClick={handleCreate}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
