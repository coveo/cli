import React from 'react';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Facet from './Facet';
import {IEngineProp} from '../common/Engine';

export default class FacetList extends React.Component<IEngineProp> {
  render() {
    return (
      <Box>
        <Box px={1} pb={1}>
          <Typography variant="overline">Refine By</Typography>
        </Box>
        <Facet {...this.props} field="objecttype" title="Object Type" />
        <Facet {...this.props} field="filetype" title="File Type" />
        <Facet {...this.props} field="author" title="Author" />
      </Box>
    );
  }
}
