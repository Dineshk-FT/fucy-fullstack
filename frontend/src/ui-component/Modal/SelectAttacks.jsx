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

export default function SelectAttacks({ details, open, handleClose }) {
  const handleChange = (e, detail) => {};

  // console.log('selectedRow', selectedRow);
  //   console.log('details', details);
  const handleClick = () => {};

  return (
    <React.Fragment>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        sx={{
          '& .MuiPaper-root': {
            width: '-webkit-fill-available',
            height: 400
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
          {'Select the Damage Scenarios'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <TreeView aria-label="file system navigator" defaultCollapseIcon={<ExpandMoreIcon />} defaultExpandIcon={<ChevronRightIcon />}>
              {details?.map((item, i) => (
                <TreeItem key={item?._id} nodeId={item?._id} label={item?.name} sx={{ color: '#000', fontWeight: 600 }}>
                  {item?.scenes?.map((scene, ind) => (
                    <TreeItem
                      key={scene?.ID}
                      nodeId={scene?.ID}
                      label={
                        <FormGroup>
                          <FormControlLabel
                            sx={{
                              margin: '-6px',
                              '& .MuiTypography-root': {
                                fontSize: '13px',
                                color: '#000'
                              }
                            }}
                            control={<Checkbox size="small" onChange={(e) => handleChange(e, scene)} />}
                            label={scene?.Name}
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
