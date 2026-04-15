import hook from './checkNodeVersion';

describe('hooks:checkNodeVersion', () => {
  const originalNodeVersion = process.version;

  const setProcessNodeVersion = (version: string) => {
    Object.defineProperty(process, 'version', {
      configurable: true,
      enumerable: true,
      value: version,
      writable: false,
    });
  };

  afterEach(() => {
    setProcessNodeVersion(originalNodeVersion);
  });

  it('should fail when the Node version is not supported', async () => {
    const warn = jest.fn();
    setProcessNodeVersion('v18.1.0');

    await hook.call({
      config: {pjson: {engines: {node: '^24.0.0'}}},
      warn,
    });

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain('Coveo CLI might malfunction');
    expect(warn.mock.calls[0][0]).toContain(
      'Please update your NodeJS installation to the latest LTS version.'
    );
  });

  it('should not fail when the Node version is supported', async () => {
    const warn = jest.fn();
    setProcessNodeVersion('v24.14.0');

    await hook.call({
      config: {pjson: {engines: {node: '^24.0.0'}}},
      warn,
    });

    expect(warn).not.toHaveBeenCalled();
  });
});
