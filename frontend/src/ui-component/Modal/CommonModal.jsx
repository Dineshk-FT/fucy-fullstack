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
  model: state.model,
  addAttackScene: state.addAttackScene,
  getAttackScenario: state.getAttackScenario
});
export default function CommonModal({ open, handleClose, name }) {
  const { notify } = React.useContext(ToasterContext);
  const { id } = useParams();
  const { model, addAttackScene, getAttackScenario } = useStore(selector, shallow);
  const [templateDetails, setTemplateDetails] = React.useState({
    name: ''
  });

  const onClose = () => {
    setTemplateDetails((state) => ({
      ...state,
      name: ''
    }));
    handleClose();
  };

  const handleCreate = () => {
    const newScene = {
      modelId: model?._id,
      type: name === 'Attack' ? 'attack' : 'attack_trees',
      ...templateDetails
    };

    addAttackScene(newScene)
      .then((res) => {
        console.log('res', res);
        if (res) {
          notify('Added Successfully', 'success');
          getAttackScenario(model?._id);
          onClose();
        }
      })
      .catch((err) => {
        notify('Something Went Wrong', 'error');
      });
  };

  return (
    <React.Fragment>
      <Dialog open={open} TransitionComponent={Transition} keepMounted onClose={onClose} aria-describedby="alert-dialog-slide-description">
        <DialogTitle sx={{ fontSize: 20, fontFamily: 'Inter' }}>{`Add New ${name}`}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, my: 1 }}>
              <TextField
                value={templateDetails?.name}
                id="outlined-basic"
                label="name"
                variant="outlined"
                onChange={(e) => setTemplateDetails({ ...templateDetails, name: e.target.value })}
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
