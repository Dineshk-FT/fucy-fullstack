/* eslint-disable */
import React from 'react';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles(() => ({
  decrease: {
    backgroundColor: 'white',
    border: '0.5px solid gray',
    borderTopLeftRadius: '5px',
    borderBottomLeftRadius: '5px',
    padding: '1.4px 3px',
    cursor: 'pointer'
  },
  increase: {
    backgroundColor: 'white',
    border: '0.5px solid gray',
    borderTopRightRadius: '5px',
    borderBottomRightRadius: '5px',
    padding: '1.4px 3px',
    cursor: 'pointer'
  },
  select: {
    width: '80px',
    height: '21px',
    borderRadius: '0px',
    borderLeft: 'none',
    borderRight: 'none',
    cursor: 'pointer'
  }
}));

const BorderWidthSelector = ({ borderWidth, changeBorderWidth, handleBorderWidthChange }) => {
  const classes = useStyles();

  // Generate range 0–6 (inclusive)
  const range = () => Array.from({ length: 7 }, (_, i) => i);

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <button className={classes.decrease} onClick={() => changeBorderWidth('dec')}>
        -
      </button>

      {/* eslint-disable-next-line */}
      <select
        className={classes.select}
        id="borderWidthSelector"
        value={`${borderWidth}px`}
        onChange={handleBorderWidthChange}
        onClick={(e) => e.stopPropagation()}
        style={{ width: 'auto' }}
      >
        {range().map((it) => (
          <option key={it} value={`${it}px`}>
            {it}px
          </option>
        ))}
      </select>

      <button className={classes.increase} onClick={() => changeBorderWidth('inc')}>
        +
      </button>
    </div>
  );
};

export default BorderWidthSelector;
