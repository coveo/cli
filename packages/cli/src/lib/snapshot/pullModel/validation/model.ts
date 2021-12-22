import pullModelSchema from './model.schema.json';
import {ResourceSnapshotType} from '@coveord/platform-client';
import {SnapshotPullModelResources} from '../interfaces';

// TODO: not sure this is necessary
export function getSnapshotModel() {
  // TODO: use a schema version logic
  const resourcePattern =
    pullModelSchema.properties.resourcesToExport.patternProperties['.*'];

  const supportedResources = Object.values(ResourceSnapshotType);
  return {
    ...pullModelSchema,
    ...{
      properties: {
        resourcesToExport: {
          patternProperties: {
            [supportedResources.map((resource) => `^${resource}$`).join('|')]:
              resourcePattern,
          },
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
