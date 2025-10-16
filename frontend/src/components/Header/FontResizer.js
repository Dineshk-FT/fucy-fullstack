/*eslint-disable*/
import { makeStyles } from '@mui/styles';
import { Box, Button, Select, MenuItem } from '@mui/material';
import { Remove, Add } from '@mui/icons-material';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    alignItems: 'center',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid',
    borderColor: 'divider',
    '&:hover': {
      borderColor: 'primary.main'
    }
  },
  button: {
    minWidth: '32px',
    width: '32px',
    height: '32px',
    borderRadius: 0,
    backgroundColor: 'background.paper',
    border: 'none',
    '&:hover': {
      backgroundColor: 'action.hover'
    },
    '&:active': {
      backgroundColor: 'action.selected'
    }
  },
  select: {
    height: '32px',
    minWidth: '120px',
    borderRadius: 0,
    border: 'none',
    borderLeft: '1px solid',
    borderRight: '1px solid',
    borderColor: 'divider',
    '& .MuiSelect-select': {
      padding: '6px 12px',
      fontSize: '0.875rem'
    },
    '&:hover': {
      backgroundColor: 'action.hover'
    }
  }
}));

const FontSizeSelector = ({ fontSize, changeFontSize, handleFontSizeChange }) => {
  const classes = useStyles();

  function range(start, end) {
    const ans = [];
    for (let i = start; i <= end; i++) {
      if (i % 2 === 0) {
        ans.push(i);
      }
    }
    return ans;
  }

  return (
    <Box className={classes.container}>
      <Button className={classes.button} onClick={(e) => changeFontSize(e, 'dec')} size="small">
        <Remove fontSize="small" />
      </Button>

      <Select
        className={classes.select}
        value={`${fontSize}px`}
        onChange={handleFontSizeChange}
        onClick={(e) => e.stopPropagation()}
        MenuProps={{
          PaperProps: {
            sx: {
              maxHeight: 200
            }
          }
        }}
      >
        {range(12, 48).map((it) => (
          <MenuItem key={it} value={`${it}px`}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>{it}px</span>
              <Box
                sx={{
                  fontSize: `${Math.max(8, it - 4)}px`,
                  opacity: 0.6,
                  ml: 2
                }}
              >
                Aa
              </Box>
            </Box>
          </MenuItem>
        ))}
      </Select>

      <Button className={classes.button} onClick={(e) => changeFontSize(e, 'inc')} size="small">
        <Add fontSize="small" />
      </Button>
    </Box>
  );
};

export default FontSizeSelector;
