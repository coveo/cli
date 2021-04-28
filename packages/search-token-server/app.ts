import * as express from 'express';
import {ensureTokenGenerated} from './middlewares/searchToken';
import {errorHandler} from './middlewares/errorHandler';
import {environmentCheck} from './middlewares/environmentCheck';

const app = express();

app.use(express.json());

app.get('/token', environmentCheck, ensureTokenGenerated, (req, res) => {
  res.json({token: req.token});
});

app.use(errorHandler);

export default app;
