import React from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import {
  buildSearchBox,
  SearchBoxState,
  SearchBox as SearchBoxType,
} from '@coveo/headless';
import {headlessEngine} from '../Engine';

export default class SearchBox extends React.Component {
  private headlessSearchBox: SearchBoxType;
  state: SearchBoxState;

  constructor(props: any) {
    super(props);

    this.headlessSearchBox = buildSearchBox(headlessEngine);
    this.state = this.headlessSearchBox.state;
  }

  componentDidMount() {
    this.headlessSearchBox.subscribe(() => this.updateState());
  }

  updateState() {
    this.setState(this.headlessSearchBox.state);
  }

  render() {
    return (
      <Autocomplete
        inputValue={this.state.value}
        onInputChange={(_, newInputValue) => {
          this.headlessSearchBox.updateText(newInputValue);
        }}
        onChange={() => {
          this.headlessSearchBox.submit();
        }}
        options={this.state.suggestions.map(
          (suggestion: any) => suggestion.rawValue
        )}
        freeSolo
        style={{width: 'auto'}}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Search"
            variant="outlined"
            size="small"
          />
        )}
      />
    );
  }
}
