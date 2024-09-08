/* eslint-disable */
import * as React from 'react';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import NodeList from '../../views/NodeList/NodeList';
import { v4 as uid } from 'uuid';
import useStore from '../../Zustand/store';
import { useParams } from 'react-router';
import toast, { Toaster } from 'react-hot-toast';
import { updatedModalState } from '../../utils/Constraints';

const notify = (message, status) => toast[status](message);

const selector = (state) => ({
  getModalById: state.getModalById,
  modal: state.modal,
  setNodes: state.setNodes,
  nodes: state.nodes,
  edges: state.edges,
  updateModal: state.updateModal
});

export default function SelectNodeList({ open, handleClose }) {
  const [selected, setSelected] = React.useState({});
  const { id } = useParams();
  const { modal, nodes, edges, setNodes, getModalById, updateModal } = useStore(selector);

  const handleAdd = () => {
    if (selected) {
      const Details = {
        ...selected,
        id: uid(),
        position: { x: 495, y: 250 }
      };
      Details.data.style = {
        backgroundColor: '#dadada',
        fontSize: '12px',
        fontFamily: 'Inter',
        fontStyle: 'normal',
        textAlign: 'center',
        color: 'black',
        fontWeight: 500,
        textDecoration: 'none',
        borderColor: 'gray',
        borderWidth: '2px',
        borderStyle: 'solid'
      };

      const list = [...nodes, Details];
      setNodes(list);
      const mod = { ...modal };
      updateModal(updatedModalState(mod, list, edges))
        .then((res) => {
          // console.log('res', res);
          if (res.data) {
            setTimeout(() => {
              notify('Updated Successfully', 'success');
              getModalById(id);
              handleClose();
            }, []);
          }
        })
        .catch((err) => {
          console.log('err', err);
          notify('Something went wrong', 'error');
        });
    }
  };

  const onClose = () => {
    setSelected({});
    handleClose();
  };

  return (
    <React.Fragment>
      <Dialog
        open={open}
        onClose={onClose}
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
            <NodeList setSelected={setSelected} />
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" color="warning" onClick={onClose}>
            close
          </Button>
          <Button variant="contained" onClick={handleAdd} autoFocus>
            Add
          </Button>
        </DialogActions>
      </Dialog>
      <Toaster position="top-right" reverseOrder={false} />
    </React.Fragment>
  );
}
