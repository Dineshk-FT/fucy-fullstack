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
import SelectAttacks from '../Modal/SelectAttacks';
import { AttackIcon, DamageIcon, CybersecurityIcon } from '../../assets/icons';
import toast, { Toaster } from 'react-hot-toast';
import SelectCyberGoals from '../Modal/SelectCyberGoals';
import { RiskTreatmentHeaderTable } from './constraints';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { tableHeight } from '../../store/constant';

const selector = (state) => ({
  model: state.model,
  getModel: state.getModelById,
  riskTreatment: state.riskTreatment['subs'][0],
  getRiskTreatment: state.getRiskTreatment,
  addRiskTreatment: state.addRiskTreatment,
  cyber_Goals: state.cybersecurity['subs'][0],
  updateRiskTable: state.updateRiskTable
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
    color: '#000',
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
  const [openSelect, setOpenSelect] = useState(false);
  const [selectedRow, setSelectedRow] = useState({});
  const [details, setDetails] = useState({});
  const [selectedScenes, setSelectedScenes] = useState([]);
  const { model, riskTreatment, getRiskTreatment, addRiskTreatment, cyber_Goals, updateRiskTable } = useStore(selector, shallow);
  const [rows, setRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtered, setFiltered] = useState([]);
  const { title } = useSelector((state) => state?.pageName);
  const [openFilter, setOpenFilter] = useState(false); // Manage the filter modal visibility
  const visibleColumns = useStore((state) => state.visibleColumns4);
  const toggleColumnVisibility = useStore((state) => state.toggleColumnVisibility);

  // Open/Close the filter modal
  const handleOpenFilter = () => setOpenFilter(true);
  const handleCloseFilter = () => setOpenFilter(false);

  const handleOpenSelect = (row) => {
    setSelectedRow(row);
    setOpenSelect(true);
  };

  const handleCloseSelect = () => {
    setOpenSelect(false);
    setSelectedRow({});
    setSelectedScenes([]);
  };
  // console.log('riskTreatment', riskTreatment);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    const data = riskTreatment?.Details.map((item, i) => {
      // console.log('item', item);
      return {
        SNo: `RT${(i + 1).toString().padStart(3, '0')}`,
        ID: item?.threat_id,
        'Threat Scenario': item?.label,
        Assets: item?.threat_scene[0]?.detail?.node,
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
        threat_key: item?.threat_key
      };
    });
    setRows(data);
    setFiltered(data);
    setDetails(cyber_Goals['scenes']);
    // console.log('attacktrees', attacktrees);
  }, [riskTreatment?.Details.length, riskTreatment.Details, cyber_Goals]);

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
    if (cyber.type === 'cybersecurity_goals') {
    } else {
      const details = {
        nodeId: parsedData.nodeId,
        threatId: parsedData.threatId,
        modelId: model?._id,
        label: parsedData?.label,
        damageId: parsedData?.damageId,
        key: parsedData?.key
      };
      addRiskTreatment(details)
        .then((res) => {
          if (!res.error) {
            console.log('res', res);
            notify(res.message ?? 'Threat scene added', 'success');
            getRiskTreatment(model?._id);
          } else {
            notify(res.error, 'error');
          }
        })
        .catch((err) => {
          notify('Something went wrong', 'error');
        });
    }
    // console.log('parsedData', parsedData);
  };

  const handleSearch = (e) => {
    const { value } = e.target;
    if (value.length > 0) {
      const filterValue = rows.filter((rw) => {
        if (rw.name.toLowerCase().includes(value) || rw.Description.toLowerCase().includes(value)) {
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

  const RenderTableRow = React.memo(({ row, Head, color, handleOpenSelect }) => {
    return (
      <StyledTableRow
        key={row.name}
        data={row}
        sx={{
          '&:last-child td, &:last-child th': { border: 0 },
          '&:nth-of-type(even)': {
            backgroundColor: '#F4F8FE'
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
            case item.name === 'Cybersecurity Goals':
              cellContent = (
                <StyledTableCell component="th" scope="row" onClick={() => handleOpenSelect(row)} sx={{ cursor: 'pointer' }}>
                  {row[item.name] ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <img src={AttackIcon} alt="damage" height="10px" width="10px" />
                      <span style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: 'max-content' }}>
                        {row[item.name]?.Name}
                      </span>
                    </span>
                  ) : (
                    <InputLabel>Select Goals</InputLabel>
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
                      <img src={CybersecurityIcon} alt="damage" height="10px" width="10px" />
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
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box display="flex" alignItems="center" gap={1}>
          <KeyboardBackspaceRoundedIcon sx={{ float: 'left', cursor: 'pointer', ml: 1, color: color?.title }} onClick={handleBack} />
          <Typography sx={{ color: color?.title, fontWeight: 600, fontSize: '16px' }}>{title} Table</Typography>
        </Box>
        <Box display="flex" gap={3}>
          <TextField
            id="outlined-size-small"
            placeholder="Search"
            size="small"
            value={searchTerm}
            onChange={handleSearch}
            sx={{ '& .MuiInputBase-input': { border: '1px solid black' } }}
          />
          {/* <Button sx={{ float: 'right', mb: 2 }} variant="contained" onClick={handleOpenModalTs}>
            Add New Scenario
          </Button> */}
          <Button
            sx={{
              float: 'right',
              mb: 2,
              backgroundColor: '#4caf50',
              ':hover': {
                backgroundColor: '#388e3c'
              }
            }}
            variant="contained"
            onClick={handleOpenFilter}
          >
            <FilterAltIcon />
            Filter Columns
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
                  onChange={() => toggleColumnVisibility('visibleColumns4', column.name)}
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

      <TableContainer component={Paper} sx={{ borderRadius: '0px', padding: 1, maxHeight: tableHeight, scrollbarWidth: 'thin' }}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              {Head?.map((hd) => (
                <StyledTableCell key={hd?.id}>{hd?.name}</StyledTableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)?.map((row, rowKey) => (
              <RenderTableRow key={rowKey} row={row} Head={Head} color={color} handleOpenSelect={handleOpenSelect} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filtered.length}
        rowsPerPageOptions={[5, 10, 25, 50, 100]}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      <AddThreatScenarios open={openTs} handleClose={handleCloseTs} id={model?._id} />
      {/* {openSelect && (
        <SelectAttacks
          open={openSelect}
          handleClose={handleCloseSelect}
          details={details}
          selectedScene={selectedScene}
          setSelectedScene={setSelectedScene}
          // updateRiskTreatment={updateRiskTreatment}
          getRiskTreatment={getRiskTreatment}
          selectedRow={selectedRow}
          model={model}
        />
      )} */}
      {openSelect && (
        <SelectCyberGoals
          open={openSelect}
          handleClose={handleCloseSelect}
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
