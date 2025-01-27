/*eslint-disable*/
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useStore from '../../Zustand/store';
import { shallow } from 'zustand/shallow';
import CircleIcon from '@mui/icons-material/Circle';
import KeyboardBackspaceRoundedIcon from '@mui/icons-material/KeyboardBackspaceRounded';
import { tableCellClasses } from '@mui/material/TableCell';
import {
  Button,
  Checkbox,
  FormControl,
  MenuItem,
  Select,
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
  Tooltip,
  InputLabel,
  IconButton,
  Popper,
  ClickAwayListener,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { tooltipClasses } from '@mui/material/Tooltip';
import AddDamageScenarios from '../Modal/AddDamageScenario';
import { useDispatch } from 'react-redux';
import { closeAll } from '../../store/slices/CurrentIdSlice';
import SelectLosses from '../Modal/SelectLosses';
import { makeStyles } from '@mui/styles';
import { Box } from '@mui/system';
import ColorTheme from '../../store/ColorTheme';
import toast, { Toaster } from 'react-hot-toast';
import { colorPicker, colorPickerTab, DSTableHeader, options, stakeHeader } from './constraints';
import DeleteIcon from '@mui/icons-material/Delete';
import { tableHeight } from '../../store/constant';
import FormPopper from '../Poppers/FormPopper';
import FilterAltIcon from '@mui/icons-material/FilterAlt';

const selector = (state) => ({
  model: state.model,
  update: state.updateDamageScenario,
  updateDerived: state.updateDerivedDamageScenario,
  updateImpact: state.updateImpact,
  getThreatScenario: state.getThreatScenario,
  getDamageScenarios: state.getDamageScenarios,
  getRiskTreatment: state.getRiskTreatment,
  damageScenarios: state.damageScenarios['subs'][1],
  Details: state.damageScenarios['subs'][0]['Details'],
  damageID: state.damageScenarios['subs'][1]['_id'],
  deleteDamageScenario: state.deleteDamageScenario,
  updateName: state.updateName$DescriptionforDamage
});

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
    padding: '2px 8px',
    textAlign: 'center'
    // color: '#000'
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

const HtmlTooltip = styled(({ className, ...props }) => <Tooltip {...props} classes={{ popper: className }} />)(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#f5f5f9',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 220,
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #dadde9'
  }
}));

const renderMenuItem = (option, name) => (
  <MenuItem key={option?.value} value={option?.value}>
    <HtmlTooltip
      placement="left"
      title={
        <Typography
          sx={{
            // backgroundColor: 'black',
            // color: 'white',
            fontSize: '14px',
            fontWeight: 600,
            padding: '8px', // Optional: Adds some padding for better spacing
            borderRadius: '4px' // Optional: Adds rounded corners
          }}
        >
          {option?.description[name]}
        </Typography>
      }
    >
      {option?.label}
    </HtmlTooltip>
  </MenuItem>
);

const SelectableCell = ({ row, options, handleChange, colorPickerTab, impact, name }) => {
  // console.log('name', name);
  const [open, setOpen] = useState(false); // Manage open state of dropdown
  const selectRef = useRef(null);
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!open) {
      setOpen(true); // Open dropdown on left-click only if not already open
    }
  };
  return (
    <StyledTableCell component="th" scope="row" onClick={handleClick} sx={{ background: `${colorPickerTab(impact)} !important` }}>
      <FormControl
        sx={{
          width: 130,
          background: 'transparent',
          '& .MuiInputBase-root': {
            backgroundColor: 'transparent'
          },
          '& .MuiSelect-select': {
            backgroundColor: 'transparent'
          },
          '& .MuiSvgIcon-root': {
            display: 'none'
          },
          '& .MuiOutlinedInput-notchedOutline': {
            border: 'none'
          }
        }}
      >
        {!impact && (
          <InputLabel id="demo-simple-select-label" shrink={false}>
            Select Impacts
          </InputLabel>
        )}
        <Select
          ref={selectRef}
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          name={name}
          value={impact}
          onChange={(e) => handleChange(e, row)}
          open={open}
          onClose={() => setOpen(false)}
        >
          {options?.map((option) => renderMenuItem(option, name))}
        </Select>
      </FormControl>
    </StyledTableCell>
  );
};

const notify = (message, status) => toast[status](message);
export default function DsTable() {
  const color = ColorTheme();
  const {
    model,
    update,
    damageScenarios,
    Details,
    damageID,
    getDamageScenarios,
    getThreatScenario,
    getRiskTreatment,
    updateImpact,
    deleteDamageScenario,
    updateDerived,
    updateName
  } = useStore(selector, shallow);

  const [stakeHolder] = useState(false);
  const classes = useStyles();
  const dispatch = useDispatch();
  const [openDs, setOpenDs] = useState(false);
  const [openCl, setOpenCl] = useState(false);
  const [rows, setRows] = useState([]);
  const [selectedRow, setSelectedRow] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filtered, setFiltered] = useState([]);
  const [details, setDetails] = useState([]);
  const [page, setPage] = useState(0); // Add state for page
  const [rowsPerPage, setRowsPerPage] = useState(25); // Add state for rows per page
  const [columnWidths, setColumnWidths] = useState({});
  const [selectedRows, setSelectedRows] = useState([]);
  const [openFilter, setOpenFilter] = useState(false); // Manage the filter modal visibility
  const visibleColumns = useStore((state) => state.dmgScenTblClms);
  const toggleColumnVisibility = useStore((state) => state.toggleColumnVisibility);

  // Open/Close the filter modal
  const handleOpenFilter = () => setOpenFilter(true);
  const handleCloseFilter = () => setOpenFilter(false);

  const handleChecked = (value, item, rowId) => {
    const details = {
      id: damageScenarios?._id,
      'detail-id': rowId
    };
    if (item === 'Asset is Evaluated') {
      details.isAssetEvaluated = !value;
    } else {
      details.isCybersecurityEvaluated = !value;
    }
    // console.log('details', details);
    updateDerived(details)
      .then((res) => {
        if (res) {
          getDamageScenarios(model?._id);
        }
      })
      .catch((err) => console.log('err', err));
  };
  // console.log('selectedRows', selectedRows);
  // console.log('damageID', damageID);
  const handleDeleteSelected = () => {
    const details = {
      'model-id': model?._id,
      id: damageID,
      detailId: selectedRows
    };
    deleteDamageScenario(details)
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

  const toggleRowSelection = (rowId) => {
    setSelectedRows(
      (prevSelectedRows) =>
        prevSelectedRows.includes(rowId)
          ? prevSelectedRows.filter((id) => id !== rowId) // Unselect if already selected
          : [...prevSelectedRows, rowId] // Select if not selected
    );
  };

  // console.log('damageID', damageID);
  const Head = useMemo(() => {
    if (stakeHolder) {
      return stakeHeader;
    } else {
      return DSTableHeader.filter((header) => visibleColumns.includes(header.name)); // Only show columns that are visible
    }
  }, [visibleColumns]);

  const handleOpenCl = (row) => {
    setSelectedRow(row);
    setOpenCl(true);
  };

  const handleCloseCl = () => {
    setOpenCl(false);
    setSelectedRow({});
    const details = Details?.filter((detail) => detail?.props?.length) ?? [];
    setDetails(details);
  };

  const handleSearch = (e) => {
    const { value } = e.target;
    if (value.length > 0) {
      const filterValue = rows.filter((rw) => {
        if (
          rw.Name.toLowerCase().includes(value.toLowerCase()) ||
          rw['Description/Scalability']?.toLowerCase().includes(value.toLowerCase())
        ) {
          return rw;
        }
      });
      setFiltered(filterValue);
    } else {
      setFiltered(rows);
    }

    setSearchTerm(value);
  };

  // console.log('damageScenarios', damageScenarios['Details']);
  useEffect(() => {
    if (damageScenarios['Details']) {
      const scene = damageScenarios['Details']?.map((ls, i) => ({
        id: ls._id,
        ID: `DS${ls?.key?.toString().padStart(3, '0') ?? (i + 1).toString().padStart(3, '0')}`,
        Name: ls?.Name,
        'Description/Scalability': ls['Description'],
        cyberLosses: ls?.cyberLosses ? ls.cyberLosses : [],
        'Asset is Evaluated': ls?.is_asset_evaluated === 'true' ? true : false,
        'Cybersecurity Properties are Evaluated': ls?.is_cybersecurity_evaluated === 'true' ? true : false,
        impacts: ls?.impacts
          ? {
              'Financial Impact': ls?.impacts['Financial Impact'] ?? '',
              'Safety Impact': ls?.impacts['Safety Impact'] ?? '',
              'Operational Impact': ls?.impacts['Operational Impact'] ?? '',
              'Privacy Impact': ls?.impacts['Privacy Impact'] ?? ''
            }
          : {}
      }));
      setRows(scene);
      setFiltered(scene);
      const details = Details?.filter((detail) => detail?.props?.length) ?? [];
      setDetails(details);
    }
  }, [damageScenarios]);

  const refreshAPI = () => {
    // console.log('model', model);
    getDamageScenarios(model?._id);
  };
  // console.log('rows', rows);

  // console.log('Details', Details);
  const handleOpenModalDs = () => {
    setOpenDs(true);
  };
  const handleCloseDs = () => {
    setOpenDs(false);
  };

  const handleChange = (e, row) => {
    e.stopPropagation();
    const { name, value } = e.target;
    const seleced = JSON.parse(JSON.stringify(row));
    seleced['impacts'][`${name}`] = value;
    // console.log('seleced', seleced);

    const info = {
      id: damageID,
      detailId: seleced?.id,
      impacts: JSON.stringify(seleced['impacts'])
    };
    updateImpact(info)
      .then((res) => {
        // console.log('res', res);
        refreshAPI();
      })
      .catch((err) => console.log('err', err));
  };

  const checkforLabel = (item) => {
    if (
      item.name === 'Safety Impact' ||
      item.name === 'Financial Impact' ||
      item.name === 'Operational Impact' ||
      item.name === 'Privacy Impact'
    ) {
      return true;
    }
    return false;
  };

  const handleBack = () => {
    dispatch(closeAll());
  };

  const OverallImpact = useCallback((impact) => {
    const pattern = (it) => {
      return it === 'Negligible' ? 1 : it === 'Minor' ? 2 : it === 'Moderate' ? 3 : it === 'Major' ? 4 : it === 'Severe' ? 5 : 0;
    };

    const impactLabel = (value) => {
      return value === 1
        ? 'Negligible'
        : value === 2
        ? 'Minor'
        : value === 3
        ? 'Moderate'
        : value === 4
        ? 'Major'
        : value === 5
        ? 'Severe'
        : '';
    };

    const val = Object.values(impact)?.map((it) => pattern(it));

    const maxImpactValue = val.length ? Math.max(...val) : 0;

    return impactLabel(maxImpactValue);
  }, []);

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
    // console.log('e', e);
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

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseup', handleMouseUp, { passive: true });
  };

  const RenderTableRow = ({ row, rowKey, isChild = false }) => {
    const [hoveredField, setHoveredField] = useState(null);
    const [editingField, setEditingField] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const [isPopperFocused, setIsPopperFocused] = useState(false);
    const isSelected = selectedRows.includes(row.id);
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
          id: damageID,
          detailId: row?.id,
          [editingField === 'Name' ? 'Name' : 'Description']: editValue
        };

        updateName(details)
          .then((res) => {
            // console.log('res', res);
            if (!res.error) {
              notify(res.message ?? 'Deleted successfully', 'success');
              getDamageScenarios(model?._id);
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
      <>
        <StyledTableRow
          key={row.name}
          data={row}
          sx={{
            backgroundColor: isSelected ? '#FF3800' : isChild ? '#F4F8FE' : color?.sidebarBG,
            '& .MuiTableCell-root.MuiTableCell-body': {
              color: `${color?.sidebarContent} !important`
            }
          }}
        >
          {Head?.map((item, index) => {
            const isEditableField = item.name === 'Name' || item.name === 'Description/Scalability';
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
              case checkforLabel(item):
                cellContent = (
                  <SelectableCell
                    key={index}
                    item={item}
                    row={row}
                    handleChange={handleChange}
                    name={item.name}
                    options={options}
                    colorPickerTab={colorPickerTab}
                    impact={row?.impacts[item.name]}
                  />
                );
                break;

              case item.name === 'Losses of Cybersecurity Properties':
                cellContent = (
                  <StyledTableCell key={index} component="th" scope="row" onClick={() => handleOpenCl(row)} sx={{ cursor: 'pointer' }}>
                    {row.cyberLosses.length ? (
                      row?.cyberLosses?.map((loss) => (
                        <div
                          key={loss?.id}
                          style={{ marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '15px', width: 'max-content' }}
                        >
                          <CircleIcon sx={{ fontSize: 14, color: colorPicker(loss?.name) }} />
                          <span>Loss of {loss?.name}</span>
                        </div>
                      ))
                    ) : (
                      <InputLabel>Select losses</InputLabel>
                    )}
                  </StyledTableCell>
                );
                break;

              case item.name === 'Assets':
                cellContent = (
                  <StyledTableCell key={index} component="th" scope="row">
                    {row?.cyberLosses?.map((loss) => (
                      <div
                        key={loss?.id}
                        style={{ marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '15px', width: 'max-content' }}
                      >
                        <span> {loss?.node}</span>
                      </div>
                    ))}
                  </StyledTableCell>
                );
                break;
              case item.name === 'Overall Impact':
                cellContent = (
                  <StyledTableCell
                    component="th"
                    scope="row"
                    sx={{ backgroundColor: `${colorPickerTab(OverallImpact(row?.impacts))} !important`, color: '#000' }}
                  >
                    {OverallImpact(row?.impacts)}
                  </StyledTableCell>
                );
                break;

              case item.name.includes('Evaluated'):
                cellContent = (
                  <StyledTableCell component="th" scope="row">
                    <Checkbox {...label} checked={row[item.name]} onChange={() => handleChecked(row[item.name], item.name, row?.id)} />
                  </StyledTableCell>
                );
                break;

              case item.name === 'ID':
                cellContent = (
                  <StyledTableCell
                    key={index}
                    style={{ width: columnWidths[item.id] || 'auto', cursor: 'pointer' }}
                    align="left"
                    onClick={() => toggleRowSelection(row.id)}
                  >
                    {row[item.name] ? row[item.name] : '-'}
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
      </>
    );
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: 'auto' // Ensure the table takes up the full height of the parent
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
        <Box display="flex" alignItems="center" gap={1}>
          <KeyboardBackspaceRoundedIcon
            sx={{
              cursor: 'pointer',
              color: color?.title
            }}
            onClick={handleBack}
          />
          <Typography
            sx={{
              color: color?.title,
              fontWeight: 600,
              fontSize: '16px'
            }}
          >
            Damage Scenario Table
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <TextField
            id="outlined-size-small"
            placeholder="Search"
            size="small"
            value={searchTerm}
            onChange={handleSearch}
            sx={{
              justifyContent: 'center',
              padding: 0.5, // Reduce padding
              '& .MuiInputBase-input': {
                fontSize: '0.75rem', // Smaller font size
                padding: '0.5rem' // Adjust padding inside input
              },
              '& .MuiOutlinedInput-root': {
                height: '30px' // Reduce overall height
              }
            }}
          />
          <Button sx={{ alignSelf: 'center', fontSize: '0.85rem' }} variant="contained" onClick={handleOpenModalDs}>
            Add New Scenario
          </Button>
          <Button
            sx={{
              alignSelf: 'center',
              // padding: '0px 8px',
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
          {DSTableHeader.map((column) => (
            <FormControlLabel
              key={column.id}
              control={
                <Checkbox
                  checked={visibleColumns.includes(column.name)}
                  onChange={() => toggleColumnVisibility('dmgScenTblClms', column.name)}
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
        sx={{
          flexGrow: 1, // Let the container grow to fill available space
          overflowY: 'auto', // Enable vertical scrolling
          borderRadius: '0px',
          padding: 0.25,
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
        <Table stickyHeader sx={{ minWidth: 650 }} aria-label="simple table">
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
            {filtered?.map((row, rowkey) => (
              <>
                <RenderTableRow row={row} rowKey={rowkey} />
              </>
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

      {/* Modals */}
      {openDs && <AddDamageScenarios open={openDs} handleClose={handleCloseDs} model={model} rows={rows} notify={notify} />}
      {openCl && (
        <SelectLosses
          open={openCl}
          details={details}
          setDetails={setDetails}
          damageID={damageID}
          refreshAPI={refreshAPI}
          handleClose={handleCloseCl}
          model={model}
          selectedRow={selectedRow}
          update={update}
          getThreatScenario={getThreatScenario}
        />
      )}
      <Toaster position="top-right" reverseOrder={false} />
    </Box>
  );
}
