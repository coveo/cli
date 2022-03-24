jest.mock('../utils/cli.ts');
jest.mock('./snapshot');

import {CliUx} from '@oclif/core';
import {fancyIt} from '../../__test__/it';
import {Configuration} from '../config/config';
import {ProcessAbort} from '../errors/processError';
import {
  SnapshotSynchronizationAmbiguousMatchesError,
  SnapshotSynchronizationUnknownError,
} from '../errors/snapshotErrors';
import {confirmWithAnalytics} from '../utils/cli';
import {Snapshot} from './snapshot';
import {SnapshotFacade} from './snapshotFacade';

const mockedConfirm = jest.mocked(confirmWithAnalytics);
const mockedApplySynchronizationPlan = jest.fn();
const mockedCreateSynchronizationPlan = jest.fn();
const mockedContainsUnambiguousMatches = jest.fn();

const doMockSpinner = () => {
  Object.defineProperty(CliUx.ux, 'action', {
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

    fancyIt()('should throw an error', async () => {
      await expect(facade.tryAutomaticSynchronization()).rejects.toThrow(
        SnapshotSynchronizationAmbiguousMatchesError
      );
    });
  });

  describe('if the user refuses to apply the synchronization', () => {
    beforeAll(() => {
      mockedConfirm.mockImplementationOnce(() => {
        throw new ProcessAbort();
      });
      mockedContainsUnambiguousMatches.mockReturnValue(true);
    });

    fancyIt()('should end the execution', async () => {
      await expect(facade.tryAutomaticSynchronization()).rejects.toThrow(
        ProcessAbort
      );
    });
  });

  describe('if the synchronization reports contains an error', () => {
    beforeAll(() => {
      mockedConfirm.mockResolvedValue(true);
      mockedContainsUnambiguousMatches.mockReturnValue(true);
      mockedApplySynchronizationPlan.mockImplementation(() => ({
        isSuccessReport: () => false,
      }));
    });

    fancyIt()('should throw an error', async () => {
      await expect(facade.tryAutomaticSynchronization()).rejects.toThrow(
        SnapshotSynchronizationUnknownError
      );
    });
  });

  describe('if synchronization plan can automatically be applied', () => {
    beforeAll(() => {
      mockedConfirm.mockResolvedValue(true);
      mockedContainsUnambiguousMatches.mockReturnValue(true);
      mockedApplySynchronizationPlan.mockImplementation(() => ({
        isSuccessReport: () => true,
      }));
    });

    fancyIt()('should create a synchronization plan', async () => {
      await facade.tryAutomaticSynchronization();
      expect(mockedCreateSynchronizationPlan).toBeCalled();
    });

    fancyIt()('should create a apply the synchronization plan', async () => {
      await facade.tryAutomaticSynchronization();
      expect(mockedApplySynchronizationPlan).toBeCalledWith(
        'some-plan-id',
        undefined
      );
    });
  });
});
