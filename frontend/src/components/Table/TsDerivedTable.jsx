/* eslint-disable */
import React, { useEffect, useMemo, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  tableCellClasses,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Typography,
  Box,
  TablePagination,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import { useDispatch, useSelector } from 'react-redux';
import { closeAll } from '../../store/slices/CurrentIdSlice';
import useStore from '../../store/Zustand/store';
import { shallow } from 'zustand/shallow';
import ColorTheme from '../../themes/ColorTheme';
import { tableHeight } from '../../themes/constant';
import { TsDerivedTableHeader, colorPicker, threatType } from './constraints';
import CircleIcon from '@mui/icons-material/Circle';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { DamageIcon } from '../../assets/icons';
import toast, { Toaster } from 'react-hot-toast';
import AddThreatScenarios from '../Modal/AddThreatScenario';
import SelectDamageScenes from '../Modal/SelectDamageScenes';
import FormPopper from '../Poppers/FormPopper';

const selector = (state) => ({
  model: state.model,
  derived: state.threatScenarios.subs[0],
  userDefined: state.threatScenarios.subs[1],
  derivedId: state.threatScenarios['subs'][0]['_id'],
  UserDefinedId: state.threatScenarios['subs'][1]['_id'],
  getDamageScenarios: state.getDamageScenarios,
  getThreatScenario: state.getThreatScenario,
  getRiskTreatment: state.getRiskTreatment,
  damageScenarios: state.damageScenarios['subs'][1],
  updateThreatScenario: state.updateThreatScenario,
  updateName: state.updateName$DescriptionforThreat,
  deleteThreatScenario: state.deleteThreatScenario
});

const useStyles = makeStyles({
  div: { width: 'max-content' }
});

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
    fontSize: 14,
    borderRight: '1px solid rgba(224, 224, 224, 1)',
    padding: '10px 8px',
    textAlign: 'center'
  }
}));

const StyledTableRow = styled(TableRow)(() => ({
  '&:last-child td, &:last-child th': { border: 0 }
}));

const TsDerivedTable = () => {
  const color = ColorTheme();
  const classes = useStyles();
  const dispatch = useDispatch();
  const { title } = useSelector((state) => state?.pageName);
  const {
    model,
    derived,
    userDefined,
    getThreatScenario,
    damageScenarios,
    getDamageScenarios,
    updateThreatScenario,
    updateName,
    derivedId,
    UserDefinedId,
    deleteThreatScenario,
    getRiskTreatment
  } = useStore(selector, shallow);
  const visibleColumns = useStore((state) => state.threatDerivedScenTblClms);
  const toggleColumnVisibility = useStore((state) => state.toggleColumnVisibility);

  const [rows, setRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [openTs, setOpenTs] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);
  const [openSelect, setOpenSelect] = useState(false);
  const [selectedRow, setSelectedRow] = useState({});
  const [details, setDetails] = useState({});
  const [selectedRows, setSelectedRows] = useState([]);
  const [columnWidths, setColumnWidths] = useState(Object.fromEntries(TsDerivedTableHeader.map((col) => [col.id, col.w])));

  const Head = useMemo(() => {
    return TsDerivedTableHeader.filter((header) => visibleColumns.includes(header.name));
  }, [visibleColumns]);

  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return rows;
    return rows.filter(
      (row) =>
        row.Name?.toLowerCase().includes(searchTerm.toLowerCase()) || row.Description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [rows, searchTerm]);

  const paginatedRows = useMemo(() => {
    return filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredRows, page, rowsPerPage]);

  useEffect(() => {
    if (model?._id) {
      getDamageScenarios(model._id);
      getThreatScenario(model._id);
    }
  }, [model?._id, getDamageScenarios, getThreatScenario]);

  useEffect(() => {
    if (userDefined?.Details) {
      const mappedDetails = Array.isArray(userDefined.Details)
        ? userDefined.Details.map((detail, i) => ({
            SNo: `TSD${(i + 1).toString().padStart(3, '0')}`,
            ID: detail?.id || null,
            Name: detail?.name || '',
            Description: detail?.description || '',
            'Detailed / Combined Threat Scenarios': detail?.threat_ids || [],
            type: 'User-defined',
            'Damage Scenarios': detail?.damage_details || detail?.threat_ids || [],
            'Losses of Cybersecurity Properties': detail?.damage_details
              ? detail.damage_details.flatMap((damage) => damage?.cyberLosses || [])
              : detail?.threat_ids || []
          }))
        : [];
      setRows(mappedDetails);
      setDetails(damageScenarios);
    }
  }, [userDefined?.Details, damageScenarios]);

  const handleOpenFilter = () => setOpenFilter(true);
  const handleCloseFilter = () => setOpenFilter(false);

  const handleOpenSelect = (row) => {
    setSelectedRow(row);
    setOpenSelect(true);
  };

  const handleCloseSelect = () => {
    setOpenSelect(false);
    setSelectedRow({});
  };

  const handleOpenModalTs = () => setOpenTs(true);
  const handleCloseTs = () => setOpenTs(false);

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
    const startWidth = columnWidths[columnId];

    const handleMouseMove = (event) => {
      const newWidth = Math.max(startWidth + (event.clientX - startX), TsDerivedTableHeader.find((col) => col.id === columnId)?.minW || 50);
      setColumnWidths((prev) => ({ ...prev, [columnId]: newWidth }));
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleDeleteSelected = async () => {
    const details = {
      'model-id': model?._id,
      rowDetails: JSON.stringify(selectedRows)
    };
    try {
      const res = await deleteThreatScenario(details);
      if (!res.error) {
        toast.success(res.message || 'Deleted successfully');
        getDamageScenarios(model?._id);
        getThreatScenario(model?._id);
        getRiskTreatment(model?._id);
        setSelectedRows([]);
      } else {
        toast.error(res.error || 'Something went wrong');
      }
    } catch (err) {
      toast.error('Something went wrong');
    }
  };

  const toggleRowSelection = (row) => {
    const shorted = {
      propId: row?.ID,
      SNo: row?.SNo,
      nodeId: row?.nodeId,
      rowId: row?.rowId,
      type: row?.type
    };
    setSelectedRows((prev) =>
      prev.some((selectedRow) => selectedRow.SNo === shorted.SNo)
        ? prev.filter((selectedRow) => selectedRow.SNo !== shorted.SNo)
        : [...prev, shorted]
    );
  };

  const refreshAPI = () => {
    if (model?._id) {
      getThreatScenario(model._id);
      handleCloseSelect();
    }
  };

  const RenderTableRow = React.memo(
    ({ row }) => {
      const [hoveredField, setHoveredField] = useState(null);
      const [editingField, setEditingField] = useState(null);
      const [editValue, setEditValue] = useState('');
      const [anchorEl, setAnchorEl] = useState(null);
      const [isPopperFocused, setIsPopperFocused] = useState(false);
      const isSelected = selectedRows.some((selectedRow) => selectedRow.SNo === row.SNo);

      const handleEditClick = (event, fieldName, currentValue) => {
        event.stopPropagation();
        setEditingField(fieldName);
        setEditValue(currentValue || '');
        setAnchorEl(event.currentTarget);
      };

      const handleSaveEdit = async (e) => {
        e.stopPropagation();
        if (!editValue.trim()) {
          toast.error('Field must not be empty');
          return;
        }

        const details = {
          id: row?.type === 'derived' ? derivedId : UserDefinedId,
          propId: row?.ID,
          nodeId: row?.nodeId,
          rowId: row?.rowId,
          field: editingField,
          value: editValue,
          type: row?.type
        };

        try {
          const res = await updateName(details);
          if (!res.error) {
            toast.success(res.message || 'Updated successfully');
            getThreatScenario(model?._id);
            handleClosePopper();
          } else {
            toast.error(res.error || 'Something went wrong');
          }
        } catch (err) {
          toast.error('Something went wrong');
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
            backgroundColor: isSelected ? '#9FE2BF' : color?.sidebarBG,
            '& .MuiTableCell-body': { color: color?.sidebarContent }
          }}
        >
          {Head.map((item) => {
            const isEditableField = item.name === 'Description' || item.name === 'Name';
            let cellContent;

            switch (item.name) {
              case 'SNo':
                cellContent = (
                  <StyledTableCell sx={{ cursor: 'pointer', width: columnWidths[item.id] }} onClick={() => toggleRowSelection(row)}>
                    {row[item.name] || '-'}
                  </StyledTableCell>
                );
                break;
              case 'ID':
                cellContent = <StyledTableCell sx={{ width: columnWidths[item.id] }}>{row[item.name]?.slice(0, 6) || '-'}</StyledTableCell>;
                break;
              case 'Description':
              case 'Name':
                cellContent = (
                  <StyledTableCell
                    sx={{ position: 'relative', cursor: 'pointer', width: columnWidths[item.id] }}
                    onMouseEnter={() => setHoveredField(item.name)}
                    onMouseLeave={() => !anchorEl && setHoveredField(null)}
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
                );
                break;
              case 'Detailed / Combined Threat Scenarios':
                cellContent = (
                  <StyledTableCell sx={{ width: columnWidths[item.id] }}>
                    {row[item.name]?.length
                      ? row[item.name].map((threat, i) => (
                          <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                            <span>
                              {threat?.prop_key
                                ? `[TS${threat.prop_key.toString().padStart(3, '0')}] ${threatType(threat?.prop_name)} of ${
                                    threat?.node_name
                                  } leads to ${threat?.damage_scene}`
                                : '-'}
                            </span>
                          </Box>
                        ))
                      : '-'}
                  </StyledTableCell>
                );
                break;
              case 'Losses of Cybersecurity Properties':
                cellContent = (
                  <StyledTableCell>
                    {row[item.name]?.length
                      ? row[item.name].map((loss, i) => (
                          <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                            <CircleIcon sx={{ fontSize: 14, color: colorPicker(loss?.name || loss?.prop_name) }} />
                            <span>Loss of {loss?.name || loss?.prop_name || '-'}</span>
                          </Box>
                        ))
                      : '-'}
                  </StyledTableCell>
                );
                break;
              case 'Damage Scenarios':
                cellContent = (
                  <StyledTableCell
                    sx={{ cursor: 'pointer', width: columnWidths[item.id] }}
                    onClick={() => !row[item.name].length && handleOpenSelect(row)}
                  >
                    {row[item.name]?.length ? (
                      row[item.name].map((damage, i) => (
                        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                          <img src={DamageIcon} alt="damage" height="10px" width="10px" />
                          <span>
                            {damage?.key
                              ? `[DS${damage.key.toString().padStart(3, '0')}] ${damage.name}`
                              : damage?.damage_id
                              ? `[${damage.damage_id}] ${damage.damage_scene}`
                              : '-'}
                          </span>
                        </Box>
                      ))
                    ) : (
                      <span>Select Damage Scenario</span>
                    )}
                  </StyledTableCell>
                );
                break;
              default:
                cellContent = <StyledTableCell sx={{ width: columnWidths[item.id] }}>{row[item.name] || '-'}</StyledTableCell>;
                break;
            }
            return cellContent;
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
    },
    [Head, selectedRows, derivedId, UserDefinedId, model?._id]
  );

  return (
    <Box
      sx={{
        overflow: 'auto',
        height: '100%',
        padding: 1,
        '&::-webkit-scrollbar': { width: '4px' },
        '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(0, 0, 0, 0.2)', borderRadius: '10px' },
        '&::-webkit-scrollbar-track': { background: 'rgba(0, 0, 0, 0.1)' }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, mx: 1 }}>
        <Typography sx={{ color: color?.title, fontWeight: 600, fontSize: '16px' }}>{title} Table</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            placeholder="Search"
            size="small"
            value={searchTerm}
            onChange={handleSearch}
            sx={{
              '& .MuiInputBase-input': { fontSize: '0.75rem', padding: '0.5rem' },
              '& .MuiOutlinedInput-root': { height: '30px' }
            }}
          />
          <Button variant="contained" onClick={handleOpenModalTs}>
            Add New Scenario
          </Button>
          <Button
            variant="contained"
            sx={{ backgroundColor: '#4caf50', '&:hover': { backgroundColor: '#388e3c' } }}
            onClick={handleOpenFilter}
          >
            <FilterAltIcon sx={{ fontSize: 20, mr: 0.5 }} />
            Filter
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteSelected}
            disabled={!selectedRows.length}
          >
            Delete
          </Button>
        </Box>
      </Box>

      <Dialog open={openFilter} onClose={handleCloseFilter}>
        <DialogTitle>Column Filters</DialogTitle>
        <DialogContent>
          {TsDerivedTableHeader.map((column) => (
            <FormControlLabel
              key={column.id}
              control={
                <Checkbox
                  checked={visibleColumns.includes(column.name)}
                  onChange={() => toggleColumnVisibility('threatDerivedScenTblClms', column.name)}
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
        sx={{ borderRadius: '0px', maxHeight: tableHeight, scrollbarWidth: 'thin', padding: 0.25 }}
        onDragOver={(e) => e.preventDefault()}
      >
        <Table stickyHeader sx={{ tableLayout: 'fixed', width: '100%' }}>
          <TableHead>
            <TableRow>
              {Head.map((hd) => (
                <StyledTableCell key={hd.id} sx={{ width: columnWidths[hd.id] ?? hd.w, minWidth: hd.minW, position: 'relative' }}>
                  {hd.name}
                  <Box
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
            {paginatedRows.map((row, index) => (
              <RenderTableRow key={row.SNo} row={row} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        sx={{
          '& .MuiTablePagination-selectLabel, & .MuiSelect-select, & .MuiTablePagination-displayedRows': {
            color: color?.sidebarContent
          }
        }}
        component="div"
        count={filteredRows.length}
        rowsPerPageOptions={[5, 10, 25, 50, 100]}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      <AddThreatScenarios open={openTs} handleClose={handleCloseTs} id={model?._id} />
      {openSelect && (
        <SelectDamageScenes
          open={openSelect}
          handleClose={handleCloseSelect}
          details={details}
          selectedRow={selectedRow}
          id={UserDefinedId}
          updateThreatScenario={updateThreatScenario}
          refreshAPI={refreshAPI}
        />
      )}
      <Toaster position="top-right" reverseOrder={false} />
    </Box>
  );
};

export default TsDerivedTable;
