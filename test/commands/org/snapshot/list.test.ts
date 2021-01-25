import {expect, test} from '@oclif/test';

describe('org:snapshot:list', () => {
  test
    .stdout()
    .command(['org:snapshot:list', 'myorg'])
    .it('runs list', (ctx) => {
      expect(ctx.stdout).to.contain('Spinning'); //  Just to see spinner impacts unit tests. and yes, it does
    });

  // test
  //   .stdout()
  //   .command(['org:snapshot:list', '--name', 'jeff'])
  //   .it('runs hello --name jeff', (ctx) => {
  //     expect(ctx.stdout).to.contain('hello jeff');
  //   });
});
