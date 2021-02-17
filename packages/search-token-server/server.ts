/* eslint-disable @typescript-eslint/no-namespace */
import * as express from 'express';
import {ensureTokenGenerated} from './middlewares/searchToken';
import {config} from 'dotenv';
import {errorHandler} from './middlewares/errorHandler';
import {environmentCheck} from './middlewares/environmentCheck';
config();

const app = express();
const port = 3000;

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

// start our server on port 3000
app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
