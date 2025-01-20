/* eslint-disable */
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
import ColorTheme from '../../store/ColorTheme';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const selector = (state) => ({
  addDamageScene: state.addDamageScene,
  getDamageScenarios: state.getDamageScenarios
});

export default function AddDamageScenarios({ open, handleClose, model, rows, notify }) {
  const color = ColorTheme();
  // console.log('rows', rows);
  const { addDamageScene, getDamageScenarios } = useStore(selector, shallow);
  const [templateDetails, setTemplateDetails] = React.useState({
    ID: '',
    Name: '',
    'Description/ Scalability': '',
    cyberLosses: []
  });

  const handleCreate = () => {
    const temp = { ...templateDetails };
    const len = rows.length;
    temp.ID = `DS00${len + 1}`;
    const details = {
      'model-id': model?._id,
      Name: templateDetails?.Name,
      Description: templateDetails['Description/ Scalability']
    };
    addDamageScene(details)
      .then((res) => {
        // console.log('res', res);
        if (res.message) {
          // setTimeout(() => {
          notify(res?.message, 'success');
          // window.location.reload();
          handleClose();
          getDamageScenarios(model?._id);
          setTemplateDetails({
            ID: '',
            Name: '',
            'Description/ Scalability': '',
            cyberLosses: []
          });
          // }, 500);
        } else {
          notify('something went wrong', 'error');
        }
      })
      .catch((err) => {
        console.log('err', err);
        notify('something went wrong', 'error');
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
            background: color?.tabBG,
            width: '-webkit-fill-available'
          }
        }}
      >
        <DialogTitle variant="h4" color="primary">
          {'Add Damage Scenario'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, my: 1 }}>
              <InputLabel sx={{ color: color?.title, fontWeight: 600 }}>Name :</InputLabel>
              <TextField
                id="outlined-basic"
                // label="Name"
                value={templateDetails?.Name}
                variant="outlined"
                placeholder="Name"
                onChange={(e) => setTemplateDetails({ ...templateDetails, Name: e.target.value })}
              />
              <InputLabel sx={{ color: color?.title, fontWeight: 600 }}>Description :</InputLabel>
              <TextField
                id="outlined-multiline-static"
                // label="Multiline"
                value={templateDetails['Description/ Scalability']}
                multiline
                rows={4}
                placeholder="Description"
                onChange={(e) => setTemplateDetails({ ...templateDetails, 'Description/ Scalability': e.target.value })}
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
    </React.Fragment>
  );
}
