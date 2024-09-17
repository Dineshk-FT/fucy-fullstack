/*eslint-disable*/
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
  TableRow
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useDispatch } from 'react-redux';
import { closeAll } from '../../store/slices/CurrentIdSlice';
import AddThreatScenarios from '../Modal/AddThreatScenario';
import { Box } from '@mui/system';
import ColorTheme from '../../store/ColorTheme';
import { colorPicker, threatType } from './constraints';
import CircleIcon from '@mui/icons-material/Circle';

const selector = (state) => ({
  model: state.model,
  getModel: state.getModelById
});

const Head = [
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
  // '&:nth-of-type(odd)': {
  //   backgroundColor: theme.palette.action.hover,
  // },
  // hide last border
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
  const { model, getModel } = useStore(selector, shallow);
  const [rows, setRows] = React.useState([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filtered, setFiltered] = React.useState([]);

  React.useEffect(() => {
    getModel(id);
  }, [id]);

  React.useEffect(() => {
    if (model.scenarios) {
      const mod1 = model?.scenarios[2]?.subs[0]?.losses
        ?.map((dt) =>
          dt?.cyberLosses?.map((loss, prin) =>
            loss?.props?.map((prp, pin) => {
              // console.log('prp', prp);
              return {
                ID: `TS0${prin}${pin}`,
                Name: `${threatType(prp)}  ${prp} of ${loss?.name} for Damage Scene ${dt?.id}`,
                Description: `${threatType(prp)} occured due to ${prp} in ${loss?.name} for Damage Scene ${dt?.id}`,
                losses: [],
                'Losses of Cybersecurity Properties': prp
              };
            })
          )
        )
        .flat(2);
      const mod2 = model?.scenarios[2]?.subs[1]?.scenes;
      // console.log('mod2', mod2)
      const combained = mod1.concat(mod2);
      setRows(combained);
      setFiltered(combained);
    }
  }, [model]);
  // console.log('rows', rows);

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
              case item.name === 'Losses of Cybersecurity Properties':
                cellContent = (
                  <StyledTableCell component="th" scope="row">
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5
                      }}
                    >
                      <CircleIcon sx={{ fontSize: 14, color: colorPicker(row[item.name]) }} />
                      <span
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '15px',
                          width: 'max-content'
                        }}
                      >
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
          <Typography sx={{ color: color?.title, fontWeight: 600, fontSize: '18px' }}>Threat Scenario Table</Typography>
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
          <Button sx={{ float: 'right', mb: 2 }} variant="contained" onClick={handleOpenModalTs}>
            Add New Scenario
          </Button>
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
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <AddThreatScenarios open={openTs} handleClose={handleCloseTs} model={model} id={id} />
    </Box>
  );
}
