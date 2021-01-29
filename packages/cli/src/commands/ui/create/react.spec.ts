import {expect, test} from '@oclif/test';

describe('ui:create:react', () => {
  test
    .command(['ui:create:react'])
    .catch((ctx) => {
      expect(ctx.message).to.contain('Missing 1 required arg:');
    })
    .it('requires application name argument');
});
