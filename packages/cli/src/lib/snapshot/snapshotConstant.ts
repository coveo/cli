import {ResourceSnapshotType} from '@coveord/platform-client';

const snapshotLabelDict = {
  [ResourceSnapshotType.extension]: 'Extensions',
  [ResourceSnapshotType.featuredResult]: 'Featured result rules',
  [ResourceSnapshotType.field]: 'Fields',
  [ResourceSnapshotType.filter]: 'Filter rules',
  [ResourceSnapshotType.mapping]: 'Source mappings',
  [ResourceSnapshotType.mlModel]: 'Machine learning models',
  [ResourceSnapshotType.mlModelAssociation]:
    'Machine learning model associations',
  [ResourceSnapshotType.queryParameter]: 'Query parameter rules',
  [ResourceSnapshotType.queryPipeline]: 'Query pipelines',
  [ResourceSnapshotType.queryPipelineCondition]: 'Conditions',
  [ResourceSnapshotType.rankingExpression]: 'Ranking expression rules',
  [ResourceSnapshotType.rankingWeight]: 'Ranking weight rules',
  [ResourceSnapshotType.searchPage]: 'Search pages',
  [ResourceSnapshotType.securityProvider]: 'Security providers',
  [ResourceSnapshotType.source]: 'Sources',
  [ResourceSnapshotType.stopWord]: 'Stop word rules',
  [ResourceSnapshotType.subscription]: 'Notifications',
  [ResourceSnapshotType.thesaurus]: 'Thesaurus rules',
  [ResourceSnapshotType.trigger]: 'Trigger rules',
};

export const disabledResourceType = [
  ResourceSnapshotType.mlModel,
  ResourceSnapshotType.mlModelAssociation,
];
export const allowedResourceType = Object.values(ResourceSnapshotType).filter(
  (resourceType) => disabledResourceType.includes(resourceType)
);

type ExtensibleSnapshotLabelDict = typeof snapshotLabelDict &
  Record<string, string>;

export const labels: ExtensibleSnapshotLabelDict = snapshotLabelDict;
