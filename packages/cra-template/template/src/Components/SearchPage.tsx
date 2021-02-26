import React from 'react';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import SearchBox from './SearchBox';
import QuerySummary from './QuerySummary';
import ResultList from './ResultList';
import Pager from './Pager';
import Sort from './Sort';
import FacetList from './FacetList';
import ResultsPerPage from './ResultsPerPage';
import {AnalyticsActions, SearchActions} from '@coveo/headless';
import {IEngineProp} from '../common/Engine';

export default class SearchPage extends React.Component<IEngineProp> {
  componentDidMount() {
    const {dispatch} = this.props.engine;
    const action = SearchActions.executeSearch(
      AnalyticsActions.logInterfaceLoad()
    ) as any;
    dispatch(action);
  }

  render() {
    return (
      <Container maxWidth="lg">
        <Grid container justify="center">
          <Grid item md={8}>
            <SearchBox engine={this.props.engine} />
          </Grid>
        </Grid>

        <Box my={4}>
          <Grid container>
            <Grid item md={3} sm={12}>
              <FacetList engine={this.props.engine} />
            </Grid>
            <Grid item md={9} sm={12}>
              <Box pl={3}>
                <Grid container alignItems="flex-end">
                  <Grid item md={10}>
                    <QuerySummary engine={this.props.engine} />
                  </Grid>
                  <Grid item md={2}>
                    <Sort engine={this.props.engine} />
                  </Grid>
                </Grid>
                <ResultList engine={this.props.engine} />
              </Box>
              <Box my={4}>
                <Grid container>
                  <Grid item md={6}>
                    <Pager engine={this.props.engine} />
                  </Grid>
                  <Grid item md={6}>
                    <ResultsPerPage engine={this.props.engine} />
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    );
  }
}
