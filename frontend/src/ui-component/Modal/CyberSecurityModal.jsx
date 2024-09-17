import * as React from 'react';
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
import { v4 as uid } from 'uuid';
import { useParams } from 'react-router';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const selector = (state) => ({
  update: state.updateModel,
  getModels: state.getModels,
  getModel: state.getModelById,
  model: state.model
});

export default function CyberSecurityModal({ open, handleClose, name }) {
  const { update, getModel, model } = useStore(selector, shallow);
  const [templateDetails, setTemplateDetails] = React.useState({
    name: '',
    Description: ''
  });

  const { id } = useParams();

  React.useEffect(() => {
    getModel(id);
  }, [id]);

  // console.log('name', name);
  const handleCreate = () => {
    const mod = { ...model };
    let cyber = mod.scenarios[4].subs[0];
    if (name === 'Goals') {
      cyber?.subs[0]?.scenes.push({
        id: uid(),
        ...templateDetails
      });
    } else {
      cyber?.subs[1]?.scenes.push({
        id: uid(),
        ...templateDetails
      });
    }
    // console.log('cyber', cyber)
    update(mod)
      .then((res) => {
        if (res) {
          setTimeout(() => {
            alert('Added successfully');
            // window.location.reload();
            handleClose();
            setTemplateDetails({
              name: '',
              Description: ''
            });
            getModels();
          }, 500);
        }
      })
      .catch((err) => console.log('err', err));
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
            width: '-webkit-fill-available'
          }
        }}
      >
        <DialogTitle>Add {name}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, my: 1 }}>
              <InputLabel>Name :</InputLabel>
              <TextField
                id="outlined-basic"
                // label="Name"
                value={templateDetails?.name}
                variant="outlined"
                placeholder="Name"
                onChange={(e) => setTemplateDetails({ ...templateDetails, name: e.target.value })}
              />
              <InputLabel>Description :</InputLabel>
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
          <Button variant="outlined" color="warning" onClick={handleClose}>
            cancel
          </Button>
          <Button variant="contained" color="primary" onClick={handleCreate}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
