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
import KeyboardBackspaceRoundedIcon from '@mui/icons-material/KeyboardBackspaceRounded';
import { Button, styled } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useDispatch } from 'react-redux';
import { closeAll } from '../../store/slices/CurrentIdSlice';
import AddCyberControl from '../Modal/AddCyberControl';
import Checkbox from '@mui/material/Checkbox';

const label = { inputProps: { 'aria-label': 'Checkbox demo' } };

const selector = (state) => ({
  modal: state.modal,
  getModal: state.getModalById
});
const Head = [
  { id: 0, name: 'Enable' },
  { id: 1, name: 'ID' },
  { id: 2, name: 'Name' },
  { id: 3, name: 'Category' },
  { id: 4, name: 'Description' },
  { id: 5, name: 'Related UNECE Mitigations' },
  { id: 6, name: 'Approach' },
  { id: 7, name: 'Elapsed Time' },
  { id: 8, name: 'Expertise' },
  { id: 9, name: 'Knowledge of the Item' },
  { id: 10, name: 'window of Opportunity' },
  { id: 11, name: 'Equipment' },
  { id: 12, name: 'Attack vector' },
  { id: 13, name: 'Attack Complexity' },
  { id: 14, name: 'Privileges Required' },
  { id: 15, name: 'User Interaction' },
  { id: 16, name: 'Scope' },
  { id: 17, name: 'Determination Criteria' },
  { id: 18, name: 'Attack Feasibility Rating' },
  { id: 19, name: 'Attack Feasibility Rating Justification' },
  { id: 20, name: 'Context Information' },
  { id: 21, name: 'Impact Information' },
  { id: 22, name: 'Comments' }
];

const useStyles = makeStyles({
  div: {
    width: 'max-content'
  }
});

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14
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
export default function CyberSecurityTable() {
  const classes = useStyles();
  const { id } = useParams();
  const dispatch = useDispatch();
  const [openTs, setOpenTs] = React.useState(false);
  const { modal, getModal } = useStore(selector, shallow);
  const [rows, setRows] = React.useState([]);

  React.useEffect(() => {
    getModal(id);
  }, [id]);

  React.useEffect(() => {
    if (modal.scenarios) {
      // console.log('modal in effect', modal?.scenarios[1]?.subs[1]?.scenes)
      setRows(modal?.scenarios[4]?.subs[1]?.scenes);
    }
  }, [modal]);

  const handleOpenModalTs = () => {
    setOpenTs(true);
  };
  const handleCloseTs = () => {
    setOpenTs(false);
  };

  const handleBack = () => {
    dispatch(closeAll());
  };
  // console.log('selectedRow', selectedRow)
  return (
    <>
      <KeyboardBackspaceRoundedIcon sx={{ float: 'left', cursor: 'pointer', ml: 1 }} onClick={handleBack} />
      <Button sx={{ float: 'right', mb: 2 }} variant="contained" onClick={handleOpenModalTs}>
        Add New Scenario
      </Button>
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
            {rows?.map((row) => (
              <StyledTableRow key={row?.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <StyledTableCell component="td" scope="row">
                  <Checkbox {...label} />
                </StyledTableCell>
                <StyledTableCell component="td" scope="row">
                  {row?.id?.slice(0, 6)}
                </StyledTableCell>
                <StyledTableCell component="td" scope="row">
                  {row?.name}
                </StyledTableCell>
                <StyledTableCell component="td" scope="row">
                  {/* {row?.id?.slice(0, 6)} */}
                </StyledTableCell>
                <StyledTableCell component="td" scope="row">
                  <div className={classes.div}>{row?.Description}</div>
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <AddCyberControl open={openTs} handleClose={handleCloseTs} modal={modal} />
    </>
  );
}
