/*eslint-disable*/
import * as React from 'react';
import { useState, useRef } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Paper, FormControl, MenuItem, Select, TextField, Typography, styled, Tooltip, TablePagination, InputLabel } from '@mui/material';
import { tooltipClasses } from '@mui/material/Tooltip';
import useStore from '../../Zustand/store';
import { shallow } from 'zustand/shallow';
import KeyboardBackspaceRoundedIcon from '@mui/icons-material/KeyboardBackspaceRounded';
import { makeStyles } from '@mui/styles';
import { useDispatch } from 'react-redux';
import { closeAll } from '../../store/slices/CurrentIdSlice';
import { Box } from '@mui/system';
import ColorTheme from '../../store/ColorTheme';
import { RatingColor, getRating } from './constraints';
import { tableHeight } from '../../store/constant';
import { AttackTableoptions as options } from './constraints';

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
const Head = [
  { id: 1, name: 'SNO' },
  { id: 2, name: 'Name' },
  { id: 3, name: 'Category' },
  { id: 4, name: 'Description' },
  // { id: 5, name: 'Approach' },
  { id: 6, name: 'Elapsed Time' },
  { id: 7, name: 'Expertise' },
  { id: 8, name: 'Knowledge of the Item' },
  { id: 9, name: 'Window of Opportunity' },
  { id: 10, name: 'Equipment' },
  { id: 11, name: 'Attack Vector' },
  { id: 12, name: 'Attack Complexity' },
  { id: 13, name: 'Privileges Required' },
  { id: 14, name: 'User Interaction' },
  { id: 15, name: 'Scope' },
  { id: 16, name: 'Determination Criteria' },
  { id: 17, name: 'Attack Feasibilities Rating' },
  { id: 18, name: 'Attack Feasability Rating Justification' }
];

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
    padding: '2px 8px',
    textAlign: 'center'
  }
}));

const StyledTableRow = styled(TableRow)(() => ({
  // '&:nth-of-type(odd)': {
  //   backgroundColor: theme.palette.action.hover,
  // },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0
  }
}));

const SelectableCell = ({ item, row, handleChange, name }) => {
  const [open, setOpen] = useState(false); // Manage open state of dropdown
  const selectRef = useRef(null); // Reference to select element
  const handleContextMenu = (e) => {
    e.preventDefault(); // Prevent the default context menu from opening
    setOpen(true); // Open dropdown on right-click
  };

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!open) {
      setOpen(true); // Open dropdown on left-click only if not already open
    }
  };

  return (
    <StyledTableCell component="th" scope="row" onClick={handleClick} onContextMenu={handleContextMenu}>
      <FormControl
        sx={{
          width: 130,
          background: 'transparent',
          '& .MuiInputBase-root': { backgroundColor: 'transparent' },
          '& .MuiSelect-select': { backgroundColor: 'transparent' },
          '& .MuiSvgIcon-root': { display: 'none' },
          '& .MuiOutlinedInput-notchedOutline': { border: 'none' }
        }}
      >
        {!row[item.name] && (
          <InputLabel id="demo-simple-select-label" shrink={false}>
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
          name={name}
          open={open}
          onClose={() => setOpen(false)} // Close dropdown when focus is lost
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
                      borderRadius: '4px'
                    }}
                  >
                    {option?.description}
                  </Typography>
                }
              >
                <Typography variant="h5">{option?.label}</Typography>
              </HtmlTooltip>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </StyledTableCell>
  );
};

export default function AttackTreeTable() {
  const color = ColorTheme();
  const classes = useStyles();
  const dispatch = useDispatch();
  const { model, update, attacks, getAttackScenario } = useStore(selector, shallow);
  const [rows, setRows] = React.useState([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filtered, setFiltered] = React.useState([]);
  const [page, setPage] = React.useState(0); // Pagination state
  const [rowsPerPage, setRowsPerPage] = React.useState(10); // Rows per page state
  const [columnWidths, setColumnWidths] = React.useState({});

  React.useEffect(() => {
    if (attacks['scenes']) {
      const mod1 = attacks['scenes']?.map((dt, i) => {
        // console.log('prp', prp);
        return {
          SNO: `AT${(i + 1).toString().padStart(3, '0')}`,
          ID: dt.id || dt?.ID,
          Name: dt.name || dt?.Name,
          Description: `This is the description for ${dt.Name || dt?.name}`,
          // Approach: dt?.Approach ?? '',
          'Elapsed Time': dt['Elapsed Time'] ?? '',
          Expertise: dt?.Expertise ?? '',
          'Knowledge of the Item': dt['Knowledge of the Item'] ?? '',
          'Window of Opportunity': dt['Window of Opportunity'] ?? '',
          Equipment: dt?.Equipment ?? '',
          'Attack Feasibilities Rating': dt['Attack Feasibilities Rating'].length ? dt['Attack Feasibilities Rating'] : 'Low'
        };
      });

      setRows(mod1);
      setFiltered(mod1);
    }
  }, [attacks]);

  // console.log('rows', rows);
  const handleChange = (e, row) => {
    e.stopPropagation();
    const { name, value } = e.target;

    // Update the selected category with the new value
    const updatedRows = rows.map((r) => {
      if (r.ID === row.ID) {
        return { ...r, [name]: value };
      }
      return r;
    });

    // setRows(updatedRows);

    // // Calculate average Attack Feasabilities Rating if the updated category is part of the specified categories
    const calculateAverageRating = (row) => {
      const categories = ['Elapsed Time', 'Expertise', 'Knowledge of the Item', 'Window of Opportunity', 'Equipment'];
      let totalRating = 0;

      categories.forEach((category) => {
        const selectedOption = options[category].find((option) => option.value === row[category]);
        if (selectedOption) {
          totalRating += selectedOption.rating;
        }
      });

      return totalRating;
    };

    const updatedRow = updatedRows.find((r) => r.ID === row.ID);
    const averageRating = calculateAverageRating(updatedRow);
    updatedRow['Attack Feasibilities Rating'] = getRating(averageRating);

    const details = {
      modelId: model?._id,
      type: 'attack',
      id: row?.ID,
      [`${name}`]: value,
      'Attack Feasibilities Rating': getRating(averageRating)
    };

    // console.log('details', details);
    update(details)
      .then((res) => {
        if (res) {
          getAttackScenario(model?._id);
        }
      })
      .catch((err) => console.log('err', err));
  };

  const handleBack = () => {
    dispatch(closeAll());
  };

  // console.log('model', model);

  const handleSearch = (e) => {
    const { value } = e.target;
    if (value.length > 0) {
      // console.log('rows', rows);
      const filterValue = rows.filter((rw) => {
        if (rw?.Name?.toLowerCase().includes(value) || rw?.Description?.toLowerCase().includes(value)) {
          return rw;
        }
      });
      setFiltered(filterValue);
    } else {
      setFiltered(rows);
    }

    setSearchTerm(value);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // console.log('filtered', filtered);
  const checkforLabel = (item) => {
    if (
      item.name === 'Expertise' ||
      item.name === 'Elapsed Time' ||
      item.name === 'Knowledge of the Item' ||
      item.name === 'Window of Opportunity' ||
      item.name === 'Equipment'
      // item.name === 'Approach'
    ) {
      return true;
    }
    return false;
  };

  const handleResizeStart = (e, columnId) => {
    const startX = e.clientX;

    // Use the actual width of the column if no width is set in state
    const headerCell = e.target.parentNode;
    const startWidth = columnWidths[columnId] || headerCell.offsetWidth;

    const handleMouseMove = (moveEvent) => {
      const delta = moveEvent.clientX - startX; // Calculate movement direction
      const newWidth = Math.max(50, startWidth + delta); // Resize based on delta

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
      <>
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
            const bgColor = RatingColor(row['Attack Feasibilities Rating']);
            return (
              <React.Fragment key={index}>
                {checkforLabel(item) ? (
                  <SelectableCell item={item} row={row} handleChange={handleChange} name={item.name} />
                ) : item.name === 'Attack Feasibilities Rating' ? (
                  <StyledTableCell
                    key={index}
                    align={'left'}
                    sx={{ backgroundColor: bgColor, color: bgColor !== 'yellow' ? 'white' : 'black' }}
                  >
                    {row[item.name] ? row[item.name] : '-'}
                  </StyledTableCell>
                ) : (
                  <StyledTableCell key={index} style={{ width: columnWidths[item.id] || 'auto' }} align={'left'}>
                    {row[item.name] ? row[item.name] : '-'}
                  </StyledTableCell>
                )}
              </React.Fragment>
            );
          })}
        </StyledTableRow>
      </>
    );
  };
  // console.log('selectedRow', selectedRow)
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box display="flex" alignItems="center" gap={1}>
          <KeyboardBackspaceRoundedIcon sx={{ cursor: 'pointer', ml: 1, color: color?.title }} onClick={handleBack} />
          <Typography sx={{ color: color?.title, fontWeight: 600, fontSize: '16px' }}>Attack Tree Table</Typography>
        </Box>
        <TextField
          id="outlined-size-small"
          placeholder="Search"
          size="small"
          value={searchTerm}
          onChange={handleSearch}
          sx={{ padding: 1, '& .MuiInputBase-input': { border: '1px solid black' } }}
        />
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          maxHeight: 440,
          borderRadius: '0px',
          padding: 1,
          overflow: 'auto',
          '&::-webkit-scrollbar': {
            width: '4px'
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '10px'
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(0, 0, 0, 0.1)'
          },
          maxHeight: tableHeight,
          scrollbarWidth: 'thin'
        }}
      >
        <Table stickyHeader aria-label="sticky table" sx={{ minWidth: 650 }}>
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
                      backgroundColor: 'transparent',
                      '& .MuiTableCell-root': {
                        transition: 'width 0.2s ease'
                      }
                    }}
                    onMouseDown={(e) => handleResizeStart(e, hd.id)}
                  />
                </StyledTableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered
              ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) // Slice rows for pagination
              ?.map((row, rowKey) => (
                <RenderTableRow key={row?.ID} row={row} rowKey={rowKey} />
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filtered.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
}
