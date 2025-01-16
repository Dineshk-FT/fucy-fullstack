/* eslint-disable */
import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, FormControlLabel, Checkbox, Divider } from '@mui/material';
import useStore from '../../Zustand/store';
import { useSelector } from 'react-redux';

const selector = (state) => ({
  template: state.assets.template
});

const DocumentDialog = ({ open, onClose }) => {
  const { template } = useStore(selector);
  const { generateDocument } = useStore(); // Access the store method
  const [selectedItems, setSelectedItems] = useState([]);
  const { modelId } = useSelector((state) => state?.pageName);

  // Function to handle checkbox state changes
  const handleCheckboxChange = (id) => {
    setSelectedItems(
      (prevSelectedItems) =>
        prevSelectedItems.includes(id)
          ? prevSelectedItems.filter((item) => item !== id) // Remove item if already selected
          : [...prevSelectedItems, id] // Add item if not already selected
    );
  };

  const handleDownload = async () => {
    const formData = new FormData();
    formData.append('model-id', modelId);
    formData.append('threatScenariosTable', selectedItems.includes(31) || selectedItems.includes(32) ? 1 : 0);
    formData.append('attackTreatScenariosTable', selectedItems.includes(41) || selectedItems.includes(42) ? 1 : 0);
    formData.append('damageScenariosTable', selectedItems.includes(21) || selectedItems.includes(22) ? 1 : 0);
    // formData.append('riskTreatmentTable', selectedItems.includes(81));

    if (selectedItems.includes(1)) {
      try {
        const imageData = await generateImageFromNodesAndEdges();
        const blob = await fetch(imageData).then((res) => res.blob());
        formData.append('image', blob, 'itemModelImage.png');
      } catch (error) {
        console.error('Error generating image:', error);
      }
    }

    try {
      const response = await generateDocument(formData);
      console.log('Document generation response:', response);
    } catch (error) {
      console.error('Error during document generation:', error);
    }
  };

  const generateImageFromNodesAndEdges = async () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const width = 1024;
    const height = 768;

    canvas.width = width;
    canvas.height = height;

    ctx.fillStyle = '#1a365d';
    ctx.fillRect(0, 0, width, height);

    const { nodes, edges } = template;

    const scaleX = width / 1000;
    const scaleY = height / 1000;

    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    nodes.forEach((node) => {
      const { x, y } = node.position;
      const nodeWidth = node.width || 100;
      const nodeHeight = node.height || 50;

      minX = Math.min(minX, x - nodeWidth / 2);
      minY = Math.min(minY, y - nodeHeight / 2);
      maxX = Math.max(maxX, x + nodeWidth / 2);
      maxY = Math.max(maxY, y + nodeHeight / 2);
    });

    const offsetX = (width - (maxX - minX)) / 2 - minX;
    const offsetY = (height - (maxY - minY)) / 2 - minY;

    nodes.forEach((node) => {
      const { x, y } = node.position;
      const label = node.data.label || node.id;

      const nodeStyle = node.data.style || {};
      const nodeWidth = node.width || 100;
      const nodeHeight = node.height || 50;
      const backgroundColor = nodeStyle.backgroundColor || 'white';
      const borderColor = nodeStyle.borderColor || 'black';
      const borderWidth = nodeStyle.borderWidth || 2;

      const nodeX = (x + offsetX) * scaleX;
      const nodeY = (y + offsetY) * scaleY;

      ctx.fillStyle = backgroundColor;
      ctx.fillRect(nodeX - nodeWidth / 2, nodeY - nodeHeight / 2, nodeWidth, nodeHeight);

      ctx.lineWidth = borderWidth;
      ctx.strokeStyle = borderColor;
      ctx.strokeRect(nodeX - nodeWidth / 2, nodeY - nodeHeight / 2, nodeWidth, nodeHeight);

      ctx.fillStyle = 'black';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, nodeX, nodeY);
    });

    edges.forEach((edge) => {
      const fromNode = nodes.find((node) => node.id === edge.source);
      const toNode = nodes.find((node) => node.id === edge.target);

      if (fromNode && toNode) {
        const fromX = (fromNode.position.x + offsetX) * scaleX;
        const fromY = (fromNode.position.y + offsetY) * scaleY;
        const toX = (toNode.position.x + offsetX) * scaleX;
        const toY = (toNode.position.y + offsetY) * scaleY;

        const angleFromTo = Math.atan2(toY - fromY, toX - fromX);
        const angleToFrom = Math.atan2(fromY - toY, fromX - toX);

        const fromRadiusX = (fromNode.width || 100) / 2;
        const fromRadiusY = (fromNode.height || 50) / 2;
        const toRadiusX = (toNode.width || 100) / 2;
        const toRadiusY = (toNode.height || 50) / 2;

        const startX = fromX + fromRadiusX * Math.cos(angleFromTo);
        const startY = fromY + fromRadiusY * Math.sin(angleFromTo);
        const endX = toX + toRadiusX * Math.cos(angleToFrom);
        const endY = toY + toRadiusY * Math.sin(angleToFrom);

        // Draw the edge line
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Draw marker only at the target node
        if (edge.markerEnd) {
          drawArrowMarker(ctx, endX, endY, startX, startY, edge.markerEnd);
        }
      }
    });

    const imageData = canvas.toDataURL('image/png');
    return imageData;
  };

  function drawArrowMarker(ctx, x, y, fromX, fromY, marker) {
    const { width = 10, height = 15, color = 'black' } = marker;
    const angle = Math.atan2(y - fromY, x - fromX);

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-width, height / 2);
    ctx.lineTo(-width, -height / 2);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

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
        // { id: 21, name: 'Damage Scenarios Derivations' },
        { id: 22, name: 'Damage Scenarios - Collection & Impact Ratings' }
      ]
    },
    {
      id: 3,
      name: 'Threat Scenarios Identification',
      icon: 'ThreatIcon',
      subs: [
        // { id: 31, name: 'Threat Scenarios' },
        { id: 32, name: 'Derived Threat Scenarios' }
      ]
    },
    {
      id: 4,
      name: 'Attack Path Analysis and Attack Feasibility Rating',
      icon: 'AttackIcon',
      subs: [
        { id: 41, name: 'Attack' }
        // { id: 42, name: 'Attack Trees' }
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
              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                {item.name}
              </Typography>
            ) : (
              <FormControlLabel control={<Checkbox onChange={() => handleCheckboxChange(item.id)} name={item.name} />} label={item.name} />
            )}
            {item.subs &&
              item.subs.map((sub) => (
                <FormControlLabel
                  key={sub.id}
                  control={<Checkbox checked={selectedItems.includes(sub.id)} onChange={() => handleCheckboxChange(sub.id)} />}
                  label={sub.name}
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
          onClick={handleDownload}
        >
          Download
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DocumentDialog;
