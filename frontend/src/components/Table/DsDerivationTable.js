/*eslint-disable*/
import React, { useEffect, useMemo, useState } from 'react';
import useStore from '../../store/Zustand/store';
import { shallow } from 'zustand/shallow';
import {
  Table,
  TableBody,
  TableCell,
  tableCellClasses,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  styled,
  Checkbox,
  TablePagination,
  TableSortLabel
} from '@mui/material';
import ColorTheme from '../../themes/ColorTheme';
import { tableHeight } from '../../themes/constant';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { DsDerivedSteps } from '../../utils/Steps';
import { DsDerivationHeader } from './constraints';
import AutoGuidePopper from '../Poppers/AutoGuidePopper';

const label = { inputProps: { 'aria-label': 'Checkbox demo' } };

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
    padding: '10px 15px',
    textAlign: 'left',
    verticalAlign: 'middle',
    transition: 'all 0.2s ease-in-out',
    maxWidth: '250px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    '&:last-child': {
      borderRight: 'none',
      paddingRight: '16px',
      textAlign: 'center'
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

const selector = (state) => ({
  // FIXED: Added optional chaining to prevent TypeError crashes during reload/clear
  damageScenarios: state.damageScenarios?.subs?.[0],
  update: state.updateDerivedDamageScenario,
  modelId: state?.model?._id,
  getDamageScenarios: state?.getDamageScenarios
});

const DsDerivationTable = () => {
  const color = ColorTheme();
  const { damageScenarios, update, modelId, getDamageScenarios } = useStore(selector, shallow);
  const [rows, setRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [columnWidths, setColumnWidths] = useState({});
  const [openFilter, setOpenFilter] = useState(false);
  const visibleColumns = useStore((state) => state.DsTable);
  const toggleColumnVisibility = useStore((state) => state.toggleColumnVisibility);
  const [runTour, setRunTour] = useState(false);
  // Sorting state
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('SNo');

  // Open/Close the filter modal
  const handleOpenFilter = () => setOpenFilter(true);
  const handleCloseFilter = () => setOpenFilter(false);

  const Head = useMemo(() => {
    return DsDerivationHeader.filter((header) => visibleColumns.includes(header.name));
  }, [visibleColumns]);

  useEffect(() => {
    if (damageScenarios?.Derivations) {
      const scene = damageScenarios.Derivations.map((dt, i) => ({
        SNo: i + 1,
        id: dt?.id,
        'Task/Requirement': dt?.task,
        'Losses of Cybersecurity Properties': dt?.loss,
        Assets: true,
        'Damage Scenarios': dt?.damageScene,
        Checked: dt?.is_checked === 'true'
      }));
      setRows(scene);
    } else {
      setRows([]);
    }
  }, [damageScenarios]);

  // Add this effect to guarantee data fetches on a hard page reload
  useEffect(() => {
    if (modelId) {
      getDamageScenarios(modelId);
    }
  }, [modelId, getDamageScenarios]);

  // Sorting function
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
      filtered = filtered.filter((row) => row['Task/Requirement']?.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    // Apply sorting
    return stableSort(filtered, getComparator(order, orderBy));
  }, [rows, searchTerm, order, orderBy]);

  const paginatedRows = useMemo(() => {
    return filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredRows, page, rowsPerPage]);

  const handleSelectAll = async (event) => {
    const isChecked = event.target.checked;
    const updatedRows = filteredRows.map((row) => ({ ...row, Checked: isChecked }));
    setRows(updatedRows);

    try {
      const res = await update({ id: damageScenarios?._id, isAllChecked: isChecked });
      if (res) {
        await getDamageScenarios(modelId);
      }
    } catch (err) {
      console.error('Error updating select all:', err);
      setRows(rows); // Revert on error
    }
  };

  const handleChange = async (value, rowId) => {
    const previousRows = [...rows];
    const updatedRows = rows.map((row) => (row.id === rowId ? { ...row, Checked: !value } : row));
    setRows(updatedRows);

    try {
      const res = await update({
        id: damageScenarios?._id,
        isChecked: !value,
        'detail-id': rowId
      });
      if (res) {
        await getDamageScenarios(modelId);
      }
    } catch (err) {
      console.error('Error updating row:', err);
      setRows(previousRows); // Revert on error
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleResizeStart = (e, columnId) => {
    const startX = e.clientX;
    const startWidth = columnWidths[columnId] || 100;

    const handleMouseMove = (moveEvent) => {
      const delta = moveEvent.clientX - startX;
      setColumnWidths((prev) => ({ ...prev, [columnId]: Math.max(50, startWidth + delta) }));
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const RenderTableRow = ({ row }) => {
    return (
      <StyledTableRow
        sx={{
          backgroundColor: color?.sidebarBG,
          '& .MuiTableCell-body': { color: color?.sidebarContent }
        }}
      >
        {Head?.map((item, index) => {
          let cellContent;
          switch (true) {
            case item.name === 'Checked':
              cellContent = (
                <StyledTableCell component="th" scope="row" id="checklist-header">
                  <Checkbox {...label} checked={row[item.name]} onChange={() => handleChange(row[item.name], row?.id)} />
                </StyledTableCell>
              );
              break;
            case typeof row[item.name] === 'boolean':
              cellContent = (
                <StyledTableCell key={index} align={'left'}>
                  {row[item.name] === true ? 'Yes' : row[item.name] === false ? 'No' : '-'}
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

            case typeof row[item.name] === 'object':
              cellContent = (
                <StyledTableCell key={index} align={'left'}>
                  {row[item.name]?.length ? row[item.name].join() : '-'}
                </StyledTableCell>
              );
              break;

            default:
              cellContent = null;
              break;
          }

          return <React.Fragment key={index}>{cellContent}</React.Fragment>;
        })}
      </StyledTableRow>
    );
  };

  return (
    <>
      <AutoGuidePopper steps={DsDerivedSteps} runTour={runTour} setRunTour={setRunTour} />
      <Box
        sx={{
          overflow: 'auto',
          height: '-webkit-fill-available',
          minHeight: 'moz-available',
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
            <Typography sx={{ color: color?.title, fontWeight: 600, fontSize: '16px' }}>Damage Scenario Derivation Table</Typography>
          </Box>
          <Box display="flex" justifyContent="center" gap={1}>
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
          </Box>
        </Box>

        {/* Column Filter Dialog */}
        <Dialog open={openFilter} onClose={handleCloseFilter}>
          <DialogTitle style={{ fontSize: '18px' }}>Column Filters</DialogTitle>
          <DialogContent>
            {DsDerivationHeader.map((column) => (
              <FormControlLabel
                key={column.id}
                control={
                  <Checkbox
                    checked={visibleColumns.includes(column.name)}
                    onChange={() => toggleColumnVisibility('DsTable', column.name)}
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
          sx={{
            '& .MuiPaper-root': { maxHeight: '100vh' },
            borderRadius: '0px',
            padding: 0.25,
            maxHeight: tableHeight,
            scrollbarWidth: 'thin'
          }}
        >
          <Table stickyHeader sx={{ minWidth: 650, height: tableHeight }} aria-label="simple table">
            <TableHead>
              <TableRow>
                {Head?.map((hd) => (
                  <StyledTableCell
                    key={hd?.id}
                    style={{ width: columnWidths[hd.id] || 'auto', position: 'relative' }}
                    sortDirection={orderBy === hd.name ? order : false}
                  >
                    {hd?.name === 'Checked' ? (
                      <Box display="flex" alignItems="center" id="column-header">
                        <Checkbox
                          {...label}
                          checked={filteredRows.length > 0 && filteredRows.every((row) => row.Checked)}
                          indeterminate={filteredRows.some((row) => row.Checked) && !filteredRows.every((row) => row.Checked)}
                          onChange={handleSelectAll}
                        />
                        {hd?.name}
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
              {paginatedRows?.map((row, rowkey) => (
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
          count={filteredRows.length}
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Box>
    </>
  );
};

export default DsDerivationTable;
