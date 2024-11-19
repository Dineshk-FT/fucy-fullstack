/* eslint-disable */
import * as React from 'react';
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
  TablePagination
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useDispatch, useSelector } from 'react-redux';
import { closeAll } from '../../store/slices/CurrentIdSlice';
import AddThreatScenarios from '../Modal/AddThreatScenario';
import { Box } from '@mui/system';
import ColorTheme from '../../store/ColorTheme';
import { colorPicker, threatType } from './constraints';
import CircleIcon from '@mui/icons-material/Circle';

const selector = (state) => ({
  model: state.model,
  derived: state.threatScenarios.subs[0],
  userDefined: state.threatScenarios.subs[1],
  getThreatScenario: state.getThreatScenario
});

const column = [
  { id: 1, name: 'ID' },
  { id: 2, name: 'Name' },
  { id: 3, name: 'Category' },
  { id: 4, name: 'Description' },
  { id: 5, name: 'Damage Scenarios' },
  { id: 6, name: 'Related Threats from Catalog' },
  { id: 7, name: 'Losses of Cybersecurity Properties' },
  { id: 8, name: 'Assets' },
  { id: 9, name: 'Related Attack Trees' },
  { id: 10, name: 'Related Attack Path Models' },
  { id: 11, name: 'Assessment References' },
  { id: 12, name: 'To be Assessed' },
  { id: 13, name: 'Assessment Jurification' }
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

export default function Tstable() {
  const color = ColorTheme();
  const classes = useStyles();
  const { id } = useParams();
  const dispatch = useDispatch();
  const [openTs, setOpenTs] = React.useState(false);
  const { model, derived, userDefined, getThreatScenario } = useStore(selector, shallow);
  const [rows, setRows] = React.useState([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filtered, setFiltered] = React.useState([]);
  const { title } = useSelector((state) => state?.pageName);

  // Pagination state
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const Head = React.useMemo(() => {
    if (title.includes('Derived')) {
      const col = [...column];
      col.splice(4, 0, { id: 14, name: 'Detailed / Combined Threat Scenarios' });
      return col;
    } else {
      return column;
    }
  }, [title]);

  React.useEffect(() => {
    if (derived['Details']) {
      const mod1 = derived['Details']
        ?.map((detail) =>
          detail?.Details?.map((nodedetail) =>
            nodedetail?.props?.map((prop) => {
              return {
                ID: prop?.id.slice(0, 6),
                Name: `${threatType(prop?.name)}  ${prop?.name} of ${nodedetail?.node} for Damage Scene ${nodedetail?.nodeId.slice(0, 6)}`,
                Description: `${threatType(prop?.name)} occured due to ${prop?.name} in ${
                  nodedetail?.node
                } for Damage Scene ${nodedetail?.nodeId?.slice(0, 6)}`,
                losses: [],
                'Losses of Cybersecurity Properties': prop?.name
              };
            })
          )
        )
        .flat(2);

      const mappedDetails = Array.isArray(userDefined['Details'])
        ? userDefined['Details'].map((detail) =>
            detail && typeof detail === 'object'
              ? {
                  ID: detail?.id || null,
                  Name: detail?.name || null,
                  Description: detail?.description || null
                }
              : {}
          )
        : [];
      const combined = mod1.concat(mappedDetails);
      setRows(combined);
      setFiltered(combined);
    }
  }, [derived, userDefined]);

  const handleOpenModalTs = () => {
    setOpenTs(true);
  };

  const handleCloseTs = () => {
    setOpenTs(false);
  };

  const handleBack = () => {
    dispatch(closeAll());
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
          <Button sx={{ float: 'right', mb: 2 }} variant="contained" onClick={handleOpenModalTs}>
            Add New Scenario
          </Button>
        </Box>
      </Box>
      <TableContainer component={Paper} sx={{ borderRadius: '0px', padding: 1 }}>
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
      <AddThreatScenarios open={openTs} handleClose={handleCloseTs} id={model._id} />
    </Box>
  );
}
