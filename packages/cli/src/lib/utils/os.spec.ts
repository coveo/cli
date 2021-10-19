import {fancyIt} from '../../__test__/it';
import {appendCmdIfWindows} from './os';

describe('appendCmdIfWindows', () => {
  let originalProcess: PropertyDescriptor | undefined;
  afterEach(() => {
    originalProcess = Object.getOwnPropertyDescriptor(process, 'platform');
    jest.resetAllMocks();
  });
  afterAll(() => {
    Object.defineProperty(process, 'platform', originalProcess!);
    jest.clearAllMocks();
  });

  fancyIt()('should append cmd if process.platform is win32', () => {
    Object.defineProperty(process, 'platform', {
      writable: false,
      value: 'win32',
    });

    return expect(appendCmdIfWindows`foo`).toEqual('foo.cmd');
  });

  fancyIt()('should append cmd if process.platform is not win32', () => {
    Object.defineProperty(process, 'platform', {
      writable: false,
      value: 'linux',
    });
    return expect(appendCmdIfWindows`foo`).toEqual('foo');
  });
});
