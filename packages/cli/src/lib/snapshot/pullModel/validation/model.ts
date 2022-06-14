
import {ResourceSnapshotType} from '@coveord/platform-client';
import { readJSONSync } from 'fs-extra';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {SnapshotPullModelResources} from '../interfaces';

const pullModelSchema = readJSONSync(join(dirname(fileURLToPath(import.meta.url)),'./model.schema.json'))

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
