import {without} from './list';

describe('listUtils', () => {
  describe('#without', () => {
    const array = ['foo', 'bar', 'baz'];
    it('should exclude one value from array', () => {
      const result = without(array, ['bar']);
      expect(result).toEqual(['foo', 'baz']);
    });

    it('should exclude multiple values from array', () => {
      const valuesToExclude = ['bar', 'baz'];
      const result = without(array, valuesToExclude);
      expect(result).toEqual(['foo']);
    });

    it('should exclude no values from array', () => {
      const result = without(array, []);
      expect(result).toEqual(['foo', 'bar', 'baz']);
    });

    describe('when values to exclude are not part of the array', () => {
      it('should return the initial array', () => {
        const result = without(array, ['dummy']);
        expect(result).toEqual(['foo', 'bar', 'baz']);
      });
    });
  });
});
