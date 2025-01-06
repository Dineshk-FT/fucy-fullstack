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
import { TextField, Typography, styled, Paper, Checkbox, TablePagination, Button, IconButton } from '@mui/material';
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
import { getCybersecurityType } from './constraints';

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
  updateName: state.updateName$DescriptionforCyberscurity
});

const notify = (message, status) => toast[status](message);
export default function CybersecurityTable() {
  const { title } = useSelector((state) => state?.pageName);
  const { cybersecuritySubs, getCyberSecurityScenario, model, updateName } = useStore(selector, shallow);
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
  const [rowsPerPage, setRowsPerPage] = useState(5); // Add state for rows per page
  const [columnWidths, setColumnWidths] = useState({});
  // console.log('cybersecurity', cybersecurity);

  const Head = useMemo(() => {
    return [
      { id: 1, name: 'SNo' },
      { id: 2, name: 'Name' },
      { id: 3, name: 'Description' },
      { id: 4, name: 'Condition for Re-Evaluation' },
      { id: 5, name: 'Related Threat Scenario' }
    ];
  }, []);

  useEffect(() => {
    if (cybersecurity['scenes']) {
      const scene = cybersecurity['scenes']?.map((dt, i) => {
        return {
          SNo: `CL${(i + 1).toString().padStart(3, '0')}`,
          ID: dt?.ID,
          Name: dt?.Name,
          Description: dt?.Description ?? `description for ${dt?.Name}`
        };
      });
      setRows(scene);
      setFiltered(scene);
    }
  }, [cybersecurity, title]);

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

  const RenderTableRow = ({ row, rowKey, isChild = false }) => {
    const [hoveredField, setHoveredField] = useState(null);
    const [editingField, setEditingField] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const [isPopperFocused, setIsPopperFocused] = useState(false);

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
            console.log('res', res);
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
          </Box>
        </Box>
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
