jest.mock('fs');
jest.mock('./schema');

import {ensureReadme, ensureRequiredProperties} from './assertions';
import {existsSync, readFileSync} from 'fs';
import schema from './schema';

const mockedExistsSync = jest.mocked(existsSync);
const mockedReadFileSync = jest.mocked(readFileSync);
const mockedSchemaParse = jest.fn();

describe('assertions', () => {
  beforeAll(() => {
    jest.mocked(schema).parse.mockImplementation(mockedSchemaParse);
  });

  afterEach(() => {
    mockedExistsSync.mockReset();
    mockedReadFileSync.mockReset();
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
});
