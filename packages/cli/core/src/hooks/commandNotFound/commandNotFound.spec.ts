jest.mock('../analytics/analytics');
jest.mock('../../lib/config/config');

import {test} from '@oclif/test';
import analytics from '../analytics/analytics';

describe('hooks:command_not_found', () => {
  const mockedAnalytics = jest.mocked(analytics);

  describe('when the command is valid', () => {
    test
      .stdout()
      .stderr()
      .command(['help'])
      .it('should not trigger the analytics hook', () => {
        expect(mockedAnalytics).not.toHaveBeenCalled();
      });
  });

  describe('when the command is invalid', () => {
    test
      .stdout()
      .stderr()
      .command(['this:is:an:invalid:command💥'])
      .catch(() => {
        expect(mockedAnalytics).toHaveBeenCalledWith(
          expect.objectContaining({
            event: {
              event_type: 'received error',
              event_properties: {
                command: 'this:is:an:invalid:command💥',
                error_type: 'COMMAND NOT FOUND',
              },
            },
          })
        );
      })
      .it('should trigger the analytics hook');
  });
});
