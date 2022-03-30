import React, {useEffect} from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import SearchBox from './SearchBox';
import QuerySummary from './QuerySummary';
import ResultList from './ResultList';
import Pager from './Pager';
import Sort from './Sort';
import FacetList from './FacetList';
import ResultsPerPage from './ResultsPerPage';
import {SearchEngine} from '@coveo/headless';
import {EngineProvider} from '../common/engineContext';

interface ISearchPageProps {
  engine: SearchEngine;
}

const SearchPage: React.FunctionComponent<ISearchPageProps> = (props) => {
  const {engine} = props;
  useEffect(() => {
    engine.executeFirstSearch();
  }, [engine]);

  return (
    <EngineProvider value={engine}>
      <Container maxWidth="lg">
        <Grid container justifyContent="center">
          <Grid item md={8}>
            <SearchBox />
          </Grid>
        </Grid>

        <Box my={4}>
          <Grid container>
            <Grid item md={3} sm={12}>
              <FacetList />
            </Grid>
            <Grid item md={9} sm={12}>
              <Box pl={3}>
                <Grid container alignItems="flex-end">
                  <Grid item md={10}>
                    <QuerySummary />
                  </Grid>
                  <Grid item md={2}>
                    <Sort />
                  </Grid>
                </Grid>
                <ResultList />
              </Box>
              <Box my={4}>
                <Grid container>
                  <Grid item md={6}>
                    <Pager />
                  </Grid>
                  <Grid item md={6}>
                    <ResultsPerPage />
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </EngineProvider>
  );
};

export default SearchPage;
