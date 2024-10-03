/*eslint-disable*/
import * as React from 'react';
import useStore from '../../Zustand/store';
import { shallow } from 'zustand/shallow';
import { useParams } from 'react-router';
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
  TablePagination
} from '@mui/material';
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
  model: state.model,
  getModelById: state.getModelById,
  getModels: state.getModels,
  update: state.updateModel
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
  const { model, getModels, getModelById, update } = useStore(selector, shallow);
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
  const [page, setPage] = React.useState(0); // Add state for page
  const [rowsPerPage, setRowsPerPage] = React.useState(5); // Add state for rows per page

  const notify = (message, status) => toast[status](message);

  const Head = React.useMemo(() => {
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
    if (model.scenarios) {
      const mod2 = model?.scenarios[1]?.subs[1]?.scenes?.map((ls) => ({
        ID: ls?.ID,
        Name: ls?.Name,
        'Description/ Scalability': ls['Description/ Scalability'],
        cyberLosses: ls?.cyberLosses ? ls.cyberLosses : [],
        impacts: ls?.impacts
          ? {
              'Financial Impact': ls?.impacts['Financial Impact'] ?? '',
              'Safety Impact': ls?.impacts['Safety Impact'] ?? '',
              'Operational Impact': ls?.impacts['Operational Impact'] ?? '',
              'Privacy Impact': ls?.impacts['Privacy Impact'] ?? ''
            }
          : {}
      }));
      setRows(mod2);
      setFiltered(mod2);
    }
  }, [model]);

  // console.log('rows', rows);

  const handleOpenModalDs = () => {
    setOpenDs(true);
  };
  const handleCloseDs = () => {
    setOpenDs(false);
  };

  const handleChange = (e, row) => {
    // console.log('e.target', e.target);
    const mod = JSON.parse(JSON.stringify(model));
    const Rows = JSON.parse(JSON.stringify(rows));
    const editRow = Rows.find((ele) => ele.id === row.id);
    const { name, value } = e.target;
    if (name) {
      editRow.impacts = { ...editRow.impacts, [`${name}`]: value };
    }
    const Index = Rows.findIndex((it) => it.id === editRow.id);
    Rows[Index] = editRow;
    setRows(Rows);
    const updated = Rows?.map((rw) => {
      //eslint-disable-next-line
      const { Description, ...rest } = rw;
      return rest;
    });
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
    mod.scenarios[1].subs[0].losses = updatedLoss;
    mod.scenarios[1].subs[1].scenes = updatedLossEdit;
    update(mod)
      .then((res) => {
        if (res) {
          setTimeout(() => {
            getModelById(id);
          }, 500);
        }
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
    const val = Object.values(impact)?.map((it) => {
      return pattern(it);
    });
    let ratio;
    if (val.length) {
      const sum = val?.reduce((a, b) => a + b);
      ratio = sum > 0 ? Math.floor(impact && sum / Object.values(impact).length) : 0;
    }
    // console.log('ratio', ratio)
    return avgImpact(ratio);
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

  const RenderTableRow = ({ row, rowKey, isChild = false }) => {
    return (
      <>
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
                  <StyledTableCell key={index} component="th" scope="row" onClick={() => handleOpenCl(row)}>
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
                );
                break;
              case item.name === 'Overall Impact':
                cellContent = (
                  <StyledTableCell component="th" scope="row" sx={{ background: colorPickerTab(OverallImpact(row?.impacts)) }}>
                    {OverallImpact(row?.impacts)}
                  </StyledTableCell>
                );
                break;

              case item.name.includes('Evaluated'):
                cellContent = (
                  <StyledTableCell component="th" scope="row">
                    <Checkbox {...label} />
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
      </>
    );
  };

  // console.log('model', model);
  // console.log('rows', filtered);
  // console.log('selectedRow', selectedRow)
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: 'auto' // Ensure the table takes up the full height of the parent
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box display="flex" alignItems="center" gap={1}>
          <KeyboardBackspaceRoundedIcon
            sx={{
              float: 'left',
              cursor: 'pointer',
              ml: 1,
              color: color?.title
            }}
            onClick={handleBack}
          />
          <Typography
            sx={{
              color: color?.title,
              fontWeight: 600,
              fontSize: '18px'
            }}
          >
            Damage Scenario Table
          </Typography>
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

      <TableContainer
        component={Paper}
        sx={{
          flexGrow: 1, // Let the container grow to fill available space
          overflowY: 'auto', // Enable vertical scrolling
          marginBottom: '1rem' // Add space for the pagination
        }}
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
            {filtered?.map((row, rowkey) => (
              <RenderTableRow key={rowkey} row={row} rowKey={rowkey} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination placed outside of the scrollable area */}
      <TablePagination
        component="div"
        count={filtered.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Modals */}
      {openDs && <AddDamageScenarios open={openDs} handleClose={handleCloseDs} model={model} id={id} rows={rows} notify={notify} />}
      {openCl && (
        <SelectLosses
          open={openCl}
          handleClose={handleCloseCl}
          model={model}
          rows={rows}
          setRows={setRows}
          selectedRow={selectedRow}
          setSelectedRow={setSelectedRow}
          update={update}
          getModelById={getModelById}
          getModels={getModels}
          id={id}
        />
      )}
      <Toaster position="top-right" reverseOrder={false} />
    </Box>
  );
}
