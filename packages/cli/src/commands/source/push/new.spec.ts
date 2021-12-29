jest.mock('../../../lib/config/config');
jest.mock('../../../hooks/analytics/analytics');
jest.mock('../../../hooks/prerun/prerun');
jest.mock('../../../lib/platform/authenticatedClient');
jest.mock('@coveord/platform-client');

import {mocked} from 'jest-mock';
import {test} from '@oclif/test';
import {AuthenticatedClient} from '../../../lib/platform/authenticatedClient';
import {SourceVisibility} from '@coveord/platform-client';

const mockedAuthenticatedClient = mocked(AuthenticatedClient);

const spyCreate = jest.fn().mockReturnValue({id: 'the_id'});

describe('source:push:new', () => {
  mockedAuthenticatedClient.mockImplementation(
    () =>
      ({
        getClient: () => Promise.resolve({source: {create: spyCreate}}),
      } as unknown as AuthenticatedClient)
  );

  test
    .stdout()
    .stderr()
    .command(['source:push:new', 'my source'])
    .it('uses source visibility SECURED by default', () => {
      expect(spyCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'my source',
          sourceVisibility: SourceVisibility.SECURED,
        })
      );
    });

  test
    .stdout()
    .stderr()
    .command(['source:push:new', '-v', 'SHARED', 'my source'])
    .it('uses source visibility flag when specified', () => {
      expect(spyCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'my source',
          sourceVisibility: SourceVisibility.SHARED,
        })
      );
    });
});
