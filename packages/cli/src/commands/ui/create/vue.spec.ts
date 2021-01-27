import {expect, test} from '@oclif/test';

describe('ui:create:vue', () => {
  test
    .stderr()
    .command(['ui:create:vue'])
    .catch((ctx) => {
      expect(ctx.message).to.contain('Missing 1 required arg:');
    })
    .it('requires application name argument');

  test
    .stderr()
    .command(['ui:create:vue', 'myapp', '--preset', 'invalidPreset'])
    .catch((ctx) => {
      expect(ctx.message).to.contain('Unable to load preset');
    })
    .it('requires a valid preset flag');
});
