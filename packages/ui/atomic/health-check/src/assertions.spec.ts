jest.mock('node:fs');
jest.mock('./schema.js');

import {ensureReadme, ensureRequiredProperties} from './assertions.js';
import {existsSync, readFileSync} from 'node:fs';
import schema from './schema.js';

const mockedExistsSync = jest.mocked(existsSync);
const mockedReadFileSync = jest.mocked(readFileSync);
const mockedSchemaParse = jest.fn();

describe('assertions', () => {
  beforeEach(() => {
    jest.mocked(schema).parse.mockImplementation(mockedSchemaParse);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('#ensureRequiredProperties should parse package.json', () => {
    mockedReadFileSync.mockReturnValue('{}');
    ensureRequiredProperties();
    expect(mockedSchemaParse).toBeCalled();
  });

  it('#ensureReadme should throw if readme file is missing', () => {
    mockedExistsSync.mockReturnValue(false);
    expect(() => ensureReadme()).toThrow();
  });

  it('#ensureReadme should not throw if readme file is not missing', () => {
    mockedExistsSync.mockReturnValue(true);
    expect(() => ensureReadme()).not.toThrow();
  });

  // TODO: CDX-1388
  it.todo('#ensureDocFile should throw when doc file is missing');

  // TODO: CDX-1389
  it.todo(
    '#ensureConsistentTagName should throw when Stencil tag name does not match elementName'
  );

  // TODO: CDX-1390
  it.todo(
    '#ensureConsistentTagName should throw when name does not respect HTML specs'
  );
});
