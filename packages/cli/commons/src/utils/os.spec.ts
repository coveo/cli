import {appendCmdIfWindows} from './os';

describe('appendCmdIfWindows', () => {
  let originalProcess: PropertyDescriptor | undefined;

  beforeAll(() => {
    originalProcess = Object.getOwnPropertyDescriptor(process, 'platform');
  });

  afterAll(() => {
    Object.defineProperty(process, 'platform', originalProcess!);
  });

  it('should append cmd if process.platform is win32', () => {
    Object.defineProperty(process, 'platform', {
      writable: false,
      value: 'win32',
    });

    return expect(appendCmdIfWindows`foo`).toEqual('foo.ps1');
  });

  it('should append cmd if process.platform is not win32', () => {
    Object.defineProperty(process, 'platform', {
      writable: false,
      value: 'linux',
    });
    return expect(appendCmdIfWindows`foo`).toEqual('foo');
  });
});
