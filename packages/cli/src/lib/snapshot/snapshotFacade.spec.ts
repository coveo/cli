jest.mock('./snapshot');
jest.mock('cli-ux');

import {cli} from 'cli-ux';
import {Configuration} from '../config/config';
import {
  SnapshotOperationAbort,
  SnapshotSynchronizationAmbiguousMatchesError,
  SnapshotSynchronizationUnknownError,
} from '../errors/snapshotErrors';
import {Snapshot} from './snapshot';
import {SnapshotFacade} from './snapshotFacade';

const mockedConfirm = jest.fn();
const mockedApplySynchronizationPlan = jest.fn();
const mockedCreateSynchronizationPlan = jest.fn();
const mockedContainsUnambiguousMatches = jest.fn();

const doMockConfirm = () => {
  Object.defineProperty(cli, 'confirm', {value: mockedConfirm});
};

const doMockSpinner = () => {
  Object.defineProperty(cli, 'action', {
    value: {start: jest.fn(), stop: jest.fn()},
  });
};

const doMockSynchronizationPlan = () => {
  mockedCreateSynchronizationPlan.mockImplementation(() => ({
    containsUnambiguousMatches: mockedContainsUnambiguousMatches,
    model: {id: 'some-plan-id'},
  }));
};

const getDummySnapshot = () =>
  ({
    createSynchronizationPlan: mockedCreateSynchronizationPlan,
    applySynchronizationPlan: mockedApplySynchronizationPlan,
  } as unknown as Snapshot);

describe('SnapshotFacade', () => {
  const snapshot = getDummySnapshot();
  const facade = new SnapshotFacade(snapshot, {} as Configuration);

  beforeAll(() => {
    doMockConfirm();
    doMockSpinner();
  });

  beforeEach(() => {
    doMockSynchronizationPlan();
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('if the synchronization plan contains ambiguous matches', () => {
    beforeAll(() => {
      mockedContainsUnambiguousMatches.mockReturnValue(false);
    });

    it('should throw an error', async () => {
      await expect(facade.tryAutomaticSynchronization()).rejects.toThrow(
        SnapshotSynchronizationAmbiguousMatchesError
      );
    });
  });

  describe('if the user refuses to apply the synchronization', () => {
    beforeAll(() => {
      mockedConfirm.mockReturnValue(false);
      mockedContainsUnambiguousMatches.mockReturnValue(true);
    });

    it('should end the execution', async () => {
      await expect(facade.tryAutomaticSynchronization()).rejects.toThrow(
        SnapshotOperationAbort
      );
    });
  });

  describe('if the synchronization reports contains an error', () => {
    beforeAll(() => {
      mockedConfirm.mockReturnValue(true);
      mockedContainsUnambiguousMatches.mockReturnValue(true);
      mockedApplySynchronizationPlan.mockImplementation(() => ({
        isSuccessReport: () => false,
      }));
    });

    it('should throw an error', async () => {
      await expect(facade.tryAutomaticSynchronization()).rejects.toThrow(
        SnapshotSynchronizationUnknownError
      );
    });
  });

  describe('if synchronization plan can automatically be applied', () => {
    beforeAll(() => {
      mockedConfirm.mockReturnValue(true);
      mockedContainsUnambiguousMatches.mockReturnValue(true);
      mockedApplySynchronizationPlan.mockImplementation(() => ({
        isSuccessReport: () => true,
      }));
    });

    it('should create a synchronization plan', async () => {
      await facade.tryAutomaticSynchronization();
      expect(mockedCreateSynchronizationPlan).toBeCalled();
    });

    it('should create a apply the synchronization plan', async () => {
      await facade.tryAutomaticSynchronization();
      expect(mockedApplySynchronizationPlan).toBeCalledWith('some-plan-id');
    });
  });
});
