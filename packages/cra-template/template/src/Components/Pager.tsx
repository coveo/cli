import {FunctionComponent, useEffect, useState, useContext} from 'react';
import {Pagination} from '@material-ui/lab';
import {buildPager, Pager as HeadlessPager} from '@coveo/headless';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import EngineContext from '../common/engineContext';

interface PagerProps {
  controller: HeadlessPager;
}

const PagerRenderer: FunctionComponent<PagerProps> = (props) => {
  const {controller} = props;
  const [state, setState] = useState(controller.state);

  useEffect(
    () => controller.subscribe(() => setState(controller.state)),
    [controller]
  );

  const setPage = (pageNumber: number) => {
    controller.selectPage(pageNumber);
  };

  return (
    <Box>
      <Typography gutterBottom>Current page</Typography>
      <Pagination
        page={state.currentPage}
        count={state.maxPage}
        onChange={(e, page) => setPage(page)}
        variant="outlined"
        shape="rounded"
        size="small"
      />
    </Box>
  );
};

const Pager = () => {
  const engine = useContext(EngineContext)!;
  const controller = buildPager(engine, {
    options: {numberOfPages: 3},
  });

  return <PagerRenderer controller={controller} />;
};

export default Pager;
