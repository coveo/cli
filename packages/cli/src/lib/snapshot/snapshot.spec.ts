jest.mock('../platform/authenticatedClient');
jest.mock('fs');

import {createReadStream, ReadStream} from 'fs';
import {join} from 'path';
import {Readable} from 'stream';
import {mocked} from 'ts-jest/utils';
import {AuthenticatedClient} from '../platform/authenticatedClient';
import {SnapshotFactory} from './snapshotFactory';

const mockedCreateReadStream = mocked(createReadStream);
const mockedGetClient = jest.fn();
const mockedAuthenticatedClient = mocked(AuthenticatedClient, true);
const mockedCreateSnapshotFromFile = jest.fn();

const doMockReadStream = () => {
  mockedCreateReadStream.mockImplementation(() => {
    const buffer = Buffer.from('this is a tést');
    const readable = new Readable();
    readable._read = () => {};
    readable.push(buffer);
    readable.push(null);
    return readable as unknown as ReadStream;
  });
};

const doMockAuthenticatedClient = () => {
  mockedGetClient.mockImplementation(() =>
    Promise.resolve({
      resourceSnapshot: {
        createFromFile: mockedCreateSnapshotFromFile,
      },
    })
  );

  mockedAuthenticatedClient.mockImplementation(
    () =>
      ({
        getClient: mockedGetClient,
      } as unknown as AuthenticatedClient)
  );
};

describe('Snapshot', () => {
  beforeAll(() => {
    doMockAuthenticatedClient();
    doMockReadStream();
  });

  describe('when the the resources are compressed', () => {
    const pathToZip = join('dummy', 'path');

    beforeEach(async () => {
      await SnapshotFactory.createFromZip(pathToZip, 'my-target-org');
    });

    it('should create a client connected to the right organization', () => {
      expect(mockedGetClient).toHaveBeenCalledWith({
        organization: 'my-target-org',
      });
    });

    it('#createSnapshotFromZip should retrieve an authenticated client', () => {
      expect(mockedCreateSnapshotFromFile).toHaveBeenCalledTimes(1);
    });

    it('#createSnapshotFromZip should create a snapshot from Zip with appropriate parameters', () => {
      expect(mockedCreateSnapshotFromFile).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'application/zip',
        }),
        {developerNotes: 'cli-created-from-zip'}
      );
    });

    it('#createSnapshotFromZip should create a readstream with the appropriate path to zip', () => {
      expect(mockedCreateReadStream).toHaveBeenCalledWith(
        join('dummy', 'path')
      );
    });
  });

  describe('when the snapshot validation does not pass', () => {
    it.todo('should warn the user');
    it.todo('should set a synchronization plan');
  });

  describe('when the snapshot validation succeed', () => {
    it.todo('#validateSnapshot should return a detailed report');
    it.todo('#previewSnapshot should return a change preview');
  });
});
