jest.mock('coveo.analytics');
jest.mock('../../lib/platform/authenticatedClient');
jest.mock('@coveord/platform-client');

import {mocked} from 'ts-jest/utils';
import PlatformClient from '@coveord/platform-client';
import {ApiKeyManager} from './apiKeyManager';
import {AuthenticatedClient} from './authenticatedClient';
const mockedAuthenticatedClient = mocked(AuthenticatedClient);
const mockedPlatformClient = mocked(PlatformClient);

describe('ApiKeyManager', () => {
  const mockCreate = jest.fn();

  const doMockAuthenticatedClient = () => {
    mockedAuthenticatedClient.mockImplementation(
      () =>
        ({
          getClient: () =>
            Promise.resolve(
              mockedPlatformClient.getMockImplementation()!({
                accessToken: 'foo',
                organizationId: 'bar',
              })
            ),
        } as AuthenticatedClient)
    );
  };

  const doMockPlatformClient = () => {
    mockedPlatformClient.mockImplementation(
      () =>
        ({
          apiKey: {
            create: mockCreate as unknown,
          },
        } as PlatformClient)
    );
  };

  beforeEach(() => {
    doMockPlatformClient();
    doMockAuthenticatedClient();
  });

  it('should use the platform client to generate an api key with impersonate privileges', async () => {
    await new ApiKeyManager().createImpersonateApiKey('my-key');

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        displayName: 'my-key',
        description: 'Generated by the Coveo CLI',
        enabled: true,
        privileges: [
          {targetDomain: 'IMPERSONATE', targetId: '*', owner: 'SEARCH_API'},
        ],
      })
    );
  });
});
