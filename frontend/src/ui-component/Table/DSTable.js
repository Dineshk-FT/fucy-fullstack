/*eslint-disable*/
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  TablePagination,
  Tooltip,
  InputLabel
} from '@mui/material';
import { tooltipClasses } from '@mui/material/Tooltip';
import AddDamageScenarios from '../Modal/AddDamageScenario';
import { useDispatch } from 'react-redux';
import { closeAll } from '../../store/slices/CurrentIdSlice';
import SelectLosses from '../Modal/SelectLosses';
import { makeStyles } from '@mui/styles';
import { Box } from '@mui/system';
import ColorTheme from '../../store/ColorTheme';
import toast, { Toaster } from 'react-hot-toast';
import { colorPicker, colorPickerTab } from './constraints';
import { tableHeight } from '../../store/constant';

const selector = (state) => ({
  model: state.model,
  getModelById: state.getModelById,
  getModels: state.getModels,
  update: state.updateDamageScenario,
  getDamageScenarios: state.getDamageScenarios,
  damageScenarios: state.damageScenarios['subs'][1],
  Details: state.damageScenarios['subs'][0]['Details'],
  damageID: state.damageScenarios['subs'][1]['_id']
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
    borderRight: '1px solid rgba(224, 224, 224, 1) !important',
    fontSize: 13,
    padding: '2px 8px',
    textAlign: 'center'
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 13,
    borderRight: '1px solid rgba(224, 224, 224, 1) !important',
    padding: '2px 8px',
    textAlign: 'center'
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

const HtmlTooltip = styled(({ className, ...props }) => <Tooltip {...props} classes={{ popper: className }} />)(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#f5f5f9',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 220,
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #dadde9'
  }
}));

const SelectableCell = ({ row, options, handleChange, colorPickerTab, impact, name }) => {
  // console.log('name', name);
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
        {!impact && (
          <InputLabel id="demo-simple-select-label" shrink={false}>
            Select Impacts
          </InputLabel>
        )}
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          name={name}
          value={impact}
          onChange={(e) => handleChange(e, row)}
        >
          {options?.map((item) => (
            <MenuItem key={item?.value} value={item?.value}>
              <HtmlTooltip
                placement="left"
                title={
                  <Typography
                    sx={{
                      // backgroundColor: 'black',
                      // color: 'white',
                      fontSize: '14px',
                      fontWeight: 600,
                      padding: '8px', // Optional: Adds some padding for better spacing
                      borderRadius: '4px' // Optional: Adds rounded corners
                    }}
                  >
                    {item?.description[name]}
                  </Typography>
                }
              >
                {item?.label}
              </HtmlTooltip>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </StyledTableCell>
  );
};

export default function DsTable() {
  const color = ColorTheme();
  const { model, getModels, getModelById, update, damageScenarios, Details, damageID, getDamageScenarios } = useStore(selector, shallow);
  const [stakeHolder] = useState(false);
  const classes = useStyles();
  const { id } = useParams();
  const dispatch = useDispatch();
  const [openDs, setOpenDs] = useState(false);
  const [openCl, setOpenCl] = useState(false);
  const [rows, setRows] = useState([]);
  const [selectedRow, setSelectedRow] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filtered, setFiltered] = useState([]);
  const [details, setDetails] = useState([]);
  const [page, setPage] = useState(0); // Add state for page
  const [rowsPerPage, setRowsPerPage] = useState(10); // Add state for rows per page

  const notify = (message, status) => toast[status](message);

  // console.log('damageID', damageID);
  const Head = useMemo(() => {
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

  useEffect(() => {
    if (damageScenarios['Details']) {
      const scene = damageScenarios['Details']?.map((ls) => ({
        ID: ls?._id,
        Name: ls?.Name,
        'Description/ Scalability': ls['Description'],
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
      setRows(scene);
      setFiltered(scene);
      setDetails(Details);
    }
  }, [damageScenarios]);

  const refreshAPI = () => {
    // console.log('model', model);
    getDamageScenarios(model?._id);
  };
  // console.log('rows', rows);

  // console.log('Details', Details);
  const handleOpenModalDs = () => {
    setOpenDs(true);
  };
  const handleCloseDs = () => {
    setOpenDs(false);
  };

  const handleChange = (e, row) => {
    const { name, value } = e.target;
    const seleced = JSON.parse(JSON.stringify(row));
    seleced['impacts'][`${name}`] = value;
    // console.log('seleced', seleced);

    const info = {
      id: damageID,
      detailId: seleced?.ID,
      impacts: JSON.stringify(seleced['impacts'])
    };
    update(info)
      .then((res) => {
        // console.log('res', res);
        refreshAPI();
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
    {
      value: 'Severe',
      label: 'Severe',
      description: {
        'Safety Impact': 'Life-threatening or fatal injuries.',
        'Financial Impact':
          'The financial damage leads to significant loss for the affected road user with substantial effects on their ability to meet financial obligations.',
        'Operational Impact':
          'The operational damage leads to a loss of important or all vehicle functions. EXAMPLE 1: Major malfunction in the steering system leads to a loss of directional control. EXAMPLE 2: Significant loss in the braking system causes a severe reduction in braking force. EXAMPLE 3: Significant loss in other important functions of the vehicle.',
        'Privacy Impact':
          'The privacy damage leads to significant or very harmful impacts to the road user. The information regarding the road user’s identity is available and easy to link to PII (personally identifiable information), leading to severe harm or loss. The information belongs to third parties as well.'
      }
    },
    {
      value: 'Major',
      label: 'Major',
      description: {
        'Safety Impact': 'Severe and/or irreversible injuries or significant physical harm.',
        'Financial Impact':
          'The financial damage leads to notable loss for the affected road user, but the financial ability of the road user to meet financial obligations is not fundamentally impacted.',
        'Operational Impact':
          'The operational damage leads to partial degradation of a vehicle function. EXAMPLE 4: Degradation in steering or braking capacity.',
        'Privacy Impact':
          'The privacy damage has a notable impact on the road user. The information may be difficult to link to PII but is of a significant nature and has risks to PII principal.'
      }
    },
    {
      value: 'Moderate',
      label: 'Moderate',
      description: {
        'Safety Impact': 'Reversible physical injuries requiring treatment.',
        'Financial Impact':
          'The financial damage is noticeable but does not significantly affect the financial situation of the road user.',
        'Operational Impact':
          'The operational damage leads to noticeable degradation of a vehicle function. EXAMPLE 5: Slight degradation in steering capability.',
        'Privacy Impact':
          'The privacy damage leads to moderate consequences to the road user. The information regarding the road user is not sensitive.'
      }
    },
    {
      value: 'Minor',
      label: 'Minor',
      description: {
        'Safety Impact': 'Light physical injuries, may require first aid.',
        'Financial Impact': 'The financial damage is small and can be easily absorbed by the affected road user.',
        'Operational Impact': 'The operational damage leads to an insignificant or no noticeable impact on vehicle operation.',
        'Privacy Impact':
          'The privacy damage has a light impact or no effect at all. The information is low-risk and difficult to link to PII.'
      }
    },
    {
      value: 'Negligible',
      label: 'Negligible',
      description: {
        'Safety Impact': 'No physical injuries.',
        'Financial Impact': 'The financial damage is so low that it has no significant effect on the road user.',
        'Operational Impact': "The operational damage leads to an insignificant or no post-collision damage to a vehicle's functionality.",
        'Privacy Impact': 'The privacy damage has no effect on the road user or their personal information.'
      }
    }
  ];
  const handleBack = () => {
    dispatch(closeAll());
  };

  const OverallImpact = useCallback((impact) => {
    const pattern = (it) => {
      return it === 'Negligible' ? 1 : it === 'Minor' ? 2 : it === 'Moderate' ? 3 : it === 'Major' ? 4 : it === 'Severe' ? 5 : 0;
    };

    const impactLabel = (value) => {
      return value === 1
        ? 'Negligible'
        : value === 2
        ? 'Minor'
        : value === 3
        ? 'Moderate'
        : value === 4
        ? 'Major'
        : value === 5
        ? 'Severe'
        : '';
    };

    const val = Object.values(impact)?.map((it) => pattern(it));

    const maxImpactValue = val.length ? Math.max(...val) : 0;

    return impactLabel(maxImpactValue);
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
              backgroundColor: color?.sidebarBG,
              color: `${color?.sidebarContent} !important`,
            },
            '&:nth-of-type(odd)': {
              backgroundColor: color?.sidebarBG,
              color: `${color?.sidebarContent} !important`,
            },
            '& .MuiTableCell-root.MuiTableCell-body': {
              backgroundColor: color?.sidebarBG,
              color: `${color?.sidebarContent} !important`,
            },
            backgroundColor: isChild ? '#F4F8FE' : '',
            color: `${color?.sidebarContent} !important`,
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
                  <StyledTableCell key={index} component="th" scope="row" onClick={() => handleOpenCl(row)} sx={{ cursor: 'pointer' }}>
                    {row.cyberLosses.length ? (
                      row?.cyberLosses?.map((loss) => (
                        <div
                          key={loss?.id}
                          style={{ marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '15px', width: 'max-content' }}
                        >
                          <CircleIcon sx={{ fontSize: 14, color: colorPicker(loss?.name) }} />
                          <span>Loss of {loss?.name}</span>
                        </div>
                      ))
                    ) : (
                      <InputLabel>Select losses</InputLabel>
                    )}
                  </StyledTableCell>
                );
                break;

              case item.name === 'Assets':
                cellContent = (
                  <StyledTableCell key={index} component="th" scope="row">
                    {row?.cyberLosses?.map((loss) => (
                      <div
                        key={loss?.id}
                        style={{ marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '15px', width: 'max-content' }}
                      >
                        <span> {loss?.node}</span>
                      </div>
                    ))}
                  </StyledTableCell>
                );
                break;
              case item.name === 'Overall Impact':
                cellContent = (
                  <StyledTableCell
                    component="th"
                    scope="row"
                    sx={{ background: colorPickerTab(OverallImpact(row?.impacts)), color: '#000' }}
                  >
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
              fontSize: '16px'
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
          borderRadius: '0px',
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
          },
          maxHeight: tableHeight,
          scrollbarWidth: 'thin'
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
          damageScenarios={damageScenarios}
          details={details}
          setDetails={setDetails}
          damageID={damageID}
          refreshAPI={refreshAPI}
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
