import * as React from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Box,
  TextField,
  Slide
  // useTheme
} from '@mui/material';
import useStore from '../../Zustand/store';
import { shallow } from 'zustand/shallow';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router';
import { v4 as uid } from 'uuid';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const selector = (state) => ({
  create: state.createModal
});
// const ITEM_HEIGHT = 48;
// const ITEM_PADDING_TOP = 8;
// const MenuProps = {
//     PaperProps: {
//         style: {
//             maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
//             width: 300
//         }
//     }
// };

// function getStyles(name, nodes, theme) {
//     return {
//         fontWeight: nodes.indexOf(name) === -1 ? theme.typography.fontWeightRegular : theme.typography.fontWeightMedium
//     };
// }
// const Properties = ['Confidentiality', 'Integrity', 'Authenticity', 'Authorization', 'Non-repudiation', 'Availability'];

export default function AddModal({ open, handleClose, getModals }) {
  // const dispatch = useDispatch();
  const navigate = useNavigate();
  const { create } = useStore(selector, shallow);
  const notify = (message, status) => toast[status](message);
  // const theme = useTheme();
  const [templateDetails, setTemplateDetails] = React.useState({
    name: ''
    // properties: []
  });
  // const handleChange = (event) => {
  //     const {
  //         target: { value }
  //     } = event;
  //     setTemplateDetails({
  //         ...templateDetails,
  //         properties: typeof value === 'string' ? value.split(',') : value
  //     });
  // };

  const handleCreate = () => {
    const scenarios = [
      {
        id: uid(),
        name: 'Item Modal & Assets',
        icon: 'ItemIcon',
        Details: []
      },
      {
        id: uid(),
        name: 'Damage Scenarios Identification and Impact Ratings',
        icon: 'DamageIcon',
        subs: [
          {
            id: uid(),
            name: 'Damage Scenarios Derivations',
            Details: []
          },
          {
            id: uid(),
            name: 'Damage Scenarios - Collection & Impact Ratings',
            scenes: [],
            Details: []
          }
        ]
      },
      {
        id: uid(),
        name: 'Threat Scenarios Identification',
        icon: 'ThreatIcon',
        subs: [
          {
            id: uid(),
            name: 'Threat Scenarios',
            Details: [],
            losses: []
          },
          {
            id: uid(),
            name: 'Derived Threat Scenarios',
            scenes: []
          }
        ]
      },
      {
        id: uid(),
        name: 'Attack Path Analysis and Attack Feasability Rating',
        icon: 'AttackIcon',
        subs: [
          {
            id: uid(),
            name: 'Attack',
            scenes: []
          },
          {
            id: uid(),
            name: 'Attack Trees',
            scenes: []
          },
          {
            id: uid(),
            name: 'Vulnerability Analysis',
            scenes: []
          }
        ]
      },
      {
        id: uid(),
        name: 'CyberSecurity Goals, Claims and Requirements',
        icon: 'CybersecurityIcon',
        subs: [
          {
            id: uid(),
            name: 'CyberSecurity Goals and Requirements',
            subs: [
              {
                id: uid(),
                name: 'CyberSecurity Goals',
                scenes: []
              },
              {
                id: uid(),
                name: 'CyberSecurity Requirements',
                scenes: []
              }
            ]
          },
          {
            id: uid(),
            name: 'CyberSecurity Controls',
            scenes: []
          }
        ]
      },
      {
        id: uid(),
        name: 'System Design',
        icon: 'SystemIcon',
        subs: [
          {
            id: uid(),
            name: 'Hardware Models'
          },
          {
            id: uid(),
            name: 'Software Models'
          }
        ]
      },
      {
        id: uid(),
        name: 'Catalogs',
        icon: 'CatalogIcon',
        subs: [
          {
            name: 'UNICE R.155 Annex 5(WP.29)',
            scenes: []
          }
        ]
      },
      {
        id: uid(),
        name: 'Risk Determination and Risk Treatment Decision',
        icon: 'RiskIcon'
      },
      {
        id: uid(),
        name: 'Documents',
        icon: 'DocumentIcon'
      },
      {
        id: uid(),
        name: 'Reporting',
        icon: 'ReportIcon',
        scenes: []
      },
      {
        id: uid(),
        name: 'Layouts',
        icon: 'LayoutIcon',
        scenes: []
      }
    ];
    const newModal = {
      ...templateDetails,
      scenarios: scenarios
    };

    create(newModal)
      .then((res) => {
        if (res) {
          setTimeout(() => {
            notify(res.message ?? 'Model created successfully', 'success');
            navigate(`/Models/${res?.model_id}`);
            // window.location.href = `/Modals/${id}`;
            getModals();
            handleClose();
          }, 500);
        }
      })
      .catch((err) => {
        console.log('err', err);
        notify('Something Went Wrong', 'error');
      });
    setTemplateDetails((state) => ({
      ...state,
      name: ''
    }));
  };
  // console.log('templateDetails', templateDetails);
  return (
    <React.Fragment>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle sx={{ fontSize: 20, fontFamily: 'Inter' }}>{'Add Project'}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, my: 1 }}>
              <TextField
                value={templateDetails?.name}
                id="outlined-basic"
                label="Name"
                variant="outlined"
                onChange={(e) => setTemplateDetails({ ...templateDetails, name: e.target.value })}
                sx={{
                  width: '300px'
                }}
              />
              {/* <FormControl sx={{ width: 350 }}>
                                <InputLabel notched id="demo-multiple-chip-label">
                                    Properties
                                </InputLabel>
                                <Select
                                    labelId="demo-multiple-chip-label"
                                    id="demo-multiple-chip"
                                    multiple
                                    value={templateDetails.properties}
                                    onChange={handleChange}
                                    input={<OutlinedInput id="select-multiple-chip" label="Properties" />}
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((value) => (
                                                <Chip key={value} label={value} />
                                            ))}
                                        </Box>
                                    )}
                                    MenuProps={MenuProps}
                                >
                                    {Properties.map((name) => (
                                        <MenuItem key={name} value={name} style={getStyles(name, templateDetails.properties, theme)}>
                                            {name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl> */}
            </Box>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" color="error" onClick={handleClose}>
            cancel
          </Button>
          <Button variant="contained" onClick={handleCreate}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
      <Toaster position="top-right" reverseOrder={false} />
    </React.Fragment>
  );
}
