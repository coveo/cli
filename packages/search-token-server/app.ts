import * as express from 'express';
import * as cors from 'cors';
import {ensureTokenGenerated} from './middlewares/searchToken';
import {errorHandler} from './middlewares/errorHandler';
import {environmentCheck} from './middlewares/environmentCheck';

const app = express();

app.use(express.json());
app.use(cors());

app.get<Record<string, string>, any, {token: string}>(
  '/token',
  environmentCheck,
  ensureTokenGenerated,
  (req, res) => {
    res.json({token: req.body.token});
  }
);

app.use(errorHandler);

export default app;
