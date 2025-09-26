/* eslint-disable */
import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  TableSortLabel
} from '@mui/material';
import { useSelector } from 'react-redux';
import AddThreatScenarios from '../Modal/AddThreatScenario';
import { Box } from '@mui/system';
import ColorTheme from '../../themes/ColorTheme';
import { colorPicker, colorPickerTab, OverallImpact, RatingColor, threatType } from './constraints';
import CircleIcon from '@mui/icons-material/Circle';
import DeleteIcon from '@mui/icons-material/Delete';
import { AttackIcon, DamageIcon, CyberGoalIcon, CyberRequireIcon, CatalogIcon, CyberClaimsIcon } from '../../assets/icons';
import toast, { Toaster } from 'react-hot-toast';
import SelectCyberGoals from '../Modal/SelectCyberGoals';
import { RiskTreatmentHeaderTable } from './constraints';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { tableHeight } from '../../themes/constant';
import SelectCatalog from '../Modal/SelectCatalog';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { riskSteps } from '../../utils/Steps';
import AutoGuidePopper from '../Poppers/AutoGuidePopper';

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

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
    borderRight: '1px solid rgba(255, 255, 255, 0.2) !important',
    padding: '12px 8px',
    fontSize: '0.875rem',
    fontWeight: 600,
    textAlign: 'center',
    whiteSpace: 'normal',
    wordBreak: 'break-word',
    lineHeight: 1.4,
    '&:first-of-type': {
      borderTopLeftRadius: theme.shape.borderRadius,
    },
    '&:last-child': {
      borderTopRightRadius: theme.shape.borderRadius,
      borderRight: 'none !important'
    }
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: '0.8125rem',
    borderRight: '1px solid rgba(0, 0, 0, 0.08) !important',
    borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
    padding: '10px 8px',
    textAlign: 'center',
    verticalAlign: 'middle',
    transition: 'all 0.2s ease-in-out',
    maxWidth: '250px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    '&:last-child': {
      borderRight: 'none',
      paddingRight: '16px',
      borderRight: 'none !important'
    },
    '&:first-of-type': {
      paddingLeft: '16px'
    }
}}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: theme.shadows[1],
    '& td': {
      color: theme.palette.text.primary,
      position: 'relative',
      zIndex: 1,
      '&:first-of-type': {
        borderTopLeftRadius: '4px',
        borderBottomLeftRadius: '4px',
      },
      '&:last-child': {
        borderTopRightRadius: '4px',
        borderBottomRightRadius: '4px',
      }
    }
  },
  '&.Mui-selected': {
    backgroundColor: 'rgba(25, 118, 210, 0.08) !important',
    '&:hover': {
      backgroundColor: 'rgba(25, 118, 210, 0.12) !important',
    },
    '& td': {
      color: theme.palette.primary.main,
      fontWeight: 500
    }
  },
  '&.MuiTableRow-hover': {
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  '&:last-child td, &:last-child th': { border: 0 }
}));

export default function RiskTreatmentTable() {
  const color = ColorTheme();
  const notify = (message, status) => toast[status](message);
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
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const { title } = useSelector((state) => state?.pageName);
  const [openFilter, setOpenFilter] = useState(false); // Manage the filter modal visibility
  const visibleColumns = useStore((state) => state.riskTreatmentTblClms);
  const toggleColumnVisibility = useStore((state) => state.toggleColumnVisibility);
  const [runTour, setRunTour] = useState(false);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('SNo');

  const Head = useMemo(() => {
    if (title.includes('Derived')) {
      const col = [...column];
      col.splice(4, 0, { id: 14, name: 'Detailed / Combined Threat Scenarios' });
      return col.filter((header) => visibleColumns.includes(header.name));
    } else {
      return column.filter((header) => visibleColumns.includes(header.name));
    }
  }, [title, visibleColumns]);

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

  // Open/Close the filter modal
  const handleOpenFilter = () => setOpenFilter(true);
  const handleCloseFilter = () => setOpenFilter(false);
  const [columnWidths, setColumnWidths] = useState(Object.fromEntries(RiskTreatmentHeaderTable?.map((col) => [col.id, col.w])));

  const handleResizeStart = (e, columnId) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = columnWidths[columnId];

    const handleMouseMove = (event) => {
      const newWidth = Math.max(
        startWidth + (event.clientX - startX),
        RiskTreatmentHeaderTable?.find((col) => col.id === columnId)?.minW || 50
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

  useEffect(() => {
    getCyberSecurityScenario(model?._id);
  }, [model]);

  const refreshAPI = () => {
    getCyberSecurityScenario(model?._id);
    getRiskTreatment(model?._id);
  };

  useEffect(() => {
    const data = riskTreatment?.Details?.map((item, i) => {
      // console.log('item', item);
      return {
        SNo: `RT${(i + 1).toString().padStart(3, '0')}`,
        ID: item?.threat_id,
        'Threat Scenario': item?.label,
        detailId: item?.id,
        Assets: item?.threat_scene ? item?.threat_scene[0]?.detail?.node : '',
        // 'Damage Scenarios': item?.damage_scenarios,
        'Damage Scenarios': item?.threat_scene
          ? `[DS${
              item?.threat_scene[0]?.damage_key ? item?.threat_scene[0]?.damage_key?.toString().padStart(3, '0') : `${'0'.padStart(3, '0')}`
            }] ${item?.threat_scene[0]?.damage_name}`
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
        'Related UNECE Threats or Vulns': item?.catalogs
      };
    });
    setRows(data);
    setCatalogDetails(catalog);
  }, [riskTreatment?.Details.length, riskTreatment.Details]);

  useEffect(() => {
    if (openSelect.cyberType && openSelect.cyberType.includes('Goals')) {
      setDetails(cyber_Goals['scenes']);
    } else {
      setDetails(cyber_Claims['scenes']);
    }
  }, [openSelect?.cyberType, cyber_Goals, cyber_Claims]);

  const handleCloseTs = () => {
    setOpenTs(false);
  };

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
                <StyledTableCell component="th" scope="row" sx={{ width: `${columnWidths[item.id] || 'auto'}` }}>
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
                  style={{ cursor: 'pointer', width: `${columnWidths[item.id] || 'auto'}` }}
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
                <StyledTableCell component="th" scope="row" sx={{ width: `${columnWidths[item.id] || 'auto'}` }}>
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
                <StyledTableCell
                  id={item.name === 'Cybersecurity Goals' ? 'select-goals' : 'select-claims'}
                  component="th"
                  scope="row"
                  sx={{
                    width: `${columnWidths[item.id] || 'auto'}`
                  }}
                >
                  {row[item.name] && row[item.name].length ? (
                    <Box
                      onClick={() => handleOpenSelect(row, item.name)} // Make the list clickable for updates
                      sx={{
                        cursor: 'pointer', // Indicate it's clickable
                        width: '100%'
                      }}
                    >
                      {row[item.name].map((goal, i) => {
                        return (
                          <Box
                            key={goal?.ID || i}
                            display="flex"
                            alignItems="center"
                            gap={1}
                            sx={{
                              textAlign: 'left',
                              width: '100%',
                              maxWidth: '250px',
                              whiteSpace: 'normal',
                              wordBreak: 'break-word',
                              mb: 0.8
                            }}
                          >
                            <img
                              src={item.name === 'Cybersecurity Goals' ? CyberGoalIcon : CyberClaimsIcon}
                              alt="icon"
                              height="15px"
                              width="15px"
                              style={{ alignSelf: 'flex-start', marginTop: '3px' }}
                            />
                            <Box display="flex" flexDirection="column" gap="5px" minWidth="100px">
                              {goal?.Name}
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>
                  ) : (
                    <InputLabel onClick={() => handleOpenSelect(row, item.name)} sx={{ cursor: 'pointer' }}>
                      Select
                    </InputLabel>
                  )}
                </StyledTableCell>
              );
              break;

            case item.name === 'Related UNECE Threats or Vulns':
              cellContent = (
                <StyledTableCell
                  id="select-catalogs"
                  component="th"
                  scope="row"
                  onClick={() => handleOpenCatalog(row)}
                  sx={{ cursor: 'pointer', width: `${columnWidths[item.id] || 'auto'}` }}
                >
                  {row[item.name] && row[item.name].length ? (
                    row[item?.name]?.map((catalog) => (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'center' }} key={catalog}>
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
                <StyledTableCell component="th" scope="row" sx={{ width: `${columnWidths[item.id] || 'auto'}` }}>
                  {
                    // row[item.name] && row[item.name].length ? (
                    // row[item.name].map((damage, i) => (
                    <span style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8 }}>
                      <img src={DamageIcon} alt="damage" height="10px" width="10px" />
                      <span style={{ textAlign: 'start', width: 'max-content' }}>{row[item?.name]}</span>
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
                <StyledTableCell component="th" scope="row" sx={{ width: `${columnWidths[item.id] || 'auto'}` }}>
                  {row[item.name]?.map((require, i) => (
                    <span style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8 }} key={require?.ID}>
                      <img src={CyberRequireIcon} alt="damage" height="10px" width="10px" />
                      <span style={{ textAlign: 'start', width: 'max-content' }}>{require?.Name}</span>
                    </span>
                  ))}
                </StyledTableCell>
              );
              break;

            case item.name.includes('Impact'):
              // const impact = OverallImpact(row[item?.name]);
              const impact = colorPickerTab(row[item?.name]);

              return (
                <StyledTableCell
                  key={index}
                  align={'left'}
                  sx={{ backgroundColor: impact, color: '#000', width: `${columnWidths[item.id] || 'auto'}` }}
                >
                  {row[item?.name]}
                </StyledTableCell>
              );
            case item.name === 'Attack Feasibility Rating':
              const bgColor = RatingColor(row[item?.name]);
              return (
                <StyledTableCell
                  key={index}
                  align={'left'}
                  sx={{ backgroundColor: bgColor, color: '#000', width: `${columnWidths[item.id] || 'auto'}` }}
                >
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
    <>
      <AutoGuidePopper steps={riskSteps} runTour={runTour} setRunTour={setRunTour} />
      <Box
        sx={{
          overflow: 'auto !important',
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
            {/* <KeyboardBackspaceRoundedIcon sx={{ float: 'left', cursor: 'pointer', color: color?.title }} onClick={handleBack} /> */}
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
            <Button
              id="filter-columns-btn"
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
              id="delete-scenario"
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
          sx={{
            '&.MuiPaper-elevation2': {
              overflow: 'auto !important'
            },
            borderRadius: '0px',
            padding: 0.25,
            maxHeight: tableHeight,
            scrollbarWidth: 'thin'
          }}
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <Table stickyHeader sx={{ tableLayout: 'fixed', width: '100%' }} aria-label="simple table">
            <TableHead>
              <TableRow>
                {Head?.map((hd) => (
                  <StyledTableCell
                    key={hd.id}
                    id="drag_drop"
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
              {paginatedRows?.map((row, rowKey) => (
                <RenderTableRow key={rowKey} row={row} Head={Head} color={color} />
              ))}
            </TableBody>
          </Table>
          {!rows?.length && (
            <Box display="flex">
              <Typography variant="h5">Note </Typography>: drag the threat & drop in the header
            </Box>
          )}
        </TableContainer>

        <TablePagination
          sx={{
            position: 'absolute',
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
    </>
  );
}
