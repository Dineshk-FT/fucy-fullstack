/*eslint-disable*/
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  Button,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Checkbox,
  TablePagination,
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import useStore from '../../store/Zustand/store';
import { shallow } from 'zustand/shallow';
import { useDispatch, useSelector } from 'react-redux';
import { closeAll } from '../../store/slices/CurrentIdSlice';
import ColorTheme from '../../themes/ColorTheme';
import { tableHeight } from '../../themes/constant';
import ControlPointIcon from '@mui/icons-material/ControlPoint';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { ThreatIcon } from '../../assets/icons';
import AddCyberSecurityModal from '../Modal/AddCyberSecurityModal';
import FormPopper from '../Poppers/FormPopper';
import toast, { Toaster } from 'react-hot-toast';
import {
  getCybersecurityType,
  CybersecurityGoalsHeader,
  CybersecurityRequirementsHeader,
  CybersecurityControlsHeader,
  CybersecurityClaimsHeader,
} from './constraints';

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

const selector = (state) => ({
  model: state.model,
  cybersecuritySubs: state.cybersecurity['subs'],
  getCyberSecurityScenario: state.getCyberSecurityScenario,
  updateName: state.updateName$DescriptionforCybersecurity,
  deleteCybersecurity: state.deleteCybersecurity,
});

const CybersecurityTable = () => {
  const theme = useTheme();
  const { title } = useSelector((state) => state?.pageName);
  const { cybersecuritySubs, getCyberSecurityScenario, model, updateName, deleteCybersecurity } = useStore(selector, shallow);
  const dispatch = useDispatch();
  const color = ColorTheme();
  const [rows, setRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [columnWidths, setColumnWidths] = useState({});
  const [selectedRows, setSelectedRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);
  const visibleColumns = useStore((state) => ({
    CybersecurityGoalsTable: state.CybersecurityGoalsTable,
    CybersecurityRequirementsTable: state.CybersecurityRequirementsTable,
    CybersecurityControlsTable: state.CybersecurityControlsTable,
    CybersecurityClaimsTable: state.CybersecurityClaimsTable,
  }));
  const toggleColumnVisibility = useStore((state) => state.toggleColumnVisibility);

  const getCybersecurityScene = useCallback(() => {
    const sceneMap = {
      'Cybersecurity Goals': cybersecuritySubs[0],
      'Cybersecurity Requirements': cybersecuritySubs[1],
      'Cybersecurity Controls': cybersecuritySubs[2],
      'Cybersecurity Claims': cybersecuritySubs[3],
    };
    return sceneMap[title] || {};
  }, [title, cybersecuritySubs]);

  const cybersecurity = getCybersecurityScene();
  const cybersecurityType = getCybersecurityType(title);

  const CommonHeader = useMemo(() => {
    const headerMap = {
      'Cybersecurity Goals': CybersecurityGoalsHeader,
      'Cybersecurity Requirements': CybersecurityRequirementsHeader,
      'Cybersecurity Controls': CybersecurityControlsHeader,
      'Cybersecurity Claims': CybersecurityClaimsHeader,
    };
    return headerMap[title] || [];
  }, [title]);

  const Head = useMemo(() => {
    const visibilityMap = {
      'Cybersecurity Goals': visibleColumns.CybersecurityGoalsTable,
      'Cybersecurity Requirements': visibleColumns.CybersecurityRequirementsTable,
      'Cybersecurity Controls': visibleColumns.CybersecurityControlsTable,
      'Cybersecurity Claims': visibleColumns.CybersecurityClaimsTable,
    };
    return CommonHeader.filter((header) => visibilityMap[title]?.includes(header.name));
  }, [title, visibleColumns, CommonHeader]);

  const getIdName = useCallback(() => {
    const idMap = {
      'Cybersecurity Goals': 'CG',
      'Cybersecurity Requirements': 'CR',
      'Cybersecurity Controls': 'CL',
      'Cybersecurity Claims': 'CC',
    };
    return idMap[title] || '';
  }, [title]);

  useEffect(() => {
    const getId = getIdName();
    if (cybersecurity.scenes) {
      const scene = cybersecurity.scenes.map((dt, i) => ({
        SNo: `${getId}${(i + 1).toString().padStart(3, '0')}`,
        ID: dt.ID,
        Name: dt.Name,
        Description: dt.Description ?? `description for ${dt.Name}`,
        'Related Threat Scenario': dt.threat_key ?? [],
      }));
      setRows(scene);
    } else {
      setRows([]);
    }
  }, [cybersecurity]);

  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return rows;
    return rows.filter((row) => row.Name?.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [rows, searchTerm]);

  const paginatedRows = useMemo(() => {
    return filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredRows, page, rowsPerPage]);

  const toggleRowSelection = (rowId) => {
    setSelectedRows((prev) =>
      prev.includes(rowId) ? prev.filter((id) => id !== rowId) : [...prev, rowId]
    );
  };

  const handleDeleteSelected = async () => {
    try {
      const res = await deleteCybersecurity({ id: cybersecurity._id, rowId: selectedRows });
      if (!res.error) {
        toast.success(res.message ?? 'Deleted successfully');
        await getCyberSecurityScenario(model?._id);
        setSelectedRows([]);
      } else {
        toast.error(res.error ?? 'Something went wrong');
      }
    } catch (err) {
      toast.error(err.message ?? 'Something went wrong');
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const handleBack = () => {
    dispatch(closeAll());
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
    const startWidth = columnWidths[columnId] || 100;

    const handleMouseMove = (moveEvent) => {
      const delta = moveEvent.clientX - startX;
      setColumnWidths((prev) => ({ ...prev, [columnId]: Math.max(50, startWidth + delta) }));
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const RenderTableRow = ({ row }) => {
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

    const handleSaveEdit = async (e) => {
      e.stopPropagation();
      if (editingField && !editValue.trim()) {
        toast.error('Field must not be empty');
        return;
      }

      try {
        const res = await updateName({
          id: cybersecurity._id,
          sceneId: row.ID,
          [editingField]: editValue,
        });
        if (!res.error) {
          toast.success(res.message ?? 'Updated successfully');
          await getCyberSecurityScenario(model?._id);
          handleClosePopper();
        } else {
          toast.error(res.error ?? 'Something went wrong');
        }
      } catch (err) {
        toast.error(err.message ?? 'Something went wrong');
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
        sx={{
          backgroundColor: isSelected ? '#FF3800' : color?.sidebarBG,
          '& .MuiTableCell-body': { color: color?.sidebarContent },
        }}
      >
        {Head.map((item, index) => {
          const isEditableField = item.name === 'Name' || item.name === 'Description';
          return (
            <React.Fragment key={index}>
              {isEditableField ? (
                <StyledTableCell
                  onMouseEnter={() => setHoveredField(item.name)}
                  onMouseLeave={() => !anchorEl && setHoveredField(null)}
                  sx={{ position: 'relative', cursor: 'pointer' }}
                >
                  {row[item.name] || '-'}
                  {(hoveredField === item.name || editingField === item.name) && (
                    <IconButton
                      size="small"
                      onClick={(e) => handleEditClick(e, item.name, row[item.name])}
                      sx={{ position: 'absolute', top: '15%', right: '-2px', transform: 'translateY(-50%)' }}
                    >
                      <EditIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  )}
                </StyledTableCell>
              ) : item.name === 'SNo' ? (
                <StyledTableCell
                  sx={{ width: columnWidths[item.id] || 'auto', cursor: 'pointer' }}
                  onClick={() => toggleRowSelection(row.ID)}
                >
                  {row[item.name] || '-'}
                </StyledTableCell>
              ) : item.name === 'Related Threat Scenario' ? (
                <StyledTableCell sx={{ width: columnWidths[item.id] || 'auto', textAlign: 'left' }}>
                  {row[item.name]?.length ? (
                    row[item.name].map((key) => (
                      <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <img src={ThreatIcon} alt="threat" height="10px" width="10px" />
                        <span>{key}</span>
                      </Box>
                    ))
                  ) : (
                    '-'
                  )}
                </StyledTableCell>
              ) : typeof row[item.name] === 'object' ? (
                <StyledTableCell sx={{ width: columnWidths[item.id] || 'auto', textAlign: 'left' }}>
                  {row[item.name]?.length ? row[item.name].join(', ') : '-'}
                </StyledTableCell>
              ) : (
                <StyledTableCell sx={{ width: columnWidths[item.id] || 'auto', textAlign: 'left' }}>
                  {row[item.name] || '-'}
                </StyledTableCell>
              )}
            </React.Fragment>
          );
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
    <Box
      sx={{
        overflow: 'auto',
        height: '100%',
        '&::-webkit-scrollbar': { width: '4px' },
        '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(0, 0, 0, 0.2)', borderRadius: '10px' },
        '&::-webkit-scrollbar-track': { background: 'rgba(0, 0, 0, 0.1)' },
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} mx={1}>
        <Typography sx={{ color: color?.title, fontWeight: 600, fontSize: '16px' }}>{title}</Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <Button
            variant="outlined"
            sx={{ borderRadius: 1.5 }}
            onClick={() => setOpen(true)}
            startIcon={<ControlPointIcon />}
          >
            Add new
          </Button>
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
          <Button
            variant="contained"
            onClick={() => setOpenFilter(true)}
            sx={{
              fontSize: '0.85rem',
              backgroundColor: '#4caf50',
              ':hover': { backgroundColor: '#388e3c' },
            }}
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

      <Dialog open={openFilter} onClose={() => setOpenFilter(false)}>
        <DialogTitle>Column Filters</DialogTitle>
        <DialogContent>
          {CommonHeader.map((column) => (
            <FormControlLabel
              key={column.id}
              control={
                <Checkbox
                  checked={Head.some((h) => h.name === column.name)}
                  onChange={() =>
                    toggleColumnVisibility(
                      {
                        'Cybersecurity Goals': 'CybersecurityGoalsTable',
                        'Cybersecurity Requirements': 'CybersecurityRequirementsTable',
                        'Cybersecurity Controls': 'CybersecurityControlsTable',
                        'Cybersecurity Claims': 'CybersecurityClaimsTable',
                      }[title],
                      column.name
                    )
                  }
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
        sx={{ borderRadius: '0px', padding: 0.25, maxHeight: tableHeight, scrollbarWidth: 'thin' }}
      >
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              {Head.map((hd) => (
                <StyledTableCell key={hd.id} sx={{ width: columnWidths[hd.id] || 'auto', position: 'relative' }}>
                  {hd.name}
                  <Box
                    className="resize-handle"
                    sx={{
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      width: '5px',
                      height: '100%',
                      cursor: 'col-resize',
                    }}
                    onMouseDown={(e) => handleResizeStart(e, hd.id)}
                  />
                </StyledTableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.map((row, index) => (
              <RenderTableRow key={index} row={row} />
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
    </Box>
  );
};

export default CybersecurityTable;