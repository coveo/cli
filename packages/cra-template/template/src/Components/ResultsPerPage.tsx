import {FunctionComponent, useEffect, useState, useContext} from 'react';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import Typography from '@material-ui/core/Typography';
import {
  buildResultsPerPage,
  ResultsPerPage as HeadlessResultsPerPage,
} from '@coveo/headless';
import EngineContext from '../common/engineContext';

interface ResultsPerPageProps {
  options: number[];
  controller: HeadlessResultsPerPage;
}
const ResultsPerPageRenderer: FunctionComponent<ResultsPerPageProps> = (
  props
) => {
  const {controller, options} = props;
  const [state, setState] = useState(controller.state);

  useEffect(
    () => controller.subscribe(() => setState(controller.state)),
    [controller]
  );

  return (
    <FormControl component="fieldset">
      <Typography>Results per page</Typography>
      <RadioGroup
        row
        value={state.numberOfResults}
        onChange={(event) => {
          controller.set(parseInt(event.target.value, 10));
        }}
      >
        {options.map((numberOfResults) => (
          <FormControlLabel
            key={numberOfResults}
            value={numberOfResults}
            control={<Radio />}
            label={numberOfResults}
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
};

const ResultsPerPage = () => {
  const engine = useContext(EngineContext)!;
  const options = [5, 10, 25];
  const controller = buildResultsPerPage(engine, {
    initialState: {numberOfResults: options[0]},
  });
  return <ResultsPerPageRenderer controller={controller} options={options} />;
};
export default ResultsPerPage;
