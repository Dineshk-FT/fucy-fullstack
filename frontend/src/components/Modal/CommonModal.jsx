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
  Slide,
  Paper,
  Typography
  // useTheme
} from '@mui/material';
import useStore from '../../store/Zustand/store';
import { shallow } from 'zustand/shallow';
import { useParams } from 'react-router';
import ColorTheme from '../../themes/ColorTheme';
import Draggable from 'react-draggable';
import DialogCommonTitle from './DialogCommonTitle';
import { AttackIcon } from '../../assets/icons';
import toast, { Toaster } from 'react-hot-toast';

function PaperComponent(props) {
  const nodeRef = React.useRef(null);
  return (
    <Draggable nodeRef={nodeRef} handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} ref={nodeRef} />
    </Draggable>
  );
}

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const selector = (state) => ({
  model: state.model,
  addAttackScene: state.addAttackScene,
  getAttackScenario: state.getAttackScenario
});
export default function CommonModal({ open, handleClose, name }) {
  const color = ColorTheme();
  // const { notify } = React.useContext(ToasterContext);
  const notify = (message, status) => toast[status](message);
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
        // console.log('res', res);
        if (!res.error) {
          notify('Added Successfully', 'success');
          getAttackScenario(model?._id);
          // onClose();
        } else {
          notify(res?.error ?? 'something went wrong', 'error');
        }
      })
      .catch((err) => {
        notify('Something Went Wrong', 'error');
      });
  };

  return (
    <React.Fragment>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        PaperComponent={PaperComponent}
        onClose={onClose}
        aria-labelledby="draggable-dialog-title"
        sx={{ '& .MuiPaper-root': { backgroundColor: color?.modalBg } }}
      >
        <DialogCommonTitle icon={AttackIcon} title={`Add New ${name}`} />

        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, my: 1 }}>
            <Typography variant="body1" component="div" gutterBottom>
              Add new {name} details:
            </Typography>
            <TextField
              fullWidth
              label="Name"
              value={templateDetails.name}
              onChange={(e) => setTemplateDetails({ ...templateDetails, name: e.target.value })}
              variant="outlined"
              size="small"
            />
          </Box>
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
