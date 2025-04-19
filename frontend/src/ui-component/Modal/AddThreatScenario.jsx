/*eslint-disable*/
import * as React from 'react';
import { Dialog, DialogActions, DialogContent, DialogContentText, Button, InputLabel, Box, TextField, Slide } from '@mui/material';
import useStore from '../../store/Zustand/store';
import { shallow } from 'zustand/shallow';
import AlertMessage from '../Alert';
import ColorTheme from '../../themes/ColorTheme';
import PaperComponent from './PaperComponent';
import DialogCommonTitle from './DialogCommonTitle';
import { ThreatIcon } from '../../assets/icons';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const selector = (state) => ({
  addScene: state.addThreatScene,
  getThreatScenario: state.getThreatScenario
});

export default function AddThreatScenarios({ open, handleClose, id }) {
  const color = ColorTheme();
  const { addScene, getThreatScenario } = useStore(selector, shallow);
  const [openMsg, setOpenMsg] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [templateDetails, setTemplateDetails] = React.useState({
    name: '',
    Description: ''
  });

  const handleCreate = () => {
    const details = {
      ...templateDetails,
      'model-id': id
    };
    addScene(details)
      .then((res) => {
        // console.log('res page', res);
        if (res) {
          setTimeout(() => {
            // handleClose();
            getThreatScenario(id);
            setOpenMsg(true);
            setMessage(res?.message);
            setSuccess(true);
            setTemplateDetails({
              name: '',
              Description: ''
            });
          }, 500);
        }
      })
      .catch((err) => {
        console.log('err', err);
        setOpenMsg(true);
        setSuccess(false);
        setMessage('Something went wrong');
      });
  };
  return (
    <React.Fragment>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        PaperComponent={PaperComponent}
        aria-describedby="draggable-dialog-slide-description"
        sx={{
          '& .MuiPaper-root': {
            background: color?.modalBg,
            width: '-webkit-fill-available'
          }
        }}
      >
        <DialogCommonTitle icon={ThreatIcon} title={'Add Threat Scenario'} />
        <DialogContent>
          <DialogContentText id="draggable-dialog-slide-description">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, my: 1 }}>
              <InputLabel sx={{ color: color?.title, fontWeight: 600 }}>Name :</InputLabel>
              <TextField
                id="outlined-basic"
                // label="Name"
                value={templateDetails?.name}
                variant="outlined"
                placeholder="Name"
                onChange={(e) => setTemplateDetails({ ...templateDetails, name: e.target.value })}
              />
              <InputLabel sx={{ color: color?.title, fontWeight: 600 }}>Description :</InputLabel>
              <TextField
                id="outlined-multiline-static"
                // label="Multiline"
                value={templateDetails?.Description}
                multiline
                rows={4}
                placeholder="Description"
                onChange={(e) => setTemplateDetails({ ...templateDetails, Description: e.target.value })}
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
      <AlertMessage open={openMsg} message={message} setOpen={setOpenMsg} success={success} />
    </React.Fragment>
  );
}
