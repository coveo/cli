const mockedSemverSatisifies = jest.fn();
jest.mock('semver', () => ({
  ...jest.requireActual('semver'),
  satisfies: mockedSemverSatisifies,
}));
jest.mock('./configErrors');
jest.mock('fs-extra');
jest.mock('@oclif/core');

import {
  pathExistsSync,
  createFileSync,
  writeJSONSync,
  readJSONSync,
} from 'fs-extra';
import {join} from 'path';
import dedent from 'ts-dedent';
import {defaultConfiguration} from '../../__stub__/configuration';
import {PlatformEnvironment} from '../platform/environment';
import {Config} from './config';
import {IncompatibleConfigurationError} from './configErrors';
import {fancyIt} from '../../__test__/it';
import {CliUx} from '@oclif/core';

const mockedUxError = jest.mocked(CliUx.ux.error);
const mockedPathExists = jest.mocked(pathExistsSync);
const mockedCreateFile = jest.mocked(createFileSync);
const mockedWriteJSON = jest.mocked(writeJSONSync);
const mockedIncompatibleConfigurationError = jest.mocked(
  IncompatibleConfigurationError,
  true
);
const mockedReadJSON = jest.mocked(readJSONSync);

describe('config', () => {
  beforeEach(() => {
    mockedReadJSON.mockImplementation(() => {});
    mockedSemverSatisifies.mockReturnValue(true);
  });

  fancyIt()('should ensure config file exists', async () => {
    new Config('foo/bar').get();
    expect(mockedPathExists).toHaveBeenCalledWith(
      join('foo', 'bar', 'config.json')
    );
  });

  fancyIt()('should create config file when it does not exists', async () => {
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

  fancyIt()(
    'should not create config file when it does exists and its version is compatible',
    async () => {
      const someConfig = {version: Config.CurrentSchemaVersion};
      mockedReadJSON.mockImplementationOnce(() => someConfig);
      mockedPathExists.mockImplementationOnce(() => true);

      new Config('foo/bar').get();

      expect(mockedCreateFile).not.toHaveBeenCalled();
      expect(mockedWriteJSON).not.toHaveBeenCalled();
    }
  );

  describe('when the config file exists', () => {
    beforeEach(() => {
      mockedPathExists.mockImplementationOnce(() => true);
    });

    fancyIt()('should return the config if no error', async () => {
      const someConfig = {foo: 'bar', version: Config.CurrentSchemaVersion};
      mockedReadJSON.mockImplementationOnce(() => someConfig);

      const cfg = new Config('foo/bar').get();

      expect(cfg).toBe(someConfig);
    });

    fancyIt()(
      'should create default config if the config version is incompatible',
      () => {
        const someConfig = {foo: 'bar', version: '0.0.0'};
        mockedReadJSON.mockImplementationOnce(() => someConfig);
        mockedSemverSatisifies.mockReturnValueOnce(false);
        mockedIncompatibleConfigurationError.mockImplementationOnce(() => {
          const err = new IncompatibleConfigurationError('');
          err.message = 'some message';
          return err;
        });
        new Config('foo/bar').get();

        expect(mockedWriteJSON).toHaveBeenCalledWith(
          join('foo', 'bar', 'config.json'),
          expect.objectContaining({})
        );
        expect(mockedIncompatibleConfigurationError).toBeCalledWith('0.0.0');
        expect(mockedUxError).toBeCalledWith(
          dedent`
          The configuration at ${join(
            'foo',
            'bar',
            'config.json'
          )} is not compatible with this version of the CLI:
          some message
          `,
          {exit: false}
        );
      }
    );

    fancyIt()('should create default config on error', async () => {
      mockedReadJSON.mockReturnValueOnce(new Error('oh noes'));
      new Config('foo/bar').get();
      expect(mockedWriteJSON).toHaveBeenCalledWith(
        join('foo', 'bar', 'config.json'),
        expect.objectContaining({})
      );
    });

    fancyIt()('should write config on replace', async () => {
      const theNewConfig = {...defaultConfiguration};
      new Config('foo/bar').replace(theNewConfig);
      expect(mockedWriteJSON).toHaveBeenCalledWith(
        join('foo', 'bar', 'config.json'),
        theNewConfig
      );
    });

    fancyIt()('should write config on set', async () => {
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
