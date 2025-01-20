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
    formData.append('riskTreatmentTable', selectedItems.includes(81) ? 1 : 0);

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

    // Set canvas dimensions
    canvas.width = width;
    canvas.height = height;

    // Background color
    ctx.fillStyle = '#1a365d';
    ctx.fillRect(0, 0, width, height);

    const { nodes, edges } = template;

    // Calculate bounds of all nodes to center the graph
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

    const graphWidth = maxX - minX;
    const graphHeight = maxY - minY;
    const scale = Math.min(width / graphWidth, height / graphHeight) * 0.9; // Add padding
    const offsetX = (width - graphWidth * scale) / 2 - minX * scale;
    const offsetY = (height - graphHeight * scale) / 2 - minY * scale;

    // Helper to transform positions
    const transformPosition = (x, y) => ({
      x: x * scale + offsetX,
      y: y * scale + offsetY
    });

    // Draw nodes
    nodes.forEach((node) => {
      const { x, y } = node.position;
      const label = node.data?.label || node.id;

      const nodeStyle = node.data?.style || {};
      const nodeWidth = (node.width || 100) * scale;
      const nodeHeight = (node.height || 50) * scale;
      const backgroundColor = nodeStyle.backgroundColor || 'white';
      const borderColor = nodeStyle.borderColor || 'black';
      const borderWidth = 2; // nodeStyle.borderWidth
      const textColor = nodeStyle.color || 'black';

      const { x: transformedX, y: transformedY } = transformPosition(x, y);

      // Draw node rectangle
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(transformedX - nodeWidth / 2, transformedY - nodeHeight / 2, nodeWidth, nodeHeight);

      // Draw border
      ctx.lineWidth = borderWidth * scale;
      ctx.strokeStyle = borderColor;
      ctx.strokeRect(transformedX - nodeWidth / 2, transformedY - nodeHeight / 2, nodeWidth, nodeHeight);

      // Draw label
      ctx.fillStyle = textColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `${14 * scale}px Arial`;
      ctx.fillText(label, transformedX, transformedY);
    });

    // Draw edges
    edges.forEach((edge) => {
      const fromNode = nodes.find((node) => node.id === edge.source);
      const toNode = nodes.find((node) => node.id === edge.target);

      if (fromNode && toNode) {
        const fromHandle = getHandlePosition(fromNode, 'bottom');
        const toHandle = getHandlePosition(toNode, 'top');

        const transformedFrom = transformPosition(fromHandle.x, fromHandle.y);
        const transformedTo = transformPosition(toHandle.x, toHandle.y);

        // Calculate adjusted endpoints to ensure edges touch only the borders
        const adjustedFrom = adjustEdgeEndpoint(fromNode, transformedFrom, transformedTo);
        const adjustedTo = adjustEdgeEndpoint(toNode, transformedTo, transformedFrom);

        ctx.lineWidth = (edge.style?.strokeWidth || 2) * scale;
        ctx.strokeStyle = edge.style?.stroke || 'white';

        // Draw edge shape based on type
        switch (edge.type) {
          case 'bezier':
            drawBezierEdge(ctx, adjustedFrom, adjustedTo);
            break;
          case 'step':
            drawStepEdge(ctx, adjustedFrom, adjustedTo);
            break;
          default:
            drawStraightEdge(ctx, adjustedFrom, adjustedTo);
            break;
        }

        // Draw arrow marker at target node
        if (edge.markerEnd) {
          drawArrowMarker(ctx, adjustedTo.x, adjustedTo.y, adjustedFrom.x, adjustedFrom.y, edge.markerEnd);
        }
      }
    });

    // Convert canvas to image data
    return canvas.toDataURL('image/png');
  };

  // Helper: Draw a straight edge
  function drawStraightEdge(ctx, from, to) {
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  }

  // Helper: Draw a Bezier edge
  function drawBezierEdge(ctx, from, to) {
    const controlPoint1 = { x: from.x, y: (from.y + to.y) / 2 };
    const controlPoint2 = { x: to.x, y: (from.y + to.y) / 2 };

    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.bezierCurveTo(controlPoint1.x, controlPoint1.y, controlPoint2.x, controlPoint2.y, to.x, to.y);
    ctx.stroke();
  }

  // Helper: Draw a stepped edge
  function drawStepEdge(ctx, from, to) {
    const midX = (from.x + to.x) / 2;

    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(midX, from.y);
    ctx.lineTo(midX, to.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  }

  // Helper: Get handle position
  function getHandlePosition(node, handle) {
    const nodeWidth = node.width || 100;
    const nodeHeight = node.height || 50;

    switch (handle) {
      case 'top':
        return { x: node.position.x, y: node.position.y - nodeHeight / 2 };
      case 'bottom':
        return { x: node.position.x, y: node.position.y + nodeHeight / 2 };
      default:
        return { x: node.position.x, y: node.position.y };
    }
  }

  // Helper: Adjust edge endpoint
  function adjustEdgeEndpoint(node, from, to) {
    const nodeWidth = (node.width || 100) / 2;
    const nodeHeight = (node.height || 50) / 2;

    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const angle = Math.atan2(dy, dx);

    const radiusX = Math.abs(nodeWidth / Math.cos(angle));
    const radiusY = Math.abs(nodeHeight / Math.sin(angle));
    const radius = Math.min(radiusX, radiusY);

    return {
      x: from.x + radius * Math.cos(angle),
      y: from.y + radius * Math.sin(angle)
    };
  }

  // Helper: Draw arrow marker
  function drawArrowMarker(ctx, x, y, fromX, fromY, marker) {
    const { width = 10, height = 15, color = 'black' } = marker;
    let angle = Math.atan2(y - fromY, x - fromX);

    // Check if the edge direction is upwards or downwards
    const isDownwardArrow = y > fromY;

    // If downward, rotate the arrow to point downward, otherwise point upward
    if (isDownwardArrow) {
      // Pointing down
      angle = Math.atan2(1, 0); // Rotate to 90 degrees downward
    } else {
      // Pointing up
      angle = Math.atan2(-1, 0); // Rotate to -90 degrees upward
    }

    // Adjust the position of the arrow slightly below the edge
    const arrowOffset = 20; // Small value to move the arrow below the edge
    const adjustedY = y + (isDownwardArrow ? arrowOffset : -arrowOffset);

    ctx.save();
    ctx.translate(x, adjustedY); // Apply the adjusted position for the marker
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
