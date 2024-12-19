import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, FormControlLabel, Checkbox, Divider } from '@mui/material';

const DocumentDialog = ({ open, onClose }) => {
  // Define the items and their subs
  const items = [
    {
      id: 1,
      name: 'Item Model & Assets',
      icon: 'ItemIcon'
    },
    {
      id: 2,
      name: 'Damage Scenarios Identification and Impact Ratings',
      icon: 'DamageIcon',
      subs: [
        { id: 21, name: 'Damage Scenarios Derivations' },
        { id: 22, name: 'Damage Scenarios - Collection & Impact Ratings' }
      ]
    },
    {
      id: 3,
      name: 'Threat Scenarios Identification',
      icon: 'ThreatIcon',
      subs: [
        { id: 31, name: 'Threat Scenarios' },
        { id: 32, name: 'Derived Threat Scenarios' }
      ]
    },
    {
      id: 4,
      name: 'Attack Path Analysis and Attack Feasibility Rating',
      icon: 'AttackIcon',
      subs: [
        { id: 41, name: 'Attack' },
        { id: 42, name: 'Attack Trees' }
        // { id: 43, name: 'Vulnerability Analysis' }
      ]
    },
    // {
    //   id: 5,
    //   name: 'CyberSecurity Goals, Claims and Requirements',
    //   icon: 'CybersecurityIcon',
    //   subs: [
    //     {
    //       id: 51,
    //       name: 'CyberSecurity Goals and Requirements',
    //       subs: [
    //         { id: 511, name: 'CyberSecurity Goals' },
    //         { id: 512, name: 'CyberSecurity Requirements' }
    //       ]
    //     },
    //     { id: 52, name: 'CyberSecurity Controls' }
    //   ]
    // },
    // {
    //   id: 6,
    //   name: 'System Design',
    //   icon: 'SystemIcon',
    //   subs: [
    //     { id: 61, name: 'Hardware Models' },
    //     { id: 62, name: 'Software Models' }
    //   ]
    // },
    // {
    //   id: 7,
    //   name: 'Catalogs',
    //   icon: 'CatalogIcon',
    //   subs: [{ id: 71, name: 'UNICE R.155 Annex 5(WP.29)' }]
    // },
    {
      id: 8,
      name: 'Risk Determination and Risk Treatment Decision',
      icon: 'RiskIcon',
      subs: [{ id: 81, name: 'Threat Assessment & Risk Treatment' }]
    }
  ];

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'center' }}>Document Report</DialogTitle>
      <DialogContent>
        <Typography variant="subtitle1" gutterBottom>
          Select items to add in the report and click on download:
        </Typography>

        <Divider sx={{ my: 1 }} />

        {items.map((item) => (
          <div key={item.id}>
            {item.subs ? (
              // Render just the label for items with subs
              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                {item.name}
              </Typography>
            ) : (
              // Render checkbox for items without subs
              <FormControlLabel
                control={
                  <Checkbox
                    // Add state logic for managing selection if needed
                    onChange={() => handleCheckboxChange(item.id)}
                    name={item.name}
                  />
                }
                label={item.name}
              />
            )}
            {item.subs &&
              item.subs.map((sub) => (
                <FormControlLabel
                  key={sub.id}
                  control={
                    <Checkbox
                      // Add state logic for managing sub-selection if needed
                      onChange={() => handleCheckboxChange(sub.id)}
                      name={sub.name}
                    />
                  }
                  label={`  ${sub.name}`}
                />
              ))}
            <Divider sx={{ my: 1 }} />
          </div>
        ))}
      </DialogContent>
      <DialogActions>
        <Button
          style={{
            padding: '6px',
            fontSize: '0.8rem',
            border: '1px solid #007bff',
            background: '#007bff',
            color: '#fff',
            cursor: 'pointer'
          }}
          onClick={onClose}
        >
          Close
        </Button>
        <Button
          style={{
            padding: '6px',
            fontSize: '0.8rem',
            border: '1px solid #dc3545',
            background: '#dc3545',
            color: '#fff',
            cursor: 'pointer'
          }}
        >
          Download
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DocumentDialog;
