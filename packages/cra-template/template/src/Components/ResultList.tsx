import React from 'react';
import List from '@material-ui/core/List';
import {ListItem, Box, Typography, ListItemProps} from '@material-ui/core';
import {
  buildResultList,
  ResultTemplatesManager,
  Result,
  ResultListState,
  ResultList as ResultListType,
  buildResultTemplatesManager,
} from '@coveo/headless';
import {headlessEngine} from '../Engine';

type Template = (result: Result) => unknown;

interface FieldValueInterface {
  value: string;
  caption: string;
}

interface ListItemLink extends ListItemProps {
  title: string;
  href: string;
}

function ListItemLink(props: ListItemLink) {
  return (
    <ListItem style={{padding: 0}} component="a" {...(props as unknown)}>
      <Typography variant="body1" color="primary">
        {props.title}
      </Typography>
    </ListItem>
  );
}

function FieldValue(props: FieldValueInterface) {
  return (
    <Box>
      <Typography
        color="textSecondary"
        style={{fontWeight: 'bold'}}
        variant="caption"
      >
        {props.caption}:&nbsp;
      </Typography>
      <Typography color="textSecondary" variant="caption">
        {props.value}
      </Typography>
    </Box>
  );
}

export default class ResultList extends React.Component {
  private headlessResultList: ResultListType;
  private headlessResultTemplateManager: ResultTemplatesManager<Template>;
  state: ResultListState;

  constructor(props: {}) {
    super(props);

    this.headlessResultList = buildResultList(headlessEngine);

    this.state = this.headlessResultList.state;

    this.headlessResultTemplateManager = buildResultTemplatesManager(
      headlessEngine
    );
    this.headlessResultTemplateManager.registerTemplates({
      conditions: [],
      content: (result: Result) => (
        <ListItem disableGutters key={result.uniqueId}>
          <Box my={2}>
            <Box pb={1}>
              <ListItemLink
                disableGutters
                title={result.title}
                href={result.clickUri}
              />
            </Box>

            {result.excerpt && (
              <Box pb={1}>
                <Typography color="textPrimary" variant="body2">
                  {result.excerpt}
                </Typography>
              </Box>
            )}

            {result.raw.source && (
              <FieldValue caption="Source" value={result.raw.source} />
            )}
            {result.raw.objecttype && (
              <FieldValue caption="Object Type" value={result.raw.objecttype} />
            )}
          </Box>
        </ListItem>
      ),
    });
  }

  componentDidMount() {
    this.headlessResultList.subscribe(() => this.updateState());
  }

  updateState() {
    this.setState(this.headlessResultList.state);
  }

  render() {
    return (
      <List>
        {this.state.results.map((result: Result) => {
          const template = this.headlessResultTemplateManager.selectTemplate(
            result
          );
          return template ? template(result) : null;
        })}
      </List>
    );
  }
}
