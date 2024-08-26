/*eslint-disable*/
import React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import useStore from '../../Zustand/store';
import { shallow } from 'zustand/shallow';
import { Box } from '@mui/system';
import KeyboardBackspaceRoundedIcon from '@mui/icons-material/KeyboardBackspaceRounded';
import { TextField, Typography, styled, Paper, Checkbox } from '@mui/material';
import ColorTheme from '../../store/ColorTheme';
import { makeStyles } from '@mui/styles';
import { useParams } from 'react-router';
import { closeAll } from '../../store/slices/CurrentIdSlice';
import { useDispatch } from 'react-redux';

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

const selector = (state) => ({
  modal: state.modal,
  getModalById: state.getModalById,
  getModals: state.getModals
});

export default function DsDerivationTable() {
  const color = ColorTheme();
  const dispatch = useDispatch();
  const classes = useStyles();
  const { id } = useParams();
  const { modal, getModalById } = useStore(selector, shallow);
  const [rows, setRows] = React.useState([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filtered, setFiltered] = React.useState([]);

  React.useEffect(() => {
    getModalById(id);
  }, [id]);

  const Head = React.useMemo(() => {
    return [
      { id: 1, name: 'Task/Requirement' },
      { id: 2, name: 'Checked' },
      { id: 3, name: 'Losses of Cybersecurity Properties' },
      { id: 4, name: 'Assets' },
      { id: 5, name: 'Damage Scenarios' }
    ];
  }, []);

  React.useEffect(() => {
    if (modal.scenarios) {
      const mod = modal?.scenarios[1]?.subs[0]?.Details?.map((dt) => {
        // console.log('prp', prp);
        return {
          'Task/Requirement': dt?.task,
          'Losses of Cybersecurity Properties': dt?.loss,
          Assets: dt?.assets,
          'Damage Scenarios': dt?.Damage
        };
      });
      setRows(mod);
      setFiltered(mod);
    }
  }, [modal]);
  // console.log('rows', rows);

  const handleSearch = (e) => {
    const { value } = e.target;
    // console.log('value', value);
    // console.log("valuerows", rows);
    if (value.length > 0) {
      const filterValue = rows.filter((rw) => {
        if (rw.task.toLowerCase().includes(value)) {
          return rw;
        }
      });
      setFiltered(filterValue);
    } else {
      setFiltered(rows);
    }

    setSearchTerm(value);
  };

  const handleBack = () => {
    dispatch(closeAll());
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
              case item.name === 'Checked':
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
  return (
    <>
      <Box
        sx={{
          overflow: 'auto',
          height: '-webkit-fill-available',
          minHeight: 'moz-available'
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" my={1}>
          <Box display="flex" alignItems="center" gap={1}>
            <KeyboardBackspaceRoundedIcon sx={{ float: 'left', cursor: 'pointer', ml: 1, color: color?.title }} onClick={handleBack} />
            <Typography sx={{ color: color?.title, fontWeight: 600, fontSize: '18px' }}>Damage Scenario Derivation Table</Typography>
          </Box>
          <Box>
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
              {filtered?.map((row, rowkey) => (
                <RenderTableRow row={row} rowKey={rowkey} />

                // <StyledTableRow key={row?.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                //   <StyledTableCell component="td" scope="row">
                //     <Typography sx={{ width: 'max-content' }}>{row?.task}</Typography>
                //   </StyledTableCell>
                //   <StyledTableCell component="th" scope="row">
                //     <Checkbox {...label} />
                //   </StyledTableCell>
                //   <StyledTableCell component="td" scope="row">
                //     {row?.loss}
                //   </StyledTableCell>
                //   <StyledTableCell component="td" scope="row">
                //     {row?.assets}
                //   </StyledTableCell>

                //   <StyledTableCell component="td" scope="row">
                //     <div className={classes.div}>{row?.Damage}</div>
                //   </StyledTableCell>
                // </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </>
  );
}
