/*eslint-disable*/
import * as React from 'react';
import Joyride from 'react-joyride';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Box,
  TextField,
  Slide,
  IconButton
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { shallow } from 'zustand/shallow';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import useStore from '../../store/Zustand/store';
import { closeAll } from '../../store/slices/CurrentIdSlice';
import { setModelId } from '../../store/slices/PageSectionSlice';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const selector = (state) => ({
  create: state.createModel
});

const steps = [
  {
    target: '#model-name-input',
    content: 'Enter a unique name for your project model here.',
    disableBeacon: true
  },
  {
    target: '#create-model-btn',
    content: 'Click here to create the model with the provided name.'
  },
  {
    target: '#cancel-btn',
    content: 'Click here to cancel model creation and close the dialog.'
  }
];

export default function AddModel({ open, handleClose, getModels }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userDetails } = useSelector((state) => state?.userDetails);
  const { create } = useStore(selector, shallow);
  const notify = (message, status) => toast[status](message);
  const [templateDetails, setTemplateDetails] = React.useState({
    name: ''
  });
  const [loading, setLoading] = React.useState(false);
  const [runTour, setRunTour] = React.useState(false);
  const inputRef = React.useRef(null);
  const hasTriggeredTour = React.useRef(false);

  React.useEffect(() => {
    if (open && !hasTriggeredTour.current) {
      hasTriggeredTour.current = true;

      // Focus the input field
      const focusTimer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 300);

      return () => {
        clearTimeout(focusTimer);
      };
    }

    // Reset flag when modal closes
    if (!open) {
      hasTriggeredTour.current = false;
      setRunTour(false);
    }
  }, [open]);

  const handleJoyrideCallback = (data) => {
    const { status, type } = data;

    // Close tour when finished or skipped
    if (['finished', 'skipped'].includes(status)) {
      setRunTour(false);
    }

    // Focus input after the first step
    if (type === 'step:after' && data.step.target === '#model-name-input') {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleTourStart = () => {
    sessionStorage.setItem('seenAddModelTour', 'true');
    setRunTour(true);
  };

  const handleChange = React.useCallback((e) => {
    setTemplateDetails((prev) => ({ ...prev, name: e.target.value }));
  }, []);

  const handleCreate = (e) => {
    if (!templateDetails.name.trim()) {
      toast.error('Name is required');
      return;
    }

    setLoading(true);
    const newModel = { name: templateDetails.name.trim() };

    create(newModel, userDetails?.username)
      .then((res) => {
        if (!res.error) {
          notify(res.message ?? 'Model created successfully', 'success');
          navigate(`/Models/${res?.model_id}`);
          dispatch(setModelId(res?.model_id));
          dispatch(closeAll());
          getModels();
          handleClose(e);
        } else {
          toast.error(res.error ?? 'Something went wrong');
        }
      })
      .catch((err) => {
        // console.log('err', err);
        toast.error(err.response.data.error ?? 'Something went wrong');
      })
      .finally(() => {
        setLoading(false);
      });
    setTemplateDetails((state) => ({
      ...state,
      name: ''
    }));
  };

  return (
    <React.Fragment>
      <Joyride
        steps={steps}
        run={runTour}
        continuous
        scrollToFirstStep
        showProgress
        showSkipButton
        callback={handleJoyrideCallback}
        styles={{
          options: {
            zIndex: 1300,
            // Custom beacon styling
            beacon: {
              backgroundColor: '#1976d2',
              borderRadius: '50%',
              width: 20,
              height: 20,
              animation: 'pulse 1.5s infinite'
            }
          }
        }}
        disableOverlayClose
        disableScrolling
        floaterProps={{
          styles: {
            arrow: {
              color: '#1976d2'
            }
          }
        }}
      />

      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-labelledby="add-model-dialog-title"
        aria-describedby="add-model-dialog-description"
        maxWidth="sm"
        sx={{
          '& .MuiPaper-root': {
            width: '475px',
            borderRadius: '8px'
          }
        }}
      >
        <DialogTitle
          sx={{ fontSize: 18, fontFamily: 'Inter', pb: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          {'Add Project'}
          <IconButton
            onClick={handleTourStart}
            sx={{
              color: '#1976d2',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.1)'
              }
            }}
          >
            <HelpOutlineIcon />
          </IconButton>
        </DialogTitle>
        <DialogTitle sx={{ fontSize: 14, fontFamily: 'italic', pt: 0, pb: 1 }}>{'Name of your project to create a new model.'}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, my: 1 }}>
              <TextField
                inputRef={inputRef}
                id="model-name-input"
                label="Name"
                variant="outlined"
                value={templateDetails?.name}
                onChange={(e) => setTemplateDetails({ ...templateDetails, name: e.target.value })}
                sx={{ width: '300px' }}
              />
            </Box>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button id="cancel-btn" variant="outlined" color="error" onClick={handleClose}>
            cancel
          </Button>
          <Button id="create-model-btn" variant="contained" onClick={handleCreate}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
      <Toaster position="top-right" reverseOrder={false} />

      {/* Add CSS for the beacon animation */}
      <style>
        {`
          @keyframes pulse {
            0% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.3);
              opacity: 0.7;
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}
      </style>
    </React.Fragment>
  );
}
