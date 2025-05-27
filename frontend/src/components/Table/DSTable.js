/*eslint-disable*/
import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
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
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  TablePagination,
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import useStore from '../../store/Zustand/store';
import { shallow } from 'zustand/shallow';
import { useDispatch } from 'react-redux';
import { closeAll } from '../../store/slices/CurrentIdSlice';
import ColorTheme from '../../themes/ColorTheme';
import { tableHeight } from '../../themes/constant';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import CircleIcon from '@mui/icons-material/Circle';
import toast, { Toaster } from 'react-hot-toast';
import AddDamageScenarios from '../Modal/AddDamageScenario';
import SelectLosses from '../Modal/SelectLosses';
import FormPopper from '../Poppers/FormPopper';
import { colorPicker, colorPickerTab, DSTableHeader, options, stakeHeader } from './constraints';

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
    padding: '2px 8px',
    verticalAlign: 'middle',
  },
}));

const StyledTableRow = styled(TableRow)(() => ({
  '&:last-child td, &:last-child th': { border: 0 },
  height: '3.5em',
}));

const HtmlTooltip = styled(Tooltip)(({ theme }) => ({
  '& .MuiTooltip-tooltip': {
    backgroundColor: '#f5f5f9',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 220,
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #dadde9',
  },
}));

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
  updateName: state.updateName$DescriptionforDamage,
});

const SelectableCell = ({ row, item, options, handleChange, colorPickerTab, impact, name, columnWidths }) => {
  const [open, setOpen] = useState(false);
  const selectRef = useRef(null);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
  };

  return (
    <StyledTableCell onClick={handleClick} sx={{ backgroundColor: colorPickerTab(impact) }}>
      <FormControl
        sx={{
          width: columnWidths[item?.id] ?? 'auto',
          '& .MuiInputBase-root, & .MuiSelect-select': {
            backgroundColor: 'transparent',
            padding: '0 24px 0 8px',
            fontSize: '13px',
            lineHeight: '1.5em',
            height: '1.5em',
            display: 'flex',
            alignItems: 'center',
          },
          '& .MuiSvgIcon-root': { display: 'none' },
          '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
        }}
      >
        {!impact && <InputLabel shrink={false}>Select Impacts</InputLabel>}
        <Select
          ref={selectRef}
          name={name}
          value={impact || ''}
          onChange={(e) => handleChange(e, row)}
          open={open}
          onClose={() => setOpen(false)}
        >
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              <HtmlTooltip
                placement="left"
                title={<Typography sx={{ fontSize: '14px', fontWeight: 600, padding: '8px' }}>{option.description[name]}</Typography>}
              >
                <span>{option.label}</span>
              </HtmlTooltip>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </StyledTableCell>
  );
};

const DsTable = () => {
  const theme = useTheme();
  const color = ColorTheme();
  const dispatch = useDispatch();
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
    updateName,
  } = useStore(selector, shallow);
  const [openDs, setOpenDs] = useState(false);
  const [openCl, setOpenCl] = useState(false);
  const [rows, setRows] = useState([]);
  const [selectedRow, setSelectedRow] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [details, setDetails] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [selectedRows, setSelectedRows] = useState([]);
  const [openFilter, setOpenFilter] = useState(false);
  const visibleColumns = useStore((state) => state.dmgScenTblClms);
  const toggleColumnVisibility = useStore((state) => state.toggleColumnVisibility);
  const [columnWidths, setColumnWidths] = useState(Object.fromEntries(DSTableHeader.map((col) => [col.id, col.w])));

  const Head = useMemo(() => {
    return DSTableHeader.filter((header) => visibleColumns.includes(header.name));
  }, [visibleColumns]);

  useEffect(() => {
    if (damageScenarios?.Details) {
      const scene = damageScenarios.Details.map((ls, i) => ({
        id: ls._id,
        ID: `DS${ls?.key?.toString().padStart(3, '0') ?? (i + 1).toString().padStart(3, '0')}`,
        Name: ls?.Name,
        'Description/Scalability': ls.Description,
        cyberLosses: ls?.cyberLosses || [],
        'Asset is Evaluated': ls?.is_asset_evaluated === 'true',
        'Cybersecurity Properties are Evaluated': ls?.is_cybersecurity_evaluated === 'true',
        impacts: {
          'Financial Impact': ls?.impacts?.['Financial Impact'] || '',
          'Safety Impact': ls?.impacts?.['Safety Impact'] || '',
          'Operational Impact': ls?.impacts?.['Operational Impact'] || '',
          'Privacy Impact': ls?.impacts?.['Privacy Impact'] || '',
        },
      }));
      setRows(scene);
      setDetails(Details?.filter((detail) => detail?.props?.length) || []);
    } else {
      setRows([]);
      setDetails([]);
    }
  }, [damageScenarios, Details]);

  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return rows;
    return rows.filter(
      (row) =>
        row.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row['Description/Scalability']?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [rows, searchTerm]);

  const paginatedRows = useMemo(() => {
    return filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredRows, page, rowsPerPage]);

  const handleResizeStart = (e, columnId) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = columnWidths[columnId] || 100;

    const handleMouseMove = (event) => {
      const newWidth = Math.max(
        startWidth + (event.clientX - startX),
        DSTableHeader.find((col) => col.id === columnId)?.minW || 50
      );
      setColumnWidths((prev) => ({ ...prev, [columnId]: newWidth }));
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleChecked = async (value, item, rowId) => {
    const previousRows = [...rows];
    const updatedRows = rows.map((row) =>
      row.id === rowId ? { ...row, [item]: !value } : row
    );
    setRows(updatedRows);

    const details = {
      id: damageScenarios?._id,
      'detail-id': rowId,
      [item === 'Asset is Evaluated' ? 'isAssetEvaluated' : 'isCybersecurityEvaluated']: !value,
    };

    try {
      const res = await updateDerived(details);
      if (res) {
        await getDamageScenarios(model?._id);
      }
    } catch (err) {
      console.error('Error updating row:', err);
      setRows(previousRows);
      toast.error('Failed to update evaluation status');
    }
  };

  const handleDeleteSelected = async () => {
    try {
      const res = await deleteDamageScenario({
        'model-id': model?._id,
        id: damageID,
        detailId: selectedRows,
      });
      if (!res.error) {
        toast.success(res.message ?? 'Deleted successfully');
        await Promise.all([
          getDamageScenarios(model?._id),
          getThreatScenario(model?._id),
          getRiskTreatment(model?._id),
        ]);
        setSelectedRows([]);
      } else {
        toast.error(res.error ?? 'Something went wrong');
      }
    } catch (err) {
      toast.error('Something went wrong');
    }
  };

  const toggleRowSelection = (rowId) => {
    setSelectedRows((prev) =>
      prev.includes(rowId) ? prev.filter((id) => id !== rowId) : [...prev, rowId]
    );
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const handleChange = async (e, row) => {
    e.stopPropagation();
    const { name, value } = e.target;
    const prevValue = row.impacts[name];
    const updatedRows = rows.map((r) =>
      r.id === row.id ? { ...r, impacts: { ...r.impacts, [name]: value } } : r
    );
    setRows(updatedRows);

    const info = {
      id: damageID,
      detailId: row.id,
      impacts: JSON.stringify({ ...row.impacts, [name]: value }),
    };

    try {
      const res = await updateImpact(info);
      if (res) {
        await getDamageScenarios(model?._id);
      }
    } catch (err) {
      console.error('Error updating impact:', err);
      setRows(rows.map((r) => (r.id === row.id ? { ...r, impacts: { ...r.impacts, [name]: prevValue } } : r)));
      toast.error('Failed to update impact');
    }
  };

  const OverallImpact = useCallback((impact) => {
    const pattern = (it) =>
      it === 'Negligible' ? 1 : it === 'Minor' ? 2 : it === 'Moderate' ? 3 : it === 'Major' ? 4 : it === 'Severe' ? 5 : 0;
    const impactLabel = (value) =>
      value === 1 ? 'Negligible' : value === 2 ? 'Minor' : value === 3 ? 'Moderate' : value === 4 ? 'Major' : value === 5 ? 'Severe' : '';
    const val = Object.values(impact || {}).map(pattern);
    return impactLabel(val.length ? Math.max(...val) : 0);
  }, []);

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

  const RenderTableRow = ({ row }) => {
    const [hoveredField, setHoveredField] = useState(null);
    const [editingField, setEditingField] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const [isPopperFocused, setIsPopperFocused] = useState(false);
    const isSelected = selectedRows.includes(row.id);
    const WIDTH_THRESHOLD = 250;

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

      try {
        const res = await updateName({
          id: damageID,
          detailId: row.id,
          [editingField === 'Name' ? 'Name' : 'Description']: editValue,
        });
        if (!res.error) {
          toast.success(res.message ?? 'Updated successfully');
          await Promise.all([getDamageScenarios(model?._id), getThreatScenario(model?._id)]);
          setEditingField(null);
          setEditValue('');
          setAnchorEl(null);
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

    const isImpactField = (name) =>
      ['Safety Impact', 'Financial Impact', 'Operational Impact', 'Privacy Impact'].includes(name);

    return (
      <StyledTableRow
        sx={{
          backgroundColor: isSelected ? '#FF3800' : color?.sidebarBG,
          '& .MuiTableCell-body': { color: color?.sidebarContent },
        }}
      >
        {Head.map((item, index) => {
          const currentWidth = columnWidths[item.id] || item.w;
          const shouldTruncate = currentWidth < WIDTH_THRESHOLD;

          if (item.name === 'ID') {
            return (
              <StyledTableCell
                key={index}
                sx={{ width: currentWidth, cursor: 'pointer' }}
                onClick={() => toggleRowSelection(row.id)}
              >
                {row[item.name] || '-'}
              </StyledTableCell>
            );
          }

          if (isImpactField(item.name)) {
            return (
              <SelectableCell
                key={index}
                item={item}
                row={row}
                handleChange={handleChange}
                name={item.name}
                options={options}
                columnWidths={columnWidths}
                colorPickerTab={colorPickerTab}
                impact={row?.impacts[item.name]}
              />
            );
          }

          if (item.name === 'Name' || item.name === 'Description/Scalability') {
            return (
              <StyledTableCell
                key={index}
                onMouseEnter={() => setHoveredField(item.name)}
                onMouseLeave={() => !anchorEl && setHoveredField(null)}
                sx={{ width: currentWidth, minWidth: item?.minW, position: 'relative', cursor: 'pointer' }}
              >
                <Box
                  sx={{
                    overflow: 'hidden',
                    ...(shouldTruncate
                      ? { whiteSpace: 'nowrap', textOverflow: 'ellipsis' }
                      : { whiteSpace: 'normal', overflowWrap: 'break-word', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }),
                  }}
                >
                  <Tooltip title={row[item.name]} placement="top">
                    <span>{row[item.name] || '-'}</span>
                  </Tooltip>
                </Box>
                {(hoveredField === item.name || editingField === item.name) && (
                  <IconButton
                    size="small"
                    onClick={(e) => handleEditClick(e, item.name, row[item.name])}
                    sx={{ position: 'absolute', top: '50%', right: '8px', transform: 'translateY(-50%)' }}
                  >
                    <EditIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                )}
              </StyledTableCell>
            );
          }

          if (item.name === 'Losses of Cybersecurity Properties') {
            return (
              <StyledTableCell
                key={index}
                onClick={() => {
                  setSelectedRow(row);
                  setOpenCl(true);
                }}
                sx={{ cursor: 'pointer', width: currentWidth }}
              >
                {row.cyberLosses.length ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {row.cyberLosses.map((loss) => (
                      <Box key={loss?.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircleIcon sx={{ fontSize: 14, color: colorPicker(loss?.name) }} />
                        <span>Loss of {loss?.name}</span>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <InputLabel>Select losses</InputLabel>
                )}
              </StyledTableCell>
            );
          }

          if (item.name === 'Assets') {
            const uniqueAssetsList = [...new Set(row?.cyberLosses?.map((loss) => loss?.node).filter(Boolean))] || ['-'];
            return (
              <StyledTableCell key={index} sx={{ width: currentWidth }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Tooltip title={uniqueAssetsList.join(', ')} placement="top">
                    <Box>
                      {uniqueAssetsList.map((asset, idx) => (
                        <Typography key={idx} variant="body2" noWrap={shouldTruncate}>
                          {asset}
                        </Typography>
                      ))}
                    </Box>
                  </Tooltip>
                </Box>
              </StyledTableCell>
            );
          }

          if (item.name === 'Overall Impact') {
            return (
              <StyledTableCell
                key={index}
                sx={{ backgroundColor: colorPickerTab(OverallImpact(row?.impacts)), color: '#000', width: currentWidth }}
              >
                {OverallImpact(row?.impacts) || '-'}
              </StyledTableCell>
            );
          }

          if (item.name.includes('Evaluated')) {
            return (
              <StyledTableCell key={index} sx={{ width: currentWidth }}>
                <Checkbox
                  checked={row[item.name]}
                  onChange={() => handleChecked(row[item.name], item.name, row?.id)}
                />
              </StyledTableCell>
            );
          }

          return (
            <StyledTableCell key={index} sx={{ width: currentWidth }}>
              {row[item.name] || '-'}
            </StyledTableCell>
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
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5} mx={1}>
        <Typography sx={{ color: color?.title, fontWeight: 600, fontSize: '16px' }}>
          Damage Scenario Table
        </Typography>
        <Box display="flex" gap={1}>
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
          <Button variant="contained" onClick={() => setOpenDs(true)}>
            Add New Scenario
          </Button>
          <Button
            variant="contained"
            onClick={() => setOpenFilter(true)}
            sx={{
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
          {DSTableHeader.map((column) => (
            <FormControlLabel
              key={column.id}
              control={
                <Checkbox
                  checked={visibleColumns.includes(column.name)}
                  onChange={() => toggleColumnVisibility('dmgScenTblClms', column.name)}
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
        sx={{
          flexGrow: 1,
          borderRadius: '0px',
          padding: 0.25,
          maxHeight: tableHeight,
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': { width: '4px' },
          '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(0, 0, 0, 0.2)', borderRadius: '10px' },
          '&::-webkit-scrollbar-track': { background: 'rgba(0, 0, 0, 0.1)' },
        }}
      >
        <Table stickyHeader sx={{ tableLayout: 'fixed', width: '100%' }}>
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
                      width: '10px',
                      height: '100%',
                      cursor: 'col-resize',
                      backgroundColor: 'rgba(0, 0, 0, 0.1)',
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

      {openDs && <AddDamageScenarios open={openDs} handleClose={() => setOpenDs(false)} model={model} rows={rows} notify={toast} />}
      {openCl && (
        <SelectLosses
          open={openCl}
          details={details}
          setDetails={setDetails}
          damageID={damageID}
          refreshAPI={() => getDamageScenarios(model?._id)}
          handleClose={() => {
            setOpenCl(false);
            setSelectedRow({});
            setDetails(Details?.filter((detail) => detail?.props?.length) || []);
          }}
          model={model}
          selectedRow={selectedRow}
          update={update}
          getThreatScenario={getThreatScenario}
        />
      )}
      <Toaster position="top-right" reverseOrder={false} />
    </Box>
  );
};

export default DsTable;