import React from 'react';
import {
  Sort as SortType,
  SortState,
  buildSort,
  buildRelevanceSortCriterion,
  buildDateSortCriterion,
  SortOrder,
  SortByRelevancy,
  SortByDate,
} from '@coveo/headless';
import {headlessEngine} from '../Engine';
import Box from '@material-ui/core/Box';
import FormControl from '@material-ui/core/FormControl';
import {InputLabel, MenuItem, Select} from '@material-ui/core';

export default class Sort extends React.Component {
  private headlessSort: SortType;
  state: SortState;
  relevanceSortCriterion: SortByRelevancy = buildRelevanceSortCriterion();
  dateDescendingSortCriterion: SortByDate = buildDateSortCriterion(
    SortOrder.Descending
  );
  dateAscendingSortCriterion: SortByDate = buildDateSortCriterion(
    SortOrder.Ascending
  );

  constructor(props: any) {
    super(props);

    this.headlessSort = buildSort(headlessEngine, {
      initialState: {
        criterion: this.relevanceSortCriterion,
      },
    });

    this.state = this.headlessSort.state;
  }

  componentDidMount() {
    this.headlessSort.subscribe(() => this.updateState());
  }

  updateState() {
    this.setState(this.headlessSort.state);
  }

  handleChange(event: any) {
    switch (event.target.value) {
      case 'relevance':
        this.headlessSort.sortBy(this.relevanceSortCriterion);
        break;
      case 'datedescending':
        this.headlessSort.sortBy(this.dateDescendingSortCriterion);
        break;
      default:
        this.headlessSort.sortBy(this.dateAscendingSortCriterion);
        break;
    }
  }

  render() {
    return (
      <Box>
        <FormControl>
          <InputLabel id="sort-by-label">Sort by</InputLabel>
          <Select
            labelId="sort-by-label"
            id="sort-by"
            onChange={(event: any) => this.handleChange(event)}
            defaultValue="relevance"
          >
            <MenuItem value="relevance">Relevance</MenuItem>
            <MenuItem value="datedescending">Date Descending</MenuItem>
            <MenuItem value="dateascending">Date Ascending</MenuItem>
          </Select>
        </FormControl>
      </Box>
    );
  }
}
