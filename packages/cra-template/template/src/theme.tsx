import red from '@material-ui/core/colors/red';
import {createMuiTheme} from '@material-ui/core/styles';

// A custom theme for this app
const theme = createMuiTheme({
  palette: {
    type: 'light',
    text: {
      // You can easily change the overall text color
      // primary: '#282829',
      // secondary: '#E5E8E8',
    },
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
