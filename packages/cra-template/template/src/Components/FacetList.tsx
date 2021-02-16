import React from 'react';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Facet from './Facet';

export default class FacetList extends React.Component {
  render() {
    return (
      <Box>
        <Box px={1} pb={1}>
          <Typography variant="overline">Refine By</Typography>
        </Box>
        <Facet field="objecttype" title="Object Type" />
        <Facet field="filetype" title="File Type" />
        <Facet field="author" title="Author" />
      </Box>
    );
  }
}
