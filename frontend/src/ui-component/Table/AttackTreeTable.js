/*eslint-disable*/
import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Paper, FormControl, MenuItem, Select, TextField, Typography, styled, Tooltip, TablePagination } from '@mui/material';
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
  model: state.model,
  getModel: state.getModelById,
  update: state.updateModel,
  getModelById: state.getModelById
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
  Approach: [
    { value: 'Attack Potential-based Approach', label: 'Attack Potential-based Approach' },
    { value: 'CVSS-based Approach', label: 'CVSS-based Approach' },
    { value: 'Attack Vector-based Approach', label: 'Attack Vector-based Approach' }
  ],
  'Elapsed Time': [
    { value: '<= 1 day', label: '<= 1 day' },
    { value: '<= 1 week', label: '<= 1 week' },
    { value: '<= 1 month', label: '<= 1 month' },
    { value: '<= 6 month', label: '<= 6 month' },
    { value: '>6 month', label: '>6 month    ' }
  ],
  Expertise: [
    { value: 'Layman', label: 'Layman' },
    { value: 'Proficient', label: 'Proficient' },
    { value: 'Expert', label: 'Expert' },
    { value: 'Multiple experts', label: 'Multiple experts' }
  ],
  'Knowledge of the Item': [
    { value: 'Public information', label: 'Public information' },
    { value: 'Restricted information', label: 'Restricted information' },
    { value: 'Confidential information', label: 'Confidential information' },
    { value: 'Strictly confidential information', label: 'Strictly confidential information' }
  ],
  'Window of Opportunity': [
    { value: 'Unlimited', label: 'Unlimited' },
    { value: 'Easy', label: 'Easy' },
    { value: 'Moderate', label: 'Moderate' },
    { value: 'Difficult', label: 'Difficult' }
  ],
  Equipment: [
    { value: 'Standard', label: 'Standard' },
    { value: 'Specialized', label: 'Specialized' },
    { value: 'Bespoke', label: 'Bespoke' },
    { value: 'Multiple bespoke', label: 'Multiple bespoke' }
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
          {options[item.name]?.map((item) => {
            const isLong = item?.label.length > 18;
            return (
              <MenuItem key={item?.value} value={item?.value}>
                {isLong ? (
                  <Tooltip title={item.label}>
                    <Typography variant="h5">{item?.label}</Typography>
                  </Tooltip>
                ) : (
                  <Typography variant="h5">{item?.label}</Typography>
                )}
              </MenuItem>
            );
          })}
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
  const { model, getModel, update, getModelById } = useStore(selector, shallow);
  const [rows, setRows] = React.useState([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filtered, setFiltered] = React.useState([]);
  const [page, setPage] = React.useState(0); // Pagination state
  const [rowsPerPage, setRowsPerPage] = React.useState(10); // Rows per page state

  React.useEffect(() => {
    getModel(id);
  }, [id]);

  React.useEffect(() => {
    if (model.scenarios) {
      const mod1 = model?.scenarios[3]?.subs[0]?.scenes?.map((dt) => {
        // console.log('prp', prp);
        return {
          ID: dt.id || dt?.ID,
          Name: dt.name || dt?.Name,
          Description: `This is the description for ${dt.Name || dt?.name}`,
          Approach: dt?.Approach ?? '',
          'Elapsed Time': dt['Elapsed Time'] ?? '',
          Expertise: dt?.Expertise ?? '',
          'Knowledge of the Item': dt['Knowledge of the Item'] ?? '',
          'Window of Opportunity': dt['Window of Opportunity'] ?? '',
          Equipment: dt?.Equipment ?? ''
        };
      });

      setRows(mod1);
      setFiltered(mod1);
    }
  }, [model]);

  // console.log('rows', rows);
  const handleChange = (e, row) => {
    // console.log('e.target', e.target);
    // console.log('row', row);
    const mod = JSON.parse(JSON.stringify(model));
    const Rows = JSON.parse(JSON.stringify(rows));
    const editRow = Rows.find((ele) => ele.ID === row.ID);
    const Index = Rows.findIndex((it) => it.ID === row.ID);
    // console.log('Rows', Rows);
    // console.log('editRow', editRow);
    const { name, value } = e.target;
    editRow[`${name}`] = value;
    // console.log('editRow', editRow);
    Rows[Index] = editRow;
    setRows(Rows);
    const updated = Rows?.map((rw) => {
      //eslint-disable-next-line
      const { Description, ...rest } = rw;
      return rest;
    });
    mod.scenarios[3].subs[0].scenes = updated;
    // console.log('updated', updated);
    // console.log('mod', mod);
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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // console.log('filtered', filtered);
  const checkforLabel = (item) => {
    if (
      item.name === 'Expertise' ||
      item.name === 'Elapsed Time' ||
      item.name === 'Knowledge of the Item' ||
      item.name === 'Window of Opportunity' ||
      item.name === 'Equipment' ||
      item.name === 'Approach'
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
    <Box sx={{ overflow: 'auto', height: '100%' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box display="flex" alignItems="center" gap={1}>
          <KeyboardBackspaceRoundedIcon sx={{ cursor: 'pointer', ml: 1, color: color?.title }} onClick={handleBack} />
          <Typography sx={{ color: color?.title, fontWeight: 600, fontSize: '18px' }}>Attack Tree Table</Typography>
        </Box>
        <TextField
          id="outlined-size-small"
          placeholder="Search"
          size="small"
          value={searchTerm}
          onChange={handleSearch}
          sx={{
            '& .MuiInputBase-input': { border: '1px solid black' }
          }}
        />
      </Box>

      <TableContainer component={Paper} sx={{ maxHeight: 440, overflow: 'auto' }}>
        <Table stickyHeader aria-label="sticky table" sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              {Head?.map((hd) => (
                <StyledTableCell key={hd?.id}>{hd?.name}</StyledTableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered
              ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) // Slice rows for pagination
              ?.map((row, rowKey) => (
                <RenderTableRow key={row?.ID} row={row} rowKey={rowKey} />
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filtered.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
}
