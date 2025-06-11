/*eslint-disable*/
import React, { useEffect, useMemo, useState } from 'react';
import Joyride from 'react-joyride';
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
  useTheme,
  Checkbox,
  TablePagination
} from '@mui/material';
import ColorTheme from '../../themes/ColorTheme';
import { tableHeight } from '../../themes/constant';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { DsDerivedSteps } from '../../utils/Steps';
import { DsDerivationHeader } from './constraints';
import { useDispatch } from 'react-redux';

const label = { inputProps: { 'aria-label': 'Checkbox demo' } };

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
    borderRight: '1px solid rgba(224, 224, 224, 1)',
    fontSize: 13,
    padding: '2px 8px',
    textAlign: 'center'
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 13,
    borderRight: '1px solid rgba(224, 224, 224, 1)',
    padding: '0px 15px',
    textAlign: 'left'
  }
}));

const StyledTableRow = styled(TableRow)(() => ({
  // '&:last-child td, &:last-child th': { border: 0 }
}));

const selector = (state) => ({
  damageScenarios: state.damageScenarios['subs'][0],
  update: state.updateDerivedDamageScenario,
  modelId: state?.model?._id,
  getDamageScenarios: state?.getDamageScenarios
});

const DsDerivationTable = () => {
  const theme = useTheme();
  const color = ColorTheme();
  const dispatch = useDispatch();
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

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    if (['finished', 'skipped'].includes(status)) {
      setRunTour(false);
    }
  };
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

  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return rows;
    return rows.filter((row) => row['Task/Requirement']?.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [rows, searchTerm]);

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
      <Joyride
        steps={DsDerivedSteps}
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
        disableScrolling
      />
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
            {/* <KeyboardBackspaceRoundedIcon sx={{ float: 'left', cursor: 'pointer', ml: 1, color: color?.title }} onClick={handleBack} /> */}
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
                padding: 0.5, // Reduce padding
                '& .MuiInputBase-input': {
                  fontSize: '0.75rem', // Smaller font size
                  padding: '0.5rem' // Adjust padding inside input
                },
                '& .MuiOutlinedInput-root': {
                  height: '30px' // Reduce overall height
                }
              }}
            />
            <Button
              id="filter-columns-btn"
              sx={{
                padding: '0px 8px',
                fontSize: '0.85rem',
                // alignSelf: 'center',
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
                  <StyledTableCell key={hd?.id} style={{ width: columnWidths[hd.id] || 'auto', position: 'relative' }}>
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
                      hd?.name
                    )}
                    {
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
                    }
                  </StyledTableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRows?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)?.map((row, rowkey) => (
                <RenderTableRow row={row} key={rowkey} rowKey={rowkey} />
              ))}
            </TableBody>
          </Table>
          {/* Pagination controls */}
        </TableContainer>
        <TablePagination
          sx={{
            '& .MuiTablePagination-selectLabel ': { color: color?.sidebarContent },
            '& .MuiSelect-select': { color: color?.sidebarContent },
            '& .MuiTablePagination-displayedRows': { color: color?.sidebarContent }
          }}
          component="div"
          count={paginatedRows.length}
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
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
};

export default DsDerivationTable;
