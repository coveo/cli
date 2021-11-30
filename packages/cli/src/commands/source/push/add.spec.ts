jest.mock('../../../lib/config/config');
jest.mock('../../../hooks/analytics/analytics');
jest.mock('../../../hooks/prerun/prerun');
jest.mock('../../../lib/platform/authenticatedClient');
jest.mock('@coveo/push-api-client');

import {mocked} from 'ts-jest/utils';
import {test} from '@oclif/test';
import {AuthenticatedClient} from '../../../lib/platform/authenticatedClient';
import {DocumentBuilder, Source} from '@coveo/push-api-client';
import {cwd} from 'process';
import {join} from 'path';
import {
  doMockAxiosError,
  doMockAxiosSuccess,
} from '../../../lib/push/testUtils';
const mockedClient = mocked(AuthenticatedClient);
const mockedSource = mocked(Source);
const mockedDocumentBuilder = mocked(DocumentBuilder);

describe('source:push:add', () => {
  const pathToStub = join(cwd(), 'src', '__stub__');
  const mockBatchUpdate = jest
    .fn()
    .mockReturnValue(Promise.resolve(doMockAxiosSuccess(202, '👌')));

  mockedClient.mockImplementation(
    () =>
      ({
        cfg: {
          get: () =>
            Promise.resolve({
              accessToken: 'the_token',
              organization: 'the_org',
            }),
        },
      } as unknown as AuthenticatedClient)
  );

  mockedSource.mockImplementation(
    () =>
      ({
        batchUpdateDocuments: mockBatchUpdate,
      } as unknown as Source)
  );

  mockedDocumentBuilder.mockImplementation(
    () =>
      ({
        marshal: () =>
          JSON.stringify({
            documentId: 'https://perdu.com',
            title: 'hello world',
          }),
        withData: jest.fn(),
        withDate: jest.fn(),
        withFileExtension: jest.fn(),
        withMetadataValue: jest.fn(),
      } as unknown as DocumentBuilder)
  );

  beforeAll(() => {});

  test
    .stdout()
    .stderr()
    .command(['source:push:add', 'mysource'])
    .catch(/You must minimally set the `file` or the `folder` flag/)
    .it('throws when no flags are specified');

  test
    .stdout()
    .stderr()
    .command(['source:push:add', 'mysource', '-f', 'foo', '-d', 'bar'])
    .catch(/--folder= cannot also be provided when using --file=/)
    .it('throws when incompatible flags for file and folder are passed');

  test
    .stdout()
    .stderr()
    .command([
      'source:push:add',
      'mysource',
      '-f',
      join(pathToStub, 'jsondocuments', 'batman.json'),
    ])
    .it('pass correct configuration information to push-api-client', () => {
      expect(mockedSource).toHaveBeenCalledWith('the_token', 'the_org');
    });

  test
    .stdout()
    .stderr()
    .command(['source:push:add', 'mysource', '-f', 'should_explode'])
    .catch(/should_explode is not a valid file, or does not exists/)
    .it('returns an error when trying to load a file that does not exists');

  test
    .stdout()
    .stderr()
    .command([
      'source:push:add',
      'mysource',
      '-f',
      join(pathToStub, 'jsondocuments', 'batman.json'),
    ])
    .it('should output feedback message when parsing documents', (ctx) => {
      expect(ctx.stdout).toContain(
        `Parsed ${join(
          pathToStub,
          'jsondocuments',
          'batman.json'
        )} into 2 documents`
      );
    });

  test
    .stdout()
    .stderr()
    .command([
      'source:push:add',
      'mysource',
      '-f',
      join(pathToStub, 'jsondocuments', 'batman.json'),
    ])
    .it('should output feedback message when uploading documents', (ctx) => {
      expect(ctx.stdout).toContain(
        `Success: 2 documents accepted by the Push API from ${join(
          pathToStub,
          'jsondocuments',
          'batman.json'
        )}`
      );
      expect(ctx.stdout).toContain('Status code: 202 👌');
    });

  test
    .stdout()
    .stderr()
    .command([
      'source:push:add',
      'mysource',
      '-d',
      join(pathToStub, 'mixdocuments'),
    ])
    .it('should only push JSON documents', (ctx) => {
      expect(ctx.stdout).toContain(
        `Success: 2 documents accepted by the Push API from ${join(
          pathToStub,
          'mixdocuments',
          'valid.json'
        )}`
      );
      expect(ctx.stdout).toContain('Status code: 202 👌');
    });

  test
    .stdout()
    .stderr()
    .command([
      'source:push:add',
      'mysource',
      '-d',
      join(pathToStub, 'mixdocuments'),
    ])
    .it('should not include non JSON documents in success message', (ctx) => {
      const invalidFiles = ['.somedotfile', 'json.txt', 'noextension'];
      invalidFiles.map((file) => {
        expect(ctx.stdout).not.toContain(file);
      });
    });

  test
    .stdout()
    .stderr()
    .command([
      'source:push:add',
      'mysource',
      '-f',
      join(pathToStub, 'jsondocuments', 'noID.json'),
    ])
    .catch(
      `${join(
        pathToStub,
        'jsondocuments',
        'noID.json'
      )} is not a valid JSON document: Document contains an invalid value for documentid: value is required.`
    )
    .it('should output error message on missing documentID');

  test
    .stdout()
    .stderr()
    .command([
      'source:push:add',
      'mysource',
      '-f',
      join(pathToStub, 'jsondocuments', 'noTitle.json'),
    ])
    .catch(
      `${join(
        pathToStub,
        'jsondocuments',
        'noTitle.json'
      )} is not a valid JSON document: Document contains an invalid value for title: value is required.`
    )
    .it('should output error message on missing title');

  test
    .stdout()
    .stderr()
    .command([
      'source:push:add',
      'mysource',
      '-f',
      join(pathToStub, 'jsondocuments', 'notAnUrl.json'),
    ])
    .it('should accept non-url documentIDs', (ctx) => {
      expect(ctx.stdout).toContain(
        `Success: 1 document accepted by the Push API from ${join(
          pathToStub,
          'jsondocuments',
          'notAnUrl.json'
        )}`
      );
      expect(ctx.stdout).toContain('Status code: 202 👌');
    });

  test
    .do(() => {
      mockBatchUpdate.mockRejectedValueOnce(
        doMockAxiosError(
          412,
          'this is a bad request and you should feel bad',
          'BAD_REQUEST'
        )
      );
    })
    .stdout()
    .stderr()
    .command([
      'source:push:add',
      'mysource',
      '-f',
      join(pathToStub, 'jsondocuments', 'batman.json'),
    ])
    .it('returns an information message on add failure from the API', (ctx) => {
      expect(ctx.stdout).toContain(
        'this is a bad request and you should feel bad'
      );
      expect(ctx.stdout).toContain('Status code: 412');
      expect(ctx.stdout).toContain('Error code: BAD_REQUEST');
    });

  test
    .stdout()
    .stderr()
    .command([
      'source:push:add',
      'mysource',
      '-f',
      join(pathToStub, 'jsondocuments', 'noIdentity.json'),
    ])
    .catch(
      `${join(
        pathToStub,
        'jsondocuments',
        'noIdentity.json'
      )} is not a valid JSON document: Document contains an invalid value for allowedpermissions:  value does not contain identity`
    )
    .it('should output error message on missing identity');

  test
    .stdout()
    .stderr()
    .command([
      'source:push:add',
      'mysource',
      '-f',
      join(pathToStub, 'jsondocuments', 'identityNotAString.json'),
    ])
    .catch(
      `${join(
        pathToStub,
        'jsondocuments',
        'identityNotAString.json'
      )} is not a valid JSON document: Document contains an invalid value for allowedpermissions:   value is not a string.`
    )
    .it('should output error message on identity with an invalid string');

  test
    .stdout()
    .stderr()
    .command([
      'source:push:add',
      'mysource',
      '-f',
      join(
        pathToStub,
        'jsondocuments',
        'identityAllowAnonymousNotABoolean.json'
      ),
    ])
    .catch(
      `${join(
        pathToStub,
        'jsondocuments',
        'identityAllowAnonymousNotABoolean.json'
      )} is not a valid JSON document: Document contains an invalid value for allowanonymous: value is not a boolean.`
    )
    .it(
      'should output error message on allow anonymous with an invalid boolean'
    );

  test
    .stdout()
    .stderr()
    .command([
      'source:push:add',
      'mysource',
      '-f',
      join(pathToStub, 'jsondocuments', 'identityTypeInvalidValue.json'),
    ])
    .catch(
      `${join(
        pathToStub,
        'jsondocuments',
        'identityTypeInvalidValue.json'
      )} is not a valid JSON document: Document contains an invalid value for allowedpermissions:   value should be one of: UNKNOWN, USER, GROUP, VIRTUAL_GROUP.`
    )
    .it('should output error message on identityType with an invalid value');
});
