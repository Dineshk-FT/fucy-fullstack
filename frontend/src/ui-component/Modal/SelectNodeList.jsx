/* eslint-disable */
import * as React from 'react';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import { useNavigate } from 'react-router';
import Components from '../../views/NodeList';

export default function SelectNodeList({ open, handleClose }) {
  const [selectedNode, setSelectedNode] = React.useState(null);

  const handleNodeClick = (id) => {
    setSelectedNode(id);
  };
  const handleClick = () => {
    // handleClose();
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
        >
          {'Add Node'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <Components />
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" color="warning" onClick={handleClose}>
            close
          </Button>
          <Button variant="contained" onClick={handleClick} autoFocus>
            Open
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
