import {FunctionComponent, useEffect, useState, useContext} from 'react';
import {Facet as HeadlessFacet, buildFacet, FacetValue} from '@coveo/headless';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Box from '@material-ui/core/Box';
import List from '@material-ui/core/List';
import './Facet.css';
import {Divider, ListItem, ListItemText, Typography} from '@material-ui/core';
import EngineContext from '../common/engineContext';

interface FacetProps {
  title: string;
  field: string;
}

interface FacetRendererProps extends FacetProps {
  controller: HeadlessFacet;
}

const FacetRenderer: FunctionComponent<FacetRendererProps> = (props) => {
  const [state, setState] = useState(props.controller.state);

  useEffect(
    () => props.controller.subscribe(() => setState(props.controller.state)),
    [props.controller]
  );

  const toggleSelect = (value: FacetValue) => {
    props.controller.toggleSelect(value);
  };

  const showMore = () => {
    props.controller.showMoreValues();
  };

  const showLess = () => {
    props.controller.showLessValues();
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
                checked={props.controller.isValueSelected(value)}
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
