/*eslint-disable*/
import React, { useState, useEffect } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import ColorTheme from '../../store/ColorTheme';
import { styled, Paper, Box, Dialog, TablePagination, Typography, TextField, Button } from '@mui/material';
import useStore from '../../Zustand/store';
import KeyboardBackspaceRoundedIcon from '@mui/icons-material/KeyboardBackspaceRounded';
import { tableHeight } from '../../store/constant';

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
    color: 'inherit',
    borderRight: '1px solid rgba(224, 224, 224, 1) !important',
    padding: '0px 8px',
    textAlign: 'center'
  }
}));

const StyledTableRow = styled(TableRow)(() => ({
  '&:last-child td, &:last-child th': { border: 0 }
}));

export default function SoftwareIntegrityTable() {
  const { getCatalog } = useStore();
  const color = ColorTheme();
  const [rows, setRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRows, setFilteredRows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  useEffect(() => {
    const fetchCatalogData = async () => {
      try {
        const catalogData = await getCatalog();
        const extractedRows = extractThreats(catalogData.vehicleDataThreats);
        setRows(extractedRows);
        setFilteredRows(extractedRows);
      } catch (error) {
        console.error('Error fetching catalog data:', error);
      }
    };

    const extractThreats = (data) => {
      const rows = [];
      // Iterate through threats data
      Object.entries(data.threats).forEach(([threatKey, threatValue]) => {
        const threatDescription = threatValue.description;
        Object.entries(threatValue.sub_threats).forEach(([subThreatKey, subThreatValue], idx) => {
          rows.push({
            id: data.ID,
            name: idx === 0 ? data.description : '',
            category: idx === 0 ? threatDescription : '',
            example: `${subThreatKey}. ${subThreatValue}`
          });
        });
      });
      return rows;
    };

    fetchCatalogData();
  }, [getCatalog]);

  const handleSearch = (e) => {
    const { value } = e.target;
    setSearchTerm(value);

    if (value.trim()) {
      const filterValue = rows.filter(
        (row) =>
          row.id.toLowerCase().includes(value.toLowerCase()) ||
          row.name.toLowerCase().includes(value.toLowerCase()) ||
          row.category.toLowerCase().includes(value.toLowerCase()) ||
          row.example.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredRows(filterValue);
    } else {
      setFilteredRows(rows);
    }
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleBack = () => {
    dispatch(closeAll());
  };

  return (
    <>
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
        <Box display="flex" justifyContent="space-between" alignItems="center" my={1}>
          <Box display="flex" alignItems="center" gap={1}>
            <KeyboardBackspaceRoundedIcon sx={{ float: 'left', cursor: 'pointer', ml: 1, color: color?.title }} onClick={handleBack} />
            <Typography sx={{ color: color?.title, fontWeight: 600, fontSize: '16px' }}>
              Vehicle data and software integrity Table
            </Typography>
          </Box>
          <Box>
            <TextField
              id="outlined-size-small"
              placeholder="Search"
              size="small"
              value={searchTerm}
              onChange={handleSearch}
              sx={{
                padding: 1,
                '& .MuiInputBase-input': {
                  border: '1px solid black'
                }
              }}
            />
          </Box>
        </Box>

        <TableContainer stickyHeader component={Paper} sx={{ borderRadius: '0px', maxHeight: tableHeight, scrollbarWidth: 'thin' }}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <StyledTableCell>ID</StyledTableCell>
                <StyledTableCell>Name</StyledTableCell>
                <StyledTableCell>Category</StyledTableCell>
                <StyledTableCell>Example</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                <StyledTableRow
                  key={index}
                  sx={{
                    backgroundColor: color?.sidebarBG,
                    color: color?.sidebarContent
                  }}
                >
                  <StyledTableCell>{row.name ? row.id : ''}</StyledTableCell>
                  <StyledTableCell>{row.name}</StyledTableCell>
                  <StyledTableCell>{row.category}</StyledTableCell>
                  <StyledTableCell style={{ textAlign: 'left' }}>{row.example}</StyledTableCell>
                </StyledTableRow>
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
}
