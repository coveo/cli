import {createTheme} from '@mui/material/styles';
import {red} from '@mui/material/colors';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2e45ba',
    },
    secondary: {
      main: '#004990',
    },
    error: {
      main: red.A400,
    },
    background: {
      default: '#fff',
    },
  },
  typography: {
    fontFamily: 'Avenir, Helvetica, Arial, sans-serif',
    // Material-UI uses rem units for the font size. This will change the base size for the entire search page
    // More info at https://material-ui.com/customization/typography/#font-size
    fontSize: 17,
  },
});

export default theme;
