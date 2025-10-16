/* eslint-disable */
import { makeStyles } from '@mui/styles';
import { Box, Tooltip, Button, Slider, Popover } from '@mui/material';
import React, { useEffect, useState, useCallback } from 'react';
import { BrushBig } from 'iconsax-react';
import FontSizeSelector from './FontResizer';
import FontSelector from './FontSelector';
import CreateIcon from '@mui/icons-material/Create';
import ColorTheme from '../../themes/ColorTheme';
import BorderOuterIcon from '@mui/icons-material/BorderOuter';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import LineStyleIcon from '@mui/icons-material/LineStyle';
import LineWeightIcon from '@mui/icons-material/LineWeight';
import OpacityIcon from '@mui/icons-material/Opacity';
import { useDispatch } from 'react-redux';
import { closeHeader } from '../../store/slices/CanvasSlice';
import BorderWidthSelector from './BorderWidthSelector';
import { SketchPicker } from 'react-color';

const useStyles = makeStyles(() => ({
  header: {
    height: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
    flexWrap: 'wrap',
    overflowX: 'auto',
    scrollbarWidth: 'none',
    justifyContent: 'flex-start'
  },
  styleGroup: {
    display: 'flex',
    gap: '4px',
    padding: '4px',
    border: '1px solid #ddd',
    borderRadius: '4px'
  },
  colorGroup: {
    display: 'flex',
    gap: '12px',
    padding: '4px',
    border: '1px solid #ddd',
    borderRadius: '4px'
  },
  borderGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px',
    border: '1px solid #ddd',
    borderRadius: '4px'
  },
  opacityGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    width: '110px'
  },
  icon: {
    fontSize: '24px',
    marginRight: '6px',
    padding: '2px',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  colorPickerContainer: {
    position: 'relative',
    display: 'inline-block'
  },
  colorPreview: {
    width: '26px',
    height: '26px',
    borderRadius: '4px',
    border: '2px solid #ddd',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  popover: {
    position: 'absolute',
    zIndex: 2,
    top: '100%',
    left: 0,
    marginTop: '8px'
  },
  cover: {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  }
}));

export default function Header({ selectedElement, setSelectedElement, setNodes }) {
  const color = ColorTheme();
  const classes = useStyles();
  const { iconColor } = color;
  const [highlight, setHighlight] = useState({
    bold: false,
    italic: false,
    decor: false,
    alignLeft: false,
    alignCenter: true,
    alignRight: false,
    boxShadow: false
  });
  const [styles, setStyles] = useState({
    backgroundColor: '',
    fontSize: 12,
    fontFamily: '',
    fontStyle: '',
    textAlign: 'center',
    color: '',
    fontWeight: 0,
    textDecoration: '',
    borderColor: '',
    borderWidth: '2px',
    borderStyle: 'solid',
    opacity: 1,
    boxShadow: ''
  });

  // Color picker states
  const [colorPicker, setColorPicker] = useState({
    open: false,
    type: null, // 'text', 'background', 'border'
    anchorEl: null
  });

  const number = useCallback((size) => {
    if (!size) return 12;
    return parseInt(size, 10);
  }, []);

  // console.log('styles', styles);
  useEffect(() => {
    if (selectedElement?.data?.style) {
      setStyles({
        backgroundColor: selectedElement.data.style.backgroundColor || '',
        fontSize: number(selectedElement.data.style.fontSize) || 12,
        fontFamily: selectedElement.data.style.fontFamily || 'Inter',
        fontStyle: selectedElement.data.style.fontStyle || 'normal',
        textAlign: selectedElement.data.style.textAlign || 'center',
        color: selectedElement.data.style.color || '#000000',
        fontWeight: parseInt(selectedElement.data.style.fontWeight, 10) || 500,
        textDecoration: selectedElement.data.style.textDecoration || 'none',
        borderColor: selectedElement.data.style.borderColor || 'none',
        borderWidth: selectedElement.data.style.borderWidth || '2px',
        borderStyle: selectedElement.data.style.borderStyle || 'solid',
        opacity: selectedElement.data.style.opacity || 1,
        boxShadow: selectedElement.data.style.boxShadow || ''
      });
      setHighlight({
        bold: parseInt(selectedElement.data.style.fontWeight, 10) === 700,
        italic: selectedElement.data.style.fontStyle === 'italic',
        decor: selectedElement.data.style.textDecoration === 'underline',
        alignLeft: selectedElement.data.style.textAlign === 'left',
        alignCenter: selectedElement.data.style.textAlign === 'center',
        alignRight: selectedElement.data.style.textAlign === 'right',
        boxShadow: !!selectedElement.data.style.boxShadow
      });
    }
  }, [selectedElement, number]);

  // Color picker handlers
  const handleColorPickerOpen = (event, type) => {
    event.stopPropagation();
    setColorPicker({
      open: true,
      type,
      anchorEl: event.currentTarget
    });
  };

  const handleColorPickerClose = () => {
    setColorPicker({
      open: false,
      type: null,
      anchorEl: null
    });
  };

  const handleColorChange = (color, type) => {
    if (!selectedElement?.id) return;

    const colorValue = color.hex;

    setNodes((prevNodes) =>
      prevNodes.map((node) => {
        if (node.id !== selectedElement.id) return node;
        const style = { ...node.data.style };

        if (type === 'text') {
          style.color = colorValue;
        } else if (type === 'background') {
          style.backgroundColor = colorValue;
        } else if (type === 'border') {
          style.borderColor = colorValue;
        }

        return { ...node, data: { ...node.data, style } };
      })
    );

    setStyles((prev) => ({
      ...prev,
      [type === 'text' ? 'color' : type === 'background' ? 'backgroundColor' : 'borderColor']: colorValue
    }));

    setSelectedElement((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        style: {
          ...prev.data.style,
          [type === 'text' ? 'color' : type === 'background' ? 'backgroundColor' : 'borderColor']: colorValue
        }
      }
    }));
  };

  const handleFontStyle = (e, name) => {
    e.stopPropagation();
    if (!selectedElement?.id) return;
    const highlightKey = {
      bold: 'bold',
      italic: 'italic',
      underline: 'decor',
      alignLeft: 'alignLeft',
      alignCenter: 'alignCenter',
      alignRight: 'alignRight',
      boxShadow: 'boxShadow'
    };

    setNodes((prevNodes) =>
      prevNodes.map((node) => {
        if (node.id !== selectedElement.id) return node;
        const style = { ...node.data.style };
        const styleUpdates = {
          bold: { key: 'fontWeight', values: [700, 500] },
          italic: { key: 'fontStyle', values: ['italic', 'normal'] },
          underline: { key: 'textDecoration', values: ['underline', 'none'] },
          alignLeft: { key: 'textAlign', value: 'left' },
          alignCenter: { key: 'textAlign', value: 'center' },
          alignRight: { key: 'textAlign', value: 'right' },
          boxShadow: { key: 'boxShadow', values: ['0 2px 4px rgba(0,0,0,0.2)', ''] }
        };
        const currentHighlight = highlight[highlightKey[name]];
        if (styleUpdates[name]) {
          const update = styleUpdates[name];
          if (update.value) {
            style[update.key] = update.value;
            setHighlight((prev) => ({
              ...prev,
              alignLeft: name === 'alignLeft',
              alignCenter: name === 'alignCenter',
              alignRight: name === 'alignRight'
            }));
          } else {
            style[update.key] = currentHighlight ? update.values[1] : update.values[0];
            setHighlight((prev) => ({ ...prev, [highlightKey[name]]: !currentHighlight }));
          }
          setStyles((prev) => ({ ...prev, [update.key]: style[update.key] }));
        }

        return {
          ...node,
          data: { ...node.data, style }
        };
      })
    );

    setSelectedElement((prev) => {
      const styleUpdates = {
        bold: { key: 'fontWeight', values: [700, 500] },
        italic: { key: 'fontStyle', values: ['italic', 'normal'] },
        underline: { key: 'textDecoration', values: ['underline', 'none'] },
        alignLeft: { key: 'textAlign', value: 'left' },
        alignCenter: { key: 'textAlign', value: 'center' },
        alignRight: { key: 'textAlign', value: 'right' },
        boxShadow: { key: 'boxShadow', values: ['0 2px 4px rgba(0,0,0,0.2)', ''] }
      };
      const update = styleUpdates[name];
      const newStyle = { ...prev.data.style };
      if (update.value) {
        newStyle[update.key] = update.value;
      } else {
        newStyle[update.key] = highlight[highlightKey[name]] ? update.values[1] : update.values[0];
      }
      return {
        ...prev,
        data: { ...prev.data, style: newStyle }
      };
    });
  };

  const handleFontSizeChange = (e) => {
    e.stopPropagation();
    const newFontSize = e.target.value.replace('px', '');

    if (!selectedElement?.id) return;

    setNodes((prevNodes) =>
      prevNodes.map((node) => {
        if (node.id !== selectedElement.id) return node;
        return {
          ...node,
          data: {
            ...node.data,
            style: {
              ...node.data.style,
              fontSize: `${newFontSize}px`
            }
          }
        };
      })
    );

    setStyles((prev) => ({ ...prev, fontSize: newFontSize }));
    setSelectedElement((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        style: {
          ...prev.data.style,
          fontSize: `${newFontSize}px`
        }
      }
    }));
  };

  const changeFontSize = (e, name) => {
    e.stopPropagation();
    if (!selectedElement?.id) return;

    const currentFontSize = styles.fontSize || 16;
    const newFontSize = name === 'inc' ? Math.min(currentFontSize + 2, 48) : Math.max(currentFontSize - 2, 12);

    setNodes((prevNodes) =>
      prevNodes.map((node) => {
        if (node.id !== selectedElement.id) return node;
        return {
          ...node,
          data: { ...node.data, style: { ...node.data.style, fontSize: `${newFontSize}px` } }
        };
      })
    );
    setStyles((prev) => ({ ...prev, fontSize: newFontSize }));
    setSelectedElement((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        style: { ...prev.data.style, fontSize: `${newFontSize}px` }
      }
    }));
  };

  const handleBorderWidthChange = (e) => {
    e.stopPropagation();
    const newWidth = e.target.value.replace('px', '');
    if (!selectedElement?.id) return;
    setNodes((prevNodes) =>
      prevNodes.map((node) => {
        if (node.id !== selectedElement.id) return node;
        return {
          ...node,
          data: {
            ...node.data,
            style: {
              ...node.data.style,
              borderWidth: `${newWidth}px`
            }
          }
        };
      })
    );

    setStyles((prev) => ({ ...prev, borderWidth: `${newWidth}px` }));
    setSelectedElement((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        style: {
          ...prev.data.style,
          borderWidth: `${newWidth}px`
        }
      }
    }));
  };

  const changeBorderWidth = (name) => {
    if (!selectedElement?.id) return;

    const currentWidth = number(styles.borderWidth) || 2;
    const newWidth = name === 'inc' ? Math.min(currentWidth + 1, 6) : Math.max(currentWidth - 1, 0);

    setNodes((prevNodes) =>
      prevNodes.map((node) => {
        if (node.id !== selectedElement.id) return node;
        return {
          ...node,
          data: { ...node.data, style: { ...node.data.style, borderWidth: `${newWidth}px` } }
        };
      })
    );

    setStyles((prev) => ({ ...prev, borderWidth: `${newWidth}px` }));

    setSelectedElement((prev) => ({
      ...prev,
      data: { ...prev.data, style: { ...prev.data.style, borderWidth: `${newWidth}px` } }
    }));
  };

  const handleBorderStyle = (e, borderStyle) => {
    e.stopPropagation();
    if (!selectedElement?.id) return;

    setNodes((prevNodes) =>
      prevNodes.map((node) => {
        if (node.id !== selectedElement.id) return node;
        return {
          ...node,
          data: { ...node.data, style: { ...node.data.style, borderStyle } }
        };
      })
    );
    setStyles((prev) => ({ ...prev, borderStyle }));
    setSelectedElement((prev) => ({
      ...prev,
      data: { ...prev.data, style: { ...prev.data.style, borderStyle } }
    }));
  };

  const handleOpacityChange = (event, newValue) => {
    if (!selectedElement?.id) return;

    setNodes((prevNodes) =>
      prevNodes.map((node) => {
        if (node.id !== selectedElement.id) return node;
        return {
          ...node,
          data: { ...node.data, style: { ...node.data.style, opacity: newValue } }
        };
      })
    );
    setStyles((prev) => ({ ...prev, opacity: newValue }));
    setSelectedElement((prev) => ({
      ...prev,
      data: { ...prev.data, style: { ...prev.data.style, opacity: newValue } }
    }));
  };

  const handleChange = (event, name) => {
    event.stopPropagation();
    if (!selectedElement?.id) return;

    setNodes((prevNodes) =>
      prevNodes.map((node) => {
        if (node.id !== selectedElement.id) return node;
        const style = { ...node.data.style };
        if (name === 'font') {
          style.fontFamily = event.target.value;
        }
        return { ...node, data: { ...node.data, style } };
      })
    );
    setStyles((prev) => ({
      ...prev,
      [name === 'font' ? 'fontFamily' : 'color']: event.target.value
    }));
    setSelectedElement((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        style: {
          ...prev.data.style,
          [name === 'font' ? 'fontFamily' : 'color']: event.target.value
        }
      }
    }));
  };

  const handleInputClick = (e) => e.stopPropagation();

  return (
    <Box className={classes.header} sx={{ background: color?.canvasBG }}>
      {/* Font Size Selector */}
      <FontSizeSelector fontSize={styles?.fontSize} handleFontSizeChange={handleFontSizeChange} changeFontSize={changeFontSize} />

      {/* Font Family Selector */}
      <Box mx={1}>
        <FontSelector font={styles?.fontFamily} handleChange={handleChange} handleInputClick={handleInputClick} />
      </Box>
      {/* Text Style Buttons Group */}
      <Box className={classes.styleGroup} sx={{ mr: 1 }}>
        <Tooltip title="Bold">
          <FormatBoldIcon
            onClick={(e) => handleFontStyle(e, 'bold')}
            className={classes.icon}
            sx={{
              backgroundColor: highlight?.bold ? '#5fc9f3' : 'transparent',
              color: highlight?.bold ? 'black' : iconColor,
              fontWeight: highlight?.bold ? 700 : 500
            }}
          />
        </Tooltip>
        <Tooltip title="Italic">
          <FormatItalicIcon
            onClick={(e) => handleFontStyle(e, 'italic')}
            className={classes.icon}
            sx={{
              backgroundColor: highlight?.italic ? '#5fc9f3' : 'transparent',
              color: highlight?.italic ? 'black' : iconColor,
              fontWeight: highlight?.italic ? 700 : 500
            }}
          />
        </Tooltip>
        <Tooltip title="Underline">
          <FormatUnderlinedIcon
            onClick={(e) => handleFontStyle(e, 'underline')}
            className={classes.icon}
            sx={{
              backgroundColor: highlight?.decor ? '#5fc9f3' : 'transparent',
              color: highlight?.decor ? 'black' : iconColor,
              fontWeight: highlight?.decor ? 700 : 500
            }}
          />
        </Tooltip>
      </Box>

      {/* Text Alignment Group */}
      <Box className={classes.styleGroup} mx={1}>
        <Tooltip title="Align Left">
          <FormatAlignLeftIcon
            onClick={(e) => handleFontStyle(e, 'alignLeft')}
            className={classes.icon}
            sx={{
              backgroundColor: highlight?.alignLeft ? '#5fc9f3' : 'transparent',
              color: highlight?.alignLeft ? 'black' : iconColor
            }}
          />
        </Tooltip>
        <Tooltip title="Align Center">
          <FormatAlignCenterIcon
            onClick={(e) => handleFontStyle(e, 'alignCenter')}
            className={classes.icon}
            sx={{
              backgroundColor: highlight?.alignCenter ? '#5fc9f3' : 'transparent',
              color: highlight?.alignCenter ? 'black' : iconColor
            }}
          />
        </Tooltip>
        <Tooltip title="Align Right">
          <FormatAlignRightIcon
            onClick={(e) => handleFontStyle(e, 'alignRight')}
            className={classes.icon}
            sx={{
              backgroundColor: highlight?.alignRight ? '#5fc9f3' : 'transparent',
              color: highlight?.alignRight ? 'black' : iconColor
            }}
          />
        </Tooltip>
      </Box>

      {/* Color Pickers Group */}
      <Box className={classes.colorGroup}>
        {/* Text Color Picker */}
        <Tooltip title="Text Color">
          <div className={classes.colorPickerContainer}>
            <div
              className={classes.colorPreview}
              style={{ borderColor: styles.color || '#000' }}
              onClick={(e) => handleColorPickerOpen(e, 'text')}
            >
              <CreateIcon
                sx={{
                  color: iconColor,
                  fontSize: '20px'
                }}
              />
            </div>
            <Popover
              open={colorPicker.open && colorPicker.type === 'text'}
              anchorEl={colorPicker.anchorEl}
              onClose={handleColorPickerClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left'
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left'
              }}
            >
              <SketchPicker color={styles.color || '#000000'} onChange={(color) => handleColorChange(color, 'text')} />
            </Popover>
          </div>
        </Tooltip>

        {/* Background Color Picker */}
        <Tooltip title="Background Color">
          <div className={classes.colorPickerContainer}>
            <div
              className={classes.colorPreview}
              style={{ borderColor: styles.backgroundColor || '#000' }}
              onClick={(e) => handleColorPickerOpen(e, 'background')}
            >
              <BrushBig
                style={{
                  color: iconColor,
                  width: '18px',
                  height: '18px'
                }}
              />
            </div>
            <Popover
              open={colorPicker.open && colorPicker.type === 'background'}
              anchorEl={colorPicker.anchorEl}
              onClose={handleColorPickerClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left'
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left'
              }}
            >
              <SketchPicker color={styles.backgroundColor || '#000000'} onChange={(color) => handleColorChange(color, 'background')} />
            </Popover>
          </div>
        </Tooltip>

        {/* Border Color Picker */}
        <Tooltip title="Border Color">
          <div className={classes.colorPickerContainer}>
            <div
              className={classes.colorPreview}
              style={{ borderColor: styles.borderColor || '#000' }}
              onClick={(e) => handleColorPickerOpen(e, 'border')}
            >
              <BorderOuterIcon
                sx={{
                  color: iconColor,
                  fontSize: '20px'
                }}
              />
            </div>
            <Popover
              open={colorPicker.open && colorPicker.type === 'border'}
              anchorEl={colorPicker.anchorEl}
              onClose={handleColorPickerClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left'
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left'
              }}
            >
              <SketchPicker color={styles.borderColor || '#000000'} onChange={(color) => handleColorChange(color, 'border')} />
            </Popover>
          </div>
        </Tooltip>
      </Box>

      {/* Border Style and Width Group */}
      <Box className={classes.borderGroup}>
        <Tooltip title="Border Style">
          <Box sx={{ display: 'flex', gap: '4px' }}>
            <LineStyleIcon
              className={classes.icon}
              sx={{ color: styles.borderStyle === 'solid' ? '#5fc9f3' : iconColor }}
              onClick={(e) => handleBorderStyle(e, 'solid')}
            />
            <LineStyleIcon
              className={classes.icon}
              sx={{ color: styles.borderStyle === 'dashed' ? '#5fc9f3' : iconColor, transform: 'rotate(90deg)' }}
              onClick={(e) => handleBorderStyle(e, 'dashed')}
            />
            <LineStyleIcon
              className={classes.icon}
              sx={{ color: styles.borderStyle === 'dotted' ? '#5fc9f3' : iconColor, transform: 'rotate(45deg)' }}
              onClick={(e) => handleBorderStyle(e, 'dotted')}
            />
          </Box>
        </Tooltip>
        <Tooltip title="Border Width">
          <BorderWidthSelector
            borderWidth={number(styles.borderWidth)}
            handleBorderWidthChange={handleBorderWidthChange}
            changeBorderWidth={changeBorderWidth}
          />
        </Tooltip>
      </Box>

      {/* Opacity Slider */}
      <Box className={classes.opacityGroup}>
        <Tooltip title="Opacity">
          <OpacityIcon className={classes.icon} sx={{ color: iconColor }} />
        </Tooltip>
        <Slider value={styles.opacity} onChange={handleOpacityChange} min={0} max={1} step={0.1} sx={{ width: '80px' }} />
      </Box>
    </Box>
  );
}
