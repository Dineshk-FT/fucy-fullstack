/*eslint-disable*/
import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import {
  Paper,
  FormControl,
  MenuItem,
  Select,
  TextField,
  Typography,
  styled,
  Tooltip,
  TablePagination,
  InputLabel,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  TableSortLabel,
  Box as MuiBox
} from '@mui/material';
import { tooltipClasses } from '@mui/material/Tooltip';
import useStore from '../../store/Zustand/store';
import { shallow } from 'zustand/shallow';
import { useSelector } from 'react-redux';
import { Box } from '@mui/system';
import ColorTheme from '../../themes/ColorTheme';
import { RatingColor, getRating } from './constraints';
import { tableHeight } from '../../themes/constant';
import { AttackTableoptions as options, AttackTableHeader } from './constraints';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import ControlPointIcon from '@mui/icons-material/ControlPoint';
import DeleteIcon from '@mui/icons-material/Delete';
import toast from 'react-hot-toast';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { attackTableSteps } from '../../utils/Steps';
import AutoGuidePopper from '../Poppers/AutoGuidePopper';
import ConfirmDeleteDialog from '../../components/Modal/ConfirmDeleteDialog';

const notify = (message, status) => toast[status](message);
const selector = (state) => ({
  model: state.model,
  update: state.updateAttackScenario,
  getAttackScenario: state.getAttackScenario,
  // FIXED: Added optional chaining to prevent TypeError crashes
  attacks: state.attackScenarios?.subs?.[0],
  addScene: state.addAttackScene,
  deleteAttackScenes: state.deleteAttackScenes
});

const HtmlTooltip = styled(({ className, ...props }) => <Tooltip {...props} classes={{ popper: className }} />)(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#f5f5f9',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 220,
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #dadde9'
  }
}));

const column = AttackTableHeader;

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
    borderRight: '1px solid rgba(255, 255, 255, 0.2)',
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
      borderRight: 'none'
    }
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: '0.8125rem',
    borderRight: '1px solid rgba(0, 0, 0, 0.08)',
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
      paddingRight: '16px'
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
  height: '3.5em'
}));

// Memoized SelectableCell component
const SelectableCell = React.memo(({ item, row, handleChange, name }) => {
  const [open, setOpen] = useState(false);
  const selectRef = useRef(null);

  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    setOpen(true);
  }, []);

  const handleClick = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!open) {
        setOpen(true);
      }
    },
    [open]
  );

  const handleClose = useCallback(() => setOpen(false), []);

  return (
    <StyledTableCell id="select-value" component="th" scope="row" onClick={handleClick} onContextMenu={handleContextMenu}>
      <FormControl
        sx={{
          width: 130,
          background: 'transparent',
          '& .MuiInputBase-root': { backgroundColor: 'transparent', color: 'inherit' },
          '& .MuiSelect-select': {
            backgroundColor: 'transparent',
            padding: '0 24px 0 8px',
            fontSize: '13px',
            lineHeight: '1.5em',
            height: '1.5em',
            display: 'flex',
            alignItems: 'center'
          },
          '& .MuiSvgIcon-root': { display: 'none' },
          '& .MuiOutlinedInput-notchedOutline': { border: 'none' }
        }}
      >
        {!row[item.name] && (
          <InputLabel id="demo-simple-select-label" shrink={false} sx={{ top: -16 }}>
            Select Value
          </InputLabel>
        )}
        <Select
          ref={selectRef}
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={row[item.name]}
          placeholder="Select value"
          onChange={(e) => handleChange(e, row)}
          sx={{ '& .MuiSelect-select': { color: 'inherit' } }}
          name={name}
          open={open}
          onClose={handleClose}
        >
          {options[item.name]?.map((option) => (
            <MenuItem key={option?.value} value={option?.value}>
              <HtmlTooltip
                placement="left"
                title={
                  <Typography
                    sx={{
                      fontSize: '14px',
                      fontWeight: 600,
                      padding: '8px',
                      borderRadius: '4px',
                      color: 'inherit'
                    }}
                  >
                    {option?.description}
                  </Typography>
                }
              >
                <Typography sx={{ color: 'inherit' }} variant="h5">
                  {option?.label}
                </Typography>
              </HtmlTooltip>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </StyledTableCell>
  );
});

// Memoized Table Row component
const RenderTableRow = React.memo(
  ({ row, Head, columnWidths, selectedRows, toggleRowSelection, handleChange, color, checkforLabelFn, RatingColorFn }) => {
    const isSelected = selectedRows.includes(row.ID);
    const WIDTH_THRESHOLD = 250;

    const handleRowClick = useCallback(() => {
      toggleRowSelection(row.ID);
    }, [toggleRowSelection, row.ID]);

    const handleCheckboxChange = useCallback(
      (e) => {
        e.stopPropagation();
        toggleRowSelection(row.ID);
      },
      [toggleRowSelection, row.ID]
    );

    return (
      <StyledTableRow
        data={row}
        sx={{
          backgroundColor: isSelected ? 'rgba(25, 118, 210, 0.08)' : color?.sidebarBG,
          '& .MuiTableCell-root.MuiTableCell-body': {
            color: `${color?.sidebarContent} !important`
          }
        }}
      >
        {Head?.map((item, index) => {
          const bgColor = RatingColorFn(row['Attack Feasibilities Rating']);
          const textColor = !bgColor?.includes('yellow') ? 'white' : 'black';
          const currentWidth = columnWidths[item.id] || 180;
          const shouldTruncate = currentWidth < WIDTH_THRESHOLD;

          let cellContent;
          switch (true) {
            case item.name === 'SNO':
              cellContent = (
                <StyledTableCell key={index} style={{ width: currentWidth, cursor: 'pointer' }} align="left" onClick={handleRowClick}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Checkbox size="small" checked={isSelected} onChange={handleCheckboxChange} onClick={(e) => e.stopPropagation()} />
                    {row[item.name] ? row[item.name] : '-'}
                  </Box>
                </StyledTableCell>
              );
              break;
            case checkforLabelFn(item):
              cellContent = <SelectableCell item={item} row={row} handleChange={handleChange} name={item.name} />;
              break;
            case item.name === 'Attack Feasibilities Rating':
              cellContent = (
                <StyledTableCell
                  key={index}
                  align={'left'}
                  sx={{
                    backgroundColor: `${bgColor} !important`,
                    color: `${textColor} !important`
                  }}
                >
                  {row[item.name] ? row[item.name] : '-'}
                </StyledTableCell>
              );
              break;
            case item.name === 'Name' || item.name === 'Description':
              cellContent = (
                <StyledTableCell
                  key={index}
                  style={{ width: currentWidth }}
                  align={'left'}
                  sx={{
                    ...(shouldTruncate
                      ? {
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }
                      : {
                          whiteSpace: 'normal',
                          overflowWrap: 'break-word',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        })
                  }}
                >
                  <Tooltip title={row[item.name]} placement="top">
                    <span>{row[item.name] ? row[item.name] : '-'}</span>
                  </Tooltip>
                </StyledTableCell>
              );
              break;
            default:
              cellContent = (
                <StyledTableCell key={index} style={{ width: currentWidth }} align={'left'}>
                  {row[item.name] ? row[item.name] : '-'}
                </StyledTableCell>
              );
              break;
          }
          return <React.Fragment key={index}>{cellContent}</React.Fragment>;
        })}
      </StyledTableRow>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison for memoization
    return (
      // FIXED: We must compare the actual row data to detect dropdown/rating changes
      JSON.stringify(prevProps.row) === JSON.stringify(nextProps.row) &&
      prevProps.selectedRows.length === nextProps.selectedRows.length &&
      prevProps.selectedRows.includes(prevProps.row.ID) === nextProps.selectedRows.includes(nextProps.row.ID) &&
      JSON.stringify(prevProps.columnWidths) === JSON.stringify(nextProps.columnWidths) &&
      prevProps.Head === nextProps.Head
    );
  }
);

export default function AttackTreeTable() {
  const color = ColorTheme();
  const { model, update, attacks, getAttackScenario, addScene, deleteAttackScenes } = useStore(selector, shallow);
  const [rows, setRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const { title } = useSelector((state) => state?.pageName);
  const [openFilter, setOpenFilter] = useState(false);
  const visibleColumns = useStore((state) => state.attackTreeTblClms);
  const toggleColumnVisibility = useStore((state) => state.toggleColumnVisibility);
  const [isAddingNewRow, setIsAddingNewRow] = useState(false);
  const [newRowData, setNewRowData] = useState({
    Name: '',
    Description: ''
  });
  const [runTour, setRunTour] = useState(false);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('SNO');
  const [selectedRows, setSelectedRows] = useState([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const Head = useMemo(() => {
    if (title.includes('Derived')) {
      const col = [...column];
      col.splice(4, 0, { id: 14, name: 'Detailed / Combined Threat Scenarios' });
      return col.filter((header) => visibleColumns.includes(header.name));
    } else {
      return column.filter((header) => visibleColumns.includes(header.name));
    }
  }, [title, visibleColumns]);

  const [columnWidths, setColumnWidths] = useState(Object.fromEntries(Head?.map((hd) => [hd.id, 180])));

  const descendingComparator = useCallback((a, b, orderBy) => {
    if (b[orderBy] < a[orderBy]) return -1;
    if (b[orderBy] > a[orderBy]) return 1;
    return 0;
  }, []);

  const getComparator = useCallback((order, orderBy) => {
    return order === 'desc' ? (a, b) => descendingComparator(a, b, orderBy) : (a, b) => -descendingComparator(a, b, orderBy);
  }, []);
  // Memoized sorting functions
  const stableSort = useCallback((array, comparator) => {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  }, []);

  const filteredRows = useMemo(() => {
    let filtered = rows;
    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (row) => row.Name?.toLowerCase().includes(lowerSearch) || row.Description?.toLowerCase().includes(lowerSearch)
      );
    }
    return stableSort(filtered, getComparator(order, orderBy));
  }, [rows, searchTerm, order, orderBy, stableSort, getComparator]);

  // Memoized helper functions
  const checkforLabelFn = useCallback((item) => {
    return ['Expertise', 'Elapsed Time', 'Knowledge of the Item', 'Window of Opportunity', 'Equipment'].includes(item.name);
  }, []);

  const RatingColorFn = useCallback((rating) => RatingColor(rating), []);

  const handleRequestSort = useCallback(
    (property) => {
      const isAsc = orderBy === property && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(property);
    },
    [orderBy, order]
  );

  // Optimized selection handlers
  const toggleRowSelection = useCallback((rowId) => {
    setSelectedRows((prev) => (prev.includes(rowId) ? prev.filter((id) => id !== rowId) : [...prev, rowId]));
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedRows((prev) => (prev.length === filteredRows.length ? [] : filteredRows.map((row) => row.ID)));
  }, [filteredRows]);

  const handleDeleteSelected = useCallback(() => {
    if (selectedRows.length === 0) return;
    setDeleteConfirmOpen(true);
  }, [selectedRows]);

  // In your confirmDeleteSelected function
  const confirmDeleteSelected = useCallback(async () => {
    const details = {
      'model-id': model?._id,
      type: 'attack',
      ids: selectedRows // This is an array of IDs
    };

    try {
      const res = await deleteAttackScenes(details);
      if (!res?.error) {
        notify(res?.message ?? `${selectedRows.length} attack(s) deleted successfully`, 'success');
        await getAttackScenario(model?._id);
        setSelectedRows([]);
      } else {
        notify(res?.error ?? 'Failed to delete attacks', 'error');
      }
    } catch (err) {
      console.error('Error deleting attacks:', err);
      notify('Something went wrong', 'error');
    } finally {
      setDeleteConfirmOpen(false);
    }
  }, [deleteAttackScenes, model?._id, selectedRows, getAttackScenario]);

  const closeDeleteConfirm = useCallback(() => {
    setDeleteConfirmOpen(false);
  }, []);

  // Memoized filtered and paginated rows

  const paginatedRows = useMemo(() => {
    return filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredRows, page, rowsPerPage]);

  const handleChange = useCallback(
    (e, row) => {
      e.stopPropagation();
      const { name, value } = e.target;

      // 1. Calculate the new row directly from the 'row' parameter to avoid undefined crashes
      const tempRow = { ...row, [name]: value };

      const calculateAverageRating = (r) => {
        const categories = ['Elapsed Time', 'Expertise', 'Knowledge of the Item', 'Window of Opportunity', 'Equipment'];
        let totalRating = 0;
        categories.forEach((category) => {
          const selectedOption = options[category]?.find((option) => option.value === r[category]);
          if (selectedOption) {
            totalRating += selectedOption.rating;
          }
        });
        return totalRating;
      };

      const averageRating = calculateAverageRating(tempRow);
      const finalRating = getRating(averageRating);

      const updatedRow = {
        ...tempRow,
        'Attack Feasibilities Rating': finalRating
      };

      // 2. Use a functional state update to completely bypass stale closure issues
      setRows((prevRows) => prevRows.map((r) => (r.ID === row.ID ? updatedRow : r)));

      const details = {
        modelId: model?._id,
        type: 'attack',
        id: row?.ID,
        [`${name}`]: value,
        'Attack Feasibilities Rating': finalRating
      };

      update(details)
        .then((res) => {
          if (res) {
            getAttackScenario(model?._id);
          }
        })
        .catch((err) => {
          console.log('err', err);
          // 3. Revert back to the original row if the API call fails
          setRows((prevRows) => prevRows.map((r) => (r.ID === row.ID ? row : r)));
        });
    },
    // FIXED: Removed 'rows' from the dependency array so this function never goes stale
    [update, model?._id, getAttackScenario]
  );

  // Memoized row renderer to avoid recreating on every render
  const renderRow = useCallback(
    (row, index) => (
      <RenderTableRow
        key={row.ID || index}
        row={row}
        Head={Head}
        columnWidths={columnWidths}
        selectedRows={selectedRows}
        toggleRowSelection={toggleRowSelection}
        handleChange={handleChange}
        color={color}
        checkforLabelFn={checkforLabelFn}
        RatingColorFn={RatingColorFn}
      />
    ),
    [Head, columnWidths, selectedRows, toggleRowSelection, color, checkforLabelFn, RatingColorFn]
  );

  // Rest of your handlers (handleChange, handleSaveNewRow, etc.) remain the same

  const handleSaveNewRow = useCallback(() => {
    if (!newRowData.Name.trim()) {
      notify('Name must not be empty', 'error');
      return;
    }
    const details = {
      modelId: model?._id,
      type: 'attack',
      name: newRowData?.Name,
      description: newRowData?.Description
    };

    addScene(details)
      .then((res) => {
        if (!res.error) {
          getAttackScenario(model?._id);
          notify(res.message ?? 'Added successfully', 'success');
          setIsAddingNewRow(false);
          setNewRowData({ Name: '', Description: '' });
        } else {
          notify(res?.error ?? 'Something went wrong', 'error');
        }
      })
      .catch((err) => {
        if (err) notify('Something went wrong', 'error');
      });
  }, [newRowData, addScene, model?._id, getAttackScenario]);

  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  }, []);

  const handleChangePage = useCallback((event, newPage) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const handleAddNewRow = useCallback(() => {
    setIsAddingNewRow(true);
    setNewRowData({ Name: '', Description: '' });
  }, []);

  const handleOpenFilter = useCallback(() => setOpenFilter(true), []);
  const handleCloseFilter = useCallback(() => setOpenFilter(false), []);

  const handleResizeStart = useCallback(
    (e, columnId) => {
      e.preventDefault();
      e.stopPropagation();

      const startX = e.clientX;
      const headerCell = e.currentTarget.parentElement;
      const startWidth = columnWidths[columnId] || headerCell.offsetWidth;

      const handleMouseMove = (moveEvent) => {
        const delta = moveEvent.clientX - startX;
        const newWidth = Math.max(80, startWidth + delta);
        setColumnWidths((prev) => ({ ...prev, [columnId]: newWidth }));
      };

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [columnWidths]
  );

  useEffect(() => {
    if (model?._id) {
      getAttackScenario(model._id);
    }
  }, [model?._id, getAttackScenario]);

  useEffect(() => {
    if (attacks?.scenes && attacks.scenes.length > 0) {
      const mod1 = attacks.scenes.map((dt, i) => ({
        SNO: `AT${(i + 1).toString().padStart(3, '0')}`,
        ID: dt._id || dt.id || dt?.ID,
        Name: dt.name || dt?.Name,
        Description: dt?.description || dt?.Description || `This is the description for ${dt.Name || dt?.name}`,
        'Elapsed Time': dt['Elapsed Time'] ?? '',
        Expertise: dt?.Expertise ?? '',
        'Knowledge of the Item': dt['Knowledge of the Item'] ?? '',
        'Window of Opportunity': dt['Window of Opportunity'] ?? '',
        Equipment: dt?.Equipment ?? '',
        'Attack Feasibilities Rating': dt['Attack Feasibilities Rating']?.length ? dt['Attack Feasibilities Rating'] : ''
      }));
      setRows(mod1);
    } else {
      // Clear the table and any active selections when data is empty/cleared
      setRows([]);
      setSelectedRows([]);
    }
  }, [attacks]);

  const isAllSelected = filteredRows.length > 0 && selectedRows.length === filteredRows.length;
  const isSomeSelected = selectedRows.length > 0 && selectedRows.length < filteredRows.length;

  return (
    <>
      <AutoGuidePopper steps={attackTableSteps} runTour={runTour} setRunTour={setRunTour} />

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1} mx={1}>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography sx={{ color: color?.title, fontWeight: 600, fontSize: '16px' }}>Attack Tree Table</Typography>
          {selectedRows.length > 0 && (
            <Typography sx={{ color: color?.primary, fontSize: '14px', ml: 2 }}>{selectedRows.length} item(s) selected</Typography>
          )}
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <IconButton onClick={() => setRunTour(true)} sx={{ color: '#1976d2', ml: 1 }} size="small">
            <HelpOutlineIcon fontSize="small" />
          </IconButton>
          <Button
            id="add-btn"
            variant="outlined"
            sx={{ borderRadius: 1.5 }}
            onClick={handleAddNewRow}
            startIcon={<ControlPointIcon sx={{ fontSize: 'inherit' }} />}
            disabled={isAddingNewRow}
          >
            Add new
          </Button>
          <Button
            id="delete-selected-btn"
            variant="outlined"
            color="error"
            sx={{ borderRadius: 1.5 }}
            onClick={handleDeleteSelected}
            startIcon={<DeleteIcon />}
            disabled={selectedRows.length === 0}
          >
            Delete Selected
          </Button>
          <TextField
            id="search-input"
            placeholder="Search"
            size="small"
            value={searchTerm}
            onChange={handleSearch}
            sx={{ padding: 1, '& .MuiInputBase-input': { border: '1px solid black' } }}
          />
          <Button
            id="filter-columns-btn"
            sx={{
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
        </Box>
      </Box>

      <Dialog open={openFilter} onClose={handleCloseFilter}>
        <DialogTitle style={{ fontSize: '18px' }}>Column Filters</DialogTitle>
        <DialogContent>
          {AttackTableHeader.map((column) => (
            <FormControlLabel
              key={column.id}
              control={
                <Checkbox
                  checked={visibleColumns.includes(column.name)}
                  onChange={() => toggleColumnVisibility('attackTreeTblClms', column.name)}
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
        <Table stickyHeader sx={{ tableLayout: 'fixed', width: '100%' }} aria-label="simple table">
          <TableHead>
            <TableRow>
              {Head?.map((hd) => (
                <StyledTableCell
                  key={hd.id}
                  style={{
                    width: `${columnWidths[hd.id]}px`,
                    position: 'relative',
                    overflowWrap: 'break-word'
                  }}
                >
                  {hd.name === 'SNO' ? (
                    <Box display="flex" alignItems="center" gap={1}>
                      <Checkbox size="small" checked={isAllSelected} indeterminate={isSomeSelected} onChange={toggleSelectAll} />
                      <TableSortLabel
                        active={orderBy === hd.name}
                        direction={orderBy === hd.name ? order : 'asc'}
                        onClick={() => handleRequestSort(hd.name)}
                      >
                        {hd?.name}
                      </TableSortLabel>
                    </Box>
                  ) : (
                    <TableSortLabel
                      active={orderBy === hd.name}
                      direction={orderBy === hd.name ? order : 'asc'}
                      onClick={() => handleRequestSort(hd.name)}
                    >
                      {hd?.name}
                    </TableSortLabel>
                  )}
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
                    return (
                      <StyledTableCell key={index}>
                        <IconButton
                          size="small"
                          onClick={handleSaveNewRow}
                          color="success"
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
                  } else if (item.name === 'Name' || item.name === 'Description') {
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

            {paginatedRows?.map(renderRow)}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        sx={{
          '& .MuiTablePagination-selectLabel ': { color: color?.sidebarContent },
          '& .MuiSelect-select': { color: color?.sidebarContent },
          '& .MuiTablePagination-displayedRows': { color: color?.sidebarContent }
        }}
        rowsPerPageOptions={[5, 10, 25, 50, 100]}
        component="div"
        count={filteredRows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {deleteConfirmOpen && (
        <ConfirmDeleteDialog
          open={deleteConfirmOpen}
          onClose={closeDeleteConfirm}
          onConfirm={confirmDeleteSelected}
          name={`${selectedRows.length} attack scenario(s)`}
          mode="delete"
        />
      )}
    </>
  );
}
