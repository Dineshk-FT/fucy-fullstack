// material-ui
import { useTheme } from '@mui/material/styles';
import { Avatar, Box, ButtonBase } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// project imports
// import LogoSection from '../LogoSection';
// import SearchSection from './SearchSection';
// import ProfileSection from './ProfileSection';
// import NotificationSection from './NotificationSection';

// assets
import { IconMenu2 } from '@tabler/icons';
import MenuList from './MenuList';
import ColorTheme from '../../../store/ColorTheme';
import { useDispatch } from 'react-redux';
import { changeCanvasPage } from '../../../store/slices/CanvasSlice';
import { useNavigate } from 'react-router';

// ==============================|| MAIN NAVBAR / HEADER ||============================== //

const Header = ({ handleLeftDrawerToggle }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const theme = useTheme();
    const handleClick=()=>{
        // console.log('clicked')
        dispatch(changeCanvasPage('home'));
        navigate('/home', { replace: true });
        // setTimeout(() => {
            // window.location.href = '/home';
        // }, 200);
    }

    return (
        <>
            {/* logo & toggler button */}
            <Box
                sx={{
                    width: 228,
                    marginBottom: '4.5rem',
                    display:  'flex' ,
                    flexDirection:'column',
                    alignItems:'center',
                    gap:2,
                    [theme.breakpoints.down('md')]: {
                        width: 'auto',
                        mb: 4,
                        mr: 2
                    },
                    [theme.breakpoints.up('md')]: {
                        width: 'auto',
                        mb: 4,
                        mr: 2
                    }
                }}
            >
                {/* <Box component="span" sx={{ display: { xs: 'none', md: 'block' }, flexGrow: 1 }}>
                    <LogoSection />
                </Box> */}
                <ButtonBase sx={{ borderRadius: '12px', overflow: 'hidden' }}>
                    <Avatar
                        variant="rounded"
                        sx={{
                            ...theme.typography.commonAvatar,
                            ...theme.typography.mediumAvatar,
                            transition: 'all .2s ease-in-out',
                            background: 'white',
                            color: 'black',
                            '&:hover': {
                                background: 'black',
                                color: 'white'
                            }
                        }}
                        onClick={handleLeftDrawerToggle}
                        color="inherit"
                    >
                        <IconMenu2 stroke={1.5} size="1.3rem" />
                    </Avatar>
                </ButtonBase>
                <Box onClick={handleClick}>
                <ArrowBackIcon sx={{color:ColorTheme().title}}/>
                </Box>
            </Box>
            <MenuList />
        </>
    );
};

export default Header;
