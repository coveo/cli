import {test} from '@oclif/test';
import {mocked} from 'ts-jest/utils';
import {OAuth} from '../../lib/oauth/oauth';
jest.mock('../../lib/oauth/oauth');
const mockedOAuth = mocked(OAuth, true);

describe('auth:login', () => {
  test
    .command(['auth:login', '-e', 'foo'])
    .catch(/Expected --environment=foo/)
    .it('reject invalid environment');

  test
    .command(['auth:login', '-r', 'foo'])
    .catch(/Expected --region=foo/)
    .it('reject invalid region');

  ['dev', 'qa', 'prod', 'hipaa'].forEach((environment) => {
    test
      .stdout()
      .command(['auth:login', '-e', environment])
      .it(
        `passes the -e=${environment} flag to oauth as an environment`,
        () => {
          expect(mockedOAuth.mock.calls[0][0]?.environment).toBe(environment);
        }
      );
  });

  [
    'us-east-1',
    'eu-west-1',
    'eu-west-3',
    'ap-southeast-2',
    'us-west-2',
  ].forEach((region) => {
    test
      .stdout()
      .command(['auth:login', '-r', region])
      .it(`passes the -e=${region} flag to oauth as an region`, () => {
        expect(mockedOAuth.mock.calls[0][0]?.region).toBe(region);
      });
  });

  test
    .stdout()
    .command(['auth:login', '-e', 'qa'])
    .it('passed the -e=dev flag to oauth as an environment', () => {
      expect(mockedOAuth.mock.calls[0][0]?.environment).toBe('qa');
    });

  describe('retrieves token from oauth service', () => {
    beforeEach(() => {
      mockedOAuth.mockImplementationOnce(
        () =>
          ({
            getToken: () => Promise.resolve('this-is-the-token'),
          } as OAuth)
      );
    });

    test
      .stdout()
      .command(['auth:login'])
      .it('retrieves token from oauth service', (ctx) => {
        expect(ctx.stdout).toContain('this-is-the-token');
      });
  });
});
