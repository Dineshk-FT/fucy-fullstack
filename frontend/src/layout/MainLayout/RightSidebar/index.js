import * as React from 'react';
import { Box } from '@mui/system';
import { ArrowSquareLeft, ArrowSquareRight } from 'iconsax-react';
import { makeStyles } from '@mui/styles';
import EditContent from '../../../ui-component/Drawer/EditContent';
import ColorTheme from '../../../store/ColorTheme';
// import CloseIcon from '@mui/icons-material/Close';

const useStyles = makeStyles(() => ({
  accordion: {
    width: '210px',
    backgroundColor: 'transparent',
    '&.MuiPaper-root ': {
      margin: '0px !important'
    }
  },
  arrow: {
    cursor: 'pointer',
    position: 'relative',
    right: '1.3rem',
    top: '.2rem',
    height: 'fit-content'
  }
}));

export default function RightDrawer({
  state,
  drawerOpen,
  drawerClose,
  selectedNode,
  nodes,
  setNodes,
  setSelectedNode,
  modal,
  updateModal
}) {
  const [details, setDetails] = React.useState({
    name: '',
    properties: []
    // bgColor: '#000000'
  });
  const handleClose = () => {
    drawerClose();
    setDetails({
      name: '',
      properties: []
    });
  };

  React.useEffect(() => {
    handleClose();
  }, [!nodes.length]);
  const classes = useStyles();
  return (
    <React.Fragment>
      <Box
        sx={{
          backgroundColor: '#e3e3e3',
          position: 'sticky',
          float: 'right',
          // left: '50rem',
          transition: 'width 0.8s',
          width: state ? '270px' : '0px',
          height: 'inherit',
          zIndex: 1000,
          display: 'flex'
          // pr:1
        }}
      >
        {!state ? (
          <Box onClick={drawerOpen} className={classes.arrow}>
            <ArrowSquareLeft size="20px" color={ColorTheme()?.iconColor} />
          </Box>
        ) : (
          <Box onClick={handleClose} className={classes.arrow}>
            <ArrowSquareRight size="20px" color={ColorTheme()?.iconColor} />
          </Box>
        )}
        <Box sx={{ display: state ? 'block' : 'none', width: state ? 'inherit' : '0px', overflow: 'auto', marginTop: '1rem' }}>
          <EditContent
            selectedNode={selectedNode}
            nodes={nodes}
            setNodes={setNodes}
            setSelectedNode={setSelectedNode}
            details={details}
            setDetails={setDetails}
            modal={modal}
            updateModal={updateModal}
          />
        </Box>
      </Box>
    </React.Fragment>
  );
}
