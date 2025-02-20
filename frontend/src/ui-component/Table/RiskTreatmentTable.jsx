/* eslint-disable */
import React, { useEffect, useMemo, useState } from 'react';
import useStore from '../../Zustand/store';
import { shallow } from 'zustand/shallow';
import KeyboardBackspaceRoundedIcon from '@mui/icons-material/KeyboardBackspaceRounded';
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
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useDispatch, useSelector } from 'react-redux';
import { closeAll } from '../../store/slices/CurrentIdSlice';
import AddThreatScenarios from '../Modal/AddThreatScenario';
import { Box } from '@mui/system';
import ColorTheme from '../../store/ColorTheme';
import { colorPicker, colorPickerTab, OverallImpact, RatingColor, threatType } from './constraints';
import CircleIcon from '@mui/icons-material/Circle';
import DeleteIcon from '@mui/icons-material/Delete';
import { AttackIcon, DamageIcon, CyberGoalIcon, CyberRequireIcon, CatalogIcon, CyberClaimsIcon } from '../../assets/icons';
import toast, { Toaster } from 'react-hot-toast';
import SelectCyberGoals from '../Modal/SelectCyberGoals';
import { RiskTreatmentHeaderTable } from './constraints';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { tableHeight } from '../../store/constant';
import SelectCatalog from '../Modal/SelectCatalog';

const selector = (state) => ({
  model: state.model,
  getModel: state.getModelById,
  riskTreatment: state.riskTreatment['subs'][0],
  getRiskTreatment: state.getRiskTreatment,
  catalog: state.catalog['subs'][0]['subs_scenes'],
  addRiskTreatment: state.addRiskTreatment,
  cyber_Goals: state.cybersecurity['subs'][0],
  cyber_Claims: state.cybersecurity['subs'][3],
  updateRiskTable: state.updateRiskTable,
  getCyberSecurityScenario: state.getCyberSecurityScenario,
  deleteRiskTreatment: state.deleteRiskTreatment
});

const column = RiskTreatmentHeaderTable;

const useStyles = makeStyles({
  div: {
    width: 'max-content'
  }
});

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
    borderRight: '1px solid rgba(224, 224, 224, 1) !important'
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

export default function RiskTreatmentTable() {
  const color = ColorTheme();
  const notify = (message, status) => toast[status](message);
  const classes = useStyles();
  const dispatch = useDispatch();
  const [openTs, setOpenTs] = useState(false);
  const [openSelect, setOpenSelect] = useState({
    GoalsModal: false,
    catalogModal: false,
    cyberType: ''
  });
  const [selectedRow, setSelectedRow] = useState({});
  const [details, setDetails] = useState({});
  const [catalogDetails, setCatalogDetails] = useState([]);
  const [selectedScenes, setSelectedScenes] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
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
    deleteRiskTreatment
  } = useStore(selector, shallow);
  const [rows, setRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtered, setFiltered] = useState([]);
  const { title } = useSelector((state) => state?.pageName);
  const [openFilter, setOpenFilter] = useState(false); // Manage the filter modal visibility
  const visibleColumns = useStore((state) => state.riskTreatmentTblClms);
  const toggleColumnVisibility = useStore((state) => state.toggleColumnVisibility);

  // Open/Close the filter modal
  const handleOpenFilter = () => setOpenFilter(true);
  const handleCloseFilter = () => setOpenFilter(false);

  const handleOpenSelect = (row, name) => {
    setSelectedRow(row);
    setOpenSelect((state) => ({ ...state, GoalsModal: true, cyberType: name }));
  };

  const handleCloseSelect = () => {
    setOpenSelect((state) => ({ ...state, GoalsModal: false, cyberType: '' }));
    setSelectedRow({});
    setSelectedScenes([]);
  };

  const handleOpenCatalog = (row) => {
    setSelectedRow(row);
    setOpenSelect((state) => ({ ...state, catalogModal: true }));
  };

  const handleCloseCatalog = () => {
    setOpenSelect((state) => ({ ...state, catalogModal: false }));
    setSelectedRow({});
    setSelectedScenes([]);
  };
  // console.log('riskTreatment', riskTreatment);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  useEffect(() => {
    getCyberSecurityScenario(model?._id);
  }, [model]);

  const refreshAPI = () => {
    getCyberSecurityScenario(model?._id);
    getRiskTreatment(model?._id);
  };

  useEffect(() => {
    const data = riskTreatment?.Details.map((item, i) => {
      // console.log('item', item);
      return {
        SNo: `RT${(i + 1).toString().padStart(3, '0')}`,
        ID: item?.threat_id,
        'Threat Scenario': item?.label,
        detailId: item?.id,
        Assets: item?.threat_scene[0]?.detail?.node ?? '',
        // 'Damage Scenarios': item?.damage_scenarios,
        'Damage Scenarios':
          `[DS${
            item?.threat_scene[0]?.damage_key ? item?.threat_scene[0]?.damage_key?.toString().padStart(3, '0') : `${'0'.padStart(3, '0')}`
          }] ${item?.threat_scene[0]?.damage_name}` ?? '-',
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
        'Related UNECE Threats or Vulns': item?.catalogs
      };
    });
    setRows(data);
    setFiltered(data);
    setCatalogDetails(catalog);
  }, [riskTreatment?.Details.length, riskTreatment.Details]);

  useEffect(() => {
    if (openSelect.cyberType && openSelect.cyberType.includes('Goals')) {
      setDetails(cyber_Goals['scenes']);
    } else {
      setDetails(cyber_Claims['scenes']);
    }
  }, [openSelect?.cyberType, cyber_Goals, cyber_Claims]);

  // console.log('details', details);
  // console.log('rows', rows);
  const Head = useMemo(() => {
    if (title.includes('Derived')) {
      const col = [...column];
      col.splice(4, 0, { id: 14, name: 'Detailed / Combined Threat Scenarios' });
      return col.filter((header) => visibleColumns.includes(header.name));
    } else {
      return column.filter((header) => visibleColumns.includes(header.name));
    }
  }, [title, visibleColumns]);

  const handleOpenModalTs = () => {
    setOpenTs(true);
  };

  const handleCloseTs = () => {
    setOpenTs(false);
  };

  const handleBack = () => {
    dispatch(closeAll());
  };

  // console.log('details', details);
  const onDrop = (event) => {
    // console.log('event', event);
    event.preventDefault();
    const cyber = event.dataTransfer.getData('application/cyber');
    let parsedData;

    if (cyber) {
      parsedData = JSON.parse(cyber);
    }
    // console.log('parsedData', parsedData);
    const details = {
      nodeId: parsedData.nodeId,
      threatId: parsedData.threatId,
      modelId: model?._id,
      label: parsedData?.label,
      damageId: parsedData?.damageId,
      key: parsedData?.key
    };
    // console.log('details', details);
    addRiskTreatment(details)
      .then((res) => {
        if (!res.error) {
          // console.log('res', res);
          notify(res.message ?? 'Threat scene added', 'success');
          getRiskTreatment(model?._id);
        } else {
          notify(res.error, 'error');
        }
      })
      .catch((err) => {
        notify('Something went wrong', 'error');
      });

    // console.log('parsedData', parsedData);
  };

  const handleSearch = (e) => {
    const { value } = e.target;
    if (value.length > 0) {
      const filterValue = rows.filter((rw) => {
        if (rw['Threat Scenario']?.toLowerCase().includes(value) || rw.Assets.toLowerCase().includes(value)) {
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

  const handleDeleteSelected = () => {
    const details = {
      'model-id': model?._id,
      rowIds: selectedRows.map((row) => row?.id),
      threatKeys: selectedRows.map((row) => row?.threat_key)
    };
    deleteRiskTreatment(details)
      .then((res) => {
        if (!res.error) {
          notify(res.message ?? 'Deleted successfully', 'success');
          refreshAPI();
          setSelectedRows([]);
        } else {
          notify(res?.error ?? 'Something went wrong', 'error');
        }
      })
      .catch((err) => {
        if (err) notify('Something went wrong', 'error');
      });
  };

  const toggleRowSelection = (row) => {
    // console.log('row', row);
    const shorted = {
      id: row?.detailId,
      SNo: row?.SNo,
      threat_key: row?.threat_key
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

  const RenderTableRow = React.memo(({ row, Head, color, isChild = false }) => {
    const isSelected = selectedRows.some((selectedRow) => selectedRow.SNo === row.SNo);

    return (
      <StyledTableRow
        key={row.name}
        data={row}
        sx={{
          '&:last-child td, &:last-child th': { border: 0 },
          backgroundColor: isSelected ? '#B2BEB5' : isChild ? '#F4F8FE' : color?.sidebarBG,
          '& .MuiTableCell-root.MuiTableCell-body': {
            color: `${color?.sidebarContent} !important`
          }
        }}
      >
        {Head?.map((item, index) => {
          let cellContent;
          switch (true) {
            case item.name === 'Losses of Cybersecurity Properties':
              cellContent = (
                <StyledTableCell component="th" scope="row">
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <CircleIcon sx={{ fontSize: 14, color: colorPicker(row[item.name]) }} />
                    <span style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: 'max-content' }}>
                      Loss of {row[item.name]}
                    </span>
                  </span>
                </StyledTableCell>
              );
              break;
            case item.name === 'SNo':
              cellContent = (
                <StyledTableCell
                  key={index}
                  style={{ width: 'auto', cursor: 'pointer' }}
                  align="left"
                  onClick={() => toggleRowSelection(row)}
                >
                  {row[item.name] ? row[item.name] : '-'}
                </StyledTableCell>
              );
              break;

            case item.name === 'Attack Tree or Attack Path(s)':
              cellContent = (
                // onClick={() => handleOpenSelect(row)} sx={{ cursor: 'pointer' }}
                <StyledTableCell component="th" scope="row">
                  {row[item.name] !== null ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <img src={AttackIcon} alt="damage" height="10px" width="10px" />
                      <span style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: 'max-content' }}>
                        {row[item.name]?.Name}
                      </span>
                    </span>
                  ) : (
                    // <InputLabel>Select attack path</InputLabel>
                    <InputLabel> - </InputLabel>
                  )}
                </StyledTableCell>
              );
              break;
            case item.name.includes('Cybersecurity'):
              cellContent = (
                <StyledTableCell component="th" scope="row" onClick={() => handleOpenSelect(row, item.name)} sx={{ cursor: 'pointer' }}>
                  {row[item.name] && row[item.name].length ? (
                    row[item?.name]?.map((goal) => (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }} key={goal?.ID}>
                        <img
                          src={item.name === 'Cybersecurity Goals' ? CyberGoalIcon : CyberClaimsIcon}
                          alt="damage"
                          height="15px"
                          width="15px"
                        />
                        <span style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: 'max-content' }}>{goal?.Name}</span>
                      </span>
                    ))
                  ) : (
                    <InputLabel>{item.name === 'Cybersecurity Goals' ? 'Select Goals' : 'Select Claims'}</InputLabel>
                  )}
                </StyledTableCell>
              );
              break;
            case item.name === 'Related UNECE Threats or Vulns':
              cellContent = (
                <StyledTableCell component="th" scope="row" onClick={() => handleOpenCatalog(row)} sx={{ cursor: 'pointer' }}>
                  {row[item.name] && row[item.name].length ? (
                    row[item?.name]?.map((catalog) => (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }} key={catalog}>
                        <img src={CatalogIcon} alt="damage" height="15px" width="15px" />
                        <span style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: 'max-content' }}>{catalog}</span>
                      </span>
                    ))
                  ) : (
                    <InputLabel>Select Catalogs</InputLabel>
                  )}
                </StyledTableCell>
              );
              break;

            case item.name === 'Damage Scenarios':
              cellContent = (
                <StyledTableCell component="th" scope="row">
                  {
                    // row[item.name] && row[item.name].length ? (
                    // row[item.name].map((damage, i) => (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <img src={DamageIcon} alt="damage" height="10px" width="10px" />
                      <span style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: 'max-content' }}>{row[item?.name]}</span>
                    </span>
                    // ))
                    // ) : (
                    //   <InputLabel>N/A</InputLabel>
                    //   )
                  }
                </StyledTableCell>
              );
              break;
            case item.name === 'Contributing Requirements':
              cellContent = (
                <StyledTableCell component="th" scope="row">
                  {row[item.name]?.map((require, i) => (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }} key={require?.ID}>
                      <img src={CyberRequireIcon} alt="damage" height="10px" width="10px" />
                      <span style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: 'max-content' }}>{require?.Name}</span>
                    </span>
                  ))}
                </StyledTableCell>
              );
              break;

            case item.name.includes('Impact'):
              // const impact = OverallImpact(row[item?.name]);
              const impact = colorPickerTab(row[item?.name]);

              return (
                <StyledTableCell key={index} align={'left'} sx={{ backgroundColor: impact, color: '#000' }}>
                  {row[item?.name]}
                </StyledTableCell>
              );
            case item.name === 'Attack Feasibility Rating':
              const bgColor = RatingColor(row[item?.name]);
              return (
                <StyledTableCell key={index} align={'left'} sx={{ backgroundColor: bgColor, color: '#000' }}>
                  {row[item?.name]}
                </StyledTableCell>
              );

            case typeof row[item.name] !== 'object':
              cellContent = (
                <StyledTableCell key={index} align={'left'}>
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
      </StyledTableRow>
    );
  });

  return (
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <KeyboardBackspaceRoundedIcon sx={{ float: 'left', cursor: 'pointer', color: color?.title }} onClick={handleBack} />
          <Typography sx={{ color: color?.title, fontWeight: 600, fontSize: '16px' }}>{title} Table</Typography>
        </Box>
        <Box display="flex" gap={3}>
          <TextField
            id="outlined-size-small"
            placeholder="Search"
            size="small"
            value={searchTerm}
            onChange={handleSearch}
            sx={{
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
          {/* <Button sx={{ float: 'right', mb: 2 }} variant="contained" onClick={handleOpenModalTs}>
            Add New Scenario
          </Button> */}
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
          {RiskTreatmentHeaderTable.map((column) => (
            <FormControlLabel
              key={column.id}
              control={
                <Checkbox
                  checked={visibleColumns.includes(column.name)}
                  onChange={() => toggleColumnVisibility('riskTreatmentTblClms', column.name)}
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
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <Table stickyHeader sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              {Head?.map((hd) => (
                <StyledTableCell key={hd?.id}>{hd?.name}</StyledTableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)?.map((row, rowKey) => (
              <RenderTableRow key={rowKey} row={row} Head={Head} color={color} />
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
      <AddThreatScenarios open={openTs} handleClose={handleCloseTs} id={model?._id} />
      {openSelect.GoalsModal && (
        <SelectCyberGoals
          riskTreatment={riskTreatment}
          type={openSelect?.cyberType}
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
}
