import express from 'express';
import cors from 'cors';
import cookieSession from 'cookie-session';
/**
 * Note: `csurf` is deprecated and has a known vulnerability.
 * Check https://snyk.io/blog/explaining-the-csurf-vulnerability-csrf-attacks-on-all-versions/ for more information & alternatives.
 */
import csurf from 'csurf';
import helmet from 'helmet';
import {ensureTokenGenerated} from './middlewares/searchToken';
import {errorHandler} from './middlewares/errorHandler';
import {environmentCheck} from './middlewares/environmentCheck';

const app = express();

app.use(express.json());
app.use(cors());
app.use(cookieSession({keys: ['key1', 'key2']}));
app.use(csurf());
app.use(helmet());

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
