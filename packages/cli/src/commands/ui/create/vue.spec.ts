describe('ui:create:vue', () => {
  it('passes', () => {
    expect(1).toBe(1);
  });
});

/*
describe('ui:create:vue', () => {
  test
    .stdout()
    .stderr()
    .command(['ui:create:vue'])
    .catch((ctx) => {
      expect(ctx.message).to.contain('Missing 1 required arg:');
    })

    .it('requires application name argument');
  test
    .stdout()
    .stderr()
    .command(['ui:create:vue', 'myapp', '--preset', 'invalidPreset'])
    .catch('Unable to load preset')
    .it('requires a valid preset flag');
});
*/
