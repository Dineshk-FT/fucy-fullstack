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
  TablePagination,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useDispatch } from 'react-redux';
import { closeAll } from '../../store/slices/CurrentIdSlice';
import useStore from '../../store/Zustand/store';
import ColorTheme from '../../themes/ColorTheme';
import { tableHeight } from '../../themes/constant';
import { EXTERNAL_CONNECTIVITY_HEADERS } from './constraints';

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
    textAlign: 'center',
  },
}));

const StyledTableRow = styled(TableRow)(() => ({
  '&:last-child td, &:last-child th': { border: 0 },
}));

const SoftwareIntegrityTable = () => {
  const { getCatalog } = useStore();
  const dispatch = useDispatch();
  const color = ColorTheme();
  const [rows, setRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  useEffect(() => {
    const fetchCatalogData = async () => {
      try {
        const catalogData = await getCatalog();
        const extractedRows = Object.entries(catalogData.vehicleDataThreats.threats).flatMap(([threatKey, threatValue], threatIndex) =>
          Object.entries(threatValue.sub_threats).map(([subThreatKey, subThreatValue], subIndex) => ({
            id: catalogData.vehicleDataThreats.ID,
            name: subIndex === 0 ? catalogData.vehicleDataThreats.description : '',
            category: subIndex === 0 ? threatValue.description : '',
            example: `${subThreatKey}. ${subThreatValue}`,
          }))
        );
        setRows(extractedRows);
      } catch (error) {
        console.error('Error fetching catalog data:', error);
        setRows([]);
      }
    };

    fetchCatalogData();
  }, [getCatalog]);

  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return rows;
    return rows.filter(
      (row) =>
        row.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.example?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [rows, searchTerm]);

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

  const handleBack = () => {
    dispatch(closeAll());
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
        <Typography sx={{ color: color?.title, fontWeight: 600, fontSize: '16px' }}>
          Vehicle Data and Software Integrity Table
        </Typography>
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
      </Box>

      <TableContainer
        component={Paper}
        sx={{ borderRadius: '0px', maxHeight: tableHeight, scrollbarWidth: 'thin', padding: 0.25 }}
      >
        <Table stickyHeader sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              {EXTERNAL_CONNECTIVITY_HEADERS.map((header) => (
                <StyledTableCell key={header.id}>{header.name}</StyledTableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.map((row, index) => (
              <StyledTableRow
                key={index}
                sx={{ backgroundColor: color?.sidebarBG, '& .MuiTableCell-body': { color: color?.sidebarContent } }}
              >
                <StyledTableCell>{row.name ? row.id : ''}</StyledTableCell>
                <StyledTableCell>{row.name || ''}</StyledTableCell>
                <StyledTableCell>{row.category || ''}</StyledTableCell>
                <StyledTableCell sx={{ textAlign: 'left' }}>{row.example || ''}</StyledTableCell>
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
        rowsPerPageOptions={[5, 10, 25, 50, 100]}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
};

export default SoftwareIntegrityTable;