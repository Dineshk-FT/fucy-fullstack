/* eslint-disable */
import React, { useEffect, useMemo, useState } from 'react';
import useStore from '../../store/Zustand/store';
import { shallow } from 'zustand/shallow';
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
import ColorTheme from '../../themes/ColorTheme';
import { tableHeight } from '../../themes/constant';
import { TsTableHeader, colorPicker, threatType } from './constraints';
import CircleIcon from '@mui/icons-material/Circle';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { DamageIcon } from '../../assets/icons';
import toast, { Toaster } from 'react-hot-toast';
import AddThreatScenarios from '../Modal/AddThreatScenario';
import SelectDamageScenes from '../Modal/SelectDamageScenes';
import CreateDerivedThreatModal from '../Modal/CreateDerivedThreatModal';
import FormPopper from '../Poppers/FormPopper';
import { useSelector } from 'react-redux';

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
  deleteThreatScenario: state.deleteThreatScenario,
  selectedthreatIds: state.selectedthreatIds
});

const notify = (message, status) => toast[status](message);

const column = TsTableHeader;

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

const Tstable = () => {
  const color = ColorTheme();
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
    getRiskTreatment,
    addThreatScene,
    selectedthreatIds
  } = useStore(selector, shallow);
  const visibleColumns = useStore((state) => state.threatScenTblClms);
  const toggleColumnVisibility = useStore((state) => state.toggleColumnVisibility);

  const [rows, setRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [openModal, setOpenModal] = useState({ threat: false, select: false, derived: false });
  const [openFilter, setOpenFilter] = useState(false);
  const [selectedRow, setSelectedRow] = useState({});
  const [details, setDetails] = useState({});
  const [selectedRows, setSelectedRows] = useState([]);
  const [columnWidths, setColumnWidths] = useState(Object.fromEntries(TsTableHeader.map((col) => [col.id, col.w])));

  const Head = useMemo(() => {
    return TsTableHeader.filter((header) => visibleColumns.includes(header.name));
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
    if (derived?.Details) {
      let id = 0;
      const mod1 = derived.Details.flatMap((detail) =>
        detail?.Details?.flatMap((nodedetail) =>
          nodedetail?.props?.map((prop) => {
            id++;
            return {
              SNo: `TS${id.toString().padStart(3, '0')}`,
              ID: prop?.id,
              rowId: detail?.rowId,
              nodeId: nodedetail?.nodeId,
              Assets: nodedetail?.node,
              Name: `${threatType(prop?.name)} of ${nodedetail?.node} leads to ${detail?.damage_name}`,
              Description: prop?.description ?? `${threatType(prop?.name)} occurred due to ${prop?.name} in ${nodedetail?.node}`,
              losses: [],
              'Damage Scenarios': detail?.damage_key ? `[DS${detail.damage_key.toString().padStart(3, '0')}] ${detail.damage_name}` : '-',
              'Losses of Cybersecurity Properties': prop?.name,
              type: 'derived'
            };
          })
        )
      ).filter(Boolean);

      setRows(mod1);
      setDetails(damageScenarios);
    }
  }, [derived?.Details, damageScenarios]);

  const handleOpenFilter = () => setOpenFilter(true);
  const handleCloseFilter = () => setOpenFilter(false);

  const handleOpenSelect = (row) => {
    setSelectedRow(row);
    setOpenModal((prev) => ({ ...prev, select: true }));
  };

  const handleCloseSelect = () => {
    setOpenModal((prev) => ({ ...prev, select: false }));
    setSelectedRow({});
  };

  const handleOpenModalTs = () => setOpenModal((prev) => ({ ...prev, threat: true }));
  const handleCloseTs = () => setOpenModal((prev) => ({ ...prev, threat: false }));

  const handleOpenDerived = () => setOpenModal((prev) => ({ ...prev, derived: true }));
  const handleCloseDerived = () => {
    setOpenModal((prev) => ({ ...prev, derived: false }));
    setSelectedRows([]);
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
    const startWidth = columnWidths[columnId];

    const handleMouseMove = (event) => {
      const newWidth = Math.max(startWidth + (event.clientX - startX), TsTableHeader.find((col) => col.id === columnId)?.minW || 50);
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
            '& .MuiTableCell-body': {
              color: color?.sidebarContent,
              textShadow: selectedthreatIds.includes(row?.ID) ? '0px 0px 4px #0096FF' : 'none'
            }
          }}
        >
          {Head.map((item) => {
            const isEditableField = item.name === 'Description';
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
              case 'Losses of Cybersecurity Properties':
                cellContent = (
                  <StyledTableCell>
                    {row.type === 'derived'
                      ? row[item.name] && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <CircleIcon sx={{ fontSize: 14, color: colorPicker(row[item.name]) }} />
                            <span>Loss of {row[item.name]}</span>
                          </Box>
                        )
                      : row[item.name]?.map((loss, i) => (
                          <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                            <CircleIcon sx={{ fontSize: 14, color: colorPicker(loss?.name) }} />
                            <span>Loss of {loss?.name || '-'}</span>
                          </Box>
                        )) || '-'}
                  </StyledTableCell>
                );
                break;
              case 'Damage Scenarios':
                cellContent = (
                  <StyledTableCell
                    sx={{ cursor: row.type !== 'derived' ? 'pointer' : 'default', width: columnWidths[item.id] }}
                    onClick={() => row.type !== 'derived' && handleOpenSelect(row)}
                  >
                    {row.type === 'derived'
                      ? row[item.name] && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <img src={DamageIcon} alt="damage" height="10px" width="10px" />
                            <span>{row[item.name]}</span>
                          </Box>
                        )
                      : (row[item.name]?.length ? (
                          row[item.name].map((damage, i) => (
                            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                              <img src={DamageIcon} alt="damage" height="10px" width="10px" />
                              <span>{`[DS${damage.key.toString().padStart(3, '0')}] ${damage.name}`}</span>
                            </Box>
                          ))
                        ) : (
                          <span>Select Damage Scenario</span>
                        )) || '-'}
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
    [Head, selectedRows, selectedthreatIds, derivedId, UserDefinedId, model?._id]
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
          {/* <Button variant="contained" onClick={handleOpenModalTs}>
            Add New Scenario
          </Button> */}
          <Button
            variant="contained"
            sx={{ backgroundColor: '#4caf50', '&:hover': { backgroundColor: '#388e3c' } }}
            onClick={handleOpenFilter}
          >
            <FilterAltIcon sx={{ fontSize: 20, mr: 0.5 }} />
            Filter
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<CircleIcon />}
            onClick={handleOpenDerived}
            disabled={!selectedRows.length}
          >
            Derive
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
          {TsTableHeader.map((column) => (
            <FormControlLabel
              key={column.id}
              control={
                <Checkbox
                  checked={visibleColumns.includes(column.name)}
                  onChange={() => toggleColumnVisibility('threatScenTblClms', column.name)}
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

      <AddThreatScenarios open={openModal.threat} handleClose={handleCloseTs} id={model?._id} />
      {openModal.select && (
        <SelectDamageScenes
          open={openModal.select}
          handleClose={handleCloseSelect}
          details={details}
          selectedRow={selectedRow}
          id={UserDefinedId}
          updateThreatScenario={updateThreatScenario}
          refreshAPI={refreshAPI}
        />
      )}
      {openModal.derived && (
        <CreateDerivedThreatModal
          open={openModal.derived}
          handleClose={handleCloseDerived}
          id={model?._id}
          selectedRows={selectedRows}
          notify={(message, status) => toast[status](message)}
        />
      )}
      <Toaster position="top-right" reverseOrder={false} />
    </Box>
  );
};

export default Tstable;
