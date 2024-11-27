/*eslint-disable*/
import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Paper, FormControl, MenuItem, Select, TextField, Typography, styled, Tooltip, TablePagination } from '@mui/material';
import { tooltipClasses } from '@mui/material/Tooltip';
import useStore from '../../Zustand/store';
import { shallow } from 'zustand/shallow';
import { useParams } from 'react-router';
import KeyboardBackspaceRoundedIcon from '@mui/icons-material/KeyboardBackspaceRounded';
import { makeStyles } from '@mui/styles';
import { useDispatch } from 'react-redux';
import { closeAll } from '../../store/slices/CurrentIdSlice';
import { Box } from '@mui/system';
import ColorTheme from '../../store/ColorTheme';
import { colorPicker, RatingColor, threatType } from './constraints';
import CircleIcon from '@mui/icons-material/Circle';
import { tableHeight } from '../../store/constant';

const selector = (state) => ({
  model: state.model,
  update: state.updateAttackScenario,
  getAttackScenario: state.getAttackScenario,
  attacks: state.attackScenarios['subs'][0]
});

const HtmlTooltip = styled(({ className, ...props }) => <Tooltip {...props} classes={{ popper: className }} />)(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#f5f5f9',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 220,
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #dadde9'
  }
}));
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
  { id: 17, name: 'Attack Feasibilities Rating' },
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
    borderRight: '1px solid rgba(224, 224, 224, 1) !important',
    fontSize: 13,
    padding: '2px 8px',
    textAlign: 'center',
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 13,
    borderRight: '1px solid rgba(224, 224, 224, 1) !important',
    padding: '2px 8px',
    textAlign: 'center',
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
    { value: '<= 1 day', label: '<= 1 day', rating: 0 },
    { value: '<= 1 week', label: '<= 1 week', rating: 1 },
    { value: '<= 1 month', label: '<= 1 month', rating: 4 },
    { value: '<= 6 month', label: '<= 6 month', rating: 17 },
    { value: '>6 month', label: '>6 month', rating: 19 }
  ],
  Expertise: [
    {
      value: 'Layman',
      label: 'Layman',
      rating: 0,
      description: 'Unknowledgeable compared to experts or proficient persons, with no particular expertise.'
    },
    {
      value: 'Proficient',
      label: 'Proficient',
      rating: 3,
      description: 'Knowledgeable in that they are familiar with the security behavior of the product or system type.'
    },
    {
      value: 'Expert',
      label: 'Expert',
      rating: 6,
      description:
        'Familiar with the underlying algorithms, protocols, hardware, structures, security behavior, and the complexity of scientific knowledge that leads to the definition of new attacks, cryptography, classical attacks for the product type, attack methods, etc., implemented in the product or system type. '
    },
    {
      value: 'Multiple experts',
      label: 'Multiple experts',
      rating: 8,
      description: 'Different fields of expertise are required at an expert level for distinct steps of an attack. '
    }
  ],
  'Knowledge of the Item': [
    {
      value: 'Public information',
      label: 'Public information',
      rating: 0,
      description: 'Public information concerning the item or component (e.g. as gained from the Internet).'
    },
    {
      value: 'Restricted information',
      label: 'Restricted information',
      rating: 3,
      description:
        'Restricted information concerning the item or component (e.g. knowledge that is controlled within the developer organization and shared with other organizations under a non-disclosure agreement). '
    },
    {
      value: 'Confidential information',
      label: 'Confidential information',
      rating: 7,
      description:
        'Confidential information about the item or component (e.g. knowledge that is shared between different teams within the developer organization, access to which is controlled and only to members of the design and testing teams). '
    },
    {
      value: 'Strictly confidential information',
      label: 'Strictly confidential information',
      rating: 11,
      description:
        'Highly confidential information about the item or component (e.g. knowledge that is known by a handful of individuals, access to which is very tightly controlled on a strict need-to-know basis and kept secret for individual reasons). '
    }
  ],
  'Window of Opportunity': [
    {
      value: 'Unlimited',
      label: 'Unlimited',
      rating: 0,
      description:
        'Highly availability via public/untrusted network without any time limitation (i.e. asset is always accessible). Remote access without physical presence or time limitation as well as unlimited physical access is provided to the item or component.'
    },
    {
      value: 'Easy',
      label: 'Easy',
      rating: 1,
      description: 'Highly available but limited access time. Remote access without physical presence to the item or component.'
    },
    {
      value: 'Moderate',
      label: 'Moderate',
      rating: 4,
      description:
        'Low availability of the item or component, limited physical and/or logical access. Physical access to the vehicle interior or exterior without using any special tool. '
    },
    {
      value: 'Difficult',
      label: 'Difficult',
      rating: 10,
      description:
        'Very low availability of the item or component. Impractical level of access to the item or component to perform the attack.'
    }
  ],
  Equipment: [
    {
      value: 'Standard',
      label: 'Standard',
      rating: 0,
      description:
        'Equipment is readily available to the attacker. This equipment can be a part of the product itself (e.g. debugger on an operating system), or can be readily obtained (e.g. internet sources, product samples, or simple attack scripts). '
    },
    {
      value: 'Specialized',
      label: 'Specialized',
      rating: 4,
      description:
        'Equipment is not readily available to the attacker but can be acquired without undue effort. This includes products and/or intermediate stages of equipment (e.g., power analysis tools, use of hundreds of PC hacker tools offered in the Internet) would fall into this category. Development of more extensive attack scripts or scan programs. If difficulty reflects the benchmark costs of specialized equipment are required for distinct steps of an attack, this would be rated as bespoke. '
    },
    {
      value: 'Bespoke',
      label: 'Bespoke',
      rating: 7,
      description:
        'Equipment is specially produced (e.g. very sophisticated software) and not readily available on the public or black market, or the equipment is so specialized that its distribution is controlled, possibly even restricted. Alternatively, the equipment is very expensive.'
    },
    {
      value: 'Multiple bespoke',
      label: 'Multiple bespoke',
      rating: 9,
      description:
        ' It is introduced to allow for a situation, where different types of bespoke equipment are required for distinct steps of an attack.'
    }
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
                      {item?.description}
                    </Typography>
                  }
                >
                  {<Typography variant="h5">{item?.label}</Typography>}
                </HtmlTooltip>
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
  const { model, update, attacks, getAttackScenario } = useStore(selector, shallow);
  const [rows, setRows] = React.useState([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filtered, setFiltered] = React.useState([]);
  const [page, setPage] = React.useState(0); // Pagination state
  const [rowsPerPage, setRowsPerPage] = React.useState(10); // Rows per page state

  React.useEffect(() => {
    if (attacks['scenes']) {
      const mod1 = attacks['scenes']?.map((dt) => {
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
          Equipment: dt?.Equipment ?? '',
          'Attack Feasibilities Rating': dt['Attack Feasibilities Rating'] ?? ''
        };
      });

      setRows(mod1);
      setFiltered(mod1);
    }
  }, [attacks]);

  const getRating = (value) => {
    if (value >= 0 && value <= 13) {
      return 'Low';
    } else if (value >= 14 && value <= 19) {
      return 'Medium';
    } else if (value >= 20 && value <= 24) {
      return 'Low';
    } else {
      return 'Very low';
    }
  };
  // console.log('rows', rows);
  const handleChange = (e, row) => {
    const { name, value } = e.target;

    // Update the selected category with the new value
    const updatedRows = rows.map((r) => {
      if (r.ID === row.ID) {
        return { ...r, [name]: value };
      }
      return r;
    });

    // setRows(updatedRows);

    // // Calculate average Attack Feasabilities Rating if the updated category is part of the specified categories
    const calculateAverageRating = (row) => {
      const categories = ['Elapsed Time', 'Expertise', 'Knowledge of the Item', 'Window of Opportunity', 'Equipment'];
      let totalRating = 0;
      let count = 0;

      categories.forEach((category) => {
        const selectedOption = options[category].find((option) => option.value === row[category]);
        if (selectedOption) {
          totalRating += selectedOption.rating;
          count++;
        }
      });

      return count > 0 ? (totalRating / count).toFixed(2) : 'N/A';
    };

    const updatedRow = updatedRows.find((r) => r.ID === row.ID);
    const averageRating = calculateAverageRating(updatedRow);
    updatedRow['Attack Feasibilities Rating'] = getRating(averageRating);

    // console.log('updatedRow', updatedRow);
    // // Find the updated row and recalculate the rating
    // // console.log('updatedRows', updatedRows);

    // // Update the model with the new row and rating
    // const mod = JSON.parse(JSON.stringify(model));
    // const scenarioIndex = 3; // Update based on your actual scenario
    // const subsIndex = 0;

    // const updated = updatedRows.map((rw) => {
    //   const { Description, ...rest } = rw;
    //   return rest;
    // });

    // console.log('updated', updated);

    // mod.scenarios[scenarioIndex].subs[subsIndex].scenes = updated;

    const details = {
      modelId: model?._id,
      type: 'attack',
      id: row?.ID,
      [`${name}`]: value,
      'Attack Feasibilities Rating': getRating(averageRating)
    };

    // console.log('details', details);
    update(details)
      .then((res) => {
        if (res) {
          getAttackScenario(model?._id);
        }
      })
      .catch((err) => console.log('err', err));
  };

  const handleBack = () => {
    dispatch(closeAll());
  };

  // console.log('model', model);

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
            const bgColor = RatingColor(row['Attack Feasibilities Rating']);
            return (
              <React.Fragment key={index}>
                {checkforLabel(item) ? (
                  <SelectableCell item={item} row={row} handleChange={handleChange} name={item.name} />
                ) : item.name === 'Attack Feasibilities Rating' ? (
                  <StyledTableCell
                    key={index}
                    align={'left'}
                    sx={{ backgroundColor: bgColor, color: bgColor !== 'yellow' ? 'white' : 'black' }}
                  >
                    {row[item.name] ? row[item.name] : '-'}
                  </StyledTableCell>
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
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box display="flex" alignItems="center" gap={1}>
          <KeyboardBackspaceRoundedIcon sx={{ cursor: 'pointer', ml: 1, color: color?.title }} onClick={handleBack} />
          <Typography sx={{ color: color?.title, fontWeight: 600, fontSize: '16px' }}>Attack Tree Table</Typography>
        </Box>
        <TextField
          id="outlined-size-small"
          placeholder="Search"
          size="small"
          value={searchTerm}
          onChange={handleSearch}
          sx={{ padding: 1, '& .MuiInputBase-input': { border: '1px solid black' } }}
        />
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          maxHeight: 440,
          borderRadius: '0px',
          padding: 1,
          overflow: 'auto',
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
