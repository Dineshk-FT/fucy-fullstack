import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import useStore from '../../Zustand/store';
import { shallow } from 'zustand/shallow';
import { useParams } from 'react-router';
import CircleIcon from '@mui/icons-material/Circle';
import KeyboardBackspaceRoundedIcon from '@mui/icons-material/KeyboardBackspaceRounded';
import { Button, Checkbox, FormControl, MenuItem, Select, TextField, Typography, styled } from '@mui/material';
import AddDamageScenarios from '../Modal/AddDamageScenario';
import { useDispatch } from 'react-redux';
import { closeAll } from '../../store/slices/CurrentIdSlice';
import SelectLosses from '../Modal/SelectLosses';
import { makeStyles } from '@mui/styles';
import { Box } from '@mui/system';
import ColorTheme from '../../store/ColorTheme';
import toast, { Toaster } from 'react-hot-toast';
import { colorPicker, colorPickerTab } from './constraints';

const selector = (state) => ({
  modal: state.modal,
  getModalById: state.getModalById,
  getModals: state.getModals,
  update: state.updateModal
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
    borderRight: '1px solid rgba(224, 224, 224, 1) !important'
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    borderRight: '1px solid rgba(224, 224, 224, 1) !important'
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

const SelectableCell = ({ row, options, handleChange, colorPickerTab, impact, name }) => {
  return (
    <StyledTableCell component="th" scope="row" sx={{ background: colorPickerTab(impact) }}>
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
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          name={name}
          value={impact}
          onChange={(e) => handleChange(e, row)}
        >
          {options?.map((item) => (
            <MenuItem key={item?.value} value={item?.value}>
              {item?.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </StyledTableCell>
  );
};

export default function DsTable() {
  const color = ColorTheme();
  const { modal, getModals, getModalById, update } = useStore(selector, shallow);
  const [stakeHolder] = React.useState(false);
  const classes = useStyles();
  const { id } = useParams();
  const dispatch = useDispatch();
  const [openDs, setOpenDs] = React.useState(false);
  const [openCl, setOpenCl] = React.useState(false);
  const [rows, setRows] = React.useState([]);
  const [selectedRow, setSelectedRow] = React.useState({});
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filtered, setFiltered] = React.useState([]);

  React.useEffect(() => {
    getModalById(id);
  }, [id]);

  const notify = (message, status) => toast[status](message);

  const Head = React.useCallback(() => {
    if (stakeHolder) {
      return [
        { id: 1, name: 'ID' },
        { id: 2, name: 'Name' },
        { id: 3, name: 'Damage Scenario' },
        { id: 4, name: 'Description/ Scalability' },
        { id: 5, name: 'Losses of Cybersecurity Properties' },
        { id: 6, name: 'Assets' },
        { id: 7, name: 'Component/Message' },
        { id: 8, name: 'Safety Impact per StakeHolder' },
        { id: 9, name: 'Financial Impact per StakeHolder' },
        { id: 10, name: 'Operational Impact per StakeHolder' },
        { id: 11, name: 'Privacy Impact per StakeHolder' },
        { id: 12, name: 'Impact Justification by Stakeholder' },
        { id: 13, name: 'Safety Impact' },
        { id: 14, name: 'Financial Impact' },
        { id: 15, name: 'Operational Impact' },
        { id: 16, name: 'Privacy Impact' },
        { id: 17, name: 'Impact Justification' },
        { id: 18, name: 'Associated Threat Scenarios' },
        { id: 19, name: 'Overall Impact' },
        { id: 20, name: 'Asset is Evaluated' },
        { id: 21, name: 'Cybersecurity Properties are Evaluated' },
        { id: 22, name: 'Unevaluated Cybersecurity Properties' }
      ];
    } else {
      return [
        { id: 1, name: 'ID' },
        { id: 2, name: 'Name' },
        { id: 3, name: 'Damage Scenario' },
        { id: 4, name: 'Description/ Scalability' },
        { id: 5, name: 'Losses of Cybersecurity Properties' },
        { id: 6, name: 'Assets' },
        { id: 7, name: 'Component/Message' },
        { id: 13, name: 'Safety Impact' },
        { id: 14, name: 'Financial Impact' },
        { id: 15, name: 'Operational Impact' },
        { id: 16, name: 'Privacy Impact' },
        { id: 17, name: 'Impact Justification' },
        { id: 18, name: 'Associated Threat Scenarios' },
        { id: 19, name: 'Overall Impact' },
        { id: 20, name: 'Asset is Evaluated' },
        { id: 21, name: 'Cybersecurity Properties are Evaluated' },
        { id: 22, name: 'Unevaluated Cybersecurity Properties' }
      ];
    }
  }, []);

  const handleOpenCl = (row) => {
    setSelectedRow(row);
    setOpenCl(true);
  };

  const handleCloseCl = () => {
    setOpenCl(false);
    setSelectedRow({});
  };

  const handleSearch = (e) => {
    const { value } = e.target;
    // console.log('value', value);
    // console.log("valuerows", rows);
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

  React.useEffect(() => {
    if (modal.scenarios) {
      const mod2 = modal?.scenarios[1]?.subs[1]?.scenes?.map((ls) => ({
        id: ls?.id,
        name: ls?.name,
        Description: ls?.Description,
        cyberLosses: ls?.cyberLosses ? ls.cyberLosses : [],
        impacts: {
          Financial: ls?.impacts?.Financial ? ls?.impacts?.Financial : '',
          Safety: ls?.impacts?.Safety ? ls?.impacts?.Safety : '',
          Operational: ls?.impacts?.Operational ? ls?.impacts?.Operational : '',
          Privacy: ls?.impacts?.Privacy ? ls?.impacts?.Privacy : ''
        }
      }));
      // console.log('mod2', mod2)
      // const combained = mod1.concat(mod2);
      // console.log('combained', combained)
      setRows(mod2);
      setFiltered(mod2);
    }
  }, [modal]);

  const handleOpenModalDs = () => {
    setOpenDs(true);
  };
  const handleCloseDs = () => {
    setOpenDs(false);
  };

  const handleChange = (e, row) => {
    const Rows = [...rows];
    const editRow = Rows.find((ele) => ele.id === row.id);
    const { name, value } = e.target;
    if (name) {
      editRow.impacts = { ...editRow.impacts, [`${name}`]: value };
    }
    const Index = Rows.findIndex((it) => it.id === editRow.id);
    Rows[Index] = editRow;
    setRows(Rows);
    // console.log('Rows', Rows)
    const updated = Rows?.map((rw) => {
      //eslint-disable-next-line
      const { Description, ...rest } = rw;
      return rest;
    });
    // console.log('updated', updated);
    const mod = { ...modal };
    const losses = mod?.scenarios[1]?.subs[0].losses;
    const lossesEdit = mod?.scenarios[1]?.subs[1]?.scenes;
    // console.log('lossesEdit', lossesEdit);
    const updatedLoss = losses
      .map((loss) =>
        updated.filter((update) => {
          if (loss.id === update.id) {
            return { ...loss, impacts: update.impacts };
          }
        })
      )
      .flat();
    const updatedLossEdit = lossesEdit
      .map((loss) =>
        updated.filter((update) => {
          if (loss.id === update.id) {
            return { ...loss, impacts: update.impacts };
          }
        })
      )
      .flat();
    //     console.log('updatedLoss', updatedLoss)
    // console.log('updatedLossEdit', updatedLossEdit)
    mod.scenarios[1].subs[0].losses = updatedLoss;
    mod.scenarios[1].subs[1].scenes = updatedLossEdit;
    // losses.losses = updated;
    // console.log('modal121232', mod)
    update(mod)
      .then((res) => {
        if (res) {
          setTimeout(() => {
            getModalById(id);
          }, 500);
        }
      })
      .catch((err) => console.log('err', err));
  };
  // console.log('rows', rows);

  // console.log('modal12', modal);

  const options = [
    { value: 'Severe', label: 'Severe' },
    { value: 'Major', label: 'Major' },
    { value: 'Moderate', label: 'Moderate' },
    { value: 'Negligible', label: 'Negligible' }
  ];
  const handleBack = () => {
    dispatch(closeAll());
  };

  const OverallImpact = React.useCallback((impact) => {
    const pattern = (it) => {
      // console.log('it', it);
      return it === 'Negligible'
        ? (it = 1)
        : it === 'Moderate'
        ? (it = 2)
        : it === 'Major'
        ? (it = 3)
        : it === 'Severe'
        ? (it = 4)
        : (it = 0);
    };

    const avgImpact = (ratio) => {
      return ratio === 1 ? 'Negligible' : ratio === 2 ? 'Moderate' : ratio === 3 ? 'Major' : ratio === 4 ? 'Severe' : '';
    };
    const val = Object.values(impact).map((it) => {
      return pattern(it);
    });
    // console.log('val', val)
    const sum = val.reduce((a, b) => a + b);
    const ratio = sum > 0 ? Math.floor(impact && sum / Object.values(impact).length) : 0;
    // console.log('ratio', ratio)
    return avgImpact(ratio);
  }, []);
  // console.log('rows', filtered);
  // console.log('selectedRow', selectedRow)
  return (
    <Box
      sx={{
        overflow: 'auto',
        height: '-webkit-fill-available',
        minHeight: 'moz-available'
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box display="flex" alignItems="center" gap={1}>
          <KeyboardBackspaceRoundedIcon sx={{ float: 'left', cursor: 'pointer', ml: 1, color: color?.title }} onClick={handleBack} />
          <Typography sx={{ color: color?.title, fontWeight: 600, fontSize: '18px' }}>Damage Scenario Table</Typography>
        </Box>
        <Box display="flex" gap={3}>
          <TextField
            id="outlined-size-small"
            placeholder="Search"
            size="small"
            value={searchTerm}
            onChange={handleSearch}
            sx={{
              '& .MuiInputBase-input': {
                border: '1px solid black'
              }
            }}
          />
          <Button sx={{ float: 'right', mb: 2 }} variant="contained" onClick={handleOpenModalDs}>
            Add New Scenario
          </Button>
        </Box>
      </Box>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              {Head()?.map((hd) => (
                <StyledTableCell key={hd?.id}>{hd?.name}</StyledTableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered?.map((row) => (
              <StyledTableRow key={row?.id}>
                <StyledTableCell component="th" scope="row">
                  {row?.id?.slice(0, 6)}
                </StyledTableCell>
                <StyledTableCell component="th" scop e="row">
                  <Typography sx={{ width: 'max-content' }}>{row?.name}</Typography>
                </StyledTableCell>
                <StyledTableCell component="th" scope="row">
                  <Typography sx={{ width: 'max-content' }}>{row?.name}</Typography>
                </StyledTableCell>
                <StyledTableCell component="th" scope="row">
                  <div className={classes.div}>{row?.Description}</div>
                </StyledTableCell>
                <StyledTableCell component="th" scope="row" onClick={() => handleOpenCl(row)}>
                  {row?.cyberLosses?.map((loss) => (
                    <div key={loss} style={{ marginBottom: '5px' }}>
                      {loss?.props.map((pr, i) => (
                        <span
                          key={i}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5
                          }}
                        >
                          <CircleIcon sx={{ fontSize: 14, color: colorPicker(pr) }} />
                          <span
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '15px',
                              width: 'max-content'
                            }}
                          >
                            Loss of {pr}
                          </span>
                        </span>
                      ))}
                    </div>
                  ))}
                </StyledTableCell>
                <StyledTableCell component="th" scope="row">
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: 8,
                      width: 'max-content'
                    }}
                  >
                    {row?.cyberLosses?.map((loss) => (
                      <span key={loss} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around' }}>
                        {loss?.name}
                      </span>
                    ))}
                  </div>
                </StyledTableCell>
                {stakeHolder && (
                  <StyledTableCell component="th" scope="row">
                    -
                  </StyledTableCell>
                )}
                {stakeHolder && (
                  <StyledTableCell component="th" scope="row">
                    -
                  </StyledTableCell>
                )}
                {stakeHolder && (
                  <StyledTableCell component="th" scope="row">
                    -
                  </StyledTableCell>
                )}
                {stakeHolder && (
                  <StyledTableCell component="th" scope="row">
                    -
                  </StyledTableCell>
                )}
                {stakeHolder && (
                  <StyledTableCell component="th" scope="row">
                    -
                  </StyledTableCell>
                )}
                {/* <StyledTableCell component="th" scope="row" sx={{ background: colorPickerTab(row?.impacts?.Safety) }}>
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
                                        <Select
                                            labelId="demo-simple-select-label"
                                            id="demo-simple-select"
                                            name="Safety"
                                            value={row?.impacts?.Safety}
                                            onChange={(e) => handleChange(e, row)}
                                        >
                                            {options.map((item) => (
                                                <MenuItem key={item?.value} value={item?.value}>
                                                    {item?.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </StyledTableCell> */}

                <SelectableCell
                  row={row}
                  options={options}
                  handleChange={handleChange}
                  colorPickerTab={colorPickerTab}
                  impact={row?.impacts?.Safety}
                  name="Safety"
                />
                <SelectableCell
                  row={row}
                  options={options}
                  handleChange={handleChange}
                  colorPickerTab={colorPickerTab}
                  impact={row?.impacts?.Financial}
                  name="Financial"
                />
                <SelectableCell
                  row={row}
                  options={options}
                  handleChange={handleChange}
                  colorPickerTab={colorPickerTab}
                  impact={row?.impacts?.Operational}
                  name="Operational"
                />
                <SelectableCell
                  row={row}
                  options={options}
                  handleChange={handleChange}
                  colorPickerTab={colorPickerTab}
                  impact={row?.impacts?.Privacy}
                  name="Privacy"
                />
                <StyledTableCell component="th" scope="row">
                  -
                </StyledTableCell>
                <StyledTableCell component="th" scope="row">
                  -
                </StyledTableCell>
                <StyledTableCell component="th" scope="row">
                  -
                </StyledTableCell>
                <StyledTableCell component="th" scope="row" sx={{ background: colorPickerTab(OverallImpact(row?.impacts)) }}>
                  {OverallImpact(row?.impacts)}
                </StyledTableCell>
                <StyledTableCell component="th" scope="row">
                  <Checkbox {...label} />
                </StyledTableCell>
                <StyledTableCell component="th" scope="row">
                  <Checkbox {...label} />
                </StyledTableCell>
                <StyledTableCell component="th" scope="row">
                  -
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {openDs && <AddDamageScenarios open={openDs} handleClose={handleCloseDs} modal={modal} id={id} rows={rows} notify={notify} />}
      {openCl && (
        <SelectLosses
          open={openCl}
          handleClose={handleCloseCl}
          modal={modal}
          rows={rows}
          setRows={setRows}
          selectedRow={selectedRow}
          setSelectedRow={setSelectedRow}
          update={update}
          getModalById={getModalById}
          getModals={getModals}
          id={id}
        />
      )}
      <Toaster position="top-right" reverseOrder={false} />
    </Box>
  );
}
