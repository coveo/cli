jest.mock('node:fs');
jest.mock('./schema.js');

import {
  ensureConsistentElementName,
  ensureDocFile,
  ensureReadme,
  ensureRequiredProperties,
} from './assertions.js';
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

  it('#ensureDocFile should throw if doc file is missing', () => {
    mockedExistsSync.mockReturnValue(false);
    expect(() => ensureDocFile()).toThrow();
  });

  it('#ensureDocFile should not throw if doc file is not missing', () => {
    mockedExistsSync.mockReturnValue(true);
    expect(() => ensureDocFile()).not.toThrow();
  });

  it('#ensureConsistentElementName should throw when component tag name does not match elementName property', () => {
    const pkgJson = {elementName: 'foo-cmp'};
    const jsonDocs = {
      components: [{tag: 'bar-cmp'}],
    };
    mockedReadFileSync
      .mockReturnValueOnce(JSON.stringify(pkgJson))
      .mockReturnValueOnce(JSON.stringify(jsonDocs));
    expect(() => ensureConsistentElementName()).toThrow();
  });

  it('#ensureConsistentElementName should not throw when there is a match with at least one web component', () => {
    const pkgJson = {elementName: 'foo-cmp'};
    const jsonDocs = {components: [{tag: 'bar-cmp'}, {tag: 'foo-cmp'}]};
    mockedExistsSync.mockReturnValue(true);
    mockedReadFileSync
      .mockReturnValueOnce(JSON.stringify(pkgJson))
      .mockReturnValueOnce(JSON.stringify(jsonDocs));

    expect(() => ensureConsistentElementName()).not.toThrow();
  });
});
