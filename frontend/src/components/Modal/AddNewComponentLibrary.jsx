import * as React from 'react';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, Box, TextField, Slide } from '@mui/material';
import useStore from '../../store/Zustand/store';
import { shallow } from 'zustand/shallow';
import AlertMessage from '../Alert';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const selector = (state) => ({
  create: state.createComponent,
  getSidebarNode: state.getSidebarNode
});

export default function AddNewComponentLibrary({ open, handleClose }) {
  const [openMsg, setOpenMsg] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const { create, getSidebarNode } = useStore(selector, shallow);
  const [templateDetails, setTemplateDetails] = React.useState({
    Name: ''
  });

  const handleCreate = () => {
    create(templateDetails)
      .then((res) => {
        if (res) {
          // console.log('res in create', res);
          setTimeout(() => {
            setOpenMsg(true);
            setMessage('Created Successfully');
            setSuccess(true);
            getSidebarNode();
            handleClose();
          }, 500);
        }
      })
      .catch((err) => {
        console.log('err', err);
        setOpenMsg(true);
        setSuccess(false);
        setMessage('Something went wrong');
      });
    setTemplateDetails((state) => ({
      ...state,
      Name: ''
    }));
  };

  return (
    <React.Fragment>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle sx={{ fontSize: 20, fontFamily: 'Inter' }}>{'Add Component Library'}</DialogTitle>
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
          <Button variant="outlined" color="error" onClick={handleClose}>
            cancel
          </Button>
          <Button variant="contained" onClick={handleCreate}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
      {openMsg && <AlertMessage open={openMsg} message={message} setOpen={setOpenMsg} success={success} />}
    </React.Fragment>
  );
}
