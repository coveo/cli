import React from 'react';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import Typography from '@material-ui/core/Typography';
import {
  buildResultsPerPage,
  ResultsPerPageState,
  ResultsPerPage as ResultPerPageType,
} from '@coveo/headless';
import {IEngineProp} from '../common/Engine';

export default class ResultsPerPage extends React.Component<IEngineProp> {
  private headlessResultsPerPage: ResultPerPageType;
  state: ResultsPerPageState;

  constructor(props: any) {
    super(props);

    this.headlessResultsPerPage = buildResultsPerPage(this.props.engine, {
      initialState: {numberOfResults: 10},
    });

    this.state = this.headlessResultsPerPage.state;
  }

  componentDidMount() {
    this.headlessResultsPerPage.subscribe(() => this.updateState());
  }

  updateState() {
    this.setState(this.headlessResultsPerPage.state);
  }

  render() {
    return (
      <FormControl component="fieldset">
        <Typography>Results per page</Typography>
        <RadioGroup
          row
          name="test"
          defaultValue="10"
          onChange={(event) => {
            this.headlessResultsPerPage.set(parseInt(event.target.value, 10));
          }}
        >
          <FormControlLabel value="5" control={<Radio />} label="5" />
          <FormControlLabel value="10" control={<Radio />} label="10" />
          <FormControlLabel value="15" control={<Radio />} label="15" />
        </RadioGroup>
      </FormControl>
    );
  }
}
