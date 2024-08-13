import { makeStyles } from '@mui/styles';

const useStyles = makeStyles(() => ({
    decrease:{
        backgroundColor:"white",
        border:'0.5px solid gray',
        borderTopLeftRadius:'5px',
        borderBottomLeftRadius:'5px',
        padding:'1.4px 3px'
    },
    increase:{
        backgroundColor:"white",
        border:'0.5px solid gray',
        borderTopRightRadius:'5px',
        borderBottomRightRadius:'5px',
        padding:'1.4px 3px'
    },
    select:{
        width: '80px',
        height: '21px',
        borderRadius:'0px',
        borderLeft:'none',
        borderRight:'none'
    }
   
}));
const FontSizeSelector = ({fontSize, changeFontSize, handleFontSizeChange }) => {
    const classes = useStyles();
  function range(start, end) {
    var ans = [];
    for (let i = start; i <= end; i++) {
        if(i%2 ===0){
            ans.push(i);
        }
    }
    return ans;
}
  return (
    <div style={{
        display:'flex',
        alignItems:'center'
    }}>
      <button 
      className={classes.decrease}
      onClick={()=>changeFontSize('dec')} 
     >-</button>
      {/* eslint-disable-next-line */}
      <select 
      className={classes.select}
      id="fontSizeSelector" 
      value={`${fontSize}px`} 
      onChange={handleFontSizeChange} 
      >
     { range(12,48).map(it=>(
        <option key={it} value={`${it}px`}>{it}px</option>
     )) } 
      </select>
      <button 
      onClick={()=>changeFontSize('inc')}
      className={classes.increase}
      >+</button>
    </div>
  );
};

export default FontSizeSelector;
