import express from 'express';
import cors from 'cors';
import cookieSession from 'cookie-session';
import csurf from 'csurf';
import helmet from 'helmet';
import {ensureTokenGenerated} from './middlewares/searchToken';
import {errorHandler} from './middlewares/errorHandler';
import {environmentCheck} from './middlewares/environmentCheck';
import {TokenRequestHandler} from './types';

const app = express();
const sendToken: TokenRequestHandler = (_req, res) => {
  res.json({token: res.locals.token});
};

app.use(express.json());
app.use(cors());
app.use(cookieSession({keys: ['key1', 'key2']}));
app.use(csurf());
app.use(helmet());

app.get('/token', environmentCheck, ensureTokenGenerated, sendToken);

app.use(errorHandler);

export default app;
