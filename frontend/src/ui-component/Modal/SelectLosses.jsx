/* eslint-disable */
import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { TreeView } from '@mui/x-tree-view/TreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { Checkbox, FormControlLabel, FormGroup } from '@mui/material';

export default function SelectLosses({
  open,
  handleClose,
  modal,
  rows,
  setRows,
  selectedRow,
  setSelectedRow,
  getModalById,
  getModals,
  id,
  update
}) {
  const handleChange = (e, prop, item) => {
    if (e.target.checked) {
      if (Object.keys(selectedRow?.cyberLosses).length === 0) {
        let select = [...selectedRow.cyberLosses];
        const Details = {
          name: item?.name,
          props: [prop]
        };
        select.push(Details);
        let row = { ...selectedRow };
        row.cyberLosses = select;
        setSelectedRow(row);
      } else {
        let select = [...selectedRow.cyberLosses];
        const ele = selectedRow?.cyberLosses.find((it) => it.name === item?.name);
        const Index = selectedRow?.cyberLosses.findIndex((it) => it.name === item?.name);
        if (ele) {
          if (!ele.props.includes(prop)) {
            ele.props.push(prop);
          }
          select[Index] = ele;
          let row = { ...selectedRow };
          row.cyberLosses = select;
          setSelectedRow(row);
        } else {
          let select = [...selectedRow.cyberLosses];
          const Details = {
            name: item?.name,
            props: [prop]
          };
          select.push(Details);
          let row = { ...selectedRow };
          row.cyberLosses = select;
          setSelectedRow(row);
        }
      }
    } else {
      // console.log('here')
      let select = [...selectedRow.cyberLosses];
      const ele = selectedRow?.cyberLosses.find((it) => it.name === item?.name);
      const Index = selectedRow?.cyberLosses.findIndex((it) => it.name === item?.name);
      if (ele) {
        if (ele.props.includes(prop)) {
          const filt = ele.props.filter((it) => it !== prop);
          ele.props = filt;
          select[Index] = ele;
          let row = { ...selectedRow };
          row.cyberLosses = select;
          setSelectedRow(row);
        }
        if (ele.props.length === 0) {
          select.splice(Index, Index + 1);
        }
      }
    }
  };

  const handleClick = () => {
    const mod = { ...modal };
    const Rows = [...rows];
    const losses = mod?.scenarios[1]?.subs[0].losses;
    const lossesEdit = mod?.scenarios[1]?.subs[1]?.scenes;
    const Index = Rows.findIndex((rw) => rw.id === selectedRow.id);
    Rows[Index] = selectedRow;
    const changes = Rows.map((rw) => {
      return rw;
    });

    const threat = mod?.scenarios[2]?.subs[0];
    const cybersec = Rows.filter((rw) => {
      if (rw.cyberLosses.length > 0) {
        return rw;
      }
    });

    const updatedLoss = losses
      ?.map((loss) =>
        changes.filter((update) => {
          if (loss.id === update.id) {
            return { ...loss, cyberLosses: update.cyberLosses };
          }
        })
      )
      .flat();

    const updatedLossEdit = lossesEdit
      ?.map((loss) =>
        changes.filter((update) => {
          if (loss.id === update.id) {
            return { ...loss, cyberLosses: update.cyberLosses };
          }
        })
      )
      .flat();

    mod.scenarios[1].subs[0].losses = updatedLoss;
    mod.scenarios[1].subs[1].scenes = updatedLossEdit;
    //     console.log('updatedLoss', updatedLoss)
    // console.log('updatedLossEdit', updatedLossEdit)

    (threat.losses = cybersec), setRows(Rows);
    // console.log('threat', threat)
    // console.log('mod', mod);
    update(mod)
      .then((res) => {
        if (res) {
          setTimeout(() => {
            getModalById(id);
            getModals();
          }, 500);
        }
      })
      .catch((err) => console.log('err', err));
    handleClose();
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
          {'Select the Losses'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <TreeView aria-label="file system navigator" defaultCollapseIcon={<ExpandMoreIcon />} defaultExpandIcon={<ChevronRightIcon />}>
              {modal?.scenarios[1]?.subs[1]?.Details?.map((item, i) => (
                <TreeItem key={`a${i}`} nodeId={`a${i}`} label={item?.name}>
                  {item?.props?.map((pr, ind) => (
                    <TreeItem
                      key={`${i}${ind}`}
                      nodeId={`${i}${ind}`}
                      label={
                        <FormGroup>
                          <FormControlLabel
                            sx={{
                              margin: '-6px',
                              '& .MuiTypography-root': {
                                fontSize: '13px'
                              }
                            }}
                            control={<Checkbox size="small" onChange={(e) => handleChange(e, pr.name, item)} />}
                            label={`Loss of ${pr.name}`}
                          />
                        </FormGroup>
                      }
                    />
                  ))}
                </TreeItem>
              ))}
            </TreeView>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" color="warning" onClick={handleClose}>
            close
          </Button>
          <Button variant="contained" onClick={handleClick} autoFocus>
            Okay
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
