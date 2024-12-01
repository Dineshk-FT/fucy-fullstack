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
  damageScenarios,
  details,
  setDetails,
  damageID,
  refreshAPI,
  open,
  handleClose,
  model,
  rows,
  setRows,
  selectedRow,
  setSelectedRow,
  getModelById,
  getModels,
  id,
  update
}) {
  // console.log('selectedRow', selectedRow);
  // console.log('details', details);
  const handleChange = (e, prop, item) => {
    // console.log('e.target.checked', e.target.checked);
    // console.log('prop', prop);
    // console.log('item', item);
    const value = JSON.parse(JSON.stringify(details));
    const selectedItem = item.props.find((pr) => pr.id === prop.id);
    const Itemindex = item.props.findIndex((pr) => pr.id === prop.id);
    const index = value.findIndex((ind) => ind?.nodeId === item?.nodeId);
    // console.log('index', index);
    if (!prop.isSelected && e.target.checked) {
      selectedItem.isSelected = true;
    } else {
      selectedItem.isSelected = false;
    }
    // console.log('selectedItem', selectedItem);
    value[index]['props'][Itemindex] = selectedItem;
    // console.log('value', value);
    setDetails(value);
  };

  // console.log('selectedRow', selectedRow);
  const handleClick = () => {
    // console.log('details', details);
    const losses = details?.flatMap(
      (dtl) =>
        dtl?.props
          ?.filter((prp) => prp.isSelected)
          .map((prp) => ({
            ...prp,
            node: dtl?.name,
            nodeId: dtl?.nodeId
          })) || []
    );

    const filteredDetails = {
      rowId: selectedRow?.ID,
      Details: details
        .filter((item) => item.props.some((prop) => prop.isSelected))
        .map((item) => ({
          node: item?.name,
          nodeId: item?.nodeId,
          props: item.props.filter((prop) => prop.isSelected),
          name: selectedRow?.Name,
          description: selectedRow['Description/ Scalability']
        }))
    };

    // console.log('filteredDetails', filteredDetails);

    const info = {
      'model-id': model?._id,
      id: damageID,
      detailId: selectedRow?.ID,
      cyberLosses: JSON.stringify(losses),
      threats: JSON.stringify(filteredDetails)
    };
    update(info)
      .then((res) => {
        handleClose();
        refreshAPI();
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
              {details?.map((item, i) => (
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
                            control={<Checkbox size="small" onChange={(e) => handleChange(e, pr, item)} />}
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
