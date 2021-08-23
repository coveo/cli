import {
  pathExistsSync,
  createFileSync,
  writeJSONSync,
  readJSONSync,
} from 'fs-extra';
import {join} from 'path';
import {mocked} from 'ts-jest/utils';
import {defaultConfiguration} from '../../__stub__/configuration';
import {PlatformEnvironment} from '../platform/environment';
import {Config} from './config';
jest.mock('fs-extra');
const mockedPathExists = mocked(pathExistsSync);
const mockedCreateFile = mocked(createFileSync);
const mockedWriteJSON = mocked(writeJSONSync);
const mockedReadJSON = mocked(readJSONSync);

describe('config', () => {
  beforeEach(() => {
    mockedReadJSON.mockImplementation(() => {});
  });

  it('should ensure config file exists', async () => {
    new Config('foo/bar').get();
    expect(mockedPathExists).toHaveBeenCalledWith(
      join('foo', 'bar', 'config.json')
    );
  });

  it('should create config file when it does not exists', async () => {
    mockedPathExists.mockImplementationOnce(() => false);
    new Config('foo/bar').get();
    expect(mockedCreateFile).toHaveBeenCalledWith(
      join('foo', 'bar', 'config.json')
    );
    expect(mockedWriteJSON).toHaveBeenCalledWith(
      join('foo', 'bar', 'config.json'),
      expect.objectContaining({})
    );
  });

  it('should not create config file when it does exists and its version is compatible', async () => {
    const someConfig = {version: Config.CurrentSchemaVersion};
    mockedReadJSON.mockImplementationOnce(() => someConfig);
    mockedPathExists.mockImplementationOnce(() => true);

    new Config('foo/bar').get();

    expect(mockedCreateFile).not.toHaveBeenCalled();
    expect(mockedWriteJSON).not.toHaveBeenCalled();
  });

  describe('when the config file exists', () => {
    beforeEach(() => {
      mockedPathExists.mockImplementationOnce(() => true);
    });

    it('should return the config if no error', async () => {
      const someConfig = {foo: 'bar', version: Config.CurrentSchemaVersion};
      mockedReadJSON.mockImplementationOnce(() => someConfig);

      const cfg = new Config('foo/bar').get();

      expect(cfg).toBe(someConfig);
    });

    it('should create default config if the config version is incompatible', () => {
      const someConfig = {foo: 'bar', version: '0.0.0'};
      const errorSpy = jest.fn();
      mockedReadJSON.mockImplementationOnce(() => someConfig);

      new Config('foo/bar', errorSpy).get();

      expect(mockedWriteJSON).toHaveBeenCalledWith(
        join('foo', 'bar', 'config.json'),
        expect.objectContaining({})
      );

      expect(errorSpy).toBeCalledWith(
        `The configuration at ${join(
          'foo',
          'bar',
          'config.json'
        )} is not compatible with this version of the CLI`
      );
    });

    it('should create default config on error', async () => {
      mockedReadJSON.mockReturnValueOnce(new Error('oh noes'));
      new Config('foo/bar').get();
      expect(mockedWriteJSON).toHaveBeenCalledWith(
        join('foo', 'bar', 'config.json'),
        expect.objectContaining({})
      );
    });

    it('should write config on replace', async () => {
      const theNewConfig = {...defaultConfiguration};
      new Config('foo/bar').replace(theNewConfig);
      expect(mockedWriteJSON).toHaveBeenCalledWith(
        join('foo', 'bar', 'config.json'),
        theNewConfig
      );
    });

    it('should write config on set', async () => {
      mockedReadJSON.mockImplementationOnce(() => ({
        hello: 'world',
        version: Config.CurrentSchemaVersion,
      }));
      new Config('foo/bar').set('environment', PlatformEnvironment.Dev);
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
