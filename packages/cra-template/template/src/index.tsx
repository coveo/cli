import {render} from 'react-dom';
import CssBaseline from '@mui/material/CssBaseline';
import {ThemeProvider, StyledEngineProvider} from '@mui/material/styles';
import App from './App';
import theme from './theme';

const rootElement = document.getElementById('root');
render(
  <StyledEngineProvider injectFirst>
    <ThemeProvider theme={theme}>
      {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StyledEngineProvider>,
  rootElement
);
