import React from 'react';
import {
  Facet as FacetType,
  FacetState,
  buildFacet,
  FacetValue,
} from '@coveo/headless';
import {IEngineProp} from '../common/Engine';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Box from '@material-ui/core/Box';
import List from '@material-ui/core/List';
import './Facet.css';
import {Divider, ListItem, ListItemText, Typography} from '@material-ui/core';

interface IFacetProps extends IEngineProp {
  title: string;
  field: string;
}

export default class Facet extends React.Component<IFacetProps, {}> {
  private headlessFacet: FacetType;
  state: FacetState;

  constructor(props: any) {
    super(props);
    this.headlessFacet = buildFacet(this.props.engine, {
      options: {
        numberOfValues: 5,
        field: this.props.field,
      },
    });

    this.state = this.headlessFacet.state;
  }

  componentDidMount() {
    this.headlessFacet.subscribe(() => this.updateState());
  }

  componentWillUnmount() {
    this.headlessFacet.subscribe(() => {});
  }

  updateState() {
    this.setState(this.headlessFacet.state);
  }

  toggleSelect(value: FacetValue) {
    this.headlessFacet.toggleSelect(value);
  }

  showMore() {
    this.headlessFacet.showMoreValues();
  }

  showLess() {
    this.headlessFacet.showLessValues();
  }

  render() {
    return (
      <Box mb={5} mr={3} p={1}>
        <Box pb={1}>
          <Typography variant="h6" component="h6">
            {this.props.title}
          </Typography>
        </Box>
        <Divider />
        <List dense>
          {this.state.values.map((value: FacetValue) => {
            const labelId = `checkbox-list-label-${value}`;

            return (
              <ListItem
                style={{padding: 0}}
                key={value.value}
                role={undefined}
                button
                onClick={() => this.toggleSelect(value)}
              >
                <Checkbox
                  size="small"
                  edge="start"
                  checked={this.headlessFacet.isValueSelected(value)}
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
        {this.state.canShowLessValues && (
          <Button size="small" onClick={() => this.showLess()}>
            Show Less
          </Button>
        )}
        {this.state.canShowMoreValues && (
          <Button size="small" onClick={() => this.showMore()}>
            Show More
          </Button>
        )}
      </Box>
    );
  }
}
