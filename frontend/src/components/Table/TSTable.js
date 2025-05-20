/* eslint-disable */
import React, { useEffect, useMemo, useState } from 'react';
import useStore from '../../store/Zustand/store';
import { shallow } from 'zustand/shallow';
import { tableCellClasses } from '@mui/material/TableCell';
import {
  Button,
  TextField,
  Typography,
  styled,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  InputLabel,
  IconButton,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel
} from '@mui/material';
import { useSelector } from 'react-redux';
import AddThreatScenarios from '../Modal/AddThreatScenario';
import { Box } from '@mui/system';
import ColorTheme from '../../themes/ColorTheme';
import { colorPicker, threatType, TsTableHeader } from './constraints';
import CircleIcon from '@mui/icons-material/Circle';
import { tableHeight } from '../../themes/constant';
import SelectDamageScenes from '../Modal/SelectDamageScenes';
import { DamageIcon } from '../../assets/icons';
import FormPopper from '../Poppers/FormPopper';
import EditIcon from '@mui/icons-material/Edit';
import toast, { Toaster } from 'react-hot-toast';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import DeleteIcon from '@mui/icons-material/Delete';
import CreateDerivedThreatModal from '../Modal/CreateDerivedThreatModal';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Joyride from 'react-joyride';
import { TsSteps } from '../../utils/Steps';

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
    borderRight: '1px solid rgba(224, 224, 224, 1) !important',
    padding: '5px',
    fontSize: 13,
    textAlign: 'center'
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    borderRight: '1px solid rgba(224, 224, 224, 1) !important',
    padding: '10px 8px',
    textAlign: 'center'
  }
}));

const StyledTableRow = styled(TableRow)(() => ({
  '&:last-child td, &:last-child th': {
    border: 0
  }
}));

export default function Tstable() {
  const color = ColorTheme();
  const [openModal, setOpenModal] = useState({
    threat: false,
    select: false,
    derived: false
  });
  const [selectedRow, setSelectedRow] = useState({});
  const [details, setDetails] = useState({});

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
    selectedthreatIds
  } = useStore(selector, shallow);
  const [rows, setRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtered, setFiltered] = useState([]);
  const { title } = useSelector((state) => state?.pageName);
  const [openFilter, setOpenFilter] = useState(false); // Manage the filter modal visibility
  const visibleColumns = useStore((state) => state.threatScenTblClms);
  const toggleColumnVisibility = useStore((state) => state.toggleColumnVisibility);
  const [runTour, setRunTour] = useState(false);

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    if (['finished', 'skipped'].includes(status)) {
      setRunTour(false);
    }
  };

  const Head = useMemo(() => {
    return column.filter((header) => visibleColumns.includes(header.name));
  }, [title, visibleColumns]);

  // console.log('selectedthreatIds', selectedthreatIds);
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [columnWidths, setColumnWidths] = useState(Object.fromEntries(Head?.map((col) => [col.id, col.w])));
  const [selectedRows, setSelectedRows] = useState([]);

  // Open/Close the filter modal
  const handleOpenFilter = () => setOpenFilter(true);
  const handleCloseFilter = () => setOpenFilter(false);

  const handleOpenSelect = (row) => {
    setSelectedRow(row);
    setOpenModal((state) => ({ ...state, select: true }));
  };

  const handleCloseSelect = () => {
    setOpenModal((state) => ({ ...state, select: false }));
    setSelectedRow({});
  };
  const refreshAPI = () => {
    getThreatScenario(model?._id);
    handleCloseSelect();
  };

  useEffect(() => {
    getDamageScenarios(model?._id);
  }, []);

  // console.log('selectedRows', selectedRows);

  useEffect(() => {
    if (derived['Details']) {
      let id = 0;
      const mod1 = derived['Details']
        ?.map((detail) => {
          return detail?.Details?.map((nodedetail) => {
            return nodedetail?.props?.map((prop) => {
              id++;
              return {
                SNo: `TS${id.toString().padStart(3, '0')}`,
                ID: prop?.id,
                rowId: detail?.rowId,
                nodeId: nodedetail?.nodeId,
                Assets: nodedetail?.node,
                Name: `${threatType(prop?.name)} of ${nodedetail?.node} leads to  ${detail?.damage_name}`,
                Description: prop?.description ?? `${threatType(prop?.name)} occured due to ${prop?.name} in ${nodedetail?.node} `,
                losses: [],
                'Damage Scenarios':
                  `[DS${detail?.damage_key ? detail?.damage_key.toString().padStart(3, '0') : `${'0'.padStart(3, '0')}`}] ${
                    detail?.damage_name
                  }` ?? '-',
                'Losses of Cybersecurity Properties': prop?.name,
                type: 'derived'
              };
            });
          });
        })
        .flat(2);

      // const mappedDetails = Array.isArray(userDefined['Details'])
      //   ? userDefined['Details'].map((detail, i) =>
      //       detail && typeof detail === 'object'
      //         ? {
      //             SNo: `TSD${(i + 1).toString().padStart(3, '0')}`,
      //             ID: detail?.id || null,
      //             Name: detail?.name || null,
      //             Description: detail?.description || null,
      //             type: 'User-defined',
      //             'Damage Scenarios': detail?.damage_details,
      //             'Losses of Cybersecurity Properties': detail?.damage_details?.flatMap((damage) => damage?.cyberLosses)
      //           }
      //         : {}
      //     )
      //   : [];

      // const combined = mod1.concat(mappedDetails);
      const combined = mod1;
      setRows(combined);
      setFiltered(combined);
      setDetails(damageScenarios);
    }
  }, [derived, userDefined, damageScenarios]);

  const handleOpenModalTs = () => {
    setOpenModal((state) => ({ ...state, threat: true }));
  };

  const handleCloseTs = () => {
    setOpenModal((state) => ({ ...state, threat: false }));
  };

  const handleSearch = (e) => {
    const { value } = e.target;
    if (value.length > 0) {
      const filterValue = rows.filter((rw) => {
        if (rw.Name.toLowerCase().includes(value.toLowerCase()) || rw.Description.toLowerCase().includes(value.toLowerCase())) {
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

  const handleResizeStart = (e, columnId) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent unwanted bubbling

    const startX = e.clientX;
    const headerCell = e.currentTarget.parentElement;
    const startWidth = columnWidths[columnId] || headerCell.offsetWidth;

    const handleMouseMove = (event) => {
      const newWidth = Math.max(startWidth + (event.clientX - startX), TsTableHeader?.find((col) => col.id === columnId)?.minW || 50);
      setColumnWidths((prev) => ({ ...prev, [columnId]: newWidth }));
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleOpenDerived = () => {
    setOpenModal((state) => ({ ...state, derived: true }));
  };
  const handleCloseDerived = () => {
    setOpenModal((state) => ({ ...state, derived: false }));
    setSelectedRows([]);
  };
  const handleDeleteSelected = () => {
    const details = {
      'model-id': model?._id,
      rowDetails: JSON.stringify(selectedRows)
    };
    deleteThreatScenario(details)
      .then((res) => {
        if (!res.error) {
          notify(res.message ?? 'Deleted successfully', 'success');
          getDamageScenarios(model?._id);
          getThreatScenario(model?._id);
          getRiskTreatment(model?._id);
          setSelectedRows([]);
        } else {
          notify('Something went wrong', 'error');
        }
      })
      .catch((err) => {
        if (err) notify('Something went wrong', 'error');
      });
  };

  const toggleRowSelection = (row) => {
    const shorted = {
      propId: row?.ID,
      SNo: row?.SNo,
      nodeId: row?.nodeId,
      rowId: row?.rowId,
      type: row?.type
    };
    setSelectedRows((prevSelectedRows) => {
      const isSelected = prevSelectedRows.some((selectedRow) => selectedRow.SNo === shorted.SNo);

      if (isSelected) {
        // Unselect if already selected
        return prevSelectedRows.filter((selectedRow) => selectedRow.SNo !== shorted.SNo);
      } else {
        // Select if not selected
        return [...prevSelectedRows, shorted];
      }
    });
  };

  const RenderTableRow = ({ row, rowKey, isChild = false }) => {
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

    const handleSaveEdit = (e) => {
      e.stopPropagation();
      if (editingField) {
        if (!editValue.trim()) {
          notify('Field must not be empty', 'error');
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

        updateName(details)
          .then((res) => {
            if (!res.error) {
              handleClosePopper();
              notify(res.message ?? 'Deleted successfully', 'success');
              getThreatScenario(model?._id);
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
          backgroundColor: isSelected ? '#9FE2BF' : isChild ? '#F4F8FE' : color?.sidebarBG,
          '& .MuiTableCell-root.MuiTableCell-body': {
            color: `${color?.sidebarContent} !important`,
            textShadow: selectedthreatIds.includes(row?.ID) ? '0px 0px 4px #0096FF' : 'none'
          }
        }}
      >
        {Head?.map((item, index) => {
          const isEditableField = item.name === 'Description';
          let cellContent;
          switch (true) {
            case isEditableField:
              {
                cellContent = (
                  <StyledTableCell
                    id="edit-name"
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
                  onClick={() => toggleRowSelection(row)}
                >
                  {row[item.name] ? row[item.name] : '-'}
                </StyledTableCell>
              );
              break;

            case item.name === 'Losses of Cybersecurity Properties':
              if (row.type === 'derived') {
                cellContent = row[item?.name] && (
                  <StyledTableCell component="th" scope="row">
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <CircleIcon sx={{ fontSize: 14, color: colorPicker(row[item.name]) }} />
                      <span style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: 'max-content' }}>
                        Loss of {row[item.name]}
                      </span>
                    </span>
                  </StyledTableCell>
                );
              } else {
                cellContent = row[item?.name] && (
                  <StyledTableCell component="th" scope="row">
                    {row[item?.name].map((loss, i) => (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }} key={i}>
                        <CircleIcon sx={{ fontSize: 14, color: colorPicker(loss?.name) }} />
                        <span style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: 'max-content' }}>
                          Loss of {loss?.name}
                        </span>
                      </span>
                    ))}
                  </StyledTableCell>
                );
              }
              break;
            case item.name === 'Damage Scenarios':
              if (row.type === 'derived') {
                cellContent = (
                  <StyledTableCell component="th" scope="row">
                    {
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <img src={DamageIcon} alt="damage" height="10px" width="10px" />
                        <span style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: 'max-content' }}>
                          {row[item?.name]}
                        </span>
                      </span>
                    }
                  </StyledTableCell>
                );
              } else {
                cellContent = (
                  <StyledTableCell component="th" scope="row" onClick={() => handleOpenSelect(row)} sx={{ cursor: 'pointer' }}>
                    {row[item.name] && row[item.name].length ? (
                      row[item.name].map((damage, i) => (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }} key={i}>
                          <img src={DamageIcon} alt="damage" height="10px" width="10px" />
                          <span style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: 'max-content' }}>
                            {`[DS${(damage?.key).toString().padStart(3, '0')}] ${damage?.name}`}
                          </span>
                        </span>
                      ))
                    ) : (
                      <InputLabel>Select Damage Scenario</InputLabel>
                    )}
                  </StyledTableCell>
                );
              }
              break;
            case item.name === 'ID':
              cellContent = (
                <StyledTableCell key={index} style={{ width: columnWidths[item.id] || 'auto' }} align={'left'}>
                  {row[item.name] ? row[item.name].slice(0, 6) : '-'}
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
          count={filtered.length}
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
}
