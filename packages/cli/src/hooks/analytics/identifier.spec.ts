jest.mock('@amplitude/node');
jest.mock('@amplitude/identify');
jest.mock('@coveord/platform-client');
jest.mock('../../lib/platform/authenticatedClient');
jest.mock('../../lib/config/config');
jest.mock('../../lib/config/globalConfig');
jest.mock('@oclif/core');
jest.mock('os');

import {release} from 'os';
import {Identify} from '@amplitude/identify';
import {AuthenticatedClient} from '../../lib/platform/authenticatedClient';
import PlatformClient from '@coveord/platform-client';
import globalConfig from '../../lib/config/globalConfig';

describe('identifier', () => {
  jest.mocked(globalConfig);
  jest.mocked(Identify, true);
  jest.mocked(AuthenticatedClient);
  jest.mocked(PlatformClient);
  jest.mocked(release);

  it('bla bla', () => {
    expect(1).toBe(1);
  });
});
