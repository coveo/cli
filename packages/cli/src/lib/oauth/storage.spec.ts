import {getPassword, setPassword} from 'keytar';
import {mocked} from 'ts-jest/utils';
import {Storage} from './storage';
jest.mock('keytar', () => ({
  getPassword: jest
    .fn()
    .mockImplementation(() => Promise.resolve('the-password')),
  setPassword: jest.fn().mockImplementation(),
}));
jest.mock('os', () => ({
  userInfo: jest.fn().mockImplementation(() => ({username: 'bob'})),
}));
const mockedGetPassword = mocked(getPassword);
const mockedSetPassword = mocked(setPassword);

describe('oauth storage', () => {
  it('should use userInfo when retrieving from storage', async () => {
    await new Storage().get();
    expect(mockedGetPassword).toHaveBeenCalledWith(
      expect.stringContaining('com.coveo.cli'),
      'bob'
    );
  });

  it('should use userInfo when saving to storage', async () => {
    await new Storage().save('foo');
    expect(mockedSetPassword).toHaveBeenCalledWith(
      expect.stringContaining('com.coveo.cli'),
      'bob',
      'foo'
    );
  });

  it('should return value retrieved from storage as the token', async () => {
    const {accessToken} = await new Storage().get();
    expect(accessToken).toMatch('the-password');
  });
});
