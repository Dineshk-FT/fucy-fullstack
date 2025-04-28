/*eslint-disable*/
import React, { useState, useEffect, useMemo } from 'react';
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
  Checkbox,
  TablePagination,
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import useStore from '../../store/Zustand/store';
import { shallow } from 'zustand/shallow';
import { useDispatch } from 'react-redux';
import { closeAll } from '../../store/slices/CurrentIdSlice';
import ColorTheme from '../../themes/ColorTheme';
import { tableHeight } from '../../themes/constant';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { DsDerivationHeader } from './constraints';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
    borderRight: '1px solid rgba(224, 224, 224, 1)',
    fontSize: 13,
    padding: '2px 8px',
    textAlign: 'center',
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 13,
    borderRight: '1px solid rgba(224, 224, 224, 1)',
    padding: '0px 15px',
    textAlign: 'left',
  },
}));

const StyledTableRow = styled(TableRow)(() => ({
  '&:last-child td, &:last-child th': { border: 0 },
}));

const selector = (state) => ({
  damageScenarios: state.damageScenarios['subs'][0],
  update: state.updateDerivedDamageScenario,
  modelId: state?.model?._id,
  getDamageScenarios: state?.getDamageScenarios,
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
        Checked: dt?.is_checked === 'true',
      }));
      setRows(scene);
    } else {
      setRows([]);
    }
  }, [damageScenarios]);

  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return rows;
    return rows.filter((row) =>
      row['Task/Requirement']?.toLowerCase().includes(searchTerm.toLowerCase())
    );
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
        'detail-id': rowId,
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

  const handleBack = () => {
    dispatch(closeAll());
  };

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
          '& .MuiTableCell-body': { color: color?.sidebarContent },
        }}
      >
        {Head.map((item, index) => (
          <StyledTableCell
            key={index}
            sx={{ width: columnWidths[item.id] || 'auto' }}
            component={item.name === 'Checked' ? 'th' : 'td'}
            scope={item.name === 'Checked' ? 'row' : undefined}
          >
            {item.name === 'Checked' ? (
              <Checkbox
                checked={row[item.name]}
                onChange={() => handleChange(row[item.name], row?.id)}
              />
            ) : typeof row[item.name] === 'boolean' ? (
              row[item.name] ? 'Yes' : 'No'
            ) : typeof row[item.name] === 'object' && row[item.name]?.length ? (
              row[item.name].join(', ')
            ) : (
              row[item.name] || '-'
            )}
          </StyledTableCell>
        ))}
      </StyledTableRow>
    );
  };

  return (
    <Box
      sx={{
        overflow: 'auto',
        height: '100%',
        '&::-webkit-scrollbar': { width: '4px' },
        '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(0, 0, 0, 0.2)', borderRadius: '10px' },
        '&::-webkit-scrollbar-track': { background: 'rgba(0, 0, 0, 0.1)' },
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} mx={1}>
        <Typography sx={{ color: color?.title, fontWeight: 600, fontSize: '16px' }}>
          Damage Scenario Derivation Table
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <TextField
            placeholder="Search"
            size="small"
            value={searchTerm}
            onChange={handleSearch}
            sx={{
              '& .MuiInputBase-input': { fontSize: '0.75rem', padding: '0.5rem' },
              '& .MuiOutlinedInput-root': { height: '30px' },
            }}
          />
          <Button
            variant="contained"
            onClick={() => setOpenFilter(true)}
            sx={{
              fontSize: '0.85rem',
              backgroundColor: '#4caf50',
              ':hover': { backgroundColor: '#388e3c' },
            }}
          >
            <FilterAltIcon sx={{ fontSize: 20, mr: 1 }} />
            Filter Columns
          </Button>
        </Box>
      </Box>

      <Dialog open={openFilter} onClose={() => setOpenFilter(false)}>
        <DialogTitle>Column Filters</DialogTitle>
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
          <Button variant="contained" onClick={() => setOpenFilter(false)} color="warning">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <TableContainer
        component={Paper}
        sx={{ borderRadius: '0px', padding: 0.25, maxHeight: tableHeight, scrollbarWidth: 'thin' }}
      >
        <Table stickyHeader sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              {Head.map((hd) => (
                <StyledTableCell key={hd.id} sx={{ width: columnWidths[hd.id] || 'auto', position: 'relative' }}>
                  {hd.name === 'Checked' ? (
                    <Box display="flex" alignItems="center">
                      <Checkbox
                        checked={filteredRows.length > 0 && filteredRows.every((row) => row.Checked)}
                        indeterminate={filteredRows.some((row) => row.Checked) && !filteredRows.every((row) => row.Checked)}
                        onChange={handleSelectAll}
                      />
                      {hd.name}
                    </Box>
                  ) : (
                    hd.name
                  )}
                  <Box
                    className="resize-handle"
                    sx={{
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      width: '5px',
                      height: '100%',
                      cursor: 'col-resize',
                    }}
                    onMouseDown={(e) => handleResizeStart(e, hd.id)}
                  />
                </StyledTableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.map((row, index) => (
              <RenderTableRow key={index} row={row} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        sx={{
          '& .MuiTablePagination-selectLabel, & .MuiSelect-select, & .MuiTablePagination-displayedRows': {
            color: color?.sidebarContent,
          },
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
  );
};

export default DsDerivationTable;