import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Typography,
  Box,
  TablePagination,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { tableCellClasses } from '@mui/material/TableCell';
import ColorTheme from '../../themes/ColorTheme';
import { MitigationsHeader } from './constraints';

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
    padding: '0px 8px',
    textAlign: 'left',
  },
}));

const StyledTableRow = styled(TableRow)(() => ({
  '&:last-child td, &:last-child th': { border: 0 },
}));

const MitigationsTable = () => {
  const color = ColorTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return MitigationsHeader;
    return MitigationsHeader.filter((scene) => scene.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm]);

  const paginatedRows = useMemo(() => {
    return filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredRows, page, rowsPerPage]);

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
      <Box display="flex" justifyContent="space-between" alignItems="center" my={1} mx={1}>
        <Typography sx={{ fontWeight: 600, fontSize: '16px', color: color?.title }}>Mitigation Table</Typography>
        <TextField
          placeholder="Search"
          size="small"
          value={searchTerm}
          onChange={handleSearch}
          sx={{
            '& .MuiInputBase-input': { fontSize: '0.75rem', padding: '0.5rem' },
            '& .MuiOutlinedInput-root': { height: '30px', '& fieldset': { borderColor: 'black' } },
          }}
        />
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: '0px', padding: 0.25 }}>
        <Table sx={{ minWidth: 650 }} aria-label="mitigation table">
          <TableHead>
            <TableRow>
              <StyledTableCell>ID</StyledTableCell>
              <StyledTableCell>Mitigation Name</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.map((scene) => (
              <StyledTableRow
                key={scene.id}
                sx={{ backgroundColor: color?.sidebarBG, '& .MuiTableCell-body': { color: color?.sidebarContent } }}
              >
                <StyledTableCell>{scene.id}</StyledTableCell>
                <StyledTableCell>{scene.name}</StyledTableCell>
              </StyledTableRow>
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
        rowsPerPageOptions={[5, 10, 25, 50]}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
};

export default MitigationsTable;