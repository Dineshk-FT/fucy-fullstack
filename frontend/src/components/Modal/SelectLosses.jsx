/*eslint-disable*/
import * as React from 'react';
import { useEffect } from 'react';
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
import { Checkbox, FormControlLabel, FormGroup, Typography } from '@mui/material';
import ColorTheme from '../../themes/ColorTheme';
import Tooltip from '@mui/material/Tooltip';
import InfoIcon from '@mui/icons-material/Info';

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
  const color = ColorTheme();
  // console.log('details', details);
  // console.log('selectedRow', selectedRow);
  useEffect(() => {
    const updateDetailsWithCyberLosses = (details, cyberLosses) => {
      const updatedDetails = details.map((item) => {
        const updatedProps = item.props.map((prop) => {
          const match = cyberLosses.find((loss) => loss.id === prop.id && loss.isSelected);
          return {
            ...prop,
            isSelected: match ? true : prop.isSelected || false
          };
        });
        return {
          ...item,
          props: updatedProps
        };
      });
      return updatedDetails;
    };

    // Example usage:
    const updatedDetails = updateDetailsWithCyberLosses(details, selectedRow.cyberLosses);
    // console.log('updatedDetails', updatedDetails);
    setDetails(updatedDetails);
  }, [selectedRow]);

  const handleParentChange = (e, item) => {
    e.stopPropagation();
    if (!item.props || item.props.length === 0) return; // Skip if no props
    const isChecked = e.target.checked;
    const updatedDetails = JSON.parse(JSON.stringify(details));
    const index = updatedDetails.findIndex((ind) => ind?.nodeId === item?.nodeId);

    if (index !== -1) {
      updatedDetails[index].props.forEach((prop) => {
        if (!prop?.is_risk_added) {
          prop.isSelected = isChecked;
        }
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
              key: index + 1
            })),
          name: selectedRow?.Name
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
            minWidth: 350,
            width: 'fit-content',
            background: color?.tabBG
          }
        }}
      >
        <DialogTitle variant="h4" color="primary" id="alert-dialog-title">
          {'Select the Losses'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <TreeView aria-label="file system navigator" defaultCollapseIcon={<ExpandMoreIcon />} defaultExpandIcon={<ChevronRightIcon />}>
              {details?.map((item, i) => {
                const { allSelected, someSelected } = isParentChecked(item);
                return (
                  item.name && (
                    <TreeItem
                      key={`a${i}`}
                      nodeId={`a${i}`}
                      label={
                        <div onClick={(e) => e.stopPropagation()}>
                          <FormGroup>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  size="small"
                                  checked={allSelected} // All children selected
                                  indeterminate={!allSelected && someSelected} // Some children selected
                                  disabled={!item.props || item.props.length === 0} // Disable if no children
                                  onChange={(e) => handleParentChange(e, item)}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              }
                              label={
                                <Typography variant="h5" sx={{ color: color?.title }}>
                                  {item?.name}
                                </Typography>
                              }
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
                                control={
                                  <Checkbox
                                    size="small"
                                    disabled={pr?.is_risk_added}
                                    checked={pr?.isSelected} // Set based on isSelected
                                    onChange={(e) => handleChildChange(e, pr, item)}
                                  />
                                }
                                label={
                                  <Typography variant="p" sx={{ color: color?.title, display: 'flex', gap: 1, alignItems: 'center' }}>
                                    {`Loss of ${pr.name}`}
                                    {pr?.is_risk_added && (
                                      <Tooltip title="This risk has already been added and cannot be changed">
                                        <InfoIcon fontSize="small" sx={{ marginLeft: 0.5 }} />
                                      </Tooltip>
                                    )}
                                  </Typography>
                                }
                              />
                            </FormGroup>
                          }
                        />
                      ))}
                    </TreeItem>
                  )
                );
              })}
            </TreeView>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={handleClose}>
            Close
          </Button>
          <Button variant="contained" onClick={handleClick}>
            Okay
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
