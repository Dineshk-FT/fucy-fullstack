/*eslint-disable*/
// material-ui
import {
  styled
  // , useTheme
} from '@mui/material/styles';
import {
  // Avatar,
  Card,
  CardContent,
  Typography,
  // Grid,
  // LinearProgress,
  List,
  ListItem,
  // ListItemAvatar,
  ListItemText,
  Autocomplete,
  Chip,
  TextField
  // linearProgressClasses
} from '@mui/material';
import ColorTheme from '../../../../store/ColorTheme';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

// assets
// import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';

// styles
// const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
//     height: 10,
//     borderRadius: 30,
//     [`&.${linearProgressClasses.colorPrimary}`]: {
//         backgroundColor: '#fff'
//     },
//     [`& .${linearProgressClasses.bar}`]: {
//         borderRadius: 5,
//         backgroundColor: theme.palette.primary.main
//     }
// }));

const options = ['Confidentiality', 'Integrity', 'Authenticity', 'Authorization', 'Non-repudiation', 'Availability'];

const CardStyle = styled(Card)(() =>
  // { theme }
  ({
    // background: theme.palette.primary.light,
    // border:'1px solid',
    boxShadow: 'inset 0px 0px 7px gray',
    marginBottom: '22px',
    overflow: 'hidden',
    position: 'relative',
    height: '20vh',
    '&:after': {
      content: '""',
      position: 'absolute',
      // width: '157px',
      // height: '157px',
      // background: theme.palette.primary[200],
      borderRadius: '50%',
      top: '-105px',
      right: '-96px'
    }
  })
);

// ==============================|| PROGRESS BAR WITH LABEL ||============================== //

// function LinearProgressWithLabel({ value, ...others }) {
//     const theme = useTheme();

//     return (
//         <Grid container direction="column" spacing={1} sx={{ mt: 1.5 }}>
//             <Grid item>
//                 <Grid container justifyContent="space-between">
//                     <Grid item>
//                         <Typography variant="h6" sx={{ color: theme.palette.primary[800] }}>
//                             Properties
//                         </Typography>
//                     </Grid>
//                     <Grid item>
//                         <Typography variant="h6" color="inherit">{`${Math.round(value)}%`}</Typography>
//                     </Grid>
//                 </Grid>
//             </Grid>
//             <Grid item>
//                 <BorderLinearProgress variant="determinate" {...others} />
//             </Grid>
//         </Grid>
//     );
// }

// ==============================|| SIDEBAR MENU Card ||============================== //

const MenuCard = () => {
  const color = ColorTheme();
  const [properties, setProperties] = useState([]);
  const { selectedBlock } = useSelector((state) => state?.canvas);

  // console.log('properties here', properties)
  // const theme = useTheme();
  useEffect(() => {
    setProperties(selectedBlock?.properties ?? []);
  }, [selectedBlock]);

  const handleChange = (event, newValue) => {
    setProperties(newValue);
  };

  const handleDelete = (valueToDelete) => () => {
    setDetails((prevDetails) => prevDetails.filter((property) => property !== valueToDelete));
  };
  return (
    <>
      <Typography variant="h4" sx={{ color: color?.tabContentClr }}>
        Properties{' '}
      </Typography>
      {/* <CardStyle sx={{ backgroundColor: color?.sidebarInnerBG }}>
        <CardContent sx={{ p: 2 }}>
          <List sx={{ p: 0, m: 0 }}>
            <ListItem alignItems="flex-start" disableGutters sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
              {properties?.map((item, i) => (
                <ListItemText
                  key={i}
                  sx={{ mt: 0 }}
                  primary={
                    <Typography variant="subtitle1" sx={{ color: color?.sidebarContent }}>
                      {i + 1}. {item}
                    </Typography>
                  }
                />
              ))}
            </ListItem>
          </List>
        </CardContent>
      </CardStyle> */}
      <Autocomplete
        multiple
        id="tags-filled"
        options={options}
        value={properties}
        onChange={handleChange}
        sx={{
          '& .MuiOutlinedInput-root': {
            padding: '3px'
          }
        }}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip key={option} variant="outlined" label={option} {...getTagProps({ index })} onDelete={handleDelete(option)} />
          ))
        }
        renderInput={(params) => <TextField {...params} variant="outlined" />}
      />
    </>
  );
};

export default MenuCard;
