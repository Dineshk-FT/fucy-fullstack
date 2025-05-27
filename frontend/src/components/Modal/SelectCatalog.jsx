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
  CircularProgress,
} from '@mui/material';
import { TreeView, TreeItem } from '@mui/x-tree-view';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import toast, { Toaster } from 'react-hot-toast';
import ColorTheme from '../../themes/ColorTheme';

export default React.memo(function SelectCatalog({
  catalogDetails,
  open,
  handleClose,
  updateRiskTreatment,
  selectedRow,
  getRiskTreatment,
  model,
}) {
  const color = ColorTheme();
  const [checkedItems, setCheckedItems] = useState({});
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedRow?.['Related UNECE Threats or Vulns'] && catalogDetails) {
      const initialSelectedIds = selectedRow['Related UNECE Threats or Vulns'];
      const initialCheckedItems = {};

      catalogDetails.forEach((catalog) => {
        const catalogCheckedItems = {};
        catalog.item_name.forEach((item) => {
          if (initialSelectedIds.includes(item.id)) {
            catalogCheckedItems[item.id] = true;
          }
        });

        if (Object.keys(catalogCheckedItems).length > 0) {
          initialCheckedItems[catalog.id] = catalogCheckedItems;
        }
      });

      setSelectedIds(initialSelectedIds);
      setCheckedItems(initialCheckedItems);
    }
  }, [selectedRow, catalogDetails]);

  const updateSelectedIds = useCallback((itemId, checked) => {
    setSelectedIds((prev) => {
      const updated = checked ? [...new Set([...prev, itemId])] : prev.filter((id) => id !== itemId);
      return updated;
    });
  }, []);

  const isCatalogFullySelected = useCallback(
    (catalogId) => {
      const catalog = catalogDetails.find((cat) => cat.id === catalogId);
      return catalog?.item_name.every((item) => checkedItems[catalogId]?.[item.id]) || false;
    },
    [catalogDetails, checkedItems],
  );

  const isCatalogPartiallySelected = useCallback(
    (catalogId) => {
      const catalog = catalogDetails.find((cat) => cat.id === catalogId);
      return (
        catalog?.item_name.some((item) => checkedItems[catalogId]?.[item.id]) &&
        !isCatalogFullySelected(catalogId)
      );
    },
    [catalogDetails, checkedItems, isCatalogFullySelected],
  );

  const handleItemChange = useCallback(
    (catalogId, itemId, checked) => {
      setCheckedItems((prev) => ({
        ...prev,
        [catalogId]: {
          ...prev[catalogId],
          [itemId]: checked,
        },
      }));
      updateSelectedIds(itemId, checked);
    },
    [updateSelectedIds],
  );

  const handleCatalogChange = useCallback(
    (catalogId, checked) => {
      const catalog = unstoppableDetails.find((cat) => cat.id === catalogId);
      const updatedItems = catalog.item_name.reduce((acc, item) => {
        acc[item.id] = checked;
        return acc;
      }, {});

      setCheckedItems((prev) => ({
        ...prev,
        [catalogId]: {
          ...updatedItems,
          selectAll: checked,
        },
      }));

      const catalogItemIds = catalog.item_name.map((item) => item.id);
      setSelectedIds((prev) =>
        checked
          ? [...new Set([...prev, ...catalogItemIds])]
          : prev.filter((id) => !catalogItemIds.includes(id)),
      );
    },
    [catalogDetails],
  );

  const handleClick = useCallback(() => {
    if (!selectedIds.length) {
      toast.error('Please select at least one catalog item');
      return;
    }

    setLoading(true);
    const details = {
      detailId: selectedRow.detailId,
      'model-id': model?._id,
      catalogs: JSON.stringify(selectedIds),
    };

    updateRiskTreatment(details)
      .then((res) => {
        if (res) {
          toast.success('Catalogs updated successfully');
          getRiskTreatment(model?._id);
          setCheckedItems({});
          setSelectedIds([]);
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
  }, [updateRiskTreatment, selectedRow, model, getRiskTreatment, selectedIds, handleClose]);

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="select-catalog-dialog-title"
        aria-describedby="select-catalog-dialog-description"
        maxWidth="md"
        sx={{
          '& .MuiPaper-root': {
            background: color?.modalBg,
            width: '600px',
            height: '400px',
            borderRadius: '8px',
          },
        }}
      >
        <DialogTitle sx={{ fontSize: 18, fontFamily: 'Inter', p: 2 }}>
          Select Catalogs
        </DialogTitle>
        <DialogContent sx={{ p: 2, overflow: 'auto' }}>
          <DialogContentText id="select-catalog-dialog-description">
            <TreeView
              aria-label="Catalog navigator"
              defaultCollapseIcon={<ExpandMoreIcon />}
              defaultExpandIcon={<ChevronRightIcon />}
            >
              {catalogDetails?.map((catalogItem) => (
                <TreeItem
                  key={catalogItem.id}
                  nodeId={catalogItem.id}
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
                            checked={isCatalogFullySelected(catalogItem.id)}
                            indeterminate={isCatalogPartiallySelected(catalogItem.id)}
                            onChange={(e) => handleCatalogChange(catalogItem.id, e.target.checked)}
                            aria-label={`Select all items in ${catalogItem.name}`}
                          />
                        }
                        label={catalogItem.name}
                      />
                    </FormGroup>
                  }
                >
                  {catalogItem.item_name.map((item) => (
                    <TreeItem
                      key={item.id}
                      nodeId={item.id}
                      label={
                        <FormGroup>
                          <FormControlLabel
                            sx={{
                              my: 0.5,
                              '& .MuiTypography-root': {
                                fontSize: '14px',
                                color: color?.sidebarContent,
                              },
                            }}
                            control={
                              <Checkbox
                                size="small"
                                checked={checkedItems[catalogItem.id]?.[item.id] || false}
                                onChange={(e) =>
                                  handleItemChange(catalogItem.id, item.id, e.target.checked)
                                }
                                aria-label={`Select ${item.name}`}
                              />
                            }
                            label={item.name}
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
            disabled={loading || !selectedIds.length}
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