import {
  ResourceSnapshotsSynchronizationOperationsModel,
  ResourceSnapshotsSynchronizationPlanModel,
  ResourceSnapshotsSynchronizationPlanStatus,
} from '@coveord/platform-client';

export const getAmbiguousPlan = (): ResourceSnapshotsSynchronizationPlanModel =>
  getPlan({
    FIELD: [
      {
        resourceName: 'customfield_2aaH4a',
        displayName: 'customfield',
        matches: [],
      },
    ],
    QUERY_PIPELINE: [
      {
        resourceName: 'somepipeline_fdsa2f',
        displayName: 'somepipeline',
        matches: [
          {
            linkModel: {
              organizationId: 'climanualtest77l0aggou',
              resourceName: 'somepipeline_0000',
              resourceType: 'QUERY_PIPELINE',
              resourceId: 'somepipeline',
            },
            associationScore: 0.7,
            displayName: 'somepipeline',
          },
          {
            linkModel: {
              organizationId: 'climanualtest77l0aggou',
              resourceName: 'default_0000',
              resourceType: 'QUERY_PIPELINE',
              resourceId: 'default',
            },
            associationScore: 0.3,
            displayName: 'default',
          },
        ],
      },
    ],
  });

export const getUnambiguousPlan =
  (): ResourceSnapshotsSynchronizationPlanModel =>
    getPlan({
      FIELD: [
        {
          resourceName: 'customfield_2aaH4a',
          displayName: 'customfield',
          matches: [],
        },
      ],
      QUERY_PIPELINE: [
        {
          resourceName: 'somepipeline_fdsa2f',
          displayName: 'somepipeline',
          matches: [],
        },
      ],
    });

const getPlan = (
  resourceSynchronizationOperations: Record<
    string,
    ResourceSnapshotsSynchronizationOperationsModel[]
  >
): ResourceSnapshotsSynchronizationPlanModel => ({
  id: 'someId',
  snapshotId: 'someSnapshotId',
  status: ResourceSnapshotsSynchronizationPlanStatus.Created,
  alreadyLinkedResources: {},
  resourceSynchronizationOperations,
});
