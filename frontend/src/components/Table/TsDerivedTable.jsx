/* eslint-disable */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import useStore from '../../store/Zustand/store';
import { shallow } from 'zustand/shallow';
import { tableCellClasses } from '@mui/material/TableCell';
import {
  Button,
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
  InputLabel,
  IconButton,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  TableSortLabel
} from '@mui/material';
import { useSelector } from 'react-redux';
import AddThreatScenarios from '../Modal/AddThreatScenario';
import { Box } from '@mui/system';
import ColorTheme from '../../themes/ColorTheme';
import { colorPicker, threatType, TsDerivedTableHeader } from './constraints';
import CircleIcon from '@mui/icons-material/Circle';
import { tableHeight } from '../../themes/constant';
import SelectDamageScenes from '../Modal/SelectDamageScenes';
import { DamageIcon } from '../../assets/icons';
import FormPopper from '../Poppers/FormPopper';
import EditIcon from '@mui/icons-material/Edit';
import toast, { Toaster } from 'react-hot-toast';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import DeleteIcon from '@mui/icons-material/Delete';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { TsDerivedSteps } from '../../utils/Steps';
import AutoGuidePopper from '../Poppers/AutoGuidePopper';

const selector = (state) => ({
  model: state.model,
  derived: state.threatScenarios.subs[0],
  userDefined: state.threatScenarios.subs[1],
  derivedId: state.threatScenarios['subs'][0]['_id'],
  UserDefinedId: state.threatScenarios['subs'][1]['_id'],
  getDamageScenarios: state.getDamageScenarios,
  getThreatScenario: state.getThreatScenario,
  getRiskTreatment: state.getRiskTreatment,
  damageScenarios: state.damageScenarios['subs'][1],
  updateThreatScenario: state.updateThreatScenario,
  updateName: state.updateName$DescriptionforThreat,
  deleteThreatScenario: state.deleteThreatScenario
});

const notify = (message, status) => toast[status](message);

const column = TsDerivedTableHeader;

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
    borderRight: '1px solid rgba(255, 255, 255, 0.2) !important',
    padding: '12px 8px',
    fontSize: '0.875rem',
    fontWeight: 600,
    textAlign: 'center',
    whiteSpace: 'normal',
    wordBreak: 'break-word',
    lineHeight: 1.4,
    '&:first-of-type': {
      borderTopLeftRadius: theme.shape.borderRadius
    },
    '&:last-child': {
      borderTopRightRadius: theme.shape.borderRadius,
      borderRight: 'none !important'
    }
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: '0.8125rem',
    borderRight: '1px solid rgba(0, 0, 0, 0.08) !important',
    borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
    padding: '10px 8px',
    textAlign: 'center',
    verticalAlign: 'middle',
    transition: 'all 0.2s ease-in-out',
    maxWidth: '250px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    '&:last-child': {
      borderRight: 'none',
      paddingRight: '16px',
      borderRight: 'none !important'
    },
    '&:first-of-type': {
      paddingLeft: '16px'
    }
  }
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: theme.shadows[1],
    '& td': {
      color: theme.palette.text.primary,
      position: 'relative',
      zIndex: 1,
      '&:first-of-type': {
        borderTopLeftRadius: '4px',
        borderBottomLeftRadius: '4px'
      },
      '&:last-child': {
        borderTopRightRadius: '4px',
        borderBottomRightRadius: '4px'
      }
    }
  },
  '&.Mui-selected': {
    backgroundColor: 'rgba(25, 118, 210, 0.08) !important',
    '&:hover': {
      backgroundColor: 'rgba(25, 118, 210, 0.12) !important'
    },
    '& td': {
      color: theme.palette.primary.main,
      fontWeight: 500
    }
  },
  '&.MuiTableRow-hover': {
    '&:hover': {
      backgroundColor: theme.palette.action.hover
    }
  },
  '&:last-child td, &:last-child th': { border: 0 }
}));

export default function TsDerivedTable() {
  const color = ColorTheme();
  const [openTs, setOpenTs] = useState(false);
  const [openSelect, setOpenSelect] = useState(false);
  const [selectedRow, setSelectedRow] = useState({});
  const [details, setDetails] = useState({});

  const {
    model,
    derived,
    userDefined,
    getThreatScenario,
    damageScenarios,
    getDamageScenarios,
    updateThreatScenario,
    updateName,
    derivedId,
    UserDefinedId,
    deleteThreatScenario,
    getRiskTreatment
  } = useStore(selector, shallow);
  const [rows, setRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { title } = useSelector((state) => state?.pageName);
  const [openFilter, setOpenFilter] = useState(false); // Manage the filter modal visibility
  const visibleColumns = useStore((state) => state?.threatDerivedScenTblClms);
  const toggleColumnVisibility = useStore((state) => state.toggleColumnVisibility);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('SNo');

  const Head = useMemo(() => {
    return column.filter((header) => visibleColumns.includes(header.name));
  }, [title, visibleColumns]);

  // console.log('Head', Head);
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [columnWidths, setColumnWidths] = useState(Object.fromEntries(Head?.map((col) => [col.id, col.w])));
  const [selectedRows, setSelectedRows] = useState([]);
  const [runTour, setRunTour] = useState(false);

  // Open/Close the filter modal
  const handleOpenFilter = () => setOpenFilter(true);
  const handleCloseFilter = () => setOpenFilter(false);

  const stableSort = (array, comparator) => {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  };

  const getComparator = (order, orderBy) => {
    return order === 'desc' ? (a, b) => descendingComparator(a, b, orderBy) : (a, b) => -descendingComparator(a, b, orderBy);
  };

  const descendingComparator = (a, b, orderBy) => {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const filteredRows = useMemo(() => {
    let filtered = rows;

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (row) =>
          row.Name?.toLowerCase().includes(searchTerm.toLowerCase()) || row.Description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    return stableSort(filtered, getComparator(order, orderBy));
  }, [rows, searchTerm, order, orderBy]);

  const paginatedRows = useMemo(() => {
    return filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredRows, page, rowsPerPage]);

  const handleOpenSelect = (row) => {
    setSelectedRow(row);
    setOpenSelect(true);
  };

  const handleCloseSelect = () => {
    setOpenSelect(false);
    setSelectedRow({});
  };
  const refreshAPI = () => {
    getThreatScenario(model?._id);
    handleCloseSelect();
  };

  useEffect(() => {
    if (model?._id) {
      getDamageScenarios(model._id);
      getThreatScenario(model._id);
    }
  }, [model?._id]); // Remove empty dependency array, add model._id dependency

  // UPDATE: Clear local state when model is not available
  useEffect(() => {
    if (!model?._id) {
      setRows([]);
      setDetails({});
    }
  }, [model?._id]);

  // UPDATE: Add refresh function for external calls
  const refreshTable = useCallback(async () => {
    if (model?._id) {
      await Promise.all([getDamageScenarios(model._id), getThreatScenario(model._id)]);
    }
  }, [model?._id, getDamageScenarios, getThreatScenario]);

  useEffect(() => {
    if (model?._id) {
      refreshTable();
    }
  }, [model?._id, refreshTable]);

  useEffect(() => {
    if (derived?.Details && userDefined?.Details) {
      let id = 0;
      const mappedDetails = Array.isArray(userDefined['Details'])
        ? userDefined['Details'].map((detail, i) => {
            return detail && typeof detail === 'object'
              ? {
                  SNo: `TSD${(i + 1).toString().padStart(3, '0')}`,
                  ID: detail?.id || null,
                  Name: detail?.name || null,
                  Description: detail?.description || null,
                  'Detailed / Combined Threat Scenarios': detail?.threat_ids,
                  type: 'User-defined',
                  'Damage Scenarios': detail?.damage_details ? detail?.damage_details : detail?.threat_ids ? detail?.threat_ids : [],
                  'Losses of Cybersecurity Properties': detail.damage_details
                    ? detail?.damage_details?.flatMap((damage) => damage?.cyberLosses)
                    : detail?.threat_ids
                      ? detail?.threat_ids
                      : []
                }
              : {};
          })
        : [];

      setRows(mappedDetails);
      setDetails(damageScenarios);
    } else {
      // Handle cleared/empty state
      setRows([]);
      setDetails({});
    }
  }, [derived, userDefined, damageScenarios]);

  const handleOpenModalTs = () => {
    setOpenTs(true);
  };

  const handleCloseTs = () => {
    setOpenTs(false);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleResizeStart = (e, columnId) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent unwanted bubbling

    const startX = e.clientX;
    const headerCell = e.currentTarget.parentElement;
    const startWidth = columnWidths[columnId] || headerCell.offsetWidth;

    const handleMouseMove = (event) => {
      const newWidth = Math.max(startWidth + (event.clientX - startX), Head?.find((col) => col.id === columnId)?.minW || 50);
      setColumnWidths((prev) => ({ ...prev, [columnId]: newWidth }));
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleDeleteSelected = async () => {
    const details = {
      'model-id': model?._id,
      rowDetails: JSON.stringify(selectedRows)
    };

    try {
      const res = await deleteThreatScenario(details);
      if (!res.error) {
        notify(res.message ?? 'Deleted successfully', 'success');
        // Refresh all related data
        await Promise.all([getDamageScenarios(model?._id), getThreatScenario(model?._id), getRiskTreatment(model?._id)]);
        setSelectedRows([]);
        // Force re-render by resetting page if needed
        setPage(0);
      } else {
        notify(res.error ?? 'Something went wrong', 'error');
      }
    } catch (err) {
      notify('Something went wrong', 'error');
      console.error('Delete error:', err);
    }
  };

  const toggleRowSelection = (row) => {
    const shorted = {
      propId: row?.ID,
      SNo: row?.SNo,
      nodeId: row?.nodeId,
      rowId: row?.rowId,
      type: row?.type
    };
    setSelectedRows((prevSelectedRows) => {
      const isSelected = prevSelectedRows.some((selectedRow) => selectedRow.SNo === shorted.SNo);

      if (isSelected) {
        // Unselect if already selected
        return prevSelectedRows.filter((selectedRow) => selectedRow.SNo !== shorted.SNo);
      } else {
        // Select if not selected
        return [...prevSelectedRows, shorted];
      }
    });
  };

  const RenderTableRow = ({ row, rowKey, isChild = false }) => {
    const [hoveredField, setHoveredField] = useState(null);
    const [editingField, setEditingField] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const [isPopperFocused, setIsPopperFocused] = useState(false);
    const isSelected = selectedRows.some((selectedRow) => selectedRow.SNo === row.SNo);

    const handleEditClick = (event, fieldName, currentValue) => {
      event.stopPropagation();
      setEditingField(fieldName);
      setEditValue(currentValue || '');
      setAnchorEl(event.currentTarget);
    };

    const handleSaveEdit = async (e) => {
      e.stopPropagation();
      if (editingField) {
        if (!editValue.trim()) {
          notify('Field must not be empty', 'error');
          return;
        }

        const details = {
          id: row?.type === 'derived' ? derivedId : UserDefinedId,
          propId: row?.ID,
          nodeId: row?.nodeId,
          rowId: row?.rowId,
          field: editingField,
          value: editValue,
          type: row?.type
        };

        try {
          const res = await updateName(details);
          if (!res.error) {
            handleClosePopper();
            notify(res.message ?? 'Updated successfully', 'success');
            await getThreatScenario(model?._id);
          } else {
            notify(res.error ?? 'Something went wrong', 'error');
          }
        } catch (err) {
          notify(err.message ?? 'Something went wrong', 'error');
        }
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
      <StyledTableRow
        key={row.name}
        data={row}
        sx={{
          backgroundColor: isSelected ? '#9FE2BF' : isChild ? '#F4F8FE' : color?.sidebarBG,
          '& .MuiTableCell-root.MuiTableCell-body': {
            color: `${color?.sidebarContent} !important`
          }
        }}
      >
        {Head?.map((item, index) => {
          const isEditableField = item.name === 'Description' || item.name === 'Name';
          let cellContent;
          switch (true) {
            case isEditableField:
              {
                cellContent = (
                  <StyledTableCell
                    id="edit-name"
                    key={index}
                    onMouseEnter={() => setHoveredField(item.name)}
                    onMouseLeave={() => {
                      if (!anchorEl) setHoveredField(null);
                    }}
                    style={{ position: 'relative', cursor: 'pointer' }}
                  >
                    {row[item.name] || '-'}
                    {(hoveredField === item.name || editingField === item.name) && (
                      <IconButton
                        size="small"
                        onClick={(e) => handleEditClick(e, item.name, row[item.name])}
                        sx={{
                          position: 'absolute',
                          top: '15%',
                          right: '-2px',
                          transform: 'translateY(-50%)'
                        }}
                      >
                        <EditIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    )}
                  </StyledTableCell>
                );
              }
              break;
            case item.name === 'Detailed / Combined Threat Scenarios':
              // console.log('row[item.name] ', row[item.name]);
              cellContent = (
                <StyledTableCell key={index} style={{ width: columnWidths[item.id] || 'auto' }} align={'left'}>
                  {row[item.name]
                    ? row[item.name]?.map((threat, i) => (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }} key={i}>
                          <span style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: 'max-content' }}>
                            {/* {threat?.prop_key ? `[TS${(threat?.prop_key).toString().padStart(3, '0')}] ${threat?.prop_name}` : '-'} */}
                            {threat?.prop_key
                              ? `[TS${threat?.prop_key.toString().padStart(3, '0')}] ${threatType(threat?.prop_name)} of ${
                                  threat?.node_name
                                } leads to ${threat?.damage_scene}`
                              : '-'}
                          </span>
                        </span>
                      ))
                    : '-'}
                </StyledTableCell>
              );
              break;
            case item.name === 'SNo':
              cellContent = (
                <StyledTableCell
                  key={index}
                  sx={{ width: columnWidths[item.id] || 'auto', cursor: 'pointer' }}
                  align="left"
                  onClick={() => toggleRowSelection(row)}
                >
                  {row[item.name] ? row[item.name] : '-'}
                </StyledTableCell>
              );
              break;

            case item.name === 'Losses of Cybersecurity Properties':
              // console.log('row[item?.name]1', row[item?.name]);
              cellContent = row[item?.name] && (
                <StyledTableCell component="th" scope="row">
                  {row[item?.name].map((loss, i) => {
                    const name = loss?.name ? loss?.name : loss?.prop_name ? loss?.prop_name : '';
                    return (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }} key={i}>
                        <CircleIcon sx={{ fontSize: 14, color: colorPicker(name) }} />
                        <span style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: 'max-content' }}>Loss of {name}</span>
                      </span>
                    );
                  })}
                </StyledTableCell>
              );
              break;
            case item.name === 'Damage Scenarios':
              cellContent = (
                <StyledTableCell
                  component="th"
                  scope="row"
                  onClick={() => {
                    if (!row[item.name].length) {
                      handleOpenSelect(row);
                    }
                  }}
                  sx={{ cursor: 'pointer' }}
                >
                  {row[item.name] && row[item.name].length ? (
                    row[item.name].map((damage, i) => (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, margin: '10px auto' }} key={i}>
                        <img src={DamageIcon} alt="damage" height="10px" width="10px" />
                        <span style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: 'max-content' }}>
                          {damage?.key
                            ? `[DS${(damage?.key).toString().padStart(3, '0')}] ${damage?.name}`
                            : damage?.damage_id
                              ? `[${damage?.damage_id}] ${damage?.damage_scene}`
                              : '-'}
                        </span>
                      </span>
                    ))
                  ) : (
                    <InputLabel>Select Damage Scenario</InputLabel>
                  )}
                </StyledTableCell>
              );

              break;
            case item.name === 'ID':
              cellContent = (
                <StyledTableCell key={index} style={{ width: columnWidths[item.id] || 'auto' }} align={'left'}>
                  {row[item.name] ? row[item.name].slice(0, 6) : '-'}
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
    );
  };

  return (
    <>
      <AutoGuidePopper steps={TsDerivedSteps} runTour={runTour} setRunTour={setRunTour} />
      <Box
        sx={{
          overflow: 'auto',
          height: '-webkit-fill-available',
          minHeight: 'moz-available',
          padding: 1,
          '&::-webkit-scrollbar': {
            width: '4px'
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '10px'
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(0, 0, 0, 0.1)'
          }
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} mx={1}>
          <Box display="flex" alignItems="center" gap={1}>
            {/* <KeyboardBackspaceRoundedIcon sx={{ float: 'left', cursor: 'pointer', ml: 1, color: color?.title }} onClick={handleBack} /> */}
            <Typography sx={{ color: color?.title, fontWeight: 600, fontSize: '16px' }}>{title} Table</Typography>
          </Box>
          <Box display="flex" gap={3}>
            <IconButton onClick={() => setRunTour(true)} sx={{ color: '#1976d2', ml: 1 }} size="small">
              <HelpOutlineIcon fontSize="small" />
            </IconButton>
            <TextField
              id="search-input"
              placeholder="Search"
              size="small"
              value={searchTerm}
              onChange={handleSearch}
              sx={{ '& .MuiInputBase-input': { border: '1px solid black' }, justifyContent: 'center' }}
            />
            <Button sx={{ padding: '0px 8px', fontSize: '0.85rem' }} variant="contained" onClick={handleOpenModalTs}>
              Add New Scenario
            </Button>
            <Button
              id="filter-columns-btn"
              sx={{
                padding: '0px 8px',
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
            {/* <Button
            sx={{ fontSize: '0.85rem' }}
            variant="contained"
            color="primary"
            startIcon={<CircleIcon />} // Or any appropriate icon
            // onClick={handleDeriveSelected}
            disabled={selectedRows.length === 0}
          >
            Derive
          </Button> */}
            <Button
              id="delete-btn"
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

        {/* Column Filter Dialog */}
        <Dialog open={openFilter} onClose={handleCloseFilter}>
          <DialogTitle style={{ fontSize: '18px' }}>Column Filters</DialogTitle>
          <DialogContent>
            {TsDerivedTableHeader.map((column) => (
              <FormControlLabel
                key={column.id}
                control={
                  <Checkbox
                    checked={visibleColumns.includes(column.name)}
                    onChange={() => toggleColumnVisibility('threatDerivedScenTblClms', column.name)}
                  />
                }
                label={column.name} // Display column name as label
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
          <Table stickyHeader sx={{ width: '100%' }} aria-label="simple table">
            <TableHead>
              <TableRow>
                {Head?.map((hd) => (
                  <StyledTableCell
                    key={hd.id}
                    style={{
                      width: columnWidths[hd.id] ?? hd?.w,
                      minWidth: hd?.minW,
                      position: 'relative',
                      overflowWrap: 'break-word'
                    }}
                  >
                    <TableSortLabel
                      active={orderBy === hd.name}
                      direction={orderBy === hd.name ? order : 'asc'}
                      onClick={() => handleRequestSort(hd.name)}
                    >
                      {hd?.name}
                    </TableSortLabel>
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
              {paginatedRows?.map((row, rowkey) => (
                <RenderTableRow row={row} rowKey={rowkey} key={rowkey} />
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
          count={filteredRows.length}
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
        <AddThreatScenarios open={openTs} handleClose={handleCloseTs} id={model._id} />
        {openSelect && (
          <SelectDamageScenes
            open={openSelect}
            handleClose={handleCloseSelect}
            details={details}
            selectedRow={selectedRow}
            id={UserDefinedId}
            updateThreatScenario={updateThreatScenario}
            refreshAPI={refreshAPI}
          />
        )}
        <Toaster position="top-right" reverseOrder={false} />
      </Box>
    </>
  );
}
