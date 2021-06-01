jest.mock('../platform/authenticatedClient');
jest.mock('fs');

import {createReadStream, ReadStream} from 'fs';
import {join} from 'path';
import {Readable} from 'stream';
import {mocked} from 'ts-jest/utils';
import {AuthenticatedClient} from '../platform/authenticatedClient';
import {SnapshotFactory} from './snapshotFactory';

const mockedCreateReadStream = mocked(createReadStream);
const mockedAuthenticatedClient = mocked(AuthenticatedClient, true);
const mockedCreateSnapshotFromFile = jest.fn();

const doMockReadStream = () => {
  mockedCreateReadStream.mockImplementation(() =>
    jest
      .requireActual<{createReadStream: typeof createReadStream}>('fs')
      .createReadStream(Buffer.from('this is a tést'))
  );
};

const doMockAuthenticatedClient = () => {
  mockedAuthenticatedClient.prototype.getClient.mockImplementation(() =>
    Promise.resolve({
      resourceSnapshot: {createFromFile: mockedCreateSnapshotFromFile},
    })
  );
};

describe('Snapshot', () => {
  beforeAll(() => {
    doMockAuthenticatedClient();
    doMockReadStream();
  });

  describe('when the the resources are compressed', () => {
    const pathToZip = join('dummy', 'path');
    const developerNotes = 'Some random notes';

    beforeEach(async () => {
      await SnapshotFactory.createFromZip(pathToZip, developerNotes);
    });

    it('#createSnapshotFromZip should retrieve an authenticated client', () => {
      expect(mockedCreateSnapshotFromFile).toHaveBeenCalledTimes(1);
    });

    it('#createSnapshotFromZip should create a snapshot from Zip with appropriate parameters', () => {
      expect(mockedCreateSnapshotFromFile).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'application/zip',
        }),
        {developerNotes: 'Some random notes'}
      );
    });

    it('#createSnapshotFromZip should create a readstream with the appropriate path to zip', () => {
      expect(mockedCreateReadStream).toHaveBeenCalledWith(
        join('dummy', 'path')
      );
    });

    it.todo('should push the created snapshot to the destination org');
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
