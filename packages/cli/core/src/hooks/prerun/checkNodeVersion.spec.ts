import {test} from '@oclif/test';

describe('hooks:checkNodeVersion', () => {
  const originalNodeVersion = process.version;
  const setProcessNodeVersion = (version: string) => {
    Object.defineProperty(process, 'version', {
      value: version,
      writable: false,
      enumerable: true,
      configurable: true,
    });
  };

  afterEach(async () => {
    setProcessNodeVersion(originalNodeVersion);
    // Oclif logger run with a 50ms delay this ensure the logger finish its job between each tests.
    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  test
    .stdout()
    .stderr()
    .do(() => {
      setProcessNodeVersion('v18.1.0');
    })
    .command(['help'])
    .it('should fail when the Node version is not supported', ({stdout}) => {
      expect(stdout).toContain('Coveo CLI might malfunction');
      expect(stdout).toContain(
        'Please update your NodeJS installation to the latest LTS version.'
      );
    });

  test
    .stdout()
    .stderr()
    .do(() => {
      setProcessNodeVersion('v18.12.0');
    })
    .command(['help'])
    .it('should not fail when the Node version is supported', ({stdout}) => {
      expect(stdout).not.toContain('Coveo CLI might malfunction');
      expect(stdout).not.toContain(
        'Please update your NodeJS installation to the latest LTS version.'
      );
    });
});
