/* eslint-disable */
import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { Checkbox, FormControlLabel, FormGroup } from '@mui/material';

export default function SelectCyberGoals({
  riskTreatment,
  details,
  open,
  handleClose,
  selectedScenes,
  setSelectedScenes,
  updateRiskTreatment,
  selectedRow,
  getRiskTreatment,
  model
}) {
  const handleChange = (scene) => {
    // console.log('scene', scene);
    setSelectedScenes((prevSelected) =>
      prevSelected.some((s) => s.ID === scene.ID) ? prevSelected.filter((s) => s.ID !== scene.ID) : [...prevSelected, scene]
    );
  };

  React.useEffect(() => {
    function getCybersecurityGoals(riskTreatment, selectedRow) {
      // Find the object in Details where threat_key matches
      const matchingDetail = riskTreatment['Details'].find((detail) => detail.threat_key === selectedRow.threat_key);

      // Return cybersecurity goals if found, otherwise return null
      return matchingDetail?.cybersecurity?.cybersecurity_goals || null;
    }
    const Goals = getCybersecurityGoals(riskTreatment, selectedRow);
    setSelectedScenes(Goals);
  }, [selectedRow, riskTreatment]);

  const handleClick = () => {
    const details = {
      cyberDetails: selectedScenes.map((scene) => scene.ID),
      threatId: selectedRow.ID,
      type: 'cybersecurity_goals',
      threatKey: selectedRow?.threat_key,
      'model-id': model?._id
    };

    // console.log('details', details);
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
            width: 'fit-content',
            maxWidth: 600,
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
          {'Select the CyberSecurity Goals'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {details?.map((detail) => (
              <FormGroup key={detail?.ID}>
                <FormControlLabel
                  sx={{
                    margin: '-6px',
                    '& .MuiTypography-root': {
                      fontSize: '13px',
                      color: '#000'
                    }
                  }}
                  control={
                    <Checkbox size="small" checked={selectedScenes.some((s) => s.ID === detail.ID)} onChange={() => handleChange(detail)} />
                  }
                  label={detail?.Name}
                />
              </FormGroup>
            ))}
            {/* <TreeView aria-label="file system navigator" defaultCollapseIcon={<ExpandMoreIcon />} defaultExpandIcon={<ChevronRightIcon />}>
              <TreeItem key={details?._id} nodeId={details?._id} label={details?.name} sx={{ color: '#000', fontWeight: 600 }}>
                {details?.scenes?.map((scene) => (
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
                          control={
                            <Checkbox
                              size="small"
                              checked={selectedScenes.some((s) => s.ID === scene.ID)}
                              onChange={() => handleChange(scene)}
                            />
                          }
                          label={scene?.Name}
                        />
                      </FormGroup>
                    }
                  />
                ))}
              </TreeItem>
            </TreeView> */}
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
