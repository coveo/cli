/* eslint-disable @typescript-eslint/no-namespace */
import * as express from 'express';
import {ensureTokenGenerated} from './middlewares/searchToken';
import {config} from 'dotenv';
import {errorHandler} from './middlewares/errorHandler';
import {environmentCheck} from './middlewares/environmentCheck';
config();

const app = express();

declare global {
  namespace Express {
    interface Request {
      token: string;
    }
  }
}

app.use(express.json());

app.get('/token', environmentCheck, ensureTokenGenerated, (req, res) => {
  res.send({token: req.token});
});

app.use(errorHandler);

app.listen(process.env.SERVER_PORT, () => {
  console.log(`Listening at http://localhost:${process.env.SERVER_PORT}`);
});
