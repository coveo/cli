import {
  pathExists,
  createFileSync,
  writeJSONSync,
  readJSONSync,
} from 'fs-extra';
import {join} from 'path';
import {mocked} from 'ts-jest/utils';
import {Config} from './config';
jest.mock('fs-extra');
const mockedPathExists = mocked(pathExists);
const mockedCreateFile = mocked(createFileSync);
const mockedWriteJSON = mocked(writeJSONSync);
const mockedReadJSON = mocked(readJSONSync);

describe('config', () => {
  beforeEach(() => {
    mockedReadJSON.mockImplementation(() => {});
  });

  it('should ensure config file exists', async () => {
    await new Config('foo/bar').get();
    expect(mockedPathExists).toHaveBeenCalledWith(
      join('foo', 'bar', 'config.json')
    );
  });

  it('should create config file when it does not exists', async () => {
    mockedPathExists.mockImplementationOnce(() => Promise.resolve(false));
    await new Config('foo/bar').get();
    expect(mockedCreateFile).toHaveBeenCalledWith(
      join('foo', 'bar', 'config.json')
    );
    expect(mockedWriteJSON).toHaveBeenCalledWith(
      join('foo', 'bar', 'config.json'),
      expect.objectContaining({})
    );
  });

  it('should not create config file when it does exists', async () => {
    mockedPathExists.mockImplementationOnce(() => Promise.resolve(true));
    await new Config('foo/bar').get();
    expect(mockedCreateFile).not.toHaveBeenCalled();
    expect(mockedWriteJSON).not.toHaveBeenCalled();
  });

  describe('when the config file exists', () => {
    beforeEach(() => {
      mockedPathExists.mockImplementationOnce(() => Promise.resolve(true));
    });

    it('should return the config if no error', async () => {
      const someConfig = {foo: 'bar'};
      mockedReadJSON.mockImplementationOnce(() => someConfig);
      const cfg = await new Config('foo/bar').get();
      expect(cfg).toBe(someConfig);
    });

    it('should create default config on error', async () => {
      mockedReadJSON.mockReturnValueOnce(new Error('oh noes'));
      await new Config('foo/bar').get();
      expect(mockedWriteJSON).toHaveBeenCalledWith(
        join('foo', 'bar', 'config.json'),
        expect.objectContaining({})
      );
    });

    it('should write config on replace', async () => {
      const theNewConfig = {
        environment: 'prod' as const,
        region: 'us-east-1' as const,
        organization: 'foo',
        analyticsEnabled: true,
        accessToken: 'the-token',
      };
      await new Config('foo/bar').replace(theNewConfig);
      expect(mockedWriteJSON).toHaveBeenCalledWith(
        join('foo', 'bar', 'config.json'),
        theNewConfig
      );
    });

    it('should write config on set', async () => {
      mockedReadJSON.mockImplementationOnce(() => ({hello: 'world'}));
      await new Config('foo/bar').set('environment', 'dev');
      expect(mockedWriteJSON).toHaveBeenCalledWith(
        join('foo', 'bar', 'config.json'),
        expect.objectContaining({
          hello: 'world',
          environment: 'dev',
        })
      );
    });
  });
});
