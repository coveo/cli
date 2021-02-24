import React from 'react';
import {
  buildQuerySummary,
  QuerySummaryState,
  QuerySummary as QuerySummaryType,
} from '@coveo/headless';
import {headlessEngine} from '../Engine';
import {Box, Divider} from '@material-ui/core';

export default class QuerySummary extends React.Component {
  private headlessQuerySummary: QuerySummaryType;
  state: QuerySummaryState;

  constructor(props: {}) {
    super(props);

    this.headlessQuerySummary = buildQuerySummary(headlessEngine);

    this.state = this.headlessQuerySummary.state;
  }

  componentDidMount() {
    this.headlessQuerySummary.subscribe(() => this.updateState());
  }

  updateState() {
    this.setState(this.headlessQuerySummary.state);
  }

  renderNoResults() {
    return <Box mt={5}>No results</Box>;
  }

  renderBold(input: string) {
    return (
      <Box component="span">
        <strong>{input}</strong>
      </Box>
    );
  }

  renderRange() {
    return this.renderBold(
      ` ${this.state.firstResult}-${this.state.lastResult}`
    );
  }

  renderTotal() {
    return (
      <Box component="span">
        {' '}
        of {this.renderBold(this.state.total.toString())}
      </Box>
    );
  }

  renderQuery() {
    if (this.state.hasQuery) {
      return (
        <Box component="span"> for {this.renderBold(this.state.query)}</Box>
      );
    }
  }

  renderDuration() {
    return ` in ${this.state.durationInSeconds} seconds`;
  }

  renderHasResults() {
    return (
      <Box>
        <Box fontWeight="fontWeightBold">
          Results{this.renderRange()}
          {this.renderTotal()}
          {this.renderQuery()}
          {this.renderDuration()}
        </Box>
        <Divider />
      </Box>
    );
  }

  render() {
    if (!this.state.hasResults) {
      return this.renderNoResults();
    }
    return this.renderHasResults();
  }
}
