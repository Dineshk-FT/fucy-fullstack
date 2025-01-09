import React, { useEffect } from 'react';
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

export default function SelectCatalog({ catalogDetails, open, handleClose, updateRiskTreatment, selectedRow, getRiskTreatment, model }) {
  const [checkedItems, setCheckedItems] = React.useState({});
  const [selectedIds, setSelectedIds] = React.useState([]);

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

  const updateSelectedIds = (itemId, checked) => {
    setSelectedIds((prev) => {
      if (checked) {
        return [...new Set([...prev, itemId])];
      }
      return prev.filter((existingId) => existingId !== itemId);
    });
  };

  const isCatalogFullySelected = (catalogId) => {
    const catalog = catalogDetails.find((cat) => cat.id === catalogId);
    return catalog.item_name.every((item) => checkedItems[catalogId]?.[item.id]);
  };

  const isCatalogPartiallySelected = (catalogId) => {
    const catalog = catalogDetails.find((cat) => cat.id === catalogId);
    return catalog.item_name.some((item) => checkedItems[catalogId]?.[item.id]) && !isCatalogFullySelected(catalogId);
  };

  const handleItemChange = (catalogId, itemId, checked) => {
    setCheckedItems((prev) => ({
      ...prev,
      [catalogId]: {
        ...prev[catalogId],
        [itemId]: checked
      }
    }));
    updateSelectedIds(itemId, checked);
  };

  const handleCatalogChange = (catalogId, checked) => {
    const catalog = catalogDetails.find((cat) => cat.id === catalogId);
    const updatedItems = catalog.item_name.reduce((acc, item) => {
      acc[item.id] = checked;
      return acc;
    }, {});

    setCheckedItems((prev) => ({
      ...prev,
      [catalogId]: {
        ...updatedItems,
        selectAll: checked
      }
    }));

    const catalogItemIds = catalog.item_name.map((item) => item.id);
    const newIds = checked ? [...new Set([...selectedIds, ...catalogItemIds])] : selectedIds.filter((id) => !catalogItemIds.includes(id));

    setSelectedIds(newIds);
  };

  const handleClick = () => {
    const details = {
      detailId: selectedRow.detailId,
      'model-id': model?._id,
      catalogs: JSON.stringify(selectedIds)
    };

    updateRiskTreatment(details)
      .then((res) => {
        if (res) {
          handleClose();
          getRiskTreatment(model?._id);
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
        <DialogTitle id="alert-dialog-title" variant="h4" color="primary">
          {'Select the Catalogs'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <TreeView aria-label="file system navigator" defaultCollapseIcon={<ExpandMoreIcon />} defaultExpandIcon={<ChevronRightIcon />}>
              {catalogDetails?.map((catalogItem) => (
                <TreeItem
                  key={catalogItem.id}
                  nodeId={catalogItem.id}
                  label={
                    <FormGroup>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={isCatalogFullySelected(catalogItem.id)}
                            indeterminate={isCatalogPartiallySelected(catalogItem.id)}
                            onChange={(e) => handleCatalogChange(catalogItem.id, e.target.checked)}
                          />
                        }
                        label={catalogItem.name}
                      />
                    </FormGroup>
                  }
                  sx={{ color: '#000', fontWeight: 600 }}
                >
                  {catalogItem.item_name.map((item) => (
                    <TreeItem
                      key={item.id}
                      nodeId={item.id}
                      label={
                        <FormGroup>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={checkedItems[catalogItem.id]?.[item.id] || false}
                                onChange={(e) => handleItemChange(catalogItem.id, item.id, e.target.checked)}
                              />
                            }
                            label={item.name}
                          />
                        </FormGroup>
                      }
                      sx={{
                        '& .MuiTypography-root': {
                          fontSize: '13px',
                          color: '#555'
                        }
                      }}
                    />
                  ))}
                </TreeItem>
              ))}
            </TreeView>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" color="warning" onClick={handleClose}>
            Close
          </Button>
          <Button variant="contained" onClick={handleClick} autoFocus>
            Okay
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
