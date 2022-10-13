import {getFileNames} from './getFileNames';
import {stderr} from 'stdout-stderr';

describe('getFileNames()', () => {
  beforeEach(() => {
    stderr.start();
  });
  afterEach(() => {
    stderr.stop();
  });

  it('should throw with the command when no entries is provided', () => {
    expect(() => {
      getFileNames({files: []}, 'holdthedoor.bat');
    }).toThrowErrorMatchingSnapshot();
  });

  it('should concat the entries provided', () => {
    expect(
      getFileNames(
        {files: ['foo', 'bar'], folder: ['fizz', 'buzz'], file: ['baz']},
        'holdthedoor.bat'
      )
    ).toEqual(['baz', 'fizz', 'buzz', 'foo', 'bar']);
  });
});
