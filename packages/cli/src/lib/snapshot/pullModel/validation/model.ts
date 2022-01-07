import pullModelSchema from './model.schema.json';
import {ResourceSnapshotType} from '@coveord/platform-client';
import {SnapshotPullModelResources} from '../interfaces';

export function getSnapshotModel() {
  const properties: Record<string, {}> = {};
  Object.values(ResourceSnapshotType).forEach((resource) => {
    properties[resource] = {
      // TODO: CDX-741: remove null from supported types
      type: ['array', 'null'],
      items: {
        type: 'string',
      },
    };
  });

  return {
    ...pullModelSchema,
    ...{
      properties: {
        resourcesToExport: {
          properties,
        },
      },
    },
  };
}

export function buildResourcesToExport(resourceTypes: ResourceSnapshotType[]) {
  const resourcesToExport: SnapshotPullModelResources = {};
  for (const resource of resourceTypes) {
    resourcesToExport[resource] = ['*'];
  }
  return resourcesToExport;
}
