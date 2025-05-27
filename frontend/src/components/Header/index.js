/*eslint-disable*/
import React, { useCallback, useEffect, useState } from 'react';
import { makeStyles } from '@mui/styles';
import {
  Box,
  Tooltip,
  Slider,
  Select,
  MenuItem,
  IconButton,
  FormControl,
  InputLabel,
} from '@mui/material';
import { BrushBig } from 'iconsax-react';
import FormatShapesIcon from '@mui/icons-material/FormatShapes';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import RefreshIcon from '@mui/icons-material/Refresh';
import CreateIcon from '@mui/icons-material/Create';
import BorderOuterIcon from '@mui/icons-material/BorderOuter';
import FontSizeSelector from './FontResizer';
import FontSelector from './FontSelector';
import ColorTheme from '../../themes/ColorTheme';

const useStyles = makeStyles(() => ({
  header: {
    height: 'auto',
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    overflowX: 'auto',
    overflowY: 'hidden',
    scrollbarWidth: 'none',
    justifyContent: 'flex-start',
    padding: '4px 8px',
    gap: '4px',
    maxWidth: '100%',
    backgroundColor: 'inherit',
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  },
  icons: {
    fontSize: '18px',
  },
  slider: {
    width: '80px',
    margin: '0 4px',
  },
  select: {
    minWidth: '80px',
    '& .MuiSelect-select': {
      padding: '4px 24px 4px 8px',
    },
  },
  iconButton: {
    padding: '4px',
    '&:hover': {
      opacity: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.04)',
    },
  },
  colorPicker: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: '8px',
  },
}));

export default React.memo(function Header({ selectedElement, nodes, setSelectedElement, setNodes }) {
  const classes = useStyles();
  const color = ColorTheme();
  const { iconColor } = color;

  const [highlight, setHighlight] = useState({
    bold: false,
    italic: false,
    decor: false,
  });
  const [styles, setStyles] = useState({
    backgroundColor: '',
    fontSize: 12,
    fontFamily: 'Inter',
    fontStyle: 'normal',
    textAlign: 'center',
    color: 'white',
    fontWeight: 500,
    textDecoration: 'none',
    borderColor: 'none',
    borderWidth: '2px',
    borderStyle: 'solid',
    opacity: 1,
    rotate: 0,
  });

  // Parse font size from string (e.g., '12px' to 12)
  const parseFontSize = useCallback((size) => {
    if (!size) return 12;
    return Number(size.replace('px', '')) || 12;
  }, []);

  // Sync styles and highlight state with selected element
  useEffect(() => {
    if (!selectedElement?.data?.style) return;

    const { style } = selectedElement.data;
    setStyles({
      backgroundColor: style.backgroundColor || '',
      fontSize: parseFontSize(style.fontSize),
      fontFamily: style.fontFamily || 'Inter',
      fontStyle: style.fontStyle || 'normal',
      textAlign: style.textAlign || 'center',
      color: style.color || 'white',
      fontWeight: style.fontWeight || 500,
      textDecoration: style.textDecoration || 'none',
      borderColor: style.borderColor || 'none',
      borderWidth: style.borderWidth || '2px',
      borderStyle: style.borderStyle || 'solid',
      opacity: style.opacity || 1,
      rotate: style.rotate || 0,
    });
    setHighlight({
      bold: style.fontWeight === 700,
      italic: style.fontStyle === 'italic',
      decor: style.textDecoration === 'underline',
    });
    console.log('Synced node styles:', style); // Debug: Verify initial styles
  }, [selectedElement, parseFontSize]);

  // Update font style (bold, italic, underline)
  const handleFontStyle = useCallback(
    (name) => {
      if (!selectedElement?.id) return;

      setNodes((prevNodes) => {
        const nodeIndex = prevNodes.findIndex((node) => node.id === selectedElement.id);
        if (nodeIndex === -1) return prevNodes;

        const updatedNodes = [...prevNodes];
        const node = {
          ...updatedNodes[nodeIndex],
          data: { ...updatedNodes[nodeIndex].data, style: { ...updatedNodes[nodeIndex].data.style } },
        };
        const { style } = node.data;

        const styleUpdates = {
          bold: { key: 'fontWeight', values: [700, 500] },
          italic: { key: 'fontStyle', values: ['italic', 'normal'] },
          underline: { key: 'textDecoration', values: ['underline', 'none'] },
        };

        const highlightKey = { bold: 'bold', italic: 'italic', underline: 'decor' };
        const { key, values } = styleUpdates[name];
        const currentHighlight = highlight[highlightKey[name]];
        style[key] = currentHighlight ? values[1] : values[0];

        setStyles((prev) => ({ ...prev, [key]: style[key] }));
        setHighlight((prev) => ({ ...prev, [highlightKey[name]]: !currentHighlight }));
        setSelectedElement(node);

        updatedNodes[nodeIndex] = node;
        console.log('Updated font style:', node.data.style); // Debug: Verify style update
        return updatedNodes;
      });
    },
    [selectedElement, highlight, setNodes, setSelectedElement]
  );

  // Handle font size input change
  const handleFontSizeChange = useCallback(
    (event) => {
      if (!selectedElement?.id) return;

      const newSize = parseInt(event.target.value, 10);
      if (isNaN(newSize)) return;

      setStyles((prev) => ({ ...prev, fontSize: newSize }));

      setNodes((prevNodes) => {
        const nodeIndex = prevNodes.findIndex((node) => node.id === selectedElement.id);
        if (nodeIndex === -1) return prevNodes;

        const updatedNodes = [...prevNodes];
        const node = {
          ...updatedNodes[nodeIndex],
          data: { ...updatedNodes[nodeIndex].data, style: { ...updatedNodes[nodeIndex].data.style } },
        };
        node.data.style.fontSize = `${newSize}px`;

        updatedNodes[nodeIndex] = node;
        setSelectedElement(node);
        console.log('Updated font size:', node.data.style); // Debug: Verify style update
        return updatedNodes;
      });
    },
    [selectedElement, setNodes, setSelectedElement]
  );

  // Increment/decrement font size
  const changeFontSize = useCallback(
    (action) => {
      if (!selectedElement?.id) return;

      setNodes((prevNodes) => {
        const nodeIndex = prevNodes.findIndex((node) => node.id === selectedElement.id);
        if (nodeIndex === -1) return prevNodes;

        const updatedNodes = [...prevNodes];
        const node = {
          ...updatedNodes[nodeIndex],
          data: { ...updatedNodes[nodeIndex].data, style: { ...updatedNodes[nodeIndex].data.style } },
        };
        const currentSize = parseFontSize(node.data.style.fontSize);
        let newSize = currentSize;

        if (action === 'inc') {
          newSize = Math.min(newSize + 2, 48);
        } else {
          newSize = Math.max(newSize - 2, 12);
        }

        node.data.style.fontSize = `${newSize}px`;
        setStyles((prev) => ({ ...prev, fontSize: newSize }));

        updatedNodes[nodeIndex] = node;
        setSelectedElement(node);
        console.log('Updated font size (inc/dec):', node.data.style); // Debug: Verify style update
        return updatedNodes;
      });
    },
    [selectedElement, parseFontSize, setNodes, setSelectedElement]
  );

  // Handle color, font, border style, and other style changes
  const handleChange = useCallback(
    (event, name) => {
      if (!selectedElement?.id) return;

      const value = event.target.value;
      setStyles((prev) => ({ ...prev, [name === 'font' ? 'fontFamily' : name]: value }));

      setNodes((prevNodes) => {
        const nodeIndex = prevNodes.findIndex((node) => node.id === selectedElement.id);
        if (nodeIndex === -1) return prevNodes;

        const updatedNodes = [...prevNodes];
        const node = {
          ...updatedNodes[nodeIndex],
          data: { ...updatedNodes[nodeIndex].data, style: { ...updatedNodes[nodeIndex].data.style } },
        };
        const { style } = node.data;

        if (name === 'font') {
          style.fontFamily = value;
        } else if (name === 'border') {
          style.borderColor = value;
        } else if (name === 'bgColor') {
          style.backgroundColor = value;
        } else if (name === 'borderStyle') {
          style.borderStyle = value;
        } else if (name === 'textAlign') {
          style.textAlign = value;
        } else {
          style.color = value;
        }

        updatedNodes[nodeIndex] = node;
        setSelectedElement(node);
        console.log(`Updated ${name}:`, node.data.style); // Debug: Verify style update
        return updatedNodes;
      });
    },
    [selectedElement, setNodes, setSelectedElement]
  );

  // Handle opacity change
  const handleOpacityChange = useCallback(
    (event, value) => {
      if (!selectedElement?.id) return;

      setStyles((prev) => ({ ...prev, opacity: value }));

      setNodes((prevNodes) => {
        const nodeIndex = prevNodes.findIndex((node) => node.id === selectedElement.id);
        if (nodeIndex === -1) return prevNodes;

        const updatedNodes = [...prevNodes];
        const node = {
          ...updatedNodes[nodeIndex],
          data: { ...updatedNodes[nodeIndex].data, style: { ...updatedNodes[nodeIndex].data.style } },
        };
        node.data.style.opacity = value;

        updatedNodes[nodeIndex] = node;
        setSelectedElement(node);
        console.log('Updated opacity:', node.data.style); // Debug: Verify style update
        return updatedNodes;
      });
    },
    [selectedElement, setNodes, setSelectedElement]
  );

  // Handle node rotation
  const handleRotate = useCallback(
    (direction) => {
      if (!selectedElement?.id) return;

      setNodes((prevNodes) => {
        const nodeIndex = prevNodes.findIndex((node) => node.id === selectedElement.id);
        if (nodeIndex === -1) return prevNodes;

        const updatedNodes = [...prevNodes];
        const node = {
          ...updatedNodes[nodeIndex],
          data: { ...updatedNodes[nodeIndex].data, style: { ...updatedNodes[nodeIndex].data.style } },
        };
        const currentRotate = node.data.style.rotate || 0;
        const newRotate = direction === 'left' ? currentRotate - 90 : currentRotate + 90;

        node.data.style.rotate = newRotate;
        setStyles((prev) => ({ ...prev, rotate: newRotate }));

        updatedNodes[nodeIndex] = node;
        setSelectedElement(node);
        console.log('Updated rotation:', node.data.style); // Debug: Verify style update
        return updatedNodes;
      });
    },
    [selectedElement, setNodes, setSelectedElement]
  );

  // Reset all styles to default
  const handleResetStyles = useCallback(() => {
    if (!selectedElement?.id) return;

    const defaultStyles = {
      backgroundColor: '',
      fontSize: '12px',
      fontFamily: 'Inter',
      fontStyle: 'normal',
      textAlign: 'center',
      color: 'white',
      fontWeight: 500,
      textDecoration: 'none',
      borderColor: 'none',
      borderWidth: '2px',
      borderStyle: 'solid',
      opacity: 1,
      rotate: 0,
    };

    setStyles({
      backgroundColor: '',
      fontSize: 12,
      fontFamily: 'Inter',
      fontStyle: 'normal',
      textAlign: 'center',
      color: 'white',
      fontWeight: 500,
      textDecoration: 'none',
      borderColor: 'none',
      borderWidth: '2px',
      borderStyle: 'solid',
      opacity: 1,
      rotate: 0,
    });
    setHighlight({
      bold: false,
      italic: false,
      decor: false,
    });

    setNodes((prevNodes) => {
      const nodeIndex = prevNodes.findIndex((node) => node.id === selectedElement.id);
      if (nodeIndex === -1) return prevNodes;

      const updatedNodes = [...prevNodes];
      const node = {
        ...updatedNodes[nodeIndex],
        data: { ...updatedNodes[nodeIndex].data, style: { ...defaultStyles } },
      };

      updatedNodes[nodeIndex] = node;
      setSelectedElement(node);
      console.log('Reset styles:', node.data.style); // Debug: Verify style reset
      return updatedNodes;
    });
  }, [selectedElement, setNodes, setSelectedElement]);

  // Handle drag start for drag-and-drop
  const handleDragStart = useCallback((event, item) => {
    event.dataTransfer.setData('application/group', JSON.stringify(item?.title));
    event.dataTransfer.effectAllowed = 'move';
  }, []);

  return (
    <Box className={classes.header} sx={{ background: color?.canvasBG }}>
      {/* Font Controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <FontSizeSelector
          fontSize={styles.fontSize}
          handleFontSizeChange={handleFontSizeChange}
          changeFontSize={changeFontSize}
        />
        <FontSelector font={styles.fontFamily} handleChange={handleChange} />
        <Tooltip title="Bold">
          <IconButton
            size="small"
            onClick={() => handleFontStyle('bold')}
            className={classes.iconButton}
          >
            <FormatBoldIcon
              sx={{
                fontSize: '18px',
                backgroundColor: highlight.bold ? '#5fc9f3' : 'transparent',
                border: highlight.bold ? '1px solid #2772db' : 'none',
                padding: '2px',
                color: highlight.bold ? 'black' : iconColor,
                fontWeight: highlight.bold ? 700 : 500,
              }}
            />
          </IconButton>
        </Tooltip>
        <Tooltip title="Italic">
          <IconButton
            size="small"
            onClick={() => handleFontStyle('italic')}
            className={classes.iconButton}
          >
            <FormatItalicIcon
              sx={{
                fontSize: '18px',
                backgroundColor: highlight.italic ? '#5fc9f3' : 'transparent',
                border: highlight.italic ? '1px solid #2772db' : 'none',
                padding: '2px',
                color: highlight.italic ? 'black' : iconColor,
                fontWeight: highlight.italic ? 700 : 500,
              }}
            />
          </IconButton>
        </Tooltip>
        <Tooltip title="Underline">
          <IconButton
            size="small"
            onClick={() => handleFontStyle('underline')}
            className={classes.iconButton}
          >
            <FormatUnderlinedIcon
              sx={{
                fontSize: '18px',
                backgroundColor: highlight.decor ? '#5fc9f3' : 'transparent',
                border: highlight.decor ? '1px solid #2772db' : 'none',
                padding: '2px',
                color: highlight.decor ? 'black' : iconColor,
                fontWeight: highlight.decor ? 700 : 500,
              }}
            />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Alignment Controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
        <Tooltip title="Align Left">
          <IconButton
            size="small"
            onClick={() => handleChange({ target: { value: 'left' } }, 'textAlign')}
            className={classes.iconButton}
          >
            <FormatAlignLeftIcon
              sx={{
                fontSize: '18px',
                backgroundColor: styles.textAlign === 'left' ? '#5fc9f3' : 'transparent',
                border: styles.textAlign === 'left' ? '1px solid #2772db' : 'none',
                padding: '2px',
                color: styles.textAlign === 'left' ? 'black' : iconColor,
              }}
            />
          </IconButton>
        </Tooltip>
        <Tooltip title="Align Center">
          <IconButton
            size="small"
            onClick={() => handleChange({ target: { value: 'center' } }, 'textAlign')}
            className={classes.iconButton}
          >
            <FormatAlignCenterIcon
              sx={{
                fontSize: '18px',
                backgroundColor: styles.textAlign === 'center' ? '#5fc9f3' : 'transparent',
                border: styles.textAlign === 'center' ? '1px solid #2772db' : 'none',
                padding: '2px',
                color: styles.textAlign === 'center' ? 'black' : iconColor,
              }}
            />
          </IconButton>
        </Tooltip>
        <Tooltip title="Align Right">
          <IconButton
            size="small"
            onClick={() => handleChange({ target: { value: 'right' } }, 'textAlign')}
            className={classes.iconButton}
          >
            <FormatAlignRightIcon
              sx={{
                fontSize: '18px',
                backgroundColor: styles.textAlign === 'right' ? '#5fc9f3' : 'transparent',
                border: styles.textAlign === 'right' ? '1px solid #2772db' : 'none',
                padding: '2px',
                color: styles.textAlign === 'right' ? 'black' : iconColor,
              }}
            />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Border Controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <FormControl className={classes.select} size="small">
          <InputLabel>Border</InputLabel>
          <Select
            value={styles.borderStyle}
            onChange={(e) => handleChange(e, 'borderStyle')}
            label="Border"
          >
            <MenuItem value="solid">Solid</MenuItem>
            <MenuItem value="dashed">Dashed</MenuItem>
            <MenuItem value="dotted">Dotted</MenuItem>
            <MenuItem value="none">None</MenuItem>
          </Select>
        </FormControl>
        <Tooltip title="Border Color">
          <label className={classes.colorPicker} htmlFor="border">
            <BorderOuterIcon className={classes.icons} sx={{ color: iconColor }} />
            <span
              style={{
                height: '4px',
                width: '1rem',
                backgroundColor: styles.borderColor || 'transparent',
                border: '0.5px solid black',
              }}
            />
            <input
              type="color"
              id="border"
              style={{ visibility: 'hidden', width: '0px' }}
              onChange={(e) => handleChange(e, 'border')}
            />
          </label>
        </Tooltip>
      </Box>

      {/* Color Controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Tooltip title="Text Color">
          <label className={classes.colorPicker} htmlFor="color">
            <CreateIcon sx={{ fontSize: '18px', color: iconColor }} />
            <span
              style={{
                height: '4px',
                width: '1rem',
                backgroundColor: styles.color || 'white',
                border: '0.5px solid black',
              }}
            />
            <input
              type="color"
              id="color"
              style={{ visibility: 'hidden', width: '0px' }}
              onChange={(e) => handleChange(e, 'color')}
            />
          </label>
        </Tooltip>
        <Tooltip title="Background Color">
          <label className={classes.colorPicker} htmlFor="bgColor">
            <BrushBig size="18" color={iconColor} />
            <span
              style={{
                height: '4px',
                width: '1rem',
                backgroundColor: styles.backgroundColor || 'transparent',
                border: '0.5px solid black',
              }}
            />
            <input
              type="color"
              id="bgColor"
              style={{ visibility: 'hidden', width: '0px' }}
              onChange={(e) => handleChange(e, 'bgColor')}
            />
          </label>
        </Tooltip>
      </Box>

      {/* Transform Controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Tooltip title="Opacity">
          <Box sx={{ display: 'flex', alignItems: 'center', width: '80px' }}>
            <Slider
              value={styles.opacity}
              onChange={handleOpacityChange}
              min={0}
              max={1}
              step={0.1}
              className={classes.slider}
              sx={{ color: iconColor }}
            />
          </Box>
        </Tooltip>
        <Tooltip title="Rotate Left">
          <IconButton
            size="small"
            onClick={() => handleRotate('left')}
            className={classes.iconButton}
          >
            <RotateLeftIcon sx={{ fontSize: '18px', color: iconColor }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Rotate Right">
          <IconButton
            size="small"
            onClick={() => handleRotate('right')}
            className={classes.iconButton}
          >
            <RotateRightIcon sx={{ fontSize: '18px', color: iconColor }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Reset Control */}
      <Tooltip title="Reset Styles">
        <IconButton
          size="small"
          onClick={handleResetStyles}
          className={classes.iconButton}
        >
          <RefreshIcon sx={{ fontSize: '18px', color: iconColor }} />
        </IconButton>
      </Tooltip>

      {/* Placeholder for Future Shape Control */}
      <Tooltip title="Shape (Not Implemented)">
        <FormatShapesIcon
          className={classes.icons}
          sx={{ color: iconColor, opacity: 0.5 }}
        />
      </Tooltip>
    </Box>
  );
});