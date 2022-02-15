jest.mock('@amplitude/node');
jest.mock('@amplitude/identify');
jest.mock('@coveord/platform-client');
jest.mock('../../lib/platform/authenticatedClient');
jest.mock('../../lib/config/config');
jest.mock('../../lib/config/globalConfig');
jest.mock('@oclif/core');
jest.mock('os');

describe('identifier', () => {
  it('bla bla', () => {
    expect(1).toBe(1);
  });
});
