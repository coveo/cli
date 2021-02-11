import {expect, test} from '@oclif/test';
jest.mock('../../../hooks/analytics/analytics');
describe('ui:create:vue', () => {
  test
    .command(['ui:create:vue'])
    .catch((ctx) => {
      expect(ctx.message).to.contain('Missing 1 required arg:');
    })
    .it('requires application name argument');

  test
    .command(['ui:create:vue', 'myapp', '--preset', 'invalidPreset'])
    .catch('Unable to load preset')
    .it('requires a valid preset flag');
});
