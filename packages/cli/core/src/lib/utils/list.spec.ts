import {isSubset, without} from './list';

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

  describe('#isSubset', () => {
    it.each([
      {subset: [1, 2, 3], superset: [1, 2, 3]},
      {subset: [1, 3], superset: [1, 2, 3]},
      {subset: [], superset: [1, 2, 3]},
      {subset: ['foo'], superset: ['foo']},
      {subset: ['foo', 'bar'], superset: ['foo', 'baz', 'bar']},
    ])('is should return true', ({subset, superset}) => {
      expect(isSubset<any>(subset, superset));
    });

    it.each([
      {subset: [1, 2, 3, 4], superset: [1, 2, 3]},
      {subset: [5, 3], superset: [1, 2, 3]},
      {subset: [1, 2], superset: []},
      {subset: ['foo', 'bar'], superset: ['foobar', 'baz']},
    ])('is should return false', ({subset, superset}) => {
      expect(isSubset<any>(subset, superset));
    });
  });
});
