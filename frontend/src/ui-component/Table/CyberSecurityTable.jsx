/*eslint-disable*/
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel
} from '@mui/material';
import ColorTheme from '../../store/ColorTheme';
import { makeStyles } from '@mui/styles';
import { closeAll } from '../../store/slices/CurrentIdSlice';
import { useDispatch, useSelector } from 'react-redux';
import { tableHeight } from '../../store/constant';
import ControlPointIcon from '@mui/icons-material/ControlPoint';
import AddCyberSecurityModal from '../Modal/AddCyberSecurityModal';
import EditIcon from '@mui/icons-material/Edit';
import FormPopper from '../Poppers/FormPopper';
import toast, { Toaster } from 'react-hot-toast';
import {
  getCybersecurityType,
  CybersecurityGoalsHeader,
  CybersecurityRequirementsHeader,
  CybersecurityControlsHeader,
  CybersecurityClaimsHeader
} from './constraints';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { ThreatIcon } from '../../assets/icons';
import DeleteIcon from '@mui/icons-material/Delete';

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
  model: state.model,
  cybersecuritySubs: state.cybersecurity['subs'],
  getCyberSecurityScenario: state.getCyberSecurityScenario,
  updateName: state.updateName$DescriptionforCybersecurity,
  deleteCybersecurity: state.deleteCybersecurity
});

const notify = (message, status) => toast[status](message);
export default function CybersecurityTable() {
  const { title } = useSelector((state) => state?.pageName);
  const { cybersecuritySubs, getCyberSecurityScenario, model, updateName, deleteCybersecurity } = useStore(selector, shallow);
  const getCybersecurityScene = useCallback(() => {
    const scene = {
      'Cybersecurity Goals': cybersecuritySubs[0],
      'Cybersecurity Requirements': cybersecuritySubs[1],
      'Cybersecurity Controls': cybersecuritySubs[2],
      'Cybersecurity Claims': cybersecuritySubs[3]
    };
    return scene[title];
  }, [title, cybersecuritySubs]);

  const cybersecurity = getCybersecurityScene();
  const cybersecurityType = getCybersecurityType(title);
  //   console.log('cybersecurity', cybersecurity);
  //   console.log('cybersecurityType', cybersecurityType);
  const color = ColorTheme();
  const dispatch = useDispatch();
  const classes = useStyles();
  const [rows, setRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtered, setFiltered] = useState([]);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0); // Add state for page
  const [rowsPerPage, setRowsPerPage] = useState(25); // Add state for rows per page
  const [columnWidths, setColumnWidths] = useState({});
  const [selectedRows, setSelectedRows] = useState([]);
  // console.log('cybersecurity', cybersecurity);
  const [openFilter, setOpenFilter] = useState(false); // Manage the filter modal visibility
  const visibleColumns1 = useStore((state) => state.visibleColumns5);
  const visibleColumns2 = useStore((state) => state.visibleColumns6);
  const visibleColumns3 = useStore((state) => state.visibleColumns7);
  const visibleColumns4 = useStore((state) => state.visibleColumns8);
  const toggleColumnVisibility = useStore((state) => state.toggleColumnVisibility);

  // Open/Close the filter modal
  const handleOpenFilter = () => setOpenFilter(true);
  const handleCloseFilter = () => setOpenFilter(false);

  const CommonHeader = useMemo(() => {
    const getHeader = {
      'Cybersecurity Goals': CybersecurityGoalsHeader,
      'Cybersecurity Requirements': CybersecurityRequirementsHeader,
      'Cybersecurity Controls': CybersecurityControlsHeader,
      'Cybersecurity Claims': CybersecurityClaimsHeader
    };
    return getHeader[title];
  }, [title]);

  const Head = useMemo(() => {
    if (title == 'Cybersecurity Goals') return CommonHeader?.filter((header) => visibleColumns1.includes(header.name));
    if (title == 'Cybersecurity Requirements') return CommonHeader?.filter((header) => visibleColumns2.includes(header.name));
    if (title == 'Cybersecurity Controls') return CommonHeader?.filter((header) => visibleColumns3.includes(header.name));
    if (title == 'Cybersecurity Claims') return CommonHeader?.filter((header) => visibleColumns4.includes(header.name));
  }, [title, visibleColumns1, visibleColumns2, visibleColumns3, visibleColumns4, CommonHeader]);
  // console.log('CommonHeader', CommonHeader);

  const getIdName = () => {
    const getName = {
      'Cybersecurity Goals': 'CG',
      'Cybersecurity Requirements': 'CR',
      'Cybersecurity Controls': 'CL',
      'Cybersecurity Claims': 'CC'
    };
    return getName[title];
  };

  useEffect(() => {
    const getId = getIdName();
    // console.log('cybersecurity', cybersecurity);
    if (cybersecurity['scenes']) {
      const scene = cybersecurity?.scenes?.map((dt, i) => {
        return {
          SNo: `${getId}${(i + 1).toString().padStart(3, '0')}`,
          ID: dt?.ID,
          Name: dt?.Name,
          Description: dt?.Description ?? `description for ${dt?.Name}`,
          'Related Threat Scenario': dt?.threat_key ?? []
        };
      });
      setRows(scene);
      setFiltered(scene);
    } else {
      setRows([]);
      setFiltered([]);
    }
  }, [cybersecurity, title]);

  const toggleRowSelection = (rowId) => {
    setSelectedRows(
      (prevSelectedRows) =>
        prevSelectedRows.includes(rowId)
          ? prevSelectedRows.filter((id) => id !== rowId) // Unselect if already selected
          : [...prevSelectedRows, rowId] // Select if not selected
    );
  };

  const handleDeleteSelected = () => {
    const details = {
      id: cybersecurity?._id,
      rowId: selectedRows
    };
    // console.log('details', details);
    deleteCybersecurity(details)
      .then((res) => {
        if (!res.error) {
          notify(res.message ?? 'Deleted successfully', 'success');
          getCyberSecurityScenario(model?._id);
          setSelectedRows([]);
        } else {
          notify('Something went wrong', 'error');
        }
      })
      .catch((err) => {
        if (err) notify('Something went wrong', 'error');
      });
  };

  const handleSearch = (e) => {
    const { value } = e.target;
    // console.log('value', value);

    if (value.length > 0) {
      const filterValue = rows.filter((rw) => rw['Name'].toLowerCase().includes(value.toLowerCase()));
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

  // console.log('selectedRows', selectedRows);
  const RenderTableRow = ({ row, rowKey, isChild = false }) => {
    const [hoveredField, setHoveredField] = useState(null);
    const [editingField, setEditingField] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const [isPopperFocused, setIsPopperFocused] = useState(false);
    const isSelected = selectedRows.includes(row.ID);

    const handleEditClick = (event, fieldName, currentValue) => {
      event.stopPropagation();
      setEditingField(fieldName);
      setEditValue(currentValue || '');
      setAnchorEl(event.currentTarget);
    };

    const handleSaveEdit = (e) => {
      e.stopPropagation();
      if (editingField) {
        if (!editValue.trim()) {
          notify('Field must not be empty', 'error');
          return;
        }

        const details = {
          id: cybersecurity?._id,
          sceneId: row?.ID,
          [editingField]: editValue
        };

        updateName(details)
          .then((res) => {
            // console.log('res', res);
            if (!res.error) {
              notify(res.message ?? 'Deleted successfully', 'success');
              getCyberSecurityScenario(model?._id);
              handleClosePopper();
            } else {
              notify(res.error ?? 'Something went wrong', 'error');
            }
          })
          .catch((err) => notify(err.message ?? 'Something went wrong', 'error'));
      }
    };

    const handleClosePopper = () => {
      if (!isPopperFocused) {
        setEditingField(null);
        setEditValue('');
        setAnchorEl(null);
      }
    };
    return (
      <StyledTableRow
        key={row.name}
        data={row}
        sx={{
          backgroundColor: isSelected ? '#FF3800' : isChild ? '#F4F8FE' : color?.sidebarBG,

          color: `${color?.sidebarContent} !important`,
          '&:last-child td, &:last-child th': { border: 0 }
          // '&:nth-of-type(even)': {
          //   backgroundColor: color?.sidebarBG,
          //   color: `${color?.sidebarContent} !important`
          // },
          // '&:nth-of-type(odd)': {
          //   backgroundColor: color?.sidebarBG,
          //   color: `${color?.sidebarContent} !important`
          // },
          // '& .MuiTableCell-root.MuiTableCell-body': {
          //   backgroundColor: color?.sidebarBG,
          //   color: `${color?.sidebarContent} !important`
          // },
          // backgroundColor: isChild ? '#F4F8FE' : '',
          // color: `${color?.sidebarContent} !important`
        }}
      >
        {Head?.map((item, index) => {
          const isEditableField = item.name === 'Name' || item.name === 'Description';
          let cellContent;
          switch (true) {
            case isEditableField:
              {
                cellContent = (
                  <StyledTableCell
                    key={index}
                    onMouseEnter={() => setHoveredField(item.name)}
                    onMouseLeave={() => {
                      if (!anchorEl) setHoveredField(null);
                    }}
                    style={{ position: 'relative', cursor: 'pointer' }}
                  >
                    {row[item.name] || '-'}
                    {(hoveredField === item.name || editingField === item.name) && (
                      <IconButton
                        size="small"
                        onClick={(e) => handleEditClick(e, item.name, row[item.name])}
                        sx={{
                          position: 'absolute',
                          top: '15%',
                          right: '-2px',
                          transform: 'translateY(-50%)'
                        }}
                      >
                        <EditIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    )}
                  </StyledTableCell>
                );
              }
              break;
            case item.name === 'SNo':
              cellContent = (
                <StyledTableCell
                  key={index}
                  sx={{ width: columnWidths[item.id] || 'auto', cursor: 'pointer' }}
                  align="left"
                  onClick={() => toggleRowSelection(row.ID)}
                >
                  {row[item.name] ? row[item.name] : '-'}
                </StyledTableCell>
              );
              break;

            case item.name === 'Related Threat Scenario':
              // console.log('row[item.name] ', row[item.name]);
              cellContent = (
                <StyledTableCell key={index} style={{ width: columnWidths[item.id] || 'auto' }} align={'left'}>
                  {row[item.name] && Array.isArray(row[item.name]) && row[item.name].length
                    ? row[item.name]?.map((key) => (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <img src={ThreatIcon} alt="threat" height="10px" width="10px" key={key} />
                          <span style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: 'max-content' }}>{key}</span>
                        </span>
                      ))
                    : '-'}
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
        {anchorEl && (
          <FormPopper
            anchorEl={anchorEl}
            handleSaveEdit={handleSaveEdit}
            handleClosePopper={handleClosePopper}
            editValue={editValue}
            setEditValue={setEditValue}
            editingField={editingField}
            setIsPopperFocused={setIsPopperFocused}
          />
        )}
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
            <Typography sx={{ color: color?.title, fontWeight: 600, fontSize: '16px' }}>{title}</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Button
              variant="outlined"
              sx={{ borderRadius: 1.5 }}
              onClick={() => setOpen(true)}
              startIcon={<ControlPointIcon sx={{ fontSize: 'inherit' }} />}
            >
              Add new
            </Button>
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
            <Button
              sx={{
                float: 'right',
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
            <Button
              sx={{ float: 'right' }}
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteSelected}
              disabled={selectedRows.length === 0}
            >
              Delete
            </Button>
          </Box>
        </Box>

        {/* Column Filter Dialog */}
        <Dialog open={openFilter} onClose={handleCloseFilter}>
          <DialogTitle style={{ fontSize: '18px' }}>Column Filters</DialogTitle>
          <DialogContent>
            {CommonHeader?.map((column) => (
              <FormControlLabel
                key={column.id}
                control={
                  <Checkbox
                    checked={(() => {
                      const visibilityMap = {
                        'Cybersecurity Goals': visibleColumns1,
                        'Cybersecurity Requirements': visibleColumns2,
                        'Cybersecurity Controls': visibleColumns3,
                        'Cybersecurity Claims': visibleColumns4
                      };
                      return visibilityMap[title]?.includes(column.name) || false;
                    })()}
                    onChange={() => {
                      const visibilityMap = {
                        'Cybersecurity Goals': 'visibleColumns5',
                        'Cybersecurity Requirements': 'visibleColumns6',
                        'Cybersecurity Controls': 'visibleColumns7',
                        'Cybersecurity Claims': 'visibleColumns8'
                      };
                      const visibilityKey = visibilityMap[title];
                      if (visibilityKey) {
                        toggleColumnVisibility(visibilityKey, column.name);
                      }
                    }}
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
        <TableContainer component={Paper} sx={{ borderRadius: '0px', padding: 1, maxHeight: tableHeight, scrollbarWidth: 'thin' }}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
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
      {open && (
        <AddCyberSecurityModal
          open={open}
          handleClose={() => setOpen(false)}
          name={title}
          id={cybersecurity?._id}
          type={cybersecurity?.type ?? cybersecurityType}
        />
      )}
      <Toaster position="top-right" reverseOrder={false} />
    </>
  );
}
