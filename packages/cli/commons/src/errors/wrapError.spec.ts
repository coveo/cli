import {fancyIt} from '@coveo/cli-commons-dev/testUtils/it';

describe('wrapError', () => {
  // TODO: shoud return a APIError (from both axios reponses types)
  // TODO: when string => shoud return a CliBaseError
  // TODO: when CliBaseError=> shoud return a new instance of CliBaseError!!!
  // TODO: when generic Error => shoud return a CliBaseError
  // TODO: when anything else (object, ...) => should return an unknownError
  fancyIt()('TODO:', () => {
    expect(1).toBe(2);
  });
});
