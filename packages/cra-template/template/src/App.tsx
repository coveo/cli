import React from 'react';
import SearchPage from './Components/SearchPage';
import Hero from './Components/Hero';
import logo from './logo.svg';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import {Grid, Typography, Box} from '@material-ui/core';
import {getSearchToken, initializeHeadlessEngine} from './common/Engine';
import {Engine} from '@coveo/headless';

export default function App() {
  return (
    <Router>
      <GuardedRoute />
    </Router>
  );
}

class GuardedRoute extends React.Component {
  isEnvValid() {
    const variables = [
      'REACT_APP_PLATFORM_URL',
      'REACT_APP_ORGANIZATION_ID',
      'REACT_APP_API_KEY',
      'REACT_APP_USER_EMAIL',
      'REACT_APP_TOKEN_ENDPOINT',
    ];
    const reducer = (previousValue: boolean, currentValue: string) =>
      previousValue && process.env[currentValue] !== undefined;
    return variables.reduce(reducer, true);
  }

  render() {
    return (
      <Route
        render={() => (this.isEnvValid() === true ? <Home /> : <Error />)}
      />
    );
  }
}

class Home extends React.Component {
  state: {engine: Engine<any> | null};
  constructor(props: {}) {
    super(props);
    this.state = {engine: null};
  }

  async componentDidMount() {
    const token = await getSearchToken();
    this.setState({engine: initializeHeadlessEngine(token)});
  }

  render() {
    return (
      <div className="App">
        <Hero
          logo={logo}
          welcome="Welcome to Your Coveo React.js Search Page"
        />
        {this.state.engine && <SearchPage engine={this.state.engine} />}
      </div>
    );
  }
}

class Error extends React.Component {
  render() {
    return (
      <Box height="100vh" display="flex" align-items="center">
        <Grid container direction="row" justify="center" alignItems="center">
          <Grid item md={9} sm={11}>
            <div className="container">
              <Typography variant="h4" color="error">
                Invalid Environment variables
              </Typography>
              <Typography variant="body1">
                You should have a valid <code>.env</code> file at the root of
                this project. You can use <code>.env.example</code> as starting
                point and make sure to replace all placeholder variables
                <code>&#60;...&#62;</code> by the proper information for your
                organization.
              </Typography>
              <p>
                Refer to the project <b>README</b> file for more information.
              </p>
            </div>
          </Grid>
        </Grid>
      </Box>
    );
  }
}
