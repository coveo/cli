import React, {useEffect} from 'react';
import SearchPage from './Components/SearchPage';
import Hero from './Components/Hero';
import logo from './logo.svg';
import coveologo from './coveologo.svg';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import {Grid, Typography, Box} from '@mui/material';
import {initializeHeadlessEngine} from './common/Engine';
import {SearchEngine} from '@coveo/headless';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <Navigate to={isEnvValid() === true ? '/home' : '/error'} replace />
          }
        />
        <Route path="/home" element={<Home />} />
        <Route path="/error" element={<Error />} />
      </Routes>
    </Router>
  );
}

const isEnvValid = () => {
  const variables = [
    'REACT_APP_PLATFORM_URL',
    'REACT_APP_ORGANIZATION_ID',
    'REACT_APP_API_KEY',
    'REACT_APP_USER_EMAIL',
    'REACT_APP_SERVER_PORT',
    'REACT_APP_PLATFORM_ENVIRONMENT',
  ];
  const reducer = (previousValue: boolean, currentValue: string) =>
    previousValue && Boolean(process.env[currentValue]);
  return variables.reduce(reducer, true);
};

const Home = () => {
  const [engine, setEngine] = React.useState<SearchEngine | null>(null);

  useEffect(() => {
    initializeHeadlessEngine().then((engine) => {
      setEngine(engine);
    });
  }, []);

  if (engine) {
    return (
      <div className="App">
        <Hero
          logos={[logo, coveologo]}
          welcome="Welcome to Your Coveo React.js Search Page"
        />
        {engine && <SearchPage engine={engine} />}
      </div>
    );
  } else {
    return <div>Waiting for engine</div>;
  }
};

const Error = () => {
  return (
    <Box height="100vh" display="flex" align-items="center">
      <Grid
        container
        direction="row"
        justifyContent="center"
        alignItems="center"
      >
        <Grid item md={9} sm={11}>
          <div className="container">
            <Typography variant="h4" color="error">
              Invalid Environment variables
            </Typography>
            <Typography variant="body1">
              You should have a valid <code>.env</code> file at the root of this
              project. You can use <code>.env.example</code> as starting point
              and make sure to replace all placeholder variables
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
};
