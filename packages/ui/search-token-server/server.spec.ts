jest.mock('@coveo/platform-client');
jest.mock('./middlewares/searchToken', () => {
  const originalMiddleware = jest.requireActual('./middlewares/searchToken');
  const oldMiddleware = originalMiddleware.ensureTokenGenerated;

  originalMiddleware.ensureTokenGenerated = function (
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    mockedMiddleware(req, res, next);
    oldMiddleware(req, res, next);
  };

  return originalMiddleware;
});

import {agent} from 'supertest';
import app from './app';
import {Request, Response, NextFunction} from 'express';
import PlatformClient, {RestUserIdType} from '@coveo/platform-client';

const mockedPlatformClient = jest.mocked(PlatformClient);
const mockedCreateToken = jest.fn();
const mockedMiddleware = jest.fn();

describe('server', () => {
  const OLD_ENV = process.env;

  const setInvalidEnvironmentVariables = () => {
    process.env.ORGANIZATION_ID = undefined;
    process.env.API_KEY = undefined;
    process.env.USER_EMAIL = undefined;
  };

  const setValidEnvironmentVariables = () => {
    process.env.PLATFORM_URL = 'https://platform.cloud.coveo.com';
    process.env.ORGANIZATION_ID = 'my-org';
    process.env.API_KEY = 'xxx';
    process.env.USER_EMAIL = 'bob@coveo.com';
  };

  const triggerAMiddlewareError = () => {
    mockedMiddleware.mockImplementationOnce(
      (_req: Request, _res: Response, next: NextFunction) => {
        const err: Error = new Error();
        next(err);
      }
    );
  };

  const resetAppLocals = () => {
    mockedMiddleware.mockImplementationOnce(
      (req: Request, _res: Response, _next: NextFunction) => {
        delete req.app.locals.platform;
      }
    );
  };

  const doMockPlatformClient = () => {
    mockedPlatformClient.mockImplementation(
      () =>
        ({
          search: {
            createToken: mockedCreateToken,
          },
        } as unknown as PlatformClient)
    );
  };

  beforeEach(() => {
    jest.resetModules();
    process.env = {...OLD_ENV};
    doMockPlatformClient();
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  describe('when an unknown error happens', () => {
    beforeEach(() => {
      setValidEnvironmentVariables();
      triggerAMiddlewareError();
    });

    it('should return a generic error message', async () => {
      const res = await agent(app).get('/token');
      expect(res.body.message).toEqual('Something broke!');
    });
  });

  describe('when required environment variables are missing', () => {
    beforeEach(() => {
      setInvalidEnvironmentVariables();
    });

    it('should return a JSON response', async () => {
      await agent(app).get('/token').expect('Content-Type', /json/);
    });

    it('should return an error with a message', async () => {
      const res = await agent(app).get('/token');

      expect(res.serverError).toBeTruthy();
      expect(res.body.message).toEqual(
        'Make sure to configure the environment variables in the ".env" file. Refer to the README to set up the server.'
      );
    });
  });

  describe('when the API key does not have the right privileges', () => {
    beforeEach(() => {
      setValidEnvironmentVariables();

      mockedCreateToken.mockRejectedValueOnce({
        statusCode: 403,
        message: 'Forbidden',
        type: 'AccessDeniedException',
      });
    });

    it('it should return an error', async () => {
      const res = await agent(app).get('/token');
      expect(res.status).toBe(403);
      expect(res.body).not.toHaveProperty('token');
    });
  });

  describe('when the environment variables are correctly set', () => {
    beforeEach(() => {
      setValidEnvironmentVariables();
      resetAppLocals();

      mockedCreateToken.mockResolvedValueOnce({
        token: 'this.is.a.search.token',
      });
    });

    it('should correctly initialize the #platformClient based on environment variables', async () => {
      await agent(app).get('/token');
    });

    it('should correctly initialize the #platformClient based on environment variables', async () => {
      await agent(app).get('/token');
      expect(mockedPlatformClient).toHaveBeenLastCalledWith(
        expect.objectContaining({
          accessToken: 'xxx',
          host: 'https://platform.cloud.coveo.com',
          organizationId: 'my-org',
        })
      );
    });

    it('should return JSON response', async () => {
      await agent(app).get('/token').expect('Content-Type', /json/);
    });

    it('should not create multiple instances of #platformClient', async () => {
      await agent(app).get('/token');
      await agent(app).get('/token');
      await agent(app).get('/token');
      expect(mockedPlatformClient).toHaveBeenCalledTimes(1);
    });

    it('should correctly call #createToken with the appropriate arguments', async () => {
      await agent(app).get('/token');
      expect(mockedCreateToken).toHaveBeenLastCalledWith(
        expect.objectContaining({
          userIds: [
            {
              name: 'bob@coveo.com',
              provider: 'Email Security Provider',
              type: RestUserIdType.User,
            },
          ],
        })
      );
    });

    it('should return a search token', async () => {
      const res = await agent(app).get('/token');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({token: 'this.is.a.search.token'});
    });
  });
});
