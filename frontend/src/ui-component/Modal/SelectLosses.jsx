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
  details,
  setDetails,
  damageID,
  refreshAPI,
  open,
  handleClose,
  model,
  selectedRow,
  update,
  getThreatScenario
}) {
  const handleParentChange = (e, item) => {
    e.stopPropagation();
    if (!item.props || item.props.length === 0) return; // Skip if no props
    const isChecked = e.target.checked;
    const updatedDetails = JSON.parse(JSON.stringify(details));
    const index = updatedDetails.findIndex((ind) => ind?.nodeId === item?.nodeId);

    if (index !== -1) {
      updatedDetails[index].props.forEach((prop) => {
        prop.isSelected = isChecked;
      });
    }

    setDetails(updatedDetails);
  };

  const handleChildChange = (e, prop, item) => {
    const updatedDetails = JSON.parse(JSON.stringify(details));
    const parentIndex = updatedDetails.findIndex((ind) => ind?.nodeId === item?.nodeId);

    if (parentIndex !== -1) {
      const childIndex = updatedDetails[parentIndex].props.findIndex((pr) => pr.id === prop.id);
      if (childIndex !== -1) {
        updatedDetails[parentIndex].props[childIndex].isSelected = e.target.checked;
      }
    }

    setDetails(updatedDetails);
  };

  const isParentChecked = (item) => {
    if (!item.props || item.props.length === 0) {
      return { allSelected: false, someSelected: false };
    }
    const allSelected = item.props.every((prop) => prop.isSelected);
    const someSelected = item.props.some((prop) => prop.isSelected);
    return { allSelected, someSelected };
  };
  const handleClick = () => {
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

    let key = 0;

    const filteredDetails = {
      rowId: selectedRow?.id,
      id: selectedRow?.ID,
      Details: details
        .filter((item) => item.props.some((prop) => prop.isSelected))
        .map((item) => ({
          node: item?.name,
          nodeId: item?.nodeId,
          props: item.props
            .filter((prop) => prop.isSelected)
            .map((prop, index) => ({
              ...prop,
              key: index + 1 // Add an incrementing key starting from 1
            })),
          name: selectedRow?.Name,
          description: selectedRow['Description/ Scalability']
        }))
    };

    const info = {
      'model-id': model?._id,
      id: damageID,
      detailId: selectedRow?.id,
      cyberLosses: JSON.stringify(losses),
      threats: JSON.stringify(filteredDetails)
    };
    update(info)
      .then((res) => {
        handleClose();
        refreshAPI();
        getThreatScenario(model?._id);
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
          {'Select the Losses'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <TreeView aria-label="file system navigator" defaultCollapseIcon={<ExpandMoreIcon />} defaultExpandIcon={<ChevronRightIcon />}>
              {details?.map((item, i) => {
                const { allSelected, someSelected } = isParentChecked(item);
                return (
                  <TreeItem
                    key={`a${i}`}
                    nodeId={`a${i}`}
                    label={
                      <div onClick={(e) => e.stopPropagation()} /* Prevent TreeItem toggle */>
                        <FormGroup>
                          <FormControlLabel
                            sx={{
                              '& .MuiTypography-root': {
                                fontSize: '14px',
                                fontWeight: 600
                              }
                            }}
                            control={
                              <Checkbox
                                size="small"
                                checked={allSelected}
                                indeterminate={!allSelected && someSelected}
                                disabled={!item.props || item.props.length === 0} // Disable if no props
                                onChange={(e) => handleParentChange(e, item)}
                                onClick={(e) => e.stopPropagation()} // Prevents TreeItem toggle
                              />
                            }
                            label={item?.name}
                          />
                        </FormGroup>
                      </div>
                    }
                  >
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
                                  fontSize: '13px',
                                  color: '#000'
                                }
                              }}
                              control={<Checkbox size="small" checked={pr?.isSelected} onChange={(e) => handleChildChange(e, pr, item)} />}
                              label={`Loss of ${pr.name}`}
                            />
                          </FormGroup>
                        }
                      />
                    ))}
                  </TreeItem>
                );
              })}
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
