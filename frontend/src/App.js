/* eslint-disable */
import { useSelector } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, StyledEngineProvider } from '@mui/material';

// routing
import Routes from './routes';

// defaultTheme
import themes from './themes';

// project imports
import NavigationScroll from './layout/NavigationScroll';
import MockErrorBoundary from './views/ErrorPage';
import { ReactFlowProvider } from 'reactflow';

// ==============================|| APP ||============================== //

const App = () => {
  const customization = useSelector((state) => state.customization);

  return (
    <ReactFlowProvider>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={themes(customization)}>
          <CssBaseline />
          <NavigationScroll>
            <MockErrorBoundary>
              <Routes />
            </MockErrorBoundary>
          </NavigationScroll>
        </ThemeProvider>
      </StyledEngineProvider>
    </ReactFlowProvider>
  );
};

export default App;
