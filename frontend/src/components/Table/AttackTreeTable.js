/*eslint-disable*/
import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  tableCellClasses,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  MenuItem,
  Select,
  TextField,
  Typography,
  Tooltip,
  TablePagination,
  InputLabel,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { tooltipClasses } from '@mui/material/Tooltip';
import useStore from '../../store/Zustand/store';
import { shallow } from 'zustand/shallow';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { useDispatch, useSelector } from 'react-redux';
import { closeAll } from '../../store/slices/CurrentIdSlice';
import { Box } from '@mui/system';
import { RatingColor, getRating } from './constraints';
import { tableHeight } from '../../themes/constant';
import { AttackTableoptions as options, AttackTableHeader } from './constraints';

const selector = (state) => ({
  model: state.model,
  update: state.updateAttackScenario,
  getAttackScenario: state.getAttackScenario,
  attacks: state.attackScenarios['subs'][0]
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

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
    borderRight: '1px solid rgba(224, 224, 224, 1)',
    padding: '5px',
    fontSize: 13,
    textAlign: 'center'
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 13,
    borderRight: '1px solid rgba(224, 224, 224, 1)',
    padding: '2px 8px',
    textAlign: 'center',
    verticalAlign: 'middle'
  }
}));

const StyledTableRow = styled(TableRow)(() => ({
  height: '3.5em',
  '&:last-child td, &:last-child th': {
    border: 0
  }
}));

const SelectableCell = ({ item, row, handleChange, name }) => {
  const [open, setOpen] = useState(false);
  const selectRef = useRef(null);

  const handleContextMenu = (e) => {
    e.preventDefault();
    setOpen(true);
  };

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!open) setOpen(true);
  };

  return (
    <StyledTableCell onClick={handleClick} onContextMenu={handleContextMenu}>
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
          <InputLabel sx={{ top: -16 }} shrink={false}>
            Select Value
          </InputLabel>
        )}
        <Select
          ref={selectRef}
          value={row[item.name] || ''}
          onChange={(e) => handleChange(e, row)}
          name={name}
          open={open}
          onClose={() => setOpen(false)}
        >
          {options[item.name]?.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              <HtmlTooltip
                placement="left"
                title={
                  <Typography sx={{ fontSize: '14px', fontWeight: 600, padding: '8px', borderRadius: '4px' }}>
                    {option.description}
                  </Typography>
                }
              >
                <Typography variant="h5">{option.label}</Typography>
              </HtmlTooltip>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </StyledTableCell>
  );
};

const AttackTreeTable = () => {
  const theme = useTheme();
  const { model, update, attacks, getAttackScenario } = useStore(selector, shallow);
  const [rows, setRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const { title } = useSelector((state) => state?.pageName);
  const [openFilter, setOpenFilter] = useState(false);
  const visibleColumns = useStore((state) => state.attackTreeTblClms);
  const toggleColumnVisibility = useStore((state) => state.toggleColumnVisibility);
  const [columnWidths, setColumnWidths] = useState({});

  const Head = useMemo(() => {
    const headers = title.includes('Derived')
      ? [...AttackTableHeader, { id: 14, name: 'Detailed / Combined Threat Scenarios' }]
      : AttackTableHeader;
    return headers.filter((header) => visibleColumns.includes(header.name));
  }, [title, visibleColumns]);

  useEffect(() => {
    setColumnWidths(Object.fromEntries(Head.map((hd) => [hd.id, 180])));
  }, [Head]);

  useEffect(() => {
    if (attacks?.scenes) {
      const formattedRows = attacks.scenes.map((dt, i) => ({
        SNO: `AT${(i + 1).toString().padStart(3, '0')}`,
        ID: dt.id || dt.ID,
        Name: dt.name || dt.Name,
        Description: `This is the description for ${dt.Name || dt.name}`,
        'Elapsed Time': dt['Elapsed Time'] ?? '',
        Expertise: dt.Expertise ?? '',
        'Knowledge of the Item': dt['Knowledge of the Item'] ?? '',
        'Window of Opportunity': dt['Window of Opportunity'] ?? '',
        Equipment: dt.Equipment ?? '',
        'Attack Feasibilities Rating': dt['Attack Feasibilities Rating'] || ''
      }));
      setRows(formattedRows);
    }
  }, [attacks]);

  const filteredRows = useMemo(() => {
    if (!searchTerm) return rows;
    return rows.filter(
      (rw) => rw.Name?.toLowerCase().includes(searchTerm.toLowerCase()) || rw.Description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [rows, searchTerm]);

  const paginatedRows = useMemo(() => {
    return filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredRows, page, rowsPerPage]);

  const handleChange = async (e, row) => {
    e.stopPropagation();
    const { name, value } = e.target;
    const previousRows = [...rows];

    const updatedRows = rows.map((r) => (r.ID === row.ID ? { ...r, [name]: value } : r));
    setRows(updatedRows);

    const updatedRow = updatedRows.find((r) => r.ID === row.ID);
    const averageRating = ['Elapsed Time', 'Expertise', 'Knowledge of the Item', 'Window of Opportunity', 'Equipment'].reduce(
      (total, category) => {
        const selectedOption = options[category]?.find((opt) => opt.value === updatedRow[category]);
        return total + (selectedOption ? selectedOption.rating : 0);
      },
      0
    );

    updatedRow['Attack Feasibilities Rating'] = getRating(averageRating);

    try {
      await update({
        modelId: model?._id,
        type: 'attack',
        id: row.ID,
        [name]: value,
        'Attack Feasibilities Rating': getRating(averageRating)
      });
      await getAttackScenario(model?._id);
    } catch (err) {
      setRows(previousRows);
    }
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
    const startX = e.clientX;
    const startWidth = columnWidths[columnId] || 180;

    const handleMouseMove = (moveEvent) => {
      const delta = moveEvent.clientX - startX;
      setColumnWidths((prev) => ({ ...prev, [columnId]: Math.max(80, startWidth + delta) }));
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const isSelectableColumn = (name) =>
    ['Expertise', 'Elapsed Time', 'Knowledge of the Item', 'Window of Opportunity', 'Equipment'].includes(name);

  const RenderTableRow = ({ row }) => {
    const WIDTH_THRESHOLD = 250;

    return (
      <StyledTableRow sx={{ backgroundColor: theme.palette.background.default }}>
        {Head.map((item, index) => {
          const bgColor = RatingColor(row['Attack Feasibilities Rating']);
          const textColor = bgColor?.includes('yellow') ? 'black' : 'white';
          const currentWidth = columnWidths[item.id] || 180;
          const shouldTruncate = currentWidth < WIDTH_THRESHOLD;

          const cellStyles = {
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
          };

          return (
            <React.Fragment key={index}>
              {isSelectableColumn(item.name) ? (
                <SelectableCell item={item} row={row} handleChange={handleChange} name={item.name} />
              ) : item.name === 'Attack Feasibilities Rating' ? (
                <StyledTableCell sx={{ backgroundColor: bgColor, color: textColor }}>{row[item.name] || '-'}</StyledTableCell>
              ) : (
                <StyledTableCell style={{ width: currentWidth }} sx={cellStyles}>
                  <Tooltip title={row[item.name] || '-'} placement="top">
                    <span>{row[item.name] || '-'}</span>
                  </Tooltip>
                </StyledTableCell>
              )}
            </React.Fragment>
          );
        })}
      </StyledTableRow>
    );
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1} mx={1}>
        <Typography sx={{ color: theme.palette.text.primary, fontWeight: 600, fontSize: '16px' }}>Attack Tree Table</Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <TextField
            placeholder="Search"
            size="small"
            value={searchTerm}
            onChange={handleSearch}
            sx={{ '& .MuiInputBase-input': { border: '1px solid black' } }}
          />
          <Button
            variant="contained"
            onClick={() => setOpenFilter(true)}
            sx={{
              fontSize: '0.85rem',
              backgroundColor: '#4caf50',
              ':hover': { backgroundColor: '#388e3c' }
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
          <Button variant="contained" onClick={() => setOpenFilter(false)} color="warning">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <TableContainer
        component={Paper}
        sx={{
          maxHeight: tableHeight,
          borderRadius: '0px',
          padding: 0.25,
          overflow: 'auto',
          '&::-webkit-scrollbar': { width: '4px' },
          '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(0, 0, 0, 0.2)', borderRadius: '10px' },
          '&::-webkit-scrollbar-track': { background: 'rgba(0, 0, 0, 0.1)' },
          scrollbarWidth: 'thin'
        }}
      >
        <Table stickyHeader sx={{ tableLayout: 'fixed', width: '100%' }}>
          <TableHead>
            <TableRow>
              {Head.map((hd) => (
                <StyledTableCell key={hd.id} style={{ width: columnWidths[hd.id], position: 'relative', overflowWrap: 'break-word' }}>
                  {hd.name}
                  <Box
                    className="resize-handle"
                    sx={{
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      width: '5px',
                      height: '100%',
                      cursor: 'col-resize'
                    }}
                    onMouseDown={(e) => handleResizeStart(e, hd.id)}
                  />
                </StyledTableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.map((row) => (
              <RenderTableRow key={row.ID} row={row} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50, 100]}
        component="div"
        count={filteredRows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{
          '& .MuiTablePagination-selectLabel, & .MuiSelect-select, & .MuiTablePagination-displayedRows': {
            color: theme.palette.text.primary
          }
        }}
      />
    </Box>
  );
};

export default AttackTreeTable;
