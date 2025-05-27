import React from 'react';
import { Container, Button, Box, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1
  },
  box: {
    position: 'relative',
    height: '85svh',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      backgroundImage:
        'url(https://images.unsplash.com/photo-1634804658555-248d9e9a212f?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)',
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      filter: 'brightness(60%)',
      zIndex: 1
    }
  },
  menuButton: {
    marginRight: theme.spacing(2)
  },
  mainContent: {
    color: 'white',
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    justifyContent: 'center',
    height: 'inherit',
    margin: 'auto 25svh',
    [theme.breakpoints.down('lg')]: {
      margin: 'auto 15svh'
    },
    [theme.breakpoints.down('md')]: {
      margin: 'auto 5svh'
    }
  },
  content: {
    borderLeft: '2px solid #f5f5f5',
    alignSelf: 'center'
  },
  typo: {
    fontSize: 70,
    [theme.breakpoints.down('lg')]: {
      fontSize: 50
    },
    [theme.breakpoints.down('md')]: {
      fontSize: 40
    }
  },
  head: {
    fontSize: 50,
    [theme.breakpoints.down('lg')]: {
      fontSize: 40
    }
  },
  mainText: {
    marginTop: theme.spacing(4)
  },
  help: {
    backgroundColor: 'white',
    color: 'black',
    fontSize: 23,
    padding: 10
  },
  footer: {
    backgroundColor: '#000',
    padding: theme.spacing(4),
    maxWidth: 'inherit'
  }
}));

export default function MainSection() {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <Box className={classes.box}>
        <Box className={classes.mainContent}>
          <Box className={classes.content} lg={12} md={12}>
            <Box ml={2}>
              <Typography className={classes.typo} variant="h2" textAlign="left" gutterBottom color="inherit">
                Cyber Security Management System
              </Typography>
              <Typography variant="h5" textAlign="left" paragraph color="inherit" fontSize={20}>
                TARA automation, BOM and vulnerability management, cybersecurity monitoring, and more.
              </Typography>
              <Button variant="contained" className={classes.help}>
                How Can We Help ?
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
      <Container className={classes.footer}>
        <Typography color="white" variant="h6" textAlign="center" className={classes.head}>
          A CSMS dedicated to automotive cybersecurity
        </Typography>
      </Container>
    </div>
  );
}
