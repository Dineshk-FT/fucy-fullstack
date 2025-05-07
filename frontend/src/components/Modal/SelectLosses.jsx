/* eslint-disable*/
import React, { useCallback, useEffect, useState } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Typography,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import { TreeView, TreeItem } from '@mui/x-tree-view';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import InfoIcon from '@mui/icons-material/Info';
import toast, { Toaster } from 'react-hot-toast';
import ColorTheme from '../../themes/ColorTheme';

export default React.memo(function SelectLosses({
  details,
  setDetails,
  damageID,
  open,
  handleClose,
  model,
  selectedRow,
  update,
  getThreatScenario,
}) {
  const color = ColorTheme();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const updateDetailsWithCyberLosses = (currentDetails, cyberLosses) => {
      return currentDetails.map((item) => ({
        ...item,
        props: item.props.map((prop) => ({
          ...prop,
          isSelected: cyberLosses.some((loss) => loss.id === prop.id && loss.isSelected)
            ? true
            : prop.isSelected || false,
        })),
      }));
    };

    if (selectedRow?.cyberLosses) {
      setDetails((prev) => updateDetailsWithCyberLosses(prev, selectedRow.cyberLosses));
    }
  }, [selectedRow, setDetails]);

  const handleParentChange = useCallback(
    (item, checked) => {
      setDetails((prev) =>
        prev.map((dtl) =>
          dtl.nodeId === item.nodeId
            ? {
                ...dtl,
                props: dtl.props.map((prop) => ({
                  ...prop,
                  isSelected: prop.is_risk_added ? prop.isSelected : checked,
                })),
              }
            : dtl,
        ),
      );
    },
    [setDetails],
  );

  const handleChildChange = useCallback(
    (prop, item, checked) => {
      setDetails((prev) =>
        prev.map((dtl) =>
          dtl.nodeId === item.nodeId
            ? {
                ...dtl,
                props: dtl.props.map((pr) =>
                  pr.id === prop.id ? { ...pr, isSelected: checked } : pr,
                ),
              }
            : dtl,
        ),
      );
    },
    [setDetails],
  );

  const isParentChecked = useCallback(
    (item) => {
      if (!item.props || item.props.length === 0) {
        return { allSelected: false, someSelected: false };
      }
      const allSelected = item.props.every((prop) => prop.isSelected);
      const someSelected = item.props.some((prop) => prop.isSelected);
      return { allSelected, someSelected };
    },
    [],
  );

  const handleClick = useCallback(() => {
    const selectedLosses = details?.flatMap((dtl) =>
      dtl?.props
        ?.filter((prp) => prp.isSelected)
        .map((prp) => ({
          ...prp,
          node: dtl?.name,
          nodeId: dtl?.nodeId,
        })),
    );

    if (!selectedLosses.length) {
      toast.error('Please select at least one loss');
      return;
    }

    setLoading(true);
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
              key: index + 1,
            })),
          name: selectedRow?.Name,
        })),
    };

    const info = {
      'model-id': model?._id,
      id: damageID,
      detailId: selectedRow?.id,
      cyberLosses: JSON.stringify(selectedLosses),
      threats: JSON.stringify(filteredDetails),
    };

    update(info)
      .then((res) => {
        if (res) {
          toast.success('Losses updated successfully');
          getThreatScenario(model?._id);
          setDetails([]);
          handleClose();
        } else {
          toast.error('Update failed');
        }
      })
      .catch(() => {
        toast.error('Something went wrong');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [details, selectedRow, model, damageID, update, getThreatScenario, handleClose, setDetails]);

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="select-losses-dialog-title"
        aria-describedby="select-losses-dialog-description"
        maxWidth="md"
        sx={{
          '& .MuiPaper-root': {
            background: color?.modalBg,
            width: '600px',
            borderRadius: '8px',
          },
        }}
      >
        <DialogTitle sx={{ fontSize: 18, fontFamily: 'Inter', p: 2 }}>
          Select Losses
        </DialogTitle>
        <DialogContent sx={{ p: 2, overflow: 'auto' }}>
          <DialogContentText id="select-losses-dialog-description">
            <TreeView
              aria-label="Losses navigator"
              defaultCollapseIcon={<ExpandMoreIcon />}
              defaultExpandIcon={<ChevronRightIcon />}
            >
              {details?.map((item, i) => {
                const { allSelected, someSelected } = isParentChecked(item);
                return (
                  <TreeItem
                    key={item.nodeId}
                    nodeId={item.nodeId}
                    label={
                      <FormGroup>
                        <FormControlLabel
                          sx={{
                            my: 0.5,
                            '& .MuiTypography-root': {
                              fontSize: '14px',
                              color: color?.title,
                              fontWeight: 600,
                            },
                          }}
                          control={
                            <Checkbox
                              size="small"
                              checked={allSelected}
                              indeterminate={!allSelected && someSelected}
                              disabled={!item.props || item.props.length === 0}
                              onChange={(e) => handleParentChange(item, e.target.checked)}
                              aria-label={`Select all losses for ${item.name}`}
                            />
                          }
                          label={item.name}
                        />
                      </FormGroup>
                    }
                  >
                    {item?.props?.map((pr) => (
                      <TreeItem
                        key={pr.id}
                        nodeId={pr.id}
                        label={
                          <FormGroup>
                            <FormControlLabel
                              sx={{
                                my: 0.5,
                                '& .MuiTypography-root': {
                                  fontSize: '14px',
                                  color: color?.sidebarContent,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
                                },
                              }}
                              control={
                                <Checkbox
                                  size="small"
                                  disabled={pr?.is_risk_added}
                                  checked={pr?.isSelected || false}
                                  onChange={(e) => handleChildChange(pr, item, e.target.checked)}
                                  aria-label={`Select loss of ${pr.name}`}
                                />
                              }
                              label={
                                <>
                                  {`Loss of ${pr.name}`}
                                  {pr?.is_risk_added && (
                                    <Tooltip title="This loss has already been added and cannot be changed">
                                      <InfoIcon fontSize="small" sx={{ ml: 0.5 }} />
                                    </Tooltip>
                                  )}
                                </>
                              }
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
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            variant="outlined"
            color="error"
            onClick={handleClose}
            disabled={loading}
            sx={{ textTransform: 'none', minWidth: '80px' }}
          >
            Close
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleClick}
            disabled={loading || !details?.some((item) => item.props.some((pr) => pr.isSelected))}
            sx={{ textTransform: 'none', minWidth: '80px' }}
            startIcon={loading && <CircularProgress size={16} />}
          >
            Okay
          </Button>
        </DialogActions>
      </Dialog>
      <Toaster position="top-right" reverseOrder={false} />
    </>
  );
});