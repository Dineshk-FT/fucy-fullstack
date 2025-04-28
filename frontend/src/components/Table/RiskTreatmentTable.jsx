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
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import { useDispatch, useSelector } from 'react-redux';
import { closeAll } from '../../store/slices/CurrentIdSlice';
import useStore from '../../store/Zustand/store';
import { shallow } from 'zustand/shallow';
import ColorTheme from '../../themes/ColorTheme';
import { tableHeight } from '../../themes/constant';
import { RiskTreatmentHeaderTable, colorPicker, colorPickerTab, RatingColor } from './constraints';
import CircleIcon from '@mui/icons-material/Circle';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { AttackIcon, DamageIcon, CyberGoalIcon, CyberRequireIcon, CatalogIcon, CyberClaimsIcon } from '../../assets/icons';
import toast, { Toaster } from 'react-hot-toast';
import AddThreatScenarios from '../Modal/AddThreatScenario';
import SelectCyberGoals from '../Modal/SelectCyberGoals';
import SelectCatalog from '../Modal/SelectCatalog';

const selector = (state) => ({
  model: state.model,
  riskTreatment: state.riskTreatment['subs'][0],
  getRiskTreatment: state.getRiskTreatment,
  addRiskTreatment: state.addRiskTreatment,
  cyber_Goals: state.cybersecurity['subs'][0],
  cyber_Claims: state.cybersecurity['subs'][3],
  updateRiskTable: state.updateRiskTable,
  getCyberSecurityScenario: state.getCyberSecurityScenario,
  catalog: state.catalog['subs'][0]['subs_scenes'],
  deleteRiskTreatment: state.deleteRiskTreatment,
});

const useStyles = makeStyles({
  div: { width: 'max-content' },
});

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
    borderRight: '1px solid rgba(224, 224, 224, 1)',
    padding: '5px',
    fontSize: 13,
    textAlign: 'center',
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    borderRight: '1px solid rgba(224, 224, 224, 1)',
    padding: '10px 8px',
    textAlign: 'center',
  },
}));

const StyledTableRow = styled(TableRow)(() => ({
  '&:last-child td, &:last-child th': { border: 0 },
}));

const RiskTreatmentTable = () => {
  const color = ColorTheme();
  const classes = useStyles();
  const dispatch = useDispatch();
  const { title } = useSelector((state) => state?.pageName);
  const {
    model,
    riskTreatment,
    getRiskTreatment,
    addRiskTreatment,
    cyber_Goals,
    cyber_Claims,
    updateRiskTable,
    getCyberSecurityScenario,
    catalog,
    deleteRiskTreatment,
  } = useStore(selector, shallow);
  const visibleColumns = useStore((state) => state.riskTreatmentTblClms);
  const toggleColumnVisibility = useStore((state) => state.toggleColumnVisibility);

  const [rows, setRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtered, setFiltered] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [openTs, setOpenTs] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);
  const [openSelect, setOpenSelect] = useState({ GoalsModal: false, catalogModal: false, cyberType: '' });
  const [selectedRow, setSelectedRow] = useState({});
  const [details, setDetails] = useState({});
  const [catalogDetails, setCatalogDetails] = useState([]);
  const [selectedScenes, setSelectedScenes] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [columnWidths, setColumnWidths] = useState(
    Object.fromEntries(RiskTreatmentHeaderTable.map((col) => [col.id, col.w]))
  );

  const Head = useMemo(() => {
    const columns = title.includes('Derived')
      ? [...RiskTreatmentHeaderTable, { id: 14, name: 'Detailed / Combined Threat Scenarios', w: 200, minW: 100 }]
      : RiskTreatmentHeaderTable;
    return columns.filter((header) => visibleColumns.includes(header.name));
  }, [title, visibleColumns]);

  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return rows;
    return rows.filter(
      (row) =>
        row['Threat Scenario']?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.Assets?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [rows, searchTerm]);

  const paginatedRows = useMemo(() => {
    return filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredRows, page, rowsPerPage]);

  useEffect(() => {
    if (model?._id) {
      getCyberSecurityScenario(model._id);
      getRiskTreatment(model._id);
    }
  }, [model?._id, getCyberSecurityScenario, getRiskTreatment]);

  useEffect(() => {
    const data = riskTreatment?.Details?.map((item, i) => ({
      SNo: `RT${(i + 1).toString().padStart(3, '0')}`,
      ID: item?.threat_id,
      'Threat Scenario': item?.label,
      detailId: item?.id,
      Assets: item?.threat_scene ? item?.threat_scene[0]?.detail?.node : '',
      'Damage Scenarios': item?.threat_scene
        ? `[DS${item?.threat_scene[0]?.damage_key?.toString().padStart(3, '0') || '000'}] ${
            item?.threat_scene[0]?.damage_name
          }`
        : '-',
      'Safety Impact': item?.impacts['Safety Impact'] ?? '',
      'Financial Impact': item?.impacts['Financial Impact'] ?? '',
      'Operational Impact': item?.impacts['Operational Impact'] ?? '',
      'Privacy Impact': item?.impacts['Privacy Impact'] ?? '',
      'Attack Tree or Attack Path(s)': item?.attack_scene,
      'Attack Feasibility Rating': item?.attack_scene?.overall_rating ?? '',
      'Contributing Requirements': item?.cybersecurity?.cybersecurity_requirements ?? [],
      'Cybersecurity Goals': item?.cybersecurity?.cybersecurity_goals ?? [],
      'Cybersecurity Claims': item?.cybersecurity?.cybersecurity_claims ?? [],
      threat_key: item?.threat_key,
      'Related UNECE Threats or Vulns': item?.catalogs,
    }));
    setRows(data || []);
    setFiltered(data || []);
    setCatalogDetails(catalog);
  }, [riskTreatment?.Details, catalog]);

  useEffect(() => {
    setDetails(openSelect.cyberType?.includes('Goals') ? cyber_Goals['scenes'] : cyber_Claims['scenes']);
  }, [openSelect.cyberType, cyber_Goals, cyber_Claims]);

  const handleResizeStart = (e, columnId) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = columnWidths[columnId];

    const handleMouseMove = (event) => {
      const newWidth = Math.max(
        startWidth + (event.clientX - startX),
        RiskTreatmentHeaderTable.find((col) => col.id === columnId)?.minW || 50
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

  const handleOpenFilter = () => setOpenFilter(true);
  const handleCloseFilter = () => setOpenFilter(false);

  const handleOpenSelect = (row, name) => {
    setSelectedRow(row);
    setOpenSelect((prev) => ({ ...prev, GoalsModal: true, cyberType: name }));
  };

  const handleCloseSelect = () => {
    setOpenSelect((prev) => ({ ...prev, GoalsModal: false, cyberType: '' }));
    setSelectedRow({});
    setSelectedScenes([]);
  };

  const handleOpenCatalog = (row) => {
    setSelectedRow(row);
    setOpenSelect((prev) => ({ ...prev, catalogModal: true }));
  };

  const handleCloseCatalog = () => {
    setOpenSelect((prev) => ({ ...prev, catalogModal: false }));
    setSelectedRow({});
    setSelectedScenes([]);
  };

  const handleOpenModalTs = () => setOpenTs(true);
  const handleCloseTs = () => setOpenTs(false);

  const handleBack = () => dispatch(closeAll());

  const handleDeleteSelected = async () => {
    const details = {
      'model-id': model?._id,
      rowIds: selectedRows.map((row) => row?.id),
      threatKeys: selectedRows.map((row) => row?.threat_key),
    };
    try {
      const res = await deleteRiskTreatment(details);
      if (!res.error) {
        toast.success(res.message || 'Deleted successfully');
        refreshAPI();
        setSelectedRows([]);
      } else {
        toast.error(res.error || 'Something went wrong');
      }
    } catch (err) {
      toast.error('Something went wrong');
    }
  };

  const toggleRowSelection = (row) => {
    const shorted = { id: row?.detailId, SNo: row?.SNo, threat_key: row?.threat_key };
    setSelectedRows((prev) =>
      prev.some((selectedRow) => selectedRow.SNo === shorted.SNo)
        ? prev.filter((selectedRow) => selectedRow.SNo !== shorted.SNo)
        : [...prev, shorted]
    );
  };

  const refreshAPI = () => {
    if (model?._id) {
      getCyberSecurityScenario(model._id);
      getRiskTreatment(model._id);
    }
  };

  const onDrop = async (event) => {
    event.preventDefault();
    const cyber = event.dataTransfer.getData('application/cyber');
    if (!cyber) return;

    try {
      const parsedData = JSON.parse(cyber);
      const details = {
        nodeId: parsedData.nodeId,
        threatId: parsedData.threatId,
        modelId: model?._id,
        label: parsedData?.label,
        damageId: parsedData?.damageId,
        key: parsedData?.key,
      };
      const res = await addRiskTreatment(details);
      if (!res.error) {
        toast.success(res.message || 'Threat scene added');
        getRiskTreatment(model?._id);
      } else {
        toast.error(res.error || 'Something went wrong');
      }
    } catch (err) {
      toast.error('Something went wrong');
    }
  };

  const RenderTableRow = React.memo(({ row, Head, color }) => {
    const isSelected = selectedRows.some((selectedRow) => selectedRow.SNo === row.SNo);

    return (
      <StyledTableRow
        sx={{
          backgroundColor: isSelected ? '#B2BEB5' : color?.sidebarBG,
          '& .MuiTableCell-body': { color: color?.sidebarContent },
        }}
      >
        {Head.map((item) => {
          let cellContent;
          switch (item.name) {
            case 'SNo':
              cellContent = (
                <StyledTableCell
                  sx={{ cursor: 'pointer', width: columnWidths[item.id] }}
                  onClick={() => toggleRowSelection(row)}
                >
                  {row[item.name] || '-'}
                </StyledTableCell>
              );
              break;
            case 'Losses of Cybersecurity Properties':
              cellContent = (
                <StyledTableCell sx={{ width: columnWidths[item.id] }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CircleIcon sx={{ fontSize: 14, color: colorPicker(row[item.name]) }} />
                    <span>Loss of {row[item.name]}</span>
                  </Box>
                </StyledTableCell>
              );
              break;
            case 'Attack Tree or Attack Path(s)':
              cellContent = (
                <StyledTableCell sx={{ width: columnWidths[item.id] }}>
                  {row[item.name] ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <img src={AttackIcon} alt="attack" height="10px" width="10px" />
                      <span>{row[item.name].Name}</span>
                    </Box>
                  ) : (
                    '-'
                  )}
                </StyledTableCell>
              );
              break;
            case 'Cybersecurity Goals':
            case 'Cybersecurity Claims':
              cellContent = (
                <StyledTableCell sx={{ width: columnWidths[item.id] }}>
                  {row[item.name]?.length ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      {row[item.name].map((goal, i) => (
                        <Box key={goal?.ID || i} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <img
                            src={item.name === 'Cybersecurity Goals' ? CyberGoalIcon : CyberClaimsIcon}
                            alt="icon"
                            height="15px"
                            width="15px"
                          />
                          <span>{goal?.Name}</span>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <span style={{ cursor: 'pointer' }} onClick={() => handleOpenSelect(row, item.name)}>
                      Select
                    </span>
                  )}
                </StyledTableCell>
              );
              break;
            case 'Related UNECE Threats or Vulns':
              cellContent = (
                <StyledTableCell sx={{ cursor: 'pointer', width: columnWidths[item.id] }} onClick={() => handleOpenCatalog(row)}>
                  {row[item.name]?.length ? (
                    row[item.name].map((catalog) => (
                      <Box key={catalog} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <img src={CatalogIcon} alt="catalog" height="15px" width="15px" />
                        <span>{catalog}</span>
                      </Box>
                    ))
                  ) : (
                    <span>Select Catalogs</span>
                  )}
                </StyledTableCell>
              );
              break;
            case 'Damage Scenarios':
              cellContent = (
                <StyledTableCell sx={{ width: columnWidths[item.id] }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <img src={DamageIcon} alt="damage" height="10px" width="10px" />
                    <span>{row[item.name]}</span>
                  </Box>
                </StyledTableCell>
              );
              break;
            case 'Contributing Requirements':
              cellContent = (
                <StyledTableCell sx={{ width: columnWidths[item.id] }}>
                  {row[item.name]?.map((require) => (
                    <Box key={require?.ID} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <img src={CyberRequireIcon} alt="require" height="10px" width="10px" />
                      <span>{require?.Name}</span>
                    </Box>
                  ))}
                </StyledTableCell>
              );
              break;
            case 'Safety Impact':
            case 'Financial Impact':
            case 'Operational Impact':
            case 'Privacy Impact':
              cellContent = (
                <StyledTableCell sx={{ backgroundColor: colorPickerTab(row[item.name]), color: '#000', width: columnWidths[item.id] }}>
                  {row[item.name] || '-'}
                </StyledTableCell>
              );
              break;
            case 'Attack Feasibility Rating':
              cellContent = (
                <StyledTableCell sx={{ backgroundColor: RatingColor(row[item.name]), color: '#000', width: columnWidths[item.id] }}>
                  {row[item.name] || '-'}
                </StyledTableCell>
              );
              break;
            default:
              cellContent = <StyledTableCell sx={{ width: columnWidths[item.id] }}>{row[item.name] || '-'}</StyledTableCell>;
              break;
          }
          return cellContent;
        })}
      </StyledTableRow>
    );
  }, [Head, color, selectedRows, handleOpenSelect, handleOpenCatalog]);

  return (
    <Box
      sx={{
        overflow: 'auto',
        height: '100%',
        padding: 1,
        '&::-webkit-scrollbar': { width: '4px' },
        '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(0, 0, 0, 0.2)', borderRadius: '10px' },
        '&::-webkit-scrollbar-track': { background: 'rgba(0, 0, 0, 0.1)' },
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
              '& .MuiOutlinedInput-root': { height: '30px' },
            }}
          />
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
          {RiskTreatmentHeaderTable.map((column) => (
            <FormControlLabel
              key={column.id}
              control={
                <Checkbox
                  checked={visibleColumns.includes(column.name)}
                  onChange={() => toggleColumnVisibility('riskTreatmentTblClms', column.name)}
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
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <Table stickyHeader sx={{ tableLayout: 'fixed', width: '100%' }}>
          <TableHead>
            <TableRow>
              {Head.map((hd) => (
                <StyledTableCell
                  key={hd.id}
                  sx={{ width: columnWidths[hd.id] ?? hd.w, minWidth: hd.minW, position: 'relative' }}
                >
                  {hd.name}
                  <Box
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
            {paginatedRows.map((row) => (
              <RenderTableRow key={row.SNo} row={row} Head={Head} color={color} />
            ))}
          </TableBody>
        </Table>
        {!rows.length && (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6">Note: Drag the threat and drop it in the table to add.</Typography>
          </Box>
        )}
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

      <AddThreatScenarios open={openTs} handleClose={handleCloseTs} id={model?._id} />
      {openSelect.GoalsModal && (
        <SelectCyberGoals
          riskTreatment={riskTreatment}
          type={openSelect.cyberType}
          open={openSelect.GoalsModal}
          handleClose={handleCloseSelect}
          details={details}
          selectedScenes={selectedScenes}
          setSelectedScenes={setSelectedScenes}
          updateRiskTreatment={updateRiskTable}
          refreshAPI={refreshAPI}
          selectedRow={selectedRow}
          model={model}
        />
      )}
      {openSelect.catalogModal && (
        <SelectCatalog
          catalog={catalog}
          catalogDetails={catalogDetails}
          open={openSelect.catalogModal}
          handleClose={handleCloseCatalog}
          details={details}
          selectedScenes={selectedScenes}
          setSelectedScenes={setSelectedScenes}
          updateRiskTreatment={updateRiskTable}
          getRiskTreatment={getRiskTreatment}
          selectedRow={selectedRow}
          model={model}
        />
      )}
      <Toaster position="top-right" reverseOrder={false} />
    </Box>
  );
};

export default RiskTreatmentTable;