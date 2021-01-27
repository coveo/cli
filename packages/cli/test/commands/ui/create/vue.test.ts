import {expect, test} from '@oclif/test';

describe('ui:create:vue', () => {
  test
    .stdout()
    .command(['ui:create:vue'])
    .it('runs hello', (ctx) => {
      expect(ctx.stdout).to.contain('hello world');
    });

  test
    .stdout()
    .command(['ui:create:vue', '--name', 'jeff'])
    .it('runs hello --name jeff', (ctx) => {
      expect(ctx.stdout).to.contain('hello jeff');
    });
});
