/*eslint-disable*/
import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Paper, FormControl, MenuItem, Select, TextField, Typography, styled } from '@mui/material';
import useStore from '../../Zustand/store';
import { shallow } from 'zustand/shallow';
import { useParams } from 'react-router';
import KeyboardBackspaceRoundedIcon from '@mui/icons-material/KeyboardBackspaceRounded';
import { makeStyles } from '@mui/styles';
import { useDispatch } from 'react-redux';
import { closeAll } from '../../store/slices/CurrentIdSlice';
import { Box } from '@mui/system';
import ColorTheme from '../../store/ColorTheme';
import { colorPicker, threatType } from './constraints';
import CircleIcon from '@mui/icons-material/Circle';

const selector = (state) => ({
  modal: state.modal,
  getModal: state.getModalById,
  update: state.updateModal
});

const Head = [
  { id: 1, name: 'ID' },
  { id: 2, name: 'Name' },
  { id: 3, name: 'Category' },
  { id: 4, name: 'Description' },
  { id: 5, name: 'Approach' },
  { id: 6, name: 'Elapsed Time' },
  { id: 7, name: 'Expertise' },
  { id: 8, name: 'Knowledge of the Item' },
  { id: 9, name: 'Window of Opportunity' },
  { id: 10, name: 'Equipment' },
  { id: 11, name: 'Attack Vector' },
  { id: 12, name: 'Attack Complexity' },
  { id: 13, name: 'Privileges Required' },
  { id: 14, name: 'User Interaction' },
  { id: 15, name: 'Scope' },
  { id: 16, name: 'Determination Criteria' },
  { id: 17, name: 'Attack Feasabilities Rating' },
  { id: 18, name: 'Attack Feasability Rating Justification' }
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
  // '&:nth-of-type(odd)': {
  //   backgroundColor: theme.palette.action.hover,
  // },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0
  }
}));

const options = {
  'Elapsed Time': [
    { value: '<= 1 month', label: '<= 1 month' },
    { value: '<= 1 week', label: '<= 1 week' },
    { value: '<= 1 day', label: '<= 1 day' }
  ],
  Expertise: [
    { value: 'Proficient', label: 'Proficient' },
    { value: 'Expert', label: 'Expert' },
    { value: 'Multiple experts', label: 'Multiple experts' }
  ],
  'Knowledge of the Item': [
    { value: 'Restricted Information', label: 'Restricted Information' },
    { value: 'Confidential Information', label: 'Confidential Information' }
  ],
  'Window of Opportunity': [
    { value: 'Easy', label: 'Easy' },
    { value: 'Moderate', label: 'Moderate' },
    { value: 'Difficult', label: 'Difficult' }
  ],
  Equipment: [
    { value: 'Standard', label: 'Standard' },
    { value: 'Specialized', label: 'Specialized' }
  ]
};

const SelectableCell = ({ item, row, handleChange, name }) => {
  return (
    <StyledTableCell component="th" scope="row">
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
          value={row[item.name]}
          onChange={(e) => handleChange(e, row)}
          name={name}
        >
          {options[item.name]?.map((item) => (
            <MenuItem key={item?.value} value={item?.value}>
              {item?.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </StyledTableCell>
  );
};

export default function AttackTreeTable() {
  const color = ColorTheme();
  const classes = useStyles();
  const { id } = useParams();
  const dispatch = useDispatch();
  const { modal, getModal, update } = useStore(selector, shallow);
  const [rows, setRows] = React.useState([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filtered, setFiltered] = React.useState([]);

  React.useEffect(() => {
    getModal(id);
  }, [id]);

  React.useEffect(() => {
    if (modal.scenarios) {
      const mod1 = modal?.scenarios[3]?.subs[0]?.scenes?.map((dt) => {
        // console.log('prp', prp);
        return {
          ID: dt.id,
          Name: dt.name,
          Description: `This is the description for ${dt.name}`
        };
      });

      setRows(mod1);
      setFiltered(mod1);
    }
  }, [modal]);

  const handleChange = (e, row) => {
    // console.log('e.target', e.target);
    // console.log('row', row);
    const Rows = [...rows];
    const editRow = Rows.find((ele) => ele.id === row.id);
    const Index = Rows.findIndex((it) => it.id === editRow.id);
    const { name, value } = e.target;
    editRow[`${name}`] = value;
    // console.log('editRow', editRow);
    Rows[Index] = editRow;
    setRows(Rows);
  };

  // console.log('rows', rows);

  const handleBack = () => {
    dispatch(closeAll());
  };

  const handleSearch = (e) => {
    const { value } = e.target;
    if (value.length > 0) {
      // console.log('rows', rows);
      const filterValue = rows.filter((rw) => {
        if (rw?.Name?.toLowerCase().includes(value) || rw?.Description?.toLowerCase().includes(value)) {
          return rw;
        }
      });
      setFiltered(filterValue);
    } else {
      setFiltered(rows);
    }

    setSearchTerm(value);
  };

  // console.log('filtered', filtered);
  const checkforLabel = (item) => {
    if (
      item.name === 'Expertise' ||
      item.name === 'Elapsed Time' ||
      item.name === 'Knowledge of the Item' ||
      item.name === 'Window of Opportunity' ||
      item.name === 'Equipment'
    ) {
      return true;
    }
    return false;
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
            // console.log('item.name', item.name);
            return (
              <React.Fragment key={index}>
                {checkforLabel(item) ? (
                  <SelectableCell item={item} row={row} handleChange={handleChange} name={item.name} />
                ) : (
                  <StyledTableCell key={index} align={'left'}>
                    {row[item.name] ? row[item.name] : '-'}
                  </StyledTableCell>
                )}
              </React.Fragment>
            );
          })}
        </StyledTableRow>
      </>
    );
  };
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
          <Typography sx={{ color: color?.title, fontWeight: 600, fontSize: '18px' }}>Attack Tree Table</Typography>
        </Box>
        <Box display="flex" gap={3} my={2}>
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
          {/* <Button sx={{ float: 'right', mb: 2 }} variant="contained" onClick={handleOpenModalTs}>
            Add New Attack
          </Button> */}
        </Box>
      </Box>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              {Head?.map((hd) => (
                <StyledTableCell key={hd?.id}>{hd?.name}</StyledTableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered?.map((row, rowKey) => (
              <>
                <RenderTableRow row={row} rowKey={rowKey} />
              </>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
