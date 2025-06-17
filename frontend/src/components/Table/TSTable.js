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
  IconButton,
  TableSortLabel
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
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Joyride from 'react-joyride';
import { TsSteps } from '../../utils/Steps';
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
  // '&:last-child td, &:last-child th': { border: 0 }
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
  const [runTour, setRunTour] = useState(false);

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    if (['finished', 'skipped'].includes(status)) {
      setRunTour(false);
    }
  };

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
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('SNo');

  const Head = useMemo(() => {
    return TsTableHeader.filter((header) => visibleColumns.includes(header.name));
  }, [visibleColumns]);

  // Sorting function
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
          {Head.map((item, index) => {
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
                    id="edit-name"
                    key={index}
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
    <>
      <Joyride
        steps={TsSteps}
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
        disableScrolling={false}
      />
      <Box
        sx={{
          overflow: 'auto',
          height: '-webkit-fill-available',
          minHeight: 'moz-available',
          padding: 1,
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
            {/* <KeyboardBackspaceRoundedIcon sx={{ float: 'left', cursor: 'pointer', ml: 1, color: color?.title }} onClick={handleBack} /> */}
            <Typography sx={{ color: color?.title, fontWeight: 600, fontSize: '16px' }}>{title} Table</Typography>
          </Box>
          <Box display="flex" gap={3}>
            <IconButton onClick={() => setRunTour(true)} sx={{ color: '#1976d2', ml: 1 }} size="small">
              <HelpOutlineIcon fontSize="small" />
            </IconButton>
            <TextField
              id="search-input"
              placeholder="Search"
              size="small"
              value={searchTerm}
              onChange={handleSearch}
              sx={{ '& .MuiInputBase-input': { border: '1px solid black' }, justifyContent: 'center' }}
            />
            {/* <Button sx={{ padding: '0px 8px', fontSize: '0.85rem' }} variant="contained" onClick={handleOpenModalTs}>
            Add New Scenario
          </Button> */}
            <Button
              id="filter-columns-btn"
              sx={{
                padding: '0px 8px',
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
              id="derive-btn"
              sx={{ fontSize: '0.85rem' }}
              variant="contained"
              color="primary"
              startIcon={<CircleIcon />} // Or any appropriate icon
              onClick={handleOpenDerived}
              disabled={selectedRows.length === 0}
            >
              Derive
            </Button>
            <Button
              id="delete-btn"
              sx={{ fontSize: '0.85rem' }}
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
            {TsTableHeader?.map((column) => (
              <FormControlLabel
                key={column.id}
                control={
                  <Checkbox
                    checked={visibleColumns.includes(column.name)}
                    onChange={() => toggleColumnVisibility('threatScenTblClms', column.name)}
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
          sx={{ borderRadius: '0px', maxHeight: tableHeight, scrollbarWidth: 'thin', padding: 0.25 }}
          onDragOver={(e) => e.preventDefault()}
        >
          <Table stickyHeader sx={{ width: '100%' }} aria-label="simple table">
            <TableHead>
              <TableRow>
                {Head?.map((hd) => (
                  <StyledTableCell
                    key={hd.id}
                    style={{
                      width: columnWidths[hd.id] ?? hd?.w,
                      minWidth: hd?.minW,
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
              {paginatedRows?.map((row, rowkey) => (
                <RenderTableRow row={row} rowKey={rowkey} key={rowkey} />
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
          count={filteredRows.length}
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
        <AddThreatScenarios open={openModal?.threat} handleClose={handleCloseTs} id={model._id} />
        {openModal?.select && (
          <SelectDamageScenes
            open={openModal?.select}
            handleClose={handleCloseSelect}
            details={details}
            selectedRow={selectedRow}
            id={UserDefinedId}
            updateThreatScenario={updateThreatScenario}
            refreshAPI={refreshAPI}
          />
        )}
        <Toaster position="top-right" reverseOrder={false} />
        {openModal?.derived && (
          <CreateDerivedThreatModal
            open={openModal?.derived}
            handleClose={handleCloseDerived}
            id={model?._id}
            selectedRows={selectedRows}
            notify={notify}
          />
        )}
      </Box>
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
};

export default Tstable;
