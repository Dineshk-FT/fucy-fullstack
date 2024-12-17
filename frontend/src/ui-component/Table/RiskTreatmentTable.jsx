/* eslint-disable */
import React, { useEffect, useMemo, useState } from 'react';
import useStore from '../../Zustand/store';
import { shallow } from 'zustand/shallow';
import { useParams } from 'react-router';
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
  InputLabel
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useDispatch, useSelector } from 'react-redux';
import { closeAll } from '../../store/slices/CurrentIdSlice';
import AddThreatScenarios from '../Modal/AddThreatScenario';
import { Box } from '@mui/system';
import ColorTheme from '../../store/ColorTheme';
import { colorPicker, colorPickerTab, OverallImpact, threatType } from './constraints';
import CircleIcon from '@mui/icons-material/Circle';
import SelectAttacks from '../Modal/SelectAttacks';
import { ThreatIcon, DamageIcon } from '../../assets/icons';

const selector = (state) => ({
  model: state.model,
  getModel: state.getModelById,
  riskTreatment: state.riskTreatment['subs'][0],
  getRiskTreatment: state.getRiskTreatment,
  addRiskTreatment: state.addRiskTreatment,
  attackScenarios: state.attackScenarios['subs']
});

const column = [
  { id: 1, name: 'ID' },
  { id: 2, name: 'Threat Scenario' },
  { id: 3, name: 'Assets' },
  { id: 4, name: 'Damage Scenarios' },
  { id: 5, name: 'Related UNECE Threats or Vulns' },
  { id: 6, name: 'Safety Impact' },
  { id: 7, name: 'Financial Impact' },
  { id: 8, name: 'Operational Impact' },
  { id: 9, name: 'Privacy Impact' },
  { id: 10, name: 'Attack Tree or Attack Path(s)' },
  { id: 11, name: 'Attack Path Name' },
  { id: 12, name: 'Attack Path Details' },
  { id: 13, name: 'Attack Feasibility Rating' },
  { id: 14, name: 'Mitigated Attack Feasibility' },
  { id: 15, name: 'Acceptence Level' },
  { id: 16, name: 'Safety Risk' },
  { id: 17, name: 'Financial Risk' },
  { id: 18, name: 'Operational Risk' },
  { id: 19, name: 'Privacy Risk' },
  { id: 20, name: 'Residual Safety Risk' },
  { id: 21, name: 'Residual Financial Risk' },
  { id: 22, name: 'Residual Operational Risk' },
  { id: 23, name: 'Residual Privacy Risk' },
  { id: 24, name: 'Risk Treatment Options' },
  { id: 25, name: 'Risk Treatment Justification' },
  { id: 26, name: 'Applied Measures' },
  { id: 27, name: 'Detailed / Combained Threat Scenarios' },
  { id: 28, name: 'Cybersecurity Goals' },
  { id: 29, name: 'Contributing Requirements' },
  { id: 30, name: 'CyberSecurity Claims' }
];

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
    borderRight: '1px solid rgba(224, 224, 224, 1) !important'
  }
}));

const StyledTableRow = styled(TableRow)(() => ({
  '&:last-child td, &:last-child th': {
    border: 0
  }
}));

export default function RiskTreatmentTable() {
  const color = ColorTheme();
  const classes = useStyles();
  const { id } = useParams();
  const dispatch = useDispatch();
  const [openTs, setOpenTs] = useState(false);
  const [openSelect, setOpenSelect] = useState(false);
  const [selectedRow, setSelectedRow] = useState({});
  const [details, setDetails] = useState({});
  const [selectedScene, setSelectedScene] = useState(null);

  const { model, riskTreatment, getRiskTreatment, addRiskTreatment, attackScenarios } = useStore(selector, shallow);
  const [rows, setRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtered, setFiltered] = useState([]);
  const { title } = useSelector((state) => state?.pageName);

  const handleOpenSelect = (row) => {
    setSelectedRow(row);
    setOpenSelect(true);
  };

  const handleCloseSelect = () => {
    setOpenSelect(false);
    setSelectedRow({});
  };
  // console.log('riskTreatment', riskTreatment);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    const data = riskTreatment?.Details.map((item) => {
      // console.log('item', item);
      return {
        ID: item?.threat_id,
        'Threat Scenario': item?.label,
        'Damage Scenarios': item?.damage_scenarios,
        'Safety Impact': item?.damage_scenarios.map((scene) => scene?.impacts['Safety Impact']) ?? '',
        'Financial Impact': item?.damage_scenarios.map((scene) => scene?.impacts['Financial Impact']) ?? '',
        'Operational Impact': item?.damage_scenarios.map((scene) => scene?.impacts['Operational Impact']) ?? '',
        'Privacy Impact': item?.damage_scenarios.map((scene) => scene?.impacts['Privacy Impact']) ?? '',
        'Attack Feasibility Rating': ''
      };
    });
    setRows(data);
    setFiltered(data);
    const attacktrees = attackScenarios.find((item) => item.type == 'attack_trees');
    setDetails(attacktrees);
    // console.log('attacktrees', attacktrees);
  }, [riskTreatment?.Details.length, attackScenarios]);

  // console.log('rows', rows);
  const Head = useMemo(() => {
    if (title.includes('Derived')) {
      const col = [...column];
      col.splice(4, 0, { id: 14, name: 'Detailed / Combined Threat Scenarios' });
      return col;
    } else {
      return column;
    }
  }, [title]);

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
      damageId: parsedData?.damageId
    };
    addRiskTreatment(details);
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

  const RenderTableRow = ({ row, rowKey, isChild = false }) => {
    return (
      <StyledTableRow
        key={row.name}
        data={row}
        sx={{
          '&:last-child td, &:last-child th': { border: 0 },
          '&:nth-of-type(even)': {
            backgroundColor: '#F4F8FE'
          },
          backgroundColor: isChild ? '#F4F8FE' : ''
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
                <StyledTableCell component="th" scope="row" onClick={() => handleOpenSelect(row)} sx={{ cursor: 'pointer' }}>
                  {row[item.name] && row[item.name].length ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <img src={ThreatIcon} alt="damage" height="10px" width="10px" />
                      <span style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: 'max-content' }}>{row[item.name]}</span>
                    </span>
                  ) : (
                    <InputLabel>Select attack path</InputLabel>
                  )}
                </StyledTableCell>
              );
              break;
            case item.name === 'Damage Scenarios':
              cellContent = (
                <StyledTableCell component="th" scope="row">
                  {row[item.name] && row[item.name].length ? (
                    row[item.name].map((damage, i) => (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }} key={i}>
                        <img src={DamageIcon} alt="damage" height="10px" width="10px" />
                        <span style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: 'max-content' }}>{damage?.Name}</span>
                      </span>
                    ))
                  ) : (
                    <InputLabel>N/A</InputLabel>
                  )}
                </StyledTableCell>
              );
              break;
            case item.name.includes('Impact'):
              const impact = OverallImpact(row[item?.name]);
              return (
                <StyledTableCell key={index} align={'left'} sx={{ backgroundColor: colorPickerTab(impact), color: '#000' }}>
                  {impact}
                </StyledTableCell>
              );

              break;

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
  };

  return (
    <Box sx={{ overflow: 'auto', height: '-webkit-fill-available', minHeight: 'moz-available' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box display="flex" alignItems="center" gap={1}>
          <KeyboardBackspaceRoundedIcon sx={{ float: 'left', cursor: 'pointer', ml: 1, color: color?.title }} onClick={handleBack} />
          <Typography sx={{ color: color?.title, fontWeight: 600, fontSize: '18px' }}>{title} Table</Typography>
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
        </Box>
      </Box>

      <TableContainer
        component={Paper}
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()} // Allow drop by preventing the default behavior
      >
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              {Head?.map((hd) => (
                <StyledTableCell key={hd?.id}>{hd?.name}</StyledTableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)?.map((row, rowkey) => (
              <RenderTableRow row={row} rowKey={rowkey} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filtered.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      <AddThreatScenarios open={openTs} handleClose={handleCloseTs} model={model} id={id} />
      {openSelect && (
        <SelectAttacks
          open={openSelect}
          handleClose={handleCloseSelect}
          details={details}
          selectedScene={selectedScene}
          setSelectedScene={setSelectedScene}
        />
      )}
    </Box>
  );
}
