import {camelize} from './transformers.js';

describe('camelize', () => {
  it('should camelize first letter', () => {
    expect(camelize('myTag')).toBe('MyTag');
  });

  it("should camelize each word's first letter", () => {
    expect(camelize('my-super-tag')).toBe('MySuperTag');
  });

  it('should have nothing to camelize', () => {
    expect(camelize('MySuperTag')).toBe('MySuperTag');
  });
});

// TODO: CDX-1406: add unit tests to transformer
