import {FunctionComponent, useEffect, useState, useContext} from 'react';
import {Facet as HeadlessFacet, buildFacet, FacetValue} from '@coveo/headless';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import './Facet.css';
import {Divider, ListItem, ListItemText, Typography} from '@mui/material';
import EngineContext from '../common/engineContext';

interface FacetProps {
  title: string;
  field: string;
}

interface FacetRendererProps extends FacetProps {
  controller: HeadlessFacet;
}

const FacetRenderer: FunctionComponent<FacetRendererProps> = (props) => {
  const {controller} = props;
  const [state, setState] = useState(controller.state);

  useEffect(
    () => controller.subscribe(() => setState(controller.state)),
    [controller]
  );

  const toggleSelect = (value: FacetValue) => {
    controller.toggleSelect(value);
  };

  const showMore = () => {
    controller.showMoreValues();
  };

  const showLess = () => {
    controller.showLessValues();
  };

  return (
    <Box mb={5} mr={3} p={1}>
      <Box pb={1}>
        <Typography variant="h6" component="h6">
          {props.title}
        </Typography>
      </Box>
      <Divider />
      <List dense>
        {state.values.map((value: FacetValue) => {
          const labelId = `checkbox-list-label-${value}`;

          return (
            <ListItem
              style={{padding: 0}}
              key={value.value}
              role={undefined}
              button
              onClick={() => toggleSelect(value)}
            >
              <Checkbox
                size="small"
                edge="start"
                checked={controller.isValueSelected(value)}
                tabIndex={-1}
                disableRipple
                inputProps={{'aria-labelledby': labelId}}
              />
              <ListItemText
                className="truncate inline"
                primary={`${value.value}`}
                secondary={`(${value.numberOfResults})`}
              />
            </ListItem>
          );
        })}
      </List>
      {state.canShowLessValues && (
        <Button size="small" onClick={() => showLess()}>
          Show Less
        </Button>
      )}
      {state.canShowMoreValues && (
        <Button size="small" onClick={() => showMore()}>
          Show More
        </Button>
      )}
    </Box>
  );
};

const Facet: FunctionComponent<FacetProps> = (props) => {
  const engine = useContext(EngineContext)!;
  const controller: HeadlessFacet = buildFacet(engine, {
    options: {
      numberOfValues: 5,
      field: props.field,
    },
  });
  return <FacetRenderer {...props} controller={controller} />;
};

export default Facet;
