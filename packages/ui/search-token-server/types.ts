import {RequestHandler} from 'express';
import {ParamsDictionary} from 'express-serve-static-core';

export type TokenResponseBody = {
  token: string;
};

export type TokenLocals = {
  token: string;
};

export type TokenRequestHandler = RequestHandler<
  ParamsDictionary,
  TokenResponseBody,
  unknown,
  unknown,
  TokenLocals
>;
