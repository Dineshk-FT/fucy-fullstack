/*eslint-disable*/
import React, { useState, useRef, useMemo, useEffect } from 'react';
import Table from '@mui/material/Table';
import Joyride from 'react-joyride';
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
  TableSortLabel
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
import toast from 'react-hot-toast';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { attackTableSteps } from '../../utils/Steps';

const notify = (message, status) => toast[status](message);
const selector = (state) => ({
  model: state.model,
  update: state.updateAttackScenario,
  getAttackScenario: state.getAttackScenario,
  attacks: state.attackScenarios['subs'][0],
  addScene: state.addAttackScene
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
    borderRight: '1px solid rgba(224, 224, 224, 1) !important',
    padding: '5px',
    fontSize: 13,
    textAlign: 'center'
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 13,
    borderRight: '1px solid rgba(224, 224, 224, 1) !important',
    padding: '2px 8px',
    textAlign: 'center',
    verticalAlign: 'middle'
  }
}));

const StyledTableRow = styled(TableRow)(() => ({
  // '&:nth-of-type(odd)': {
  //   backgroundColor: theme.palette.action.hover,
  // },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0
  },
  // Set a fixed height for each row to accommodate two lines of text with extra space
  height: '3.5em' // Fixed row height
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
    <StyledTableCell id="select-value" component="th" scope="row" onClick={handleClick} onContextMenu={handleContextMenu}>
      <FormControl
        sx={{
          width: 130,
          background: 'transparent',
          '& .MuiInputBase-root': { backgroundColor: 'transparent', color: 'inherit' },
          '& .MuiSelect-select': {
            backgroundColor: 'transparent',
            padding: '0 24px 0 8px', // Remove vertical padding to fit within cell
            fontSize: '13px', // Match font size with other cells
            lineHeight: '1.5em', // Match line height
            height: '1.5em', // Ensure the select fits within one line
            display: 'flex',
            alignItems: 'center' // Center the content vertically
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
};

export default function AttackTreeTable() {
  const color = ColorTheme();
  const { model, update, attacks, getAttackScenario, addScene } = useStore(selector, shallow);
  const [rows, setRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0); // Pagination state
  const [rowsPerPage, setRowsPerPage] = useState(25); // Rows per page state
  const { title } = useSelector((state) => state?.pageName);
  const [openFilter, setOpenFilter] = useState(false); // Manage the filter modal visibility
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

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    if (['finished', 'skipped'].includes(status)) {
      setRunTour(false);
    }
  };
  const Head = useMemo(() => {
    if (title.includes('Derived')) {
      const col = [...column];
      col.splice(4, 0, { id: 14, name: 'Detailed / Combined Threat Scenarios' });
      return col.filter((header) => visibleColumns.includes(header.name));
    } else {
      return column.filter((header) => visibleColumns.includes(header.name));
    }
  }, [title, visibleColumns]);
  const [columnWidths, setColumnWidths] = useState(
    Object.fromEntries(Head?.map((hd) => [hd.id, 180])) // Default 100px width
  );

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
      filtered = filtered.filter(
        (row) =>
          row.Name?.toLowerCase().includes(searchTerm.toLowerCase()) || row.Description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    return stableSort(filtered, getComparator(order, orderBy));
  }, [rows, searchTerm, order, orderBy]);

  const paginatedRows = useMemo(() => {
    return filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredRows, page, rowsPerPage]);

  const handleAddNewRow = () => {
    setIsAddingNewRow(true);
    setNewRowData({
      Name: '',
      Description: ''
    });
  };

  // Open/Close the filter modal
  const handleOpenFilter = () => setOpenFilter(true);
  const handleCloseFilter = () => setOpenFilter(false);

  useEffect(() => {
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
          'Attack Feasibilities Rating': dt['Attack Feasibilities Rating'].length ? dt['Attack Feasibilities Rating'] : ''
        };
      });

      setRows(mod1);
    }
  }, [attacks]);

  // console.log('rows', rows)
  const handleChange = (e, row) => {
    e.stopPropagation();
    const { name, value } = e.target;

    // Store previous state to rollback if needed
    const previousRows = [...rows];

    // Optimistically update the selected category
    const updatedRows = rows.map((r) => {
      if (r.ID === row.ID) {
        return { ...r, [name]: value };
      }
      return r;
    });

    setRows(updatedRows); // Update UI immediately

    // Simulate average rating calculation
    const calculateAverageRating = (row) => {
      const categories = ['Elapsed Time', 'Expertise', 'Knowledge of the Item', 'Window of Opportunity', 'Equipment'];
      let totalRating = 0;

      categories.forEach((category) => {
        const selectedOption = options[category]?.find((option) => option.value === row[category]);
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

    // Simulate a delay before reverting the update if request fails
    update(details)
      .then((res) => {
        if (res) {
          getAttackScenario(model?._id);
        }
      })
      .catch((err) => {
        console.log('err', err);
        setRows(previousRows); // Revert UI to previous state if request fails
      });
  };
  const handleSaveNewRow = () => {
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
        // console.log('res', res);
        if (!res.error) {
          // setTimeout(() => {
          getAttackScenario(model?._id);
          notify(res.message ?? 'Added successfully', 'success');
          // handleClose();
          setNewRowData({
            name: '',
            Description: ''
          });
          // }, 500);
        } else {
          notify(res?.error ?? 'Something went wrong', 'error');
        }
      })
      .catch((err) => {
        if (err) notify('Something went wrong', 'error');
      });
  };

  // console.log('model', model);

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
  };

  const RenderTableRow = ({ row, rowKey, isChild = false }) => {
    const WIDTH_THRESHOLD = 250; // Threshold for switching between truncation and wrapping (in pixels)

    return (
      <>
        <StyledTableRow
          key={row.name}
          data={row}
          sx={{
            backgroundColor: color?.sidebarBG,
            '& .MuiTableCell-root.MuiTableCell-body': {
              color: `${color?.sidebarContent} !important`
            }
          }}
        >
          {Head?.map((item, index) => {
            const bgColor = RatingColor(row['Attack Feasibilities Rating']);
            const textColor = !bgColor?.includes('yellow') ? 'white' : 'black';
            const currentWidth = columnWidths[item.id] || 180; // Get the current width of the column
            const shouldTruncate = currentWidth < WIDTH_THRESHOLD; // Truncate if width is below threshold

            let cellContent;
            switch (true) {
              case checkforLabel(item):
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
                            whiteSpace: 'nowrap', // Truncate text into a single line
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }
                        : {
                            whiteSpace: 'normal', // Wrap text into two lines
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
      </>
    );
  };

  return (
    <>
      <Joyride
        steps={attackTableSteps}
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1} mx={1}>
        <Box display="flex" alignItems="center" gap={1}>
          {/* <KeyboardBackspaceRoundedIcon sx={{ cursor: 'pointer', ml: 1, color: color?.title }} onClick={handleBack} /> */}
          <Typography sx={{ color: color?.title, fontWeight: 600, fontSize: '16px' }}>Attack Tree Table</Typography>
        </Box>
        <Box display="flex" alignItems="center">
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
        sx={{
          maxHeight: 440,
          borderRadius: '0px',
          padding: 0.25,
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
                  <TableSortLabel
                    active={orderBy === hd.name}
                    direction={orderBy === hd.name ? order : 'asc'}
                    onClick={() => handleRequestSort(hd.name)}
                  >
                    {hd?.name}
                  </TableSortLabel>
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
                    // Move action buttons to the first column
                    return (
                      <StyledTableCell key={index}>
                        <IconButton
                          size="small"
                          onClick={handleSaveNewRow}
                          color="success"
                          variant="outlined"
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
                          variant="outlined"
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
        rowsPerPageOptions={[5, 10, 25, 50, 100]}
        component="div"
        count={filteredRows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
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
}
