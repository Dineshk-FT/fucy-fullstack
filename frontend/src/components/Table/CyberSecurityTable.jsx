/*eslint-disable*/
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import useStore from '../../store/Zustand/store';
import { shallow } from 'zustand/shallow';
import { Box } from '@mui/system';
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
  FormControlLabel,
  TableSortLabel
} from '@mui/material';
import ColorTheme from '../../themes/ColorTheme';
import { useSelector } from 'react-redux';
import { tableHeight } from '../../themes/constant';
import ControlPointIcon from '@mui/icons-material/ControlPoint';
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
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

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
  deleteCybersecurity: state.deleteCybersecurity,
  addNewCybersecurityItem: state.addNewCybersecurityItem,
  addScene: state.addcybersecurityScene
});

const notify = (message, status) => toast[status](message);
export default function CybersecurityTable() {
  const { title } = useSelector((state) => state?.pageName);
  const { cybersecuritySubs, getCyberSecurityScenario, model, updateName, deleteCybersecurity, addScene } = useStore(selector, shallow);
  const [isAddingNewRow, setIsAddingNewRow] = useState(false);
  const [newRowData, setNewRowData] = useState({
    Name: '',
    Description: ''
  });

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
  const color = ColorTheme();
  const [rows, setRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtered, setFiltered] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [columnWidths, setColumnWidths] = useState({});
  const [selectedRows, setSelectedRows] = useState([]);
  const [openFilter, setOpenFilter] = useState(false);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('SNo');

  const visibleColumns1 = useStore((state) => state.CybersecurityGoalsTable);
  const visibleColumns2 = useStore((state) => state.CybersecurityRequirementsTable);
  const visibleColumns3 = useStore((state) => state.CybersecurityControlsTable);
  const visibleColumns4 = useStore((state) => state.CybersecurityClaimsTable);
  const toggleColumnVisibility = useStore((state) => state.toggleColumnVisibility);

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

  const getIdName = () => {
    const getName = {
      'Cybersecurity Goals': 'CG',
      'Cybersecurity Requirements': 'CR',
      'Cybersecurity Controls': 'CL',
      'Cybersecurity Claims': 'CC'
    };
    return getName[title];
  };
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

  useEffect(() => {
    const getId = getIdName();
    if (cybersecurity['scenes']) {
      const scene = cybersecurity?.scenes?.map((dt, i) => {
        return {
          SNo: `${getId}${(i + 1).toString().padStart(3, '0')}`,
          ID: dt?.ID,
          Name: dt?.Name,
          Description: dt?.Description ?? `description for ${dt?.Name}`,
          'Related Threat Scenario': dt?.threat_key ?? [],
          'Related Attack Tree': dt?.attack_scene_name ?? ''
        };
      });
      setRows(scene);
    } else {
      setRows([]);
    }
  }, [cybersecurity, title]);

  const handleAddNewRow = () => {
    setIsAddingNewRow(true);
    setNewRowData({
      Name: '',
      Description: ''
    });
  };

  const handleSaveNewRow = () => {
    if (!newRowData.Name.trim()) {
      notify('Name must not be empty', 'error');
      return;
    }
    const details = {
      modelId: model?._id,
      type: cybersecurity?.type ?? cybersecurityType,
      name: newRowData?.Name,
      description: newRowData?.Description
    };

    addScene(details)
      .then((res) => {
        // console.log('res', res);
        if (!res.error) {
          // setTimeout(() => {
          getCyberSecurityScenario(model?._id);
          notify(res.message ?? 'Added successfully', 'success');
          // handleClose();
          setNewRowData({
            Name: '',
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
  const toggleRowSelection = (rowId) => {
    setSelectedRows((prevSelectedRows) =>
      prevSelectedRows.includes(rowId) ? prevSelectedRows.filter((id) => id !== rowId) : [...prevSelectedRows, rowId]
    );
  };

  const handleDeleteSelected = () => {
    const details = {
      id: cybersecurity?._id,
      rowId: selectedRows
    };
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
    const startX = e.clientX;
    const headerCell = e.target.parentNode;
    const startWidth = columnWidths[columnId] || headerCell.offsetWidth;

    const handleMouseMove = (moveEvent) => {
      const delta = moveEvent.clientX - startX;
      const newWidth = Math.max(50, startWidth + delta);

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
          '& .MuiTableCell-root.MuiTableCell-body': {
            color: `${color?.sidebarContent} !important`
          }
        }}
      >
        {Head?.map((item, index) => {
          const isEditableField = item.name === 'Name' || item.name === 'Description';
          let cellContent;
          switch (true) {
            case isEditableField:
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
              cellContent = (
                <StyledTableCell key={index} style={{ width: columnWidths[item.id] || 'auto' }} align={'left'}>
                  {row[item.name] && Array.isArray(row[item.name]) && row[item.name].length
                    ? row[item.name]?.map((key) => (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }} key={key}>
                          <img src={ThreatIcon} alt="threat" height="10px" width="10px" />
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
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} mx={1}>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography sx={{ color: color?.title, fontWeight: 600, fontSize: '16px' }}>{title}</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Button
              variant="outlined"
              sx={{ borderRadius: 1.5 }}
              onClick={handleAddNewRow}
              startIcon={<ControlPointIcon sx={{ fontSize: 'inherit' }} />}
              disabled={isAddingNewRow}
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
                padding: 0.5,
                '& .MuiInputBase-input': {
                  fontSize: '0.75rem',
                  padding: '0.5rem'
                },
                '& .MuiOutlinedInput-root': {
                  height: '30px'
                }
              }}
            />
            <Button
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
            <Button
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
                        'Cybersecurity Goals': 'CybersecurityGoalsTable',
                        'Cybersecurity Requirements': 'CybersecurityRequirementsTable',
                        'Cybersecurity Controls': 'CybersecurityControlsTable',
                        'Cybersecurity Claims': 'CybersecurityClaimsTable'
                      };
                      const visibilityKey = visibilityMap[title];
                      if (visibilityKey) {
                        toggleColumnVisibility(visibilityKey, column.name);
                      }
                    }}
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
        <TableContainer component={Paper} sx={{ borderRadius: '0px', padding: 0.25, maxHeight: tableHeight, scrollbarWidth: 'thin' }}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                {Head?.map((hd) => (
                  <StyledTableCell key={hd?.id} style={{ width: columnWidths[hd.id] || 'auto', position: 'relative' }}>
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

              {filteredRows?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)?.map((row, rowkey) => (
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
          component="div"
          count={paginatedRows.length}
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Box>
      <Toaster position="top-right" reverseOrder={false} />
    </>
  );
}
