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

export default function SelectDamageScenes({ details, open, handleClose, selectedRow, id, updateThreatScenario, refreshAPI }) {
  const [damageScene, setDamageScene] = React.useState([]);
  // console.log('details', details);
  // console.log('  damageScene', damageScene);
  const handleChange = (e, detail, index) => {
    const { _id, Name } = detail;
    const isChecked = e.target.checked;

    setDamageScene((prev) => {
      if (isChecked) {
        return [...prev, { _id, Name, key: `DS${(index + 1).toString().padStart(3, '0')}` }];
      } else {
        return prev.filter((item) => item._id !== _id);
      }
    });
  };

  // console.log('selectedRow', selectedRow);
  const handleClick = () => {
    const details = {
      id: id,
      detailId: selectedRow?.ID,
      damageIds: JSON.stringify(damageScene.map((damage) => damage._id))
    };
    updateThreatScenario(details)
      .then((res) => {
        if (res.message) {
          refreshAPI();
        }
      })
      .catch((err) => console.log('err', err));
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
              <TreeItem nodeId={details?.name} label={details?.name} sx={{ color: '#000', fontWeight: 600 }}>
                {details?.Details?.map((detail, ind) => {
                  return (
                    <TreeItem
                      key={detail?._id}
                      nodeId={detail?._id}
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
                            control={
                              <Checkbox
                                size="small"
                                checked={damageScene.some((item) => item._id === detail._id)}
                                onChange={(e) => handleChange(e, detail, ind)}
                              />
                            }
                            label={detail.Name}
                          />
                        </FormGroup>
                      }
                    />
                  );
                })}
              </TreeItem>
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
