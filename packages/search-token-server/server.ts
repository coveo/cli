/* eslint-disable @typescript-eslint/no-namespace */
import * as express from 'express';
import {ensureTokenGenerated} from './middlewares/searchToken';
import {config} from 'dotenv';
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

app.get('/token', ensureTokenGenerated, (req, res) => {
  res.send({token: req.token});
});

// start our server on port 3000
app.listen(3000, '127.0.0.1', () => {
  console.log('Server now listening on 3000');
});
