/*eslint-disable*/
import React, { useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import useStore from '../../Zustand/store';
import { shallow } from 'zustand/shallow';
import { Box } from '@mui/system';
import KeyboardBackspaceRoundedIcon from '@mui/icons-material/KeyboardBackspaceRounded';
import {
  TextField,
  Typography,
  styled,
  Paper,
  Checkbox,
  TablePagination,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel
} from '@mui/material';
import ColorTheme from '../../store/ColorTheme';
import { makeStyles } from '@mui/styles';
import { closeAll } from '../../store/slices/CurrentIdSlice';
import { useDispatch } from 'react-redux';
import { tableHeight } from '../../store/constant';
import { DsDerivationHeader } from './constraints';
import FilterAltIcon from '@mui/icons-material/FilterAlt';

const label = { inputProps: { 'aria-label': 'Checkbox demo' } };

const useStyles = makeStyles({
  div: {
    width: 'max-content'
  }
});

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
    padding: '0px 8px',
    textAlign: 'center'
  }
}));

const StyledTableRow = styled(TableRow)(() => ({
  '&:last-child td, &:last-child th': {
    border: 0
  }
}));

const selector = (state) => ({
  damageScenarios: state.damageScenarios['subs'][0],
  update: state.updateDerivedDamageScenario,
  modelId: state?.model?._id,
  getDamageScenarios: state?.getDamageScenarios
});

export default function DsDerivationTable() {
  const color = ColorTheme();
  const dispatch = useDispatch();
  const classes = useStyles();
  const { damageScenarios, update, modelId, getDamageScenarios } = useStore(selector, shallow);
  const [rows, setRows] = React.useState([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filtered, setFiltered] = React.useState([]);

  const [page, setPage] = React.useState(0); // Add state for page
  const [rowsPerPage, setRowsPerPage] = React.useState(20); // Add state for rows per page
  const [columnWidths, setColumnWidths] = React.useState({});
  const [openFilter, setOpenFilter] = useState(false); // Manage the filter modal visibility
  const visibleColumns = useStore((state) => state.visibleColumns1);
  const toggleColumnVisibility = useStore((state) => state.toggleColumnVisibility);

  // Open/Close the filter modal
  const handleOpenFilter = () => setOpenFilter(true);
  const handleCloseFilter = () => setOpenFilter(false);

  const Head = React.useMemo(() => {
    return DsDerivationHeader.filter((header) => visibleColumns.includes(header.name));
  }, [visibleColumns]);

  React.useEffect(() => {
    if (damageScenarios['Derivations']) {
      const scene = damageScenarios['Derivations']?.map((dt) => {
        return {
          id: dt?.id,
          'Task/Requirement': dt?.task,
          'Losses of Cybersecurity Properties': dt?.loss,
          Assets: dt?.asset,
          'Damage Scenarios': dt?.damageScene,
          Checked: dt?.is_checked === 'true' ? true : false
        };
      });
      setRows(scene);
      setFiltered(scene);
    }
  }, [damageScenarios]);

  const handleChange = (value, rowId) => {
    const details = {
      id: damageScenarios?._id,
      isChecked: !value,
      'detail-id': rowId
    };
    // console.log('details', details);
    update(details)
      .then((res) => {
        if (res) {
          getDamageScenarios(modelId);
        }
      })
      .catch((err) => console.log('err', err));
  };
  const handleSearch = (e) => {
    const { value } = e.target;
    // console.log('value', value);

    if (value.length > 0) {
      const filterValue = rows.filter((rw) => rw['Task/Requirement'].toLowerCase().includes(value.toLowerCase()));
      // console.log('filterValue', filterValue);
      setFiltered(filterValue);
    } else {
      setFiltered(rows);
    }

    setSearchTerm(value);
  };

  const handleBack = () => {
    dispatch(closeAll());
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleResizeStart = (e, columnId) => {
    const startX = e.clientX;

    // Get the starting width of the column
    const headerCell = e.target.parentNode;
    const startWidth = columnWidths[columnId] || headerCell.offsetWidth;

    const handleMouseMove = (moveEvent) => {
      const delta = moveEvent.clientX - startX; // Calculate movement direction
      const newWidth = Math.max(50, startWidth + delta); // Set a minimum width of 50px

      setColumnWidths((prev) => ({ ...prev, [columnId]: newWidth }));
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const RenderTableRow = ({ row, rowKey, isChild = false }) => {
    return (
      <StyledTableRow
        key={row.name}
        data={row}
        sx={{
          '&:last-child td, &:last-child th': { border: 0 },
          '&:nth-of-type(even)': {
            backgroundColor: color?.sidebarBG,
            color: `${color?.sidebarContent} !important`
          },
          '&:nth-of-type(odd)': {
            backgroundColor: color?.sidebarBG,
            color: `${color?.sidebarContent} !important`
          },
          '& .MuiTableCell-root.MuiTableCell-body': {
            backgroundColor: color?.sidebarBG,
            color: `${color?.sidebarContent} !important`
          },
          backgroundColor: isChild ? '#F4F8FE' : '',
          color: `${color?.sidebarContent} !important`
        }}
      >
        {Head?.map((item, index) => {
          let cellContent;
          switch (true) {
            case item.name === 'Checked':
              cellContent = (
                <StyledTableCell component="th" scope="row">
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
                  {row[item.name].length ? row[item.name].join() : '-'}
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
            <Typography sx={{ color: color?.title, fontWeight: 600, fontSize: '16px' }}>Damage Scenario Derivation Table</Typography>
          </Box>
          <Box>
            <TextField
              id="outlined-size-small"
              placeholder="Search"
              size="small"
              value={searchTerm}
              onChange={handleSearch}
              sx={{
                padding: 0.5,  // Reduce padding
                '& .MuiInputBase-input': {
                  fontSize: '0.75rem',  // Smaller font size
                  padding: '0.5rem',    // Adjust padding inside input
                },
                '& .MuiOutlinedInput-root': {
                  height: '30px',  // Reduce overall height
                }
              }}
            />
          </Box>
          <Button
            sx={{
              float: 'right',
              mb: 2,
              backgroundColor: '#4caf50',
              ':hover': {
                backgroundColor: '#388e3c'
              }
            }}
            variant="contained"
            onClick={handleOpenFilter}
          >
            <FilterAltIcon />
            Filter Columns
          </Button>
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
                    onChange={() => toggleColumnVisibility('visibleColumns1', column.name)}
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
            padding: 1,
            maxHeight: '70svh',
            scrollbarWidth: 'thin'
          }}
        >
          <Table stickyHeader sx={{ minWidth: 650, height: tableHeight }} aria-label="simple table">
            <TableHead>
              <TableRow>
                {Head?.map((hd) => (
                  <StyledTableCell key={hd?.id} style={{ width: columnWidths[hd.id] || 'auto', position: 'relative' }}>
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
              {filtered?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)?.map((row, rowkey) => (
                <RenderTableRow row={row} rowKey={rowkey} />
              ))}
            </TableBody>
          </Table>
          {/* Pagination controls */}
        </TableContainer>
        <TablePagination
          component="div"
          count={filtered.length}
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
