import {pathExists, createFile, writeJSON, readJSON} from 'fs-extra';
import {mocked} from 'ts-jest/utils';
import {Config} from './config';
jest.mock('fs-extra');
const mockedPathExists = mocked(pathExists);
const mockedCreateFile = mocked(createFile);
const mockedWriteJSON = mocked(writeJSON);
const mockedReadJSON = mocked(readJSON);

describe('config', () => {
  beforeEach(() => {
    mockedReadJSON.mockImplementation(() => Promise.resolve({}));
  });
  it('should ensure config file exists', async () => {
    await new Config('foo/bar').get();
    expect(mockedPathExists).toHaveBeenCalledWith('foo/bar/config.json');
  });

  it('should create config file when it does not exists', async () => {
    mockedPathExists.mockImplementationOnce(() => Promise.resolve(false));
    await new Config('foo/bar').get();
    expect(mockedCreateFile).toHaveBeenCalledWith('foo/bar/config.json');
    expect(mockedWriteJSON).toHaveBeenCalledWith(
      'foo/bar/config.json',
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
      mockedReadJSON.mockImplementationOnce(() => Promise.resolve(someConfig));
      const cfg = await new Config('foo/bar').get();
      expect(cfg).toBe(someConfig);
    });

    it('should create default config on error', async () => {
      mockedReadJSON.mockImplementationOnce(() => Promise.reject('oh noes'));
      await new Config('foo/bar').get();
      expect(mockedWriteJSON).toHaveBeenCalledWith(
        'foo/bar/config.json',
        expect.objectContaining({})
      );
    });

    it('should write config on replace', async () => {
      const theNewConfig = {
        environment: 'prod' as const,
        region: 'us-east-1' as const,
        organization: 'foo',
      };
      await new Config('foo/bar').replace(theNewConfig);
      expect(mockedWriteJSON).toHaveBeenCalledWith(
        'foo/bar/config.json',
        theNewConfig
      );
    });

    it('should write config on set', async () => {
      mockedReadJSON.mockImplementationOnce(() => ({hello: 'world'}));
      await new Config('foo/bar').set('environment', 'dev');
      expect(mockedWriteJSON).toHaveBeenCalledWith(
        'foo/bar/config.json',
        expect.objectContaining({
          hello: 'world',
          environment: 'dev',
        })
      );
    });
  });
});
