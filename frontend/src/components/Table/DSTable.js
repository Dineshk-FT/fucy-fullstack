/*eslint-disable*/
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useStore from '../../store/Zustand/store';
import { shallow } from 'zustand/shallow';
import Joyride from 'react-joyride';
import CircleIcon from '@mui/icons-material/Circle';
import { tableCellClasses } from '@mui/material/TableCell';
import {
  Button,
  Checkbox,
  FormControl,
  MenuItem,
  Select,
  TextField,
  Typography,
  styled,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tooltip,
  InputLabel,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

import EditIcon from '@mui/icons-material/Edit';
import { tooltipClasses } from '@mui/material/Tooltip';
import SelectLosses from '../Modal/SelectLosses';
import { Box } from '@mui/system';
import ColorTheme from '../../themes/ColorTheme';
import toast, { Toaster } from 'react-hot-toast';
import { colorPicker, colorPickerTab, DSTableHeader, options, stakeHeader } from './constraints';
import DeleteIcon from '@mui/icons-material/Delete';
import { tableHeight } from '../../themes/constant';
import FormPopper from '../Poppers/FormPopper';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import ControlPointIcon from '@mui/icons-material/ControlPoint';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { DsSteps } from '../../utils/Steps';

const selector = (state) => ({
  model: state.model,
  update: state.updateDamageScenario,
  updateDerived: state.updateDerivedDamageScenario,
  updateImpact: state.updateImpact,
  getThreatScenario: state.getThreatScenario,
  getDamageScenarios: state.getDamageScenarios,
  getRiskTreatment: state.getRiskTreatment,
  damageScenarios: state.damageScenarios['subs'][1],
  Details: state.damageScenarios['subs'][0]['Details'],
  damageID: state.damageScenarios['subs'][1]['_id'],
  deleteDamageScenario: state.deleteDamageScenario,
  updateName: state.updateName$DescriptionforDamage,
  addScene: state.addDamageScene
});

const label = { inputProps: { 'aria-label': 'Checkbox demo' } };

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
    borderRight: '1px solid rgba(224, 224, 224, 1) !important',
    fontSize: 13,
    padding: '2px 8px',
    textAlign: 'center'
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 13,
    borderRight: '1px solid rgba(224, 224, 224, 1) !important',
    padding: '2px 8px',
    // textAlign: 'center',
    verticalAlign: 'middle',
    '& .MuiTableCell-root': {
      transition: 'width 0.2s ease'
    }
  }
}));

const StyledTableRow = styled(TableRow)(() => ({
  '&:last-child td, &:last-child th': {
    border: 0
  },
  height: '3.5em' // Fixed row height
}));

const HtmlTooltip = styled(({ className, ...props }) => <Tooltip {...props} classes={{ popper: className }} />)(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#f5f5f9',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 220,
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #dadde9'
  }
}));

const renderMenuItem = (option, name) => (
  <MenuItem key={option?.value} value={option?.value}>
    <HtmlTooltip
      placement="left"
      title={
        <Typography
          sx={{
            fontSize: '14px',
            fontWeight: 600,
            padding: '8px',
            borderRadius: '4px'
          }}
        >
          {option?.description[name]}
        </Typography>
      }
    >
      {option?.label}
    </HtmlTooltip>
  </MenuItem>
);

const SelectableCell = ({ id, row, item, options, handleChange, colorPickerTab, impact, name, columnWidths }) => {
  const [open, setOpen] = useState(false);
  const selectRef = useRef(null);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!open) {
      setOpen(true);
    }
  };

  return (
    <StyledTableCell
      id="select-impacts"
      component="th"
      scope="row"
      onClick={handleClick}
      sx={{ background: `${colorPickerTab(impact)} !important` }}
    >
      <FormControl
        sx={{
          width: columnWidths[item?.id] ?? 'auto',
          background: 'transparent',
          '& .MuiInputBase-root': {
            backgroundColor: 'transparent'
          },
          '& .MuiSelect-select': {
            backgroundColor: 'transparent',
            padding: '0 24px 0 8px', // Remove vertical padding to fit within cell
            fontSize: '13px', // Match font size with other cells
            lineHeight: '1.5em', // Match line height
            height: '1.5em', // Ensure the select fits within one line
            display: 'flex',
            alignItems: 'center' // Center the content vertically
          },
          '& .MuiSvgIcon-root': {
            display: 'none'
          },
          '& .MuiOutlinedInput-notchedOutline': {
            border: 'none'
          }
        }}
      >
        {!impact && (
          <InputLabel sx={{ width: columnWidths[item?.id] ?? 'auto', top: -16 }} id="demo-simple-select-label" shrink={false}>
            Select Impacts
          </InputLabel>
        )}
        <Select
          ref={selectRef}
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          name={name}
          value={impact}
          onChange={(e) => handleChange(e, row)}
          open={open}
          onClose={() => setOpen(false)}
        >
          {options?.map((option) => renderMenuItem(option, name))}
        </Select>
      </FormControl>
    </StyledTableCell>
  );
};

const notify = (message, status) => toast[status](message);

export default function DsTable() {
  const color = ColorTheme();
  const {
    model,
    update,
    damageScenarios,
    Details,
    damageID,
    getDamageScenarios,
    getThreatScenario,
    getRiskTreatment,
    updateImpact,
    deleteDamageScenario,
    updateDerived,
    updateName,
    addScene
  } = useStore(selector, shallow);

  const [stakeHolder] = useState(false);
  const [openCl, setOpenCl] = useState(false);
  const [rows, setRows] = useState([]);
  const [selectedRow, setSelectedRow] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filtered, setFiltered] = useState([]);
  const [details, setDetails] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [selectedRows, setSelectedRows] = useState([]);
  const [openFilter, setOpenFilter] = useState(false);
  const [isAddingNewRow, setIsAddingNewRow] = useState(false);
  const [newRowData, setNewRowData] = useState({
    Name: '',
    'Description/Scalability': ''
  });
  const [runTour, setRunTour] = useState(false);
  const handleJoyrideCallback = (data) => {
    const { status } = data;
    if (['finished', 'skipped'].includes(status)) {
      setRunTour(false);
    }
  };
  // console.log('details', details);
  const visibleColumns = useStore((state) => state.dmgScenTblClms);
  const toggleColumnVisibility = useStore((state) => state.toggleColumnVisibility);

  const handleOpenFilter = () => setOpenFilter(true);
  const handleCloseFilter = () => setOpenFilter(false);

  const handleAddNewRow = () => {
    setIsAddingNewRow(true);
    setNewRowData({
      Name: '',
      'Description/Scalability': ''
    });
  };

  const Head = useMemo(() => {
    if (stakeHolder) {
      return stakeHeader;
    } else {
      return DSTableHeader.filter((header) => visibleColumns.includes(header.name));
    }
  }, [visibleColumns]);

  const [columnWidths, setColumnWidths] = useState(Object.fromEntries(DSTableHeader.map((col) => [col.id, col.w])));

  const handleResizeStart = (e, columnId) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = columnWidths[columnId];

    const handleMouseMove = (event) => {
      const newWidth = Math.max(startWidth + (event.clientX - startX), DSTableHeader.find((col) => col.id === columnId)?.minW || 50);
      setColumnWidths((prev) => ({ ...prev, [columnId]: newWidth }));
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleChecked = (value, item, rowId) => {
    setFiltered((prevFiltered) =>
      prevFiltered.map((row) =>
        row.id === rowId
          ? {
              ...row,
              [item]: !value
            }
          : row
      )
    );

    const details = {
      id: damageScenarios?._id,
      'detail-id': rowId
    };

    if (item === 'Asset is Evaluated') {
      details.isAssetEvaluated = !value;
    } else {
      details.isCybersecurityEvaluated = !value;
    }

    updateDerived(details)
      .then((res) => {
        if (res) {
          getDamageScenarios(model?._id);
        }
      })
      .catch((err) => {
        console.error('Error updating row:', err);
        setFiltered((prevFiltered) =>
          prevFiltered.map((row) =>
            row.id === rowId
              ? {
                  ...row,
                  [item]: value
                }
              : row
          )
        );
      });
  };

  const handleDeleteSelected = () => {
    const details = {
      'model-id': model?._id,
      id: damageID,
      detailId: selectedRows
    };
    deleteDamageScenario(details)
      .then((res) => {
        if (!res.error) {
          notify(res.message ?? 'Deleted successfully', 'success');
          getDamageScenarios(model?._id);
          getThreatScenario(model?._id);
          getRiskTreatment(model?._id);
          setSelectedRows([]);
        } else {
          notify('Something went wrong', 'error');
        }
      })
      .catch((err) => {
        if (err) notify('Something went wrong', 'error');
      });
  };

  const toggleRowSelection = (rowId) => {
    setSelectedRows((prevSelectedRows) =>
      prevSelectedRows.includes(rowId) ? prevSelectedRows.filter((id) => id !== rowId) : [...prevSelectedRows, rowId]
    );
  };

  const handleOpenCl = (row) => {
    setSelectedRow(row);
    setOpenCl(true);
  };

  const handleCloseCl = () => {
    setOpenCl(false);
    setSelectedRow({});
    const details = Details?.filter((detail) => detail?.props?.length) ?? [];
    setDetails(details);
  };

  const handleSearch = (e) => {
    const { value } = e.target;
    if (value.length > 0) {
      const filterValue = rows.filter((rw) => {
        if (
          rw.Name.toLowerCase().includes(value.toLowerCase()) ||
          rw['Description/Scalability']?.toLowerCase().includes(value.toLowerCase())
        ) {
          return rw;
        }
      });
      setFiltered(filterValue);
    } else {
      setFiltered(rows);
    }

    setSearchTerm(value);
  };

  useEffect(() => {
    if (damageScenarios['Details']) {
      const scene = damageScenarios['Details']?.map((ls, i) => ({
        id: ls._id,
        ID: `DS${ls?.key?.toString().padStart(3, '0') ?? (i + 1).toString().padStart(3, '0')}`,
        Name: ls?.Name,
        'Description/Scalability': ls['Description'],
        cyberLosses: ls?.cyberLosses ? ls.cyberLosses : [],
        'Asset is Evaluated': ls?.is_asset_evaluated === 'true' ? true : false,
        'Cybersecurity Properties are Evaluated': ls?.is_cybersecurity_evaluated === 'true' ? true : false,
        impacts: ls?.impacts
          ? {
              'Financial Impact': ls?.impacts['Financial Impact'] ?? '',
              'Safety Impact': ls?.impacts['Safety Impact'] ?? '',
              'Operational Impact': ls?.impacts['Operational Impact'] ?? '',
              'Privacy Impact': ls?.impacts['Privacy Impact'] ?? ''
            }
          : {}
      }));
      setRows(scene);
      setFiltered(scene);
      const details = Details?.filter((detail) => detail?.props?.length) ?? [];
      setDetails(details);
    }
  }, [damageScenarios]);

  const refreshAPI = () => {
    getDamageScenarios(model?._id);
  };

  const handleChange = (e, row) => {
    e.stopPropagation();
    const { name, value } = e.target;
    const prevValue = row.impacts[name];

    setFiltered((prevFiltered) => prevFiltered.map((r) => (r.id === row.id ? { ...r, impacts: { ...r.impacts, [name]: value } } : r)));

    const updatedRow = JSON.parse(JSON.stringify(row));
    updatedRow.impacts[name] = value;

    const info = {
      id: damageID,
      detailId: updatedRow.id,
      impacts: JSON.stringify(updatedRow.impacts)
    };

    updateImpact(info)
      .then((res) => {
        if (res) {
          refreshAPI();
        }
      })
      .catch((err) => {
        console.error('Error updating impact:', err);
        setFiltered((prevFiltered) =>
          prevFiltered.map((r) => (r.id === row.id ? { ...r, impacts: { ...r.impacts, [name]: prevValue } } : r))
        );
      });
  };

  const checkforLabel = (item) => {
    if (
      item.name === 'Safety Impact' ||
      item.name === 'Financial Impact' ||
      item.name === 'Operational Impact' ||
      item.name === 'Privacy Impact'
    ) {
      return true;
    }
    return false;
  };

  const OverallImpact = useCallback((impact) => {
    const pattern = (it) => {
      return it === 'Negligible' ? 1 : it === 'Minor' ? 2 : it === 'Moderate' ? 3 : it === 'Major' ? 4 : it === 'Severe' ? 5 : 0;
    };

    const impactLabel = (value) => {
      return value === 1
        ? 'Negligible'
        : value === 2
        ? 'Minor'
        : value === 3
        ? 'Moderate'
        : value === 4
        ? 'Major'
        : value === 5
        ? 'Severe'
        : '';
    };

    const val = Object.values(impact)?.map((it) => pattern(it));
    const maxImpactValue = val.length ? Math.max(...val) : 0;

    return impactLabel(maxImpactValue);
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSaveNewRow = () => {
    if (!newRowData.Name.trim()) {
      notify('Name must not be empty', 'error');
      return;
    }
    const details = {
      'model-id': model?._id,
      Name: newRowData?.Name,
      Description: newRowData['Description/Scalability']
    };

    addScene(details)
      .then((res) => {
        // console.log('res', res);
        if (!res.error) {
          // setTimeout(() => {
          getDamageScenarios(model?._id);
          getThreatScenario(model?._id);
          notify(res.message ?? 'Added successfully', 'success');
          // handleClose();
          setNewRowData({
            name: '',
            'Description/Scalability': ''
          });
          // }, 500);
        } else {
          notify(res?.error ?? 'Something went wrong', 'error');
        }
      })
      .catch((err) => {
        if (err) notify('Something went wrong', 'error');
      });
  };

  const RenderTableRow = useCallback(
    ({ row, rowKey, isChild = false }) => {
      const [hoveredField, setHoveredField] = useState(null);
      const [editingField, setEditingField] = useState(null);
      const [editValue, setEditValue] = useState('');
      const [anchorEl, setAnchorEl] = useState(null);
      const [isPopperFocused, setIsPopperFocused] = useState(false);
      const isSelected = selectedRows.includes(row.id);
      const WIDTH_THRESHOLD = 250; // Threshold for switching between truncation and wrapping (in pixels)

      const handleEditClick = (event, fieldName, currentValue) => {
        event.stopPropagation();
        setEditingField(fieldName);
        setEditValue(currentValue || '');
        setAnchorEl(event.currentTarget);
      };

      const handleSaveEdit = (e) => {
        e.stopPropagation();
        if (editingField) {
          if (!editValue.trim()) {
            notify('Field must not be empty', 'error');
            return;
          }

          const details = {
            id: damageID,
            detailId: row?.id,
            [editingField === 'Name' ? 'Name' : 'Description']: editValue
          };

          updateName(details)
            .then((res) => {
              if (!res.error) {
                notify(res.message ?? 'Updated successfully', 'success');
                getDamageScenarios(model?._id);
                getThreatScenario(model?._id);
                handleClosePopper();
              } else {
                notify(res.error ?? 'Something went wrong', 'error');
              }
            })
            .catch((err) => notify(err.message ?? 'Something went wrong', 'error'));
        }
      };

      const handleClosePopper = () => {
        if (!isPopperFocused) {
          setEditingField(null);
          setEditValue('');
          setAnchorEl(null);
        }
      };

      return (
        <>
          <StyledTableRow
            key={row.name}
            data={row}
            sx={{
              backgroundColor: isSelected ? '#FF3800' : isChild ? '#F4F8FE' : color?.sidebarBG,
              '& .MuiTableCell-root.MuiTableCell-body': {
                color: `${color?.sidebarContent} !important`
              }
            }}
          >
            {Head?.map((item, index) => {
              const isEditableField = item.name === 'Name' || item.name === 'Description/Scalability';
              const currentWidth = columnWidths[item.id] || item.w; // Get the current width of the column
              const shouldTruncate = currentWidth < WIDTH_THRESHOLD; // Truncate if width is below threshold

              let cellContent;
              switch (true) {
                case isEditableField:
                  {
                    cellContent = (
                      <StyledTableCell
                        id="column-editer"
                        key={index}
                        onMouseEnter={() => setHoveredField(item.name)}
                        onMouseLeave={() => {
                          if (!anchorEl) setHoveredField(null);
                        }}
                        style={{ width: currentWidth, minWidth: item?.minW }}
                        sx={{
                          // display: 'flex', // Use flex to align text and icon
                          // alignItems: 'center', // Center vertically
                          position: 'relative',
                          cursor: 'pointer'
                        }}
                      >
                        <Box display="flex">
                          <Box
                            sx={{
                              flex: 1, // Take up remaining space
                              overflow: 'hidden', // Ensure overflow is handled
                              ...(shouldTruncate
                                ? {
                                    whiteSpace: 'nowrap', // Truncate text into a single line
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                  }
                                : {
                                    whiteSpace: 'normal', // Wrap text into two lines
                                    overflowWrap: 'break-word',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                  })
                            }}
                          >
                            <Tooltip title={row[item.name]} placement="top">
                              <span>{row[item.name] || '-'}</span>
                            </Tooltip>
                          </Box>
                          {(hoveredField === item.name || editingField === item.name) && (
                            <IconButton
                              size="small"
                              onClick={(e) => handleEditClick(e, item.name, row[item.name])}
                              sx={{
                                flexShrink: 0, // Prevent icon from shrinking
                                marginLeft: '8px',
                                position: 'relative',
                                bottom: '2svh'
                              }}
                            >
                              <EditIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                          )}
                        </Box>
                      </StyledTableCell>
                    );
                  }
                  break;
                case checkforLabel(item):
                  cellContent = (
                    <SelectableCell
                      key={index}
                      item={item}
                      row={row}
                      handleChange={handleChange}
                      name={item.name}
                      options={options}
                      columnWidths={columnWidths}
                      colorPickerTab={colorPickerTab}
                      impact={row?.impacts[item.name]}
                    />
                  );
                  break;

                case item.name === 'Losses of Cybersecurity Properties':
                  cellContent = (
                    <StyledTableCell
                      id="select-losses"
                      key={index}
                      component="th"
                      scope="row"
                      onClick={() => handleOpenCl(row)}
                      sx={{ cursor: 'pointer', width: `${columnWidths[item.id] || 'auto'}` }}
                    >
                      {row.cyberLosses.length ? (
                        <span style={{ display: 'inline-grid' }}>
                          {row?.cyberLosses?.map((loss) => (
                            <div
                              key={loss?.id}
                              style={{
                                marginBottom: '5px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                width: `${columnWidths[item.id] || 'auto'}`
                              }}
                            >
                              <CircleIcon sx={{ fontSize: 14, color: colorPicker(loss?.name) }} />
                              <span>Loss of {loss?.name}</span>
                            </div>
                          ))}
                        </span>
                      ) : (
                        <InputLabel>Select losses</InputLabel>
                      )}
                    </StyledTableCell>
                  );
                  break;

                case item.name === 'Assets':
                  const assetsList = row?.cyberLosses?.map((loss) => loss?.node).filter(Boolean) || ['-'];

                  // Remove duplicates from the assetsList by converting it into a Set and back into an array
                  const uniqueAssetsList = [...new Set(assetsList)];

                  cellContent = (
                    <StyledTableCell
                      key={index}
                      sx={{
                        width: `${columnWidths[item.id] || 'auto'}`
                        // display: 'flex',
                        // alignItems: 'center'
                      }}
                      component="th"
                      scope="row"
                    >
                      <Box
                        sx={{
                          flex: 1,
                          overflow: 'hidden',
                          display: 'flex',
                          flexDirection: 'column', // Stack items vertically
                          gap: 1 // Add some spacing between items
                        }}
                      >
                        <Tooltip title={uniqueAssetsList.join(', ')} placement="top">
                          <Box>
                            {uniqueAssetsList.map((asset, idx) => (
                              <Typography key={idx} variant="body2" noWrap={!shouldTruncate} mb={0.6}>
                                {asset}
                              </Typography>
                            ))}
                          </Box>
                        </Tooltip>
                      </Box>
                    </StyledTableCell>
                  );

                  break;
                case item.name === 'Overall Impact':
                  cellContent = (
                    <StyledTableCell
                      component="th"
                      scope="row"
                      sx={{
                        backgroundColor: `${colorPickerTab(OverallImpact(row?.impacts))} !important`,
                        color: '#000',
                        width: `${columnWidths[item.id] || 'auto'}`
                      }}
                    >
                      {OverallImpact(row?.impacts)}
                    </StyledTableCell>
                  );
                  break;

                case item.name.includes('Evaluated'):
                  cellContent = (
                    <StyledTableCell component="th" scope="row" sx={{ width: `${columnWidths[item.id] || 'auto'}` }}>
                      <Checkbox {...label} checked={row[item.name]} onChange={() => handleChecked(row[item.name], item.name, row?.id)} />
                    </StyledTableCell>
                  );
                  break;

                case item.name === 'ID':
                  cellContent = (
                    <StyledTableCell
                      key={index}
                      style={{ width: columnWidths[item.id] || 'auto', cursor: 'pointer' }}
                      align="left"
                      onClick={() => toggleRowSelection(row.id)}
                    >
                      {row[item.name] ? row[item.name] : '-'}
                    </StyledTableCell>
                  );
                  break;

                case typeof row[item.name] !== 'object':
                  cellContent = (
                    <StyledTableCell key={index} style={{ width: columnWidths[item.id] || 'auto' }} align={'left'}>
                      {row[item.name] ? row[item.name] : '-'}
                    </StyledTableCell>
                  );
                  break;

                default:
                  cellContent = null;
                  break;
              }

              return <React.Fragment key={index}>{cellContent}</React.Fragment>;
            })}
            {anchorEl && (
              <FormPopper
                anchorEl={anchorEl}
                handleSaveEdit={handleSaveEdit}
                handleClosePopper={handleClosePopper}
                editValue={editValue}
                setEditValue={setEditValue}
                editingField={editingField}
                setIsPopperFocused={setIsPopperFocused}
              />
            )}
          </StyledTableRow>
        </>
      );
    },
    [damageScenarios, selectedRows, visibleColumns]
  );

  return (
    <>
      <Joyride
        steps={DsSteps}
        run={runTour}
        continuous
        scrollToFirstStep
        showProgress
        showSkipButton
        callback={handleJoyrideCallback}
        styles={{
          options: {
            zIndex: 1300,
            beacon: {
              backgroundColor: '#1976d2',
              borderRadius: '50%',
              width: 20,
              height: 20,
              animation: 'pulse 1.5s infinite'
            }
          }
        }}
        disableOverlayClose
        disableScrolling={false}
      />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: 'auto'
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5} mx={1}>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography
              sx={{
                color: color?.title,
                fontWeight: 600,
                fontSize: '16px'
              }}
            >
              Damage Scenario Table
            </Typography>
          </Box>
          <Box display="flex" gap={2}>
            <IconButton onClick={() => setRunTour(true)} sx={{ color: '#1976d2', ml: 1 }} size="small">
              <HelpOutlineIcon fontSize="small" />
            </IconButton>
            <TextField
              id="search-input"
              placeholder="Search"
              size="small"
              value={searchTerm}
              onChange={handleSearch}
              sx={{
                justifyContent: 'center',
                padding: 0.5,
                '& .MuiInputBase-input': {
                  fontSize: '0.75rem',
                  padding: '0.5rem'
                },
                '& .MuiOutlinedInput-root': {
                  height: '30px'
                }
              }}
            />
            <Button
              id="add-scenario"
              variant="outlined"
              sx={{ borderRadius: 1.5 }}
              onClick={handleAddNewRow}
              startIcon={<ControlPointIcon sx={{ fontSize: 'inherit' }} />}
              disabled={isAddingNewRow}
            >
              Add new Scenario
            </Button>
            <Button
              id="filter-columns-btn"
              sx={{
                alignSelf: 'center',
                fontSize: '0.85rem',
                backgroundColor: '#4caf50',
                ':hover': {
                  backgroundColor: '#388e3c'
                }
              }}
              variant="contained"
              onClick={handleOpenFilter}
            >
              <FilterAltIcon sx={{ fontSize: 20, mr: 1 }} />
              Filter Columns
            </Button>
            <Button
              id="delete-scenario"
              sx={{ fontSize: '0.85rem' }}
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteSelected}
              disabled={selectedRows.length === 0}
            >
              Delete
            </Button>
          </Box>
        </Box>

        <Dialog open={openFilter} onClose={handleCloseFilter}>
          <DialogTitle style={{ fontSize: '18px' }}>Column Filters</DialogTitle>
          <DialogContent>
            {DSTableHeader?.map((column) => (
              <FormControlLabel
                key={column.id}
                control={
                  <Checkbox
                    checked={visibleColumns.includes(column.name)}
                    onChange={() => toggleColumnVisibility('dmgScenTblClms', column.name)}
                  />
                }
                label={column.name}
              />
            ))}
          </DialogContent>
          <DialogActions>
            <Button variant="contained" onClick={handleCloseFilter} color="warning">
              Close
            </Button>
          </DialogActions>
        </Dialog>

        <TableContainer
          component={Paper}
          elevation={2}
          sx={{
            '&.MuiPaper-elevation2': {
              overflow: 'auto !important'
            },
            borderRadius: '0px',
            padding: 0.25,
            maxHeight: tableHeight,
            scrollbarWidth: 'thin'
          }}
        >
          <Table
            stickyHeader
            sx={{ width: '100%', tableLayout: 'fixed' }}
            aria-labelledby="tableTitle"
            size="small"
            style={{ overflow: 'auto' }}
            aria-label="simple table"
          >
            <TableHead>
              <TableRow>
                {Head?.map((hd, i) => (
                  <StyledTableCell
                    key={hd?.id ?? i}
                    style={{
                      width: columnWidths[hd.id] ?? hd?.w,
                      minWidth: hd?.minW,
                      position: 'relative',
                      overflowWrap: 'break-word'
                    }}
                  >
                    {hd?.name}
                    <div
                      className="resize-handle"
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        width: '5px',
                        height: '100%',
                        cursor: 'col-resize',
                        backgroundColor: 'transparent'
                      }}
                      onMouseDown={(e) => handleResizeStart(e, hd.id)}
                    />
                  </StyledTableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {isAddingNewRow && (
                <StyledTableRow sx={{ backgroundColor: '#e3f2fd' }}>
                  {Head?.map((item, index) => {
                    if (index === 0) {
                      // Move action buttons to the first column
                      return (
                        <StyledTableCell key={index}>
                          <IconButton
                            size="small"
                            onClick={handleSaveNewRow}
                            color="success"
                            variant="outlined"
                            sx={{
                              mr: 1,
                              height: 22,
                              width: 22,
                              '& .MuiSvgIcon-root': { height: 'inherit', width: 'inherit' },
                              '&:hover': { bgcolor: 'success.main', color: 'white' }
                            }}
                          >
                            <CheckIcon />
                          </IconButton>

                          <IconButton
                            onClick={() => setIsAddingNewRow(false)}
                            color="error"
                            variant="outlined"
                            sx={{
                              height: 22,
                              width: 22,
                              '& .MuiSvgIcon-root': { height: 'inherit', width: 'inherit' },
                              '&:hover': { bgcolor: 'error.main', color: 'white' }
                            }}
                          >
                            <CloseIcon />
                          </IconButton>
                        </StyledTableCell>
                      );
                    } else if (item.name === 'Name' || item.name === 'Description/Scalability') {
                      return (
                        <StyledTableCell key={index}>
                          <TextField
                            fullWidth
                            size="small"
                            value={newRowData[item.name]}
                            onChange={(e) => setNewRowData((prev) => ({ ...prev, [item.name]: e.target.value }))}
                            sx={{
                              '& .MuiInputBase-input': {
                                fontSize: '0.75rem',
                                padding: '4px 8px'
                              }
                            }}
                          />
                        </StyledTableCell>
                      );
                    } else {
                      return <StyledTableCell key={index}>-</StyledTableCell>;
                    }
                  })}
                </StyledTableRow>
              )}

              {filtered?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)?.map((row, rowkey) => (
                <RenderTableRow row={row} key={rowkey} rowKey={rowkey} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          sx={{
            '& .MuiTablePagination-selectLabel ': { color: color?.sidebarContent },
            '& .MuiSelect-select': { color: color?.sidebarContent },
            '& .MuiTablePagination-displayedRows': { color: color?.sidebarContent }
          }}
          component="div"
          count={filtered.length}
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />

        {openCl && (
          <SelectLosses
            open={openCl}
            details={details}
            setDetails={setDetails}
            damageID={damageID}
            refreshAPI={refreshAPI}
            handleClose={handleCloseCl}
            model={model}
            selectedRow={selectedRow}
            update={update}
            getThreatScenario={getThreatScenario}
          />
        )}
        <Toaster position="top-right" reverseOrder={false} />
      </Box>
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.3); opacity: 0.7; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}
      </style>
    </>
  );
}
